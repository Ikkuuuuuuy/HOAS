import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface PaymentRecord {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  amount: string;
  channel: string;
  refNo: string;
}

interface StatementRecord {
  id: string;
  monthYear: string;
  dateStr: string;
  amount: string;
  dueDate: string;
  status: 'Paid' | 'Current Due';
  breakdown: { item: string; cost: number }[];
}

const INITIAL_STATEMENTS: StatementRecord[] = [
  {
    id: 'stmt-09-2026',
    monthYear: 'September 2026',
    dateStr: '09/03/26',
    amount: 'Php 3,000.00',
    dueDate: 'September 26, 2026',
    status: 'Current Due',
    breakdown: [
      { item: 'Current Assessment (Monthly HOA Association Dues)', cost: 2500 },
      { item: 'Previous Arrears (Security & Common Maintenance)', cost: 500 },
    ]
  },
  {
    id: 'stmt-08-2026',
    monthYear: 'August 2026',
    dateStr: '08/03/26',
    amount: 'Php 2,500.00',
    dueDate: 'August 26, 2026',
    status: 'Paid',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
  {
    id: 'stmt-07-2026',
    monthYear: 'July 2026',
    dateStr: '07/03/26',
    amount: 'Php 2,500.00',
    dueDate: 'July 26, 2026',
    status: 'Paid',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
  {
    id: 'stmt-06-2026',
    monthYear: 'June 2026',
    dateStr: '06/03/26',
    amount: 'Php 2,500.00',
    dueDate: 'June 26, 2026',
    status: 'Paid',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
  {
    id: 'stmt-05-2026',
    monthYear: 'May 2026',
    dateStr: '05/03/26',
    amount: 'Php 2,500.00',
    dueDate: 'May 26, 2026',
    status: 'Paid',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
  {
    id: 'stmt-04-2026',
    monthYear: 'April 2026',
    dateStr: '04/03/26',
    amount: 'Php 2,500.00',
    dueDate: 'April 26, 2026',
    status: 'Paid',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: 'p-1', title: 'GCash QR — Monthly HOA Dues & Security', date: '08/23/26', rawDate: '2026-08-23', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-884219' },
  { id: 'p-2', title: 'Maya Wallet — Monthly HOA Assessment', date: '07/25/26', rawDate: '2026-07-25', amount: 'Php 2,500.00', channel: 'Maya', refNo: 'HOA-772911' },
  { id: 'p-3', title: 'Visa / Mastercard — Portal Dues Settlement', date: '06/26/26', rawDate: '2026-06-26', amount: 'Php 2,500.00', channel: 'Credit Card', refNo: 'HOA-661024' },
  { id: 'p-4', title: 'BDO Online Bills Payment — Dues Settlement', date: '05/19/26', rawDate: '2026-05-19', amount: 'Php 2,500.00', channel: 'Bank Transfer', refNo: 'HOA-553190' },
  { id: 'p-5', title: 'UnionBank Transfer — HOA Maintenance & Patrol', date: '04/21/26', rawDate: '2026-04-21', amount: 'Php 2,500.00', channel: 'Bank Transfer', refNo: 'HOA-440918' },
  { id: 'p-6', title: 'Clubhouse Cashier OTC — Official Receipt', date: '03/24/26', rawDate: '2026-03-24', amount: 'Php 2,500.00', channel: 'Cashier OTC', refNo: 'HOA-332901' },
];

export default function BillingLedger() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const isStaffOrAdmin = ['hoa_admin', 'admin_staff', 'super_admin', 'barangay_official'].includes(user?.roleName || '');

  // Tab State: 'statement' | 'payments' | 'admin_ledger'
  const [activeTab, setActiveTab] = useState<'statement' | 'payments' | 'admin_ledger'>('statement');

  // Amount & Dues Status (Default 3,000 = 2,500 Current Assessment + 500 Previous Arrears)
  const [amountDue, setAmountDue] = useState<number>(() => {
    const stateAmount = (location?.state as any)?.amountDue;
    if (stateAmount && Number(stateAmount) > 0) return Number(stateAmount);

    const saved = localStorage.getItem('nrg_hoa_amount_due') ?? localStorage.getItem('nrg_pldt_amount_due');
    if (saved !== null) {
      const parsed = Number(saved);
      // Migrate legacy 2699 to official 3000
      if (parsed === 2699) return 3000.00;
      return parsed;
    }
    return 3000.00;
  });

  const [paymentList, setPaymentList] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('nrg_hoa_payment_history') || localStorage.getItem('nrg_pldt_payment_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize any legacy PLDT entries and migrate 2,699 to authentic dues
          return parsed.map((item: any) => ({
            ...item,
            amount: item.amount === 'Php 2,699.00' ? 'Php 2,500.00' : item.amount,
            refNo: item.refNo?.replace(/^EXP-/, 'HOA-') || 'HOA-' + Math.floor(100000 + Math.random() * 900000),
            title: item.title && item.title.toLowerCase().includes('pldt')
              ? (item.channel === 'GCash' ? 'GCash QR — Monthly HOA Dues & Security'
                 : item.channel === 'Maya' ? 'Maya Wallet — Monthly HOA Assessment'
                 : item.channel === 'Bank Transfer' ? 'BDO Online Bills Payment — Dues Settlement'
                 : item.channel === 'Cashier OTC' ? 'Clubhouse Cashier OTC — Official Receipt'
                 : 'Online Payment — Monthly HOA Assessment')
              : item.title
          }));
        }
      } catch (e) {}
    }
    return INITIAL_PAYMENTS;
  });

  const [statementList, setStatementList] = useState<StatementRecord[]>(INITIAL_STATEMENTS);

  // Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState<StatementRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Automatic navigation trigger: open Pay modal if URL query ?action=pay or location.state.openPayModal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldOpen = searchParams.get('action') === 'pay' || searchParams.get('pay') === 'true' || Boolean((location.state as any)?.openPayModal);
    if (shouldOpen) {
      const stateAmount = (location.state as any)?.amountDue;
      if (stateAmount && Number(stateAmount) > 0) {
        setAmountDue(Number(stateAmount));
      }
      setShowPayModal(true);
    }
  }, [location.search, location.state]);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'maya' | 'bank'>('card');
  const [payerEmail, setPayerEmail] = useState(user?.email || 'homeowner@nrgph2.org');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [ewalletPhone, setEwalletPhone] = useState((user as any)?.phoneNumber || (user as any)?.phone || '0917-882-9401');

  // Admin Ledger State
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Pay Now Submit
  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountDue <= 0) {
      showError('No Balance Due', 'Your account balance is currently Php 0.00.');
      setShowPayModal(false);
      return;
    }

    setIsProcessing(true);
    const refNo = 'HOA-' + Math.floor(100000 + Math.random() * 900000);
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateFormatted = `${mm}/${dd}/${yy}`;

    try {
      // Send to server endpoint to record in database and trigger Gmail SMTP receipt
      await fetch('/api/billing/pay-dues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || ''}`
        },
        body: JSON.stringify({
          amount: amountDue,
          paymentMethod,
          email: payerEmail,
          residentName: user?.fullName || 'Valued Homeowner'
        })
      }).catch(err => console.warn('API call fallback to local persistence:', err));

      const channelTitle = paymentMethod === 'card'
        ? 'Visa / Mastercard — Portal Dues Settlement'
        : paymentMethod === 'gcash'
        ? 'GCash QR — Monthly HOA Dues & Security'
        : paymentMethod === 'maya'
        ? 'Maya Wallet — Monthly HOA Assessment'
        : 'Bank Transfer — Monthly HOA Assessment';

      const newRecord: PaymentRecord = {
        id: 'p-' + Date.now(),
        title: channelTitle,
        date: dateFormatted,
        rawDate: today.toISOString().split('T')[0],
        amount: `Php ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        channel: paymentMethod === 'card' ? 'Credit Card' : paymentMethod.toUpperCase(),
        refNo
      };

      const updatedPayments = [newRecord, ...paymentList];
      setPaymentList(updatedPayments);
      localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(updatedPayments));
      localStorage.removeItem('nrg_pldt_payment_history');

      // Mark current statement as Paid
      setStatementList(prev => prev.map(s => s.id === 'stmt-09-2026' ? { ...s, status: 'Paid' } : s));

      // Clear amount due
      setAmountDue(0);
      localStorage.setItem('nrg_hoa_amount_due', '0');
      localStorage.removeItem('nrg_pldt_amount_due');

      success(
        'Payment Posted Successfully! 💳',
        `Paid Php ${amountDue.toLocaleString()} via ${paymentMethod.toUpperCase()}. Reference: ${refNo}. Official receipt emailed to ${payerEmail}.`
      );

      setShowPayModal(false);
      setActiveTab('payments');
    } catch (err: any) {
      showError('Payment Processing Issue', err.message || 'Could not complete payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDemoBill = () => {
    setAmountDue(3000.00);
    localStorage.setItem('nrg_hoa_amount_due', '3000');
    localStorage.removeItem('nrg_pldt_amount_due');
    setStatementList(INITIAL_STATEMENTS);
    success('Billing Reset', 'Restored original bill of Php 3,000.00.');
  };

  return (
    <PageContainer
      title=""
      subtitle=""
    >
      <div style={{ maxWidth: 840, margin: '0 auto', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        {/* TOP TITLE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            Billing
          </h1>
          {isStaffOrAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm"
                style={{
                  background: 'var(--bg-elevated, var(--bg-hover))',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
                onClick={handleResetDemoBill}
              >
                🔄 Reset Demo Bill
              </button>
            </div>
          )}
        </div>

        {/* ── HOA BILLING SUMMARY CARD ── */}
        <div style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          padding: '28px 32px',
          marginBottom: 12,
          minHeight: 140,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Subtle Red Vector Wave Background on Right */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 140,
            bottom: 0,
            width: 440,
            pointerEvents: 'none',
            opacity: 0.65,
            zIndex: 1,
            overflow: 'hidden'
          }}>
            <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,160 C120,90 180,140 240,40 C300,-50 360,60 400,20" stroke="#DC2626" strokeWidth="1.2" opacity="0.3" fill="none" />
              <path d="M70,160 C140,70 200,120 260,30 C320,-50 370,50 420,10" stroke="#EF4444" strokeWidth="1" opacity="0.35" fill="none" />
              <path d="M10,160 C90,110 150,150 220,60 C280,-30 340,70 380,30" stroke="#F87171" strokeWidth="1.4" opacity="0.4" fill="none" />
              <path d="M110,160 C160,80 220,130 280,50 C330,-20 380,60 410,20" stroke="#B91C1C" strokeWidth="0.8" opacity="0.25" fill="none" />
            </svg>
          </div>

          {/* Left: Amount & Due Date */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'none' }}>
              Amount to Pay
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: amountDue > 0 ? 'var(--text-primary)' : '#10B981',
              margin: '6px 0 4px 0',
              letterSpacing: '-0.5px'
            }}>
              {amountDue > 0 ? `Php ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Php 0.00'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {amountDue > 0 ? 'Due on September 26, 2026 (Current ₱2,500 + Arrears ₱500)' : '✅ No outstanding dues • Fully settled for September 2026'}
            </div>
          </div>

          {/* Right: Pay Now Button */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {amountDue > 0 ? (
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                style={{
                  background: '#CC1529',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '11px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(204, 21, 41, 0.35)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#B01022'}
                onMouseOut={e => e.currentTarget.style.background = '#CC1529'}
              >
                Pay Now
              </button>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '8px 20px',
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>✓</span> Settled
              </div>
            )}
          </div>
        </div>

        {/* Informational Sub-banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--text-muted)',
          padding: '0 4px',
          marginBottom: 36
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '1.2px solid var(--text-muted)',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            lineHeight: 1
          }}>
            i
          </span>
          <span>
            Payment posting will depend on your selected payment channel.{' '}
            <a
              href="#learn-more"
              onClick={e => { e.preventDefault(); alert('Online payments (GCash, Maya, Cards) post immediately. Bank transfers reflect within 24 hours upon automated reconciliation.'); }}
              style={{ color: '#CC1529', textDecoration: 'none', fontWeight: 500 }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Learn more
            </a>
          </span>
        </div>

        {/* ── PAYMENT HISTORY SECTION ── */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>
            Payment History
          </h2>

          {/* Card with Dual Tabs (Responsive to Light & Dark Theme) */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            
            {/* TABS HEADER */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              padding: '0 24px',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('statement')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'statement' ? '3px solid #CC1529' : '3px solid transparent',
                  padding: '16px 20px',
                  fontSize: 15,
                  fontWeight: activeTab === 'statement' ? 700 : 500,
                  color: activeTab === 'statement' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: -1
                }}
              >
                Statement
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'payments' ? '3px solid #CC1529' : '3px solid transparent',
                  padding: '16px 20px',
                  fontSize: 15,
                  fontWeight: activeTab === 'payments' ? 700 : 500,
                  color: activeTab === 'payments' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: -1
                }}
              >
                Payments
              </button>

              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_ledger')}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'admin_ledger' ? '3px solid #10B981' : '3px solid transparent',
                    padding: '16px 16px',
                    fontSize: 14,
                    fontWeight: activeTab === 'admin_ledger' ? 700 : 500,
                    color: activeTab === 'admin_ledger' ? '#10B981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    marginBottom: -1
                  }}
                >
                  ⚙️ Admin HOA Master Ledger
                </button>
              )}
            </div>

            {/* TAB 1: STATEMENT CONTENT */}
            {activeTab === 'statement' && (
              <div style={{ padding: '20px 24px 8px 24px' }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Showing statement History from the past 6 months
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {statementList.map((stmt, idx) => (
                    <div
                      key={stmt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: idx < statementList.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      {/* Left: Calendar Icon + Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Circular Calendar Icon */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-elevated, var(--bg-hover))',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>

                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {stmt.monthYear}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {stmt.dateStr} • {stmt.amount}
                          </div>
                        </div>
                      </div>

                      {/* Right: View Button */}
                      <button
                        type="button"
                        onClick={() => setShowStatementModal(stmt)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          padding: '6px 10px',
                        }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENTS CONTENT */}
            {activeTab === 'payments' && (
              <div style={{ padding: '8px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {paymentList.map((pay, idx) => (
                    <div
                      key={pay.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 0',
                        borderBottom: idx < paymentList.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      {/* Left: Credit Card Icon + Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Circular Credit Card Icon */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-elevated, var(--bg-hover))',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                          </svg>
                        </div>

                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {pay.title}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {pay.date} • Ref: {pay.refNo}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount */}
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pay.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN MASTER LEDGER */}
            {activeTab === 'admin_ledger' && isStaffOrAdmin && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>NRG PH2 HOA — Association Dues Master Registry</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Manage dues collections, verified bank deposits, and resident statuses.</p>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search resident or lot..."
                    style={{ width: 220 }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Resident / Property</th>
                        <th>Billing Cycle</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Reference</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Juan Dela Cruz</strong><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block 3 Lot 12</div></td>
                        <td>September 2026</td>
                        <td>₱3,000.00</td>
                        <td><span className="badge badge-paid">PAID (ONLINE)</span></td>
                        <td className="font-mono" style={{ fontSize: 12 }}>HOA-884219</td>
                        <td><button className="btn btn-sm" onClick={() => success('Verified', 'Receipt already confirmed.')}>View Receipt</button></td>
                      </tr>
                      <tr>
                        <td><strong>Maria Santos</strong><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block 4 Lot 05</div></td>
                        <td>September 2026</td>
                        <td>₱3,000.00</td>
                        <td><span className="badge badge-paid">PAID (GCASH)</span></td>
                        <td className="font-mono" style={{ fontSize: 12 }}>HOA-772911</td>
                        <td><button className="btn btn-sm" onClick={() => success('Verified', 'Receipt confirmed.')}>View Receipt</button></td>
                      </tr>
                      <tr>
                        <td><strong>Pedro Penduko</strong><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block 1 Lot 02</div></td>
                        <td>September 2026</td>
                        <td>₱3,000.00</td>
                        <td><span className="badge badge-unpaid">UNPAID</span></td>
                        <td className="font-mono" style={{ fontSize: 12 }}>—</td>
                        <td><button className="btn btn-sm btn-primary" onClick={() => success('Reminder Sent', 'Email reminder dispatched.')}>Send Reminder</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── PAY NOW INTERACTIVE MODAL ── */}
        {showPayModal && (
          <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
            <div
              className="modal-box"
              style={{
                maxWidth: 520,
                borderRadius: 20,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                padding: '28px 32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.2s ease',
                overflowY: 'auto',
                maxHeight: '90vh'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(204, 21, 41, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    💳
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                      Pay Dues — NRG PH2 HOA Online Checkout
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Official Assessment Payment Gateway • Northridge Grove Phase 2
                    </div>
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowPayModal(false)}
                  style={{
                    background: 'var(--bg-hover)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePayNowSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 0 }}>
                  
                  {/* Amount Summary Box */}
                  <div style={{
                    background: 'var(--bg-elevated, var(--bg-hover))',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        TOTAL AMOUNT TO SETTLE
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2, letterSpacing: '-0.5px' }}>
                        Php {amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Current Assessment (₱2,500) + Previous Arrears (₱500)
                      </div>
                    </div>
                    <span style={{ fontSize: 12, background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '6px 12px', borderRadius: 9999, fontWeight: 700 }}>
                      September 2026 Dues
                    </span>
                  </div>

                  {/* Payment Channel Selection */}
                  <div>
                    <label className="form-label font-bold" style={{ marginBottom: 8, display: 'block', color: 'var(--text-primary)', fontSize: 13 }}>
                      Select Payment Channel
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                        { id: 'gcash', label: 'GCash Express', icon: '📱' },
                        { id: 'maya', label: 'Maya Wallet', icon: '🟢' },
                        { id: 'bank', label: 'BDO / BPI Transfer', icon: '🏦' },
                      ].map(ch => (
                        <div
                          key={ch.id}
                          onClick={() => setPaymentMethod(ch.id as any)}
                          style={{
                            border: paymentMethod === ch.id ? '2px solid #CC1529' : '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '12px 14px',
                            cursor: 'pointer',
                            background: paymentMethod === ch.id ? 'rgba(204, 21, 41, 0.10)' : 'var(--bg-elevated, var(--bg-hover))',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontWeight: paymentMethod === ch.id ? 700 : 500,
                            color: paymentMethod === ch.id ? '#EF4444' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{ch.icon}</span>
                          <span style={{ fontSize: 13 }}>{ch.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channel Details Inputs */}
                  {paymentMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-elevated, var(--bg-hover))', border: '1px solid var(--border)', padding: 14, borderRadius: 12 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Card Number</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Expiry Date</label>
                          <input
                            type="text"
                            className="form-input"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>CVV Security Code</label>
                          <input
                            type="password"
                            className="form-input"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                    <div style={{ background: 'var(--bg-elevated, var(--bg-hover))', border: '1px solid var(--border)', padding: 14, borderRadius: 12 }}>
                      <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Registered Mobile Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={ewalletPhone}
                        onChange={e => setEwalletPhone(e.target.value)}
                        placeholder="0917-xxx-xxxx"
                      />
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        A one-time checkout authentication PIN will be sent to this number.
                      </div>
                    </div>
                  )}

                  {/* Receipt Notification Email */}
                  <div>
                    <label className="form-label font-bold" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Send Official Receipt to Email (Gmail SMTP)
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={payerEmail}
                      onChange={e => setPayerEmail(e.target.value)}
                      placeholder="homeowner@gmail.com"
                    />
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPayModal(false)}
                    style={{ borderRadius: 9999, padding: '10px 22px', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      background: '#CC1529',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '10px 28px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(204, 21, 41, 0.35)',
                    }}
                  >
                    {isProcessing ? 'Processing Payment...' : `Confirm & Pay Php ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── STATEMENT OF ACCOUNT MODAL ── */}
        {showStatementModal && (
          <div className="modal-overlay" onClick={() => setShowStatementModal(null)}>
            <div
              className="modal-box"
              style={{
                maxWidth: 540,
                borderRadius: 20,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                padding: '28px 32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.2s ease',
                overflowY: 'auto',
                maxHeight: '90vh'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(204, 21, 41, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    📄
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Statement of Account — {showStatementModal.monthYear}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Billing Period: {showStatementModal.dateStr} • Due: {showStatementModal.dueDate}
                    </div>
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowStatementModal(null)}
                  style={{
                    background: 'var(--bg-hover)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0 }}>
                
                {/* Resident info */}
                <div style={{ background: 'var(--bg-elevated, var(--bg-hover))', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Homeowner:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Juan Dela Cruz'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{(user as any)?.address || 'Block 3 Lot 12, Maagap Street, NRG Phase 2'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Billing Status:</span>
                    <span style={{
                      fontWeight: 700,
                      color: showStatementModal.status === 'Paid' ? '#10B981' : '#CC1529'
                    }}>
                      {showStatementModal.status === 'Paid' ? '✓ PAID IN FULL' : '● DUE & PAYABLE'}
                    </span>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.5px' }}>
                    ITEMIZED DUES ASSESSMENT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <tbody>
                      {showStatementModal.breakdown.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{row.item}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ₱{row.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '14px 0 0 0', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                          Total Monthly Dues
                        </td>
                        <td style={{ padding: '14px 0 0 0', textAlign: 'right', fontWeight: 800, fontSize: 16, color: '#CC1529' }}>
                          {showStatementModal.amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ borderRadius: 9999, padding: '8px 20px' }}
                  onClick={() => {
                    window.print();
                  }}
                >
                  🖨️ Print Statement
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ borderRadius: 9999, padding: '8px 20px' }}
                    onClick={() => setShowStatementModal(null)}
                  >
                    Close
                  </button>
                  {showStatementModal.status !== 'Paid' && amountDue > 0 && (
                    <button
                      type="button"
                      style={{
                        background: '#CC1529',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 9999,
                        padding: '8px 22px',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(204, 21, 41, 0.35)',
                      }}
                      onClick={() => {
                        setShowStatementModal(null);
                        setShowPayModal(true);
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}


