import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';

export default function VisitorLogbook() {
  const { user, accessToken } = useAuth();
  const { data: visitors, refetch } = useApi<any[]>('/api/visitors');
  const { data: stats } = useApi<any>('/api/visitors/stats');
  const { data: residents } = useApi<any[]>('/api/residents');
  const { success, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    hostId: '',
    visitorName: '',
    visitorIdType: 'national_id',
    visitorIdNo: '',
    vehiclePlate: '',
    purpose: '',
  });

  const isGuard = user?.roleName === 'security_guard';
  const canLog = isGuard || user?.roleName === 'super_admin';

  const handleLogVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall('/api/visitors', 'POST', form, accessToken || undefined);
      success('Visitor Logged!', `${form.visitorName} has been logged in with a gate pass.`);
      setShowModal(false);
      setForm({ hostId: '', visitorName: '', visitorIdType: 'national_id', visitorIdNo: '', vehiclePlate: '', purpose: '' });
      refetch();
    } catch (err: any) {
      showError('Logging Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (visitorId: string, visitorName: string) => {
    try {
      await apiCall(`/api/visitors/${visitorId}/checkout`, 'PATCH', {}, accessToken || undefined);
      success('Checked Out', `${visitorName} has been logged out.`);
      refetch();
    } catch (err: any) {
      showError('Checkout Failed', err.message);
    }
  };

  // Filter and Sort Visitors
  const filteredVisitors = useMemo(() => {
    if (!visitors) return [];

    let result = visitors.filter((v: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (v.visitor_name || '').toLowerCase().includes(q) ||
        (v.host_name || '').toLowerCase().includes(q) ||
        (v.purpose || '').toLowerCase().includes(q) ||
        (v.vehicle_plate || '').toLowerCase().includes(q) ||
        (v.gate_pass_qr || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'inside' && !v.time_out) ||
        (statusFilter === 'checked_out' && !!v.time_out);

      return matchesSearch && matchesStatus;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'time-desc') return new Date(b.time_in).getTime() - new Date(a.time_in).getTime();
      if (sortBy === 'time-asc') return new Date(a.time_in).getTime() - new Date(b.time_in).getTime();
      if (sortBy === 'name-asc') return (a.visitor_name || '').localeCompare(b.visitor_name || '');
      if (sortBy === 'host-asc') return (a.host_name || '').localeCompare(b.host_name || '');
      return 0;
    });

    return result;
  }, [visitors, searchQuery, statusFilter, sortBy]);

  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, currentPage, pageSize]);

  return (
    <PageContainer title="Visitor Logbook" subtitle="Gate Entry Management & Digital Gate Pass">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: "Today's Entries", value: stats?.total_today ?? '—', icon: '🚗', color: 'var(--security-color)', bg: 'var(--security-soft)' },
            { label: 'Currently Inside', value: stats?.currently_inside ?? '—', icon: '🏠', color: 'var(--info)', bg: 'var(--info-soft)' },
            { label: 'Checked Out', value: stats?.checked_out ?? '—', icon: '✅', color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'With Vehicle', value: stats?.with_vehicle ?? '—', icon: '🚙', color: 'var(--warning)', bg: 'var(--warning-soft)' },
          ].map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Header actions */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Visitor Log Directory</h2>
          {canLog && (
            <button id="log-visitor-btn" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} onClick={() => setShowModal(true)}>
              + Log New Visitor
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
                  placeholder="Search visitor name, host, plate #, or QR pass..."
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
                <option value="all">All Visitors</option>
                <option value="inside">Currently Inside</option>
                <option value="checked_out">Checked Out</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 190 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="time-desc">Time In: Newest First</option>
                <option value="time-asc">Time In: Oldest First</option>
                <option value="name-asc">Visitor Name (A-Z)</option>
                <option value="host-asc">Host Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visitor table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Host Resident</th>
                <th>Purpose</th>
                <th>ID Type</th>
                <th>Vehicle Plate</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Gate Pass</th>
                <th>Status</th>
                {canLog && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedVisitors.map((v: any) => (
                <tr key={v.id}>
                  <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.visitor_name}</td>
                  <td>{v.host_name}</td>
                  <td className="truncate" style={{ maxWidth: 120 }}>{v.purpose}</td>
                  <td className="text-xs">{String(v.visitor_id_type || 'ID').replace(/_/g, ' ')}</td>
                  <td className="font-mono text-xs">{v.vehicle_plate || '—'}</td>
                  <td className="text-xs">{new Date(v.time_in).toLocaleString('en-PH')}</td>
                  <td className="text-xs">{v.time_out ? new Date(v.time_out).toLocaleString('en-PH') : '—'}</td>
                  <td>
                    <code style={{
                      fontSize: '9px', background: 'var(--bg-elevated)',
                      padding: '2px 6px', borderRadius: 4, color: 'var(--accent)',
                      wordBreak: 'break-all',
                    }}>
                      {v.gate_pass_qr?.slice(0, 16)}...
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${v.time_out ? 'badge-resolved' : 'badge-inside'}`}>
                      {v.time_out ? 'Out' : 'Inside'}
                    </span>
                  </td>
                  {canLog && (
                    <td>
                      {!v.time_out && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleCheckout(v.id, v.visitor_name)}
                          id={`checkout-${v.id}`}
                        >
                          → Check Out
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVisitors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🚗</div>
              <h3>No matching visitor records found</h3>
              <p>Try adjusting your search query or status filter.</p>
            </div>
          )}

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredVisitors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🚗 Log Visitor Entry</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleLogVisitor} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">
                    Host Resident <span className="req-star">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.hostId}
                    onChange={e => setForm(f => ({ ...f, hostId: e.target.value }))}
                    required
                    id="host-select"
                  >
                    <option value="">— Select Resident Host —</option>
                    {residents?.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.full_name} ({r.address})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Visitor Full Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Juan dela Cruz"
                    value={form.visitorName}
                    onChange={e => setForm(f => ({ ...f, visitorName: e.target.value }))}
                    required
                    id="visitor-name-input"
                  />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">ID Type Surrendered</label>
                    <select
                      className="form-select"
                      value={form.visitorIdType}
                      onChange={e => setForm(f => ({ ...f, visitorIdType: e.target.value }))}
                    >
                      <option value="national_id">National ID</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="passport">Passport</option>
                      <option value="sss">SSS / GSIS / UMID</option>
                      <option value="other">Other ID</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID Number (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. N12-34-56789"
                      value={form.visitorIdNo}
                      onChange={e => setForm(f => ({ ...f, visitorIdNo: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Vehicle Plate Number (if driving)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ABC 1234"
                      value={form.vehiclePlate}
                      onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Purpose of Visit <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Personal visit, Delivery"
                      value={form.purpose}
                      onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Visitor Logbook Privacy Notice */}
                <div style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Gate Logbook Privacy (R.A. 10173):</strong> Visitor details are recorded solely for subdivision physical security and perimeter monitoring. Records are protected and auto-purged on scheduled cycles.
                  </span>
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} disabled={isSubmitting} id="submit-visitor-btn">
                    {isSubmitting ? 'Generating Gate Pass...' : '🔑 Log Entry & Issue Gate Pass'}
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
