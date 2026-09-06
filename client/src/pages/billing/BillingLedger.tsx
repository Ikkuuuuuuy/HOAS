import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GCashMockQRCode from '../../components/billing/GCashMockQRCode';
import OfficialPrintableReceipt, { ReceiptData } from '../../components/billing/OfficialPrintableReceipt';
import AdminPaymentVerificationModal, { PendingPaymentData } from '../../components/billing/AdminPaymentVerificationModal';
import { SAMPLE_GCASH_RECEIPT_URL } from '../../components/billing/gcashReceiptSample';

export interface PaymentRecord {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  amount: string;
  channel: string;
  refNo: string;
  status?: 'Paid' | 'Pending Approval';
  screenshotUrl?: string;
  senderPhone?: string;
  orNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface StatementRecord {
  id: string;
  monthYear: string;
  dateStr: string;
  amount: string;
  dueDate: string;
  status: 'Paid' | 'Current Due' | 'Pending Approval';
  breakdown: { item: string; cost: number }[];
  refNo?: string;
  orNumber?: string;
  paidDate?: string;
  screenshotUrl?: string;
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
    orNumber: 'NRG-OR-2026-08192',
    refNo: 'HOA-884219',
    paidDate: '08/23/26',
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
    orNumber: 'NRG-OR-2026-07115',
    refNo: 'HOA-772911',
    paidDate: '07/25/26',
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
    orNumber: 'NRG-OR-2026-06288',
    refNo: 'HOA-661024',
    paidDate: '06/26/26',
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
    orNumber: 'NRG-OR-2026-05190',
    refNo: 'HOA-553190',
    paidDate: '05/19/26',
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
    orNumber: 'NRG-OR-2026-04102',
    refNo: 'HOA-440918',
    paidDate: '04/21/26',
    breakdown: [
      { item: 'Monthly HOA Association Dues', cost: 1700 },
      { item: 'Security & 24/7 Gated Perimeter Patrol', cost: 500 },
      { item: 'Garbage Collection & Environmental Sanitation', cost: 300 },
    ]
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: 'p-1', title: 'GCash QR — Monthly HOA Dues & Security', date: '08/23/26', rawDate: '2026-08-23', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-884219', status: 'Paid', orNumber: 'NRG-OR-2026-08192' },
  { id: 'p-2', title: 'GCash QR — Monthly HOA Assessment', date: '07/25/26', rawDate: '2026-07-25', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-772911', status: 'Paid', orNumber: 'NRG-OR-2026-07115' },
  { id: 'p-3', title: 'GCash Express — Portal Dues Settlement', date: '06/26/26', rawDate: '2026-06-26', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-661024', status: 'Paid', orNumber: 'NRG-OR-2026-06288' },
  { id: 'p-4', title: 'GCash QR — Dues Settlement', date: '05/19/26', rawDate: '2026-05-19', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-553190', status: 'Paid', orNumber: 'NRG-OR-2026-05190' },
  { id: 'p-5', title: 'GCash Express — HOA Maintenance & Patrol', date: '04/21/26', rawDate: '2026-04-21', amount: 'Php 2,500.00', channel: 'GCash', refNo: 'HOA-440918', status: 'Paid', orNumber: 'NRG-OR-2026-04102' },
  { id: 'p-6', title: 'Clubhouse Cashier OTC — Official Receipt', date: '03/24/26', rawDate: '2026-03-24', amount: 'Php 2,500.00', channel: 'GCash OTC', refNo: 'HOA-332901', status: 'Paid', orNumber: 'NRG-OR-2026-03091' },
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

    const saved = localStorage.getItem('nrg_hoa_amount_due');
    if (saved !== null) {
      const parsed = Number(saved);
      if (parsed === 2699) return 3000.00;
      return parsed;
    }
    return 3000.00;
  });

  const [paymentList, setPaymentList] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('nrg_hoa_payment_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            channel: 'GCash',
            amount: item.amount === 'Php 2,699.00' ? 'Php 2,500.00' : item.amount,
            status: item.status || 'Paid',
            refNo: item.refNo?.replace(/^EXP-/, 'HOA-') || 'HOA-' + Math.floor(100000 + Math.random() * 900000),
          }));
        }
      } catch (e) {}
    }
    return INITIAL_PAYMENTS;
  });

  const [statementList, setStatementList] = useState<StatementRecord[]>(() => {
    const saved = localStorage.getItem('nrg_hoa_statement_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_STATEMENTS;
  });

  // Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState<StatementRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [adminReviewData, setAdminReviewData] = useState<PendingPaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewProofOnly, setPreviewProofOnly] = useState<string | null>(null);

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

  // GCash Exclusive Payment Form State
  const [payerEmail, setPayerEmail] = useState(user?.email || 'homeowner@nrgph2.org');
  const [gcashRefNo, setGcashRefNo] = useState('1002 9841 8320 1');
  const [senderPhone, setSenderPhone] = useState((user as any)?.phoneNumber || (user as any)?.phone || '0917-882-9401');
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Admin Ledger State
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Screenshot File Upload
  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setUploadedScreenshotUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // One-click demo sample receipt loader
  const handleUseSampleReceipt = () => {
    setUploadedScreenshotUrl(SAMPLE_GCASH_RECEIPT_URL);
    setUploadedFileName('sample_gcash_confirmation_receipt.png');
    setGcashRefNo('1002 9841 8320 1');
    success('Sample Receipt Loaded', 'Attached authentic GCash payment receipt with Ref No: 1002 9841 8320 1');
  };

  // Handle Pay Now Submit -> Enters PENDING APPROVAL status for Admin Review
  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountDue <= 0 && statementList.find(s => s.id === 'stmt-09-2026')?.status !== 'Pending Approval') {
      showError('No Balance Due', 'Your account balance is currently Php 0.00.');
      setShowPayModal(false);
      return;
    }

    if (!gcashRefNo.trim()) {
      showError('Reference Number Required', 'Please input the 13-digit GCash transaction reference number.');
      return;
    }

    if (!uploadedScreenshotUrl) {
      showError('Screenshot Required', 'Please import or upload the screenshot of your GCash payment confirmation receipt.');
      return;
    }

    setIsProcessing(true);
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateFormatted = `${mm}/${dd}/${yy}`;

    try {
      // Send to server endpoint to record in database with status pending_approval
      await fetch('/api/billing/pay-dues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || ''}`
        },
        body: JSON.stringify({
          amount: amountDue,
          paymentMethod: 'gcash',
          referenceNo: gcashRefNo,
          email: payerEmail,
          residentName: user?.fullName || 'Valued Homeowner',
          status: 'pending_approval',
          screenshotUrl: uploadedScreenshotUrl,
        })
      }).catch(err => console.warn('API call fallback to local persistence:', err));

      const newRecord: PaymentRecord = {
        id: 'p-' + Date.now(),
        title: 'GCash QR — Monthly HOA Dues & Security',
        date: dateFormatted,
        rawDate: today.toISOString().split('T')[0],
        amount: `Php ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        channel: 'GCash',
        refNo: gcashRefNo,
        status: 'Pending Approval',
        screenshotUrl: uploadedScreenshotUrl,
        senderPhone: senderPhone,
      };

      const updatedPayments = [newRecord, ...paymentList.filter(p => p.refNo !== gcashRefNo)];
      setPaymentList(updatedPayments);
      localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(updatedPayments));

      // Mark statement as Pending Approval (NOT Paid yet!)
      const updatedStatements = statementList.map(s =>
        s.id === 'stmt-09-2026'
          ? {
              ...s,
              status: 'Pending Approval' as const,
              refNo: gcashRefNo,
              screenshotUrl: uploadedScreenshotUrl,
            }
          : s
      );
      setStatementList(updatedStatements);
      localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(updatedStatements));

      success(
        'Payment Proof Submitted! ⏳',
        `GCash payment of Php ${amountDue.toLocaleString()} (Ref: ${gcashRefNo}) is now pending HOA Treasury Admin approval. Official Receipt will be generated upon verification.`
      );

      setShowPayModal(false);
      setActiveTab('payments');
    } catch (err: any) {
      showError('Payment Submission Issue', err.message || 'Could not submit payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Admin Approval Action: Marks bill as Paid and issues Official Receipt
  const handleAdminApprovePayment = (data: PendingPaymentData) => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateFormatted = `${mm}/${dd}/${yy}`;
    const generatedOr = `NRG-OR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Mark statement as Paid with OR Number
    const updatedStatements = statementList.map(s =>
      s.id === 'stmt-09-2026'
        ? {
            ...s,
            status: 'Paid' as const,
            orNumber: generatedOr,
            paidDate: dateFormatted,
            refNo: data.refNo,
          }
        : s
    );
    setStatementList(updatedStatements);
    localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(updatedStatements));

    // 2. Mark payment record as Paid
    const updatedPayments = paymentList.map(p =>
      p.refNo === data.refNo || p.status === 'Pending Approval'
        ? {
            ...p,
            status: 'Paid' as const,
            orNumber: generatedOr,
            approvedBy: 'Engr. Dan - HOA Treasury & Audit',
            approvedAt: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          }
        : p
    );
    setPaymentList(updatedPayments);
    localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(updatedPayments));

    // 3. Clear balance
    setAmountDue(0);
    localStorage.setItem('nrg_hoa_amount_due', '0');

    setAdminReviewData(null);

    success(
      'Payment Verified & Approved! ✓',
      `Official Receipt ${generatedOr} has been issued for ${data.payorName}. Statement is now marked PAID.`
    );

    // Open the official printable receipt directly for presentation!
    handleViewReceiptForStatement(updatedStatements.find(s => s.id === 'stmt-09-2026')!);
  };

  // Admin Reject Action
  const handleAdminRejectPayment = (data: PendingPaymentData) => {
    const updatedStatements = statementList.map(s =>
      s.id === 'stmt-09-2026'
        ? { ...s, status: 'Current Due' as const }
        : s
    );
    setStatementList(updatedStatements);
    localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(updatedStatements));

    const updatedPayments = paymentList.filter(p => p.refNo !== data.refNo);
    setPaymentList(updatedPayments);
    localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(updatedPayments));

    setAdminReviewData(null);
    showError('Payment Rejected', 'Proof of payment was rejected. The statement has returned to Unpaid.');
  };

  // Helper to construct and show Printable Receipt for any Paid record
  const handleViewReceiptForStatement = (stmt: StatementRecord) => {
    const matchingPay = paymentList.find(p => p.orNumber === stmt.orNumber || p.refNo === stmt.refNo);
    const receiptData: ReceiptData = {
      orNumber: stmt.orNumber || 'NRG-OR-2026-09241',
      dateStr: stmt.paidDate || stmt.dateStr,
      billingPeriod: stmt.monthYear,
      payorName: user?.fullName || 'Juan Dela Cruz',
      propertyAddress: (user as any)?.address || 'Block 3, Lot 12, Maagap Street, Phase 2',
      memberId: 'NRG-RES-0312',
      paymentChannel: 'GCash Express (Verified)',
      refNo: stmt.refNo || matchingPay?.refNo || '1002 9841 8320 1',
      amountNumber: 3000,
      amountStr: stmt.amount,
      amountInWords: 'Three Thousand Philippine Pesos Only',
      breakdown: stmt.breakdown,
      approvedBy: matchingPay?.approvedBy || 'Engr. Dan - HOA Treasury & Audit',
      approvedAt: matchingPay?.approvedAt || 'September 06, 2026 • 07:50 PM',
      screenshotUrl: matchingPay?.screenshotUrl || stmt.screenshotUrl || (stmt.id === 'stmt-09-2026' ? uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL : undefined),
    };
    setSelectedReceipt(receiptData);
  };

  const handleViewReceiptForPayment = (pay: PaymentRecord) => {
    const matchingStmt = statementList.find(s => s.orNumber === pay.orNumber || s.refNo === pay.refNo) || statementList[0];
    const receiptData: ReceiptData = {
      orNumber: pay.orNumber || 'NRG-OR-2026-09241',
      dateStr: pay.date,
      billingPeriod: matchingStmt?.monthYear || 'September 2026',
      payorName: user?.fullName || 'Juan Dela Cruz',
      propertyAddress: (user as any)?.address || 'Block 3, Lot 12, Maagap Street, Phase 2',
      memberId: 'NRG-RES-0312',
      paymentChannel: 'GCash Express (Verified)',
      refNo: pay.refNo,
      amountNumber: 3000,
      amountStr: pay.amount,
      amountInWords: 'Three Thousand Philippine Pesos Only',
      breakdown: matchingStmt?.breakdown || [
        { item: 'Current Assessment (Monthly HOA Association Dues)', cost: 2500 },
        { item: 'Previous Arrears (Security & Common Maintenance)', cost: 500 },
      ],
      approvedBy: pay.approvedBy || 'Engr. Dan - HOA Treasury & Audit',
      approvedAt: pay.approvedAt || 'September 06, 2026 • 07:50 PM',
      screenshotUrl: pay.screenshotUrl || uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL,
    };
    setSelectedReceipt(receiptData);
  };

  const handleOpenAdminReview = (record: PaymentRecord) => {
    setAdminReviewData({
      id: record.id,
      payorName: user?.fullName || 'Juan Dela Cruz',
      propertyAddress: (user as any)?.address || 'Block 3, Lot 12, Maagap St., Phase 2',
      amount: record.amount,
      amountNumber: 3000,
      billingPeriod: 'September 2026',
      refNo: record.refNo,
      senderPhone: record.senderPhone || senderPhone,
      dateStr: record.date,
      screenshotUrl: record.screenshotUrl || uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL,
    });
  };

  const handleResetDemoBill = () => {
    setAmountDue(3000.00);
    localStorage.setItem('nrg_hoa_amount_due', '3000');
    setStatementList(INITIAL_STATEMENTS);
    localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(INITIAL_STATEMENTS));
    setPaymentList(INITIAL_PAYMENTS);
    localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(INITIAL_PAYMENTS));
    setUploadedScreenshotUrl(null);
    setUploadedFileName(null);
    success('Billing Reset', 'Restored bill of Php 3,000.00 for September 2026.');
  };

  const septStatement = statementList.find(s => s.id === 'stmt-09-2026') || statementList[0];
  const isSeptemberPending = septStatement.status === 'Pending Approval';
  const isSeptemberPaid = septStatement.status === 'Paid';

  return (
    <PageContainer title="" subtitle="">
      <div style={{ maxWidth: 840, margin: '0 auto', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        {/* TOP TITLE & DEMO CONTROLS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              Billing &amp; Pay Dues
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              Northridge Grove Phase 2 HOA Assessment &amp; Treasury Portal
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isStaffOrAdmin && (
              <button
                className="btn btn-sm"
                style={{
                  background: 'var(--bg-elevated, var(--bg-hover))',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '6px 14px'
                }}
                onClick={handleResetDemoBill}
              >
                🔄 Reset Demo Bill (₱3,000)
              </button>
            )}
          </div>
        </div>

        {/* ── ADMIN NOTICE: PENDING VERIFICATION BANNER (When a payment is waiting) ── */}
        {isSeptemberPending && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid #F59E0B',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              animation: 'fadeInUp 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>⏳</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#D97706' }}>
                  GCash Payment Submitted — Awaiting Admin Approval
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', marginTop: 2 }}>
                  Ref No: <strong>{septStatement.refNo || gcashRefNo}</strong> • Amount: <strong>Php 3,000.00</strong>.
                  Before the bill is marked Paid, an Administrator will verify the uploaded payment screenshot.
                </div>
              </div>
            </div>
            {isStaffOrAdmin ? (
              <Link
                to="/payment-approvals"
                style={{
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                }}
              >
                <span>🛡️</span> Open Payment Approvals Table
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setPreviewProofOnly(septStatement.screenshotUrl || uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL)}
                style={{
                  background: 'transparent',
                  color: '#D97706',
                  border: '1.5px solid #D97706',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>📸</span> View Submitted Proof
              </button>
            )}
          </div>
        )}

        {/* ── HOA BILLING SUMMARY CARD ── */}
        <div style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          borderRadius: 20,
          border: '1px solid rgba(22, 163, 74, 0.35)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          padding: '30px 34px',
          marginBottom: 12,
          minHeight: 140,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Wave Background */}
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
              <path d="M50,160 C120,90 180,140 240,40 C300,-50 360,60 400,20" stroke="#16A34A" strokeWidth="1.2" opacity="0.3" fill="none" />
              <path d="M70,160 C140,70 200,120 260,30 C320,-50 370,50 420,10" stroke="#22C55E" strokeWidth="1" opacity="0.35" fill="none" />
              <path d="M10,160 C90,110 150,150 220,60 C280,-30 340,70 380,30" stroke="#34D399" strokeWidth="1.4" opacity="0.3" fill="none" />
            </svg>
          </div>

          {/* Left: Amount & Due Date */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Amount to Pay
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: isSeptemberPaid ? '#10B981' : isSeptemberPending ? '#D97706' : 'var(--text-primary)',
              margin: '6px 0 4px 0',
              letterSpacing: '-0.5px'
            }}>
              {isSeptemberPaid ? 'Php 0.00' : `Php ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {isSeptemberPaid ? (
                <span style={{ color: '#10B981', fontWeight: 600 }}>
                  ✓ September 2026 Dues Fully Settled • Official Receipt Issued
                </span>
              ) : isSeptemberPending ? (
                <span style={{ color: '#D97706', fontWeight: 600 }}>
                  ⏳ Payment Proof Submitted • Awaiting HOA Treasury Admin Approval
                </span>
              ) : (
                'Due on September 26, 2026 (Current Assessment ₱2,500 + Arrears ₱500)'
              )}
            </div>
          </div>

          {/* Right: Pay Now or View Receipt Button */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {isSeptemberPaid ? (
              <button
                type="button"
                onClick={() => handleViewReceiptForStatement(septStatement)}
                style={{
                  background: '#15803D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '11px 26px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(21, 128, 61, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🧾</span> View Official Receipt
              </button>
            ) : isSeptemberPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#D97706',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '6px 16px',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>⏳</span> Verification Pending
                </span>
                <button
                  type="button"
                  onClick={() => setShowPayModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#005CEE',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  View / Re-upload Proof
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '12px 34px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #15803D 0%, #166534 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'}
              >
                <span>💳</span> Pay Dues (GCash)
              </button>
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
          marginBottom: 28
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
            GCash Payments require uploading your transaction screenshot for HOA Treasury review before official receipt issuance.{' '}
            <a
              href="#policy"
              onClick={e => { e.preventDefault(); alert('In accordance with HOA bylaws, submitted GCash reference numbers and proof screenshots are checked by the Treasury Admin before the dues ledger is marked Paid.'); }}
              style={{ color: '#005CEE', textDecoration: 'none', fontWeight: 600 }}
            >
              Approval Policy
            </a>
          </span>
        </div>

        {/* ── TABS: STATEMENTS | PAYMENTS & RECEIPTS | ADMIN REGISTRY ── */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation Header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            padding: '0 24px',
            background: 'var(--bg-elevated, var(--bg-hover))'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('statement')}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'statement' ? '3px solid #16A34A' : '3px solid transparent',
                fontSize: 15,
                fontWeight: activeTab === 'statement' ? 700 : 500,
                color: activeTab === 'statement' ? '#16A34A' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Statement of Account
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'payments' ? '3px solid #16A34A' : '3px solid transparent',
                fontSize: 15,
                fontWeight: activeTab === 'payments' ? 700 : 500,
                color: activeTab === 'payments' ? '#16A34A' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Payments &amp; Official Receipts</span>
              {isSeptemberPending && (
                <span style={{ background: '#F59E0B', color: '#FFF', fontSize: 10, padding: '2px 7px', borderRadius: 9999, fontWeight: 800 }}>
                  1 Pending
                </span>
              )}
            </button>

            {isStaffOrAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin_ledger')}
                style={{
                  padding: '16px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'admin_ledger' ? '3px solid #10B981' : '3px solid transparent',
                  fontSize: 15,
                  fontWeight: activeTab === 'admin_ledger' ? 700 : 500,
                  color: activeTab === 'admin_ledger' ? '#10B981' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🛡️ Admin Master Registry</span>
                {isSeptemberPending && (
                  <span style={{ background: '#EF4444', color: '#FFF', fontSize: 10, padding: '2px 7px', borderRadius: 9999, fontWeight: 800 }}>
                    Needs Approval
                  </span>
                )}
              </button>
            )}
          </div>

          {/* TAB 1: STATEMENT CONTENT */}
          {activeTab === 'statement' && (
            <div style={{ padding: '20px 24px 8px 24px' }}>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Showing billing statement history for Northridge Grove Phase 2</span>
                <span style={{ fontSize: 12 }}>Click <strong>View Receipt</strong> to inspect printable official receipts</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {statementList.map((stmt, idx) => {
                  const isPaid = stmt.status === 'Paid';
                  const isPending = stmt.status === 'Pending Approval';

                  return (
                    <div
                      key={stmt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px',
                        marginBottom: 10,
                        borderRadius: 14,
                        background: 'var(--bg-elevated, var(--bg-hover))',
                        border: isPaid ? '1px solid rgba(16, 185, 129, 0.25)' : isPending ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#16A34A'}
                      onMouseOut={e => e.currentTarget.style.borderColor = isPaid ? 'rgba(16, 185, 129, 0.25)' : isPending ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}
                    >
                      {/* Left: Icon + Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isPaid ? 'rgba(16, 185, 129, 0.1)' : isPending ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-elevated, var(--bg-hover))',
                          color: isPaid ? '#10B981' : isPending ? '#D97706' : 'var(--text-muted)',
                          fontSize: 18,
                          flexShrink: 0
                        }}>
                          {isPaid ? '✓' : isPending ? '⏳' : '📄'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {stmt.monthYear}
                            </span>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              background: isPaid ? 'rgba(16, 185, 129, 0.12)' : isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                              color: isPaid ? '#10B981' : isPending ? '#D97706' : '#EF4444',
                              border: isPaid ? '1px solid rgba(16, 185, 129, 0.3)' : isPending ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            }}>
                              {isPaid ? 'PAID & ISSUED' : isPending ? 'PENDING APPROVAL' : 'DUE'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {stmt.dateStr} • {stmt.amount} {stmt.orNumber ? `• OR: ${stmt.orNumber}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleViewReceiptForStatement(stmt)}
                            style={{
                              background: '#15803D',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                            }}
                          >
                            <span>🧾</span> View Printable Receipt
                          </button>
                        ) : isPending ? (
                          isStaffOrAdmin ? (
                            <Link
                              to="/payment-approvals"
                              style={{
                                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 14px',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                              }}
                            >
                              <span>🛡️</span> Review in Approvals
                            </Link>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#D97706',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 8,
                                padding: '5px 10px',
                                fontSize: 12,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <span>⏳</span> Awaiting Admin
                              </span>
                              <button
                                type="button"
                                onClick={() => setPreviewProofOnly(stmt.screenshotUrl || uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL)}
                                style={{
                                  background: 'transparent',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 8,
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                View Proof
                              </button>
                            </div>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowStatementModal(stmt)}
                            style={{
                              background: 'var(--bg-elevated, var(--bg-hover))',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            View Breakdown
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS & OFFICIAL RECEIPTS CONTENT */}
          {activeTab === 'payments' && (
            <div style={{ padding: '16px 24px' }}>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                Verified payments and official electronic receipts issued for this account.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {paymentList.map((pay, idx) => {
                  const isPending = pay.status === 'Pending Approval';

                  return (
                    <div
                      key={pay.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: idx < paymentList.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      {/* Left: GCash / Payment Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isPending ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 92, 238, 0.1)',
                          color: isPending ? '#D97706' : '#005CEE',
                          fontSize: 18,
                          fontWeight: 900,
                          flexShrink: 0
                        }}>
                          {isPending ? '⏳' : 'G'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {pay.title}
                            </span>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              background: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                              color: isPending ? '#D97706' : '#10B981',
                              border: isPending ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                            }}>
                              {isPending ? 'Awaiting Approval' : 'Verified & Paid'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {pay.date} • GCash Ref: <strong style={{ color: 'var(--text-secondary)' }}>{pay.refNo}</strong>
                            {pay.orNumber ? ` • Official Receipt: ${pay.orNumber}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Receipt Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: isPending ? '#D97706' : '#10B981' }}>
                            {pay.amount}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {pay.channel}
                          </div>
                        </div>

                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAdminReview(pay)}
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#D97706',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Proof
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleViewReceiptForPayment(pay)}
                            style={{
                              background: '#15803D',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                            }}
                          >
                            <span>🧾</span> View Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN MASTER REGISTRY */}
          {activeTab === 'admin_ledger' && isStaffOrAdmin && (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    NRG PH2 HOA — Association Dues Master Registry
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Verify resident payment screenshot submissions and approve official receipt issuance.
                  </p>
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
                    {/* Row for Current Resident (Juan Dela Cruz) */}
                    <tr style={{ background: isSeptemberPending ? 'rgba(245, 158, 11, 0.06)' : undefined }}>
                      <td>
                        <strong>{user?.fullName || 'Juan Dela Cruz'}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block 3 Lot 12</div>
                      </td>
                      <td>September 2026</td>
                      <td><strong>Php 3,000.00</strong></td>
                      <td>
                        {isSeptemberPaid ? (
                          <span className="badge badge-paid">PAID (GCASH VERIFIED)</span>
                        ) : isSeptemberPending ? (
                          <span className="badge" style={{ background: '#F59E0B', color: '#FFF', fontWeight: 800 }}>
                            ⏳ PENDING APPROVAL (GCASH)
                          </span>
                        ) : (
                          <span className="badge badge-unpaid">UNPAID</span>
                        )}
                      </td>
                      <td className="font-mono" style={{ fontSize: 12 }}>
                        {septStatement.refNo || (isSeptemberPending ? gcashRefNo : '—')}
                      </td>
                      <td>
                        {isSeptemberPending ? (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ background: '#F59E0B', borderColor: '#D97706' }}
                            onClick={() => {
                              const targetRecord = paymentList.find(p => p.status === 'Pending Approval') || {
                                id: 'p-pending',
                                title: 'GCash QR — Monthly HOA Dues & Security',
                                date: 'Today',
                                rawDate: new Date().toISOString(),
                                amount: 'Php 3,000.00',
                                channel: 'GCash',
                                refNo: septStatement.refNo || gcashRefNo,
                                status: 'Pending Approval' as const,
                                screenshotUrl: septStatement.screenshotUrl || uploadedScreenshotUrl || SAMPLE_GCASH_RECEIPT_URL,
                                senderPhone: senderPhone,
                              };
                              handleOpenAdminReview(targetRecord);
                            }}
                          >
                            🛡️ Review &amp; Approve
                          </button>
                        ) : isSeptemberPaid ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#15803D', color: '#FFF' }}
                            onClick={() => handleViewReceiptForStatement(septStatement)}
                          >
                            🧾 View Receipt
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => success('Reminder Sent', 'Email reminder dispatched to resident.')}
                          >
                            Send Reminder
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Pre-existing Verified Records */}
                    <tr>
                      <td><strong>Maria Santos</strong><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Block 4 Lot 05</div></td>
                      <td>September 2026</td>
                      <td>₱3,000.00</td>
                      <td><span className="badge badge-paid">PAID (GCASH)</span></td>
                      <td className="font-mono" style={{ fontSize: 12 }}>HOA-772911</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            const sampleReceipt: ReceiptData = {
                              orNumber: 'NRG-OR-2026-09118',
                              dateStr: '09/02/26',
                              billingPeriod: 'September 2026',
                              payorName: 'Maria Santos',
                              propertyAddress: 'Block 4, Lot 05, Northridge Grove Phase 2',
                              memberId: 'NRG-RES-0405',
                              paymentChannel: 'GCash Express (Verified)',
                              refNo: 'HOA-772911',
                              amountNumber: 3000,
                              amountStr: 'Php 3,000.00',
                              amountInWords: 'Three Thousand Philippine Pesos Only',
                              breakdown: [
                                { item: 'Current Assessment (Monthly HOA Association Dues)', cost: 2500 },
                                { item: 'Previous Arrears (Security & Common Maintenance)', cost: 500 },
                              ],
                              approvedBy: 'Engr. Dan - HOA Treasury & Audit',
                              approvedAt: 'September 02, 2026 • 02:15 PM',
                            };
                            setSelectedReceipt(sampleReceipt);
                          }}
                        >
                          View Receipt
                        </button>
                      </td>
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

      {/* ── PAY NOW INTERACTIVE MODAL (GCASH ONLY WITH MOCK QR CODE & SCREENSHOT IMPORT) ── */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)} style={{ zIndex: 9998 }}>
          <div
            className="modal-box"
            style={{
              maxWidth: 560,
              width: '95%',
              borderRadius: 20,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              padding: '26px 30px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              animation: 'slideUp 0.2s ease',
              overflowY: 'auto',
              maxHeight: '92vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#005CEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: 18 }}>
                  G
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                    Pay Dues — Official GCash Checkout
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Northridge Grove Phase 2 HOA • Scan QR &amp; Upload Screenshot
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
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0 }}>
                
                {/* Amount Summary */}
                <div style={{
                  background: 'var(--bg-elevated, var(--bg-hover))',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      TOTAL AMOUNT DUE
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>
                      Php {amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Current Assessment (₱2,500) + Previous Arrears (₱500)
                    </div>
                  </div>
                  <span style={{ fontSize: 12, background: 'rgba(0, 92, 238, 0.1)', color: '#005CEE', border: '1px solid rgba(0, 92, 238, 0.3)', padding: '6px 12px', borderRadius: 9999, fontWeight: 700 }}>
                    September 2026
                  </span>
                </div>

                {/* 1. MOCK GCASH QR CODE CARD */}
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📱 Step 1: Scan GCash QR &amp; Complete Payment</span>
                  </div>
                  <GCashMockQRCode amount={amountDue} />
                </div>

                {/* 2. PROOF OF PAYMENT SCREENSHOT UPLOAD */}
                <div style={{ background: 'var(--bg-elevated, var(--bg-hover))', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label font-bold" style={{ margin: 0, fontSize: 12.5, color: 'var(--text-primary)' }}>
                      📸 Step 2: Import / Upload Payment Screenshot
                    </label>
                    <button
                      type="button"
                      onClick={handleUseSampleReceipt}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#005CEE',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ⚡ Use Sample Screenshot
                    </button>
                  </div>

                  {/* Dropzone / Upload Box */}
                  <label
                    style={{
                      border: uploadedScreenshotUrl ? '2px solid #10B981' : '2px dashed var(--border)',
                      borderRadius: 12,
                      padding: uploadedScreenshotUrl ? '10px' : '20px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: uploadedScreenshotUrl ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleScreenshotFileChange}
                    />

                    {uploadedScreenshotUrl ? (
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={uploadedScreenshotUrl}
                            alt="Uploaded preview"
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #10B981' }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {uploadedFileName || 'gcash_receipt_screenshot.png'}
                            </div>
                            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                              ✓ Screenshot Ready for Admin Approval
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: '#005CEE', fontWeight: 600, textDecoration: 'underline' }}>
                          Change
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          Click to browse or drag &amp; drop GCash receipt
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          Supports PNG, JPG, JPEG (Max 10MB)
                        </div>
                      </>
                    )}
                  </label>
                </div>

                {/* 3. TRANSACTION DETAILS INPUTS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                      GCash Reference Number *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. 1002 9841 8320 1"
                      value={gcashRefNo}
                      onChange={e => setGcashRefNo(e.target.value)}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                      Sender Mobile No. *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="0917-xxx-xxxx"
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Notification */}
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Send Official Receipt to Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={payerEmail}
                    onChange={e => setPayerEmail(e.target.value)}
                    placeholder="homeowner@nrgph2.org"
                  />
                </div>

                {/* Notice on Admin Approval */}
                <div style={{ background: 'rgba(0, 92, 238, 0.08)', border: '1px solid rgba(0, 92, 238, 0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#005CEE' }}>🛡️ Treasury Verification Process:</strong> Submitting will record your proof in the HOA ledger under <em>Pending Approval</em>. Once the Treasury Admin confirms the screenshot, your bill will be updated to <strong>Paid</strong> and your Official Printable Receipt will be generated.
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPayModal(false)}
                  style={{ borderRadius: 9999, padding: '10px 20px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '10px 28px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)',
                  }}
                >
                  {isProcessing ? 'Submitting Proof...' : 'Submit Payment for Admin Verification'}
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
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0, 92, 238, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
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
                    color: showStatementModal.status === 'Paid' ? '#10B981' : showStatementModal.status === 'Pending Approval' ? '#D97706' : '#EF4444'
                  }}>
                    {showStatementModal.status === 'Paid' ? '✓ PAID IN FULL' : showStatementModal.status === 'Pending Approval' ? '⏳ PENDING ADMIN APPROVAL' : '● DUE & PAYABLE'}
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
                      <td style={{ padding: '14px 0 0 0', textAlign: 'right', fontWeight: 800, fontSize: 16, color: '#005CEE' }}>
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
                {showStatementModal.status === 'Paid' ? (
                  <button
                    type="button"
                    style={{
                      background: '#15803D',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '8px 22px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setShowStatementModal(null);
                      handleViewReceiptForStatement(showStatementModal);
                    }}
                  >
                    View Official Receipt
                  </button>
                ) : showStatementModal.status !== 'Pending Approval' && (
                  <button
                    type="button"
                    style={{
                      background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '8px 22px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)',
                    }}
                    onClick={() => {
                      setShowStatementModal(null);
                      setShowPayModal(true);
                    }}
                  >
                    Pay Dues
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PAYMENT VERIFICATION MODAL ── */}
      {adminReviewData && (
        <AdminPaymentVerificationModal
          data={adminReviewData}
          onApprove={handleAdminApprovePayment}
          onReject={handleAdminRejectPayment}
          onClose={() => setAdminReviewData(null)}
        />
      )}

      {/* ── OFFICIAL PRINTABLE RECEIPT MODAL ── */}
      {selectedReceipt && (
        <OfficialPrintableReceipt
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* ── RESIDENT READ-ONLY PROOF PREVIEW MODAL ── */}
      {previewProofOnly && (
        <div className="modal-overlay" onClick={() => setPreviewProofOnly(null)} style={{ zIndex: 9999 }}>
          <div
            className="modal-box"
            style={{
              maxWidth: 440,
              background: 'var(--bg-surface)',
              borderRadius: 16,
              padding: 22,
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                📸 Submitted GCash Payment Proof
              </div>
              <button
                type="button"
                onClick={() => setPreviewProofOnly(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
              Status: <strong style={{ color: '#D97706' }}>Pending HOA Admin Verification</strong>
            </div>
            <img
              src={previewProofOnly}
              alt="Submitted GCash proof"
              style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => setPreviewProofOnly(null)}
                style={{ borderRadius: 8 }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
