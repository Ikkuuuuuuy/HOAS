import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { AlertService } from '../services/alertService';

const router = Router();

// GET /api/alerts/stream — SSE endpoint
router.get('/stream', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Emergency alert stream connected' })}\n\n`);

  // Register this client
  const clientId = uuidv4();
  AlertService.addClient(clientId, res);

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    AlertService.removeClient(clientId);
  });
});

// POST /api/alerts — trigger emergency alert
router.post('/', authenticate, (req: Request, res: Response): void => {
  const schema = z.object({
    alertType: z.enum(['panic', 'fire', 'medical', 'security']),
    message: z.string().min(3),
    location: z.string().optional(),
    broadcastTo: z.enum(['hoa', 'barangay', 'all']).default('all'),
  });

  try {
    const { alertType, message, location, broadcastTo } = schema.parse(req.body);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO emergency_alerts (id, tenant_id, triggered_by, alert_type, message, location, status, broadcast_to)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(id, req.user!.tenantId, req.user!.userId, alertType, message, location || null, broadcastTo);

    const alert = db.prepare(`
      SELECT ea.*, u.full_name as triggered_by_name, t.name as tenant_name
      FROM emergency_alerts ea
      JOIN users u ON ea.triggered_by = u.id
      JOIN tenants t ON ea.tenant_id = t.id
      WHERE ea.id = ?
    `).get(id) as any;

    // Broadcast via SSE to all connected clients
    AlertService.broadcast({
      type: 'emergency_alert',
      alert: {
        id: alert.id,
        alertType: alert.alert_type,
        message: alert.message,
        location: alert.location,
        triggeredBy: alert.triggered_by_name,
        tenantName: alert.tenant_name,
        broadcastTo: alert.broadcast_to,
        createdAt: alert.created_at,
      },
    });

    res.status(201).json(alert);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/alerts — alert history
router.get('/', authenticate, (req: Request, res: Response): void => {
  const { user } = req;
  const rows = user!.roleName === 'super_admin'
    ? db.prepare(`
        SELECT ea.*, u.full_name as triggered_by_name, t.name as tenant_name
        FROM emergency_alerts ea
        JOIN users u ON ea.triggered_by = u.id
        JOIN tenants t ON ea.tenant_id = t.id
        ORDER BY ea.created_at DESC LIMIT 50
      `).all()
    : db.prepare(`
        SELECT ea.*, u.full_name as triggered_by_name
        FROM emergency_alerts ea
        JOIN users u ON ea.triggered_by = u.id
        WHERE ea.broadcast_to = 'all' OR ea.tenant_id = ?
        ORDER BY ea.created_at DESC LIMIT 50
      `).all(user!.tenantId);
  res.json(rows);
});

// PATCH /api/alerts/:id/resolve
router.patch('/:id/resolve', authenticate, requireRoles('barangay_official', 'hoa_admin', 'security_guard', 'super_admin'), (req: Request, res: Response): void => {
  const alert = db.prepare(`SELECT * FROM emergency_alerts WHERE id = ?`).get(req.params.id) as any;
  if (!alert) { res.status(404).json({ error: 'Alert not found' }); return; }

  db.prepare(`UPDATE emergency_alerts SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);

  AlertService.broadcast({
    type: 'alert_resolved',
    alertId: req.params.id,
    resolvedBy: req.user!.userId,
  });

  res.json({ id: req.params.id, status: 'resolved', resolvedAt: new Date().toISOString() });
});

// GET /api/users — for super admin
router.get('/users', authenticate, requireRoles('super_admin', 'hoa_admin', 'barangay_official'), (req: Request, res: Response): void => {
  const { user } = req;
  const rows = user!.roleName === 'super_admin'
    ? db.prepare(`
        SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
               r.name as role_name, t.name as tenant_name, t.type as tenant_type
        FROM users u JOIN roles r ON u.role_id = r.id JOIN tenants t ON u.tenant_id = t.id
        ORDER BY u.created_at DESC
      `).all()
    : db.prepare(`
        SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
               r.name as role_name
        FROM users u JOIN roles r ON u.role_id = r.id
        WHERE u.tenant_id = ?
        ORDER BY u.created_at DESC
      `).all(user!.tenantId);
  res.json(rows);
});

export default router;
