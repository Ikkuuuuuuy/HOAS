import { Request, Response, NextFunction } from 'express';

type RoleName = 'super_admin' | 'barangay_official' | 'hoa_admin' | 'security_guard' | 'resident' | 'admin_staff';
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.roleName)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.roleName,
      });
      return;
    }
    next();
  };
}

export function requireRoles(...roles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.roleName as RoleName)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.roleName,
      });
      return;
    }
    next();
  };
}

export function requireSameTenant(req: Request, res: Response, next: NextFunction): void {
  // Additional check: ensure route params match user's tenant when applicable
  const paramTenantId = req.params.tenantId;
  if (paramTenantId && req.user?.roleName !== 'super_admin') {
    if (paramTenantId !== req.user?.tenantId) {
      res.status(403).json({ error: 'Cross-tenant access denied' });
      return;
    }
  }
  next();
}
