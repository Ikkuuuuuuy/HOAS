import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiCall } from '../../hooks/useApi';

export default function ResidentDashboard() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
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

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageContainer
      title="My Homeowner Dashboard"
      subtitle={`${user?.tenantName || 'Northridge Grove Phase 2'} — ${user?.fullName}`}
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
              Homeowner Portal & Services
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              Welcome Home, {user?.fullName?.split(' ')[0] || 'Neighbor'}.
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', maxWidth: 640 }}>
              Access your monthly HOA statement of account, request official Barangay clearances, and reserve community amenities.
            </p>
            <div style={{ marginTop: 12, fontSize: 11.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🕒 {currentDateStr}</span>
              <span>•</span>
              <span style={{ color: '#4ADE80' }}>● Account Active & Verified</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/documents')}
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
              📋 Request Clearance
            </button>
            <button
              type="button"
              onClick={() => navigate('/billing')}
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
              💳 View Statement
            </button>
          </div>
        </div>

        {/* ── 2. METRIC CARDS & PANIC STRIP ── */}
        <div className="grid grid-3" style={{ gap: 16 }}>
          {/* Dues Status */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>HOA Monthly Dues</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Maintenance & Security Fee</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: unpaidBills.length > 0 ? '#FEE2E2' : '#DCFCE7',
                color: unpaidBills.length > 0 ? '#DC2626' : '#166534',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                💳
              </div>
            </div>

            <div style={{
              fontSize: 26, fontWeight: 800,
              color: unpaidBills.length > 0 ? '#DC2626' : '#166534',
              marginBottom: 14
            }}>
              {unpaidBills.length > 0 ? `₱${totalDue.toLocaleString()}` : '₱0.00 Paid'}
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
                <span style={{ color: 'var(--text-secondary)' }}>● Unpaid Invoices</span>
                <strong style={{ color: unpaidBills.length > 0 ? '#DC2626' : '#166534' }}>
                  {unpaidBills.length} Invoices Pending
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>● Payment Channel</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>GCash / HOA Office</span>
              </div>
            </div>
          </div>

          {/* Service Requests */}
          <div className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Service & Clearance Requests</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Gate pass & certifications</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#EFF6FF', color: '#1E40AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                📋
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {myDocs?.length || 0} Submissions
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
                <span style={{ color: 'var(--text-secondary)' }}>● Under Evaluation</span>
                <strong style={{ color: '#D97706' }}>{pendingDocs} Pending</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>● Approved / Ready</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>{(myDocs?.length || 0) - pendingDocs} Completed</span>
              </div>
            </div>
          </div>

          {/* Emergency SOS Panic */}
          <div className="stat-card" style={{
            padding: '20px 22px',
            background: isPanicActive ? '#FEE2E2' : 'var(--bg-surface)',
            border: isPanicActive ? '1px solid #EF4444' : '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Emergency Response</span>
                <span style={{ fontSize: 16 }}>🚨</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Direct panic dispatch to Barangay 174 & Phase 2 Guard House.
              </div>
            </div>

            <button
              id="panic-button"
              type="button"
              onClick={handlePanicButton}
              disabled={isSendingAlert}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                background: isPanicActive ? '#DC2626' : '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSendingAlert ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                marginTop: 12
              }}
            >
              {isSendingAlert ? '📡 SENDING BROADCAST...' : isPanicActive ? '🆘 DISPATCH NOTIFIED!' : '🆘 ONE-TAP EMERGENCY SOS'}
            </button>
          </div>
        </div>

        {/* ── 3. LISTS GRID (Bills, Requests, Reservations) ── */}
        <div className="grid grid-3" style={{ gap: 16 }}>
          {/* Bills Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Billing Invoices
              </h3>
              <button
                type="button"
                onClick={() => navigate('/billing')}
                style={{ fontSize: 11.5, color: '#166534', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>

            <div style={{ padding: '8px 16px' }}>
              {myBills && myBills.length > 0 ? (
                myBills.slice(0, 3).map((bill: any) => (
                  <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{bill.billing_period}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: bill.status === 'paid' ? '#166534' : '#DC2626' }}>
                        ₱{bill.amount.toLocaleString()}
                      </div>
                      <span style={{
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: bill.status === 'paid' ? '#DCFCE7' : '#FEE2E2',
                        color: bill.status === 'paid' ? '#166534' : '#991B1B',
                        fontWeight: 600
                      }}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  No pending invoices found.
                </div>
              )}
            </div>
          </div>

          {/* Service Requests */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Recent Requests
              </h3>
              <button
                type="button"
                onClick={() => navigate('/documents')}
                style={{ fontSize: 11.5, color: '#166534', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>

            <div style={{ padding: '8px 16px' }}>
              {myDocs && myDocs.length > 0 ? (
                myDocs.slice(0, 3).map((doc: any) => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.doc_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.purpose}</div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: doc.status === 'approved' ? '#DCFCE7' : '#FEF3C7',
                      color: doc.status === 'approved' ? '#166534' : '#92400E',
                      fontWeight: 600
                    }}>
                      {doc.status}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  No active requests submitted.
                </div>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Amenity Bookings
              </h3>
              <button
                type="button"
                onClick={() => navigate('/facilities')}
                style={{ fontSize: 11.5, color: '#166534', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Reserve →
              </button>
            </div>

            <div style={{ padding: '8px 16px' }}>
              {myReservations && myReservations.length > 0 ? (
                myReservations.slice(0, 3).map((r: any) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.facility_name}</div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: r.status === 'approved' ? '#DCFCE7' : '#FEF3C7',
                      color: r.status === 'approved' ? '#166534' : '#92400E',
                      fontWeight: 600
                    }}>
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  No upcoming reservations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. QUICK SHORTCUTS ── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Resident Quick Actions
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
            Instant shortcuts for homeowners and family members.
          </div>

          <div className="grid grid-4" style={{ gap: 12 }}>
            {[
              { label: 'Household Members', icon: '👨‍👩‍👧‍👦', path: '/household' },
              { label: 'Request Clearance', icon: '📄', path: '/documents' },
              { label: 'Pay HOA Dues', icon: '💳', path: '/billing' },
              { label: 'Basketball Court', icon: '🏀', path: '/facilities' },
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
