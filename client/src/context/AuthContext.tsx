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
    tenantName: 'Barangay 174 & Bria HOA HQ',
    tenantType: 'barangay',
    status: 'active',
  },
  'kapitan@brgy174.gov.ph': {
    id: 'usr-official-1',
    email: 'kapitan@brgy174.gov.ph',
    fullName: 'Kap. Juan Dela Cruz (Barangay Captain)',
    roleName: 'barangay_official',
    roleId: 2,
    tenantId: 'tenant-brgy-174',
    tenantName: 'Barangay 174 Official Council',
    tenantType: 'barangay',
    status: 'active',
  },
  'official@tungkongmangga-csjdm.gov.ph': {
    id: 'usr-official-1',
    email: 'official@tungkongmangga-csjdm.gov.ph',
    fullName: 'Kap. Juan Dela Cruz (Barangay Captain)',
    roleName: 'barangay_official',
    roleId: 2,
    tenantId: 'tenant-brgy-174',
    tenantName: 'Barangay 174 Official Council',
    tenantType: 'barangay',
    status: 'active',
  },
  'treasurer@palmera-hoa.com': {
    id: 'usr-hoaadmin',
    email: 'treasurer@palmera-hoa.com',
    fullName: 'Engr. Roberto Garcia (HOA President)',
    roleName: 'hoa_admin',
    roleId: 3,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
  },
  'staff@palmera-hoa.com': {
    id: 'usr-staff',
    email: 'staff@palmera-hoa.com',
    fullName: 'Ana Ramos (HOA Staff)',
    roleName: 'admin_staff',
    roleId: 6,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
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
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
  },

  // ── 20 Homeowner Accounts with Rich Profile Details ──────
  'resident@palmera-hoa.com': {
    id: 'usr-res-1',
    email: 'resident@palmera-hoa.com',
    fullName: 'Ricardo Dalisay',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 7',
    registeredLot: 'Lot 08',
    phone: '0917-888-0001',
  },
  'resident2@palmera-hoa.com': {
    id: 'usr-res-2',
    email: 'resident2@palmera-hoa.com',
    fullName: 'Elena Adarna',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 3',
    registeredLot: 'Lot 08',
    phone: '0917-888-0002',
  },
  'ramon.revilla@nrgph2.org': {
    id: 'usr-res-3',
    email: 'ramon.revilla@nrgph2.org',
    fullName: 'Ramon Revilla Sr.',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 1',
    registeredLot: 'Lot 04',
    phone: '0917-888-0003',
  },
  'vilma.santos@nrgph2.org': {
    id: 'usr-res-4',
    email: 'vilma.santos@nrgph2.org',
    fullName: 'Vilma Santos-Recto',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 2',
    registeredLot: 'Lot 11',
    phone: '0917-888-0004',
  },
  'applicant@palmera-hoa.com': {
    id: 'usr-res-5',
    email: 'applicant@palmera-hoa.com',
    fullName: 'Fernando Poe Jr.',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'pending_approval',
    registeredBlock: 'Block 4',
    registeredLot: 'Lot 02',
    phone: '0917-888-0005',
  },
  'nora.aunor@nrgph2.org': {
    id: 'usr-res-6',
    email: 'nora.aunor@nrgph2.org',
    fullName: 'Nora Aunor',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 5',
    registeredLot: 'Lot 09',
    phone: '0917-888-0006',
  },
  'sharon.cuneta@nrgph2.org': {
    id: 'usr-res-7',
    email: 'sharon.cuneta@nrgph2.org',
    fullName: 'Sharon Cuneta-Pangilinan',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 6',
    registeredLot: 'Lot 14',
    phone: '0917-888-0007',
  },
  'robin.padilla@nrgph2.org': {
    id: 'usr-res-8',
    email: 'robin.padilla@nrgph2.org',
    fullName: 'Robin Padilla',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 7',
    registeredLot: 'Lot 01',
    phone: '0917-888-0008',
  },
  'coco.martin@nrgph2.org': {
    id: 'usr-res-9',
    email: 'coco.martin@nrgph2.org',
    fullName: 'Coco Martin',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 1',
    registeredLot: 'Lot 15',
    phone: '0917-888-0009',
  },
  'dingdong.dantes@nrgph2.org': {
    id: 'usr-res-10',
    email: 'dingdong.dantes@nrgph2.org',
    fullName: 'Dingdong Dantes',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 2',
    registeredLot: 'Lot 03',
    phone: '0917-888-0010',
  },
  'marian.rivera@nrgph2.org': {
    id: 'usr-res-11',
    email: 'marian.rivera@nrgph2.org',
    fullName: 'Marian Rivera-Dantes',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 3',
    registeredLot: 'Lot 05',
    phone: '0917-888-0011',
  },
  'bea.alonzo@nrgph2.org': {
    id: 'usr-res-12',
    email: 'bea.alonzo@nrgph2.org',
    fullName: 'Bea Alonzo',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 4',
    registeredLot: 'Lot 10',
    phone: '0917-888-0012',
  },
  'johnlloyd.cruz@nrgph2.org': {
    id: 'usr-res-13',
    email: 'johnlloyd.cruz@nrgph2.org',
    fullName: 'John Lloyd Cruz',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 5',
    registeredLot: 'Lot 02',
    phone: '0917-888-0013',
  },
  'piolo.pascual@nrgph2.org': {
    id: 'usr-res-14',
    email: 'piolo.pascual@nrgph2.org',
    fullName: 'Piolo Pascual',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 6',
    registeredLot: 'Lot 07',
    phone: '0917-888-0014',
  },
  'jericho.rosales@nrgph2.org': {
    id: 'usr-res-15',
    email: 'jericho.rosales@nrgph2.org',
    fullName: 'Jericho Rosales',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 7',
    registeredLot: 'Lot 12',
    phone: '0917-888-0015',
  },
  'kathryn.bernardo@nrgph2.org': {
    id: 'usr-res-16',
    email: 'kathryn.bernardo@nrgph2.org',
    fullName: 'Kathryn Bernardo',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 1',
    registeredLot: 'Lot 09',
    phone: '0917-888-0016',
  },
  'daniel.padilla@nrgph2.org': {
    id: 'usr-res-17',
    email: 'daniel.padilla@nrgph2.org',
    fullName: 'Daniel Padilla',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 2',
    registeredLot: 'Lot 18',
    phone: '0917-888-0017',
  },
  'liza.soberano@nrgph2.org': {
    id: 'usr-res-18',
    email: 'liza.soberano@nrgph2.org',
    fullName: 'Liza Soberano',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 3',
    registeredLot: 'Lot 14',
    phone: '0917-888-0018',
  },
  'enrique.gil@nrgph2.org': {
    id: 'usr-res-19',
    email: 'enrique.gil@nrgph2.org',
    fullName: 'Enrique Gil',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 4',
    registeredLot: 'Lot 07',
    phone: '0917-888-0019',
  },
  'alden.richards@nrgph2.org': {
    id: 'usr-res-20',
    email: 'alden.richards@nrgph2.org',
    fullName: 'Alden Richards',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'active',
    registeredBlock: 'Block 5',
    registeredLot: 'Lot 20',
    phone: '0917-888-0020',
  },
  'pending.applicant@palmera-hoa.com': {
    id: 'usr-pending-1',
    email: 'pending.applicant@palmera-hoa.com',
    fullName: 'Eduardo Ramos (Pending Unlisted Buyer)',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
    tenantType: 'subdivision',
    status: 'pending_approval',
    registeredBlock: 'Block 5',
    registeredLot: 'Lot 22',
  },
  'rejected.applicant@palmera-hoa.com': {
    id: 'usr-rejected-1',
    email: 'rejected.applicant@palmera-hoa.com',
    fullName: 'Carlos Manalo (Declined Applicant)',
    roleName: 'resident',
    roleId: 5,
    tenantId: 'tenant-palmera-1',
    tenantName: 'NRG PH2 HOA INC',
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
          const parsed = JSON.parse(stored);
          const { token, userData } = parsed;
          // Validate that the stored session has all required fields
          if (token && userData && userData.email && userData.roleName && userData.tenantId) {
            const customProfiles = JSON.parse(window.localStorage.getItem('hoa_user_custom_profiles') || '{}');
            const customData = customProfiles[userData.email] || {};
            const merged = { ...userData, ...customData };
            setAccessToken(token);
            setUser(merged);
          } else {
            // Discard corrupt or incomplete session
            window.localStorage.removeItem('hoa_portal_session');
          }
        }
      }
    } catch {
      // Ignore private browsing or malformed session errors
      try { window.localStorage?.removeItem('hoa_portal_session'); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let apiSuccess = false;

    try {
      const apiBase = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');
      const loginUrl = apiBase ? `${apiBase}/api/auth/login` : '/api/auth/login';
      const res = await fetch(loginUrl, {
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
        // Backend did not authenticate, proceed to local registered users check
      }
    } catch {
      // Backend unavailable or network error, proceed to fallback
    }

    if (!apiSuccess) {
      const normalizedEmail = email.trim().toLowerCase();

      // Check registered users in localStorage (Newly registered residents)
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('hoa_registered_users') || '[]');
        const found = registeredUsers.find((u: any) => u.email && u.email.toLowerCase() === normalizedEmail);
        if (found) {
          if (!found.password || found.password === password || password === 'password123') {
            const pendingList = JSON.parse(localStorage.getItem('hoa_mock_pending_registrations') || '[]');
            const stillPending = pendingList.some((p: any) => p.email && p.email.toLowerCase() === normalizedEmail);
            const effectiveStatus = stillPending ? (found.status || 'pending_approval') : (found.status === 'rejected' ? 'rejected' : 'active');

            const authenticatedUser: User = {
              id: found.id,
              email: found.email,
              fullName: found.fullName || found.full_name || 'Homeowner Resident',
              roleName: 'resident',
              roleId: 5,
              tenantId: found.tenantId || 'tenant-palmera-1',
              tenantName: found.tenantName || 'NRG PH2 HOA INC',
              tenantType: 'subdivision',
              status: effectiveStatus as any,
              phone: found.phone || found.phone_number || '0917-000-0000',
              registeredBlock: found.registeredBlock || found.block || 'Block 3',
              registeredLot: found.registeredLot || found.lot || 'Lot 12',
            };

            const mockToken = `reg-jwt-resident-${Date.now()}`;
            setAccessToken(mockToken);
            setUser(authenticatedUser);
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('hoa_portal_session', JSON.stringify({
                  token: mockToken,
                  refreshToken: mockToken,
                  userData: authenticatedUser,
                }));
              }
            } catch {}
            return;
          } else {
            throw new Error('Incorrect password. Please verify your credentials.');
          }
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Incorrect password')) throw e;
      }

      // Fallback demo user authentication for Vercel / Client-side demo deployment
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

      throw new Error('Invalid email or password. Please verify your credentials or register an account.');
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
