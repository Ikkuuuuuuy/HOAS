import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { generateQRToken, generateCertificateHTML } from '../services/documentService';

const router = Router();

// GET /api/documents — list requests (role-filtered)
router.get('/', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  let rows: any[];

  if (user!.roleName === 'super_admin') {
    rows = db.prepare(`
      SELECT d.*, u.full_name as requester_name, t.name as tenant_name
      FROM document_requests d
      JOIN users u ON d.requester_id = u.id
      JOIN tenants t ON d.tenant_id = t.id
      ORDER BY d.created_at DESC
    `).all();
  } else if (user!.roleName === 'barangay_official') {
    rows = db.prepare(`
      SELECT d.*, u.full_name as requester_name
      FROM document_requests d
      JOIN users u ON d.requester_id = u.id
      WHERE d.tenant_id = ?
      ORDER BY d.created_at DESC
    `).all(user!.tenantId);
  } else if (user!.roleName === 'resident') {
    rows = db.prepare(`
      SELECT d.*, u.full_name as requester_name
      FROM document_requests d
      JOIN users u ON d.requester_id = u.id
      WHERE d.requester_id = ?
      ORDER BY d.created_at DESC
    `).all(user!.userId);
  } else {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  res.json(rows);
});

// POST /api/documents — create request (resident)
router.post('/', authenticate, requireRoles('resident', 'super_admin'), (req: Request, res: Response): void => {
  const schema = z.object({
    docType: z.enum(['barangay_clearance', 'cert_indigency', 'cert_residency']),
    purpose: z.string().min(3),
  });

  try {
    const { docType, purpose } = schema.parse(req.body);
    const feeMap: Record<string, number> = {
      barangay_clearance: 50,
      cert_indigency: 0,
      cert_residency: 30,
    };
    const id = uuidv4();
    db.prepare(`
      INSERT INTO document_requests (id, tenant_id, requester_id, doc_type, status, purpose, fee)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(id, req.user!.tenantId, req.user!.userId, docType, purpose, feeMap[docType]);

    const created = db.prepare(`SELECT * FROM document_requests WHERE id = ?`).get(id);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/documents/:id/status — advance status
router.patch('/:id/status', authenticate, requireRoles('barangay_official', 'super_admin', 'resident'), (req: Request, res: Response): void => {
  const schema = z.object({ status: z.enum(['approved', 'paid', 'issued', 'rejected']) });
  try {
    const { status } = schema.parse(req.body);
    const doc = db.prepare(`SELECT * FROM document_requests WHERE id = ?`).get(req.params.id) as any;
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    // Tenant isolation
    if (req.user!.roleName !== 'super_admin' && doc.tenant_id !== req.user!.tenantId) {
      res.status(403).json({ error: 'Cross-tenant access denied' });
      return;
    }

    // Resident can only mark as 'paid'
    if (req.user!.roleName === 'resident' && status !== 'paid') {
      res.status(403).json({ error: 'Residents can only update status to paid' });
      return;
    }

    let qrToken = doc.qr_token;
    let issuedAt = doc.issued_at;

    if (status === 'issued') {
      qrToken = generateQRToken(doc.id, doc.requester_id);
      issuedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE document_requests SET status = ?, qr_token = ?, issued_at = ? WHERE id = ?
    `).run(status, qrToken, issuedAt, req.params.id);

    res.json({ id: req.params.id, status, qrToken, issuedAt });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/documents/:id/qr — QR verification
router.get('/:id/qr', (req: Request, res: Response): void => {
  const doc = db.prepare(`
    SELECT d.*, u.full_name as requester_name, u.email as requester_email
    FROM document_requests d
    JOIN users u ON d.requester_id = u.id
    WHERE d.id = ?
  `).get(req.params.id) as any;

  if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }
  if (doc.status !== 'issued') { res.status(400).json({ error: 'Document not yet issued', status: doc.status }); return; }

  res.json({
    valid: true,
    documentId: doc.id,
    docType: doc.doc_type,
    requesterName: doc.requester_name,
    purpose: doc.purpose,
    issuedAt: doc.issued_at,
    qrToken: doc.qr_token,
  });
});

// GET /api/documents/:id/certificate — HTML certificate
router.get('/:id/certificate', authenticate, (req: Request, res: Response): void => {
  const doc = db.prepare(`
    SELECT d.*, u.full_name as requester_name, u.email as requester_email,
           rp.address, rp.birthdate, rp.civil_status
    FROM document_requests d
    JOIN users u ON d.requester_id = u.id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id
    WHERE d.id = ?
  `).get(req.params.id) as any;

  if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }
  if (doc.status !== 'issued') { res.status(400).json({ error: 'Certificate not yet issued' }); return; }

  // Tenant isolation
  if (req.user!.roleName !== 'super_admin' &&
      req.user!.roleName !== 'barangay_official' &&
      doc.requester_id !== req.user!.userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const html = generateCertificateHTML(doc);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
