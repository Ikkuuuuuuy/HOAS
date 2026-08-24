import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiCall } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import PendingApprovalWelcomePage from './PendingApprovalWelcomePage';

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

/* ── Mini Calendar Component ─────────────────────────────────── */
function MiniCalendar({ eventDays }: { eventDays: number[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; type: 'prev' | 'current' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'current' });
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, type: 'next' });

  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12, textAlign: 'center' }}>{monthName}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 28px)', gap: '2px 0', justifyContent: 'center' }}>
        {DOW.map(d => (
          <div key={d} style={{ width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{d}</div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.type === 'current' && cell.day === today;
          const hasEvent = cell.type === 'current' && eventDays.includes(cell.day);
          return (
            <div
              key={i}
              className={`mini-cal-day${isToday ? ' today' : ''}${hasEvent && !isToday ? ' has-event' : ''}${cell.type !== 'current' ? ' other-month' : ''}`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} /> Today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} /> Event
        </div>
      </div>
    </div>
  );
}

export default function HomeownerPortal() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  if (user?.status === 'pending_approval' || user?.status === 'pending' || user?.status === 'rejected') {
    return <PendingApprovalWelcomePage />;
  }

  const [activeTab, setActiveTab] = useState<'financials' | 'events'>('financials');
  const tabsRef = useRef<HTMLDivElement>(null);

  // API Data
  const { data: accomplishmentsData } = useApi<any[]>('/api/hoa/accomplishments');
  const { data: financials, refetch: refetchFinancials } = useApi<any>('/api/hoa/financials');
  const { data: requests, refetch: refetchRequests } = useApi<any[]>('/api/hoa/requests');
  const { data: meetings } = useApi<any[]>('/api/hoa/meetings');
  const { data: announcements } = useApi<any[]>('/api/hoa/announcements');
  const { data: householdMembers } = useApi<any[]>('/api/household');

  const accomplishments = (accomplishmentsData && accomplishmentsData.length > 0) ? accomplishmentsData : DEFAULT_ACCOMPLISHMENTS;

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  useEffect(() => {
    if (!accomplishments || accomplishments.length === 0) return;
    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += 1;
      setSlideProgress(progress);
      if (progress >= 100) {
        progress = 0;
        setSlideProgress(0);
        setSlideIndex(prev => (prev + 1) % accomplishments.length);
      }
    }, 50);
    return () => clearInterval(progressTimer);
  }, [accomplishments]);

  // Modals & Form states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'parking_sticker' | 'home_improvement' | 'concern' | 'officer_meeting'>('parking_sticker');

  // Form inputs
  const [payMethod, setPayMethod] = useState('gcash');
  const [reqDetails, setReqDetails] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myDues = financials?.myDues;
  const communityFin = financials?.communityOverview;
  const isOverdue = (myDues?.grandTotalDue || 3000) > 0;

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
      setReqDetails(''); setVehicleInfo(''); setScheduledAt('');
      refetchRequests();
    } catch (err: any) {
      showError('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Homeowner Portal" subtitle={`NRG PH2 HOA INC — ${user?.fullName || 'Phase 2 Resident'}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* ── TOP ACCOMPLISHMENTS CAROUSEL ── */}
        {accomplishments && accomplishments.length > 0 && (
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 28, border: '1px solid rgba(220,38,38,0.25)', boxShadow: '0 4px 24px rgba(220,38,38,0.12)' }}>
            <div style={{ position: 'relative', height: 270, overflow: 'hidden' }}>
              {accomplishments.map((acc: any, i: number) => (
                <div
                  key={acc.id}
                  style={{
                    position: 'absolute', inset: 0,
                    opacity: i === slideIndex ? 1 : 0,
                    transition: 'opacity 0.7s ease',
                  }}
                >
                  <img
                    src={acc.image_url || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format'}
                    alt={acc.title || 'Accomplishment'}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(5,8,17,0.97) 0%, rgba(5,8,17,0.5) 55%, transparent 100%)',
                    padding: 'var(--space-6)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#FFF', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.06em' }}>
                        HOA PROJECT ACCOMPLISHMENT
                      </span>
                      <span style={{ color: '#E5E7EB', fontSize: 12 }}>Completed: {acc.date_completed}</span>
                      {acc.budget_spent > 0 && (
                        <span style={{ color: '#6EE7B7', fontSize: 12, fontWeight: 700 }}>
                          Budget: ₱{acc.budget_spent?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#FFF', lineHeight: 1.2, margin: '4px 0', letterSpacing: '-0.02em' }}>
                      {acc.title}
                    </h2>
                    <p style={{ color: '#CBD5E1', fontSize: 'var(--font-sm)', margin: 0, maxWidth: 800 }} className="truncate">
                      {acc.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Progress Bars */}
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
                {accomplishments.map((_: any, i: number) => (
                  <div key={i} style={{ height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.25)', width: i === slideIndex ? 52 : 28, transition: 'width 0.3s ease' }}>
                    <div style={{
                      height: '100%',
                      width: i === slideIndex ? `${slideProgress}%` : (i < slideIndex ? '100%' : '0%'),
                      background: i === slideIndex ? '#DC2626' : 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      transition: i === slideIndex ? 'none' : 'width 0.3s ease',
                    }} />
                  </div>
                ))}
              </div>

              {/* Nav Arrows */}
              {accomplishments.length > 1 && (
                <>
                  <button
                    onClick={() => setSlideIndex(prev => (prev - 1 + accomplishments.length) % accomplishments.length)}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >‹</button>
                  <button
                    onClick={() => setSlideIndex(prev => (prev + 1) % accomplishments.length)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >›</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MAIN LAYOUT: LEFT CONTENT + RIGHT SIDEBAR ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)' }}>

          {/* LEFT AREA */}
          <div>
            {/* Premium Tab Navigation */}
            <div
              ref={tabsRef}
              className="flex gap-2 mb-6"
              style={{ background: 'var(--bg-surface)', padding: '6px', borderRadius: 14, border: '1px solid var(--border)' }}
            >
              {[
                { id: 'financials', label: '💳 Financials & Dues', icon: '💳' },
                { id: 'events', label: '📅 Events & Agendas', icon: '📅' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`portal-tab-btn${activeTab === t.id ? ' active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── FINANCIALS TAB ── */}
            {activeTab === 'financials' && (
              <div style={{ animation: 'fadeInUp 0.3s ease' }}>

                {/* Dues Balance Card — Clean Modern Layout */}
                <div
                  className="dues-gradient-card mb-6"
                  style={{
                    padding: '24px 28px',
                    borderLeft: isOverdue ? '5px solid #DC2626' : '5px solid #166534',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            background: isOverdue ? 'rgba(220,38,38,0.1)' : 'rgba(22,101,52,0.1)',
                            color: isOverdue ? '#DC2626' : '#166534',
                            border: `1px solid ${isOverdue ? 'rgba(220,38,38,0.25)' : 'rgba(22,101,52,0.25)'}`,
                          }}
                        >
                          {isOverdue && <span className="dues-pulse-dot" />}
                          {isOverdue ? 'Outstanding Balance Due' : 'Account in Good Standing'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                          Billing Cycle: Monthly Assessment
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                          ₱{(myDues?.grandTotalDue || 3000).toLocaleString()}
                        </div>
                        {isOverdue && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>
                            (Pay immediately to avoid penalties)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Assessment</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>₱{(myDues?.totalCurrentDue || 2500).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Previous Arrears</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: (myDues?.totalPreviousBalance || 500) > 0 ? '#DC2626' : 'var(--text-primary)', marginTop: 2 }}>
                            ₱{(myDues?.totalPreviousBalance || 500).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn btn-lg"
                        style={{
                          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: 14,
                          borderRadius: 12,
                          padding: '12px 24px',
                          cursor: 'pointer',
                          border: 'none',
                          boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setShowPaymentModal(true)}
                      >
                        💳 Make Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Community Financial Overview — Gradient Pills */}
                <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 16 }}>HOA Financial Status & Reserves Overview</div>
                  <div className="grid grid-3">
                    <div className="fin-pill-green">
                      <div style={{ fontSize: 18, marginBottom: 6 }}>💚</div>
                      <div className="text-xs font-semibold" style={{ color: '#6EE7B7', marginBottom: 4 }}>Dues Collected</div>
                      <div style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: '#34D399', letterSpacing: '-0.02em' }}>₱{communityFin?.totalCollected?.toLocaleString() || '2,500'}</div>
                    </div>
                    <div className="fin-pill-red">
                      <div style={{ fontSize: 18, marginBottom: 6 }}>📊</div>
                      <div className="text-xs font-semibold" style={{ color: '#FCA5A5', marginBottom: 4 }}>Expenditures</div>
                      <div style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: '#F87171', letterSpacing: '-0.02em' }}>₱{communityFin?.totalSpent?.toLocaleString() || '103,950'}</div>
                    </div>
                    <div className="fin-pill-blue">
                      <div style={{ fontSize: 18, marginBottom: 6 }}>🏦</div>
                      <div className="text-xs font-semibold" style={{ color: '#93C5FD', marginBottom: 4 }}>Net Reserves</div>
                      <div style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: '#60A5FA', letterSpacing: '-0.02em' }}>₱{communityFin?.netReserves?.toLocaleString() || '-101,450'}</div>
                    </div>
                  </div>
                </div>

                {/* Expenditures Table */}
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
                          <td style={{ fontWeight: 900, color: '#F87171', letterSpacing: '-0.01em' }}>₱{exp.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!financials?.expenditures || financials.expenditures.length === 0) && (
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
                      <h3>No Expenditures Yet</h3>
                      <p>Community expense records will appear here once available.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── EVENTS TAB ── */}
            {activeTab === 'events' && (
              <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="section-title" style={{ color: 'var(--text-primary)' }}>📢 Community Announcements & Agendas</div>
                  {announcements?.length ? announcements.map((ann: any) => (
                    <div key={ann.id} style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`badge badge-${ann.category === 'urgent' ? 'rejected' : 'issued'}`}>{ann.category}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(ann.created_at).toLocaleDateString('en-PH')}</span>
                      </div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ann.title}</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{ann.content}</p>
                    </div>
                  )) : (
                    <div className="empty-state" style={{ padding: '28px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📢</div>
                      <h3>No Announcements Yet</h3>
                      <p>Community announcements will appear here once posted by the HOA board.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div>

            {/* Service Request Button */}
            <button
              className="btn btn-primary w-full mb-6"
              style={{
                background: 'linear-gradient(135deg, #166534, #15803D)',
                border: 'none', borderRadius: 12, padding: '13px',
                fontWeight: 800, fontSize: 14,
                boxShadow: '0 4px 16px rgba(22,101,52,0.35)',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onClick={() => setShowRequestModal(true)}
            >
              📋 Submit HOA Service Request
            </button>

            {/* Downloadable Association Forms */}
            <div className="card mb-4 hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 12 }}>📄 Official Association Forms</div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'HOA Membership Registration Form', icon: '📝', color: '#DC2626' },
                  { name: 'Vehicle RFID Sticker Application', icon: '🚗', color: '#1D4ED8' },
                  { name: 'Renovation & Construction Guidelines', icon: '🏗️', color: '#D97706' },
                  { name: 'Homeowner Account Profile Form', icon: '👤', color: '#166534' },
                ].map(form => (
                  <button
                    key={form.name}
                    className="btn btn-secondary w-full hover-lift"
                    style={{ justifyContent: 'flex-start', fontSize: 12, fontWeight: 700, borderRadius: 10, gap: 10 }}
                    onClick={() => alert(`Downloading official ${form.name} (PDF)...`)}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: `${form.color}20`, border: `1px solid ${form.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{form.icon}</span>
                    <span className="truncate">{form.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Household Members */}
            <div className="card mb-4 hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="flex justify-between items-center mb-3">
                <div className="section-title" style={{ margin: 0, color: 'var(--text-primary)' }}>👨‍👩‍👧‍👦 Household Members</div>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ background: 'linear-gradient(135deg,#166534,#15803D)', border: 'none', fontWeight: 800, fontSize: 11, borderRadius: 8 }}
                  onClick={() => navigate('/household')}
                >
                  Manage →
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {(householdMembers && householdMembers.length > 0 ? householdMembers.slice(0, 4) : [
                  { id: '1', full_name: 'Juan Dela Cruz', relationship: 'Head of Household (Owner)', age: 42 },
                  { id: '2', full_name: 'Maria Dela Cruz', relationship: 'Spouse', age: 39 },
                  { id: '3', full_name: 'Carlo Dela Cruz', relationship: 'Dependent (Child)', age: 14 },
                ]).map((m: any) => {
                  const parts = (m.full_name || 'HM').trim().split(' ');
                  const initials = parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  const color = m.relationship?.includes('Head') ? '#DC2626' : (m.relationship?.includes('Spouse') ? '#166534' : '#1D4ED8');

                  return (
                    <div
                      key={m.id || m.full_name}
                      onClick={() => navigate('/household')}
                      style={{
                        padding: '9px 12px',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = color; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, #1F2937)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#FFFFFF', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.full_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.relationship} {m.age !== undefined && m.age !== null ? `· ${m.age} yrs` : ''}
                        </div>
                      </div>
                      {m.is_emergency_contact === 1 && (
                        <span title="Emergency Contact" style={{ fontSize: 12 }}>🚨</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/household')}
                  style={{ background: 'none', border: 'none', color: '#166534', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View full household directory ({householdMembers?.length || 3}) →
                </button>
              </div>
            </div>

            {/* HOA Officers & Leadership Roster Quick Card */}
            <div className="card mb-4 hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="section-title" style={{ color: 'var(--text-primary)', margin: 0 }}>🏛️ HOA Officers & Leaders</div>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ background: '#166534', borderColor: '#166534', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6 }}
                  onClick={() => navigate('/officers')}
                >
                  Directory →
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div style={{ padding: '8px 10px', background: 'rgba(220,38,38,0.06)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626' }}>👑 HOA PRESIDENT</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Rey Mar Villanueva</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(37,99,235,0.06)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#2563EB' }}>🏛️ VICE PRESIDENT</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Cezar Climaco</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(22,101,52,0.06)', borderRadius: 8, border: '1px solid rgba(22,101,52,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>💰 TREASURER</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Alma Valdezco</div>
                </div>
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/officers')}
                  style={{ background: 'none', border: 'none', color: '#166534', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View all 24 Officers, Block Leaders & Committees →
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card mb-4 hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 12 }}>🔗 Quick Links</div>
              <div className="flex flex-col gap-2">
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626', fontWeight: 800, borderRadius: 10 }} onClick={() => window.location.href = '/#map-amenities'}>
                  🗺 View Map on Home Page →
                </button>
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', borderRadius: 10 }} onClick={() => alert('Downloading NRG PH2 HOA INC By-Laws PDF...')}>
                  📖 HOA By-Laws & Building Rules
                </button>
                <button className="btn btn-secondary w-full text-danger" style={{ justifyContent: 'flex-start', borderRadius: 10 }} onClick={() => alert('Hotlines: Gate Guard: (02) 8987-6543 | Police CSJDM: 911')}>
                  📞 Emergency Hotlines
                </button>
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="section-title" style={{ color: 'var(--text-primary)', margin: 0 }}>📅 Calendar Events</div>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6 }}
                  onClick={() => navigate('/events')}
                >
                  View All →
                </button>
              </div>
              <div onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
                <MiniCalendar eventDays={[17, 22, 28, 30]} />
              </div>
              <div style={{ marginTop: 14, padding: '12px', background: 'var(--bg-hover)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-2">
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upcoming</div>
                  <span style={{ fontSize: 10.5, color: '#166534', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/events')}>Full Calendar →</span>
                </div>
                {[
                  { day: 22, label: 'Pool Maintenance', color: '#D97706' },
                  { day: 28, label: 'Annual General Assembly', color: '#7C3AED' },
                  { day: 30, label: 'Eco-Clean Up Drive', color: '#166534' },
                ].map(ev => (
                  <div
                    key={ev.label}
                    onClick={() => navigate('/events')}
                    className="flex items-center gap-2"
                    style={{ marginBottom: 7, cursor: 'pointer', padding: '3px 0' }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Aug {ev.day} — {ev.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT MODAL ── */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '100%', animation: 'scaleIn 0.22s ease' }}>
              <div className="modal-header">
                <div className="modal-title">💳 Submit HOA Payment</div>
                <button onClick={() => setShowPaymentModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleMakePayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">Total Due</label>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#F87171', letterSpacing: '-0.02em' }}>
                      ₱{(myDues?.grandTotalDue || 3000).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option value="gcash">GCash</option>
                      <option value="maya">Maya (PayMaya)</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash — HOA Office</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', border: 'none', fontWeight: 800 }}>
                    {isSubmitting ? 'Processing...' : '✓ Confirm Payment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── SERVICE REQUEST MODAL ── */}
        {showRequestModal && (
          <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '100%', animation: 'scaleIn 0.22s ease' }}>
              <div className="modal-header">
                <div className="modal-title">📋 HOA Service Request</div>
                <button onClick={() => setShowRequestModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">Request Type</label>
                    <select className="form-select" value={requestType} onChange={e => setRequestType(e.target.value as any)}>
                      <option value="parking_sticker">🚗 Vehicle RFID / Parking Sticker</option>
                      <option value="home_improvement">🏗️ Home Improvement Permit</option>
                      <option value="concern">⚠️ Community Concern / Complaint</option>
                      <option value="officer_meeting">📅 Schedule Officer Meeting</option>
                    </select>
                  </div>
                  {requestType === 'parking_sticker' && (
                    <div>
                      <label className="form-label">Vehicle Info (Plate No., Model)</label>
                      <input className="form-input" value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} placeholder="e.g. ABC 1234 — Toyota Vios 2022" />
                    </div>
                  )}
                  {requestType === 'officer_meeting' && (
                    <div>
                      <label className="form-label">Preferred Schedule</label>
                      <input type="datetime-local" className="form-input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                    </div>
                  )}
                  <div>
                    <label className="form-label">Details & Description</label>
                    <textarea className="form-textarea" rows={4} required value={reqDetails} onChange={e => setReqDetails(e.target.value)} placeholder="Describe your request in detail..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg,#166534,#15803D)', border: 'none', fontWeight: 800 }}>
                    {isSubmitting ? 'Submitting...' : '✓ Submit Request to HOA Board'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
