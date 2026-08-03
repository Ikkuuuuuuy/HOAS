import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiCall } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';

const DEFAULT_ACCOMPLISHMENTS = [
  {
    id: '1',
    title: 'Solar LED Streetlighting & Road Re-paving Project',
    description: 'Re-paved 1.2km of main avenue roads and installed 30 eco-friendly solar-powered streetlights across Block 3 to Block 7 in Northridge Grove.',
    date_completed: '2025-08-30',
    budget_spent: 320000,
    image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format',
  },
  {
    id: '2',
    title: 'Phase 2 Entryway Gate House & CCTV Security Upgrade',
    description: 'Upgraded gate house with automated RFID barrier gates, high-definition 4K CCTV coverage, and 24/7 guard console.',
    date_completed: '2025-06-15',
    budget_spent: 185000,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop&auto=format',
  },
];

export default function HomeownerPortal() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'financials' | 'requests' | 'events'>('financials');

  // API Data
  const { data: accomplishmentsData } = useApi<any[]>('/api/hoa/accomplishments');
  const { data: financials, refetch: refetchFinancials } = useApi<any>('/api/hoa/financials');
  const { data: requests, refetch: refetchRequests } = useApi<any[]>('/api/hoa/requests');
  const { data: meetings } = useApi<any[]>('/api/hoa/meetings');
  const { data: announcements } = useApi<any[]>('/api/hoa/announcements');

  const accomplishments = (accomplishmentsData && accomplishmentsData.length > 0) ? accomplishmentsData : DEFAULT_ACCOMPLISHMENTS;

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!accomplishments || accomplishments.length === 0) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % accomplishments.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [accomplishments]);

  // Modals & Form states
  const [showVicinityMap, setShowVicinityMap] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'parking_sticker' | 'home_improvement' | 'concern' | 'officer_meeting'>('parking_sticker');

  // Form inputs
  const [payMethod, setPayMethod] = useState('gcash');
  const [reqDetails, setReqDetails] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Form
  const [contactNo, setContactNo] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');

  const myDues = financials?.myDues;
  const communityFin = financials?.communityOverview;

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const unpaid = myDues?.ledgers?.find((l: any) => l.status === 'unpaid' || l.status === 'overdue');
      if (!unpaid) {
        showError('No Outstanding Balance', 'You have no unpaid dues at this time.');
        setShowPaymentModal(false);
        return;
      }

      const result: any = await apiCall('/api/billing/payments', 'POST', {
        ledgerId: unpaid.id,
        paymentMethod: payMethod,
        amount: unpaid.amount + (unpaid.previous_balance || 0),
      }, accessToken || undefined);

      success('Payment Submitted! 💳', `Ref #${result.referenceNo} for ₱${(unpaid.amount + unpaid.previous_balance).toLocaleString()} processed.`);
      setShowPaymentModal(false);
      refetchFinancials();
    } catch (err: any) {
      showError('Payment Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall('/api/hoa/requests', 'POST', {
        requestType,
        details: reqDetails,
        vehicleInfo: requestType === 'parking_sticker' ? vehicleInfo : undefined,
        scheduledAt: requestType === 'officer_meeting' ? scheduledAt : undefined,
      }, accessToken || undefined);

      success('Request Submitted! 📋', 'Your HOA service request has been queued for admin review.');
      setShowRequestModal(false);
      setReqDetails('');
      setVehicleInfo('');
      setScheduledAt('');
      refetchRequests();
    } catch (err: any) {
      showError('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Homeowner Portal" subtitle={`BRIA Northridge Grove HOA — ${user?.fullName || 'Resident'}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* TOP ACCOMPLISHMENTS CAROUSEL */}
        {accomplishments && accomplishments.length > 0 && (
          <div className="card mb-8 overflow-hidden" style={{ padding: 0, border: '1px solid rgba(220,38,38,0.3)', position: 'relative', borderRadius: 16 }}>
            <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
              <img
                src={accomplishments[slideIndex]?.image_url || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format'}
                alt={accomplishments[slideIndex]?.title || 'Accomplishment'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s ease' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(5,8,17,0.95) 0%, rgba(5,8,17,0.4) 60%, transparent 100%)',
                padding: 'var(--space-6)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
              }}>
                <div className="flex items-center gap-3 mb-1">
                  <span style={{ background: '#DC2626', color: '#FFF', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    HOA PROJECT ACCOMPLISHMENT
                  </span>
                  <span className="text-xs text-muted" style={{ color: '#E5E7EB' }}>Completed: {accomplishments[slideIndex]?.date_completed}</span>
                  {accomplishments[slideIndex]?.budget_spent > 0 && (
                    <span className="text-xs font-semibold" style={{ color: '#6EE7B7' }}>
                      Budget: ₱{accomplishments[slideIndex]?.budget_spent?.toLocaleString()}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: '#FFF', lineHeight: 1.2, margin: '4px 0' }}>
                  {accomplishments[slideIndex]?.title}
                </h2>
                <p style={{ color: '#D1D5DB', fontSize: 'var(--font-sm)', margin: 0, maxWidth: 800 }} className="truncate">
                  {accomplishments[slideIndex]?.description}
                </p>
              </div>

              {/* Slide Dots */}
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
                {accomplishments.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    style={{
                      width: i === slideIndex ? 24 : 8, height: 8, borderRadius: 4,
                      background: i === slideIndex ? '#DC2626' : 'rgba(255,255,255,0.4)',
                      border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN LAYOUT: 4-TAB PORTAL (LEFT) + SIDEBAR WIDGETS (RIGHT) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)' }}>
          
          {/* LEFT AREA: 3-TAB NAVIGATION & PANELS */}
          <div>
            {/* Tab Header Buttons */}
            <div className="flex gap-2 mb-6" style={{ background: 'var(--bg-surface)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              {[
                { id: 'financials', label: '💳 Financials & Dues' },
                { id: 'requests', label: '📋 Service Requests' },
                { id: 'events', label: '📅 Events & Agendas' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    background: activeTab === t.id ? '#DC2626' : 'transparent',
                    color: activeTab === t.id ? '#FFFFFF' : 'var(--text-muted)',
                    border: activeTab === t.id ? '1px solid #DC2626' : '1px solid transparent',
                    boxShadow: activeTab === t.id ? '0 4px 14px rgba(220,38,38,0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 2: FINANCIALS (DUES, CASH FLOW & EXPENDITURES) */}
            {activeTab === 'financials' && (
              <div>
                {/* Dues Summary Card */}
                <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>HOA Dues & Assessment Balance</div>
                      <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: (myDues?.grandTotalDue || 3000) > 0 ? '#F87171' : '#34D399' }}>
                        ₱{(myDues?.grandTotalDue || 3000).toLocaleString()}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 700 }} onClick={() => setShowPaymentModal(true)}>
                      💳 Make a Payment
                    </button>
                  </div>

                  <div className="grid grid-2" style={{ background: 'var(--bg-hover)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current Period Dues: </span>
                      <strong className="text-sm" style={{ color: 'var(--text-primary)' }}>₱{(myDues?.totalCurrentDue || 2500).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Previous Balance: </span>
                      <strong className="text-sm" style={{ color: '#D97706' }}>₱{(myDues?.totalPreviousBalance || 500).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* HOA Community Financial Overview */}
                <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)' }}>HOA Financial Status & Reserves Overview</div>
                  <div className="grid grid-3">
                    <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Dues Collected</div>
                      <div className="text-xl font-bold" style={{ color: '#059669' }}>₱{communityFin?.totalCollected?.toLocaleString() || '2,500'}</div>
                    </div>
                    <div style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Expenditures</div>
                      <div className="text-xl font-bold" style={{ color: '#DC2626' }}>₱{communityFin?.totalSpent?.toLocaleString() || '103,950'}</div>
                    </div>
                    <div style={{ background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Net Cash Reserves</div>
                      <div className="text-xl font-bold" style={{ color: '#2563EB' }}>₱{communityFin?.netReserves?.toLocaleString() || '-101,450'}</div>
                    </div>
                  </div>
                </div>

                {/* Expenditures Breakdown Table */}
                <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)' }}>HOA Community Expenditures & Cash Outflows</div>
                  <table className="data-table">
                    <thead>
                      <tr><th>Category</th><th>Title / Description</th><th>Date</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {financials?.expenditures?.map((exp: any) => (
                        <tr key={exp.id}>
                          <td><span className="badge badge-issued" style={{ textTransform: 'capitalize' }}>{exp.category}</span></td>
                          <td>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{exp.title}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{exp.description}</div>
                          </td>
                          <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{exp.date_spent}</td>
                          <td className="font-bold" style={{ color: '#DC2626' }}>₱{exp.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: REQUESTS & SCHEDULING */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="section-title" style={{ margin: 0, color: 'var(--text-primary)' }}>My HOA Service Requests</div>
                  <button className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }} onClick={() => setShowRequestModal(true)}>
                    + Submit New Request
                  </button>
                </div>

                <div className="grid grid-3 mb-6">
                  {[
                    { title: 'Parking Sticker', desc: 'RFID sticker application for gate entry', icon: '🚗' },
                    { title: 'Home Improvement', desc: 'Permit for fencing, roofing, & repairs', icon: '🏗' },
                    { title: 'Schedule Officer Meeting', desc: 'Request 1-on-1 meeting with HOA officers', icon: '🤝' },
                  ].map((r, i) => (
                    <div key={i} className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setShowRequestModal(true)}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>{r.icon}</div>
                      <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)' }}>Request History & Status</div>
                  <table className="data-table">
                    <thead>
                      <tr><th>Type</th><th>Details</th><th>Scheduled / Info</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {requests?.map((req: any) => (
                        <tr key={req.id}>
                          <td><span className="badge badge-issued" style={{ textTransform: 'capitalize' }}>{req.request_type.replace(/_/g, ' ')}</span></td>
                          <td className="truncate" style={{ maxWidth: 180, color: 'var(--text-primary)' }}>{req.details}</td>
                          <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.vehicle_info || req.scheduled_at || '—'}</td>
                          <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                          <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(req.created_at).toLocaleDateString('en-PH')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!requests || requests.length === 0) && (
                    <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No requests submitted</h3></div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: EVENTS, ANNOUNCEMENTS & MEETINGS */}
            {activeTab === 'events' && (
              <div>
                <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)' }}>📢 Community Announcements & Agendas</div>
                  {announcements?.map((ann: any) => (
                    <div key={ann.id} style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`badge badge-${ann.category === 'urgent' ? 'rejected' : 'issued'}`}>{ann.category}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(ann.created_at).toLocaleDateString('en-PH')}</span>
                      </div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ann.title}</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: QUICK LINKS, VICINITY MAP & CALENDAR */}
          <div>
            {/* Quick Links Card */}
            <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="section-title" style={{ color: 'var(--text-primary)' }}>🔗 Quick Links</div>
              <div className="flex flex-col gap-2">
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', background: 'rgba(220,38,38,0.08)', border: '1px solid #DC2626', color: '#DC2626', fontWeight: 700 }} onClick={() => window.location.href = '/#map-&-amenities'}>
                  🗺 View Map on Home Page
                </button>
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }} onClick={() => alert('Downloading BRIA Northridge Grove By-Laws PDF...')}>
                  📖 HOA By-Laws & Building Rules
                </button>
                <button className="btn btn-secondary w-full text-danger" style={{ justifyContent: 'flex-start' }} onClick={() => alert('Hotlines: Gate Guard: (02) 8987-6543 | Police CSJDM: 911')}>
                  📞 Emergency Hotlines
                </button>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="section-title" style={{ color: 'var(--text-primary)' }}>📅 Calendar Events</div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>August 2026</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 4 }}>• Aug 10: Pool Maintenance</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>• Aug 17: Board Meeting</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
