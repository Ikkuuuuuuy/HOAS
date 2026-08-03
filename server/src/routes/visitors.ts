import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

function generateGatePassQR(visitorId: string): string {
  const hmac = crypto.createHmac('sha256', process.env.QR_HMAC_SECRET || 'secret')
    .update(`${visitorId}:${Date.now()}`).digest('hex');
  return `GP-${visitorId.slice(0, 6).toUpperCase()}-${hmac.slice(0, 12).toUpperCase()}`;
}

// GET /api/visitors
router.get('/', authenticate, requireRoles('security_guard', 'hoa_admin', 'barangay_official', 'super_admin'), (req: Request, res: Response): void => {
  const { user } = req;
  const rows = user!.roleName === 'super_admin'
    ? db.prepare(`
        SELECT vl.*, u.full_name as host_name, g.full_name as guard_name, t.name as tenant_name
        FROM visitor_logs vl
        JOIN users u ON vl.host_id = u.id
        JOIN users g ON vl.logged_by = g.id
        JOIN tenants t ON vl.tenant_id = t.id
        ORDER BY vl.time_in DESC
      `).all()
    : db.prepare(`
        SELECT vl.*, u.full_name as host_name, g.full_name as guard_name
        FROM visitor_logs vl
        JOIN users u ON vl.host_id = u.id
        JOIN users g ON vl.logged_by = g.id
        WHERE vl.tenant_id = ?
        ORDER BY vl.time_in DESC
      `).all(user!.tenantId);
  res.json(rows);
});

// POST /api/visitors — log new visitor
router.post('/', authenticate, requireRoles('security_guard', 'super_admin'), (req: Request, res: Response): void => {
  const schema = z.object({
    hostId: z.string(),
    visitorName: z.string().min(2),
    visitorIdType: z.string().default('national_id'),
    visitorIdNo: z.string().optional(),
    vehiclePlate: z.string().optional(),
    purpose: z.string().min(2),
  });

  try {
    const data = schema.parse(req.body);
    // Verify host exists in same tenant
    const host = db.prepare(`SELECT id FROM users WHERE id = ? AND tenant_id = ?`).get(data.hostId, req.user!.tenantId);
    if (!host) { res.status(404).json({ error: 'Host resident not found in this tenant' }); return; }

    const id = uuidv4();
    const gatePassQR = generateGatePassQR(id);

    db.prepare(`
      INSERT INTO visitor_logs (id, tenant_id, host_id, visitor_name, visitor_id_type, visitor_id_no, vehicle_plate, purpose, gate_pass_qr, logged_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.tenantId, data.hostId, data.visitorName, data.visitorIdType,
           data.visitorIdNo || null, data.vehiclePlate || null, data.purpose, gatePassQR, req.user!.userId);

    const created = db.prepare(`
      SELECT vl.*, u.full_name as host_name FROM visitor_logs vl
      JOIN users u ON vl.host_id = u.id WHERE vl.id = ?
    `).get(id);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/visitors/:id/checkout
router.patch('/:id/checkout', authenticate, requireRoles('security_guard', 'super_admin'), (req: Request, res: Response): void => {
  const log = db.prepare(`SELECT * FROM visitor_logs WHERE id = ?`).get(req.params.id) as any;
  if (!log) { res.status(404).json({ error: 'Visitor log not found' }); return; }
  if (log.tenant_id !== req.user!.tenantId && req.user!.roleName !== 'super_admin') {
    res.status(403).json({ error: 'Access denied' }); return;
  }
  if (log.time_out) { res.status(400).json({ error: 'Visitor already checked out' }); return; }

  db.prepare(`UPDATE visitor_logs SET time_out = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
  res.json({ id: req.params.id, timeOut: new Date().toISOString(), message: 'Visitor checked out successfully' });
});

// GET /api/visitors/stats — today's stats for security dashboard
router.get('/stats', authenticate, requireRoles('security_guard', 'hoa_admin', 'super_admin'), (req: Request, res: Response): void => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_today,
      COUNT(CASE WHEN time_out IS NULL THEN 1 END) as currently_inside,
      COUNT(CASE WHEN time_out IS NOT NULL THEN 1 END) as checked_out,
      COUNT(CASE WHEN vehicle_plate IS NOT NULL THEN 1 END) as with_vehicle
    FROM visitor_logs
    WHERE tenant_id = ? AND time_in >= ?
  `).get(req.user!.tenantId, todayStart.toISOString()) as any;

  res.json(stats);
});

export default router;
