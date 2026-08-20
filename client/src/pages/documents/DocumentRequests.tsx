import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ServiceRequestItem {
  id: string;
  ref_no: string;
  requester_name: string;
  request_type: 'barangay_clearance' | 'cert_residency' | 'rfid_sticker' | 'renovation_permit' | 'maintenance_repair';
  priority: 'normal' | 'urgent' | 'emergency';
  details: string;
  specific_inputs: Record<string, string>;
  submitted_date: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

const INITIAL_REQUESTS: ServiceRequestItem[] = [
  {
    id: 'sr-101',
    ref_no: 'REF-2026-SR-9412',
    requester_name: 'Juan Dela Cruz (Blk 3 Lot 12)',
    request_type: 'barangay_clearance',
    priority: 'normal',
    details: 'Employment Application requirement for local city hall.',
    specific_inputs: { purpose: 'Employment Application', agency: 'San Jose del Monte City Hall' },
    submitted_date: '2026-08-04',
    due_date: '2026-08-07',
    status: 'in_progress',
  },
  {
    id: 'sr-102',
    ref_no: 'REF-2026-SR-9413',
    requester_name: 'Maria Santos (Blk 4 Lot 05)',
    request_type: 'rfid_sticker',
    priority: 'urgent',
    details: 'RFID Sticker for newly acquired SUV.',
    specific_inputs: { vehicle_type: 'SUV', plate_no: 'NGA-9821', make_model: 'Toyota Fortuner 2026' },
    submitted_date: '2026-08-05',
    due_date: '2026-08-06',
    status: 'pending',
  },
  {
    id: 'sr-103',
    ref_no: 'REF-2026-SR-9414',
    requester_name: 'Pedro Penduko (Blk 1 Lot 02)',
    request_type: 'renovation_permit',
    priority: 'normal',
    details: 'Perimeter fence extension & carport tiling.',
    specific_inputs: { scope: 'Carport Extension & Tiles', contractor: 'BuildTech Builders', est_duration: '14 Days' },
    submitted_date: '2026-08-01',
    due_date: '2026-08-04',
    status: 'completed',
  },
  {
    id: 'sr-104',
    ref_no: 'REF-2026-SR-9415',
    requester_name: 'Ana Reyes (Blk 8 Lot 14)',
    request_type: 'maintenance_repair',
    priority: 'emergency',
    details: 'Drainage blockage near Block 8 perimeter curb.',
    specific_inputs: { location: 'Block 8 Main Drainage', issue_type: 'Clogged Drainage Pipe' },
    submitted_date: '2026-08-05',
    due_date: '2026-08-05 (6 hrs)',
    status: 'in_progress',
  },
];

export default function DocumentRequests() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [requests, setRequests] = useState<ServiceRequestItem[]>(INITIAL_REQUESTS);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestItem | null>(null);

  // Form State
  const [requestType, setRequestType] = useState<ServiceRequestItem['request_type']>('barangay_clearance');
  const [priority, setPriority] = useState<ServiceRequestItem['priority']>('normal');
  const [details, setDetails] = useState('');
  
  // Specific input fields state
  const [purpose, setPurpose] = useState('');
  const [plateNo, setPlateNo] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [contractor, setContractor] = useState('');
  const [renovationScope, setRenovationScope] = useState('');
  const [repairLocation, setRepairLocation] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const isStaffOrAdmin = user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin' || user?.roleName === 'barangay_official';

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      barangay_clearance: '📄 Barangay Clearance',
      cert_residency: '🏛️ HOA Residency Certificate',
      rfid_sticker: '🚗 Gate RFID Tag / Vehicle Sticker',
      renovation_permit: '🏗️ Construction & Renovation Permit',
      maintenance_repair: '🛠️ Maintenance & Facility Repair',
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'emergency') return <span className="badge badge-danger">🚨 EMERGENCY (6 hrs)</span>;
    if (p === 'urgent') return <span className="badge badge-warning">⚡ URGENT (24 hrs)</span>;
    return <span className="badge badge-info">🟢 NORMAL (3 Days)</span>;
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const specific: Record<string, string> = {};
    if (requestType === 'barangay_clearance' || requestType === 'cert_residency') {
      specific.purpose = purpose || 'General Requirement';
    } else if (requestType === 'rfid_sticker') {
      specific.plate_no = plateNo;
      specific.make_model = makeModel;
      specific.vehicle_type = vehicleType;
    } else if (requestType === 'renovation_permit') {
      specific.scope = renovationScope;
      specific.contractor = contractor;
    } else if (requestType === 'maintenance_repair') {
      specific.location = repairLocation;
    }

    const today = new Date();
    const due = new Date();
    if (priority === 'emergency') due.setHours(today.getHours() + 6);
    else if (priority === 'urgent') due.setDate(today.getDate() + 1);
    else due.setDate(today.getDate() + 3);

    const refNo = `REF-${today.getFullYear()}-SR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReq: ServiceRequestItem = {
      id: `sr-${Date.now()}`,
      ref_no: refNo,
      requester_name: `${user?.fullName || 'Resident Owner'} (Blk 3 Lot 12)`,
      request_type: requestType,
      priority,
      details,
      specific_inputs: specific,
      submitted_date: today.toISOString().split('T')[0],
      due_date: due.toISOString().split('T')[0],
      status: 'pending',
    };

    setRequests([newReq, ...requests]);
    success('Service Request Logged!', `Ref #${refNo} queued with ${priority.toUpperCase()} priority.`);
    setShowModal(false);
    // Reset Form
    setDetails(''); setPurpose(''); setPlateNo(''); setMakeModel(''); setContractor(''); setRenovationScope(''); setRepairLocation('');
  };

  const handleStatusChange = (id: string, newStatus: ServiceRequestItem['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    success('Request Updated', `Status changed to ${newStatus.toUpperCase()}`);
  };

  // Filtered list
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        r.ref_no.toLowerCase().includes(q) ||
        r.requester_name.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        getTypeLabel(r.request_type).toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesType = typeFilter === 'all' || r.request_type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [requests, searchQuery, statusFilter, typeFilter]);

  return (
    <PageContainer title="Service Request Module" subtitle="NRG PH2 HOA INC — Document Tracking & Queuing System">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* HEADER & NEW REQUEST BUTTON */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="section-title mb-1">Service & Document Requests</h2>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Track, prioritize, and manage all Phase 2 service tickets & document issuances.</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: '#166534', borderColor: '#166534', fontWeight: 800, padding: '10px 20px' }}
            onClick={() => setShowModal(true)}
          >
            ➕ Create New Service Request
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="card mb-6" style={{ padding: 16 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 items-center flex-1" style={{ minWidth: 280 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by Reference #, resident, or details..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select className="form-select" style={{ width: 180 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="barangay_clearance">Barangay Clearance</option>
                <option value="cert_residency">HOA Residency Cert</option>
                <option value="rfid_sticker">Gate RFID Sticker</option>
                <option value="renovation_permit">Renovation Permit</option>
                <option value="maintenance_repair">Maintenance Repair</option>
              </select>
              <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* REQUESTS DATA TABLE */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Requester</th>
                <th>Request Type</th>
                <th>Priority Queue</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => (
                <tr key={r.id}>
                  <td className="font-mono font-semibold" style={{ color: '#2563EB' }}>{r.ref_no}</td>
                  <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.requester_name}</td>
                  <td>{getTypeLabel(r.request_type)}</td>
                  <td>{getPriorityBadge(r.priority)}</td>
                  <td className="text-xs font-semibold" style={{ color: '#D97706' }}>{r.due_date}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      {r.status === 'in_progress' ? '⚙️ In Progress' : r.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelectedRequest(r)}>
                        🔍 Details
                      </button>
                      {isStaffOrAdmin && r.status !== 'completed' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(r.id, 'completed')}>
                          Complete ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NEW SERVICE REQUEST MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">📝 Create New Service Request</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmitRequest} className="login-form">
                
                {/* REQUEST TYPE DROPDOWN */}
                <div className="mb-4">
                  <label className="form-label">Type of Request</label>
                  <select
                    className="form-select"
                    value={requestType}
                    onChange={e => setRequestType(e.target.value as any)}
                    required
                  >
                    <option value="barangay_clearance">📄 Barangay Clearance</option>
                    <option value="cert_residency">🏛️ HOA Certificate of Residency</option>
                    <option value="rfid_sticker">🚗 Gate RFID Tag / Vehicle Sticker</option>
                    <option value="renovation_permit">🏗️ Construction & Renovation Permit</option>
                    <option value="maintenance_repair">🛠️ Maintenance & Facility Repair</option>
                  </select>
                </div>

                {/* PRIORITY SELECTION */}
                <div className="mb-4">
                  <label className="form-label">Priority for Queueing</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                  >
                    <option value="normal">🟢 Normal Priority (Target Completion: 3 Days)</option>
                    <option value="urgent">⚡ Urgent Priority (Target Completion: 24 Hours)</option>
                    <option value="emergency">🚨 Emergency / High Priority (Target Completion: 6 Hours)</option>
                  </select>
                </div>

                {/* DYNAMIC INPUT FIELDS BASED ON REQUEST TYPE */}
                {(requestType === 'barangay_clearance' || requestType === 'cert_residency') && (
                  <div className="mb-4">
                    <label className="form-label">Purpose of Clearance / Certificate</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Employment, Bank Loan, Postal ID, Business Permit"
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                      required
                    />
                  </div>
                )}

                {requestType === 'rfid_sticker' && (
                  <div className="grid grid-3 mb-4" style={{ gap: 10 }}>
                    <div>
                      <label className="form-label">Vehicle Type</label>
                      <select className="form-select" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                        <option value="Car / Sedan">Car / Sedan</option>
                        <option value="SUV / Van">SUV / Van</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Delivery Truck">Delivery Truck</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Plate # / CS #</label>
                      <input type="text" className="form-input" placeholder="e.g. NGA-9821" value={plateNo} onChange={e => setPlateNo(e.target.value)} required />
                    </div>
                    <div>
                      <label className="form-label">Make / Model</label>
                      <input type="text" className="form-input" placeholder="e.g. Toyota Vios" value={makeModel} onChange={e => setMakeModel(e.target.value)} required />
                    </div>
                  </div>
                )}

                {requestType === 'renovation_permit' && (
                  <div className="grid grid-2 mb-4" style={{ gap: 12 }}>
                    <div>
                      <label className="form-label">Scope of Construction</label>
                      <input type="text" className="form-input" placeholder="e.g., Fence extension, Extension" value={renovationScope} onChange={e => setRenovationScope(e.target.value)} required />
                    </div>
                    <div>
                      <label className="form-label">Contractor Name</label>
                      <input type="text" className="form-input" placeholder="e.g., BuildTech Builders" value={contractor} onChange={e => setContractor(e.target.value)} required />
                    </div>
                  </div>
                )}

                {requestType === 'maintenance_repair' && (
                  <div className="mb-4">
                    <label className="form-label">Repair Location / Block & Lot</label>
                    <input type="text" className="form-input" placeholder="e.g., Block 8 Curb, Main Ave Streetlight" value={repairLocation} onChange={e => setRepairLocation(e.target.value)} required />
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label">Detailed Request Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Provide additional details regarding your request..."
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ background: '#166534', borderColor: '#166534', fontWeight: 800, padding: 12 }}>
                  Submit Request & Issue Reference #
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DETAILS VIEW MODAL */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">📌 Request Details ({selectedRequest.ref_no})</h2>
                <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
              </div>
              <div style={{ padding: '10px 0' }}>
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700 }}>REQUESTER</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{selectedRequest.requester_name}</div>
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700 }}>REQUEST TYPE & PRIORITY</div>
                <div className="flex gap-2 items-center mb-4 mt-1">
                  <span>{getTypeLabel(selectedRequest.request_type)}</span>
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700 }}>DETAILS</div>
                <p style={{ color: '#374151', background: '#F9FAFB', padding: 12, borderRadius: 8, marginTop: 4, fontSize: 14 }}>{selectedRequest.details}</p>
                {Object.keys(selectedRequest.specific_inputs).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700 }}>SPECIFIC METADATA</div>
                    <pre style={{ background: '#F3F4F6', padding: 10, borderRadius: 6, fontSize: 12, marginTop: 4 }}>
                      {JSON.stringify(selectedRequest.specific_inputs, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
