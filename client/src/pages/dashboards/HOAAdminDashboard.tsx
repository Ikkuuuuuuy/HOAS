import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HOAAdminDashboard() {
  const { user } = useAuth();
  const { data: billingData } = useApi<{ summary: any; monthlyRevenue: any[] }>('/api/billing/summary');
  const { data: ledgers } = useApi<any[]>('/api/billing');
  const { data: residents } = useApi<any[]>('/api/residents');
  const { data: reservations } = useApi<any[]>('/api/facilities/reservations');

  const summary = billingData?.summary;
  const monthlyData = billingData?.monthlyRevenue?.map(m => ({
    month: m.billing_period,
    amount: m.amount,
  })) || [];

  const overdueLedgers = ledgers?.filter(l => l.status === 'overdue') || [];
  const pendingReservations = reservations?.filter(r => r.status === 'pending') || [];

  return (
    <PageContainer title="HOA Finance Center" subtitle={`Palmera Subdivision HOA — ${user?.fullName}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Welcome */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(30,58,138,0.15))',
          border: '1px solid rgba(37,99,235,0.3)',
          marginBottom: 'var(--space-8)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
        }}>
          <div style={{ fontSize: '3rem' }}>🏢</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>HOA Financial Management</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 4 }}>
              Monitor dues collection, manage billing ledgers, and oversee facility reservations.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: '#10B981' }}>
              ₱{summary?.total_collected?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted">Total Collected</div>
          </div>
        </div>

        {/* Financial stat cards */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Collected', value: `₱${summary?.total_collected?.toLocaleString() || 0}`, icon: '💰', color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Outstanding Dues', value: `₱${summary?.total_pending?.toLocaleString() || 0}`, icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-soft)' },
            { label: 'Overdue Balance', value: `₱${summary?.total_overdue?.toLocaleString() || 0}`, icon: '⚠️', color: 'var(--danger)', bg: 'var(--danger-soft)' },
            { label: 'Paid Accounts', value: summary?.paid_count || 0, icon: '✅', color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Unpaid Accounts', value: summary?.unpaid_count || 0, icon: '📋', color: 'var(--warning)', bg: 'var(--warning-soft)' },
            { label: 'Overdue Accounts', value: summary?.overdue_count || 0, icon: '🔴', color: 'var(--danger)', bg: 'var(--danger-soft)' },
            { label: 'Registered Homeowners', value: residents?.length || 0, icon: '🏠', color: 'var(--hoa-color)', bg: 'var(--hoa-soft)' },
            { label: 'Pending Reservations', value: pendingReservations.length, icon: '📅', color: 'var(--accent)', bg: 'var(--accent-soft)' },
          ].map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <div className="stat-value" style={{ color: card.color, fontSize: typeof card.value === 'string' && card.value.length > 6 ? 'var(--font-xl)' : 'var(--font-3xl)' }}>
                  {card.value}
                </div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Revenue chart */}
          <div className="card">
            <div className="section-title">Monthly Revenue Collection</div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                    formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No revenue data</h3></div>
            )}
          </div>

          {/* Overdue accounts */}
          <div className="card">
            <div className="section-title">Overdue Accounts</div>
            {overdueLedgers.length > 0 ? (
              <table className="data-table">
                <thead><tr><th>Resident</th><th>Period</th><th>Amount</th><th>Due</th></tr></thead>
                <tbody>
                  {overdueLedgers.slice(0, 6).map((l: any) => (
                    <tr key={l.id}>
                      <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{l.resident_name}</td>
                      <td>{l.billing_period}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 700 }}>₱{l.amount.toLocaleString()}</td>
                      <td className="text-xs">{l.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🎉</div><h3>No overdue accounts!</h3></div>
            )}
          </div>
        </div>

        {/* Pending reservations */}
        <div className="card">
          <div className="section-title">Pending Facility Reservations</div>
          {pendingReservations.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Facility</th><th>Requested By</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody>
                {pendingReservations.map((r: any) => (
                  <tr key={r.id}>
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.title}</td>
                    <td>{r.facility_name}</td>
                    <td>{r.reserved_by_name}</td>
                    <td className="text-xs">{new Date(r.start_time).toLocaleString('en-PH')}</td>
                    <td className="text-xs">{new Date(r.end_time).toLocaleString('en-PH')}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No pending reservations</h3></div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
