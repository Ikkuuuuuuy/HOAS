import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';

interface LedgerItem {
  id: string;
  resident_name: string;
  billing_period: string;
  description: string;
  amount: number;
  paid_amount?: number;
  balance?: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'pending_approval' | 'rejected';
  payment_type?: 'full' | 'partial';
  payment_method?: string;
  reference_no?: string;
  proof_url?: string;
}

const INITIAL_LEDGERS: LedgerItem[] = [
  { id: 'led-1', resident_name: 'Juan Dela Cruz (Blk 3 Lot 12)', billing_period: '2026-08', description: 'Monthly & Association Dues (Combined)', amount: 2500, paid_amount: 0, balance: 2500, due_date: '2026-08-10', status: 'unpaid' },
  { id: 'led-2', resident_name: 'Maria Santos (Blk 4 Lot 05)', billing_period: '2026-08', description: 'Monthly & Association Dues (Combined)', amount: 2500, paid_amount: 1500, balance: 1000, due_date: '2026-08-10', status: 'pending_approval', payment_type: 'partial', payment_method: 'gcash', reference_no: 'GCASH-98214-88', proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop' },
  { id: 'led-3', resident_name: 'Pedro Penduko (Blk 1 Lot 02)', billing_period: '2026-07', description: 'Monthly & Association Dues (Combined)', amount: 2500, paid_amount: 2500, balance: 0, due_date: '2026-07-10', status: 'paid', payment_type: 'full', payment_method: 'bank_transfer', reference_no: 'BDO-TRX-441209' },
  { id: 'led-4', resident_name: 'Ana Reyes (Blk 8 Lot 14)', billing_period: '2026-06', description: 'Monthly & Association Dues (Combined)', amount: 2500, paid_amount: 0, balance: 2500, due_date: '2026-06-10', status: 'overdue' },
];

export default function BillingLedger() {
  const { user, accessToken } = useAuth();
  const { data: serverLedgers } = useApi<any[]>('/api/billing');
  const { success, error: showError } = useToast();

  const [localLedgers, setLocalLedgers] = useState<LedgerItem[]>(INITIAL_LEDGERS);
  
  // Payment Modal state
  const [selectedLedger, setSelectedLedger] = useState<LedgerItem | null>(null);
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<number>(1250);
  const [paymentChannel, setPaymentChannel] = useState<'gcash' | 'bank_transfer'>('gcash');
  const [selectedBank, setSelectedBank] = useState<string>('BDO');
  const [referenceNo, setReferenceNo] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('period-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isHOAAdmin = user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin';

  // Open Payment Modal
  const handleOpenPaymentModal = (item: LedgerItem) => {
    setSelectedLedger(item);
    setPaymentType('full');
    setPartialAmount(Math.round(item.amount / 2));
    setReferenceNo(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
    setProofImage(null);
  };

  // Submit Payment Proof
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger) return;

    const amountToPay = paymentType === 'full' ? (selectedLedger.balance || selectedLedger.amount) : Number(partialAmount);
    if (amountToPay <= 0 || amountToPay > (selectedLedger.balance || selectedLedger.amount)) {
      showError('Invalid Amount', 'Please enter a valid partial amount.');
      return;
    }

    const updated = localLedgers.map(item => {
      if (item.id === selectedLedger.id) {
        const newPaid = (item.paid_amount || 0) + amountToPay;
        const newBal = item.amount - newPaid;
        return {
          ...item,
          paid_amount: newPaid,
          balance: newBal,
          status: 'pending_approval' as const,
          payment_type: paymentType,
          payment_method: paymentChannel,
          reference_no: referenceNo || `REF-${Date.now()}`,
          proof_url: proofImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop'
        };
      }
      return item;
    });

    setLocalLedgers(updated);
    success('Payment Submitted for Verification! 💳', `Submitted ₱${amountToPay.toLocaleString()} via ${paymentChannel.toUpperCase()}. Ref: ${referenceNo}`);
    setSelectedLedger(null);
  };

  // Admin Approval Handler
  const handleAdminVerify = (ledgerId: string, approve: boolean) => {
    setLocalLedgers(prev => prev.map(item => {
      if (item.id === ledgerId) {
        if (approve) {
          const isFullyPaid = (item.balance || 0) <= 0;
          return { ...item, status: isFullyPaid ? 'paid' : 'unpaid' };
        } else {
          return { ...item, status: 'rejected' };
        }
      }
      return item;
    }));

    if (approve) success('Payment Approved ✅', 'Ledger status updated.');
    else showError('Payment Rejected ❌', 'Resident notified to resubmit proof.');
  };

  // Image File Upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    let result = localLedgers.filter(item => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resident_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.billing_period.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'period-desc') return b.billing_period.localeCompare(a.billing_period);
      if (sortBy === 'period-asc') return a.billing_period.localeCompare(b.billing_period);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'name-asc') return a.resident_name.localeCompare(b.resident_name);
      if (sortBy === 'balance-desc') return (b.balance || 0) - (a.balance || 0);
      return 0;
    });

    return result;
  }, [localLedgers, searchQuery, statusFilter, sortBy]);

  const paginatedLedgers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLedgers.slice(start, start + pageSize);
  }, [filteredLedgers, currentPage, pageSize]);

  return (
    <PageContainer title="Financial Module" subtitle="NRG PH2 HOA INC — Unified Monthly & Association Dues">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#16653420', color: '#166534' }}>💰</div>
            <div>
              <div className="stat-value" style={{ color: '#166534' }}>₱142,500</div>
              <div className="stat-label">Total Dues Collected (Aug)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>⏳</div>
            <div>
              <div className="stat-value" style={{ color: '#F59E0B' }}>₱32,500</div>
              <div className="stat-label">Pending Verification</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#DC262620', color: '#DC2626' }}>🔴</div>
            <div>
              <div className="stat-value" style={{ color: '#DC2626' }}>₱7,500</div>
              <div className="stat-label">Overdue Balance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#2563EB20', color: '#2563EB' }}>📄</div>
            <div>
              <div className="stat-value" style={{ color: '#2563EB' }}>100%</div>
              <div className="stat-label">Unified Dues Structure</div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="card mb-6" style={{ padding: 16 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 items-center flex-1" style={{ minWidth: 280 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by resident name, period..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select"
                style={{ width: 180 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                className="form-select"
                style={{ width: 190 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="period-desc">Sort: Period (Newest)</option>
                <option value="period-asc">Sort: Period (Oldest)</option>
                <option value="amount-desc">Sort: Dues (Highest)</option>
                <option value="name-asc">Sort: Resident (A-Z)</option>
                <option value="balance-desc">Sort: Balance (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE OF BILLING LEDGERS */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Billing Period</th>
                <th>Description</th>
                <th>Total Dues</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLedgers.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.resident_name}</td>
                  <td className="font-mono">{item.billing_period}</td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>🏷️ {item.description}</span>
                  </td>
                  <td style={{ fontWeight: 800 }}>₱{item.amount.toLocaleString()}</td>
                  <td style={{ color: '#166534', fontWeight: 700 }}>₱{(item.paid_amount || 0).toLocaleString()}</td>
                  <td style={{ color: item.balance ? '#DC2626' : '#6B7280', fontWeight: 700 }}>₱{(item.balance || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${item.status || 'unpaid'}`}>
                      {item.status === 'pending_approval' ? '⏳ Pending Approval' : String(item.status || 'UNPAID').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {(item.status === 'unpaid' || item.status === 'overdue' || item.status === 'rejected') && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#166534', color: '#FFF', fontWeight: 700 }}
                        onClick={() => handleOpenPaymentModal(item)}
                      >
                        💳 Pay Dues
                      </button>
                    )}
                    {item.status === 'pending_approval' && isHOAAdmin && (
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => handleAdminVerify(item.id, true)}>
                          Approve ✅
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAdminVerify(item.id, false)}>
                          Reject ❌
                        </button>
                      </div>
                    )}
                    {item.status === 'paid' && <span style={{ color: '#166534', fontWeight: 800 }}>✓ Settled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLedgers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* PAYMENT MODAL (WITH GCASH QR & TEST BANK DETAILS) */}
        {selectedLedger && (
          <div className="modal-overlay" onClick={() => setSelectedLedger(null)}>
            <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">💳 Dues Payment & Proof Upload</h2>
                <button className="modal-close" onClick={() => setSelectedLedger(null)}>✕</button>
              </div>

              <form onSubmit={handleSubmitPayment} className="login-form">
                
                {/* BILL SUMMARY BOX */}
                <div style={{ background: 'var(--bg-hover, #F3F4F6)', border: '1px solid var(--border)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>UNIFIED DUES STATEMENT</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{selectedLedger.description}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Total Bill: <strong>₱{selectedLedger.amount.toLocaleString()}</strong> | Remaining Balance: <span style={{ color: '#DC2626', fontWeight: 800 }}>₱{(selectedLedger.balance || selectedLedger.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* PAYMENT TYPE DROPDOWN (FULL vs PARTIAL) */}
                <div className="grid grid-2 mb-4" style={{ gap: 14 }}>
                  <div>
                    <label className="form-label">Payment Option</label>
                    <select
                      className="form-select"
                      value={paymentType}
                      onChange={e => setPaymentType(e.target.value as 'full' | 'partial')}
                    >
                      <option value="full">Full Payment (₱{(selectedLedger.balance || selectedLedger.amount).toLocaleString()})</option>
                      <option value="partial">Partial Payment</option>
                    </select>
                  </div>

                  {paymentType === 'partial' && (
                    <div>
                      <label className="form-label">Enter Partial Amount (₱)</label>
                      <input
                        type="number"
                        className="form-input"
                        min={500}
                        max={selectedLedger.balance || selectedLedger.amount}
                        value={partialAmount}
                        onChange={e => setPartialAmount(Number(e.target.value))}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* PAYMENT METHOD TOGGLE (GCASH QR vs BANK TRANSFER) */}
                <div className="mb-4">
                  <label className="form-label">Select Test Payment Channel</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`btn flex-1 ${paymentChannel === 'gcash' ? 'btn-primary' : 'btn-secondary'}`}
                      style={paymentChannel === 'gcash' ? { background: '#005CE6', borderColor: '#005CE6', fontWeight: 800 } : {}}
                      onClick={() => setPaymentChannel('gcash')}
                    >
                      📱 GCash QR Code
                    </button>
                    <button
                      type="button"
                      className={`btn flex-1 ${paymentChannel === 'bank_transfer' ? 'btn-primary' : 'btn-secondary'}`}
                      style={paymentChannel === 'bank_transfer' ? { background: '#166534', borderColor: '#166534', fontWeight: 800 } : {}}
                      onClick={() => setPaymentChannel('bank_transfer')}
                    >
                      🏛️ Bank Transfer
                    </button>
                  </div>
                </div>

                {/* DISPLAY GCASH QR CODE CONTAINER */}
                {paymentChannel === 'gcash' && (
                  <div style={{ background: '#EFF6FF', border: '2px dashed #3B82F6', borderRadius: 12, padding: 18, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1E40AF', marginBottom: 8 }}>
                      Scan GCash QR Code to Pay ₱{(paymentType === 'full' ? (selectedLedger.balance || selectedLedger.amount) : partialAmount).toLocaleString()}
                    </div>
                    {/* Simulated High-Res GCash QR Container */}
                    <div style={{ width: 160, height: 160, margin: '0 auto', background: '#FFF', border: '4px solid #005CE6', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#005CE6', color: '#FFF', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4, marginBottom: 6 }}>GCash</div>
                      <img src="/nrg-ph2-logo.png" alt="GCash Merchant Seal" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                      <div style={{ fontSize: 8, fontWeight: 800, color: '#005CE6', marginTop: 4 }}>SCAN TO PAY</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A', marginTop: 10 }}>Merchant: NRG PH2 HOA INC</div>
                    <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>GCash No: 0917-123-4567</div>
                  </div>
                )}

                {/* DISPLAY TEST BANK TRANSFER DETAILS */}
                {paymentChannel === 'bank_transfer' && (
                  <div style={{ background: '#F0FDF4', border: '2px dashed #166534', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 10 }}>
                      Bank Account Details for Transfer (NRG PH2 HOA INC)
                    </div>
                    <div className="grid grid-3" style={{ gap: 10 }}>
                      {[
                        { bank: 'BDO Unibank', accNo: '0012-3456-7890' },
                        { bank: 'BPI', accNo: '9876-5432-10' },
                        { bank: 'UnionBank', accNo: '1098-7654-3210' },
                      ].map(b => (
                        <div
                          key={b.bank}
                          onClick={() => setSelectedBank(b.bank)}
                          style={{
                            padding: 10, borderRadius: 8, background: selectedBank === b.bank ? '#DCFCE7' : '#FFF',
                            border: selectedBank === b.bank ? '2px solid #166534' : '1px solid #E5E7EB',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>{b.bank}</div>
                          <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginTop: 2 }}>{b.accNo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROOF OF PAYMENT SCREENSHOT UPLOAD */}
                <div className="mb-4">
                  <label className="form-label">Upload Payment Screenshot / Receipt</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={handleFileChange}
                    required
                  />
                  {proofImage && (
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                      <img src={proofImage} alt="Payment Proof Preview" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid #DDD' }} />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Transaction Reference #</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., GCASH-88192-001"
                    value={referenceNo}
                    onChange={e => setReferenceNo(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ background: '#166534', borderColor: '#166534', fontWeight: 800, padding: 12 }}>
                  Submit Payment Proof for Admin Verification
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
