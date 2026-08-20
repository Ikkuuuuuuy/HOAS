import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize DB (runs schema)
import './config/database';

// Routes
import authRouter from './routes/auth';
import documentsRouter from './routes/documents';
import billingRouter from './routes/billing';
import facilitiesRouter from './routes/facilities';
import visitorsRouter from './routes/visitors';
import alertsRouter from './routes/alerts';
import hoaRouter from './routes/hoa';
import householdRouter from './routes/household';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/visitors', visitorsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/hoa', hoaRouter);
app.use('/api/household', householdRouter);

// Users list (shared in alerts router for admin)
import db from './config/database';
import { authenticate } from './middleware/auth';

app.get('/api/users', authenticate, (req, res) => {
  const { user } = req;
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const rows = user.roleName === 'super_admin'
    ? db.prepare(`
        SELECT u.id, u.email, u.full_name, u.is_active, u.created_at,
               r.name as role_name, t.name as tenant_name, t.type as tenant_type
        FROM users u JOIN roles r ON u.role_id = r.id JOIN tenants t ON u.tenant_id = t.id
        ORDER BY u.created_at DESC
      `).all()
    : db.prepare(`
        SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, r.name as role_name
        FROM users u JOIN roles r ON u.role_id = r.id
        WHERE u.tenant_id = ?
        ORDER BY u.created_at DESC
      `).all(user.tenantId);
  res.json(rows);
});

// Residents list
app.get('/api/residents', authenticate, (req, res) => {
  const { user } = req;
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const rows = db.prepare(`
    SELECT rp.*, u.full_name, u.email
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.tenant_id = ?
    ORDER BY u.full_name ASC
  `).all(user.tenantId);
  res.json(rows);
});

// Tenants list (super admin)
app.get('/api/tenants', authenticate, (req, res) => {
  const { user } = req;
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  if (user.roleName !== 'super_admin') {
    const tenant = db.prepare(`SELECT * FROM tenants WHERE id = ?`).get(user.tenantId);
    res.json([tenant]);
    return;
  }
  const tenants = db.prepare(`
    SELECT t.*, COUNT(u.id) as user_count
    FROM tenants t LEFT JOIN users u ON u.tenant_id = t.id
    GROUP BY t.id
  `).all();
  res.json(tenants);
});

// System stats (super admin)
app.get('/api/stats', authenticate, (req, res) => {
  const { user } = req;
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const stats = {
    totalTenants: (db.prepare(`SELECT COUNT(*) as c FROM tenants`).get() as any).c,
    totalUsers: (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any).c,
    activeAlerts: (db.prepare(`SELECT COUNT(*) as c FROM emergency_alerts WHERE status = 'active'`).get() as any).c,
    pendingDocuments: (db.prepare(`SELECT COUNT(*) as c FROM document_requests WHERE status = 'pending'`).get() as any).c,
    totalRevenue: (db.prepare(`SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'success'`).get() as any).s,
    totalReservations: (db.prepare(`SELECT COUNT(*) as c FROM reservations`).get() as any).c,
    visitorsToday: (db.prepare(`SELECT COUNT(*) as c FROM visitor_logs WHERE date(time_in) = date('now')`).get() as any).c,
    overduePayments: (db.prepare(`SELECT COUNT(*) as c FROM billing_ledgers WHERE status = 'overdue'`).get() as any).c,
  };

  res.json(stats);
});

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║   HOA & Barangay Portal — API Server                ║
║   Running on: http://localhost:${PORT}                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
