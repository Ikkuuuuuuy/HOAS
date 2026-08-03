import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BillingLedger() {
  const { user, accessToken } = useAuth();
  const { data: ledgers, refetch } = useApi<any[]>('/api/billing');
  const { data: billingData } = useApi<any>('/api/billing/summary');
  const { success, error: showError } = useToast();

  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('gcash');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ billingPeriod: '', amount: 2500, description: 'Monthly HOA Dues', dueDay: 10 });
  const [isGenerating, setIsGenerating] = useState(false);

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('period-desc');

  const isHOAAdmin = user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin';
  const summary = billingData?.summary;

  const handlePay = async (ledgerId: string, amount: number) => {
    try {
      const result = await apiCall('/api/billing/payments', 'POST', {
        ledgerId, paymentMethod: payMethod, amount,
      }, accessToken || undefined);
      success('Payment Successful! 💳', `₱${amount.toLocaleString()} paid via ${payMethod}. Ref: ${(result as any).referenceNo}`);
      setPayingId(null);
      refetch();
    } catch (err: any) {
      showError('Payment Failed', err.message);
    }
  };

  const handleGenerateDues = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const result: any = await apiCall('/api/billing/generate-dues', 'POST', genForm, accessToken || undefined);
      success('Dues Generated!', `Created ${result.created} billing records for ${result.billingPeriod}`);
      setShowGenerateModal(false);
      refetch();
    } catch (err: any) {
      showError('Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const statusColors: Record<string, string> = { paid: 'var(--success)', unpaid: 'var(--warning)', overdue: 'var(--danger)' };

  // Filter and Sort Ledgers
  const filteredAndSortedLedgers = useMemo(() => {
    if (!ledgers) return [];
    
    let result = ledgers.filter((item: any) => {
      const matchesSearch =
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.billing_period || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.resident_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.amount?.toString() || '').includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'period-desc') return (b.billing_period || '').localeCompare(a.billing_period || '');
      if (sortBy === 'period-asc') return (a.billing_period || '').localeCompare(b.billing_period || '');
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
      if (sortBy === 'due-desc') return (b.due_date || '').localeCompare(a.due_date || '');
      if (sortBy === 'due-asc') return (a.due_date || '').localeCompare(b.due_date || '');
      return 0;
    });

    return result;
  }, [ledgers, searchQuery, statusFilter, sortBy]);

  return (
    <PageContainer title="Billing Ledger" subtitle="HOA Dues & Payment Management">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Summary cards */}
        {isHOAAdmin && summary && (
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
            {[
              { label: 'Total Collected', value: `₱${summary.total_collected?.toLocaleString() || 0}`, icon: '💰', color: 'var(--success)' },
              { label: 'Outstanding', value: `₱${summary.total_pending?.toLocaleString() || 0}`, icon: '⏳', color: 'var(--warning)' },
              { label: 'Overdue', value: `₱${summary.total_overdue?.toLocaleString() || 0}`, icon: '🔴', color: 'var(--danger)' },
              { label: 'Paid Records', value: summary.paid_count || 0, icon: '✅', color: 'var(--success)' },
            ].map((card, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>{card.icon}</div>
                <div>
                  <div className="stat-value" style={{ color: card.color, fontSize: typeof card.value === 'string' && card.value.length > 7 ? 'var(--font-xl)' : 'var(--font-3xl)' }}>
                    {card.value}
                  </div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header actions */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Billing Records</h2>
          {isHOAAdmin && (
            <button id="generate-dues-btn" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} onClick={() => setShowGenerateModal(true)}>
              ⚡ Generate Monthly Dues
            </button>
          )}
        </div>

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
                  placeholder="Search ledger period, description, or resident..."
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
                <option value="unpaid">Unpaid Only</option>
                <option value="paid">Paid Only</option>
                <option value="overdue">Overdue Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 200 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="period-desc">Period: Newest First</option>
                <option value="period-asc">Period: Oldest First</option>
                <option value="amount-desc">Amount: Highest First</option>
                <option value="amount-asc">Amount: Lowest First</option>
                <option value="due-desc">Due Date: Latest First</option>
                <option value="due-asc">Due Date: Earliest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                {isHOAAdmin && <th>Resident</th>}
                <th>Period</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                {!isHOAAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedLedgers.map((ledger: any) => (
                <tr key={ledger.id}>
                  {isHOAAdmin && (
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ledger.resident_name}</td>
                  )}
                  <td className="font-mono">{ledger.billing_period}</td>
                  <td>{ledger.description}</td>
                  <td style={{ color: statusColors[ledger.status] || 'var(--text-primary)', fontWeight: 700 }}>
                    ₱{ledger.amount.toLocaleString()}
                  </td>
                  <td className="text-xs">{ledger.due_date}</td>
                  <td><span className={`badge badge-${ledger.status}`}>{ledger.status}</span></td>
                  {!isHOAAdmin && (
                    <td>
                      {(ledger.status === 'unpaid' || ledger.status === 'overdue') && (
                        payingId === ledger.id ? (
                          <div className="flex gap-2 items-center">
                            <select
                              className="form-select"
                              style={{ width: 110, padding: '4px 8px' }}
                              value={payMethod}
                              onChange={e => setPayMethod(e.target.value)}
                            >
                              <option value="gcash">GCash</option>
                              <option value="paymaya">PayMaya</option>
                              <option value="card">Card</option>
                              <option value="cash">Cash</option>
                            </select>
                            <button className="btn btn-sm btn-success" onClick={() => handlePay(ledger.id, ledger.amount)}>
                              Pay ₱{ledger.amount.toLocaleString()}
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setPayingId(null)}>✕</button>
                          </div>
                        ) : (
                          <button
                            id={`pay-btn-${ledger.id}`}
                            className="btn btn-sm btn-primary"
                            style={{ background: '#7C3AED', borderColor: '#7C3AED', fontWeight: 800 }}
                            onClick={() => setPayingId(ledger.id)}
                          >
                            💳 Pay Now
                          </button>
                        )
                      )}
                      {ledger.status === 'paid' && <span className="text-success" style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>✅ Paid</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedLedgers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <h3>No matching billing records found</h3>
              <p>Try adjusting your search query or sorting filter above.</p>
            </div>
          )}
        </div>

        {/* Generate dues modal */}
        {showGenerateModal && (
          <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">⚡ Generate Monthly Dues</h2>
                <button className="modal-close" onClick={() => setShowGenerateModal(false)}>✕</button>
              </div>
              <form onSubmit={handleGenerateDues} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Billing Period (YYYY-MM)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={genForm.billingPeriod}
                    onChange={e => setGenForm(f => ({ ...f, billingPeriod: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Dues Amount (₱)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={genForm.amount}
                      onChange={e => setGenForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Day of Month</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={28}
                      value={genForm.dueDay}
                      onChange={e => setGenForm(f => ({ ...f, dueDay: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={genForm.description}
                    onChange={e => setGenForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : '⚡ Generate Dues'}
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
