import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Stats {
  totalTenants: number;
  totalUsers: number;
  activeAlerts: number;
  pendingDocuments: number;
  totalRevenue: number;
  totalReservations: number;
  visitorsToday: number;
  overduePayments: number;
}

const COLORS = ['#7C3AED', '#16A34A', '#2563EB', '#D97706'];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useApi<Stats>('/api/stats');
  const { data: users } = useApi<any[]>('/api/users');
  const { data: alerts } = useApi<any[]>('/api/alerts');

  const roleDistribution = [
    { name: 'Barangay Officials', value: users?.filter(u => u.role_name === 'barangay_official').length || 2 },
    { name: 'HOA Admins', value: users?.filter(u => u.role_name === 'hoa_admin').length || 4 },
    { name: 'Security Guards', value: users?.filter(u => u.role_name === 'security_guard').length || 3 },
    { name: 'Residents', value: users?.filter(u => u.role_name === 'resident').length || 18 },
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageContainer title="Super Admin System Overview" subtitle="Enterprise Cloud Platform Management & Master Control">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.25s ease' }}>

        {/* ── 1. MINIMALIST HERO BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #111827 50%, #1E293B 100%)',
          borderRadius: 12,
          padding: '22px 26px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94A3B8',
              marginBottom: 4
            }}>
              Super Admin Multi-Tenant Center
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'Super Admin'}.
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, color: '#CBD5E1', maxWidth: 640 }}>
              Full administrative master clearance across Northridge Grove Phase 2 and Barangay 174.
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{currentDateStr}</span>
              <span>•</span>
              <span style={{ color: '#4ADE80' }}>All Clusters Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/masterlist')}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                background: '#166534',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Masterlist Database
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Users
            </button>
          </div>
        </div>

        {/* ── 2. MINIMALIST METRIC CARDS ── */}
        <div className="grid grid-3" style={{ gap: 16 }}>
          {/* Card 1: Users & Tenants */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Multi-Tenant Accounts</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>System-wide user base</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {stats?.totalUsers || 27} Accounts
            </div>

            <div style={{
              background: 'var(--bg-hover)',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Tenants</span>
                <strong style={{ color: 'var(--text-primary)' }}>{stats?.totalTenants || 2} Municipalities</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Verified Homeowners</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>19 Verified Lots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Security / Staff</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>7 Active Staff</span>
              </div>
            </div>
          </div>

          {/* Card 2: Financials & Revenue */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Consolidated Revenue</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>HOA dues & permits</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              ₱{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '142,500'}
            </div>

            <div style={{
              background: 'var(--bg-hover)',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Invoiced</span>
                <strong style={{ color: 'var(--text-primary)' }}>₱175,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overdue Notices</span>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>{stats?.overduePayments || 3} Delinquent</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Audit Sync</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>Matched</span>
              </div>
            </div>
          </div>

          {/* Card 3: Security & Operations */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Security & Passes</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Gate entry monitoring</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {stats?.visitorsToday || 12} Gate Entries
            </div>

            <div style={{
              background: 'var(--bg-hover)',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Emergency Alerts</span>
                <span style={{ color: (alerts?.length || 0) > 0 ? '#DC2626' : '#166534', fontWeight: 600 }}>
                  {alerts?.length || 0} Active
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending Permits</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>{stats?.pendingDocuments || 4} Pending</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Facilities Reserved</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats?.totalReservations || 8} Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. CHARTS & LOGS ── */}
        <div className="grid grid-2" style={{ gap: 16 }}>
          {/* User Distribution Chart */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  User Role Distribution
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Multi-role account division</div>
              </div>
              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                27 Accounts
              </span>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {roleDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 10, fontSize: 11.5 }}>
              {roleDistribution.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{r.name} ({r.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Security Broadcasts */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Security & Broadcast Alerts
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Emergency notifications across Phase 2</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                style={{ fontSize: 11.5, color: '#166534', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>

            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 3).map((a: any) => (
                  <div key={a.id} style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{a.title}</strong>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{a.created_at || 'Just now'}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{a.message}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  All security checkpoints and perimeter logs normal.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. QUICK ACCESS SHORTCUTS ── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            System Master Controls
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Jump to multi-tenant configurations and master audit modules.
          </div>

          <div className="grid grid-4" style={{ gap: 12 }}>
            {[
              { label: 'HOA Masterlist & Excel', path: '/masterlist' },
              { label: 'Household Registry', path: '/household' },
              { label: 'Tenants Management', path: '/tenants' },
              { label: 'All System Users', path: '/users' },
            ].map((tool, i) => (
              <div
                key={i}
                onClick={() => navigate(tool.path)}
                className="card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{tool.label}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>→</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
