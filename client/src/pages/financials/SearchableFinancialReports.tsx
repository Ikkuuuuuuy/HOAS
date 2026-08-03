import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';

export default function SearchableFinancialReports() {
  const { data: financials, isLoading } = useApi<any>('/api/hoa/financials');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const ledgers = financials?.myDues?.ledgers || [];
  const expenditures = financials?.expenditures || [];

  // Combined searchable records
  const allRecords = useMemo(() => {
    const billingItems = ledgers.map((l: any) => ({
      id: l.id,
      type: 'Billing / Dues',
      category: 'dues',
      title: l.description,
      amount: l.amount + (l.previous_balance || 0),
      date: l.due_date,
      status: l.status,
      reference: `LEDGER-${l.id.slice(0, 6)}`,
    }));

    const expItems = expenditures.map((e: any) => ({
      id: e.id,
      type: 'HOA Expenditure',
      category: e.category,
      title: e.title,
      amount: e.amount,
      date: e.date_spent,
      status: 'spent',
      reference: `EXP-${e.id.slice(0, 6)}`,
    }));

    return [...billingItems, ...expItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ledgers, expenditures]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return allRecords.filter(item => {
      // Search query filter
      const matchesQuery = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Status filter
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      // Date range filter
      let matchesDate = true;
      if (startDate && new Date(item.date) < new Date(startDate)) matchesDate = false;
      if (endDate && new Date(item.date) > new Date(endDate)) matchesDate = false;

      return matchesQuery && matchesCategory && matchesStatus && matchesDate;
    });
  }, [allRecords, searchQuery, selectedCategory, selectedStatus, startDate, endDate]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <PageContainer title="Searchable Financial Reports" subtitle="BRIA Homes Northridge Grove — Detailed & Downloadable Statements">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* SUMMARY STAT CARDS */}
        <div className="grid grid-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bria-red-soft)', color: 'var(--bria-red)' }}>💰</div>
            <div>
              <div className="stat-value" style={{ color: 'var(--bria-red)' }}>
                ₱{financials?.communityOverview?.totalCollected?.toLocaleString() || '0'}
              </div>
              <div className="stat-label">Total Dues Collected</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>💸</div>
            <div>
              <div className="stat-value text-danger">
                ₱{financials?.communityOverview?.totalSpent?.toLocaleString() || '0'}
              </div>
              <div className="stat-label">Community Expenditures</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--northridge-soft)', color: 'var(--northridge-green)' }}>🏦</div>
            <div>
              <div className="stat-value" style={{ color: 'var(--northridge-lime)' }}>
                ₱{financials?.communityOverview?.netReserves?.toLocaleString() || '0'}
              </div>
              <div className="stat-label">Net Reserve Fund</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>⚠️</div>
            <div>
              <div className="stat-value text-warning">
                ₱{financials?.communityOverview?.totalOverdue?.toLocaleString() || '0'}
              </div>
              <div className="stat-label">Total Overdue Dues</div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="card mb-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="section-title" style={{ margin: 0 }}>🔍 Filter & Search Financial Records</div>
            <button className="btn btn-primary" onClick={handlePrintReport} style={{ background: 'var(--bria-red)', borderColor: 'var(--bria-red)' }}>
              🖨 Print / Export Financial Report
            </button>
          </div>

          <div className="grid grid-4 gap-4">
            {/* Search Input */}
            <div className="form-group">
              <label className="form-label">Search Keyword / Ref #</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search title, ref #, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="form-group">
              <label className="form-label">Filter Category</label>
              <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="dues">HOA Monthly Dues</option>
                <option value="security">Security Patrol</option>
                <option value="utilities">Utilities & Lighting</option>
                <option value="landscaping">Landscaping & Trees</option>
                <option value="repairs">Repairs & Infrastructure</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group">
              <label className="form-label">Transaction Status</label>
              <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
                <option value="spent">Spent (Outflow)</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <div className="flex gap-2">
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL DATA TABLE */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-bold text-primary">
              Showing {filteredRecords.length} Filtered Financial Records
            </div>
            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || startDate || endDate) && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="loading-overlay"><div className="spinner" /><span>Loading financial statements...</span></div>
          ) : filteredRecords.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Title & Description</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(rec => (
                  <tr key={rec.id}>
                    <td className="font-mono text-xs text-primary">{rec.reference}</td>
                    <td className="text-xs font-semibold">{rec.type}</td>
                    <td><span className="badge badge-issued" style={{ textTransform: 'capitalize' }}>{rec.category}</span></td>
                    <td><div className="font-semibold text-primary">{rec.title}</div></td>
                    <td className="text-xs">{rec.date}</td>
                    <td className={`font-bold ${rec.status === 'spent' ? 'text-danger' : 'text-success'}`}>
                      {rec.status === 'spent' ? '-' : '+'}₱{rec.amount.toLocaleString()}
                    </td>
                    <td><span className={`badge badge-${rec.status}`}>{rec.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No matching financial records found</h3></div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
