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
    <PageContainer title="HOA Finance & Data Analytics" subtitle={`NRG PH2 HOA INC Phase 2 — ${user?.fullName || 'Administrator'}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Welcome Banner */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(22,101,52,0.25), rgba(8,12,20,0.85))',
          border: '1px solid rgba(34,197,94,0.4)',
          marginBottom: 'var(--space-8)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', flexShrink: 0 }}>
            <img src="/nrg-ph2-logo.png" alt="NRG PH2 Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: '#FFFFFF' }}>NRG PH2 Financial & Profiling Analytics</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-sm)', marginTop: 4 }}>
              Real-time monitoring of Phase 2 dues collection, financial reports, and household member demographics.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: '#22C55E' }}>
              ₱142,500
            </div>
            <div className="text-xs text-muted">August Dues Collected</div>
          </div>
        </div>

        {/* FINANCIAL & PROFILING STAT CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Collected', value: '₱142,500', icon: '💰', color: '#166534', bg: 'rgba(22,101,52,0.15)' },
            { label: 'Collection Efficiency', value: '88.4%', icon: '📈', color: '#2563EB', bg: 'rgba(37,99,235,0.15)' },
            { label: 'Outstanding Balance', value: '₱32,500', icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
            { label: 'Overdue Balance', value: '₱7,500', icon: '🔴', color: '#DC2626', bg: 'rgba(220,38,38,0.15)' },
            { label: 'Total Registered Residents', value: '731 Members', icon: '👥', color: '#166534', bg: 'rgba(22,101,52,0.15)' },
            { label: 'Heads of Household', value: '312 Units', icon: '🏠', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
            { label: 'Dependents / Youth', value: '348 Members', icon: '🧒', color: '#2563EB', bg: 'rgba(37,99,235,0.15)' },
            { label: 'Senior Citizens / PWD', value: '71 Members', icon: '👴', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
          ].map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <div className="stat-value" style={{ color: card.color, fontSize: typeof card.value === 'string' && card.value.length > 7 ? 'var(--font-xl)' : 'var(--font-3xl)' }}>
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
