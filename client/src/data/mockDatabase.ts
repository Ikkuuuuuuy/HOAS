// ============================================================
// NRG PH2 HOA & Barangay Cloud Portal — Centralized Mock Database
// Complete, Realistic & Secure Demonstration Data System
// ============================================================

export interface MockDatabaseSchema {
  stats: any;
  tenants: any[];
  users: any[];
  residents: any[];
  billing: any[];
  billingSummary: any;
  facilities: any[];
  reservations: any[];
  visitors: any[];
  visitorStats: any;
  alerts: any[];
  documents: any[];
  household: any[];
  events: any[];
  financials: any;
}

export const INITIAL_MOCK_DATABASE: MockDatabaseSchema = {
  // ── 1. GLOBAL SYSTEM STATS ──────────────────────────────────
  stats: {
    totalTenants: 2,
    totalUsers: 312,
    activeAlerts: 1,
    pendingDocuments: 3,
    totalRevenue: 142500,
    totalReservations: 14,
    visitorsToday: 12,
    overduePayments: 4,
  },

  // ── 2. MULTI-TENANT ORGANIZATIONS ──────────────────────────
  tenants: [
    {
      id: 'tenant-palmera-1',
      name: 'NRG PH2 HOA INC (Northridge Grove Phase 2)',
      type: 'hoa',
      location: 'B7 Maagap St, Tungkong Mangga, San Jose del Monte, 3023 Bulacan',
      user_count: 731,
      lot_count: 312,
      status: 'active',
      created_at: '2025-01-15',
    },
    {
      id: 'tenant-brgy-174',
      name: 'Barangay Tungkong Mangga Official Council (174)',
      type: 'barangay',
      location: 'Quirino Highway, Tungkong Mangga, CSJDM, Bulacan',
      user_count: 18450,
      lot_count: 1420,
      status: 'active',
      created_at: '2025-01-10',
    },
    {
      id: 'tenant-palmera-subd',
      name: 'Palmera Residences HOA Phase 1',
      type: 'hoa',
      location: 'San Jose del Monte, Bulacan',
      user_count: 312,
      lot_count: 240,
      status: 'active',
      created_at: '2025-02-01',
    },
  ],

  // ── 3. USERS & ACCOUNTS ────────────────────────────────────
  users: [
    {
      id: 'usr-superadmin',
      full_name: 'Hon. Maria Santos (Super Admin)',
      email: 'superadmin@portal.gov.ph',
      role_name: 'super_admin',
      tenant_name: 'Barangay 174 & Bria HOA',
      tenant_id: 'tenant-brgy-174',
      is_active: 1,
      created_at: '2025-01-01',
    },
    {
      id: 'usr-brgy-official',
      full_name: 'Kap. Jose Santos',
      email: 'official@tungkongmangga-csjdm.gov.ph',
      role_name: 'barangay_official',
      tenant_name: 'Barangay Tungkong Mangga Official Council',
      tenant_id: 'tenant-brgy-174',
      is_active: 1,
      created_at: '2025-01-10',
    },
    {
      id: 'usr-hoaadmin',
      full_name: 'Juan Dela Cruz (HOA President)',
      email: 'treasurer@palmera-hoa.com',
      role_name: 'hoa_admin',
      tenant_name: 'Bria Northridge Grove HOA',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-15',
    },
    {
      id: 'usr-staff',
      full_name: 'Elena Reyes (HOA Staff)',
      email: 'staff@palmera-hoa.com',
      role_name: 'admin_staff',
      tenant_name: 'Bria Northridge Grove HOA',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-18',
    },
    {
      id: 'usr-guard',
      full_name: 'Sgt. Pedro Penduko (Security Lead)',
      email: 'guard@palmera-hoa.com',
      role_name: 'security_guard',
      tenant_name: 'Bria Northridge Grove HOA',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-20',
    },
    {
      id: 'usr-resident',
      full_name: 'Ricardo Dalisay (Resident Owner)',
      email: 'resident@palmera-hoa.com',
      role_name: 'homeowner',
      tenant_name: 'Bria Northridge Grove HOA',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-02-01',
    },
  ],

  // ── 4. RESIDENTS REGISTRY ──────────────────────────────────
  residents: [
    {
      id: 'res-1',
      full_name: 'Ricardo Dalisay',
      email: 'resident@palmera-hoa.com',
      contact_number: '0917-888-9999',
      address: 'Block 7 Lot 08, Maagap Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-02-01',
    },
    {
      id: 'res-2',
      full_name: 'Juan Dela Cruz',
      email: 'juan.delacruz@gmail.com',
      contact_number: '0917-123-4567',
      address: 'Block 3 Lot 12, Maagap Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-15',
    },
    {
      id: 'res-3',
      full_name: 'Maria Santos',
      email: 'maria.santos@gmail.com',
      contact_number: '0918-234-5678',
      address: 'Block 4 Lot 05, Mabuti Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-18',
    },
    {
      id: 'res-4',
      full_name: 'Pedro Penduko',
      email: 'pedro.penduko@gmail.com',
      contact_number: '0922-345-6789',
      address: 'Block 1 Lot 02, Magiting Street, NRG Phase 2',
      civil_status: 'single',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-20',
    },
    {
      id: 'res-5',
      full_name: 'Ana Elena Reyes',
      email: 'ana.reyes@gmail.com',
      contact_number: '0905-456-7890',
      address: 'Block 8 Lot 14, Mapayapa Street, NRG Phase 2',
      civil_status: 'widowed',
      indigency_status: 1,
      voter_status: 'registered',
      created_at: '2025-01-25',
    },
    {
      id: 'res-6',
      full_name: 'Rey Mar Villanueva',
      email: 'president.reymar@nrgph2.org',
      contact_number: '0917-882-9401',
      address: 'Block 2 Lot 01, Maagap Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-05',
    },
    {
      id: 'res-7',
      full_name: 'Cezar Climaco',
      email: 'vp.cezar@nrgph2.org',
      contact_number: '0918-554-1102',
      address: 'Block 5 Lot 09, Mabuti Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-08',
    },
    {
      id: 'res-8',
      full_name: 'Alma Valdezco',
      email: 'treasurer.alma@nrgph2.org',
      contact_number: '0917-123-4567',
      address: 'Block 6 Lot 03, Magiting Street, NRG Phase 2',
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: '2025-01-10',
    },
  ],

  // ── 5. BILLING & DUES LEDGER ───────────────────────────────
  billing: [
    {
      id: 'led-1',
      resident_name: 'Ricardo Dalisay (Blk 7 Lot 08)',
      billing_period: '2026-08',
      description: 'Monthly & Association Dues (Combined)',
      amount: 2500,
      paid_amount: 0,
      balance: 2500,
      due_date: '2026-08-10',
      status: 'unpaid',
    },
    {
      id: 'led-2',
      resident_name: 'Maria Santos (Blk 4 Lot 05)',
      billing_period: '2026-08',
      description: 'Monthly & Association Dues (Combined)',
      amount: 2500,
      paid_amount: 1500,
      balance: 1000,
      due_date: '2026-08-10',
      status: 'pending_approval',
      payment_type: 'partial',
      payment_method: 'gcash',
      reference_no: 'GCASH-98214-88',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    },
    {
      id: 'led-3',
      resident_name: 'Pedro Penduko (Blk 1 Lot 02)',
      billing_period: '2026-07',
      description: 'Monthly & Association Dues (Combined)',
      amount: 2500,
      paid_amount: 2500,
      balance: 0,
      due_date: '2026-07-10',
      status: 'paid',
      payment_type: 'full',
      payment_method: 'bank_transfer',
      reference_no: 'BDO-TRX-441209',
    },
    {
      id: 'led-4',
      resident_name: 'Ana Reyes (Blk 8 Lot 14)',
      billing_period: '2026-06',
      description: 'Monthly & Association Dues (Combined)',
      amount: 2500,
      paid_amount: 0,
      balance: 2500,
      due_date: '2026-06-10',
      status: 'overdue',
    },
    {
      id: 'led-5',
      resident_name: 'Juan Dela Cruz (Blk 3 Lot 12)',
      billing_period: '2026-08',
      description: 'Monthly & Association Dues (Combined)',
      amount: 2500,
      paid_amount: 2500,
      balance: 0,
      due_date: '2026-08-10',
      status: 'paid',
      payment_type: 'full',
      payment_method: 'gcash',
      reference_no: 'GCASH-11983-44',
    },
  ],

  billingSummary: {
    summary: {
      total_billed: 185000,
      total_collected: 142500,
      outstanding_balance: 35000,
      overdue_balance: 7500,
      collection_rate: 88.4,
    },
    monthlyRevenue: [
      { billing_period: '2026-03', amount: 132000 },
      { billing_period: '2026-04', amount: 138500 },
      { billing_period: '2026-05', amount: 141000 },
      { billing_period: '2026-06', amount: 139000 },
      { billing_period: '2026-07', amount: 144500 },
      { billing_period: '2026-08', amount: 142500 },
    ],
  },

  // ── 6. FACILITIES & COURT RESERVATIONS ─────────────────────
  facilities: [
    {
      id: 'fac-basketball-ph2',
      name: 'NRG PH2 Covered Basketball & Sports Court',
      description: 'Phase 2 Covered Court with LED Night Lights, Scoreboard & Spectator Bleachers',
      capacity: 100,
      hourly_rate: 0,
      status: 'active',
    },
    {
      id: 'fac-clubhouse-ph2',
      name: 'Phase 2 Multipurpose Clubhouse & Hall',
      description: 'Air-conditioned main event hall with audio-visual equipment',
      capacity: 150,
      hourly_rate: 500,
      status: 'active',
    },
  ],

  reservations: [
    {
      id: 'resv-01',
      facility_id: 'fac-basketball-ph2',
      facility_name: 'NRG PH2 Covered Basketball Court',
      reserved_by: 'usr-resident',
      resident_name: 'Ricardo Dalisay (Blk 7 Lot 08)',
      title: 'Youth 3x3 Basketball League Practice',
      booking_date: new Date().toISOString().split('T')[0],
      start_time: `${new Date().toISOString().split('T')[0]} 16:00`,
      end_time: `${new Date().toISOString().split('T')[0]} 18:00`,
      time_slot_label: '04:00 PM – 06:00 PM',
      status: 'approved',
      booking_for: 'household',
      notes: 'Phase 2 Inter-Block Youth friendly matches',
    },
    {
      id: 'resv-02',
      facility_id: 'fac-basketball-ph2',
      facility_name: 'NRG PH2 Covered Basketball Court',
      reserved_by: 'usr-hoaadmin',
      resident_name: 'Juan Dela Cruz (HOA President)',
      title: 'Phase 2 General Assembly Prep',
      booking_date: new Date().toISOString().split('T')[0],
      start_time: `${new Date().toISOString().split('T')[0]} 18:00`,
      end_time: `${new Date().toISOString().split('T')[0]} 20:00`,
      time_slot_label: '06:00 PM – 08:00 PM',
      status: 'approved',
      booking_for: 'admin_event',
      notes: 'Sound check & chairs layout',
    },
    {
      id: 'resv-03',
      facility_id: 'fac-basketball-ph2',
      facility_name: 'NRG PH2 Covered Basketball Court',
      reserved_by: 'usr-resident',
      resident_name: 'Maria Santos (Blk 4 Lot 05)',
      title: 'Morning Badminton & Wellness',
      booking_date: new Date().toISOString().split('T')[0],
      start_time: `${new Date().toISOString().split('T')[0]} 08:00`,
      end_time: `${new Date().toISOString().split('T')[0]} 10:00`,
      time_slot_label: '08:00 AM – 10:00 AM',
      status: 'approved',
      booking_for: 'household',
      notes: 'Neighborhood morning cardio',
    },
  ],

  // ── 7. VISITOR LOGBOOK & GATE PASSES ───────────────────────
  visitors: [
    {
      id: 'vis-1',
      host_id: 'usr-resident',
      host_name: 'Ricardo Dalisay (Blk 7 Lot 08)',
      visitor_name: 'Mark Anthony Mendoza',
      visitor_id_type: 'driver_license',
      visitor_id_no: 'N02-18-992314',
      vehicle_plate: 'NDO 4821',
      purpose: 'Water Refill & Grocery Delivery',
      gate_pass_no: 'GP-2026-0814',
      time_in: new Date(Date.now() - 3600000 * 2).toISOString(),
      time_out: null,
      status: 'inside',
    },
    {
      id: 'vis-2',
      host_id: 'usr-hoaadmin',
      host_name: 'Juan Dela Cruz (Blk 3 Lot 12)',
      visitor_name: 'Engr. Roberto Gomez',
      visitor_id_type: 'national_id',
      visitor_id_no: '4412-8891-3312',
      vehicle_plate: 'CAH 7791',
      purpose: 'Meralco Solar Pole Inspection',
      gate_pass_no: 'GP-2026-0815',
      time_in: new Date(Date.now() - 3600000 * 4).toISOString(),
      time_out: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: 'checked_out',
    },
    {
      id: 'vis-3',
      host_id: 'usr-staff',
      host_name: 'Elena Reyes (HOA Staff)',
      visitor_name: 'Lalamove Courier — Jayson Cruz',
      visitor_id_type: 'company_id',
      visitor_id_no: 'LLM-88219',
      vehicle_plate: 'MC 2919-BA',
      purpose: 'Document Delivery & Official Notices',
      gate_pass_no: 'GP-2026-0816',
      time_in: new Date(Date.now() - 1800000).toISOString(),
      time_out: null,
      status: 'inside',
    },
  ],

  visitorStats: {
    total_today: 12,
    currently_inside: 4,
    checked_out: 8,
  },

  // ── 8. EMERGENCY ALERTS ───────────────────────────────────
  alerts: [
    {
      id: 'alt-01',
      alertType: 'security',
      message: 'Suspicious vehicle (unregistered white van) parked near Block 6 Perimeter Gate. Guard roving dispatched.',
      location: 'Block 6 Perimeter — Magiting St',
      triggeredBy: 'Sgt. Pedro Penduko (Security Lead)',
      tenantName: 'NRG PH2 HOA INC',
      broadcastTo: 'all',
      status: 'active',
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'alt-02',
      alertType: 'medical',
      message: 'Resident requesting first aid assistance for senior citizen. Emergency responder on site.',
      location: 'Block 4 Lot 05 — Mabuti St',
      triggeredBy: 'Elena Reyes (HOA Staff)',
      tenantName: 'NRG PH2 HOA INC',
      broadcastTo: 'all',
      status: 'resolved',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],

  // ── 9. DOCUMENT REQUESTS & CERTIFICATES ────────────────────
  documents: [
    {
      id: 'sr-201',
      ref_no: 'REF-2026-SR-9412',
      block: 'Block 3',
      lot: 'Lot 12',
      street_name: 'Maagap Street',
      registered_owner_name: 'Juan Dela Cruz',
      requester_name: 'Juan Dela Cruz',
      relationship_to_owner: 'Registered Owner',
      contact_number: '0917-123-4567',
      email: 'juan.delacruz@gmail.com',
      request_type: 'car_sticker',
      priority: 'medium',
      due_date: '2026-08-30',
      status: 'under_review',
      submitted_date: '2026-08-20',
      specific_data: {
        vehicle_make: 'Toyota Vios 2023 Silver',
        plate_number: 'NDO 8821',
        cr_or_copy: 'Verified',
      },
      remarks: 'Resident Vehicle RFID Gate Tag Application (Vehicle 1)',
    },
    {
      id: 'sr-202',
      ref_no: 'REF-2026-SR-9413',
      block: 'Block 7',
      lot: 'Lot 08',
      street_name: 'Maagap Street',
      registered_owner_name: 'Ricardo Dalisay',
      requester_name: 'Ricardo Dalisay',
      relationship_to_owner: 'Registered Owner',
      contact_number: '0917-888-9999',
      email: 'resident@palmera-hoa.com',
      request_type: 'certificate',
      priority: 'low',
      due_date: '2026-08-29',
      status: 'approved',
      submitted_date: '2026-08-21',
      specific_data: {
        certificate_purpose: 'Bank Loan & Real Property Verification',
      },
      remarks: 'Certificate of Good Standing with official QR code verification.',
    },
    {
      id: 'sr-203',
      ref_no: 'REF-2026-SR-9414',
      block: 'Block 5',
      lot: 'Lot 09',
      street_name: 'Mabuti Street',
      registered_owner_name: 'Cezar Climaco',
      requester_name: 'Cezar Climaco',
      relationship_to_owner: 'Registered Owner',
      contact_number: '0918-554-1102',
      email: 'vp.cezar@nrgph2.org',
      request_type: 'home_improvement',
      priority: 'high',
      due_date: '2026-09-05',
      status: 'in_progress',
      submitted_date: '2026-08-22',
      specific_data: {
        improvement_details: 'Front garage roof canopy extension with polycarbonate sheet.',
      },
      remarks: 'Engineering blueprint inspected; no setback violations.',
    },
  ],

  // ── 10. HOUSEHOLD MEMBERS ──────────────────────────────────
  household: [
    {
      id: 'hm-1',
      tenant_id: 'tenant-palmera-1',
      user_id: 'usr-resident',
      full_name: 'Ricardo Dalisay',
      relationship: 'Head of Household (Owner)',
      gender: 'Male',
      birthdate: '1982-05-14',
      age: 44,
      contact_number: '0917-888-9999',
      email: 'resident@palmera-hoa.com',
      occupation: 'Civil Engineer & Contractor',
      is_emergency_contact: 1,
      has_rfid_access: 1,
      notes: 'Primary registered owner of Block 7 Lot 08.',
      created_at: '2025-02-01',
    },
    {
      id: 'hm-2',
      tenant_id: 'tenant-palmera-1',
      user_id: 'usr-resident',
      full_name: 'Carla Dalisay',
      relationship: 'Spouse',
      gender: 'Female',
      birthdate: '1985-09-20',
      age: 41,
      contact_number: '0918-333-2211',
      email: 'carla.dalisay@gmail.com',
      occupation: 'Registered Nurse',
      is_emergency_contact: 1,
      has_rfid_access: 1,
      notes: 'Authorized secondary emergency liaison.',
      created_at: '2025-02-01',
    },
    {
      id: 'hm-3',
      tenant_id: 'tenant-palmera-1',
      user_id: 'usr-resident',
      full_name: 'Joshua Dalisay',
      relationship: 'Dependent (Child)',
      gender: 'Male',
      birthdate: '2010-03-12',
      age: 16,
      contact_number: '0922-111-4455',
      email: 'joshua.dalisay@gmail.com',
      occupation: 'Senior High Student (FCPC)',
      is_emergency_contact: 0,
      has_rfid_access: 1,
      notes: 'Student pedestrian RFID pass active.',
      created_at: '2025-02-01',
    },
    {
      id: 'hm-4',
      tenant_id: 'tenant-palmera-1',
      user_id: 'usr-resident',
      full_name: 'Lola Remedios Dalisay',
      relationship: 'Parent (Senior Citizen)',
      gender: 'Female',
      birthdate: '1955-11-08',
      age: 71,
      contact_number: '0917-000-1122',
      email: '',
      occupation: 'Retired Public Teacher',
      is_emergency_contact: 0,
      has_rfid_access: 1,
      notes: 'Senior citizen medical wellness priority recipient.',
      created_at: '2025-02-01',
    },
  ],

  // ── 11. CALENDAR & COMMUNITY EVENTS ───────────────────────
  events: [
    {
      id: 'ev-01',
      tenant_id: 'tenant-palmera-1',
      title: 'Phase 2 HOA Annual General Assembly & Board Elections',
      meeting_date: '2026-08-28 09:00',
      location: 'NRG PH2 Main Clubhouse & Virtual Zoom',
      agenda: '1. Presentation of 2025-2026 Audited Financial Report\n2. Election of Board of Directors for Term 2026-2028\n3. Approval of Proposed Solar Streetlighting Expansion\n4. Open Forum & Resident Q&A',
      status: 'upcoming',
      category: 'assembly',
    },
    {
      id: 'ev-02',
      tenant_id: 'tenant-palmera-1',
      title: 'Swimming Pool & Water Filtration System Maintenance',
      meeting_date: '2026-08-22 08:00',
      location: 'Community Swimming Pool Area',
      agenda: 'Deep chemical shock treatment, filter backwash, tile regrouting, and pump inspection. Pool facility closed to residents until 6:00 PM.',
      status: 'upcoming',
      category: 'maintenance',
    },
    {
      id: 'ev-03',
      tenant_id: 'tenant-palmera-1',
      title: 'HOA Board of Directors Monthly Executive Session',
      meeting_date: '2026-08-17 19:00',
      location: 'HOA Admin Conference Room',
      agenda: '1. Review of monthly dues collection efficiency\n2. Delinquent account resolution framework\n3. Security CCTV maintenance contract renewal\n4. Basketball court reservation system updates',
      minutes: 'Approved budget for CCTV spare parts (₱12,500). Noted 94.2% dues collection rate for July. Meeting adjourned at 8:45 PM.',
      status: 'completed',
      category: 'meeting',
    },
    {
      id: 'ev-04',
      tenant_id: 'tenant-palmera-1',
      title: 'Northridge Grove Tree Trimming & Eco-Clean Up Drive',
      meeting_date: '2026-08-30 06:30',
      location: 'Subdivision Perimeter & Block 4 Park',
      agenda: 'Barangay Tungkong Mangga coordinated tree branch trimming along power lines and community botanical cleanup.',
      status: 'upcoming',
      category: 'community',
    },
  ],

  // ── 12. SEARCHABLE FINANCIAL RECORDS ───────────────────────
  financials: {
    myDues: {
      ledgers: [
        { id: '101', description: 'August 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, due_date: '2026-08-10', status: 'paid' },
        { id: '102', description: 'July 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, due_date: '2026-07-10', status: 'paid' },
        { id: '103', description: 'June 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, due_date: '2026-06-10', status: 'paid' },
        { id: '104', description: 'Special Security & CCTV Reserve Assessment', amount: 1200, previous_balance: 0, due_date: '2026-05-15', status: 'paid' },
      ],
    },
    expenditures: [
      { id: 'exp-01', title: 'Security Guard Agency Monthly Retainer (4 Guards 24/7)', category: 'security', amount: 56000, date_spent: '2026-08-01' },
      { id: 'exp-02', title: 'Meralco Streetlighting & Common Areas Electric Bill', category: 'utilities', amount: 24350, date_spent: '2026-08-05' },
      { id: 'exp-03', title: 'Subdivision Landscaping, Grass Cutting & Tree Trimming', category: 'maintenance', amount: 18500, date_spent: '2026-08-08' },
      { id: 'exp-04', title: 'Pool Chemicals, Chlorine Shock & Maintenance', category: 'amenities', amount: 9200, date_spent: '2026-08-12' },
      { id: 'exp-05', title: 'Clubhouse High-Speed Fiber Internet & Cloud Admin Systems', category: 'admin', amount: 3500, date_spent: '2026-08-15' },
      { id: 'exp-06', title: 'Covered Basketball Court LED Floodlight Replacement', category: 'repairs', amount: 6800, date_spent: '2026-08-18' },
    ],
  },
};

// Safe local persistence getter & setter
export function getMockData<K extends keyof MockDatabaseSchema>(key: K): MockDatabaseSchema[K] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(`hoa_mock_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch { /* storage fallback */ }
  return INITIAL_MOCK_DATABASE[key];
}

export function setMockData<K extends keyof MockDatabaseSchema>(key: K, data: MockDatabaseSchema[K]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`hoa_mock_${key}`, JSON.stringify(data));
    }
  } catch { /* storage fallback */ }
}
