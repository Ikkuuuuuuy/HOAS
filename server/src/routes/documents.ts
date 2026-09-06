import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { generateQRToken, generateCertificateHTML } from '../services/documentService';
import { sendDocumentStatusEmail } from '../services/mailService';

const router = Router();

// GET /api/documents - list requests (role-filtered)
router.get('/', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  let rows: any[];

  try {
    if (user!.roleName === 'super_admin' || user!.roleName === 'hoa_admin') {
      rows = db.prepare(`
        SELECT d.*, u.full_name as requester_name, t.name as tenant_name
        FROM document_requests d
        LEFT JOIN users u ON d.requester_id = u.id
        LEFT JOIN tenants t ON d.tenant_id = t.id
        ORDER BY d.created_at DESC
      `).all();
    } else if (user!.roleName === 'barangay_official') {
      rows = db.prepare(`
        SELECT d.*, u.full_name as requester_name
        FROM document_requests d
        LEFT JOIN users u ON d.requester_id = u.id
        WHERE d.tenant_id = ?
        ORDER BY d.created_at DESC
      `).all(user!.tenantId);
    } else {
      rows = db.prepare(`
        SELECT d.*, u.full_name as requester_name
        FROM document_requests d
        LEFT JOIN users u ON d.requester_id = u.id
        WHERE d.requester_id = ?
        ORDER BY d.created_at DESC
      `).all(user!.userId);
    }

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents - create request
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    docType: z.string().min(1),
    purpose: z.string().optional(),
    registeredOwnerName: z.string().optional(),
    requesterName: z.string().optional(),
    address: z.string().optional(),
    details: z.any().optional(),
    fee: z.number().optional(),
  });

  try {
    const { docType, purpose, registeredOwnerName, requesterName, address, details, fee } = schema.parse(req.body);
    const id = uuidv4();
    const docFee = fee !== undefined ? fee : (docType === 'barangay_clearance' ? 50 : (docType === 'cert_residency' ? 30 : 0));
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || purpose || '');
    
    db.prepare(`
      INSERT INTO document_requests (id, tenant_id, requester_id, doc_type, status, purpose, fee, registered_owner_name, property_address, details)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `).run(id, req.user!.tenantId, req.user!.userId, docType, purpose || detailsStr, docFee, registeredOwnerName || null, address || null, detailsStr);

    const created = db.prepare(`SELECT * FROM document_requests WHERE id = ?`).get(id);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /api/documents/:id/status - advance status
router.patch('/:id/status', authenticate, requireRoles('barangay_official', 'super_admin', 'hoa_admin', 'resident'), async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ status: z.enum(['approved', 'paid', 'issued', 'rejected']) });
  try {
    const { status } = schema.parse(req.body);
    const doc = db.prepare(`SELECT * FROM document_requests WHERE id = ?`).get(req.params.id) as any;
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    let qrToken = doc.qr_token;
    let issuedAt = doc.issued_at;

    if (status === 'issued' && !qrToken) {
      qrToken = generateQRToken(doc.id, doc.requester_id);
      issuedAt = new Date().toISOString();
      db.prepare(`UPDATE document_requests SET status = ?, qr_token = ?, issued_at = ? WHERE id = ?`)
        .run(status, qrToken, issuedAt, req.params.id);
    } else {
      db.prepare(`UPDATE document_requests SET status = ? WHERE id = ?`).run(status, req.params.id);
    }

    const updatedDoc: any = db.prepare(`SELECT d.*, u.email, u.full_name FROM document_requests d JOIN users u ON d.requester_id = u.id WHERE d.id = ?`).get(req.params.id);
    if (updatedDoc && updatedDoc.email) {
      try {
        await sendDocumentStatusEmail(updatedDoc.email, updatedDoc.full_name, updatedDoc.doc_type, status);
      } catch (e) {
        console.error('Doc email error:', e);
      }
    }

    res.json({ id: req.params.id, status, qrToken });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;

