import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  roleId: number;
  tenantId: string;
  tenantName: string;
  tenantType: string;
  status?: string;
  rejectionReason?: string;
  registeredBlock?: string;
  registeredLot?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  updateUserProfile: (updates: Partial<User>) => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
}

const DEMO_USERS_MAP: Record<string, User> = {
  'superadmin@portal.gov.ph': {
    id: 'usr-superadmin',
    email: 'superadmin@portal.gov.ph',
    fullName: 'Hon. Maria Santos (Super Admin)',
    roleName: 'super_admin',
    roleId: 1,
    tenantId: 'tenant-brgy-174',
    tenantName: 'Barangay 174 & Bria HOA',
    tenantType: 'barangay',
    status: 'active',
  },
  'treasurer@palmera-hoa.com': {
    id: 'usr-hoaadmin',
    email: 'treasurer@palmera-hoa.com',
    fullName: 'Juan Dela Cruz (HOA President)',
    roleName: 'hoa_admin',
    roleId: 2,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'active',
  },
  'staff@palmera-hoa.com': {
    id: 'usr-staff',
    email: 'staff@palmera-hoa.com',
    fullName: 'Elena Reyes (HOA Staff)',
    roleName: 'admin_staff',
    roleId: 3,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'active',
  },
  'guard@palmera-hoa.com': {
    id: 'usr-guard',
    email: 'guard@palmera-hoa.com',
    fullName: 'Sgt. Pedro Penduko (Security Lead)',
    roleName: 'security_guard',
    roleId: 4,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'active',
  },
  'resident@palmera-hoa.com': {
    id: 'usr-resident',
    email: 'resident@palmera-hoa.com',
    fullName: 'Ricardo Dalisay (Resident Owner)',
    roleName: 'homeowner',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'active',
  },
  'pending.applicant@palmera-hoa.com': {
    id: 'usr-pending-1',
    email: 'pending.applicant@palmera-hoa.com',
    fullName: 'Eduardo Ramos (Pending Unlisted Buyer)',
    roleName: 'homeowner',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'pending_approval',
    registeredBlock: 'Block 5',
    registeredLot: 'Lot 22',
  },
  'rejected.applicant@palmera-hoa.com': {
    id: 'usr-rejected-1',
    email: 'rejected.applicant@palmera-hoa.com',
    fullName: 'Carlos Manalo (Declined Applicant)',
    roleName: 'homeowner',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'Bria Northridge Grove HOA',
    tenantType: 'subdivision',
    status: 'rejected',
    rejectionReason: 'Uploaded document is unreadable and lot number (Block 9 Lot 99) does not match developer turnover records.',
    registeredBlock: 'Block 9',
    registeredLot: 'Lot 99',
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session from localStorage safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('hoa_portal_session');
        if (stored) {
          const { token, userData } = JSON.parse(stored);
          const customProfiles = JSON.parse(window.localStorage.getItem('hoa_user_custom_profiles') || '{}');
          const customData = customProfiles[userData?.email] || {};
          const merged = { ...userData, ...customData };
          setAccessToken(token);
          setUser(merged);
        }
      }
    } catch {
      // Ignore private browsing or malformed session errors
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let apiSuccess = false;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (res.ok && data && data.accessToken && data.user) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('hoa_portal_session', JSON.stringify({
              token: data.accessToken,
              refreshToken: data.refreshToken,
              userData: data.user,
            }));
          }
        } catch { /* storage fallback */ }
        apiSuccess = true;
        return;
      }

      if (data && data.error && !data.error.toLowerCase().includes('failed to fetch')) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid credentials') || err.message.includes('incorrect password'))) {
        throw err;
      }
    }

    if (!apiSuccess) {
      // Fallback demo user authentication for Vercel / Client-side demo deployment
      const normalizedEmail = email.trim().toLowerCase();
      const matchedDemoUser = DEMO_USERS_MAP[normalizedEmail];

      if (matchedDemoUser) {
        const mockToken = `demo-jwt-${matchedDemoUser.roleName}-${Date.now()}`;
        setAccessToken(mockToken);
        setUser(matchedDemoUser);
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(`hoa_privacy_advisory_${matchedDemoUser.email}`);
          }
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('hoa_portal_session', JSON.stringify({
              token: mockToken,
              refreshToken: mockToken,
              userData: matchedDemoUser,
            }));
          }
        } catch { /* storage fallback */ }
        return;
      }

      throw new Error('Invalid email or password. Please use one of the quick demo sign-in accounts below.');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('hoa_portal_session');
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        Object.keys(window.sessionStorage).forEach(k => {
          if (k.startsWith('hoa_privacy_advisory_')) {
            window.sessionStorage.removeItem(k);
          }
        });
      }
    } catch { /* ignore */ }
  }, []);

  const hasRole = useCallback((...roles: string[]) => {
    if (!user) return false;
    return roles.some(r => {
      if (r === 'resident' || r === 'homeowner') {
        return user.roleName === 'resident' || user.roleName === 'homeowner';
      }
      return user.roleName === r;
    });
  }, [user]);

  const updateUserProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('hoa_portal_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.userData = updated;
            window.localStorage.setItem('hoa_portal_session', JSON.stringify(parsed));
          }
          // Also persist user-specific custom profile settings
          const customProfiles = JSON.parse(window.localStorage.getItem('hoa_user_custom_profiles') || '{}');
          customProfiles[updated.email] = {
            ...customProfiles[updated.email],
            avatarUrl: updated.avatarUrl,
            fullName: updated.fullName,
            phone: updated.phone
          };
          window.localStorage.setItem('hoa_user_custom_profiles', JSON.stringify(customProfiles));
        }
      } catch { /* storage fallback */ }
      return updated;
    });
  }, []);

  const changePassword = useCallback(async (currentPass: string, newPass: string) => {
    if (!user) {
      return { success: false, message: 'You must be logged in to change password.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    try {
      // 1. Try real backend API if active
      if (accessToken && !accessToken.startsWith('demo-jwt-')) {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.error || 'Failed to update password.' };
        }
      }

      // 2. Persist custom demo password in local storage
      if (typeof window !== 'undefined' && window.localStorage) {
        const customPasswords = JSON.parse(window.localStorage.getItem('hoa_custom_passwords') || '{}');
        customPasswords[user.email.toLowerCase()] = newPass;
        window.localStorage.setItem('hoa_custom_passwords', JSON.stringify(customPasswords));
      }

      return { success: true, message: 'Password has been changed successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while changing password.' };
    }
  }, [user, accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, hasRole, updateUserProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
