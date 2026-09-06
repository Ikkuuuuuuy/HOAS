import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminPaymentVerificationModal, { PendingPaymentData } from '../../components/billing/AdminPaymentVerificationModal';
import OfficialPrintableReceipt, { ReceiptData } from '../../components/billing/OfficialPrintableReceipt';
import { SAMPLE_GCASH_RECEIPT_URL } from '../../components/billing/gcashReceiptSample';

export interface PaymentApprovalItem {
  id: string;
  payorName: string;
  propertyAddress: string;
  memberId: string;
  billingPeriod: string;
  amount: string;
  amountNumber: number;
  channel: string;
  refNo: string;
  senderPhone: string;
  screenshotUrl: string;
  submittedAt: string;
  rawDate: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  orNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const DEFAULT_APPROVALS: PaymentApprovalItem[] = [
  {
    id: 'pay-appr-09-2026',
    payorName: 'Juan Dela Cruz',
    propertyAddress: 'Block 3 Lot 12, Maagap Street, NRG Phase 2',
    memberId: 'NRG-RES-0312',
    billingPeriod: 'September 2026 Dues & Arrears',
    amount: 'Php 3,000.00',
    amountNumber: 3000,
    channel: 'GCash',
    refNo: '1002 9841 8320 1',
    senderPhone: '0917-552-8821',
    screenshotUrl: SAMPLE_GCASH_RECEIPT_URL,
    submittedAt: 'Sep 06, 2026 • 07:45 PM',
    rawDate: new Date().toISOString(),
    status: 'Pending Approval',
  },
  {
    id: 'pay-appr-08-2026',
    payorName: 'Maria Santos',
    propertyAddress: 'Block 4 Lot 05, Katapatan Street, NRG Phase 2',
    memberId: 'NRG-RES-0405',
    billingPeriod: 'August 2026 Monthly Dues',
    amount: 'Php 2,500.00',
    amountNumber: 2500,
    channel: 'GCash',
    refNo: 'HOA-884219',
    senderPhone: '0918-223-9911',
    screenshotUrl: SAMPLE_GCASH_RECEIPT_URL,
    submittedAt: 'Aug 23, 2026 • 02:15 PM',
    rawDate: '2026-08-23T14:15:00Z',
    status: 'Approved',
    orNumber: 'NRG-OR-2026-08192',
    approvedBy: 'Engr. Dan - Treasury Admin',
    approvedAt: 'August 23, 2026 • 02:30 PM',
  },
  {
    id: 'pay-appr-07-2026',
    payorName: 'Ricardo Dalisay',
    propertyAddress: 'Block 1 Lot 08, Kasipagan Street, NRG Phase 2',
    memberId: 'NRG-RES-0108',
    billingPeriod: 'July 2026 Monthly Dues',
    amount: 'Php 2,500.00',
    amountNumber: 2500,
    channel: 'GCash',
    refNo: 'HOA-772911',
    senderPhone: '0919-445-1200',
    screenshotUrl: SAMPLE_GCASH_RECEIPT_URL,
    submittedAt: 'Jul 25, 2026 • 11:20 AM',
    rawDate: '2026-07-25T11:20:00Z',
    status: 'Approved',
    orNumber: 'NRG-OR-2026-07115',
    approvedBy: 'Engr. Dan - Treasury Admin',
    approvedAt: 'July 25, 2026 • 11:45 AM',
  },
];

export default function PaymentApprovals() {
  const { user } = useAuth();
  const { success, error: showError, info } = useToast();

  const [approvalsList, setApprovalsList] = useState<PaymentApprovalItem[]>(() => {
    const saved = localStorage.getItem('nrg_hoa_payment_approvals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_APPROVALS;
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Approval' | 'Approved' | 'Rejected'>('Pending Approval');

  // Modals
  const [selectedForReview, setSelectedForReview] = useState<PendingPaymentData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('nrg_hoa_payment_approvals', JSON.stringify(approvalsList));
  }, [approvalsList]);

  // Listen to external updates from Billing page submissions
  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem('nrg_hoa_payment_approvals');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setApprovalsList(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('hoa_storage_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('hoa_storage_update', handleStorageUpdate);
    };
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return approvalsList.filter(item => {
      const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        item.payorName.toLowerCase().includes(q) ||
        item.refNo.toLowerCase().includes(q) ||
        item.propertyAddress.toLowerCase().includes(q) ||
        item.billingPeriod.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [approvalsList, statusFilter, searchTerm]);

  // Metrics
  const pendingCount = approvalsList.filter(i => i.status === 'Pending Approval').length;
  const approvedCount = approvalsList.filter(i => i.status === 'Approved').length;
  const totalVerifiedAmount = approvalsList
    .filter(i => i.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amountNumber, 0);

  // Approve Payment Action
  const handleApprovePayment = (itemData: PendingPaymentData) => {
    const targetItem = approvalsList.find(i => i.id === itemData.id) || approvalsList.find(i => i.refNo === itemData.refNo);
    const now = new Date();
    const orNum = `NRG-OR-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminName = user?.fullName || 'HOA Treasury Administrator';
    const approvedAtStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update approvals list
    const updatedApprovals = approvalsList.map(item => {
      if (item.id === itemData.id || item.refNo === itemData.refNo) {
        return {
          ...item,
          status: 'Approved' as const,
          orNumber: orNum,
          approvedBy: adminName,
          approvedAt: approvedAtStr,
        };
      }
      return item;
    });
    setApprovalsList(updatedApprovals);
    localStorage.setItem('nrg_hoa_payment_approvals', JSON.stringify(updatedApprovals));

    // 2. Sync with statement list in localStorage (Mark September statement Paid)
    try {
      const savedStatements = localStorage.getItem('nrg_hoa_statement_list');
      if (savedStatements) {
        const statements = JSON.parse(savedStatements);
        const updatedStatements = statements.map((stmt: any) => {
          if (stmt.id === 'stmt-09-2026' || stmt.monthYear?.includes('September 2026')) {
            return {
              ...stmt,
              status: 'Paid',
              orNumber: orNum,
              refNo: itemData.refNo,
              approvedBy: adminName,
              approvedAt: approvedAtStr,
            };
          }
          return stmt;
        });
        localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(updatedStatements));
      }
    } catch (e) {}

    // 3. Sync with payment history list in localStorage
    try {
      const savedPayments = localStorage.getItem('nrg_hoa_payment_history');
      if (savedPayments) {
        const payments = JSON.parse(savedPayments);
        const updatedPayments = payments.map((p: any) => {
          if (p.status === 'Pending Approval' || p.refNo === itemData.refNo) {
            return {
              ...p,
              status: 'Paid',
              orNumber: orNum,
            };
          }
          return p;
        });
        localStorage.setItem('nrg_hoa_payment_history', JSON.stringify(updatedPayments));
      }
    } catch (e) {}

    // 4. Set amount due to 0
    localStorage.setItem('nrg_hoa_amount_due', '0');

    // Notify other components
    window.dispatchEvent(new Event('hoa_storage_update'));

    setSelectedForReview(null);
    success('Payment Verified & Approved', `Official Receipt ${orNum} has been issued for ${itemData.payorName}.`);

    // Open Printable Receipt preview immediately for Admin
    const printableReceipt: ReceiptData = {
      orNumber: orNum,
      dateStr: now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      billingPeriod: itemData.billingPeriod || 'September 2026',
      payorName: itemData.payorName,
      propertyAddress: itemData.propertyAddress,
      memberId: targetItem?.memberId || 'NRG-RES-0312',
      paymentChannel: 'GCash Express (Verified)',
      refNo: itemData.refNo,
      amountNumber: itemData.amountNumber,
      amountStr: itemData.amount,
      amountInWords: 'Three Thousand Philippine Pesos Only',
      breakdown: [
        { item: 'Current Assessment (Monthly HOA Association Dues)', cost: 2500 },
        { item: 'Previous Arrears (Security & Common Maintenance)', cost: 500 },
      ],
      approvedBy: adminName,
      approvedAt: approvedAtStr,
      screenshotUrl: itemData.screenshotUrl,
    };
    setSelectedReceipt(printableReceipt);
  };

  // Reject Payment Action
  const handleRejectPayment = (itemData: PendingPaymentData) => {
    const reason = window.prompt('Please enter reason for rejecting this payment submission:', 'Invalid / mismatched reference number or illegible receipt screenshot.');
    if (!reason) return;

    const updatedApprovals = approvalsList.map(item => {
      if (item.id === itemData.id || item.refNo === itemData.refNo) {
        return {
          ...item,
          status: 'Rejected' as const,
          rejectionReason: reason,
        };
      }
      return item;
    });
    setApprovalsList(updatedApprovals);
    localStorage.setItem('nrg_hoa_payment_approvals', JSON.stringify(updatedApprovals));

    // Reset statement to Unpaid in localStorage
    try {
      const savedStatements = localStorage.getItem('nrg_hoa_statement_list');
      if (savedStatements) {
        const statements = JSON.parse(savedStatements);
        const updatedStatements = statements.map((stmt: any) => {
          if (stmt.id === 'stmt-09-2026') {
            return {
              ...stmt,
              status: 'Unpaid',
              refNo: undefined,
              screenshotUrl: undefined,
            };
          }
          return stmt;
        });
        localStorage.setItem('nrg_hoa_statement_list', JSON.stringify(updatedStatements));
      }
    } catch (e) {}

    window.dispatchEvent(new Event('hoa_storage_update'));
    setSelectedForReview(null);
    showError('Payment Rejected', `Payment proof for ${itemData.payorName} rejected. Reason: ${reason}`);
  };

  return (
    <PageContainer
      title="Payment Approvals & Treasury Verification"
      subtitle="Review resident GCash payment proofs, audit reference numbers against bank deposits, and approve or reject submissions."
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── TOP KPI METRICS SUMMARY CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          
          <div style={{
            background: 'var(--bg-surface)',
            border: pendingCount > 0 ? '2px solid #F59E0B' : '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Verification
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: pendingCount > 0 ? '#D97706' : 'var(--text-primary)', marginTop: 4 }}>
                  {pendingCount}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {pendingCount > 0 ? 'Requires Treasury Admin audit' : 'All submissions processed'}
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                ⏳
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Approved Receipts
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>
                  {approvedCount}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Official Receipts Issued
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(22, 163, 74, 0.12)',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                🧾
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Verified Collection
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
                  ₱{totalVerifiedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Deposited via GCash Merchant QR
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(0, 92, 238, 0.12)',
                color: '#005CEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                💰
              </div>
            </div>
          </div>

        </div>

        {/* ── SEARCH & STATUS FILTER TOOLBAR ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-elevated, var(--bg-hover))', padding: 4, borderRadius: 10 }}>
            {(['Pending Approval', 'Approved', 'Rejected', 'All'] as const).map(tab => {
              const isActive = statusFilter === tab;
              const count = tab === 'Pending Approval' ? pendingCount : tab === 'Approved' ? approvedCount : tab === 'All' ? approvalsList.length : approvalsList.filter(i => i.status === 'Rejected').length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: isActive ? '#16A34A' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>{tab === 'Pending Approval' ? '⏳ Pending' : tab === 'Approved' ? '✓ Approved' : tab === 'Rejected' ? '✕ Rejected' : 'All'}</span>
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 9999
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 280, flex: '1 1 280px', maxWidth: 420 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by resident, Ref #, or block/lot..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: 34,
                borderRadius: 10,
                fontSize: 13,
                height: 38,
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* ── APPROVAL OF PAYMENT TABLE ── */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated, var(--bg-hover))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                Dues Payment Submissions Queue ({filteredList.length})
              </h3>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Click <strong>Review &amp; Approve</strong> to inspect submitted proof and issue official receipt.
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated, var(--bg-hover))', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>RESIDENT / PAYOR</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>ASSESSMENT PERIOD</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>AMOUNT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>CHANNEL</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>GCASH REF NO.</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>PAYMENT PROOF</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>SUBMITTED AT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>STATUS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, textAlign: 'right' }}>ADMIN ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>No payment submissions found matching your filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map(item => {
                    const isPending = item.status === 'Pending Approval';
                    const isApproved = item.status === 'Approved';
                    const isRejected = item.status === 'Rejected';

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: isPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Resident / Payor */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13.5 }}>
                            {item.payorName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {item.propertyAddress}
                          </div>
                          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>
                            {item.memberId}
                          </div>
                        </td>

                        {/* Assessment Period */}
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {item.billingPeriod}
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>
                          {item.amount}
                        </td>

                        {/* Channel */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: 'rgba(0, 92, 238, 0.12)',
                            color: '#005CEE',
                            border: '1px solid rgba(0, 92, 238, 0.25)',
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span>📱</span> {item.channel}
                          </span>
                        </td>

                        {/* GCash Ref No */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#1E293B',
                            background: '#F1F5F9',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 12.5,
                            letterSpacing: '0.04em'
                          }}>
                            {item.refNo}
                          </span>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                            Sender: {item.senderPhone}
                          </div>
                        </td>

                        {/* Payment Proof Thumbnail */}
                        <td style={{ padding: '14px 18px' }}>
                          {item.screenshotUrl ? (
                            <div
                              onClick={() => setPreviewScreenshotUrl(item.screenshotUrl)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 8px',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: 'var(--bg-elevated, var(--bg-hover))',
                                transition: 'all 0.15s ease'
                              }}
                              title="Click to zoom proof"
                            >
                              <img
                                src={item.screenshotUrl}
                                alt="Proof preview"
                                style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
                              />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', textDecoration: 'underline' }}>
                                View Proof
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No Screenshot</span>
                          )}
                        </td>

                        {/* Submitted At */}
                        <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {item.submittedAt}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 18px' }}>
                          {isPending && (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#D97706',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '4px 12px',
                              borderRadius: 9999,
                              fontWeight: 700,
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              <span>⏳</span> Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <div>
                              <span style={{
                                background: 'rgba(22, 163, 74, 0.12)',
                                color: '#16A34A',
                                border: '1px solid rgba(22, 163, 74, 0.3)',
                                padding: '4px 12px',
                                borderRadius: 9999,
                                fontWeight: 700,
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                              }}>
                                <span>✓</span> Approved &amp; Paid
                              </span>
                              {item.orNumber && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                  OR: {item.orNumber}
                                </div>
                              )}
                            </div>
                          )}
                          {isRejected && (
                            <div>
                              <span style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '4px 12px',
                                borderRadius: 9999,
                                fontWeight: 700,
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                              }}>
                                <span>✕</span> Rejected
                              </span>
                              {item.rejectionReason && (
                                <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2, maxWidth: 160 }}>
                                  {item.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Admin Action */}
                        <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isPending && (
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => setSelectedForReview({
                                  id: item.id,
                                  payorName: item.payorName,
                                  propertyAddress: item.propertyAddress,
                                  amount: item.amount,
                                  amountNumber: item.amountNumber,
                                  billingPeriod: item.billingPeriod,
                                  refNo: item.refNo,
                                  senderPhone: item.senderPhone,
                                  dateStr: item.submittedAt,
                                  screenshotUrl: item.screenshotUrl,
                                })}
                                style={{
                                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '7px 16px',
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                                }}
                              >
                                <span>🛡️</span> Review &amp; Approve
                              </button>
                            </div>
                          )}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => {
                                const receiptData: ReceiptData = {
                                  orNumber: item.orNumber || 'NRG-OR-2026-09118',
                                  dateStr: item.submittedAt,
                                  billingPeriod: item.billingPeriod,
                                  payorName: item.payorName,
                                  propertyAddress: item.propertyAddress,
                                  memberId: item.memberId,
                                  paymentChannel: 'GCash Express (Verified)',
                                  refNo: item.refNo,
                                  amountNumber: item.amountNumber,
                                  amountStr: item.amount,
                                  amountInWords: 'Three Thousand Philippine Pesos Only',
                                  breakdown: [
                                    { item: 'Current Assessment (Monthly HOA Association Dues)', cost: 2500 },
                                    { item: 'Previous Arrears (Security & Common Maintenance)', cost: 500 },
                                  ],
                                  approvedBy: item.approvedBy || user?.fullName || 'HOA Treasury Administrator',
                                  approvedAt: item.approvedAt || item.submittedAt,
                                  screenshotUrl: item.screenshotUrl,
                                };
                                setSelectedReceipt(receiptData);
                              }}
                              style={{
                                background: '#FFFFFF',
                                color: '#16A34A',
                                border: '1px solid #16A34A',
                                borderRadius: 8,
                                padding: '7px 14px',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <span>🧾</span> View Receipt
                            </button>
                          )}
                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => setSelectedForReview({
                                id: item.id,
                                payorName: item.payorName,
                                propertyAddress: item.propertyAddress,
                                amount: item.amount,
                                amountNumber: item.amountNumber,
                                billingPeriod: item.billingPeriod,
                                refNo: item.refNo,
                                senderPhone: item.senderPhone,
                                dateStr: item.submittedAt,
                                screenshotUrl: item.screenshotUrl,
                              })}
                              style={{
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              Re-evaluate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── ADMIN VERIFICATION & APPROVAL MODAL ── */}
      {selectedForReview && (
        <AdminPaymentVerificationModal
          data={selectedForReview}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
          onClose={() => setSelectedForReview(null)}
        />
      )}

      {/* ── OFFICIAL PRINTABLE RECEIPT MODAL ── */}
      {selectedReceipt && (
        <OfficialPrintableReceipt
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* ── STANDALONE PROOF IMAGE PREVIEW MODAL ── */}
      {previewScreenshotUrl && (
        <div className="modal-overlay" onClick={() => setPreviewScreenshotUrl(null)} style={{ zIndex: 9999 }}>
          <div
            className="modal-box"
            style={{
              maxWidth: 480,
              background: 'var(--bg-surface)',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                📸 Submitted Payment Screenshot Proof
              </div>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <img
              src={previewScreenshotUrl}
              alt="Proof"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            />
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => setPreviewScreenshotUrl(null)}
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
