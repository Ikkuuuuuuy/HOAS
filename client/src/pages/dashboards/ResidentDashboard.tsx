import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiCall } from '../../hooks/useApi';

export default function ResidentDashboard() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const { data: myDocs } = useApi<any[]>('/api/documents');
  const { data: myBills } = useApi<any[]>('/api/billing');
  const { data: myReservations } = useApi<any[]>('/api/facilities/reservations');

  const unpaidBills = myBills?.filter(b => b.status === 'unpaid' || b.status === 'overdue') || [];
  const totalDue = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const pendingDocs = myDocs?.filter(d => d.status === 'pending').length || 0;
  const upcomingReservations = myReservations?.filter(r => r.status === 'approved' && new Date(r.start_time) > new Date()) || [];

  const handlePanicButton = async () => {
    if (isSendingAlert) return;
    setIsSendingAlert(true);
    setIsPanicActive(true);
    try {
      await apiCall('/api/alerts', 'POST', {
        alertType: 'panic',
        message: `Emergency assistance needed by ${user?.fullName} at their residence.`,
        location: `${user?.tenantName} — Resident Unit`,
        broadcastTo: 'all',
      }, accessToken || undefined);
      success('🆘 Emergency Alert Sent!', 'Security and Barangay emergency responders have been notified.');
      setTimeout(() => setIsPanicActive(false), 5000);
    } catch (err: any) {
      showError('Alert Failed', err.message);
      setIsPanicActive(false);
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <PageContainer title="My Resident Portal" subtitle={`${user?.tenantName} — ${user?.fullName}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Welcome & Panic */}
        <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(22,78,99,0.15))',
            border: '1px solid rgba(8,145,178,0.3)',
          }}>
            <div className="flex items-center gap-4 mb-6">
              <div style={{ fontSize: '3rem' }}>🏠</div>
              <div>
                <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Welcome Home</h2>
                <p className="text-muted" style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>{user?.fullName}</p>
              </div>
            </div>
            <div className="grid grid-2">
              {[
                { label: 'Pending Documents', value: pendingDocs, color: 'var(--warning)' },
                { label: 'Unpaid Bills', value: unpaidBills.length, color: 'var(--danger)' },
                { label: 'Total Amount Due', value: `₱${totalDue.toLocaleString()}`, color: 'var(--danger)' },
                { label: 'Upcoming Bookings', value: upcomingReservations.length, color: 'var(--success)' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                  <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div className="text-xs text-muted">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Panic button */}
          <div className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: isPanicActive
              ? 'linear-gradient(135deg, rgba(127,29,29,0.4), rgba(153,27,27,0.3))'
              : 'var(--bg-glass)',
            border: isPanicActive ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)',
            textAlign: 'center', gap: 'var(--space-4)',
          }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#FCA5A5' }}>Emergency Panic Button</h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-xs)', marginTop: 4 }}>
                Instantly alerts Security Guards and Barangay Emergency Responders
              </p>
            </div>
            <button
              id="panic-button"
              className={`panic-button ${isPanicActive ? 'pulsing' : ''}`}
              onClick={handlePanicButton}
              disabled={isSendingAlert}
            >
              {isSendingAlert ? '📡 SENDING...' : isPanicActive ? '🆘 ALERT SENT!' : '🆘 PANIC / HELP'}
            </button>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              Fire • Medical • Security • Panic
            </div>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 'var(--space-8)' }}>
          {/* My Bills */}
          <div className="card">
            <div className="section-title">My Bills</div>
            {myBills && myBills.length > 0 ? (
              myBills.slice(0, 4).map((bill: any) => (
                <div key={bill.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{bill.billing_period}</div>
                    <div className="text-xs text-muted">{bill.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: bill.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                      ₱{bill.amount.toLocaleString()}
                    </div>
                    <span className={`badge badge-${bill.status}`}>{bill.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state-icon">💳</div><h3>No bills</h3></div>
            )}
          </div>

          {/* My Documents */}
          <div className="card">
            <div className="section-title">My Document Requests</div>
            {myDocs && myDocs.length > 0 ? (
              myDocs.slice(0, 4).map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {String(doc.doc_type || doc.request_type || doc.title || 'Document').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </div>
                    <div className="text-xs text-muted">{doc.purpose || doc.remarks || 'Standard Request'}</div>
                  </div>
                  <span className={`badge badge-${doc.status}`}>{doc.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📄</div><h3>No requests</h3></div>
            )}
          </div>

          {/* My Bookings */}
          <div className="card">
            <div className="section-title">My Reservations</div>
            {myReservations && myReservations.length > 0 ? (
              myReservations.slice(0, 4).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
                    <div className="text-xs text-muted">{r.facility_name}</div>
                    <div className="text-xs text-muted">{new Date(r.start_time).toLocaleDateString('en-PH')}</div>
                  </div>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No bookings</h3></div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div className="grid grid-4">
            {[
              { icon: '📄', label: 'Request Clearance', href: '/documents', color: 'var(--brgy-color)' },
              { icon: '💳', label: 'Pay Dues', href: '/billing', color: 'var(--hoa-color)' },
              { icon: '📅', label: 'Book Facility', href: '/facilities', color: 'var(--accent)' },
              { icon: '🚨', label: 'View Alerts', href: '/alerts', color: 'var(--danger)' },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="card"
                style={{
                  textAlign: 'center', textDecoration: 'none',
                  background: 'var(--bg-glass-light)', cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'var(--space-3)', padding: 'var(--space-5)',
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = action.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-xl)',
                  background: `${action.color}20`, fontSize: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: action.color,
                }}>
                  {action.icon}
                </div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>
                  {action.label}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
