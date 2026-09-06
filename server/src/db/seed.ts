import '../config/database'; // initialize DB & schema
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const DB_PATH = process.env.DATABASE_PATH || './data/portal.db';
const db = new DatabaseSync(path.resolve(DB_PATH));

export interface HomeownerSeed {
  id: string;
  name: string;
  email: string;
  block: string;
  lot: string;
  street: string;
  phone: string;
  civil: string;
  duesStatus: 'paid' | 'unpaid' | 'overdue';
  amount: number;
  arrears: number;
  status: 'active' | 'pending_approval';
  householdCount: number;
  vehicles: string;
}

export const HOMEOWNERS_20: HomeownerSeed[] = [
  { id: 'usr-res-1', name: 'Ricardo Dalisay', email: 'resident@palmera-hoa.com', block: 'Block 7', lot: 'Lot 08', street: 'Maagap Street', phone: '0917-888-0001', civil: 'married', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 3, vehicles: 'Toyota Fortuner (ABC-1234)' },
  { id: 'usr-res-2', name: 'Elena Adarna', email: 'resident2@palmera-hoa.com', block: 'Block 3', lot: 'Lot 08', street: 'Mahogany Street', phone: '0917-888-0002', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 1, vehicles: 'Honda Civic (XYZ-9876)' },
  { id: 'usr-res-3', name: 'Ramon Revilla Sr.', email: 'ramon.revilla@nrgph2.org', block: 'Block 1', lot: 'Lot 04', street: 'Mabuhay Avenue', phone: '0917-888-0003', civil: 'married', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 4, vehicles: 'Mitsubishi Montero (REV-1111)' },
  { id: 'usr-res-4', name: 'Vilma Santos-Recto', email: 'vilma.santos@nrgph2.org', block: 'Block 2', lot: 'Lot 11', street: 'Masipag Street', phone: '0917-888-0004', civil: 'married', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 2, vehicles: 'Nissan Terra (VSR-2222)' },
  { id: 'usr-res-5', name: 'Fernando Poe Jr.', email: 'applicant@palmera-hoa.com', block: 'Block 4', lot: 'Lot 02', street: 'Cypress Street', phone: '0917-888-0005', civil: 'married', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'pending_approval', householdCount: 2, vehicles: 'Ford Everest (FPJ-0005)' },
  { id: 'usr-res-6', name: 'Nora Aunor', email: 'nora.aunor@nrgph2.org', block: 'Block 5', lot: 'Lot 09', street: 'Marilag Street', phone: '0917-888-0006', civil: 'widowed', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 2, vehicles: 'Hyundai Tucson (NRA-6666)' },
  { id: 'usr-res-7', name: 'Sharon Cuneta-Pangilinan', email: 'sharon.cuneta@nrgph2.org', block: 'Block 6', lot: 'Lot 14', street: 'Malikhain Avenue', phone: '0917-888-0007', civil: 'married', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 3, vehicles: 'Toyota Alphard (SHA-7777)' },
  { id: 'usr-res-8', name: 'Robin Padilla', email: 'robin.padilla@nrgph2.org', block: 'Block 7', lot: 'Lot 01', street: 'Maagap Street', phone: '0917-888-0008', civil: 'married', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 3, vehicles: 'Ford Ranger Raptor (ROB-8888)' },
  { id: 'usr-res-9', name: 'Coco Martin', email: 'coco.martin@nrgph2.org', block: 'Block 1', lot: 'Lot 15', street: 'Mabuhay Avenue', phone: '0917-888-0009', civil: 'single', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 1, vehicles: 'Jeep Wrangler (COC-9999)' },
  { id: 'usr-res-10', name: 'Dingdong Dantes', email: 'dingdong.dantes@nrgph2.org', block: 'Block 2', lot: 'Lot 03', street: 'Masipag Street', phone: '0917-888-0010', civil: 'married', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 3, vehicles: 'Ducati Scrambler / BMW X5' },
  { id: 'usr-res-11', name: 'Marian Rivera-Dantes', email: 'marian.rivera@nrgph2.org', block: 'Block 3', lot: 'Lot 05', street: 'Mahogany Street', phone: '0917-888-0011', civil: 'married', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 2, vehicles: 'Mercedes Benz GLC (MRD-1111)' },
  { id: 'usr-res-12', name: 'Bea Alonzo', email: 'bea.alonzo@nrgph2.org', block: 'Block 4', lot: 'Lot 10', street: 'Cypress Street', phone: '0917-888-0012', civil: 'single', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 1, vehicles: 'Land Rover Defender (BEA-1212)' },
  { id: 'usr-res-13', name: 'John Lloyd Cruz', email: 'johnlloyd.cruz@nrgph2.org', block: 'Block 5', lot: 'Lot 02', street: 'Marilag Street', phone: '0917-888-0013', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 1, vehicles: 'Subaru Forester (JLC-1313)' },
  { id: 'usr-res-14', name: 'Piolo Pascual', email: 'piolo.pascual@nrgph2.org', block: 'Block 6', lot: 'Lot 07', street: 'Malikhain Avenue', phone: '0917-888-0014', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 2, vehicles: 'Porsche Macan (PIO-1414)' },
  { id: 'usr-res-15', name: 'Jericho Rosales', email: 'jericho.rosales@nrgph2.org', block: 'Block 7', lot: 'Lot 12', street: 'Maagap Street', phone: '0917-888-0015', civil: 'married', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 2, vehicles: 'Triumph Bonneville Motorcycle' },
  { id: 'usr-res-16', name: 'Kathryn Bernardo', email: 'kathryn.bernardo@nrgph2.org', block: 'Block 1', lot: 'Lot 09', street: 'Mabuhay Avenue', phone: '0917-888-0016', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 2, vehicles: 'Mini Cooper S (KTH-1616)' },
  { id: 'usr-res-17', name: 'Daniel Padilla', email: 'daniel.padilla@nrgph2.org', block: 'Block 2', lot: 'Lot 18', street: 'Masipag Street', phone: '0917-888-0017', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 1, vehicles: 'Ford Mustang GT (DAN-1717)' },
  { id: 'usr-res-18', name: 'Liza Soberano', email: 'liza.soberano@nrgph2.org', block: 'Block 3', lot: 'Lot 14', street: 'Mahogany Street', phone: '0917-888-0018', civil: 'single', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 1, vehicles: 'Audi Q5 (LIZ-1818)' },
  { id: 'usr-res-19', name: 'Enrique Gil', email: 'enrique.gil@nrgph2.org', block: 'Block 4', lot: 'Lot 07', street: 'Cypress Street', phone: '0917-888-0019', civil: 'single', duesStatus: 'paid', amount: 2500, arrears: 0, status: 'active', householdCount: 1, vehicles: 'Chevrolet Camaro (ENR-1919)' },
  { id: 'usr-res-20', name: 'Alden Richards', email: 'alden.richards@nrgph2.org', block: 'Block 5', lot: 'Lot 20', street: 'Marilag Street', phone: '0917-888-0020', civil: 'single', duesStatus: 'unpaid', amount: 2500, arrears: 500, status: 'active', householdCount: 2, vehicles: 'Nissan GT-R (ALD-2020)' },
];

async function seed() {
  console.log('🌱 Starting comprehensive database seed with 20 Homeowner Accounts & Full RBAC...');
  db.exec('PRAGMA foreign_keys = OFF;');

  // ── 1. Roles ──────────────────────────────────────────────
  const roles = [
    { id: 1, name: 'super_admin' },
    { id: 2, name: 'barangay_official' },
    { id: 3, name: 'hoa_admin' },
    { id: 4, name: 'security_guard' },
    { id: 5, name: 'resident' },
    { id: 6, name: 'admin_staff' },
  ];

  db.exec('DELETE FROM roles');
  const insertRole = db.prepare('INSERT INTO roles (id, name) VALUES (?, ?)');
  for (const r of roles) insertRole.run(r.id, r.name);
  console.log('✅ Roles seeded');

  // ── 2. Tenants ─────────────────────────────────────────────
  const tenantBrgyId = 'tenant-brgy-174';
  const tenantHoaId = 'tenant-palmera-hoa';

  db.exec('DELETE FROM tenants');
  const insertTenant = db.prepare(
    'INSERT INTO tenants (id, name, type, address, contact) VALUES (?, ?, ?, ?, ?)'
  );
  insertTenant.run(tenantBrgyId, 'Barangay 174', 'barangay', 'Caloocan City, Metro Manila', '(02) 8123-4567');
  insertTenant.run(tenantHoaId, 'NRG PH2 HOA INC (Northridge Grove Phase 2)', 'hoa', 'Block 7 Maagap St, CSJDM, Bulacan', '(02) 8987-6543');
  console.log('✅ Tenants seeded');

  // ── 3. Passwords & Users ───────────────────────────────────
  const passwordAdmin    = await bcrypt.hash('Admin@1234', 10);
  const passwordOfficial = await bcrypt.hash('Official@1234', 10);
  const passwordHOA      = await bcrypt.hash('HOAAdmin@1234', 10);
  const passwordStaff    = await bcrypt.hash('Staff@1234', 10);
  const passwordGuard    = await bcrypt.hash('Guard@1234', 10);
  const passwordResident = await bcrypt.hash('Resident@1234', 10);

  db.exec('DELETE FROM users');
  const insertUser = db.prepare(
    'INSERT INTO users (id, tenant_id, role_id, email, password_hash, full_name, is_active, status, phone_number, block, lot, address) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)'
  );

  // 5 Staff / Official Users
  const uAdminId    = 'usr-superadmin';
  const uOfficialId = 'usr-official-1';
  const uHoaAdminId = 'usr-hoa-admin-1';
  const uStaffId    = 'usr-hoa-staff-1';
  const uGuardId    = 'usr-guard-1';

  insertUser.run(uAdminId, tenantBrgyId, 1, 'superadmin@portal.gov.ph', passwordAdmin, 'Hon. Maria Santos (Super Admin)', 'active', '09170000001', 'Admin', 'HQ', 'Barangay 174 & Bria HOA HQ');
  insertUser.run(uOfficialId, tenantBrgyId, 2, 'kapitan@brgy174.gov.ph', passwordOfficial, 'Kap. Juan Dela Cruz', 'active', '09170000002', 'Admin', '01', 'Barangay 174 Municipal Hall');
  insertUser.run(uHoaAdminId, tenantHoaId, 3, 'treasurer@palmera-hoa.com', passwordHOA, 'Engr. Roberto Garcia (HOA Pres)', 'active', '09170000003', 'Block 7', 'Lot 01', 'Block 7 Lot 01, Maagap St, NRG Phase 2');
  insertUser.run(uStaffId, tenantHoaId, 6, 'staff@palmera-hoa.com', passwordStaff, 'Ana Ramos (Admin Staff)', 'active', '09170000004', 'Block 3', 'Lot 15', 'Block 3 Lot 15, Mahogany St, NRG Phase 2');
  insertUser.run(uGuardId, tenantHoaId, 4, 'guard@palmera-hoa.com', passwordGuard, 'Sgt. Pedro Penduko (Main Gate)', 'active', '09170000005', 'Main', 'Gate', 'Security Guardhouse, NRG Phase 2');

  // 20 Homeowner Users
  for (const h of HOMEOWNERS_20) {
    const fullAddress = `${h.block} ${h.lot}, ${h.street}, Northridge Grove Phase 2`;
    insertUser.run(h.id, tenantHoaId, 5, h.email, passwordResident, h.name, h.status, h.phone, h.block, h.lot, fullAddress);
  }
  console.log(`✅ Users seeded: 5 Staff + 20 Homeowners (Total: 25)`);

  // ── 4. Resident Profiles ──────────────────────────────────
  db.exec('DELETE FROM resident_profiles');
  const insertResident = db.prepare(
    'INSERT INTO resident_profiles (id, user_id, tenant_id, address, contact_number, civil_status, birthdate, indigency_status, verification_doc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const h of HOMEOWNERS_20) {
    const fullAddress = `${h.block} ${h.lot}, ${h.street}, Northridge Grove Phase 2`;
    insertResident.run(
      uuidv4(),
      h.id,
      tenantHoaId,
      fullAddress,
      h.phone,
      h.civil,
      '1985-05-15',
      0,
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
    );
  }
  console.log('✅ Resident profiles seeded for all 20 homeowners');

  // ── 5. Household Members ──────────────────────────────────
  db.exec('DELETE FROM household_members');
  const insertHousehold = db.prepare(
    'INSERT INTO household_members (id, tenant_id, user_id, full_name, relationship, gender, age, contact_number, email, occupation, is_emergency_contact, has_rfid_access) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const h of HOMEOWNERS_20) {
    if (h.householdCount >= 2) {
      insertHousehold.run(
        uuidv4(), tenantHoaId, h.id,
        `${h.name.split(' ')[0]} Jr.`,
        'Dependent (Child)', 'Male', 16, h.phone, `child.${h.email}`, 'Student', 0, 1
      );
    }
    if (h.householdCount >= 3) {
      insertHousehold.run(
        uuidv4(), tenantHoaId, h.id,
        `Maria ${h.name.split(' ')[1] || 'Dalisay'}`,
        'Spouse', 'Female', 38, h.phone, `spouse.${h.email}`, 'Entrepreneur', 1, 1
      );
    }
  }
  console.log('✅ Household members seeded across homeowner properties');

  // ── 6. Billing Ledgers ────────────────────────────────────
  db.exec('DELETE FROM billing_ledgers');
  const insertBilling = db.prepare(
    'INSERT INTO billing_ledgers (id, tenant_id, resident_id, billing_period, description, amount, previous_balance, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const h of HOMEOWNERS_20) {
    // September 2026 Assessment
    insertBilling.run(
      uuidv4(),
      tenantHoaId,
      h.id,
      '2026-09',
      'Monthly HOA Association Dues & Maintenance',
      h.amount,
      h.arrears,
      h.duesStatus,
      '2026-09-26'
    );

    // Prior month (August 2026) - Paid
    insertBilling.run(
      uuidv4(),
      tenantHoaId,
      h.id,
      '2026-08',
      'Monthly HOA Association Dues & Maintenance',
      2500.00,
      0.00,
      'paid',
      '2026-08-26'
    );
  }
  console.log('✅ Billing ledgers seeded for all 20 homeowners');

  // ── 7. Facilities & Reservations ──────────────────────────
  db.exec('DELETE FROM facilities');
  const insertFacility = db.prepare(
    'INSERT INTO facilities (id, tenant_id, name, capacity, description) VALUES (?, ?, ?, ?, ?)'
  );
  const fBballId = 'fac-basketball';
  const fClubId = 'fac-clubhouse';

  insertFacility.run(fBballId, tenantHoaId, 'Covered Basketball Court', 80, 'Full-court covered basketball court with LED floodlights & tournament-grade acrylic flooring');
  insertFacility.run(fClubId, tenantHoaId, 'Grand Community Clubhouse', 150, 'Multi-purpose air-conditioned pavilion with sound system and function area');
  console.log('✅ Facilities seeded');

  db.exec('DELETE FROM reservations');
  const insertRes = db.prepare(
    'INSERT INTO reservations (id, facility_id, tenant_id, reserved_by, title, start_time, end_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const todayStr = new Date().toISOString().split('T')[0];
  insertRes.run(
    uuidv4(), fBballId, tenantHoaId, 'usr-res-1',
    'Inter-Block Basketball League Practice',
    `${todayStr}T14:00:00.000Z`, `${todayStr}T16:00:00.000Z`,
    'approved', 'Scoreboard setup requested'
  );
  insertRes.run(
    uuidv4(), fClubId, tenantHoaId, 'usr-res-4',
    'Subdivision Community Birthday Gathering',
    `${todayStr}T17:00:00.000Z`, `${todayStr}T21:00:00.000Z`,
    'approved', '50 guest capacity'
  );
  console.log('✅ Facility sample reservations seeded');

  // ── 8. Expenditures (Financial Transparency) ──────────────
  db.exec('DELETE FROM hoa_expenditures');
  const insertExp = db.prepare(
    'INSERT INTO hoa_expenditures (id, tenant_id, category, title, amount, date_spent, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertExp.run(uuidv4(), tenantHoaId, 'security', '24/7 Gate Guard Personnel Salary', 45000.00, '2026-08-28', 'Monthly security force compensation for 4 officers');
  insertExp.run(uuidv4(), tenantHoaId, 'utilities', 'Clubhouse & Streetlight Electricity Bill', 18450.00, '2026-08-25', 'Meralco electric bill for common areas');
  insertExp.run(uuidv4(), tenantHoaId, 'landscaping', 'Perimeter Lawn & Tree Trimming', 12000.00, '2026-08-20', 'Bi-weekly landscaping and lawn care service');
  insertExp.run(uuidv4(), tenantHoaId, 'repairs', 'Main Gate Boom Barrier Repair & Solar Streetlights', 28500.00, '2026-08-15', 'Replacement of broken automated boom sensor and 5 solar lights');
  console.log('✅ HOA Expenditures seeded');

  // ── 9. HOA Accomplishments (Carousel) ──────────────────────
  db.exec('DELETE FROM hoa_accomplishments');
  const insertAcc = db.prepare(
    'INSERT INTO hoa_accomplishments (id, tenant_id, title, description, image_url, date_completed, budget_spent) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertAcc.run(
    uuidv4(), tenantHoaId,
    'Perimeter CCTV & Automated Boom Barrier Installation',
    'Installed 16 HD 4K Night-Vision Cameras and automated RFID Boom Barriers at Main and Back Gates to ensure 24/7 security.',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop&auto=format',
    '2026-08-15', 185000.00
  );
  insertAcc.run(
    uuidv4(), tenantHoaId,
    'Solar LED Streetlighting & Road Re-paving Project',
    'Re-paved 1.2km of main avenue roads and installed 30 eco-friendly solar-powered streetlights across Block 3 to Block 7.',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format',
    '2026-07-30', 320000.00
  );
  console.log('✅ HOA Accomplishments seeded');

  // ── 10. HOA Service Requests ──────────────────────────────
  db.exec('DELETE FROM hoa_requests');
  const insertReq = db.prepare(
    'INSERT INTO hoa_requests (id, tenant_id, requester_id, request_type, details, vehicle_info, scheduled_at, officer_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, 'usr-res-1', 'parking_sticker',
    'Requesting RFID Gate Sticker for family vehicle',
    'Toyota Fortuner (ABC-1234)',
    null, null, 'approved'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, 'usr-res-3', 'home_improvement',
    'Front gate fencing repaint and roof gutter installation',
    null, null, null, 'pending'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, 'usr-res-7', 'officer_meeting',
    'Consultation regarding neighborhood tree overhang clearing',
    null, '2026-09-12 10:00:00', 'Engr. Roberto Garcia (HOA Pres)', 'pending'
  );
  console.log('✅ HOA Requests seeded');

  // ── 11. Announcements ─────────────────────────────────────
  db.exec('DELETE FROM announcements');
  const insertAnn = db.prepare(
    'INSERT INTO announcements (id, tenant_id, author_id, title, content, category) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insertAnn.run(
    uuidv4(), tenantHoaId, uHoaAdminId,
    '📢 Q3 Annual Homeowners General Assembly Scheduled',
    'Dear Homeowners, Please mark your calendars for our Q3 Assembly on September 28 at 2:00 PM in the Covered Basketball Court. Financial statements and RFID gate security will be discussed.',
    'event'
  );
  insertAnn.run(
    uuidv4(), tenantHoaId, uStaffId,
    '⚡ Scheduled Meralco Maintenance & Water Interruption',
    'Please be informed of scheduled elevated water tank flushing and line cleaning on Tuesday from 9:00 AM to 1:00 PM.',
    'urgent'
  );
  console.log('✅ Announcements seeded');

  // ── 12. Visitor Logs ──────────────────────────────────────
  db.exec('DELETE FROM visitor_logs');
  const insertVis = db.prepare(
    'INSERT INTO visitor_logs (id, tenant_id, host_id, visitor_name, visitor_id_type, visitor_id_no, vehicle_plate, purpose, time_in, time_out, gate_pass_qr, logged_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertVis.run(
    uuidv4(), tenantHoaId, 'usr-res-1',
    'GrabFood Delivery Rider (Mark Bautista)',
    'Drivers License', 'D02-12-882190', 'MC-8812', 'Food Delivery',
    new Date(Date.now() - 3600000).toISOString(), null, 'GP-1092', uGuardId
  );
  insertVis.run(
    uuidv4(), tenantHoaId, 'usr-res-4',
    'Converge ICT Fiber Technician (Arthur Mendoza)',
    'Company ID', 'CICT-7721', 'ND-9920', 'Fiber Line Diagnostics',
    new Date(Date.now() - 7200000).toISOString(), new Date().toISOString(), 'GP-1088', uGuardId
  );
  insertVis.run(
    uuidv4(), tenantHoaId, 'usr-res-8',
    'Maynilad Water Services Inspector (Jun Fernandez)',
    'Company ID', 'MNL-4412', 'NF-5521', 'Pressure Pipeline Meter Check',
    new Date(Date.now() - 1800000).toISOString(), null, 'GP-1095', uGuardId
  );
  console.log('✅ Visitor Logs seeded');

  // ── 13. Emergency Alerts ──────────────────────────────────
  db.exec('DELETE FROM emergency_alerts');
  const insertAlert = db.prepare(
    'INSERT INTO emergency_alerts (id, tenant_id, triggered_by, alert_type, message, location, status, broadcast_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertAlert.run(
    uuidv4(), tenantHoaId, 'usr-res-1', 'medical',
    'Resident experiencing sudden asthma symptoms. Barangay ambulance assistance requested.',
    'Block 7 Lot 08, Maagap Street',
    'resolved', 'hoa'
  );
  insertAlert.run(
    uuidv4(), tenantHoaId, 'usr-res-7', 'fire',
    'Small grass fire spotted near Perimeter Fence East. Security fire response dispatched.',
    'Perimeter Fence East near Block 12',
    'resolved', 'all'
  );
  console.log('✅ Emergency Alerts seeded');

  console.log('\n🎉 Comprehensive database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Super Admin:       superadmin@portal.gov.ph  / Admin@1234');
  console.log('  Barangay Official: kapitan@brgy174.gov.ph    / Official@1234');
  console.log('  HOA Admin (Pres):  treasurer@palmera-hoa.com / HOAAdmin@1234');
  console.log('  Admin Staff:       staff@palmera-hoa.com     / Staff@1234');
  console.log('  Security Guard:    guard@palmera-hoa.com     / Guard@1234');
  console.log('  20 Homeowners:     resident@palmera-hoa.com, resident2@palmera-hoa.com, ramon.revilla@nrgph2.org, etc. (Password: Resident@1234)');
}

seed().catch(console.error);
