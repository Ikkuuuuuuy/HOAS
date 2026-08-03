import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../config/database';
import { authenticate, JwtPayload } from '../middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = db.prepare(`
      SELECT u.id, u.tenant_id, u.role_id, u.email, u.password_hash, u.full_name, u.is_active,
             r.name as role_name, t.name as tenant_name, t.type as tenant_type
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = ?
    `).get(email) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      roleId: user.role_id,
      roleName: user.role_name,
      email: user.email,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roleName: user.role_name,
        roleId: user.role_id,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
        tenantType: user.tenant_type,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response): void => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const user = db.prepare(`
      SELECT u.id, u.tenant_id, u.role_id, u.email, r.name as role_name
      FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.is_active = 1
    `).get(decoded.userId) as any;

    if (!user) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      roleId: user.role_id,
      roleName: user.role_name,
      email: user.email,
    };
    const { accessToken } = generateTokens(payload);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response): void => {
  const user = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.created_at,
           r.name as role_name, r.id as role_id,
           t.id as tenant_id, t.name as tenant_name, t.type as tenant_type
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN tenants t ON u.tenant_id = t.id
    WHERE u.id = ?
  `).get(req.user!.userId) as any;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    roleName: user.role_name,
    roleId: user.role_id,
    tenantId: user.tenant_id,
    tenantName: user.tenant_name,
    tenantType: user.tenant_type,
    createdAt: user.created_at,
  });
});

export default router;
