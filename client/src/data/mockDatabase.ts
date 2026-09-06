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
      tenant_name: 'Barangay 174 & Bria HOA HQ',
      tenant_id: 'tenant-brgy-174',
      is_active: 1,
      created_at: '2025-01-01',
    },
    {
      id: 'usr-brgy-official',
      full_name: 'Kap. Juan Dela Cruz (Barangay Captain)',
      email: 'kapitan@brgy174.gov.ph',
      role_name: 'barangay_official',
      tenant_name: 'Barangay 174 Official Council',
      tenant_id: 'tenant-brgy-174',
      is_active: 1,
      created_at: '2025-01-10',
    },
    {
      id: 'usr-hoaadmin',
      full_name: 'Engr. Roberto Garcia (HOA President)',
      email: 'treasurer@palmera-hoa.com',
      role_name: 'hoa_admin',
      tenant_name: 'NRG PH2 HOA INC',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-15',
    },
    {
      id: 'usr-staff',
      full_name: 'Ana Ramos (HOA Staff)',
      email: 'staff@palmera-hoa.com',
      role_name: 'admin_staff',
      tenant_name: 'NRG PH2 HOA INC',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-18',
    },
    {
      id: 'usr-guard',
      full_name: 'Sgt. Pedro Penduko (Security Lead)',
      email: 'guard@palmera-hoa.com',
      role_name: 'security_guard',
      tenant_name: 'NRG PH2 HOA INC',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      created_at: '2025-01-20',
    },
    // 20 Homeowner Accounts
    { id: 'usr-res-1', full_name: 'Ricardo Dalisay', email: 'resident@palmera-hoa.com', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 7', lot: 'Lot 08', created_at: '2025-02-01' },
    { id: 'usr-res-2', full_name: 'Elena Adarna', email: 'resident2@palmera-hoa.com', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 3', lot: 'Lot 08', created_at: '2025-02-05' },
    { id: 'usr-res-3', full_name: 'Ramon Revilla Sr.', email: 'ramon.revilla@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 1', lot: 'Lot 04', created_at: '2025-02-06' },
    { id: 'usr-res-4', full_name: 'Vilma Santos-Recto', email: 'vilma.santos@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 2', lot: 'Lot 11', created_at: '2025-02-08' },
    { id: 'usr-res-5', full_name: 'Fernando Poe Jr.', email: 'applicant@palmera-hoa.com', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'pending_approval', block: 'Block 4', lot: 'Lot 02', created_at: '2025-02-10' },
    { id: 'usr-res-6', full_name: 'Nora Aunor', email: 'nora.aunor@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 5', lot: 'Lot 09', created_at: '2025-02-12' },
    { id: 'usr-res-7', full_name: 'Sharon Cuneta-Pangilinan', email: 'sharon.cuneta@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 6', lot: 'Lot 14', created_at: '2025-02-14' },
    { id: 'usr-res-8', full_name: 'Robin Padilla', email: 'robin.padilla@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 7', lot: 'Lot 01', created_at: '2025-02-15' },
    { id: 'usr-res-9', full_name: 'Coco Martin', email: 'coco.martin@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 1', lot: 'Lot 15', created_at: '2025-02-16' },
    { id: 'usr-res-10', full_name: 'Dingdong Dantes', email: 'dingdong.dantes@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 2', lot: 'Lot 03', created_at: '2025-02-18' },
    { id: 'usr-res-11', full_name: 'Marian Rivera-Dantes', email: 'marian.rivera@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 3', lot: 'Lot 05', created_at: '2025-02-20' },
    { id: 'usr-res-12', full_name: 'Bea Alonzo', email: 'bea.alonzo@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 4', lot: 'Lot 10', created_at: '2025-02-22' },
    { id: 'usr-res-13', full_name: 'John Lloyd Cruz', email: 'johnlloyd.cruz@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 5', lot: 'Lot 02', created_at: '2025-02-24' },
    { id: 'usr-res-14', full_name: 'Piolo Pascual', email: 'piolo.pascual@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 6', lot: 'Lot 07', created_at: '2025-02-25' },
    { id: 'usr-res-15', full_name: 'Jericho Rosales', email: 'jericho.rosales@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 7', lot: 'Lot 12', created_at: '2025-02-26' },
    { id: 'usr-res-16', full_name: 'Kathryn Bernardo', email: 'kathryn.bernardo@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 1', lot: 'Lot 09', created_at: '2025-02-27' },
    { id: 'usr-res-17', full_name: 'Daniel Padilla', email: 'daniel.padilla@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 2', lot: 'Lot 18', created_at: '2025-02-27' },
    { id: 'usr-res-18', full_name: 'Liza Soberano', email: 'liza.soberano@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 3', lot: 'Lot 14', created_at: '2025-02-28' },
    { id: 'usr-res-19', full_name: 'Enrique Gil', email: 'enrique.gil@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 4', lot: 'Lot 07', created_at: '2025-02-28' },
    { id: 'usr-res-20', full_name: 'Alden Richards', email: 'alden.richards@nrgph2.org', role_name: 'resident', tenant_name: 'NRG PH2 HOA INC', tenant_id: 'tenant-palmera-1', is_active: 1, status: 'active', block: 'Block 5', lot: 'Lot 20', created_at: '2025-03-01' },
  ],

  // ── 4. RESIDENTS REGISTRY ──────────────────────────────────
  residents: [
    { id: 'res-1', full_name: 'Ricardo Dalisay', email: 'resident@palmera-hoa.com', contact_number: '0917-888-0001', address: 'Block 7 Lot 08, Maagap Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-01' },
    { id: 'res-2', full_name: 'Elena Adarna', email: 'resident2@palmera-hoa.com', contact_number: '0917-888-0002', address: 'Block 3 Lot 08, Mahogany Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-05' },
    { id: 'res-3', full_name: 'Ramon Revilla Sr.', email: 'ramon.revilla@nrgph2.org', contact_number: '0917-888-0003', address: 'Block 1 Lot 04, Mabuhay Avenue, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-06' },
    { id: 'res-4', full_name: 'Vilma Santos-Recto', email: 'vilma.santos@nrgph2.org', contact_number: '0917-888-0004', address: 'Block 2 Lot 11, Masipag Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-08' },
    { id: 'res-5', full_name: 'Fernando Poe Jr.', email: 'applicant@palmera-hoa.com', contact_number: '0917-888-0005', address: 'Block 4 Lot 02, Cypress Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-10' },
    { id: 'res-6', full_name: 'Nora Aunor', email: 'nora.aunor@nrgph2.org', contact_number: '0917-888-0006', address: 'Block 5 Lot 09, Marilag Street, NRG Phase 2', civil_status: 'widowed', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-12' },
    { id: 'res-7', full_name: 'Sharon Cuneta-Pangilinan', email: 'sharon.cuneta@nrgph2.org', contact_number: '0917-888-0007', address: 'Block 6 Lot 14, Malikhain Avenue, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-14' },
    { id: 'res-8', full_name: 'Robin Padilla', email: 'robin.padilla@nrgph2.org', contact_number: '0917-888-0008', address: 'Block 7 Lot 01, Maagap Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-15' },
    { id: 'res-9', full_name: 'Coco Martin', email: 'coco.martin@nrgph2.org', contact_number: '0917-888-0009', address: 'Block 1 Lot 15, Mabuhay Avenue, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-16' },
    { id: 'res-10', full_name: 'Dingdong Dantes', email: 'dingdong.dantes@nrgph2.org', contact_number: '0917-888-0010', address: 'Block 2 Lot 03, Masipag Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-18' },
    { id: 'res-11', full_name: 'Marian Rivera-Dantes', email: 'marian.rivera@nrgph2.org', contact_number: '0917-888-0011', address: 'Block 3 Lot 05, Mahogany Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-20' },
    { id: 'res-12', full_name: 'Bea Alonzo', email: 'bea.alonzo@nrgph2.org', contact_number: '0917-888-0012', address: 'Block 4 Lot 10, Cypress Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-22' },
    { id: 'res-13', full_name: 'John Lloyd Cruz', email: 'johnlloyd.cruz@nrgph2.org', contact_number: '0917-888-0013', address: 'Block 5 Lot 02, Marilag Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-24' },
    { id: 'res-14', full_name: 'Piolo Pascual', email: 'piolo.pascual@nrgph2.org', contact_number: '0917-888-0014', address: 'Block 6 Lot 07, Malikhain Avenue, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-25' },
    { id: 'res-15', full_name: 'Jericho Rosales', email: 'jericho.rosales@nrgph2.org', contact_number: '0917-888-0015', address: 'Block 7 Lot 12, Maagap Street, NRG Phase 2', civil_status: 'married', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-26' },
    { id: 'res-16', full_name: 'Kathryn Bernardo', email: 'kathryn.bernardo@nrgph2.org', contact_number: '0917-888-0016', address: 'Block 1 Lot 09, Mabuhay Avenue, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-27' },
    { id: 'res-17', full_name: 'Daniel Padilla', email: 'daniel.padilla@nrgph2.org', contact_number: '0917-888-0017', address: 'Block 2 Lot 18, Masipag Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-27' },
    { id: 'res-18', full_name: 'Liza Soberano', email: 'liza.soberano@nrgph2.org', contact_number: '0917-888-0018', address: 'Block 3 Lot 14, Mahogany Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-28' },
    { id: 'res-19', full_name: 'Enrique Gil', email: 'enrique.gil@nrgph2.org', contact_number: '0917-888-0019', address: 'Block 4 Lot 07, Cypress Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-02-28' },
    { id: 'res-20', full_name: 'Alden Richards', email: 'alden.richards@nrgph2.org', contact_number: '0917-888-0020', address: 'Block 5 Lot 20, Marilag Street, NRG Phase 2', civil_status: 'single', indigency_status: 0, voter_status: 'registered', created_at: '2025-03-01' },
  ],

  // ── 5. BILLING & DUES LEDGER ───────────────────────────────
  billing: [
    { id: 'led-1', resident_id: 'usr-res-1', resident_name: 'Ricardo Dalisay (Blk 7 Lot 08)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-2', resident_id: 'usr-res-2', resident_name: 'Elena Adarna (Blk 3 Lot 08)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'gcash', reference_no: 'GC-982144' },
    { id: 'led-3', resident_id: 'usr-res-3', resident_name: 'Ramon Revilla Sr. (Blk 1 Lot 04)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'overdue' },
    { id: 'led-4', resident_id: 'usr-res-4', resident_name: 'Vilma Santos-Recto (Blk 2 Lot 11)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'bank_transfer', reference_no: 'BDO-7721' },
    { id: 'led-5', resident_id: 'usr-res-5', resident_name: 'Fernando Poe Jr. (Blk 4 Lot 02)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-6', resident_id: 'usr-res-6', resident_name: 'Nora Aunor (Blk 5 Lot 09)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'cash', reference_no: 'OR-5541' },
    { id: 'led-7', resident_id: 'usr-res-7', resident_name: 'Sharon Cuneta (Blk 6 Lot 14)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-8', resident_id: 'usr-res-8', resident_name: 'Robin Padilla (Blk 7 Lot 01)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'paymaya', reference_no: 'PM-8812' },
    { id: 'led-9', resident_id: 'usr-res-9', resident_name: 'Coco Martin (Blk 1 Lot 15)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-10', resident_id: 'usr-res-10', resident_name: 'Dingdong Dantes (Blk 2 Lot 03)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'card', reference_no: 'CC-3321' },
    { id: 'led-11', resident_id: 'usr-res-11', resident_name: 'Marian Rivera (Blk 3 Lot 05)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'gcash', reference_no: 'GC-1129' },
    { id: 'led-12', resident_id: 'usr-res-12', resident_name: 'Bea Alonzo (Blk 4 Lot 10)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'overdue' },
    { id: 'led-13', resident_id: 'usr-res-13', resident_name: 'John Lloyd Cruz (Blk 5 Lot 02)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'bank_transfer', reference_no: 'BPI-9902' },
    { id: 'led-14', resident_id: 'usr-res-14', resident_name: 'Piolo Pascual (Blk 6 Lot 07)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'gcash', reference_no: 'GC-7744' },
    { id: 'led-15', resident_id: 'usr-res-15', resident_name: 'Jericho Rosales (Blk 7 Lot 12)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-16', resident_id: 'usr-res-16', resident_name: 'Kathryn Bernardo (Blk 1 Lot 09)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'card', reference_no: 'CC-5511' },
    { id: 'led-17', resident_id: 'usr-res-17', resident_name: 'Daniel Padilla (Blk 2 Lot 18)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'gcash', reference_no: 'GC-6633' },
    { id: 'led-18', resident_id: 'usr-res-18', resident_name: 'Liza Soberano (Blk 3 Lot 14)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
    { id: 'led-19', resident_id: 'usr-res-19', resident_name: 'Enrique Gil (Blk 4 Lot 07)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 0, paid_amount: 2500, balance: 0, due_date: '2026-09-10', status: 'paid', payment_method: 'paymaya', reference_no: 'PM-2234' },
    { id: 'led-20', resident_id: 'usr-res-20', resident_name: 'Alden Richards (Blk 5 Lot 20)', billing_period: '2026-09', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, paid_amount: 0, balance: 3000, due_date: '2026-09-10', status: 'unpaid' },
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
      doc_type: 'car_sticker',
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
      doc_type: 'certificate',
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
      doc_type: 'home_improvement',
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
      grandTotalDue: 3000,
      ledgers: [
        { id: '100', description: 'September 2026 Monthly Association Dues', amount: 2500, previous_balance: 500, due_date: '2026-09-10', status: 'unpaid' },
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
  birthDate?: string;
  gender?: 'Male' | 'Female';
  age?: number;
  idType?: string;
  idPhotoUrl?: string;
  phone: string;
  email: string;
  ownershipType: 'Turned-over Owner' | 'Registered Buyer' | 'Co-Owner';
  turnoverDate: string;
  status: 'verified_active';
}

export const HOA_MASTERLIST_DATABASE: MasterlistRecord[] = [
  // ── Block 1 (Magiting Street) ──
  { id: 'ml-01', accountNo: 'NRG2-B01L02', block: 'Block 1', lot: 'Lot 02', street: 'Magiting Street', ownerName: 'Pedro Penduko', birthDate: '1982-11-20', gender: 'Male', age: 43, idType: 'National ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0922-345-6789', email: 'pedro.penduko@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-15', status: 'verified_active' },
  { id: 'ml-02', accountNo: 'NRG2-B01L08', block: 'Block 1', lot: 'Lot 08', street: 'Magiting Street', ownerName: 'Anne Gregori', birthDate: '1990-08-22', gender: 'Female', age: 35, idType: 'Passport', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0919-334-8811', email: 'anne.gregori@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-04-10', status: 'verified_active' },
  { id: 'ml-03', accountNo: 'NRG2-B01L14', block: 'Block 1', lot: 'Lot 14', street: 'Magiting Street', ownerName: 'Ronalyn Villarte', birthDate: '1993-04-10', gender: 'Female', age: 33, idType: 'UMID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0919-334-8812', email: 'ronalyn.villarte@gmail.com', ownershipType: 'Registered Buyer', turnoverDate: '2024-05-20', status: 'verified_active' },

  // ── Block 2 (Maagap Street) ──
  { id: 'ml-04', accountNo: 'NRG2-B02L01', block: 'Block 2', lot: 'Lot 01', street: 'Maagap Street', ownerName: 'Rey Mar Villanueva', birthDate: '1979-06-15', gender: 'Male', age: 47, idType: "Driver's License", idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-882-9401', email: 'president.reymar@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-11-01', status: 'verified_active' },
  { id: 'ml-05', accountNo: 'NRG2-B02L06', block: 'Block 2', lot: 'Lot 06', street: 'Maagap Street', ownerName: 'Jemma Alamillo', birthDate: '1988-12-05', gender: 'Female', age: 37, idType: 'SSS / UMID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-445-9922', email: 'jemma.alamillo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-01-18', status: 'verified_active' },

  // ── Block 3 (Maagap Street) ──
  { id: 'ml-06', accountNo: 'NRG2-B03L12', block: 'Block 3', lot: 'Lot 12', street: 'Maagap Street', ownerName: 'Juan Dela Cruz', birthDate: '1980-03-24', gender: 'Male', age: 46, idType: "Driver's License", idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-123-4567', email: 'juan.delacruz@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2023-12-10', status: 'verified_active' },
  { id: 'ml-07', accountNo: 'NRG2-B03L18', block: 'Block 3', lot: 'Lot 18', street: 'Maagap Street', ownerName: 'Jocelyn Selanova', birthDate: '1986-09-18', gender: 'Female', age: 39, idType: 'Voter ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0920-881-2233', email: 'jocelyn.selanova@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-14', status: 'verified_active' },

  // ── Block 4 (Mabuti Street) ──
  { id: 'ml-08', accountNo: 'NRG2-B04L05', block: 'Block 4', lot: 'Lot 05', street: 'Mabuti Street', ownerName: 'Maria Santos', birthDate: '1975-01-20', gender: 'Female', age: 51, idType: 'PRC ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0918-234-5678', email: 'maria.santos@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-28', status: 'verified_active' },
  { id: 'ml-09', accountNo: 'NRG2-B04L11', block: 'Block 4', lot: 'Lot 11', street: 'Mabuti Street', ownerName: 'Melinda Domingo', birthDate: '1992-07-14', gender: 'Female', age: 34, idType: 'National ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0918-662-7744', email: 'melinda.domingo@gmail.com', ownershipType: 'Registered Buyer', turnoverDate: '2024-06-05', status: 'verified_active' },

  // ── Block 5 (Mabuti Street) ──
  { id: 'ml-10', accountNo: 'NRG2-B05L09', block: 'Block 5', lot: 'Lot 09', street: 'Mabuti Street', ownerName: 'Cezar Climaco', birthDate: '1981-10-30', gender: 'Male', age: 44, idType: 'Passport', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0918-554-1102', email: 'vp.cezar@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-10-15', status: 'verified_active' },
  { id: 'ml-11', accountNo: 'NRG2-B05L15', block: 'Block 5', lot: 'Lot 15', street: 'Mabuti Street', ownerName: 'Alma Miralles', birthDate: '1987-05-19', gender: 'Female', age: 39, idType: 'Postal ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0922-339-4455', email: 'alma.miralles@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-04-22', status: 'verified_active' },

  // ── Block 6 (Magiting Street) ──
  { id: 'ml-12', accountNo: 'NRG2-B06L03', block: 'Block 6', lot: 'Lot 03', street: 'Magiting Street', ownerName: 'Alma Valdezco', birthDate: '1978-08-08', gender: 'Female', age: 48, idType: 'UMID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-123-4567', email: 'treasurer.alma@nrgph2.org', ownershipType: 'Turned-over Owner', turnoverDate: '2023-09-20', status: 'verified_active' },
  { id: 'ml-13', accountNo: 'NRG2-B06L07', block: 'Block 6', lot: 'Lot 07', street: 'Magiting Street', ownerName: 'Ofelia Esloyo', birthDate: '1983-02-14', gender: 'Female', age: 43, idType: 'National ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-551-8866', email: 'ofelia.esloyo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-01', status: 'verified_active' },

  // ── Block 7 (Maagap Street) ──
  { id: 'ml-14', accountNo: 'NRG2-B07L08', block: 'Block 7', lot: 'Lot 08', street: 'Maagap Street', ownerName: 'Ricardo Dalisay', birthDate: '1985-05-14', gender: 'Male', age: 41, idType: "Driver's License", idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-888-9999', email: 'resident@palmera-hoa.com', ownershipType: 'Turned-over Owner', turnoverDate: '2023-08-12', status: 'verified_active' },
  { id: 'ml-15', accountNo: 'NRG2-B07L14', block: 'Block 7', lot: 'Lot 14', street: 'Maagap Street', ownerName: 'Rina Dorate', birthDate: '1991-11-25', gender: 'Female', age: 34, idType: 'Postal ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0906-443-1177', email: 'rina.dorate@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-01-30', status: 'verified_active' },

  // ── Block 8 (Mapayapa Street) ──
  { id: 'ml-16', accountNo: 'NRG2-B08L14', block: 'Block 8', lot: 'Lot 14', street: 'Mapayapa Street', ownerName: 'Ana Elena Reyes', birthDate: '1984-04-03', gender: 'Female', age: 42, idType: 'PRC ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0905-456-7890', email: 'ana.reyes@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-02-10', status: 'verified_active' },
  { id: 'ml-17', accountNo: 'NRG2-B08L20', block: 'Block 8', lot: 'Lot 20', street: 'Mapayapa Street', ownerName: 'Patrick Gariando', birthDate: '1989-07-29', gender: 'Male', age: 37, idType: "Driver's License", idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0922-114-8802', email: 'patrick.gariando@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-05-11', status: 'verified_active' },

  // ── Block 9 (Mapayapa Street) ──
  { id: 'ml-18', accountNo: 'NRG2-B09L05', block: 'Block 9', lot: 'Lot 05', street: 'Mapayapa Street', ownerName: 'Jennerfer Barlaan', birthDate: '1986-12-12', gender: 'Female', age: 39, idType: 'National ID', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0918-994-5599', email: 'jennerfer.barlaan@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-03-25', status: 'verified_active' },
  { id: 'ml-19', accountNo: 'NRG2-B09L10', block: 'Block 9', lot: 'Lot 10', street: 'Mapayapa Street', ownerName: 'Melody Matienzo', birthDate: '1994-03-17', gender: 'Female', age: 32, idType: 'Passport', idPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', phone: '0917-881-3301', email: 'melody.matienzo@gmail.com', ownershipType: 'Turned-over Owner', turnoverDate: '2024-06-18', status: 'verified_active' },
];

/**
 * Intelligent Multi-Factor Masterlist Matcher Algorithm
 * Checks if applicant matches official HOA property records securely
 */
export function matchMasterlistRecord(params: {
  fullName: string;
  block?: string;
  lot?: string;
  birthDate?: string;
  gender?: string;
  accountNo?: string;
  phone?: string;
}): MasterlistRecord | null {
  const normName = (params.fullName || '').trim().toLowerCase();
  const normBlock = (params.block || '').replace(/[^0-9]/g, '');
  const normLot = (params.lot || '').replace(/[^0-9]/g, '');
  const normAccount = (params.accountNo || '').trim().toLowerCase();
  const normPhone = (params.phone || '').replace(/[^0-9]/g, '');
  const normGender = (params.gender || '').trim().toLowerCase();
  const normDOB = (params.birthDate || '').trim();

  if (!normName && !normBlock && !normLot && !normAccount && !normPhone) return null;

  return HOA_MASTERLIST_DATABASE.find(record => {
    // 1. Account Number exact match
    if (normAccount && (record.accountNo || '').toLowerCase() === normAccount) {
      return true;
    }

    const recordBlock = (record.block || '').replace(/[^0-9]/g, '');
    const recordLot = (record.lot || '').replace(/[^0-9]/g, '');
    const recordName = (record.ownerName || '').trim().toLowerCase();
    const recordPhone = (record.phone || '').replace(/[^0-9]/g, '');
    const recordGender = (record.gender || '').trim().toLowerCase();
    const recordDOB = (record.birthDate || '').trim();

    // 2. Multi-factor Check: Block + Lot match
    const blockMatch = normBlock && recordBlock === normBlock;
    const lotMatch = normLot && (recordLot === normLot || parseInt(recordLot) === parseInt(normLot));
    
    // Name fuzzy comparison
    const nameMatch = normName.length >= 3 && (
      recordName === normName ||
      recordName.includes(normName) ||
      normName.includes(recordName) ||
      normName.split(' ').filter(w => w.length > 2).every(w => recordName.includes(w))
    );

    // Gender check (if provided in both, must match)
    const genderMatch = !normGender || !recordGender || normGender === recordGender;

    // Date of birth check (if provided in both, must match year or full date)
    const dobMatch = !normDOB || !recordDOB || normDOB === recordDOB || normDOB.slice(0, 4) === recordDOB.slice(0, 4);

    // Phone match
    const phoneMatch = normPhone.length >= 7 && (recordPhone.includes(normPhone) || normPhone.includes(recordPhone));

    if (blockMatch && lotMatch && (nameMatch || phoneMatch) && genderMatch && dobMatch) {
      return true;
    }

    return false;
  }) || null;
}

// Schema version ensures that any device or browser gets all 20 homeowners and latest data immediately
const SCHEMA_VERSION = 'v5_20_homeowners_full';

// Safe local persistence getter & setter
export function getMockData<K extends keyof MockDatabaseSchema>(key: K): MockDatabaseSchema[K] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentVer = window.localStorage.getItem('hoa_mock_version');
      if (currentVer !== SCHEMA_VERSION) {
        // Clear older mock entries to sync all 20 accounts and ledgers
        Object.keys(window.localStorage).forEach(k => {
          if (k.startsWith('hoa_mock_')) window.localStorage.removeItem(k);
        });
        window.localStorage.setItem('hoa_mock_version', SCHEMA_VERSION);
        return INITIAL_MOCK_DATABASE[key];
      }

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

