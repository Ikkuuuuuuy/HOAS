import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export type RequestType = 
  | 'move_in_out'
  | 'home_improvement'
  | 'car_sticker'
  | 'certificate'
  | 'amenity_reservation'
  | 'general_maintenance';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'emergency';

export type RequestStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceRequestItem {
  id: string;
  ref_no: string;
  // Requester & Property
  block: string;
  lot: string;
  street_name: string;
  registered_owner_name: string;
  requester_name: string;
  relationship_to_owner: string;
  contact_number: string;
  email: string;
  
  // Type & Priority
  request_type: RequestType;
  priority: PriorityLevel;
  due_date: string;
  status: RequestStatus;
  submitted_date: string;
  
  // Specific Metadata & Uploads
  specific_data: Record<string, any>;
  remarks?: string;
  admin_notes?: string;
}

const INITIAL_REQUESTS: ServiceRequestItem[] = [
  {
    id: 'sr-201',
    ref_no: 'REF-2026-SR-9412',
    block: 'Block 3',
    lot: 'Lot 12',
    street_name: 'Mahogany Street',
    registered_owner_name: 'Juan Dela Cruz',
    requester_name: 'Juan Dela Cruz',
    relationship_to_owner: 'Self (Owner)',
    contact_number: '0917-889-1234',
    email: 'juandelacruz@gmail.com',
    request_type: 'certificate',
    priority: 'medium',
    due_date: '2026-08-24',
    status: 'under_review',
    submitted_date: '2026-08-21',
    specific_data: {
      cert_type: 'Certificate of Residency',
      purpose: 'Bank Requirement / Home Mortgage',
      num_copies: 2,
      collection_pref: 'Digital Copy (PDF)',
    },
    remarks: 'Needed for bank requirement submission on Monday.',
  },
  {
    id: 'sr-202',
    ref_no: 'REF-2026-SR-9413',
    block: 'Block 4',
    lot: 'Lot 05',
    street_name: 'Palmera Avenue',
    registered_owner_name: 'Maria Santos',
    requester_name: 'Maria Santos',
    relationship_to_owner: 'Self (Owner)',
    contact_number: '0918-555-8822',
    email: 'mariasantos@gmail.com',
    request_type: 'car_sticker',
    priority: 'high',
    due_date: '2026-08-22',
    status: 'submitted',
    submitted_date: '2026-08-21',
    specific_data: {
      make_model: 'Toyota Vios 1.3 XLE 2024',
      plate_number: 'NGA-9821',
      vehicle_color: 'Super White',
      or_cr_file: 'or_cr_scanned_vios.pdf (Uploaded)',
      driver_license_file: 'dl_santos_maria.jpg (Uploaded)',
    },
    remarks: 'Gate RFID tag & sticker for daily commute.',
  },
  {
    id: 'sr-203',
    ref_no: 'REF-2026-SR-9414',
    block: 'Block 1',
    lot: 'Lot 02',
    street_name: 'Acacia Way',
    registered_owner_name: 'Pedro Penduko',
    requester_name: 'Engr. Mark Gomez',
    relationship_to_owner: 'Contractor',
    contact_number: '0922-444-1199',
    email: 'mark@buildtech.ph',
    request_type: 'home_improvement',
    priority: 'low',
    due_date: '2026-08-26',
    status: 'in_progress',
    submitted_date: '2026-08-21',
    specific_data: {
      improvements: ['Extension', 'Fence', 'Roofing'],
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      contractor_name: 'BuildTech Builders & Construction Corp.',
      contractor_lead: 'Engr. Mark Gomez (0922-444-1199)',
      blueprint_file: 'architectural_plan_set_blk1lot2.pdf (Uploaded)',
      scope_summary: '2nd floor balcony extension, front perimeter fence replacement with steel grill, and roof repaint.',
    },
    remarks: 'Complied with setback regulations and structural clearance.',
    admin_notes: 'Inspected by Facilities Committee (Allen Tabasa). Work permit badge issued.',
  },
  {
    id: 'sr-204',
    ref_no: 'REF-2026-SR-9415',
    block: 'Block 8',
    lot: 'Lot 14',
    street_name: 'Cypress Lane',
    registered_owner_name: 'Ana Reyes',
    requester_name: 'Ana Reyes',
    relationship_to_owner: 'Self (Owner)',
    contact_number: '0905-333-7711',
    email: 'anareyes@yahoo.com',
    request_type: 'general_maintenance',
    priority: 'emergency',
    due_date: '2026-08-21 (within 4 hrs)',
    status: 'in_progress',
    submitted_date: '2026-08-21',
    specific_data: {
      issue_category: 'Drainage / Plumbing',
      location: 'Block 8 perimeter curb storm drain',
      description: 'Heavy blockage causing stormwater to overflow into driveway.',
      attachment_file: 'drainage_blockage_photo.jpg (Uploaded)',
    },
    remarks: 'Urgent assistance requested before upcoming monsoon rain.',
    admin_notes: 'Dispatched Maintenance Committee team (Conrado Laoang) at 11:30 AM.',
  },
  {
    id: 'sr-205',
    ref_no: 'REF-2026-SR-9416',
    block: 'Block 5',
    lot: 'Lot 08',
    street_name: 'Narra Street',
    registered_owner_name: 'Alma Miralles',
    requester_name: 'Carlo Mendoza',
    relationship_to_owner: 'Tenant / Lessee',
    contact_number: '0919-222-3344',
    email: 'carlomendoza@gmail.com',
    request_type: 'move_in_out',
    priority: 'medium',
    due_date: '2026-08-24',
    status: 'approved',
    submitted_date: '2026-08-20',
    specific_data: {
      move_type: 'Move-In',
      move_date: '2026-08-25',
      time_window: '08:00 AM - 12:00 PM',
      moving_company: 'Lipat Bahay Express Movers',
      truck_plate: 'NDB-4412 (6-Wheeler Forward)',
      driver_name: 'Eduardo Ramos',
      num_movers: 4,
      lease_proof_file: 'notarized_lease_agreement.pdf (Uploaded)',
    },
    remarks: 'Security gate clearance requested for the delivery truck.',
    admin_notes: 'Gate pass verified with Unit Owner Alma Miralles.',
  },
  {
    id: 'sr-206',
    ref_no: 'REF-2026-SR-9417',
    block: 'Block 2',
    lot: 'Lot 19',
    street_name: 'Pine Street',
    registered_owner_name: 'Jemma Alamillo',
    requester_name: 'Ronald Balbin',
    relationship_to_owner: 'Authorized Representative',
    contact_number: '0917-111-9988',
    email: 'ronald.balbin@nrgph2.org',
    request_type: 'amenity_reservation',
    priority: 'low',
    due_date: '2026-08-26',
    status: 'approved',
    submitted_date: '2026-08-20',
    specific_data: {
      facility: 'NRG PH2 Covered Basketball & Sports Court',
      reservation_date: '2026-08-29',
      time_slot: '06:00 PM – 08:00 PM',
      num_guests: 18,
      event_type: 'Phase 2 Youth League Exhibition Game',
    },
    remarks: 'Sports committee weekend friendly match.',
  },
];

export default function DocumentRequests() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [requests, setRequests] = useState<ServiceRequestItem[]>(INITIAL_REQUESTS);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestItem | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Form State - Common Requester & Property Details
  const [block, setBlock] = useState('Block 3');
  const [lot, setLot] = useState('Lot 12');
  const [streetName, setStreetName] = useState('Mahogany Street');
  const [registeredOwnerName, setRegisteredOwnerName] = useState(user?.fullName || 'Juan Dela Cruz');
  const [requesterName, setRequesterName] = useState(user?.fullName || 'Juan Dela Cruz');
  const [relationshipToOwner, setRelationshipToOwner] = useState('Self (Owner)');
  const [contactNumber, setContactNumber] = useState('0917-123-4567');
  const [emailAddress, setEmailAddress] = useState(user?.email || 'resident@nrgph2.org');

  // Form State - Request Classification & Priority
  const [requestType, setRequestType] = useState<RequestType>('move_in_out');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [remarks, setRemarks] = useState('');

  // 1. Move-in/out state
  const [moveType, setMoveType] = useState<'Move-In' | 'Move-Out'>('Move-In');
  const [moveDate, setMoveDate] = useState('2026-08-25');
  const [moveTimeWindow, setMoveTimeWindow] = useState('08:00 AM - 12:00 PM');
  const [movingCompany, setMovingCompany] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [numMovers, setNumMovers] = useState(3);
  const [leaseFile, setLeaseFile] = useState<string | null>(null);

  // 2. Home Improvement state
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>(['Extension', 'Painting']);
  const [estStartDate, setEstStartDate] = useState('2026-09-01');
  const [estCompletionDate, setEstCompletionDate] = useState('2026-09-20');
  const [contractorName, setContractorName] = useState('');
  const [contractorLead, setContractorLead] = useState('');
  const [contractorContact, setContractorContact] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [blueprintFile, setBlueprintFile] = useState<string | null>(null);

  // 3. Car Sticker state
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [orCrFile, setOrCrFile] = useState<string | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<string | null>(null);

  // 4. Certificate Request state
  const [certType, setCertType] = useState('Certificate of Residency');
  const [certPurpose, setCertPurpose] = useState('Bank Requirement');
  const [numCopies, setNumCopies] = useState(1);
  const [collectionPref, setCollectionPref] = useState<'Digital Copy (PDF)' | 'Physical Pick-up'>('Digital Copy (PDF)');

  // 5. Amenity Reservation state
  const [resFacility, setResFacility] = useState('NRG PH2 Covered Basketball & Sports Court');
  const [resDate, setResDate] = useState('2026-08-28');
  const [resTimeSlot, setResTimeSlot] = useState('06:00 PM – 08:00 PM');
  const [numGuests, setNumGuests] = useState(10);

  // 6. General Maintenance state
  const [maintCategory, setMaintCategory] = useState('Drainage / Plumbing');
  const [maintLocation, setMaintLocation] = useState('');
  const [maintDescription, setMaintDescription] = useState('');
  const [maintPhoto, setMaintPhoto] = useState<string | null>(null);

  // Admin status update modal state
  const [adminStatusInput, setAdminStatusInput] = useState<RequestStatus>('in_progress');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const isHOAAdmin = user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin';

  // Calculate Due Date based on priority
  const calculateDueDate = (pri: PriorityLevel): string => {
    const today = new Date();
    if (pri === 'emergency') return `${today.toISOString().split('T')[0]} (within 4 hrs)`;
    if (pri === 'high') {
      today.setDate(today.getDate() + 1);
      return `${today.toISOString().split('T')[0]} (within 24 hrs)`;
    }
    if (pri === 'medium') {
      today.setDate(today.getDate() + 3);
      return `${today.toISOString().split('T')[0]} (3 working days)`;
    }
    // Low
    today.setDate(today.getDate() + 5);
    return `${today.toISOString().split('T')[0]} (5 working days)`;
  };

  const getRequestTypeMeta = (type: RequestType) => {
    switch (type) {
      case 'move_in_out':
        return { label: 'Move-In / Move-Out Request', icon: '📦', color: '#7C3AED' };
      case 'home_improvement':
        return { label: 'Home Improvement & Construction', icon: '🏗️', color: '#D97706' };
      case 'car_sticker':
        return { label: 'Car / Vehicle Sticker Request', icon: '🚗', color: '#2563EB' };
      case 'certificate':
        return { label: 'Certificate (Residency / Good Standing)', icon: '📜', color: '#166534' };
      case 'amenity_reservation':
        return { label: 'Court / Amenity Reservation', icon: '🏀', color: '#EA580C' };
      case 'general_maintenance':
        return { label: 'General Maintenance / Service', icon: '🛠️', color: '#DC2626' };
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'emergency':
        return <span className="badge badge-danger" style={{ fontWeight: 800 }}>🚨 Emergency (&lt;4h)</span>;
      case 'high':
        return <span className="badge badge-warning" style={{ fontWeight: 800, background: '#FEF3C7', color: '#92400E' }}>⚡ High (24h)</span>;
      case 'medium':
        return <span className="badge badge-info" style={{ fontWeight: 700 }}>⏱️ Medium (3 days)</span>;
      case 'low':
        return <span className="badge badge-success" style={{ fontWeight: 700, background: '#F3F4F6', color: '#4B5563' }}>🟢 Low (5 days)</span>;
    }
  };

  const getStatusBadge = (s: RequestStatus) => {
    switch (s) {
      case 'draft':
        return <span className="badge" style={{ background: '#E5E7EB', color: '#374151' }}>📝 Draft</span>;
      case 'submitted':
        return <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>📥 Submitted</span>;
      case 'under_review':
        return <span className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>🔍 Under Review</span>;
      case 'approved':
        return <span className="badge" style={{ background: '#DCFCE7', color: '#166534' }}>✅ Approved</span>;
      case 'rejected':
        return <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B' }}>❌ Rejected</span>;
      case 'in_progress':
        return <span className="badge" style={{ background: '#E0E7FF', color: '#3730A3' }}>⚙️ In Progress</span>;
      case 'completed':
        return <span className="badge" style={{ background: '#D1FAE5', color: '#065F46' }}>🎉 Completed</span>;
      case 'cancelled':
        return <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>🚫 Cancelled</span>;
    }
  };

  // Generic Mock File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      success('File Attached ✅', file.name);
    }
  };

  // Toggle improvement checkbox
  const toggleImprovement = (item: string) => {
    if (selectedImprovements.includes(item)) {
      setSelectedImprovements(selectedImprovements.filter(x => x !== item));
    } else {
      setSelectedImprovements([...selectedImprovements, item]);
    }
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let specificData: Record<string, any> = {};

    if (requestType === 'move_in_out') {
      specificData = {
        move_type: moveType,
        move_date: moveDate,
        time_window: moveTimeWindow,
        moving_company: movingCompany || 'Private Vehicle',
        truck_plate: truckPlate || 'N/A',
        driver_name: driverName || requesterName,
        num_movers: numMovers,
        lease_proof_file: leaseFile || 'Proof_Document_Attached.pdf',
      };
    } else if (requestType === 'home_improvement') {
      specificData = {
        improvements: selectedImprovements,
        start_date: estStartDate,
        end_date: estCompletionDate,
        contractor_name: contractorName || 'In-House / DIY',
        contractor_lead: contractorLead || 'Owner Supervised',
        contractor_contact: contractorContact || contactNumber,
        blueprint_file: blueprintFile || 'Architectural_Plans_v1.pdf',
        scope_summary: scopeSummary || 'Home maintenance and aesthetic improvements.',
      };
    } else if (requestType === 'car_sticker') {
      if (!vehicleMakeModel || !vehiclePlate) {
        showError('Missing Vehicle Details', 'Please specify Make/Model and Plate Number.');
        return;
      }
      specificData = {
        make_model: vehicleMakeModel,
        plate_number: vehiclePlate,
        vehicle_color: vehicleColor || 'Standard',
        or_cr_file: orCrFile || 'Scanned_OR_CR.pdf',
        driver_license_file: driverLicenseFile || 'Drivers_License_Copy.jpg',
      };
    } else if (requestType === 'certificate') {
      specificData = {
        cert_type: certType,
        purpose: certPurpose,
        num_copies: numCopies,
        collection_pref: collectionPref,
      };
    } else if (requestType === 'amenity_reservation') {
      specificData = {
        facility: resFacility,
        reservation_date: resDate,
        time_slot: resTimeSlot,
        num_guests: numGuests,
      };
    } else if (requestType === 'general_maintenance') {
      specificData = {
        issue_category: maintCategory,
        location: maintLocation || `${block} ${lot}`,
        description: maintDescription,
        attachment_file: maintPhoto || 'Photo_Evidence.jpg',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const generatedRef = `REF-${new Date().getFullYear()}-SR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: ServiceRequestItem = {
      id: `sr-${Date.now()}`,
      ref_no: generatedRef,
      block,
      lot,
      street_name: streetName,
      registered_owner_name: registeredOwnerName,
      requester_name: requesterName,
      relationship_to_owner: relationshipToOwner,
      contact_number: contactNumber,
      email: emailAddress,
      request_type: requestType,
      priority,
      due_date: calculateDueDate(priority),
      status: 'submitted',
      submitted_date: todayStr,
      specific_data: specificData,
      remarks,
    };

    setRequests([newTicket, ...requests]);
    success('Service Request Submitted! 🚀', `Assigned Reference #: ${generatedRef}. Priority SLA: ${priority.toUpperCase()}`);
    setShowModal(false);

    // Reset Form
    setRemarks('');
    setVehicleMakeModel('');
    setVehiclePlate('');
    setScopeSummary('');
    setMaintDescription('');
  };

  // Handle Admin Status Update
  const handleUpdateAdminStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setRequests(prev => prev.map(item => {
      if (item.id === selectedRequest.id) {
        return {
          ...item,
          status: adminStatusInput,
          admin_notes: adminNotesInput || item.admin_notes,
        };
      }
      return item;
    }));

    success('Request Status Updated ✅', `Ref ${selectedRequest.ref_no} set to ${adminStatusInput.toUpperCase()}`);
    setSelectedRequest(null);
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = searchQuery.toLowerCase();
      const meta = getRequestTypeMeta(r.request_type);
      const matchesQuery =
        r.ref_no.toLowerCase().includes(q) ||
        r.requester_name.toLowerCase().includes(q) ||
        r.registered_owner_name.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q) ||
        r.lot.toLowerCase().includes(q) ||
        r.street_name.toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q);

      const matchesType = typeFilter === 'all' || r.request_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;

      return matchesQuery && matchesType && matchesStatus && matchesPriority;
    });
  }, [requests, searchQuery, typeFilter, statusFilter, priorityFilter]);

  return (
    <PageContainer
      title="Service Request Module"
      subtitle="NRG PH2 HOA INC — Multi-Category Ticket Queuing & Document Tracking Portal"
    >
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* TOP METRIC CARDS */}
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#2563EB20', color: '#2563EB' }}>📊</div>
            <div>
              <div className="stat-value" style={{ color: '#2563EB' }}>{requests.length}</div>
              <div className="stat-label">Total Active Tickets</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>⏳</div>
            <div>
              <div className="stat-value" style={{ color: '#F59E0B' }}>
                {requests.filter(r => r.status === 'submitted' || r.status === 'under_review').length}
              </div>
              <div className="stat-label">Pending / Under Review</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#16653420', color: '#166534' }}>✅</div>
            <div>
              <div className="stat-value" style={{ color: '#166534' }}>
                {requests.filter(r => r.status === 'approved' || r.status === 'completed').length}
              </div>
              <div className="stat-label">Approved & Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#DC262620', color: '#DC2626' }}>🚨</div>
            <div>
              <div className="stat-value" style={{ color: '#DC2626' }}>
                {requests.filter(r => r.priority === 'emergency').length}
              </div>
              <div className="stat-label">Emergency Priority (&lt;4h)</div>
            </div>
          </div>
        </div>

        {/* HEADER BAR */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="section-title mb-1">Service & Document Tracking System</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Submit, track with reference numbers, and review all HOA Phase 2 administrative tickets & permits.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: '#166534', borderColor: '#166534', fontWeight: 800, padding: '12px 24px', fontSize: 14 }}
            onClick={() => setShowModal(true)}
          >
            ➕ File New Service Request
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="card mb-6" style={{ padding: 18 }}>
          <div className="grid grid-4" style={{ gap: 14 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Search Keyword / Ref #</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search Ref #, Resident, Lot..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Filter Category</label>
              <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Request Types</option>
                <option value="move_in_out">📦 Move-In / Move-Out</option>
                <option value="home_improvement">🏗️ Home Improvement</option>
                <option value="car_sticker">🚗 Car Sticker / RFID</option>
                <option value="certificate">📜 Certificate (Residency)</option>
                <option value="amenity_reservation">🏀 Amenity Reservation</option>
                <option value="general_maintenance">🛠️ General Maintenance</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Filter Priority</label>
              <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority Levels</option>
                <option value="low">🟢 Low (5 working days)</option>
                <option value="medium">⏱️ Medium (3 working days)</option>
                <option value="high">⚡ High (within 24 hours)</option>
                <option value="emergency">🚨 Emergency (asap &lt;4 hours)</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Filter Status</label>
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Request Type</th>
                <th>Requester & Address</th>
                <th>Relationship</th>
                <th>Priority / SLA</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => {
                const meta = getRequestTypeMeta(r.request_type);
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="font-mono font-bold" style={{ color: '#2563EB', fontSize: 13 }}>
                        {r.ref_no}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Filed: {r.submitted_date}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 18 }}>{meta.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: meta.color }}>{meta.label}</div>
                          {r.specific_data.make_model && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.specific_data.make_model} ({r.specific_data.plate_number})</div>
                          )}
                          {r.specific_data.cert_type && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.specific_data.cert_type}</div>
                          )}
                          {r.specific_data.issue_category && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.specific_data.issue_category}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.requester_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {r.block}, {r.lot}, {r.street_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📞 {r.contact_number}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {r.relationship_to_owner}
                      </span>
                    </td>
                    <td>{getPriorityBadge(r.priority)}</td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.priority === 'emergency' ? '#DC2626' : 'var(--text-primary)' }}>
                        {r.due_date}
                      </span>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setSelectedRequest(r);
                          setAdminStatusInput(r.status);
                          setAdminNotesInput(r.admin_notes || '');
                        }}
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* NEW SERVICE REQUEST MODAL                                    */}
        {/* ============================================================ */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-box"
              style={{ maxWidth: 820, maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">📝 New Service & Document Request</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Fill in the owner information and specific request requirements below.
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">

                {/* 1. PROPERTY & REQUESTER PROFILE SECTION */}
                <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: 16, borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                    🏠 1. Property Address & Requester Details
                  </div>

                  <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                    <div>
                      <label className="form-label">Block Number</label>
                      <select className="form-select" value={block} onChange={e => setBlock(e.target.value)} required>
                        {[...Array(9)].map((_, i) => (
                          <option key={i + 1} value={`Block ${i + 1}`}>Block {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Lot Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Lot 12"
                        value={lot}
                        onChange={e => setLot(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Street Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Mahogany St."
                        value={streetName}
                        onChange={e => setStreetName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                    <div>
                      <label className="form-label">Registered Owner Name (Pre-filled)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={registeredOwnerName}
                        onChange={e => setRegisteredOwnerName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Name of Requestor (Person Submitting)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={requesterName}
                        onChange={e => setRequesterName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-3" style={{ gap: 12 }}>
                    <div>
                      <label className="form-label">Relationship to Owner</label>
                      <select
                        className="form-select"
                        value={relationshipToOwner}
                        onChange={e => setRelationshipToOwner(e.target.value)}
                        required
                      >
                        <option value="Self (Owner)">Self (Owner)</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child / Dependent">Child / Dependent</option>
                        <option value="Tenant / Lessee">Tenant / Lessee</option>
                        <option value="Authorized Representative">Authorized Representative</option>
                        <option value="Contractor">Contractor</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Contact Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="0917-000-0000"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="email@domain.com"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. REQUEST TYPE & PRIORITY */}
                <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: 16, borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                    📋 2. Type of Request & Priority Queue
                  </div>

                  <div className="grid grid-2 mb-3" style={{ gap: 14 }}>
                    <div>
                      <label className="form-label">Select Request Type</label>
                      <select
                        className="form-select"
                        style={{ fontWeight: 700 }}
                        value={requestType}
                        onChange={e => setRequestType(e.target.value as RequestType)}
                      >
                        <option value="move_in_out">📦 Move-In / Move-Out Request</option>
                        <option value="home_improvement">🏗️ Home Improvement & Construction Permit</option>
                        <option value="car_sticker">🚗 Car Sticker Request</option>
                        <option value="certificate">📜 Certificate Requests (Residency / Good Standing)</option>
                        <option value="amenity_reservation">🏀 Court / Amenity Reservation Request</option>
                        <option value="general_maintenance">🛠️ General Maintenance / Service Request</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Priority Level (SLA Guarantee)</label>
                      <select
                        className="form-select"
                        style={{ fontWeight: 700 }}
                        value={priority}
                        onChange={e => setPriority(e.target.value as PriorityLevel)}
                      >
                        <option value="low">🟢 Low (5 working days)</option>
                        <option value="medium">⏱️ Medium (3 working days)</option>
                        <option value="high">⚡ High (within 24 hours)</option>
                        <option value="emergency">🚨 Emergency (asap &lt;4 hours)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: '#EFF6FF', padding: '8px 12px', borderRadius: 8, border: '1px solid #BFDBFE' }}>
                    💡 <strong>Calculated Target Due Date:</strong> <span style={{ color: '#1E40AF', fontWeight: 800 }}>{calculateDueDate(priority)}</span>
                  </div>
                </div>

                {/* 3. CONDITIONAL FORM FIELDS BASED ON TYPE */}
                <div style={{ background: '#FFF', border: '2px solid #E5E7EB', padding: 18, borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
                    🔍 3. Request-Specific Information & Attachments
                  </div>

                  {/* A. MOVE-IN / MOVE-OUT */}
                  {requestType === 'move_in_out' && (
                    <div>
                      <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Movement Type</label>
                          <select className="form-select" value={moveType} onChange={e => setMoveType(e.target.value as any)}>
                            <option value="Move-In">Move-In</option>
                            <option value="Move-Out">Move-Out</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Date of Movement</label>
                          <input type="date" className="form-input" value={moveDate} onChange={e => setMoveDate(e.target.value)} required />
                        </div>
                        <div>
                          <label className="form-label">Time Window</label>
                          <select className="form-select" value={moveTimeWindow} onChange={e => setMoveTimeWindow(e.target.value)}>
                            <option value="08:00 AM - 12:00 PM">08:00 AM – 12:00 PM (Morning)</option>
                            <option value="01:00 PM - 05:00 PM">01:00 PM – 05:00 PM (Afternoon)</option>
                            <option value="06:00 PM - 09:00 PM">06:00 PM – 09:00 PM (Evening)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Moving Company / Provider</label>
                          <input type="text" className="form-input" placeholder="e.g. Lipat Bahay Express" value={movingCompany} onChange={e => setMovingCompany(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Truck Plate Number</label>
                          <input type="text" className="form-input" placeholder="e.g. NDB-4412" value={truckPlate} onChange={e => setTruckPlate(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Driver Name</label>
                          <input type="text" className="form-input" placeholder="e.g. Eduardo Ramos" value={driverName} onChange={e => setDriverName(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Number of Movers / Personnel</label>
                          <input type="number" min={1} max={15} className="form-input" value={numMovers} onChange={e => setNumMovers(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">Upload Lease Agreement / Proof of Occupancy</label>
                          <input type="file" className="form-input" onChange={e => handleFileUpload(e, setLeaseFile)} />
                          {leaseFile && <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>📎 Attached: {leaseFile}</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* B. HOME IMPROVEMENT & CONSTRUCTION */}
                  {requestType === 'home_improvement' && (
                    <div>
                      <label className="form-label">Type of Improvement / Construction (Select applicable)</label>
                      <div className="grid grid-3 mb-4" style={{ gap: 8 }}>
                        {['Extension', 'Painting', 'Fence', 'Roofing', 'Landscaping', 'Structural Mod'].map(opt => (
                          <label
                            key={opt}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                              background: selectedImprovements.includes(opt) ? '#DCFCE7' : '#F9FAFB',
                              border: selectedImprovements.includes(opt) ? '1px solid #166534' : '1px solid #E5E7EB',
                              cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedImprovements.includes(opt)}
                              onChange={() => toggleImprovement(opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>

                      <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Estimated Start Date</label>
                          <input type="date" className="form-input" value={estStartDate} onChange={e => setEstStartDate(e.target.value)} required />
                        </div>
                        <div>
                          <label className="form-label">Estimated Completion Date</label>
                          <input type="date" className="form-input" value={estCompletionDate} onChange={e => setEstCompletionDate(e.target.value)} required />
                        </div>
                      </div>

                      <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Contractor / Builder Company</label>
                          <input type="text" className="form-input" placeholder="e.g., BuildTech Corp" value={contractorName} onChange={e => setContractorName(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Lead Person / Engineer</label>
                          <input type="text" className="form-input" placeholder="e.g., Engr. Mark Gomez" value={contractorLead} onChange={e => setContractorLead(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Contractor Contact Info</label>
                          <input type="tel" className="form-input" placeholder="0922-000-0000" value={contractorContact} onChange={e => setContractorContact(e.target.value)} />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Scope of Work Summary</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          placeholder="Summarize exact civil/electrical/architectural works..."
                          value={scopeSummary}
                          onChange={e => setScopeSummary(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-label">Architectural Plans / Blueprints (Upload PDF/Image)</label>
                        <input type="file" className="form-input" onChange={e => handleFileUpload(e, setBlueprintFile)} />
                        {blueprintFile && <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>📎 Blueprint: {blueprintFile}</div>}
                      </div>
                    </div>
                  )}

                  {/* C. CAR STICKER REQUEST */}
                  {requestType === 'car_sticker' && (
                    <div>
                      <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Vehicle Make & Model</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Toyota Vios, Honda City"
                            value={vehicleMakeModel}
                            onChange={e => setVehicleMakeModel(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Plate # / Conduction Sticker</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. NGA-9821"
                            value={vehiclePlate}
                            onChange={e => setVehiclePlate(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Vehicle Color</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Pearl White, Silver"
                            value={vehicleColor}
                            onChange={e => setVehicleColor(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-2" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">OR/CR (Official Receipt / Reg.) Upload</label>
                          <input type="file" className="form-input" onChange={e => handleFileUpload(e, setOrCrFile)} />
                          {orCrFile && <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>📎 Attached: {orCrFile}</div>}
                        </div>
                        <div>
                          <label className="form-label">Driver’s License Copy Upload</label>
                          <input type="file" className="form-input" onChange={e => handleFileUpload(e, setDriverLicenseFile)} />
                          {driverLicenseFile && <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>📎 Attached: {driverLicenseFile}</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* D. CERTIFICATE REQUEST */}
                  {requestType === 'certificate' && (
                    <div>
                      <div className="grid grid-3 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Certificate Required</label>
                          <select className="form-select" value={certType} onChange={e => setCertType(e.target.value)}>
                            <option value="Certificate of Residency">Certificate of Residency</option>
                            <option value="Certificate of Good Standing">Certificate of Good Standing</option>
                            <option value="HOA Clearance for Construction">HOA Clearance for Construction</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Purpose of Request</label>
                          <select className="form-select" value={certPurpose} onChange={e => setCertPurpose(e.target.value)}>
                            <option value="Bank Requirement">Bank Requirement / Loan</option>
                            <option value="Employment">Employment Requirement</option>
                            <option value="Local Government">Local Government / City Hall</option>
                            <option value="Passport">Passport / DFA Application</option>
                            <option value="Postal ID / National ID">Postal ID / National ID</option>
                            <option value="Other">Other Purpose</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Number of Copies</label>
                          <input type="number" min={1} max={10} className="form-input" value={numCopies} onChange={e => setNumCopies(Number(e.target.value))} />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Collection Preference</label>
                        <div className="flex gap-6 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="collectionPref"
                              value="Digital Copy (PDF)"
                              checked={collectionPref === 'Digital Copy (PDF)'}
                              onChange={() => setCollectionPref('Digital Copy (PDF)')}
                            />
                            <span>📄 Digital Copy (Official PDF with QR Verification)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="collectionPref"
                              value="Physical Pick-up"
                              checked={collectionPref === 'Physical Pick-up'}
                              onChange={() => setCollectionPref('Physical Pick-up')}
                            />
                            <span>🏢 Physical Pick-up at HOA Admin Office</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* E. COURT / AMENITY RESERVATION */}
                  {requestType === 'amenity_reservation' && (
                    <div>
                      <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Facility Requested</label>
                          <select className="form-select" value={resFacility} onChange={e => setResFacility(e.target.value)}>
                            <option value="NRG PH2 Covered Basketball & Sports Court">
                              🏀 NRG PH2 Covered Basketball & Sports Court
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Reservation Date</label>
                          <input type="date" className="form-input" value={resDate} onChange={e => setResDate(e.target.value)} required />
                        </div>
                      </div>

                      <div className="grid grid-2" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Time Slot / Duration</label>
                          <select className="form-select" value={resTimeSlot} onChange={e => setResTimeSlot(e.target.value)}>
                            <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM</option>
                            <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                            <option value="12:00 PM – 02:00 PM">12:00 PM – 02:00 PM</option>
                            <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                            <option value="04:00 PM – 06:00 PM">04:00 PM – 06:00 PM</option>
                            <option value="06:00 PM – 08:00 PM">06:00 PM – 08:00 PM</option>
                            <option value="08:00 PM – 10:00 PM">08:00 PM – 10:00 PM</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Estimated Number of Guests / Players</label>
                          <input type="number" min={1} max={50} className="form-input" value={numGuests} onChange={e => setNumGuests(Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* F. GENERAL MAINTENANCE */}
                  {requestType === 'general_maintenance' && (
                    <div>
                      <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                        <div>
                          <label className="form-label">Issue Category</label>
                          <select className="form-select" value={maintCategory} onChange={e => setMaintCategory(e.target.value)}>
                            <option value="Drainage / Plumbing">Drainage / Plumbing Blockage</option>
                            <option value="Streetlight / Electrical">Streetlight / Electrical Outage</option>
                            <option value="Road / Curb Repair">Road / Curb / Pothole Repair</option>
                            <option value="Tree Trimming">Tree Trimming / Powerline Hazard</option>
                            <option value="Garbage / Sanitation">Garbage Collection / Sanitation</option>
                            <option value="Other">Other Community Facility Maintenance</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Location / Block & Lot</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Block 8 Curb near streetlight #4"
                            value={maintLocation}
                            onChange={e => setMaintLocation(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Scope & Detailed Description</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          placeholder="Describe the defect, safety hazard, or maintenance work required..."
                          value={maintDescription}
                          onChange={e => setMaintDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Upload Photo / Evidence</label>
                        <input type="file" accept="image/*" className="form-input" onChange={e => handleFileUpload(e, setMaintPhoto)} />
                        {maintPhoto && <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>📎 Attached: {maintPhoto}</div>}
                      </div>
                    </div>
                  )}

                </div>

                {/* 4. GENERAL REMARKS */}
                <div className="mb-6">
                  <label className="form-label">Additional Instructions / Remarks</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Provide any additional notes for the HOA Admin / Committee..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    style={{ background: '#166534', borderColor: '#166534', fontWeight: 800, padding: 12 }}
                  >
                    🚀 Submit Request & Issue Reference #
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DETAILS & ADMIN STATUS DRAWER / MODAL                        */}
        {/* ============================================================ */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="modal-box" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>OFFICIAL TICKET DOSSIER</div>
                  <h2 className="modal-title" style={{ color: '#2563EB' }}>{selectedRequest.ref_no}</h2>
                </div>
                <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
              </div>

              <div style={{ padding: '8px 0' }}>
                
                {/* STATUS & PRIORITY SUMMARY HEADER */}
                <div className="flex justify-between items-center p-3 mb-4 rounded-lg" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CURRENT STATUS</div>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PRIORITY QUEUE</div>
                    <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TARGET DUE DATE</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#DC2626', marginTop: 2 }}>{selectedRequest.due_date}</div>
                  </div>
                </div>

                {/* PROPERTY & REQUESTER INFO */}
                <div className="card mb-4" style={{ padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 8 }}>APPLICANT & PROPERTY DOSSIER</div>
                  <div className="grid grid-2" style={{ gap: 10, fontSize: 13 }}>
                    <div><strong>Registered Owner:</strong> {selectedRequest.registered_owner_name}</div>
                    <div><strong>Requester Name:</strong> {selectedRequest.requester_name}</div>
                    <div><strong>Relationship:</strong> {selectedRequest.relationship_to_owner}</div>
                    <div><strong>Property Address:</strong> {selectedRequest.block}, {selectedRequest.lot}, {selectedRequest.street_name}</div>
                    <div><strong>Contact Number:</strong> {selectedRequest.contact_number}</div>
                    <div><strong>Email:</strong> {selectedRequest.email}</div>
                  </div>
                </div>

                {/* SPECIFIC PAYLOAD */}
                <div className="card mb-4" style={{ padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#2563EB', marginBottom: 8 }}>
                    {getRequestTypeMeta(selectedRequest.request_type).label.toUpperCase()} DATA
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    {Object.entries(selectedRequest.specific_data).map(([k, v]) => (
                      <div key={k} style={{ padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <strong style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{k.replace(/_/g, ' ')}: </strong>
                        <span>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                      </div>
                    ))}
                  </div>
                  {selectedRequest.remarks && (
                    <div style={{ marginTop: 10, padding: 8, background: '#F9FAFB', borderRadius: 6, fontSize: 12 }}>
                      <strong>Remarks:</strong> {selectedRequest.remarks}
                    </div>
                  )}
                  {selectedRequest.admin_notes && (
                    <div style={{ marginTop: 10, padding: 8, background: '#FEF3C7', borderRadius: 6, fontSize: 12, color: '#92400E' }}>
                      <strong>Admin Notes:</strong> {selectedRequest.admin_notes}
                    </div>
                  )}
                </div>

                {/* ADMIN ACTION CONTROLS */}
                {isHOAAdmin && (
                  <form onSubmit={handleUpdateAdminStatus} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 10 }}>
                      🛡️ Admin Decision & Workflow Controls
                    </div>

                    <div className="grid grid-2 mb-3" style={{ gap: 12 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 11 }}>Update Lifecycle Status</label>
                        <select
                          className="form-select"
                          value={adminStatusInput}
                          onChange={e => setAdminStatusInput(e.target.value as RequestStatus)}
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approved ✅</option>
                          <option value="in_progress">In Progress ⚙️</option>
                          <option value="completed">Completed 🎉</option>
                          <option value="rejected">Rejected ❌</option>
                          <option value="cancelled">Cancelled 🚫</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: 11 }}>Admin Resolution Remarks</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Permit approved, Gate pass issued"
                          value={adminNotesInput}
                          onChange={e => setAdminNotesInput(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ background: '#166534', borderColor: '#166534', fontWeight: 800 }}>
                      Save Official Status Update
                    </button>
                  </form>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
