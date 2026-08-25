import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

// Clean Minimalist Stroke Icons (Enterprise SVG)
const Icons = {
  Overview: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Masterlist: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  HomeownerPortal: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Officers: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Household: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Calendar: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Documents: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  AdminHub: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Tenants: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" /><path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" /><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  ),
  Users: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Billing: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Facilities: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Visitors: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Reports: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Alerts: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  External: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
};

interface NavSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: React.ComponentType;
    badgeKey?: 'alerts';
  }[];
}

const SUPER_ADMIN_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: Icons.Overview },
      { path: '/masterlist', label: 'HOA Masterlist', icon: Icons.Masterlist },
    ]
  },
  {
    title: 'Community',
    items: [
      { path: '/homeowner-portal', label: 'Homeowner View', icon: Icons.HomeownerPortal },
      { path: '/officers', label: 'HOA Officers', icon: Icons.Officers },
      { path: '/household', label: 'Household Members', icon: Icons.Household },
      { path: '/events', label: 'Events Calendar', icon: Icons.Calendar },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/documents', label: 'Service Requests', icon: Icons.Documents },
      { path: '/hoa-manage', label: 'Staff Hub & Approvals', icon: Icons.AdminHub },
      { path: '/facilities', label: 'Facility Reservation', icon: Icons.Facilities },
      { path: '/visitors', label: 'Visitor Logbook', icon: Icons.Visitors },
    ]
  },
  {
    title: 'Finance & Administration',
    items: [
      { path: '/billing', label: 'Billing & Ledger', icon: Icons.Billing },
      { path: '/financial-reports', label: 'Financial Reports', icon: Icons.Reports },
      { path: '/tenants', label: 'Tenants Directory', icon: Icons.Tenants },
      { path: '/users', label: 'All User Accounts', icon: Icons.Users },
      { path: '/alerts', label: 'Security & Alerts', icon: Icons.Alerts, badgeKey: 'alerts' },
    ]
  }
];

const HOA_ADMIN_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: Icons.Overview },
      { path: '/masterlist', label: 'HOA Masterlist', icon: Icons.Masterlist },
    ]
  },
  {
    title: 'Community',
    items: [
      { path: '/homeowner-portal', label: 'Homeowner View', icon: Icons.HomeownerPortal },
      { path: '/officers', label: 'HOA Officers', icon: Icons.Officers },
      { path: '/household', label: 'Household Members', icon: Icons.Household },
      { path: '/events', label: 'Events Calendar', icon: Icons.Calendar },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/documents', label: 'Service Requests', icon: Icons.Documents },
      { path: '/hoa-manage', label: 'Approvals & Admin', icon: Icons.AdminHub },
      { path: '/facilities', label: 'Facility Reservation', icon: Icons.Facilities },
      { path: '/visitors', label: 'Visitor Logbook', icon: Icons.Visitors },
    ]
  },
  {
    title: 'Finance & Security',
    items: [
      { path: '/billing', label: 'Billing Ledger', icon: Icons.Billing },
      { path: '/financial-reports', label: 'Financial Reports', icon: Icons.Reports },
      { path: '/alerts', label: 'Security & Alerts', icon: Icons.Alerts, badgeKey: 'alerts' },
    ]
  }
];

const RESIDENT_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/homeowner-portal', label: 'My Portal', icon: Icons.HomeownerPortal },
      { path: '/dashboard', label: 'Dashboard', icon: Icons.Overview },
    ]
  },
  {
    title: 'My Residence',
    items: [
      { path: '/household', label: 'Household Members', icon: Icons.Household },
      { path: '/billing', label: 'My Statements & Dues', icon: Icons.Billing },
      { path: '/documents', label: 'Submit Requests', icon: Icons.Documents },
    ]
  },
  {
    title: 'Community',
    items: [
      { path: '/officers', label: 'HOA Officers', icon: Icons.Officers },
      { path: '/events', label: 'Events & Notices', icon: Icons.Calendar },
      { path: '/facilities', label: 'Court Reservations', icon: Icons.Facilities },
      { path: '/alerts', label: 'Emergency Alerts', icon: Icons.Alerts, badgeKey: 'alerts' },
    ]
  }
];

const SECURITY_GUARD_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Gate Overview', icon: Icons.Overview },
      { path: '/visitors', label: 'Visitor Logbook', icon: Icons.Visitors },
    ]
  },
  {
    title: 'Directory & Notices',
    items: [
      { path: '/officers', label: 'HOA Officers', icon: Icons.Officers },
      { path: '/events', label: 'Events Calendar', icon: Icons.Calendar },
      { path: '/documents', label: 'Service Requests', icon: Icons.Documents },
      { path: '/alerts', label: 'Security Alerts', icon: Icons.Alerts, badgeKey: 'alerts' },
    ]
  }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { activeAlerts } = useAlerts();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  let sections: NavSection[] = SUPER_ADMIN_SECTIONS;
  if (user.roleName === 'hoa_admin' || user.roleName === 'admin_staff') {
    sections = HOA_ADMIN_SECTIONS;
  } else if (user.roleName === 'resident') {
    sections = RESIDENT_SECTIONS;
  } else if (user.roleName === 'security_guard') {
    sections = SECURITY_GUARD_SECTIONS;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar minimalist-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{
          width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          background: '#FFFFFF', border: '1px solid var(--sidebar-border)'
        }}>
          <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--sidebar-text-title)', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            NRG PH2 HOA
          </div>
          <div style={{ fontSize: 11, color: 'var(--sidebar-text-sub)', whiteSpace: 'nowrap' }}>
            Phase 2 Cloud Portal
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="sidebar-nav-container" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {sections.map((sec, secIdx) => (
          <div key={sec.title} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              padding: '0 8px 6px',
              opacity: 0.8
            }}>
              {sec.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sec.items.map(item => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon-wrap" style={{ display: 'flex', alignItems: 'center' }}>
                      <IconComponent />
                    </span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {item.badgeKey === 'alerts' && activeAlerts.length > 0 && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: '#DC2626',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: 10
                      }}>
                        {activeAlerts.length}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Public Website Link */}
        <div style={{ marginTop: 8, borderTop: '1px solid var(--sidebar-border)', paddingTop: 12 }}>
          <NavLink
            to="/"
            className="sidebar-nav-link"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="nav-icon-wrap" style={{ display: 'flex', alignItems: 'center' }}>
              <Icons.External />
            </span>
            <span>Public Website</span>
          </NavLink>
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="sidebar-footer" ref={userMenuRef} style={{ padding: 10, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        {showMenu && (
          <div className="user-popover-menu" style={{
            position: 'absolute',
            bottom: 74,
            left: 10,
            right: 10,
            background: '#0D4A36',
            border: '1px solid rgba(110, 231, 183, 0.3)',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            padding: 4,
            zIndex: 100
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: '#A7F3D0' }}>{user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => { setShowMenu(false); navigate('/profile'); }}
              className="user-menu-item"
              style={{ padding: '8px 10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ECFDF5', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}
            >
              Account Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="user-menu-item"
              style={{ padding: '8px 10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#FCA5A5', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 4 }}
            >
              Logout
            </button>
          </div>
        )}

        <div
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            background: showMenu ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
            transition: 'all 0.15s ease'
          }}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#059669', color: '#FFFFFF',
              border: '1px solid rgba(167, 243, 208, 0.4)',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {user.fullName.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.fullName}
            </div>
            <div style={{ fontSize: 10.5, color: '#A7F3D0' }}>
              {user.roleName.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .minimalist-sidebar {
          width: 240px;
          min-width: 240px;
          background: #0D4A36;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .sidebar-brand {
          height: 68px;
          min-height: 68px;
          max-height: 68px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
          border-bottom: 2px solid #16A34A;
          background: #0D4A36;
        }
        .sidebar-brand-title {
          color: #FFFFFF !important;
        }
        .sidebar-brand-sub {
          color: #6EE7B7 !important;
        }
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: #D1FAE5;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .sidebar-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
        }
        .sidebar-nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          font-weight: 600;
        }
      `}</style>
    </aside>
  );
}
