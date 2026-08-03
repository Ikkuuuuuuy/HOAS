import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

// GET /api/facilities
router.get('/', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  const rows = user!.roleName === 'super_admin'
    ? db.prepare(`SELECT f.*, t.name as tenant_name FROM facilities f JOIN tenants t ON f.tenant_id = t.id WHERE f.is_active = 1`).all()
    : db.prepare(`SELECT * FROM facilities WHERE tenant_id = ? AND is_active = 1`).all(user!.tenantId);
  res.json(rows);
});

// GET /api/facilities/reservations
router.get('/reservations', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  let rows: any[];

  if (user!.roleName === 'super_admin') {
    rows = db.prepare(`
      SELECT r.*, f.name as facility_name, u.full_name as reserved_by_name
      FROM reservations r JOIN facilities f ON r.facility_id = f.id
      JOIN users u ON r.reserved_by = u.id
      ORDER BY r.start_time ASC
    `).all();
  } else if (user!.roleName === 'resident') {
    rows = db.prepare(`
      SELECT r.*, f.name as facility_name
      FROM reservations r JOIN facilities f ON r.facility_id = f.id
      WHERE r.reserved_by = ?
      ORDER BY r.start_time ASC
    `).all(user!.userId);
  } else {
    rows = db.prepare(`
      SELECT r.*, f.name as facility_name, u.full_name as reserved_by_name
      FROM reservations r JOIN facilities f ON r.facility_id = f.id
      JOIN users u ON r.reserved_by = u.id
      WHERE r.tenant_id = ?
      ORDER BY r.start_time ASC
    `).all(user!.tenantId);
  }
  res.json(rows);
});

// POST /api/facilities/reservations — create with collision detection
router.post('/reservations', authenticate, requireRoles('resident', 'barangay_official', 'hoa_admin', 'super_admin'), (req: Request, res: Response): void => {
  const schema = z.object({
    facilityId: z.string(),
    title: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    notes: z.string().optional(),
  });

  try {
    const { facilityId, title, startTime, endTime, notes } = schema.parse(req.body);

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      res.status(400).json({ error: 'End time must be after start time' }); return;
    }

    // Verify facility exists and user can access it
    const facility = db.prepare(`SELECT * FROM facilities WHERE id = ?`).get(facilityId) as any;
    if (!facility) { res.status(404).json({ error: 'Facility not found' }); return; }

    // Tenant check (residents can only book within their tenant, super_admin can cross-tenant)
    if (req.user!.roleName !== 'super_admin' && facility.tenant_id !== req.user!.tenantId) {
      res.status(403).json({ error: 'Cross-tenant facility booking not allowed' }); return;
    }

    // COLLISION DETECTION
    const collision = db.prepare(`
      SELECT id, title, start_time, end_time FROM reservations
      WHERE facility_id = ?
        AND status NOT IN ('cancelled', 'rejected')
        AND NOT (end_time <= ? OR start_time >= ?)
    `).get(facilityId, startTime, endTime) as any;

    if (collision) {
      res.status(409).json({
        error: 'Time slot conflict detected',
        conflictWith: {
          id: collision.id,
          title: collision.title,
          startTime: collision.start_time,
          endTime: collision.end_time,
        },
      });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO reservations (id, facility_id, tenant_id, reserved_by, title, start_time, end_time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, facilityId, req.user!.tenantId, req.user!.userId, title, startTime, endTime, notes || null);

    const created = db.prepare(`
      SELECT r.*, f.name as facility_name FROM reservations r
      JOIN facilities f ON r.facility_id = f.id WHERE r.id = ?
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

// PATCH /api/facilities/reservations/:id/status
router.patch('/reservations/:id/status', authenticate, requireRoles('hoa_admin', 'barangay_official', 'super_admin', 'resident'), (req: Request, res: Response): void => {
  const schema = z.object({ status: z.enum(['approved', 'rejected', 'cancelled']) });
  try {
    const { status } = schema.parse(req.body);
    const reservation = db.prepare(`SELECT * FROM reservations WHERE id = ?`).get(req.params.id) as any;
    if (!reservation) { res.status(404).json({ error: 'Reservation not found' }); return; }

    // Residents can only cancel their own
    if (req.user!.roleName === 'resident') {
      if (reservation.reserved_by !== req.user!.userId || status !== 'cancelled') {
        res.status(403).json({ error: 'Residents can only cancel their own reservations' }); return;
      }
    }

    db.prepare(`UPDATE reservations SET status = ? WHERE id = ?`).run(status, req.params.id);
    res.json({ id: req.params.id, status });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
