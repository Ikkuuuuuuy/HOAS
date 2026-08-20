import { Router } from 'express';
import db from '../config/database';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Ensure household_members table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS household_members (
    id                   TEXT PRIMARY KEY,
    tenant_id            TEXT NOT NULL,
    user_id              TEXT NOT NULL,
    full_name            TEXT NOT NULL,
    relationship         TEXT NOT NULL,
    gender               TEXT,
    birthdate            DATE,
    age                  INTEGER,
    contact_number       TEXT,
    email                TEXT,
    occupation           TEXT,
    is_emergency_contact INTEGER DEFAULT 0,
    has_rfid_access      INTEGER DEFAULT 0,
    notes                TEXT,
    photo_url            TEXT,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default members if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM household_members');
const memberCount: any = countStmt.get();
if (memberCount && memberCount.count === 0) {
  const seedMembers = [
    {
      id: 'hm-001',
      tenant_id: 'tenant-palmera-hoa',
      user_id: 'usr-homeowner-01',
      full_name: 'Juan Dela Cruz',
      relationship: 'Head of Household (Owner)',
      gender: 'Male',
      birthdate: '1984-04-12',
      age: 42,
      contact_number: '0917-890-1234',
      email: 'juan@palmerahoa.ph',
      occupation: 'Civil Engineer',
      is_emergency_contact: 1,
      has_rfid_access: 1,
      notes: 'Primary registered owner under TCT #12345-CSJDM.',
    },
    {
      id: 'hm-002',
      tenant_id: 'tenant-palmera-hoa',
      user_id: 'usr-homeowner-01',
      full_name: 'Maria Dela Cruz',
      relationship: 'Spouse',
      gender: 'Female',
      birthdate: '1987-08-23',
      age: 39,
      contact_number: '0918-765-4321',
      email: 'maria.dc@gmail.com',
      occupation: 'Accountant',
      is_emergency_contact: 1,
      has_rfid_access: 1,
      notes: 'Secondary emergency contact and co-signatory.',
    },
    {
      id: 'hm-003',
      tenant_id: 'tenant-palmera-hoa',
      user_id: 'usr-homeowner-01',
      full_name: 'Carlo Dela Cruz',
      relationship: 'Dependent (Child)',
      gender: 'Male',
      birthdate: '2012-02-15',
      age: 14,
      contact_number: '0920-111-2233',
      email: 'carlo.student@school.edu.ph',
      occupation: 'Student - High School',
      is_emergency_contact: 0,
      has_rfid_access: 0,
      notes: 'Junior basketball team member.',
    },
    {
      id: 'hm-004',
      tenant_id: 'tenant-palmera-hoa',
      user_id: 'usr-homeowner-01',
      full_name: 'Elena Santos Dela Cruz',
      relationship: 'Parent (Senior Citizen)',
      gender: 'Female',
      birthdate: '1955-11-04',
      age: 70,
      contact_number: '0915-444-5566',
      email: 'elena.santos@gmail.com',
      occupation: 'Retired Teacher',
      is_emergency_contact: 1,
      has_rfid_access: 0,
      notes: 'Senior citizen discount registered with Barangay Tungko.',
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO household_members (
      id, tenant_id, user_id, full_name, relationship, gender, birthdate, age,
      contact_number, email, occupation, is_emergency_contact, has_rfid_access, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of seedMembers) {
    insertStmt.run(
      m.id, m.tenant_id, m.user_id, m.full_name, m.relationship, m.gender, m.birthdate, m.age,
      m.contact_number, m.email, m.occupation, m.is_emergency_contact, m.has_rfid_access, m.notes
    );
  }
}

// ── GET ALL HOUSEHOLD MEMBERS ──────────────────────────────
router.get('/', authenticate, (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = ['super_admin', 'hoa_admin', 'admin_staff'].includes(user.roleName);

    let rows;
    if (isAdmin && req.query.all === 'true') {
      rows = db.prepare(`
        SELECT hm.*, u.full_name as owner_name, u.email as owner_email
        FROM household_members hm
        LEFT JOIN users u ON hm.user_id = u.id
        WHERE hm.tenant_id = ?
        ORDER BY hm.created_at DESC
      `).all(user.tenantId);
    } else {
      // For resident: return their household members, or default demo household if matching
      rows = db.prepare(`
        SELECT * FROM household_members
        WHERE tenant_id = ? AND (user_id = ? OR user_id = 'usr-homeowner-01')
        ORDER BY created_at ASC
      `).all(user.tenantId, user.userId);
    }

    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching household members:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── ADD NEW HOUSEHOLD MEMBER ───────────────────────────────
router.post('/', authenticate, (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      fullName,
      relationship,
      gender,
      birthdate,
      age,
      contactNumber,
      email,
      occupation,
      isEmergencyContact,
      hasRfidAccess,
      notes,
    } = req.body;

    if (!fullName || !relationship) {
      return res.status(400).json({ error: 'Full name and relationship are required' });
    }

    const id = `hm-${uuidv4().slice(0, 8)}`;
    const calculatedAge = age || (birthdate ? Math.floor((new Date().getTime() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null);

    db.prepare(`
      INSERT INTO household_members (
        id, tenant_id, user_id, full_name, relationship, gender, birthdate, age,
        contact_number, email, occupation, is_emergency_contact, has_rfid_access, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.tenantId,
      user.userId,
      fullName,
      relationship,
      gender || 'Other',
      birthdate || null,
      calculatedAge,
      contactNumber || '',
      email || '',
      occupation || '',
      isEmergencyContact ? 1 : 0,
      hasRfidAccess ? 1 : 0,
      notes || ''
    );

    const created = db.prepare('SELECT * FROM household_members WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error creating household member:', err);
    res.status(500).json({ error: err.message || 'Failed to add household member' });
  }
});

// ── UPDATE HOUSEHOLD MEMBER ────────────────────────────────
router.put('/:id', authenticate, (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      fullName,
      relationship,
      gender,
      birthdate,
      age,
      contactNumber,
      email,
      occupation,
      isEmergencyContact,
      hasRfidAccess,
      notes,
    } = req.body;

    const existing: any = db.prepare('SELECT * FROM household_members WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Household member not found' });
    }

    const calculatedAge = age || (birthdate ? Math.floor((new Date().getTime() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : existing.age);

    db.prepare(`
      UPDATE household_members SET
        full_name = ?,
        relationship = ?,
        gender = ?,
        birthdate = ?,
        age = ?,
        contact_number = ?,
        email = ?,
        occupation = ?,
        is_emergency_contact = ?,
        has_rfid_access = ?,
        notes = ?
      WHERE id = ?
    `).run(
      fullName || existing.full_name,
      relationship || existing.relationship,
      gender || existing.gender,
      birthdate || existing.birthdate,
      calculatedAge,
      contactNumber !== undefined ? contactNumber : existing.contact_number,
      email !== undefined ? email : existing.email,
      occupation !== undefined ? occupation : existing.occupation,
      isEmergencyContact !== undefined ? (isEmergencyContact ? 1 : 0) : existing.is_emergency_contact,
      hasRfidAccess !== undefined ? (hasRfidAccess ? 1 : 0) : existing.has_rfid_access,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM household_members WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    console.error('Error updating household member:', err);
    res.status(500).json({ error: err.message || 'Failed to update household member' });
  }
});

// ── DELETE HOUSEHOLD MEMBER ────────────────────────────────
router.delete('/:id', authenticate, (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM household_members WHERE id = ?').run(id);
    res.json({ success: true, message: 'Household member removed successfully' });
  } catch (err: any) {
    console.error('Error deleting household member:', err);
    res.status(500).json({ error: err.message || 'Failed to delete household member' });
  }
});

export default router;
