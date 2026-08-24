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

// ============================================================
// 13. OFFICIAL NRG PH2 HOA HOMEOWNERS MASTERLIST (Pre-Verified)
// Used for Automated Instant Registration & Auto-Accept Engine
// ============================================================
export interface MasterlistRecord {
  id: string;
  accountNo: string;
  block: string;
  lot: string;
  street: string;
  ownerName: string;
  phone: string;
  email: string;
  ownershipType: 'Turned-over Owner' | 'Registered Buyer' | 'Co-Owner';
  turnoverDate: string;
  status: 'verified_active';
}

export const HOA_MASTERLIST_DATABASE: MasterlistRecord[] = [
  // ── Block 1 (Magiting Street) ──
  { id: 'ml-01', accountNo: 'NRG2-B01L02', block: 'Block 1', lot: 'Lot 02', street: 'Magiting Street', ownerName: 'Pedro Penduko', phone: '0922-345-6789', email: 'pedro.penduko@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-15', status: 'verified_active' },
  { id: 'ml-02', accountNo: 'NRG2-B01L08', block: 'Block 1', lot: 'Lot 08', street: 'Magiting Street', ownerName: 'Anne Gregori', phone: '0919-334-8811', email: 'anne.gregori@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-04-10', status: 'verified_active' },
  { id: 'ml-03', accountNo: 'NRG2-B01L14', block: 'Block 1', lot: 'Lot 14', street: 'Magiting Street', ownerName: 'Ronalyn Villarte', phone: '0919-334-8812', email: 'ronalyn.villarte@gmail.com', ownershipType: 'Registered Buyer', turnoverDate: '2024-05-20', status: 'verified_active' },

  // ── Block 2 (Maagap Street) ──
  { id: 'ml-04', accountNo: 'NRG2-B02L01', block: 'Block 2', lot: 'Lot 01', street: 'Maagap Street', ownerName: 'Rey Mar Villanueva', phone: '0917-882-9401', email: 'president.reymar@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-11-01', status: 'verified_active' },
  { id: 'ml-05', accountNo: 'NRG2-B02L06', block: 'Block 2', lot: 'Lot 06', street: 'Maagap Street', ownerName: 'Jemma Alamillo', phone: '0917-445-9922', email: 'jemma.alamillo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-01-18', status: 'verified_active' },

  // ── Block 3 (Maagap Street) ──
  { id: 'ml-06', accountNo: 'NRG2-B03L12', block: 'Block 3', lot: 'Lot 12', street: 'Maagap Street', ownerName: 'Juan Dela Cruz', phone: '0917-123-4567', email: 'juan.delacruz@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2023-12-10', status: 'verified_active' },
  { id: 'ml-07', accountNo: 'NRG2-B03L18', block: 'Block 3', lot: 'Lot 18', street: 'Maagap Street', ownerName: 'Jocelyn Selanova', phone: '0920-881-2233', email: 'jocelyn.selanova@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-14', status: 'verified_active' },

  // ── Block 4 (Mabuti Street) ──
  { id: 'ml-08', accountNo: 'NRG2-B04L05', block: 'Block 4', lot: 'Lot 05', street: 'Mabuti Street', ownerName: 'Maria Santos', phone: '0918-234-5678', email: 'maria.santos@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-28', status: 'verified_active' },
  { id: 'ml-09', accountNo: 'NRG2-B04L11', block: 'Block 4', lot: 'Lot 11', street: 'Mabuti Street', ownerName: 'Melinda Domingo', phone: '0918-662-7744', email: 'melinda.domingo@gmail.com', ownershipType: 'Registered Buyer', turnoverDate: '2024-06-05', status: 'verified_active' },

  // ── Block 5 (Mabuti Street) ──
  { id: 'ml-10', accountNo: 'NRG2-B05L09', block: 'Block 5', lot: 'Lot 09', street: 'Mabuti Street', ownerName: 'Cezar Climaco', phone: '0918-554-1102', email: 'vp.cezar@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-10-15', status: 'verified_active' },
  { id: 'ml-11', accountNo: 'NRG2-B05L15', block: 'Block 5', lot: 'Lot 15', street: 'Mabuti Street', ownerName: 'Alma Miralles', phone: '0922-339-4455', email: 'alma.miralles@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-04-22', status: 'verified_active' },

  // ── Block 6 (Magiting Street) ──
  { id: 'ml-12', accountNo: 'NRG2-B06L03', block: 'Block 6', lot: 'Lot 03', street: 'Magiting Street', ownerName: 'Alma Valdezco', phone: '0917-123-4567', email: 'treasurer.alma@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-09-20', status: 'verified_active' },
  { id: 'ml-13', accountNo: 'NRG2-B06L07', block: 'Block 6', lot: 'Lot 07', street: 'Magiting Street', ownerName: 'Ofelia Esloyo', phone: '0917-551-8866', email: 'ofelia.esloyo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-01', status: 'verified_active' },

  // ── Block 7 (Maagap Street) ──
  { id: 'ml-14', accountNo: 'NRG2-B07L08', block: 'Block 7', lot: 'Lot 08', street: 'Maagap Street', ownerName: 'Ricardo Dalisay', phone: '0917-888-9999', email: 'resident@palmera-hoa.com', ownershipType: 'Turned-over Owner', turnoverDate: '2023-08-12', status: 'verified_active' },
  { id: 'ml-15', accountNo: 'NRG2-B07L14', block: 'Block 7', lot: 'Lot 14', street: 'Maagap Street', ownerName: 'Rina Dorate', phone: '0906-443-1177', email: 'rina.dorate@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-01-30', status: 'verified_active' },

  // ── Block 8 (Mapayapa Street) ──
  { id: 'ml-16', accountNo: 'NRG2-B08L14', block: 'Block 8', lot: 'Lot 14', street: 'Mapayapa Street', ownerName: 'Ana Elena Reyes', phone: '0905-456-7890', email: 'ana.reyes@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-10', status: 'verified_active' },
  { id: 'ml-17', accountNo: 'NRG2-B08L20', block: 'Block 8', lot: 'Lot 20', street: 'Mapayapa Street', ownerName: 'Patrick Gariando', phone: '0922-114-8802', email: 'patrick.gariando@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-05-11', status: 'verified_active' },

  // ── Block 9 (Mapayapa Street) ──
  { id: 'ml-18', accountNo: 'NRG2-B09L05', block: 'Block 9', lot: 'Lot 05', street: 'Mapayapa Street', ownerName: 'Jennerfer Barlaan', phone: '0918-994-5599', email: 'jennerfer.barlaan@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-25', status: 'verified_active' },
  { id: 'ml-19', accountNo: 'NRG2-B09L10', block: 'Block 9', lot: 'Lot 10', street: 'Mapayapa Street', ownerName: 'Melody Matienzo', phone: '0917-881-3301', email: 'melody.matienzo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-06-18', status: 'verified_active' },
];

/**
 * Intelligent Masterlist Matcher Algorithm
 * Checks if applicant matches official HOA property records
 */
export function matchMasterlistRecord(params: {
  fullName: string;
  block?: string;
  lot?: string;
  accountNo?: string;
  phone?: string;
}): MasterlistRecord | null {
  const normName = (params.fullName || '').trim().toLowerCase();
  const normBlock = (params.block || '').replace(/[^0-9]/g, '');
  const normLot = (params.lot || '').replace(/[^0-9]/g, '');
  const normAccount = (params.accountNo || '').trim().toLowerCase();
  const normPhone = (params.phone || '').replace(/[^0-9]/g, '');

  if (!normName && !normBlock && !normLot && !normAccount && !normPhone) return null;

  return HOA_MASTERLIST_DATABASE.find(record => {
    // 1. Account Number exact match
    if (normAccount && record.accountNo.toLowerCase() === normAccount) {
      return true;
    }

    const recordBlock = record.block.replace(/[^0-9]/g, '');
    const recordLot = record.lot.replace(/[^0-9]/g, '');
    const recordName = record.ownerName.trim().toLowerCase();
    const recordPhone = record.phone.replace(/[^0-9]/g, '');

    // 2. Block + Lot + Name Match (Exact or Substring)
    const blockMatch = normBlock && recordBlock === normBlock;
    const lotMatch = normLot && (recordLot === normLot || parseInt(recordLot) === parseInt(normLot));
    
    // Name fuzzy comparison
    const nameMatch = normName.length >= 3 && (
      recordName === normName ||
      recordName.includes(normName) ||
      normName.includes(recordName) ||
      normName.split(' ').filter(w => w.length > 2).every(w => recordName.includes(w))
    );

    // Phone match
    const phoneMatch = normPhone.length >= 7 && (recordPhone.includes(normPhone) || normPhone.includes(recordPhone));

    if (blockMatch && lotMatch && (nameMatch || phoneMatch)) {
      return true;
    }

    // 3. Exact Name + Block Match
    if (nameMatch && blockMatch) {
      return true;
    }

    return false;
  }) || null;
}

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

