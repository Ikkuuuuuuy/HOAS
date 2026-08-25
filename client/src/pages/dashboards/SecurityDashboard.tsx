import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeAlerts } = useAlerts();
  const { data: visitors } = useApi<any[]>('/api/visitors');
  const { data: stats } = useApi<any>('/api/visitors/stats');

  const currentlyInside = visitors?.filter(v => !v.time_out) || [];
  const todaysVisitors = visitors?.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.time_in).toDateString() === today;
  }) || [];

  const CCTV_CAMERAS = [
    { id: 1, label: 'Main Gate Boom Barrier', status: 'online' },
    { id: 2, label: 'Clubhouse Entrance', status: 'online' },
    { id: 3, label: 'Basketball Court', status: 'online' },
    { id: 4, label: 'Block 3 North Perimeter', status: 'online' },
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageContainer
      title="Security & Gate Operations Center"
      subtitle={`NRG Phase 2 Perimeter & Access Control — ${user?.fullName || 'Security Officer'}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.25s ease' }}>

        {/* ── 1. MINIMALIST HERO BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #111827 50%, #1E293B 100%)',
          borderRadius: 14,
          padding: '24px 28px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94A3B8',
              marginBottom: 4
            }}>
              Gate Pass & Security Monitoring
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              Welcome, Officer {user?.fullName?.split(' ')[0] || 'Guard'}.
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', maxWidth: 640 }}>
              Real-time vehicle license plate logging, visitor QR gate passes, and perimeter alert monitoring.
            </p>
            <div style={{ marginTop: 12, fontSize: 11.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🕒 {currentDateStr}</span>
              <span>•</span>
              <span style={{ color: '#4ADE80' }}>● Perimeter Surveillance Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/visitors')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#166534',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🚗 Gate Visitor Log
            </button>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🚨 Emergency Alerts
            </button>
          </div>
        </div>

        {/* ── 2. STAT CARDS ── */}
        <div className="grid grid-3" style={{ gap: 16 }}>
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Today's Gate Entries</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>24-Hour Cycle</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#EFF6FF', color: '#1E40AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                🚗
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {stats?.total_today ?? todaysVisitors.length} Visitors
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
                <span style={{ color: 'var(--text-secondary)' }}>● Vehicles In</span>
                <strong style={{ color: 'var(--text-primary)' }}>12 Vehicles</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>● Walk-in / Couriers</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>4 Entries</span>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Currently Inside</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Active Gate Passes</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#FEF3C7', color: '#B45309',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                🏠
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: '#D97706', marginBottom: 14 }}>
              {stats?.currently_inside ?? currentlyInside.length} Active
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
                <span style={{ color: 'var(--text-secondary)' }}>● Checked Out Today</span>
                <strong style={{ color: '#166534' }}>{stats?.checked_out ?? 8} Vehicles</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>● Overnight Allowed</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>0 Units</span>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Perimeter Alerts</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Emergency Radio & CCTV</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: activeAlerts.length > 0 ? '#FEE2E2' : '#DCFCE7',
                color: activeAlerts.length > 0 ? '#DC2626' : '#166534',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                🚨
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: activeAlerts.length > 0 ? '#DC2626' : '#166534', marginBottom: 14 }}>
              {activeAlerts.length > 0 ? `${activeAlerts.length} Active` : '0 All Clear'}
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
                <span style={{ color: 'var(--text-secondary)' }}>● CCTV Network</span>
                <strong style={{ color: '#166534' }}>4/4 Feeds Online</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>● Barrier Status</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>Automated Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. CCTV MONITOR & LIVE VISITORS ── */}
        <div className="grid grid-2" style={{ gap: 16 }}>
          {/* CCTV Feeds */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Perimeter CCTV Monitor Grid
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Main Gate & Subdivision Perimeter</div>
              </div>
              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                ● 4 LIVE FEEDS
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {CCTV_CAMERAS.map(cam => (
                <div key={cam.id} style={{
                  aspectRatio: '16/9',
                  background: '#0F172A',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: 8
                }}>
                  <div style={{ fontSize: 20, opacity: 0.6 }}>📹</div>
                  <div style={{ color: '#E2E8F0', fontSize: 10.5, fontWeight: 600, marginTop: 4, textAlign: 'center' }}>
                    {cam.label}
                  </div>
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#22C55E'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Visitor Entries */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Recent Visitor Entries
                </h3>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Live timestamped vehicle entry log</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/visitors')}
                style={{ fontSize: 11.5, color: '#166534', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Logbook →
              </button>
            </div>

            <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visitors && visitors.length > 0 ? (
                visitors.slice(0, 3).map((v: any) => (
                  <div key={v.id} style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitor_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Plate: {v.plate_number || 'No Plate'} • {v.host_resident}</div>
                    </div>
                    <span style={{
                      fontSize: 10.5,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: v.time_out ? '#DCFCE7' : '#EFF6FF',
                      color: v.time_out ? '#166534' : '#1E40AF',
                      fontWeight: 600
                    }}>
                      {v.time_out ? 'OUT' : 'INSIDE'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  No vehicle logs recorded today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. QUICK SHORTCUTS ── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Security Guard Quick Actions
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Instant shortcuts for vehicle entry, gate permits, and emergency response.
          </div>

          <div className="grid grid-4" style={{ gap: 12 }}>
            {[
              { label: 'Issue Gate Pass', icon: '🔑', path: '/visitors' },
              { label: 'Check Permits', icon: '📋', path: '/documents' },
              { label: 'Broadcast Alert', icon: '🚨', path: '/alerts' },
              { label: 'HOA Officers Directory', icon: '🏛️', path: '/officers' },
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{tool.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{tool.label}</span>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>→</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
