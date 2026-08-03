import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DocumentRequests() {
  const { user, accessToken } = useAuth();
  const { data: documents, refetch } = useApi<any[]>('/api/documents');
  const { success, error: showError } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ docType: 'barangay_clearance', purpose: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const canRequest = user?.roleName === 'resident';
  const canApprove = user?.roleName === 'barangay_official' || user?.roleName === 'super_admin' || user?.roleName === 'hoa_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall('/api/documents', 'POST', form, accessToken || undefined);
      success('Request Submitted!', 'Your document request has been queued for processing.');
      setShowModal(false);
      setForm({ docType: 'barangay_clearance', purpose: '' });
      refetch();
    } catch (err: any) {
      showError('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    try {
      await apiCall(`/api/documents/${docId}/status`, 'PATCH', { status: newStatus }, accessToken || undefined);
      success(`Status Updated to ${newStatus}`, 'Document status has been updated successfully.');
      refetch();
    } catch (err: any) {
      showError('Update Failed', err.message);
    }
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      barangay_clearance: 'Barangay Clearance',
      cert_indigency: 'Certificate of Indigency',
      cert_residency: 'Certificate of Residency',
    };
    return labels[type] || type;
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = { pending: 'approved', approved: 'paid', paid: 'issued' };
    return flow[current];
  };

  // Filter & Sort Documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    let result = documents.filter((doc: any) => {
      const q = searchQuery.toLowerCase();
      const typeLabel = getDocTypeLabel(doc.doc_type).toLowerCase();
      const matchesSearch =
        typeLabel.includes(q) ||
        (doc.purpose || '').toLowerCase().includes(q) ||
        (doc.requester_name || '').toLowerCase().includes(q) ||
        (doc.fee?.toString() || '').includes(q);

      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'date-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'date-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'type-asc') return getDocTypeLabel(a.doc_type).localeCompare(getDocTypeLabel(b.doc_type));
      if (sortBy === 'requester-asc') return (a.requester_name || '').localeCompare(b.requester_name || '');
      return 0;
    });

    return result;
  }, [documents, searchQuery, statusFilter, sortBy]);

  return (
    <PageContainer title="Document Requests" subtitle="Barangay Certificate & Clearance Engine">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* Pipeline visualization */}
        <div className="card mb-6">
          <div className="section-title">Document Issuance Pipeline</div>
          <div className="flex items-center gap-0" style={{ overflowX: 'auto', padding: 'var(--space-2) 0' }}>
            {['pending', 'approved', 'paid', 'issued'].map((stage, i) => {
              const count = documents?.filter(d => d.status === stage).length || 0;
              const colors: Record<string, string> = { pending: '#F59E0B', approved: '#10B981', paid: '#3B82F6', issued: '#8B5CF6' };
              return (
                <React.Fragment key={stage}>
                  <div style={{
                    flex: 1, textAlign: 'center', padding: 'var(--space-4)',
                    background: `${colors[stage]}15`, borderRadius: 'var(--radius-md)',
                    border: `1px solid ${colors[stage]}30`,
                  }}>
                    <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: colors[stage] }}>{count}</div>
                    <div className="text-xs" style={{ color: colors[stage], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                      {stage}
                    </div>
                  </div>
                  {i < 3 && <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem', padding: '0 var(--space-2)' }}>→</div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Document Request Directory</h2>
          {canRequest && (
            <button id="new-doc-request-btn" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} onClick={() => setShowModal(true)}>
              + New Document Request
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
                  placeholder="Search document type, purpose, or requester..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="issued">Issued</option>
                <option value="rejected">Rejected</option>
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
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="type-asc">Document Type (A-Z)</option>
                <option value="requester-asc">Requester (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Type</th>
                {canApprove && <th>Requester</th>}
                <th>Purpose</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Date Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc: any) => (
                <tr key={doc.id}>
                  <td>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>
                      {getDocTypeLabel(doc.doc_type)}
                    </div>
                  </td>
                  {canApprove && <td>{doc.requester_name}</td>}
                  <td className="truncate" style={{ maxWidth: 150 }}>{doc.purpose}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {doc.fee === 0 ? 'Free' : `₱${doc.fee}`}
                  </td>
                  <td><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                  <td className="text-xs">{new Date(doc.created_at).toLocaleDateString('en-PH')}</td>
                  <td>
                    <div className="flex gap-2">
                      {doc.status === 'issued' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          📄 View Certificate
                        </button>
                      )}

                      {canApprove && (
                        <>
                          {getNextStatus(doc.status) && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(doc.id, getNextStatus(doc.status))}
                            >
                              → Move to {getNextStatus(doc.status)}
                            </button>
                          )}
                          {doc.status !== 'rejected' && doc.status !== 'issued' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStatusChange(doc.id, 'rejected')}
                            >
                              ✕ Reject
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocuments.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No matching document requests found</h3>
              <p>Try adjusting your search query or status filter.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">📄 Request Barangay Clearance</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select
                    className="form-select"
                    value={form.docType}
                    onChange={e => setForm(f => ({ ...f, docType: e.target.value }))}
                    id="doc-type-select"
                  >
                    <option value="barangay_clearance">Barangay Clearance (₱50)</option>
                    <option value="cert_residency">Certificate of Residency (₱30)</option>
                    <option value="cert_indigency">Certificate of Indigency (Free)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Request</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g., Employment requirement, Bank account opening..."
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    required
                    id="doc-purpose-input"
                  />
                </div>
                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} disabled={isSubmitting} id="submit-doc-request-btn">
                    {isSubmitting ? 'Submitting...' : '📄 Submit Request'}
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
