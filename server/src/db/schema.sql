-- ============================================================
-- Integrated HOA & Barangay Portal - Database Schema
-- Engine: SQLite 3 via node:sqlite (DatabaseSync)
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. TENANTS (Multi-tenant isolation root)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('barangay', 'hoa')),
  address     TEXT,
  contact     TEXT,
  logo_url    TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT UNIQUE NOT NULL
);

-- ============================================================
-- 3. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id             INTEGER NOT NULL REFERENCES roles(id),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  is_active           INTEGER NOT NULL DEFAULT 1,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_approval', 'active', 'disabled')),
  proof_doc_url       TEXT,
  phone_number        TEXT,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================================
-- 4. RESIDENT PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS resident_profiles (
  id               TEXT PRIMARY KEY,
  user_id          TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),
  address          TEXT NOT NULL,
  contact_number   TEXT,
  civil_status     TEXT DEFAULT 'single',
  birthdate        DATE,
  indigency_status INTEGER NOT NULL DEFAULT 0,
  photo_url        TEXT,
  verification_doc TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resident_profiles_tenant ON resident_profiles(tenant_id);

-- ============================================================
-- 5. DOCUMENT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_requests (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id),
  requester_id  TEXT NOT NULL REFERENCES users(id),
  doc_type      TEXT NOT NULL CHECK (doc_type IN ('barangay_clearance', 'cert_indigency', 'cert_residency')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'issued', 'rejected')),
  purpose       TEXT NOT NULL,
  fee           REAL NOT NULL DEFAULT 0,
  qr_token      TEXT UNIQUE,
  issued_at     DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_tenant    ON document_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_requester ON document_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_documents_status    ON document_requests(status);

-- ============================================================
-- 6. BILLING LEDGERS
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_ledgers (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  resident_id     TEXT NOT NULL REFERENCES users(id),
  billing_period  TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          REAL NOT NULL,
  previous_balance REAL NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
  due_date        DATE NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_tenant   ON billing_ledgers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_resident ON billing_ledgers(resident_id);
CREATE INDEX IF NOT EXISTS idx_billing_status   ON billing_ledgers(status);

-- ============================================================
-- 7. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id             TEXT PRIMARY KEY,
  ledger_id      TEXT NOT NULL REFERENCES billing_ledgers(id),
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  amount         REAL NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'paymaya', 'card', 'cash', 'bank_transfer')),
  reference_no   TEXT,
  proof_url      TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paid_at        DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_ledger ON payments(ledger_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);

-- ============================================================
-- 8. FACILITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS facilities (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  name        TEXT NOT NULL,
  capacity    INTEGER NOT NULL DEFAULT 50,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facilities_tenant ON facilities(tenant_id);

-- ============================================================
-- 9. RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id           TEXT PRIMARY KEY,
  facility_id  TEXT NOT NULL REFERENCES facilities(id),
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  reserved_by  TEXT NOT NULL REFERENCES users(id),
  title        TEXT NOT NULL,
  start_time   DATETIME NOT NULL,
  end_time     DATETIME NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_facility ON reservations(facility_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant   ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_time     ON reservations(start_time, end_time);

-- ============================================================
-- 10. VISITOR LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  host_id         TEXT NOT NULL REFERENCES users(id),
  visitor_name    TEXT NOT NULL,
  visitor_id_type TEXT DEFAULT 'national_id',
  visitor_id_no   TEXT,
  vehicle_plate   TEXT,
  purpose         TEXT NOT NULL,
  time_in         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  time_out        DATETIME,
  gate_pass_qr    TEXT UNIQUE,
  logged_by       TEXT NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_tenant ON visitor_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_host   ON visitor_logs(host_id);

-- ============================================================
-- 11. EMERGENCY ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id),
  triggered_by  TEXT NOT NULL REFERENCES users(id),
  alert_type    TEXT NOT NULL CHECK (alert_type IN ('panic', 'fire', 'medical', 'security')),
  message       TEXT NOT NULL,
  location      TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  broadcast_to  TEXT NOT NULL DEFAULT 'all' CHECK (broadcast_to IN ('hoa', 'barangay', 'all')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at   DATETIME
);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON emergency_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON emergency_alerts(status);

-- ============================================================
-- 12. HOA EXPENDITURES (Financial Transparency)
-- ============================================================
CREATE TABLE IF NOT EXISTS hoa_expenditures (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  category     TEXT NOT NULL CHECK (category IN ('security', 'maintenance', 'utilities', 'landscaping', 'repairs', 'events', 'admin')),
  title        TEXT NOT NULL,
  amount       REAL NOT NULL,
  date_spent   DATE NOT NULL,
  description  TEXT,
  receipt_url  TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenditures_tenant ON hoa_expenditures(tenant_id);

-- ============================================================
-- 13. HOA REQUESTS (Parking Stickers, Home Improvements, Complaints, Meetings)
-- ============================================================
CREATE TABLE IF NOT EXISTS hoa_requests (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id),
  requester_id  TEXT NOT NULL REFERENCES users(id),
  request_type  TEXT NOT NULL CHECK (request_type IN ('parking_sticker', 'home_improvement', 'concern', 'officer_meeting')),
  details       TEXT NOT NULL,
  vehicle_info  TEXT,
  scheduled_at  DATETIME,
  officer_name  TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_remarks TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hoa_requests_tenant ON hoa_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hoa_requests_user   ON hoa_requests(requester_id);

-- ============================================================
-- 14. HOA MEETINGS & MINUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS hoa_meetings (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  title        TEXT NOT NULL,
  meeting_date DATETIME NOT NULL,
  location     TEXT DEFAULT 'HOA Clubhouse',
  agenda       TEXT NOT NULL,
  minutes      TEXT,
  status       TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetings_tenant ON hoa_meetings(tenant_id);

-- ============================================================
-- 15. HOA ACCOMPLISHMENTS (Projects Slideshow)
-- ============================================================
CREATE TABLE IF NOT EXISTS hoa_accomplishments (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  image_url      TEXT NOT NULL,
  date_completed DATE NOT NULL,
  budget_spent   REAL DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accomplishments_tenant ON hoa_accomplishments(tenant_id);

-- ============================================================
-- 16. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT NOT NULL REFERENCES tenants(id),
  author_id  TEXT NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'financial', 'event')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON announcements(tenant_id);

-- ============================================================
-- 17. HOUSEHOLD MEMBERS (Resident Dependents & Household Module)
-- ============================================================
CREATE TABLE IF NOT EXISTS household_members (
  id                   TEXT PRIMARY KEY,
  tenant_id            TEXT NOT NULL REFERENCES tenants(id),
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_household_tenant ON household_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_household_user   ON household_members(user_id);
