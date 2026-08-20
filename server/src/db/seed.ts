import '../config/database'; // initialize DB & schema
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const DB_PATH = process.env.DATABASE_PATH || './data/portal.db';
const db = new DatabaseSync(path.resolve(DB_PATH));

async function seed() {
  console.log('🌱 Starting database seed for enhanced HOA Flow...');
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
  insertTenant.run(tenantHoaId, 'Palmera Subdivision HOA', 'hoa', 'Block 1, Main Ave, Palmera Subd', '(02) 8987-6543');
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
    'INSERT INTO users (id, tenant_id, role_id, email, password_hash, full_name, is_active, status, phone_number) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
  );

  const uAdminId    = 'usr-superadmin';
  const uOfficialId = 'usr-official-1';
  const uHoaAdminId = 'usr-hoa-admin-1';
  const uStaffId    = 'usr-hoa-staff-1';
  const uGuardId    = 'usr-guard-1';
  const uResident1Id= 'usr-resident-1';
  const uResident2Id= 'usr-resident-2';
  const uPendingId  = 'usr-pending-resident';

  insertUser.run(uAdminId, tenantBrgyId, 1, 'superadmin@portal.gov.ph', passwordAdmin, 'Hon. Maria Santos (Super Admin)', 'active', '09170000001');
  insertUser.run(uOfficialId, tenantBrgyId, 2, 'kapitan@brgy174.gov.ph', passwordOfficial, 'Kap. Juan Dela Cruz', 'active', '09170000002');
  insertUser.run(uHoaAdminId, tenantHoaId, 3, 'treasurer@palmera-hoa.com', passwordHOA, 'Engr. Roberto Garcia (HOA Pres)', 'active', '09170000003');
  insertUser.run(uStaffId, tenantHoaId, 6, 'staff@palmera-hoa.com', passwordStaff, 'Ana Ramos (Admin Staff)', 'active', '09170000004');
  insertUser.run(uGuardId, tenantHoaId, 4, 'guard@palmera-hoa.com', passwordGuard, 'Sgt. Pedro Penduko (Main Gate)', 'active', '09170000005');
  insertUser.run(uResident1Id, tenantHoaId, 5, 'resident@palmera-hoa.com', passwordResident, 'Ricardo Dalisay', 'active', '09170000006');
  insertUser.run(uResident2Id, tenantHoaId, 5, 'resident2@palmera-hoa.com', passwordResident, 'Elena Adarna', 'active', '09170000007');
  insertUser.run(uPendingId, tenantHoaId, 5, 'applicant@palmera-hoa.com', passwordResident, 'Fernando Poe Jr. (Pending)', 'pending_approval', '09170000008');

  console.log('✅ Users seeded');

  // ── 4. Resident Profiles ──────────────────────────────────
  db.exec('DELETE FROM resident_profiles');
  const insertResident = db.prepare(
    'INSERT INTO resident_profiles (id, user_id, tenant_id, address, contact_number, civil_status, birthdate, indigency_status, verification_doc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertResident.run(uuidv4(), uResident1Id, tenantHoaId, 'Blk 5 Lot 12, Palmera Ave', '09170000006', 'married', '1985-06-15', 0, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
  insertResident.run(uuidv4(), uResident2Id, tenantHoaId, 'Blk 3 Lot 8, Mahogany St', '09170000007', 'single', '1992-11-20', 0, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
  insertResident.run(uuidv4(), uPendingId, tenantHoaId, 'Blk 7 Lot 2, Cypress St', '09170000008', 'married', '1978-03-10', 0, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
  console.log('✅ Resident profiles seeded');

  // ── 5. Facilities ─────────────────────────────────────────
  db.exec('DELETE FROM facilities');
  const insertFacility = db.prepare(
    'INSERT INTO facilities (id, tenant_id, name, capacity, description) VALUES (?, ?, ?, ?, ?)'
  );
  const fBballId = 'fac-basketball';

  insertFacility.run(fBballId, tenantHoaId, 'Covered Basketball Court', 80, 'Full-court covered basketball court with LED floodlights & tournament-grade acrylic flooring');
  console.log('✅ Facilities seeded');

  // Seed sample reservations for Basketball Court
  db.exec('DELETE FROM reservations');
  const insertRes = db.prepare(
    'INSERT INTO reservations (id, facility_id, tenant_id, reserved_by, title, start_time, end_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const todayStr = new Date().toISOString().split('T')[0];
  insertRes.run(
    uuidv4(), fBballId, tenantHoaId, uResident1Id,
    'Youth 3v3 Basketball Practice',
    `${todayStr}T14:00:00.000Z`, `${todayStr}T16:00:00.000Z`,
    'approved', 'Bring extra basketballs and hydration'
  );
  insertRes.run(
    uuidv4(), fBballId, tenantHoaId, uResident2Id,
    'Inter-Block League Tournament',
    `${todayStr}T18:00:00.000Z`, `${todayStr}T20:00:00.000Z`,
    'approved', 'Scoreboard setup requested'
  );
  console.log('✅ Basketball court sample reservations seeded');

  // ── 6. Billing Ledgers ────────────────────────────────────
  db.exec('DELETE FROM billing_ledgers');
  const insertBilling = db.prepare(
    'INSERT INTO billing_ledgers (id, tenant_id, resident_id, billing_period, description, amount, previous_balance, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const b1Id = uuidv4();
  const b2Id = uuidv4();
  const b3Id = uuidv4();

  insertBilling.run(b1Id, tenantHoaId, uResident1Id, '2025-10', 'Monthly HOA Maintenance Dues', 2500.00, 0.00, 'paid', '2025-10-10');
  insertBilling.run(b2Id, tenantHoaId, uResident1Id, '2025-11', 'Monthly HOA Maintenance Dues', 2500.00, 500.00, 'unpaid', '2025-11-10');
  insertBilling.run(b3Id, tenantHoaId, uResident2Id, '2025-11', 'Monthly HOA Maintenance Dues', 2500.00, 2500.00, 'overdue', '2025-11-01');
  console.log('✅ Billing ledgers seeded');

  // ── 7. Expenditures (Cash Flow & Financial Transparency) ─
  db.exec('DELETE FROM hoa_expenditures');
  const insertExp = db.prepare(
    'INSERT INTO hoa_expenditures (id, tenant_id, category, title, amount, date_spent, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertExp.run(uuidv4(), tenantHoaId, 'security', '24/7 Gate Guard Personnel Salary', 45000.00, '2025-10-28', 'Monthly security force compensation for 4 officers');
  insertExp.run(uuidv4(), tenantHoaId, 'utilities', 'Clubhouse & Streetlight Electricity Bill', 18450.00, '2025-10-25', 'Meralco electric bill for common areas');
  insertExp.run(uuidv4(), tenantHoaId, 'landscaping', 'Perimeter Lawn & Tree Trimming', 12000.00, '2025-10-20', 'Bi-weekly landscaping and lawn care service');
  insertExp.run(uuidv4(), tenantHoaId, 'repairs', 'Main Gate Boom Barrier Repair & Solar Streetlights', 28500.00, '2025-10-15', 'Replacement of broken automated boom sensor and 5 solar lights');
  console.log('✅ HOA Expenditures seeded');

  // ── 8. HOA Accomplishments (Slideshow Carousel) ────────────
  db.exec('DELETE FROM hoa_accomplishments');
  const insertAcc = db.prepare(
    'INSERT INTO hoa_accomplishments (id, tenant_id, title, description, image_url, date_completed, budget_spent) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertAcc.run(
    uuidv4(), tenantHoaId,
    'Perimeter CCTV & Automated Boom Barrier Installation',
    'Installed 16 HD 4K Night-Vision Cameras and automated RFID Boom Barriers at Main and Back Gates to ensure 24/7 security.',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop&auto=format',
    '2025-09-15', 185000.00
  );
  insertAcc.run(
    uuidv4(), tenantHoaId,
    'Solar LED Streetlighting & Road Re-paving Project',
    'Re-paved 1.2km of main avenue roads and installed 30 eco-friendly solar-powered streetlights across Block 3 to Block 7.',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop&auto=format',
    '2025-08-30', 320000.00
  );
  insertAcc.run(
    uuidv4(), tenantHoaId,
    'Covered Basketball Court LED Lighting & Flooring Upgrade',
    'Upgraded court LED floodlights, repainted lines, and resurfaced tournament-grade acrylic flooring for night games.',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=400&fit=crop&auto=format',
    '2025-07-10', 145000.00
  );
  console.log('✅ HOA Accomplishments seeded');

  // ── 9. HOA Meetings & Minutes ──────────────────────────────
  db.exec('DELETE FROM hoa_meetings');
  const insertMeeting = db.prepare(
    'INSERT INTO hoa_meetings (id, tenant_id, title, meeting_date, location, agenda, minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertMeeting.run(
    uuidv4(), tenantHoaId,
    'Q4 2025 Annual General Homeowners Assembly',
    '2025-11-15 14:00:00',
    'Covered Basketball Court Pavilion',
    '1. Presentation of 2025 Financial Statement & Cash Flow\n2. Vote on Proposed Gate RFID System\n3. Holiday Security Protocols',
    null,
    'upcoming'
  );
  insertMeeting.run(
    uuidv4(), tenantHoaId,
    'Q3 2025 Board of Directors Regular Meeting',
    '2025-08-20 19:00:00',
    'HOA Administrative Pavilion',
    '1. Approval of Solar Streetlight Project Contractor\n2. Tree Trimming & Drainage Clearing before Typhoon Season\n3. Review of Unpaid Dues & Collection Strategy',
    'MINUTES:\n- Meeting called to order at 7:05 PM by President Roberto Garcia.\n- Financial Report presented by Treasurer Ana Ramos: Total collections at 88% rate.\n- Resolution #2025-08 approved for Solar Light installation budget of ₱320,000.\n- Meeting adjourned at 8:45 PM.',
    'completed'
  );
  console.log('✅ HOA Meetings seeded');

  // ── 10. HOA Requests ───────────────────────────────────────
  db.exec('DELETE FROM hoa_requests');
  const insertReq = db.prepare(
    'INSERT INTO hoa_requests (id, tenant_id, requester_id, request_type, details, vehicle_info, scheduled_at, officer_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, uResident1Id, 'parking_sticker',
    'Requesting 2 RFID Gate Stickers for family vehicles',
    'Vehicle 1: Toyota Fortuner (ABC 1234) / Vehicle 2: Honda Civic (XYZ 9876)',
    null, null, 'approved'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, uResident1Id, 'home_improvement',
    'Front gate fencing repaint and roof gutter installation',
    null, null, null, 'pending'
  );
  insertReq.run(
    uuidv4(), tenantHoaId, uResident2Id, 'officer_meeting',
    'Meeting regarding neighbor noise disturbance after 10PM',
    null, '2025-11-08 10:00:00', 'Engr. Roberto Garcia (HOA Pres)', 'pending'
  );
  console.log('✅ HOA Requests seeded');

  // ── 11. Announcements ─────────────────────────────────────
  db.exec('DELETE FROM announcements');
  const insertAnn = db.prepare(
    'INSERT INTO announcements (id, tenant_id, author_id, title, content, category) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insertAnn.run(
    uuidv4(), tenantHoaId, uHoaAdminId,
    '📢 Q4 Annual Homeowners General Assembly Scheduled',
    'Dear Homeowners, Please mark your calendars for our Q4 Assembly on Nov 15 at 2:00 PM in the Grand Clubhouse. Financial statements and new gate protocols will be discussed.',
    'event'
  );
  insertAnn.run(
    uuidv4(), tenantHoaId, uStaffId,
    '⚡ Scheduled Meralco Maintenance & Water Tank Cleaning',
    'Please be informed that there will be a temporary water interruption on Thursday from 8 AM to 12 PM for elevated water tank flushing and chlorination.',
    'urgent'
  );
  console.log('✅ Announcements seeded');

  console.log('\n🎉 Database seeded successfully for Enhanced HOA Flow!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Super Admin:       superadmin@portal.gov.ph  / Admin@1234');
  console.log('  Barangay Official: kapitan@brgy174.gov.ph    / Official@1234');
  console.log('  HOA Admin (Pres):  treasurer@palmera-hoa.com / HOAAdmin@1234');
  console.log('  Admin Staff:       staff@palmera-hoa.com     / Staff@1234');
  console.log('  Security Guard:    guard@palmera-hoa.com     / Guard@1234');
  console.log('  Resident 1:        resident@palmera-hoa.com  / Resident@1234');
}

seed().catch(console.error);
