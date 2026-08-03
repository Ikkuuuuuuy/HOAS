import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

export default function BarangayDashboard() {
  const { user } = useAuth();
  const { data: documents } = useApi<any[]>('/api/documents');
  const { data: residents } = useApi<any[]>('/api/residents');
  const { data: alerts } = useApi<any[]>('/api/alerts');
  const { data: reservations } = useApi<any[]>('/api/facilities/reservations');

  const pendingDocs = documents?.filter(d => d.status === 'pending').length || 0;
  const approvedDocs = documents?.filter(d => d.status === 'approved').length || 0;
  const issuedDocs = documents?.filter(d => d.status === 'issued').length || 0;
  const indigentResidents = residents?.filter(r => r.indigency_status).length || 0;
  const activeAlerts = alerts?.filter(a => a.status === 'active').length || 0;

  return (
    <PageContainer title="Barangay Dashboard" subtitle={`Barangay 174, Caloocan City — ${user?.fullName}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Welcome */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(6,78,59,0.15))',
          border: '1px solid rgba(5,150,105,0.3)',
          marginBottom: 'var(--space-8)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
        }}>
          <div style={{ fontSize: '3rem' }}>🏛</div>
          <div>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Barangay Command Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 4 }}>
              Manage resident documents, community resources, and emergency response for Barangay 174.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Pending Documents', value: pendingDocs, icon: '📋', color: 'var(--warning)', bg: 'var(--warning-soft)' },
            { label: 'Approved / Awaiting Payment', value: approvedDocs, icon: '✅', color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Certificates Issued', value: issuedDocs, icon: '📜', color: 'var(--info)', bg: 'var(--info-soft)' },
            { label: 'Indigent Residents', value: indigentResidents, icon: '🫂', color: 'var(--brgy-color)', bg: 'var(--brgy-soft)' },
            { label: 'Total Residents', value: residents?.length || 0, icon: '👨‍👩‍👧', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
            { label: 'Active Alerts', value: activeAlerts, icon: '🚨', color: 'var(--danger)', bg: 'var(--danger-soft)' },
            { label: 'Total Alerts (All Time)', value: alerts?.length || 0, icon: '📊', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
            { label: 'Pending Reservations', value: reservations?.filter((r: any) => r.status === 'pending').length || 0, icon: '📅', color: 'var(--accent)', bg: 'var(--accent-soft)' },
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

        {/* Document queue */}
        <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="card">
            <div className="section-title">Document Request Queue</div>
            {documents && documents.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Resident</th><th>Document</th><th>Purpose</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {documents.slice(0, 6).map((doc: any) => (
                    <tr key={doc.id}>
                      <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{doc.requester_name}</td>
                      <td>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          {doc.doc_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="truncate" style={{ maxWidth: 120 }}>{doc.purpose}</td>
                      <td><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No requests</h3></div>
            )}
          </div>

          {/* Resident registry snapshot */}
          <div className="card">
            <div className="section-title">Resident Registry</div>
            {residents && residents.length > 0 ? (
              residents.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex items-center gap-3" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #064E3B, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 'var(--font-sm)', flexShrink: 0,
                  }}>
                    {r.full_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.full_name}</div>
                    <div className="text-xs text-muted truncate">{r.address}</div>
                  </div>
                  {r.indigency_status ? <span className="badge badge-warning">Indigent</span> : null}
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No residents</h3></div>
            )}
          </div>
        </div>

        {/* Document type breakdown */}
        <div className="card">
          <div className="section-title">Document Processing Statistics</div>
          <div className="grid grid-3">
            {[
              { type: 'barangay_clearance', label: 'Barangay Clearance', emoji: '📋', fee: '₱50.00' },
              { type: 'cert_indigency', label: 'Certificate of Indigency', emoji: '🫂', fee: 'Free' },
              { type: 'cert_residency', label: 'Certificate of Residency', emoji: '📄', fee: '₱30.00' },
            ].map(dt => {
              const typeCount = documents?.filter(d => d.doc_type === dt.type).length || 0;
              const issuedCount = documents?.filter(d => d.doc_type === dt.type && d.status === 'issued').length || 0;
              return (
                <div key={dt.type} className="card" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{dt.emoji}</div>
                  <div className="font-bold" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>{dt.label}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>Fee: {dt.fee}</div>
                  <div className="flex gap-4 mt-4">
                    <div>
                      <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{typeCount}</div>
                      <div className="text-xs text-muted">Total</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--success)' }}>{issuedCount}</div>
                      <div className="text-xs text-muted">Issued</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
