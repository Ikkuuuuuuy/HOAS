# 📘 HOA & Barangay Portal — VS Code & Client Project Guide

Welcome to the **Northridge Grove Phase 2 HOA & Barangay 174 Smart Community Portal** codebase! This guide is designed for clients, developers, and project evaluators to easily navigate, run, and understand the project inside Visual Studio Code (VS Code).

---

## ⚡ 1. How to Run the App (Two Easy Ways)

### Option A: 1-Click Automatic Launcher (Recommended)
You don't even need to open a terminal or type any commands:
1. Open the project folder in Windows File Explorer.
2. Double-click **`START_PORTAL.bat`** (or `start-app.bat`).
3. The script automatically:
   - Verifies your Node.js installation.
   - Installs any missing dependencies.
   - Launches both the **Backend API (port 3001)** and **Frontend Portal (port 5173)**.
   - Automatically opens your web browser to **`http://localhost:5173`**.

---

### Option B: Running from VS Code Terminal
1. Open the project folder in **VS Code** (`File` > `Open Folder...`).
2. Open the built-in terminal by pressing <kbd>Ctrl</kbd> + <kbd>`</kbd> (or `Terminal` > `New Terminal`).
3. Run the following command:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

*(To stop the servers, press <kbd>Ctrl</kbd> + <kbd>C</kbd> in the terminal window).*

---

## 🧭 2. Navigating the Codebase Inside VS Code

The project is cleanly split into two core folders: **`client/`** (Frontend React UI) and **`server/`** (Backend Node/Express API).

```
hoa-barangay-portal/
├── client/                          # 🎨 Frontend React + TypeScript App
│   ├── src/
│   │   ├── components/              # Reusable UI widgets & Layout
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx       # 🔔 Top navbar with real-time multi-role notification bell
│   │   │   │   ├── Sidebar.tsx      # 📑 Left sidebar with glowing Operations Hub & pending badges
│   │   │   │   └── PageContainer.tsx# Master wrapper with theme & responsive layout
│   │   │   ├── common/              # Modals, sortable table headers, photo zoom dialogs
│   │   │   └── ui/                  # Toast alerts, emergency notification banners
│   │   ├── pages/                   # 🖥️ All System Screens & Views
│   │   │   ├── Login.tsx            # Login screen with 1-Click Demo Role quick login buttons
│   │   │   ├── Register.tsx         # Resident application form with clean blank upload dropzones
│   │   │   ├── PublicLandingPage.tsx# Public community home & transparency portal
│   │   │   ├── admin/
│   │   │   │   ├── HOAAdminManagement.tsx # 👥 Staff Hub & Approvals (inspect ID & Title, approve/decline)
│   │   │   │   ├── PaymentApprovals.tsx   # 💳 Dues Payment Submissions Queue (full-width table)
│   │   │   │   ├── AllUsersManagement.tsx # System-wide user list & role assignment
│   │   │   │   └── HOAMasterlistManagement.tsx # Subdivision lot directory & resident sync
│   │   │   ├── dashboards/          # 📊 Role-Tailored Dashboards
│   │   │   │   ├── SuperAdminDashboard.tsx # Platform master multi-tenant jurisdiction
│   │   │   │   ├── HOAAdminDashboard.tsx   # HOA Board & treasury executive analytics
│   │   │   │   ├── BarangayDashboard.tsx   # Barangay 174 captain & lupon oversight
│   │   │   │   ├── SecurityDashboard.tsx   # Gate entry & patrol dispatch command
│   │   │   │   └── ResidentDashboard.tsx   # Personalized homeowner portal
│   │   │   ├── visitors/            # 🛂 Visitor logbook & RFID gate passes
│   │   │   ├── facilities/          # 📅 Clubhouse & court reservation calendar
│   │   │   ├── billing/             # 🧾 Association dues ledgers & official receipts
│   │   │   └── documents/           # 📄 Barangay clearances & service requests
│   │   ├── context/                 # 🧠 Global State Managers
│   │   │   ├── AuthContext.tsx      # User session, login, role RBAC, localStorage sync
│   │   │   ├── ThemeContext.tsx     # Light / Dark mode toggle & persistence
│   │   │   └── AlertContext.tsx     # Real-time emergency SSE broadcast stream
│   │   └── styles/
│   │       └── index.css            # Unified CSS design system & responsive styling
│   └── package.json
│
├── server/                          # ⚙️ Backend Node.js / Express API
│   ├── src/
│   │   ├── index.ts                 # Main server entry (Port 3001)
│   │   ├── routes/                  # Express REST API route handlers
│   │   │   ├── auth.ts              # Login, register, JWT session tokens
│   │   │   ├── users.ts             # User profiles, pending applicant status
│   │   │   ├── billing.ts           # Dues payment submissions & OR issuance
│   │   │   └── documents.ts         # Document clearances & service tickets
│   │   └── db/                      # SQLite database schema, connections & seeds
│   └── package.json
│
├── START_PORTAL.bat                 # 🚀 1-Click Startup Launcher (Automated)
├── start-app.bat                    # Alternative batch launcher
├── CLIENT_SETUP_GUIDE.md            # Non-technical user guide
└── package.json                     # Root orchestrator (concurrent dev runner)
```

---

## 👥 3. Testing the 6 System Roles (Instant 1-Click Login)

On the **Login page (`http://localhost:5173/login`)**, scroll to the bottom to find colored **1-Click Demo Login** buttons. Click any button to instantly log in as that persona:

| Role Name | Demo Button | Default Email | Key Features to Test |
| :--- | :--- | :--- | :--- |
| **Super Admin** | 👑 Super Admin | `superadmin@portal.gov.ph` | Multi-tenant HOA oversight, platform-wide clearance, system user management. |
| **HOA Admin** | 🏢 Main Admin | `treasurer@palmera-hoa.com` | Board applicant approvals, GCash payment queue, ledger arrears, court booking. |
| **Admin Staff** | 💼 Staff Hub | `staff@northridge-hoa.com` | ID and deed inspections in Staff Hub, cashier payment proof verification. |
| **Barangay Official** | 🏛️ Brgy Captain | `captain@brgy174.gov.ph` | Barangay clearances, Indigency requests, Lupon mediation docket. |
| **Security Guard** | 🛡️ Security Guard | `guard@northridge-gate.com` | Gate 1 RFID entry, visitor inside logs, courier delivery passes. |
| **Homeowner / Resident** | 🏠 Homeowner | `resident@palmera.com` | Personal balance check, GCash dues submission, personal reservation requests. |

> **Password for all demo accounts:** `Password123!` (or simply click the colored buttons on the login screen).

---

## 🔔 4. Notification System Highlights

- **Dynamic Role Streams**: Every role receives its own tailored notification stream in the top navigation bell.
- **Vanishes on Open**: When you click the notification bell to view notifications, the red counter badge automatically clears and vanishes.
- **Auto-Read on Page**: When you navigate to the page related to a notification (e.g., `/payment-approvals` or `/hoa-manage`), that notification is automatically marked as viewed/read.
- **1-Click "✓ Mark all read"**: Click the button inside the notification dropdown to instantly clear all unread items.
- **Individual Checkmarks**: Hover over any unread notification item to mark it read individually without leaving your current page.

---

## ⌨️ 5. Helpful VS Code Shortcuts

- **Open Any File Quickly**: Press <kbd>Ctrl</kbd> + <kbd>P</kbd>, then type the file name (e.g., `PaymentApprovals` or `Navbar`).
- **Search Across the Entire Project**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>.
- **Toggle Terminal**: Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (backtick).
- **Format Document**: Press <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>F</kbd>.

---

## 🛠️ 6. Troubleshooting & Support

- **Port 5173 or 3001 already in use?**
  Open Task Manager or restart the terminal window, then run `START_PORTAL.bat` again.
- **Want to test registration from scratch?**
  1. Go to `http://localhost:5173/register`. Notice all dropzones start completely blank.
  2. Register a new homeowner account.
  3. Log in as **HOA Admin** or **Staff**.
  4. Notice the notification bell rings and the amber **Pending** badge lights up on the sidebar under **OPERATIONS > Staff Hub & Approvals**.
  5. Go to `/hoa-manage`, inspect the uploaded IDs, and click **Approve & Activate**.
  6. The resident can now immediately log in with their registered credentials!
