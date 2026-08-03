import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

// GET /api/billing — ledger list (tenant/resident scoped)
router.get('/', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  let rows: any[];

  if (user!.roleName === 'super_admin') {
    rows = db.prepare(`
      SELECT bl.*, u.full_name as resident_name, t.name as tenant_name
      FROM billing_ledgers bl
      JOIN users u ON bl.resident_id = u.id
      JOIN tenants t ON bl.tenant_id = t.id
      ORDER BY bl.due_date DESC
    `).all();
  } else if (user!.roleName === 'hoa_admin') {
    rows = db.prepare(`
      SELECT bl.*, u.full_name as resident_name
      FROM billing_ledgers bl
      JOIN users u ON bl.resident_id = u.id
      WHERE bl.tenant_id = ?
      ORDER BY bl.due_date DESC
    `).all(user!.tenantId);
  } else if (user!.roleName === 'resident') {
    rows = db.prepare(`
      SELECT bl.*
      FROM billing_ledgers bl
      WHERE bl.resident_id = ?
      ORDER BY bl.due_date DESC
    `).all(user!.userId);
  } else {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  res.json(rows);
});

// GET /api/billing/summary — financial summary for HOA admin
router.get('/summary', authenticate, requireRoles('hoa_admin', 'super_admin'), (req: Request, res: Response): void => {
  const tenantId = req.user!.roleName === 'super_admin' ? undefined : req.user!.tenantId;
  const filter = tenantId ? 'WHERE bl.tenant_id = ?' : '';
  const params = tenantId ? [tenantId] : [];

  const summary = db.prepare(`
    SELECT
      COUNT(*) as total_records,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
      SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
      COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_count,
      COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
    FROM billing_ledgers bl ${filter}
  `).get(...params) as any;

  const monthlyRevenue = db.prepare(`
    SELECT billing_period, SUM(amount) as amount, status
    FROM billing_ledgers bl
    ${filter ? 'WHERE bl.tenant_id = ?' : ''}
    WHERE status = 'paid'
    GROUP BY billing_period
    ORDER BY billing_period DESC
    LIMIT 12
  `).all(...params);

  res.json({ summary, monthlyRevenue });
});

// POST /api/billing/generate-dues — auto-generate monthly dues
router.post('/generate-dues', authenticate, requireRoles('hoa_admin', 'super_admin'), (req: Request, res: Response): void => {
  const schema = z.object({
    billingPeriod: z.string().regex(/^\d{4}-\d{2}$/),
    amount: z.number().positive(),
    description: z.string().default('Monthly HOA Dues'),
    dueDay: z.number().min(1).max(28).default(10),
  });

  try {
    const { billingPeriod, amount, description, dueDay } = schema.parse(req.body);
    const tenantId = req.user!.tenantId;

    // Get all active residents in tenant
    const residents = db.prepare(`
      SELECT u.id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.tenant_id = ? AND r.name = 'resident' AND u.is_active = 1
    `).all(tenantId) as { id: string }[];

    const dueDate = `${billingPeriod}-${String(dueDay).padStart(2, '0')}`;
    const insertLedger = db.prepare(`
      INSERT OR IGNORE INTO billing_ledgers (id, tenant_id, resident_id, billing_period, description, amount, status, due_date)
      VALUES (?, ?, ?, ?, ?, ?, 'unpaid', ?)
    `);

    let created = 0;
    for (const r of residents) {
      const id = uuidv4();
      const result = insertLedger.run(id, tenantId, r.id, billingPeriod, description, amount, dueDate);
      if (result.changes > 0) created++;
    }

    res.json({ created, billingPeriod, amount, residents: residents.length });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payments — submit payment
router.post('/payments', authenticate, requireRoles('resident', 'hoa_admin', 'super_admin'), (req: Request, res: Response): void => {
  const schema = z.object({
    ledgerId: z.string(),
    paymentMethod: z.enum(['gcash', 'paymaya', 'card', 'cash']),
    amount: z.number().positive(),
  });

  try {
    const { ledgerId, paymentMethod, amount } = schema.parse(req.body);
    const ledger = db.prepare(`SELECT * FROM billing_ledgers WHERE id = ?`).get(ledgerId) as any;
    if (!ledger) { res.status(404).json({ error: 'Ledger not found' }); return; }

    // Tenant isolation
    if (req.user!.roleName === 'resident' && ledger.resident_id !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    const paymentId = uuidv4();
    const refNo = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO payments (id, ledger_id, tenant_id, amount, payment_method, reference_no, status, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, 'success', CURRENT_TIMESTAMP)
    `).run(paymentId, ledgerId, ledger.tenant_id, amount, paymentMethod, refNo);

    // Update ledger status
    db.prepare(`UPDATE billing_ledgers SET status = 'paid' WHERE id = ?`).run(ledgerId);

    res.status(201).json({
      paymentId,
      referenceNo: refNo,
      status: 'success',
      message: `Payment of ₱${amount} via ${paymentMethod} processed successfully.`,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/billing/payments — payment history
router.get('/payments', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  let rows: any[];

  if (user!.roleName === 'resident') {
    rows = db.prepare(`
      SELECT p.*, bl.billing_period, bl.description
      FROM payments p JOIN billing_ledgers bl ON p.ledger_id = bl.id
      WHERE bl.resident_id = ?
      ORDER BY p.created_at DESC
    `).all(user!.userId);
  } else {
    rows = db.prepare(`
      SELECT p.*, bl.billing_period, bl.description, u.full_name as resident_name
      FROM payments p
      JOIN billing_ledgers bl ON p.ledger_id = bl.id
      JOIN users u ON bl.resident_id = u.id
      WHERE p.tenant_id = ?
      ORDER BY p.created_at DESC
    `).all(user!.tenantId);
  }
  res.json(rows);
});

export default router;
