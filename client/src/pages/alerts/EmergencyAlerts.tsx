import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ALERT_TYPES = [
  { value: 'panic', label: '🆘 Panic / Help', color: '#DC2626', desc: 'Immediate personal danger' },
  { value: 'fire', label: '🔥 Fire', color: '#EA580C', desc: 'Fire or smoke detected' },
  { value: 'medical', label: '🚑 Medical Emergency', color: '#7C3AED', desc: 'Medical assistance needed' },
  { value: 'security', label: '🚔 Security Threat', color: '#B45309', desc: 'Suspicious activity or intrusion' },
];

export default function EmergencyAlerts() {
  const { user, accessToken } = useAuth();
  const { data: alerts, refetch } = useApi<any[]>('/api/alerts');
  const { success, error: showError } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ alertType: 'panic', message: '', location: '', broadcastTo: 'all' });

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time-desc');

  const canResolve = ['barangay_official', 'hoa_admin', 'security_guard', 'super_admin'].includes(user?.roleName || '');
  const canTrigger = true; // All logged-in users can trigger

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall('/api/alerts', 'POST', form, accessToken || undefined);
      success('🚨 Alert Broadcast!', 'Emergency alert has been broadcast to all connected users.');
      setShowModal(false);
      refetch();
    } catch (err: any) {
      showError('Alert Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await apiCall(`/api/alerts/${alertId}/resolve`, 'PATCH', {}, accessToken || undefined);
      success('Alert Resolved', 'Emergency situation marked as resolved.');
      refetch();
    } catch (err: any) {
      showError('Resolve Failed', err.message);
    }
  };

  const alertTypeConfig: Record<string, { emoji: string; color: string }> = {
    panic:    { emoji: '🆘', color: '#DC2626' },
    fire:     { emoji: '🔥', color: '#EA580C' },
    medical:  { emoji: '🚑', color: '#7C3AED' },
    security: { emoji: '🚔', color: '#B45309' },
  };

  const activeAlerts = alerts?.filter(a => a.status === 'active') || [];

  // Filter & Sort Alerts History
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];

    let result = alerts.filter((a: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (a.alert_type || '').toLowerCase().includes(q) ||
        (a.message || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.triggered_by_name || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'time-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'time-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'type-asc') return (a.alert_type || '').localeCompare(b.alert_type || '');
      return 0;
    });

    return result;
  }, [alerts, searchQuery, statusFilter, sortBy]);

  return (
    <PageContainer title="Emergency Alerts" subtitle="Real-Time Broadcast System">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Trigger panel */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(127,29,29,0.2), rgba(17,24,39,0.8))',
          border: '1px solid rgba(239,68,68,0.2)',
          marginBottom: 'var(--space-8)',
        }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: '#FCA5A5' }}>🚨 Emergency Alert Center</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 4 }}>
                Trigger alerts broadcast to all connected Security Guards, Barangay Officials, and HOA Administrators in real-time via SSE.
              </p>
            </div>
            <button
              id="trigger-alert-btn"
              className="btn btn-danger"
              style={{ fontSize: 'var(--font-md)', padding: 'var(--space-4) var(--space-8)', fontWeight: 800 }}
              onClick={() => setShowModal(true)}
            >
              🚨 Trigger Alert
            </button>
          </div>
        </div>

        {/* Alert type cards */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {ALERT_TYPES.map(at => (
            <div key={at.value} className="stat-card" style={{ cursor: 'pointer' }}
              onClick={() => { setForm(f => ({ ...f, alertType: at.value })); setShowModal(true); }}>
              <div className="stat-icon" style={{ background: `${at.color}20`, color: at.color, fontSize: '1.4rem' }}>
                {at.label.split(' ')[0]}
              </div>
              <div>
                <div className="stat-label" style={{ fontWeight: 700, color: at.color, fontSize: 'var(--font-sm)' }}>
                  {at.label.slice(2)}
                </div>
                <div className="text-xs text-muted">{at.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <div className="card" style={{
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(127,29,29,0.08)',
            marginBottom: 'var(--space-6)',
          }}>
            <div className="section-title" style={{ color: 'var(--danger)' }}>
              <span>🚨 Active Emergency Broadcasts ({activeAlerts.length})</span>
            </div>
            {activeAlerts.map((alert: any) => {
              const cfg = alertTypeConfig[alert.alert_type];
              return (
                <div key={alert.id} style={{
                  padding: 'var(--space-4)',
                  background: `${cfg?.color || '#DC2626'}10`,
                  border: `1px solid ${cfg?.color || '#DC2626'}30`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-3)',
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                }}>
                  <div style={{ fontSize: '2rem', flex: 'none', animation: 'pulse 1.5s infinite' }}>{cfg?.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge badge-active" style={{ background: `${cfg?.color}20`, color: cfg?.color, borderRadius: 'var(--radius-full)', padding: '2px 10px' }}>
                        {alert.alert_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted">Broadcast: {alert.broadcast_to}</span>
                      <span className="text-xs text-muted">{new Date(alert.created_at).toLocaleString('en-PH')}</span>
                    </div>
                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{alert.message}</div>
                    {alert.location && <div className="text-xs text-muted mt-2">📍 {alert.location}</div>}
                    <div className="text-xs text-muted mt-1">By: {alert.triggered_by_name}</div>
                  </div>
                  {canResolve && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleResolve(alert.id)}
                      id={`resolve-alert-${alert.id}`}
                    >
                      ✓ Resolve Alert
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SEARCH & SORTING FILTER BAR */}
        <div className="card mb-6" style={{ padding: 16 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 items-center flex-1" style={{ minWidth: 280 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }}>🔍</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Search alert type, message, location, or user..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 160 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="resolved">Resolved Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 180 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="time-desc">Time: Newest First</option>
                <option value="time-asc">Time: Oldest First</option>
                <option value="type-asc">Alert Type (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert history */}
        <div className="card">
          <div className="section-title">Alert History Logs</div>
          {filteredAlerts.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Location</th>
                  <th>Triggered By</th>
                  <th>Broadcast Target</th>
                  <th>Status</th>
                  <th>Time Broadcast</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert: any) => {
                  const cfg = alertTypeConfig[alert.alert_type];
                  return (
                    <tr key={alert.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>{cfg?.emoji}</span>
                          <span style={{ color: cfg?.color, fontWeight: 700, fontSize: 'var(--font-xs)', textTransform: 'uppercase' }}>
                            {alert.alert_type}
                          </span>
                        </div>
                      </td>
                      <td className="truncate" style={{ maxWidth: 200 }}>{alert.message}</td>
                      <td className="text-xs">{alert.location || '—'}</td>
                      <td>{alert.triggered_by_name}</td>
                      <td><span className="badge badge-issued">{alert.broadcast_to}</span></td>
                      <td><span className={`badge badge-${alert.status}`}>{alert.status}</span></td>
                      <td className="text-xs">{new Date(alert.created_at).toLocaleString('en-PH')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>No matching emergency alert records</h3>
              <p>Try adjusting your search query or status filter.</p>
            </div>
          )}
        </div>

        {/* Trigger alert modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🚨 Trigger Emergency Alert</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="card" style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                <div className="text-xs" style={{ color: 'var(--danger)' }}>
                  ⚠️ This alert will be <strong>immediately broadcast</strong> to all connected Security Guards and Barangay Officials via real-time SSE.
                </div>
              </div>
              <form onSubmit={handleTrigger} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Alert Type</label>
                  <div className="grid grid-2">
                    {ALERT_TYPES.map(at => (
                      <div
                        key={at.value}
                        onClick={() => setForm(f => ({ ...f, alertType: at.value }))}
                        style={{
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${form.alertType === at.value ? at.color : 'var(--border)'}`,
                          background: form.alertType === at.value ? `${at.color}20` : 'var(--bg-glass)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{at.label.split(' ')[0]}</span>
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: form.alertType === at.value ? at.color : 'var(--text-primary)' }}>
                          {at.label.slice(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Block 4 Lot 12, Main Ave"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    id="alert-location-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the emergency..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    id="alert-message-input"
                  />
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger" style={{ fontWeight: 800 }} disabled={isSubmitting} id="submit-alert-btn">
                    {isSubmitting ? 'Broadcasting...' : '🚨 Broadcast Emergency Alert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
