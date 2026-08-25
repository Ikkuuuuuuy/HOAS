import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const { activeAlerts } = useAlerts();
  const { data: visitors } = useApi<any[]>('/api/visitors');
  const { data: stats } = useApi<any>('/api/visitors/stats');

  const currentlyInside = visitors?.filter(v => !v.time_out) || [];
  const todaysVisitors = visitors?.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.time_in).toDateString() === today;
  }) || [];

  const CCTV_CAMERAS = [
    { id: 1, label: 'Main Gate', status: 'online' },
    { id: 2, label: 'Clubhouse Front', status: 'online' },
    { id: 3, label: 'Basketball Court', status: 'online' },
    { id: 4, label: 'Pool Area', status: 'online' },
    { id: 5, label: 'Block 3 Street', status: 'online' },
    { id: 6, label: 'Block 5 Street', status: 'offline' },
    { id: 7, label: 'Block 7 Perimeter', status: 'online' },
    { id: 8, label: 'Admin Building', status: 'online' },
  ];

  return (
    <PageContainer title="Security Command Center" subtitle={`Gate & Patrol Management — ${user?.fullName}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Alert status bar */}
        {activeAlerts.length > 0 && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, #7F1D1D, #991B1B)',
            border: '1px solid rgba(239,68,68,0.4)',
            marginBottom: 'var(--space-6)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          }}>
            <div style={{ animation: 'pulse 1s infinite', fontSize: '2rem' }}>🚨</div>
            <div>
              <div style={{ color: '#FCA5A5', fontWeight: 700 }}>ACTIVE EMERGENCY ALERT</div>
              <div style={{ color: '#FECACA', fontSize: 'var(--font-sm)' }}>
                {String(activeAlerts[0]?.alertType || (activeAlerts[0] as any)?.alert_type || 'ALERT').toUpperCase()}: {activeAlerts[0]?.message}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
          {[
            { label: "Today's Visitors", value: stats?.total_today ?? todaysVisitors.length, icon: '🚗', color: 'var(--security-color)', bg: 'var(--security-soft)' },
            { label: 'Currently Inside', value: stats?.currently_inside ?? currentlyInside.length, icon: '🏠', color: 'var(--info)', bg: 'var(--info-soft)' },
            { label: 'Checked Out', value: stats?.checked_out ?? 0, icon: '✅', color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Active Alerts', value: activeAlerts.length, icon: '🚨', color: 'var(--danger)', bg: 'var(--danger-soft)' },
          ].map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
          {/* Live CCTV Grid */}
          <div className="card">
            <div className="section-title">
              CCTV Monitor Grid
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--success)', fontWeight: 600, background: 'var(--success-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                LIVE
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
              {CCTV_CAMERAS.map(cam => (
                <div key={cam.id} style={{
                  aspectRatio: '16/9',
                  background: cam.status === 'online' ? 'linear-gradient(135deg, #0A1628, #1A2A44)' : '#1A1A1A',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${cam.status === 'online' ? 'rgba(37,99,235,0.3)' : 'rgba(100,100,100,0.2)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  fontSize: 'var(--font-xs)',
                  padding: 'var(--space-1)',
                }}>
                  {cam.status === 'online' ? (
                    <>
                      <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>📹</div>
                      <div style={{ color: 'rgba(37,99,235,0.8)', fontSize: '9px', textAlign: 'center', marginTop: 2 }}>
                        {cam.label}
                      </div>
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--success)',
                        animation: 'pulse 2s infinite',
                      }} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '1rem', opacity: 0.3 }}>📷</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center', marginTop: 2 }}>{cam.label}</div>
                      <div style={{ fontSize: '8px', color: 'var(--danger)', marginTop: 2 }}>OFFLINE</div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                Online: {CCTV_CAMERAS.filter(c => c.status === 'online').length}
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
                Offline: {CCTV_CAMERAS.filter(c => c.status === 'offline').length}
              </div>
            </div>
          </div>

          {/* Currently inside */}
          <div className="card">
            <div className="section-title">Currently Inside</div>
            {currentlyInside.length > 0 ? (
              currentlyInside.slice(0, 5).map((v: any) => (
                <div key={v.id} className="flex items-center gap-3" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-full)',
                    background: 'var(--security-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--security-color)', fontSize: '1rem', flexShrink: 0,
                  }}>👤</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{v.visitor_name}</div>
                    <div className="text-xs text-muted">Host: {v.host_name} • {v.purpose}</div>
                  </div>
                  <span className="badge badge-inside">Inside</span>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🏠</div><h3>No active visitors</h3></div>
            )}
          </div>
        </div>

        {/* Recent visitor log */}
        <div className="card">
          <div className="section-title">Recent Visitor Log</div>
          {todaysVisitors.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr><th>Visitor</th><th>Host</th><th>Purpose</th><th>Vehicle</th><th>Time In</th><th>Time Out</th><th>Status</th></tr>
              </thead>
              <tbody>
                {todaysVisitors.slice(0, 8).map((v: any) => (
                  <tr key={v.id}>
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.visitor_name}</td>
                    <td>{v.host_name}</td>
                    <td className="truncate" style={{ maxWidth: 120 }}>{v.purpose}</td>
                    <td>{v.vehicle_plate || '—'}</td>
                    <td className="text-xs">{new Date(v.time_in).toLocaleTimeString('en-PH')}</td>
                    <td className="text-xs">{v.time_out ? new Date(v.time_out).toLocaleTimeString('en-PH') : '—'}</td>
                    <td>
                      <span className={`badge ${v.time_out ? 'badge-resolved' : 'badge-inside'}`}>
                        {v.time_out ? 'Out' : 'Inside'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🚗</div><h3>No visitors today</h3></div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
