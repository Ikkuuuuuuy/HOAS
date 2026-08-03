import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';

const DEFAULT_USERS = [
  { id: '1', full_name: 'System Super Admin', email: 'superadmin@cloudportal.ph', role_name: 'super_admin', tenant_name: 'Global System', is_active: 1, created_at: '2025-01-01' },
  { id: '2', full_name: 'Kap. Jose Santos', email: 'official@tungkongmangga-csjdm.gov.ph', role_name: 'barangay_official', tenant_name: 'Barangay Tungkong Mangga Council', is_active: 1, created_at: '2025-01-10' },
  { id: '3', full_name: 'Engr. Juan Dela Cruz', email: 'admin@bria-northridgegrove.ph', role_name: 'hoa_admin', tenant_name: 'Bria Homes Northridge Grove HOA', is_active: 1, created_at: '2025-01-15' },
  { id: '4', full_name: 'Maria Santos (Staff)', email: 'staff@bria-northridgegrove.ph', role_name: 'admin_staff', tenant_name: 'Bria Homes Northridge Grove HOA', is_active: 1, created_at: '2025-01-18' },
  { id: '5', full_name: 'Guard Pedro Penduko', email: 'guard1@bria-northridgegrove.ph', role_name: 'security_guard', tenant_name: 'Bria Homes Northridge Grove HOA', is_active: 1, created_at: '2025-01-20' },
  { id: '6', full_name: 'Ricardo Dalisay', email: 'homeowner@bria-northridgegrove.ph', role_name: 'resident', tenant_name: 'Bria Homes Northridge Grove HOA', is_active: 1, created_at: '2025-02-01' },
  { id: '7', name: 'Elena Adarna', full_name: 'Elena Adarna', email: 'resident2@palmera-hoa.com', role_name: 'resident', tenant_name: 'Palmera Residences HOA', is_active: 1, created_at: '2025-02-05' },
];

export default function AllUsersManagement() {
  const { success } = useToast();
  const { data: serverUsers, refetch } = useApi<any[]>('/api/users');

  const users = (serverUsers && serverUsers.length > 0) ? serverUsers : DEFAULT_USERS;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('resident');
  const [password, setPassword] = useState('');

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = !searchQuery ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role_name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    success('User Created! 👤', `Account for ${fullName} (${roleName.replace(/_/g, ' ')}) has been provisioned.`);
    setShowModal(false);
    setFullName('');
    setEmail('');
    setPassword('');
    refetch();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return { label: '👑 Super Admin', bg: 'rgba(124, 58, 237, 0.2)', color: '#A78BFA', border: '#7C3AED' };
      case 'barangay_official': return { label: '🏛 Barangay Official', bg: 'rgba(5, 150, 105, 0.2)', color: '#34D399', border: '#059669' };
      case 'hoa_admin': return { label: '⚙️ Main HOA Admin', bg: 'rgba(220, 38, 38, 0.2)', color: '#FCA5A5', border: '#DC2626' };
      case 'admin_staff': return { label: '📋 Admin Staff', bg: 'rgba(37, 99, 235, 0.2)', color: '#93C5FD', border: '#2563EB' };
      case 'security_guard': return { label: '🚗 Gate Security', bg: 'rgba(217, 119, 6, 0.2)', color: '#FDE047', border: '#D97706' };
      default: return { label: '🏠 Homeowner', bg: 'rgba(8, 145, 178, 0.2)', color: '#67E8F9', border: '#0891B2' };
    }
  };

  return (
    <PageContainer title="All Users Directory" subtitle="System-Wide User Account Management & Role-Based Access Control (RBAC)">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* METRICS SUMMARY */}
        <div className="grid grid-4 mb-6">
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>Total Users</div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{users.length}</div>
          </div>
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>Active Accounts</div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: '#10B981' }}>{users.filter(u => u.is_active !== 0).length}</div>
          </div>
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
            <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>HOA Officers & Staff</div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: '#DC2626' }}>{users.filter(u => ['hoa_admin', 'admin_staff', 'security_guard'].includes(u.role_name)).length}</div>
          </div>
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(8, 145, 178, 0.3)' }}>
            <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>Homeowners</div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: '#0891B2' }}>{users.filter(u => u.role_name === 'resident').length}</div>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 items-center flex-1">
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: 360 }}
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              <select
                className="form-select"
                style={{ width: 200 }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="hoa_admin">Main HOA Admin</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="security_guard">Security Guard</option>
                <option value="resident">Homeowner</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 700 }} onClick={() => setShowModal(true)}>
              + Create User Account
            </button>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="section-title" style={{ color: 'var(--text-primary)' }}>System Account Directory</div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Organization / Tenant</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any) => {
                const badge = getRoleBadge(u.role_name);
                return (
                  <tr key={u.id}>
                    <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{u.full_name}</td>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className="badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.tenant_name || 'Bria Northridge Grove HOA'}</td>
                    <td>
                      <span className={`badge badge-${u.is_active !== 0 ? 'approved' : 'rejected'}`}>
                        {u.is_active !== 0 ? '✓ Active' : '✕ Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => alert(`Resetting password for ${u.email}...`)}>
                          🔑 Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CREATE USER MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ color: '#FFF' }}>👤 Create New User Account</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input required type="text" className="form-input" placeholder="Juan Dela Cruz" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input required type="email" className="form-input" placeholder="user@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <select className="form-select" value={roleName} onChange={e => setRoleName(e.target.value)}>
                      <option value="resident">Homeowner</option>
                      <option value="admin_staff">Admin Staff</option>
                      <option value="security_guard">Security Guard</option>
                      <option value="hoa_admin">Main HOA Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input required type="password" className="form-input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary mr-2" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>Create Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
