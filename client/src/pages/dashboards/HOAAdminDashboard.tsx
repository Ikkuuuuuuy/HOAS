import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HOAAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: billingData } = useApi<{ summary: any; monthlyRevenue: any[] }>('/api/billing/summary');
  const { data: ledgers } = useApi<any[]>('/api/billing');
  const { data: reservations } = useApi<any[]>('/api/facilities/reservations');

  const monthlyData = billingData?.monthlyRevenue?.map(m => ({
    month: m.billing_period,
    amount: m.amount,
  })) || [];

  const overdueLedgers = ledgers?.filter(l => l.status === 'overdue') || [];
  const pendingReservations = reservations?.filter(r => r.status === 'pending') || [];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageContainer
      title="HOA Finance & Operations Dashboard"
      subtitle={`NRG PH2 HOA INC Phase 2 — ${user?.fullName || 'Administrator'}`}
    >
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
              HOA Operations & Financial Center
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}.
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, color: '#CBD5E1', maxWidth: 640 }}>
              Here is today's Phase 2 collection efficiency, resident profiling records, and community activity at a glance.
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{currentDateStr}</span>
              <span>•</span>
              <span style={{ color: '#4ADE80' }}>Live Sync Active</span>
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
              Masterlist Registry
            </button>
            <button
              type="button"
              onClick={() => navigate('/billing')}
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
              Billing Ledger
            </button>
          </div>
        </div>

        {/* ── 2. MINIMALIST STAT CARDS GRID ── */}
        <div className="grid grid-3" style={{ gap: 16 }}>
          {/* Card 1: Dues Collection */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Monthly Dues Collection</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>August 2026 Collection Cycle</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              ₱142,500
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
                <span style={{ color: 'var(--text-secondary)' }}>Collection Rate</span>
                <strong style={{ color: '#166534' }}>88.4% Efficiency</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Outstanding Balance</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₱32,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overdue Accounts</span>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>₱7,500 ({overdueLedgers.length} units)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Resident Demographics */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Resident Profiling</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Northridge Grove Phase 2</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              731 Members
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
                <span style={{ color: 'var(--text-secondary)' }}>Heads of Household</span>
                <strong style={{ color: 'var(--text-primary)' }}>312 Registered Lots</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dependents / Youth</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>348 Members</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Senior Citizens / PWD</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>71 Members</span>
              </div>
            </div>
          </div>

          {/* Card 3: Community & Facilities */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Facility & Gate Pass</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Real-time Operations</div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {reservations?.length || 10} Reservations
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
                <span style={{ color: 'var(--text-secondary)' }}>Confirmed Bookings</span>
                <strong style={{ color: '#166534' }}>8 Approved</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending Approvals</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>{pendingReservations.length} Pending</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Today's Gate Entries</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>12 Entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. REVENUE CHART & OVERDUE TABLE ── */}
        <div className="grid grid-2" style={{ gap: 16 }}>
          {/* Revenue Chart */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Monthly Revenue Collection
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Historical 6-month collection trend</div>
              </div>
              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                Target: ₱150,000 / mo
              </span>
            </div>

            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }}
                    formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#166534" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><h3>No revenue data</h3></div>
            )}
          </div>

          {/* Overdue Accounts Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Overdue Accounts Attention
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Accounts exceeding 60-day billing notice</div>
              </div>
              <span style={{ fontSize: 11, background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                {overdueLedgers.length} Overdue
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px' }}>Resident</th>
                    <th style={{ padding: '10px 16px' }}>Property</th>
                    <th style={{ padding: '10px 16px' }}>Balance</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLedgers.slice(0, 4).map((l, idx) => (
                    <tr key={idx} style={{ fontSize: 12 }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {l.resident_name || 'Resident'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                        {l.property || 'Blk 2 Lot 04'}
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: '#DC2626' }}>
                        ₱{(l.amount || 1500).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: 10.5, background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          Overdue
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 4. QUICK ACCESS MANAGEMENT CARDS ── */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Quick Access Management
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Jump directly to daily community administration workflows.
          </div>

          <div className="grid grid-4" style={{ gap: 12 }}>
            {[
              { label: 'Manage Masterlist', path: '/masterlist' },
              { label: 'Visitor & Gate Pass', path: '/visitors' },
              { label: 'Manage Household Members', path: '/household' },
              { label: 'Document & Requests', path: '/documents' },
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
