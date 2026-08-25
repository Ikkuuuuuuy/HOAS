import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#7C3AED', '#059669', '#2563EB', '#D97706'];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useApi<Stats>('/api/stats');
  const { data: tenants } = useApi<any[]>('/api/tenants');
  const { data: users } = useApi<any[]>('/api/users');
  const { data: alerts } = useApi<any[]>('/api/alerts');

  const statCards = [
    { label: 'Total Tenants', value: stats?.totalTenants ?? '—', icon: '🏛', color: '#7C3AED', bg: 'var(--accent-soft)' },
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: '👥', color: '#059669', bg: 'var(--brgy-soft)' },
    { label: 'Active Alerts', value: stats?.activeAlerts ?? '—', icon: '🚨', color: '#EF4444', bg: 'var(--danger-soft)' },
    { label: 'Pending Documents', value: stats?.pendingDocuments ?? '—', icon: '📄', color: '#2563EB', bg: 'var(--hoa-soft)' },
    { label: 'Total Revenue', value: stats?.totalRevenue ? `₱${stats.totalRevenue.toLocaleString()}` : '—', icon: '💰', color: '#10B981', bg: 'var(--success-soft)' },
    { label: 'Reservations', value: stats?.totalReservations ?? '—', icon: '📅', color: '#0891B2', bg: 'var(--resident-soft)' },
    { label: 'Visitors Today', value: stats?.visitorsToday ?? '—', icon: '🚗', color: '#D97706', bg: 'var(--security-soft)' },
    { label: 'Overdue Payments', value: stats?.overduePayments ?? '—', icon: '⚠️', color: '#F59E0B', bg: 'var(--warning-soft)' },
  ];

  const roleDistribution = [
    { name: 'Barangay Officials', value: users?.filter(u => u.role_name === 'barangay_official').length || 0 },
    { name: 'HOA Admins', value: users?.filter(u => u.role_name === 'hoa_admin').length || 0 },
    { name: 'Security Guards', value: users?.filter(u => u.role_name === 'security_guard').length || 0 },
    { name: 'Residents', value: users?.filter(u => u.role_name === 'resident').length || 0 },
  ];

  return (
    <PageContainer title="System Overview" subtitle="Super Admin — Full System Control">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Welcome banner */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.1))',
          border: '1px solid rgba(124,58,237,0.3)',
          marginBottom: 'var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-5)',
        }}>
          <div style={{ fontSize: '3rem' }}>⚙️</div>
          <div>
            <h2 style={{ fontSize: 'var(--font-2xl)', color: 'var(--text-primary)', fontWeight: 800 }}>
              Welcome, {user?.fullName}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 4 }}>
              You have full administrative access across all tenants. System health: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Operational ✓</span>
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {statCards.map((card, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                {i === 2 && (stats?.activeAlerts ?? 0) > 0 && (
                  <span className="stat-delta" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                    LIVE
                  </span>
                )}
              </div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="card">
            <div className="section-title">User Role Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {roleDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4">
              {roleDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-secondary">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Tenant Overview</div>
            {tenants?.map(t => (
              <div key={t.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: t.type === 'barangay' ? 'var(--brgy-soft)' : 'var(--hoa-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  }}>
                    {t.type === 'barangay' ? '🏛' : '🏘'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-xs text-muted">{t.type.toUpperCase()} • {t.user_count} users</div>
                  </div>
                </div>
                <span className={`badge badge-${t.type === 'barangay' ? 'approved' : 'issued'}`}>Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card">
          <div className="section-title">Recent Emergency Alerts</div>
          {alerts && alerts.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Triggered By</th>
                  <th>Tenant</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 5).map((alert: any) => (
                  <tr key={alert.id}>
                    <td><span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{alert.alert_type}</span></td>
                    <td style={{ maxWidth: 200 }} className="truncate">{alert.message}</td>
                    <td>{alert.triggered_by_name}</td>
                    <td>{alert.tenant_name}</td>
                    <td><span className={`badge badge-${alert.status}`}>{alert.status}</span></td>
                    <td className="text-xs">{new Date(alert.created_at).toLocaleString('en-PH')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>No recent alerts</h3>
              <p>The system is operating normally</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
