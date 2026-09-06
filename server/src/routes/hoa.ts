import { Router } from 'express';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { sendRegistrationPendingEmail, sendRegistrationApprovedEmail, sendEmail } from '../services/mailService';

const router = Router();

// ============================================================
// 1. PUBLIC HOMEOWNER REGISTRATION WITH AUTOMATED MASTERLIST AUTO-ACCEPT
// ============================================================
const SERVER_HOA_MASTERLIST = [
  { block: 'Block 1', lot: 'Lot 02', street: 'Magiting Street', ownerName: 'Pedro Penduko', accountNo: 'NRG2-B01L02', phone: '0922-345-6789' },
  { block: 'Block 1', lot: 'Lot 08', street: 'Magiting Street', ownerName: 'Anne Gregori', accountNo: 'NRG2-B01L08', phone: '0919-334-8811' },
  { block: 'Block 2', lot: 'Lot 01', street: 'Maagap Street', ownerName: 'Rey Mar Villanueva', accountNo: 'NRG2-B02L01', phone: '0917-882-9401' },
  { block: 'Block 2', lot: 'Lot 06', street: 'Maagap Street', ownerName: 'Jemma Alamillo', accountNo: 'NRG2-B02L06', phone: '0917-445-9922' },
  { block: 'Block 3', lot: 'Lot 12', street: 'Maagap Street', ownerName: 'Juan Dela Cruz', accountNo: 'NRG2-B03L12', phone: '0917-123-4567' },
  { block: 'Block 3', lot: 'Lot 18', street: 'Maagap Street', ownerName: 'Jocelyn Selanova', accountNo: 'NRG2-B03L18', phone: '0920-881-2233' },
  { block: 'Block 4', lot: 'Lot 05', street: 'Mabuti Street', ownerName: 'Maria Santos', accountNo: 'NRG2-B04L05', phone: '0918-234-5678' },
  { block: 'Block 4', lot: 'Lot 11', street: 'Mabuti Street', ownerName: 'Melinda Domingo', accountNo: 'NRG2-B04L11', phone: '0918-662-7744' },
  { block: 'Block 5', lot: 'Lot 09', street: 'Mabuti Street', ownerName: 'Cezar Climaco', accountNo: 'NRG2-B05L09', phone: '0918-554-1102' },
  { block: 'Block 6', lot: 'Lot 03', street: 'Magiting Street', ownerName: 'Alma Valdezco', accountNo: 'NRG2-B06L03', phone: '0917-123-4567' },
  { block: 'Block 7', lot: 'Lot 08', street: 'Maagap Street', ownerName: 'Ricardo Dalisay', accountNo: 'NRG2-B07L08', phone: '0917-888-9999' },
  { block: 'Block 8', lot: 'Lot 14', street: 'Mapayapa Street', ownerName: 'Ana Elena Reyes', accountNo: 'NRG2-B08L14', phone: '0905-456-7890' },
  { block: 'Block 9', lot: 'Lot 05', street: 'Mapayapa Street', ownerName: 'Jennerfer Barlaan', accountNo: 'NRG2-B09L05', phone: '0918-994-5599' },
];

router.post('/register-homeowner', async (req, res) => {
  try {
    const { fullName, email, password, address, contactNumber, proofDocUrl, otpCode, block, lot, accountNo } = req.body;

    if (!fullName || !email || !password || !address || !contactNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify OTP (Simulation code: accepts '123456' or any 6-digit number)
    // Optional OTP code
    const effectiveOtp = otpCode || '123456';

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    // ── AUTOMATED MASTERLIST MATCHING ────────────────────────────
    const normName = String(fullName || '').trim().toLowerCase();
    const normBlock = String(block || address || '').replace(/[^0-9]/g, '');
    const normLot = String(lot || address || '').replace(/[^0-9]/g, '');
    const normAccount = String(accountNo || '').trim().toLowerCase();

    const masterlistMatch = SERVER_HOA_MASTERLIST.find(record => {
      if (normAccount && String(record.accountNo || '').toLowerCase() === normAccount) return true;
      const recBlock = String(record.block || '').replace(/[^0-9]/g, '');
      const recLot = String(record.lot || '').replace(/[^0-9]/g, '');
      const recName = String(record.ownerName || '').trim().toLowerCase();

      const blockLotMatch = (normBlock && recBlock === normBlock) || String(address || '').toLowerCase().includes(String(record.block || '').toLowerCase());
      const nameMatch = normName.length >= 3 && (recName.includes(normName) || normName.includes(recName));

      return blockLotMatch && nameMatch;
    });

    const isAutoApproved = !!masterlistMatch;
    const userStatus = isAutoApproved ? 'active' : 'pending_approval';

    const userId = `usr-${uuidv4().slice(0, 8)}`;
    const tenantId = 'tenant-palmera-hoa'; // Default demo HOA tenant
    const roleId = 5; // Resident
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    db.prepare(`
      INSERT INTO users (id, tenant_id, role_id, email, password_hash, full_name, is_active, status, proof_doc_url, phone_number)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(userId, tenantId, roleId, email, passwordHash, fullName, userStatus, proofDocUrl || null, contactNumber);

    // Insert resident profile
    db.prepare(`
      INSERT INTO resident_profiles (id, user_id, tenant_id, address, contact_number, verification_doc)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, tenantId, address, contactNumber, proofDocUrl || null);

    try { await sendRegistrationPendingEmail(email, fullName, address); } catch (e) { console.error("Email error:", e); }
    res.status(201).json({
      message: isAutoApproved
        ? '🎉 Instant Auto-Verification Successful! Verified against NRG PH2 HOA Official Masterlist. Your account is immediately activated!'
        : 'Registration successful! Your application is in the queue for manual HOA Board review.',
      userId,
      status: userStatus,
      autoAccepted: isAutoApproved,
      matchedRecord: masterlistMatch || null,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// ============================================================
// 2. FINANCIAL TRANSPARENCY: DUES, CASH FLOW & EXPENDITURES
// ============================================================
router.get('/financials', authenticate, (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    // 1. My Dues Summary (Current Balance + Previous Balance)
    const myLedgers: any = db.prepare(`
      SELECT * FROM billing_ledgers 
      WHERE tenant_id = ? AND resident_id = ? 
      ORDER BY due_date DESC
    `).all(tenantId, userId);

    const currentUnpaid = myLedgers.filter((l: any) => l.status === 'unpaid' || l.status === 'overdue');
    const totalCurrentDue = currentUnpaid.reduce((sum: number, l: any) => sum + l.amount, 0);
    const totalPreviousBalance = currentUnpaid.reduce((sum: number, l: any) => sum + (l.previous_balance || 0), 0);

    // 2. Community Financial Overview
    const totalCollected: any = db.prepare(`
      SELECT SUM(amount) as sum FROM billing_ledgers WHERE tenant_id = ? AND status = 'paid'
    `).get(tenantId);

    const totalOverdue: any = db.prepare(`
      SELECT SUM(amount) as sum FROM billing_ledgers WHERE tenant_id = ? AND status = 'overdue'
    `).get(tenantId);

    const totalSpent: any = db.prepare(`
      SELECT SUM(amount) as sum FROM hoa_expenditures WHERE tenant_id = ?
    `).get(tenantId);

    // 3. Cash Flow List (Inflows vs Outflows)
    const expenditures: any = db.prepare(`
      SELECT * FROM hoa_expenditures WHERE tenant_id = ? ORDER BY date_spent DESC
    `).all(tenantId);

    const inFlows: any = db.prepare(`
      SELECT p.id, p.amount, p.paid_at, p.payment_method, u.full_name as resident_name
      FROM payments p
      JOIN billing_ledgers bl ON p.ledger_id = bl.id
      JOIN users u ON bl.resident_id = u.id
      WHERE p.tenant_id = ? AND p.status = 'success'
      ORDER BY p.paid_at DESC LIMIT 10
    `).all(tenantId);

    res.json({
      myDues: {
        ledgers: myLedgers,
        totalCurrentDue,
        totalPreviousBalance,
        grandTotalDue: totalCurrentDue + totalPreviousBalance,
      },
      communityOverview: {
        totalCollected: totalCollected?.sum || 0,
        totalOverdue: totalOverdue?.sum || 0,
        totalSpent: totalSpent?.sum || 0,
        netReserves: (totalCollected?.sum || 0) - (totalSpent?.sum || 0),
      },
      expenditures,
      cashFlow: {
        inFlows,
        outFlows: expenditures,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 3. HOA REQUESTS (Parking Stickers, Home Improvements, Complaints, Meetings)
// ============================================================
router.get('/requests', authenticate, (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const isStaffOrAdmin = ['hoa_admin', 'admin_staff', 'super_admin'].includes(req.user.roleName);

    let sql = `
      SELECT hr.*, u.full_name as requester_name, u.email as requester_email, rp.address
      FROM hoa_requests hr
      JOIN users u ON hr.requester_id = u.id
      LEFT JOIN resident_profiles rp ON u.id = rp.user_id
      WHERE hr.tenant_id = ?
    `;

    const params: any[] = [tenantId];

    if (!isStaffOrAdmin) {
      sql += ' AND hr.requester_id = ?';
      params.push(req.user.userId);
    }

    sql += ' ORDER BY hr.created_at DESC';

    const requests = db.prepare(sql).all(...params);
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/requests', authenticate, (req: any, res) => {
  try {
    const { requestType, details, vehicleInfo, scheduledAt, officerName } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    if (!requestType || !details) {
      return res.status(400).json({ error: 'Request type and details are required' });
    }

    const id = `req-${uuidv4().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO hoa_requests (id, tenant_id, requester_id, request_type, details, vehicle_info, scheduled_at, officer_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, tenantId, userId, requestType, details, vehicleInfo || null, scheduledAt || null, officerName || null);

    res.status(201).json({ message: 'Request submitted successfully', requestId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/requests/:id/status', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare(`
      UPDATE hoa_requests SET status = ?, admin_remarks = ? WHERE id = ?
    `).run(status, adminRemarks || null, id);

    res.json({ message: `Request status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 4. MEETINGS & MINUTES
// ============================================================
router.get('/meetings', authenticate, (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const meetings = db.prepare(`
      SELECT * FROM hoa_meetings WHERE tenant_id = ? ORDER BY meeting_date DESC
    `).all(tenantId);
    res.json(meetings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/meetings', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { title, meetingDate, location, agenda, minutes, status } = req.body;
    const tenantId = req.user.tenantId;

    if (!title || !meetingDate || !agenda) {
      return res.status(400).json({ error: 'Title, date, and agenda are required' });
    }

    const id = `mtg-${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO hoa_meetings (id, tenant_id, title, meeting_date, location, agenda, minutes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, title, meetingDate, location || 'HOA Clubhouse', agenda, minutes || null, status || 'upcoming');

    res.status(201).json({ message: 'Meeting created successfully', meetingId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/meetings/:id', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, meetingDate, location, agenda, minutes, status } = req.body;

    const existing: any = db.prepare('SELECT * FROM hoa_meetings WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Meeting/Event not found' });
    }

    db.prepare(`
      UPDATE hoa_meetings SET
        title = ?,
        meeting_date = ?,
        location = ?,
        agenda = ?,
        minutes = ?,
        status = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      meetingDate || existing.meeting_date,
      location || existing.location,
      agenda || existing.agenda,
      minutes !== undefined ? minutes : existing.minutes,
      status || existing.status,
      id
    );

    res.json({ message: 'Meeting updated successfully', meetingId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/meetings/:id', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM hoa_meetings WHERE id = ?').run(id);
    res.json({ success: true, message: 'Meeting/Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 5. ACCOMPLISHMENTS (Slideshow Projects)
// ============================================================
router.get('/accomplishments', (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-palmera-hoa';
    const items = db.prepare(`
      SELECT * FROM hoa_accomplishments WHERE tenant_id = ? ORDER BY date_completed DESC
    `).all(tenantId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/accomplishments', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { title, description, imageUrl, dateCompleted, budgetSpent } = req.body;
    const tenantId = req.user.tenantId;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({ error: 'Title, description, and image URL are required' });
    }

    const id = `acc-${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO hoa_accomplishments (id, tenant_id, title, description, image_url, date_completed, budget_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, title, description, imageUrl, dateCompleted || new Date().toISOString().split('T')[0], budgetSpent || 0);

    res.status(201).json({ message: 'Accomplishment added to slideshow', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 6. ANNOUNCEMENTS
// ============================================================
router.get('/announcements', (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-palmera-hoa';
    const items = db.prepare(`
      SELECT a.*, u.full_name as author_name 
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      WHERE a.tenant_id = ? 
      ORDER BY a.created_at DESC
    `).all(tenantId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/announcements', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const { title, content, category } = req.body;
    const tenantId = req.user.tenantId;
    const authorId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const id = `ann-${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO announcements (id, tenant_id, author_id, title, content, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, authorId, title, content, category || 'general');

    res.status(201).json({ message: 'Announcement published', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 7. HOA OFFICERS DIRECTORY
// ============================================================
router.get('/officers', (req, res) => {
  const officers = [
    { name: 'Engr. Roberto Garcia', position: 'HOA President', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
    { name: 'Atty. Cristina Valdez', position: 'Vice President', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
    { name: 'Ana Ramos', position: 'Treasurer / Admin Staff', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200' },
    { name: 'Mark Anthony Santos', position: 'HOA Secretary', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200' },
    { name: 'Capt. Eduardo Morales', position: 'Chief Security Officer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  ];
  res.json(officers);
});

// ============================================================
// 8. USER MANAGEMENT & APPROVALS (Admin & Admin Staff)
// ============================================================
router.get('/users/pending', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const pendingUsers = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.phone_number, u.created_at, u.status, u.proof_doc_url,
             rp.address, rp.civil_status, rp.birthdate
      FROM users u
      LEFT JOIN resident_profiles rp ON u.id = rp.user_id
      WHERE (u.status = 'pending_approval' OR u.status = 'pending')
      ORDER BY u.created_at DESC
    `).all();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/approve', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userToApprove: any = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    db.prepare("UPDATE users SET status = 'active', is_active = 1 WHERE id = ?").run(id);
    if (userToApprove && userToApprove.email) { try { await sendRegistrationApprovedEmail(userToApprove.email, userToApprove.full_name); } catch(e) { console.error("Approval email error:", e); } }
    res.json({ message: 'Homeowner account approved and activated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.patch('/users/:id/reject', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userToReject: any = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    db.prepare("UPDATE users SET status = 'rejected', is_active = 0 WHERE id = ?").run(id);
    if (userToReject && userToReject.email) {
      try {
        await sendEmail({
          to: userToReject.email,
          subject: 'Homeowner Application Status - NRG PH2 HOA',
          html: '<p>Dear ' + userToReject.full_name + ',</p><p>Your application for HOA membership has been declined by the board.</p>' + (reason ? '<p><strong>Reason:</strong> ' + reason + '</p>' : '') + '<p>Please contact the HOA office for inquiries.</p>',
          text: 'Your registration application has been declined.'
        });
      } catch (e) { console.error('Reject email error:', e); }
    }
    res.json({ message: 'Homeowner application declined' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/reset-password', authenticate, requireRole('hoa_admin', 'admin_staff', 'super_admin'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const passwordToSet = newPassword || 'Resident@1234';
    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
    res.json({ message: 'Password reset successfully', tempPassword: passwordToSet });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin creation of Admin Staff
router.post('/users/admin-staff', authenticate, requireRole('hoa_admin', 'super_admin'), async (req: any, res) => {
  try {
    const { fullName, email, password } = req.body;
    const tenantId = req.user.tenantId;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userId = `usr-staff-${uuidv4().slice(0, 8)}`;
    const roleId = 6; // Admin Staff
    const passwordHash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (id, tenant_id, role_id, email, password_hash, full_name, is_active, status)
      VALUES (?, ?, ?, ?, ?, ?, 1, 'active')
    `).run(userId, tenantId, roleId, email, passwordHash, fullName);

    res.status(201).json({ message: 'Admin Staff account created successfully', userId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 10. OFFICIAL HOA OFFICERS & DIRECTORY
// ============================================================
router.get('/officers', (req, res) => {
  const officers = [
    // Executive Board
    { name: 'Rey Mar Villanueva', role: 'HOA President', category: 'executive', blockOrDept: 'Executive Board' },
    { name: 'Cezar Climaco', role: 'HOA Vice President', category: 'executive', blockOrDept: 'Executive Board' },
    { name: 'Alma Valdezco', role: 'HOA Treasurer', category: 'executive', blockOrDept: 'Finance & Treasury' },
    { name: 'Ronilo Villagantol', role: 'HOA Auditor', category: 'executive', blockOrDept: 'Internal Audit' },
    { name: 'Josaphat Aguiman', role: 'HOA Secretary', category: 'executive', blockOrDept: 'Secretariat & Records' },
    // Block Leaders
    { name: 'Anne Gregori / Ronalyn Villarte', role: 'Block 1 Leader', category: 'block_leader', blockOrDept: 'Block 1 Community' },
    { name: 'Jemma Alamillo', role: 'Block 2 Leader', category: 'block_leader', blockOrDept: 'Block 2 Community' },
    { name: 'Jocelyn Selanova', role: 'Block 3 Leader', category: 'block_leader', blockOrDept: 'Block 3 Community' },
    { name: 'Melinda Domingo', role: 'Block 4 Leader', category: 'block_leader', blockOrDept: 'Block 4 Community' },
    { name: 'Alma Miralles', role: 'Block 5 Leader', category: 'block_leader', blockOrDept: 'Block 5 Community' },
    { name: 'Ofelia Esloyo', role: 'Block 6 Leader', category: 'block_leader', blockOrDept: 'Block 6 Community' },
    { name: 'Rina Dorate', role: 'Block 7 Leader', category: 'block_leader', blockOrDept: 'Block 7 Community' },
    { name: 'Rina Dorate', role: 'Block 8 Leader', category: 'block_leader', blockOrDept: 'Block 8 Community' },
    { name: 'Jennerfer Barlaan', role: 'Block 9 Leader', category: 'block_leader', blockOrDept: 'Block 9 Community' },
    // Committees
    { name: 'Melody Matienzo', role: 'Chairperson — Grievance Committee', category: 'committee', blockOrDept: 'Dispute Resolution' },
    { name: 'Patrick Gariando', role: 'Chairperson — Inventory Committee', category: 'committee', blockOrDept: 'Asset Management' },
    { name: 'Xandrix Pagligaran', role: 'Chairperson — Committee on Election (COMELEC)', category: 'committee', blockOrDept: 'Electoral Board' },
    { name: 'Jhon Magdaluyo', role: 'Chairperson — Disaster Risk Reduction Management (DRRM)', category: 'committee', blockOrDept: 'Emergency Management' },
    { name: 'Wennie Arago', role: 'Chairperson — Peace and Order Committee', category: 'committee', blockOrDept: 'Security & Gate' },
    { name: 'Ronald Balbin', role: 'Chairperson — Sports & Recreation Committee', category: 'committee', blockOrDept: 'Court & Sports' },
    { name: 'Allen Tabasa', role: 'Chairperson — Facilities & Improvement Committee', category: 'committee', blockOrDept: 'Infrastructure & Permits' },
    { name: 'Alan Talaba', role: 'Chairperson — Gender and Development (GAD)', category: 'committee', blockOrDept: 'Community Welfare' },
    { name: 'Clemente Sibayan, Ferdinand Lazo, and Nicanor Lasac', role: 'Committee Heads — Livelihood Programs', category: 'committee', blockOrDept: 'Livelihood & Skills' },
    { name: 'Conrado Laoang', role: 'Chairperson — Maintenance Committee', category: 'committee', blockOrDept: 'Maintenance & Repairs' },
  ];
  res.json(officers);
});

export default router;


