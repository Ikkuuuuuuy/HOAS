import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

interface NavItem {
  path: string;
  label: string;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const ROLE_CONFIG: Record<string, {
  label: string;
  color: string;
  groups: NavGroup[];
}> = {
  super_admin: {
    label: 'Super Admin',
    color: '#7C3AED',
    groups: [
      {
        section: 'Main',
        items: [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/homeowner-portal', label: 'Homeowner Portal' },
        ]
      },
      {
        section: 'HOA Management',
        items: [
          { path: '/masterlist', label: 'HOA Masterlist & Excel' },
          { path: '/officers', label: 'HOA Officers' },
          { path: '/household', label: 'Household Members' },
          { path: '/events', label: 'Calendar Events' },
          { path: '/documents', label: 'Service Requests' },
          { path: '/hoa-manage', label: 'Admin Staff Hub' },
        ]
      },
      {
        section: 'Administration & Finance',
        items: [
          { path: '/tenants', label: 'Tenants' },
          { path: '/users', label: 'All Users' },
          { path: '/billing', label: 'Billing Ledger' },
          { path: '/financial-reports', label: 'Financial Reports' },
        ]
      },
      {
        section: 'Security & Community',
        items: [
          { path: '/facilities', label: 'Basketball Reservation' },
          { path: '/visitors', label: 'Visitor Logs' },
          { path: '/alerts', label: 'Emergency Alerts' },
        ]
      }
    ]
  },

  hoa_admin: {
    label: 'Main Administrator',
    color: '#DC2626',
    groups: [
      {
        section: 'Main',
        items: [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/homeowner-portal', label: 'Homeowner View' },
        ]
      },
      {
        section: 'Community & Records',
        items: [
          { path: '/masterlist', label: 'HOA Masterlist & Excel' },
          { path: '/officers', label: 'HOA Officers' },
          { path: '/household', label: 'Household Members' },
          { path: '/events', label: 'Calendar Events' },
          { path: '/documents', label: 'Service Requests' },
          { path: '/hoa-manage', label: 'Admin Staff & Approvals' },
        ]
      },
      {
        section: 'Finance & Utilities',
        items: [
          { path: '/billing', label: 'Billing Ledger' },
          { path: '/financial-reports', label: 'Financial Reports' },
          { path: '/facilities', label: 'Basketball Reservation' },
        ]
      },
      {
        section: 'Security & Access',
        items: [
          { path: '/visitors', label: 'Visitor Logs' },
          { path: '/alerts', label: 'Emergency Alerts' },
        ]
      }
    ]
  },

  admin_staff: {
    label: 'Admin Staff',
    color: '#3B82F6',
    groups: [
      {
        section: 'Main',
        items: [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/homeowner-portal', label: 'Homeowner View' },
        ]
      },
      {
        section: 'Operations',
        items: [
          { path: '/masterlist', label: 'HOA Masterlist & Excel' },
          { path: '/officers', label: 'HOA Officers' },
          { path: '/household', label: 'Household Members' },
          { path: '/events', label: 'Calendar Events' },
          { path: '/documents', label: 'Service Requests' },
          { path: '/hoa-manage', label: 'Approvals & Publishing' },
        ]
      },
      {
        section: 'Finance & Logistics',
        items: [
          { path: '/billing', label: 'Billing Ledger' },
          { path: '/financial-reports', label: 'Financial Reports' },
          { path: '/facilities', label: 'Basketball Reservation' },
          { path: '/visitors', label: 'Visitor Logs' },
        ]
      }
    ]
  },

  security_guard: {
    label: 'Security Guard',
    color: '#D97706',
    groups: [
      {
        section: 'Main',
        items: [
          { path: '/dashboard', label: 'Guard Dashboard' },
        ]
      },
      {
        section: 'Perimeter & Gate Access',
        items: [
          { path: '/visitors', label: 'Visitor Logbook' },
          { path: '/officers', label: 'HOA Officers' },
          { path: '/events', label: 'Community Events' },
          { path: '/documents', label: 'Gate Permits & Passes' },
          { path: '/alerts', label: 'Emergency Broadcast' },
        ]
      }
    ]
  },

  resident: {
    label: 'Registered Homeowner',
    color: '#0891B2',
    groups: [
      {
        section: 'Main',
        items: [
          { path: '/homeowner-portal', label: 'Homeowner Portal' },
          { path: '/dashboard', label: 'My Dashboard' },
        ]
      },
      {
        section: 'Household & Requests',
        items: [
          { path: '/household', label: 'Household Members' },
          { path: '/documents', label: 'Service Requests' },
          { path: '/billing', label: 'My Billing Statements' },
        ]
      },
      {
        section: 'Community & Amenities',
        items: [
          { path: '/officers', label: 'HOA Officers' },
          { path: '/events', label: 'Calendar Events' },
          { path: '/facilities', label: 'Facility Reservation' },
          { path: '/alerts', label: 'Emergency Alerts' },
        ]
      }
    ]
  },
};

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

  const config = ROLE_CONFIG[user.roleName] || ROLE_CONFIG.resident;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA INC Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="sidebar-brand-title">NRG PH2 HOA INC</div>
          <div className="sidebar-brand-sub">Phase 2 HOA Portal</div>
        </div>
      </div>

      {/* Grouped Navigation List without distracting emojis */}
      <nav className="sidebar-nav">
        {config.groups.map((grp) => (
          <div key={grp.section} className="sidebar-group">
            <div className="sidebar-group-title">{grp.section}</div>
            <div className="sidebar-group-items">
              {grp.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-bullet"></span>
                  <span className="nav-label">{item.label}</span>
                  {item.path === '/alerts' && activeAlerts.length > 0 && (
                    <span className="nav-badge">{activeAlerts.length}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Utilities */}
        <div className="sidebar-group" style={{ marginTop: 'auto', paddingTop: 8 }}>
          <div className="sidebar-group-title">Utilities & Guides</div>
          <NavLink to="/" className="sidebar-nav-item">
            <span className="nav-bullet"></span>
            <span className="nav-label">Public Website</span>
          </NavLink>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-nav-item"
          >
            <span className="nav-bullet"></span>
            <span className="nav-label">Community Facebook</span>
          </a>
        </div>
      </nav>

      {/* User Profile Capsule (Bottom) */}
      <div className="sidebar-footer" ref={userMenuRef}>
        {showMenu && (
          <div className="user-popover-menu">
            <div className="menu-header">
              <div className="menu-header-name">{user.fullName}</div>
              <div className="menu-header-email">{user.email}</div>
            </div>

            <button className="user-menu-item" onClick={() => { setShowMenu(false); navigate('/profile'); }}>
              <span>Account & Password</span>
            </button>

            <button className="user-menu-item logout-item" onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        )}

        <div
          className={`sidebar-user-clickable ${showMenu ? 'active' : ''}`}
          onClick={() => setShowMenu(prev => !prev)}
          title="Click to view Account & Logout"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="sidebar-avatar-img"
            />
          ) : (
            <div className="sidebar-avatar-capsule">
              {getInitials(user.fullName)}
            </div>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role">{config.label}</div>
          </div>
          <div className="sidebar-user-chevron">⚙</div>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #0B1120;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 50;
          box-sizing: border-box;
          user-select: none;
        }

        .sidebar-brand {
          height: 60px;
          min-height: 60px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #080C14;
        }

        .sidebar-logo {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar-brand-title {
          font-size: 13px;
          font-weight: 700;
          color: #F8FAFC;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-brand-sub {
          font-size: 10.5px;
          color: #94A3B8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sidebar-group-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748B;
          padding: 0 10px 4px;
        }

        .sidebar-group-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: #94A3B8;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .sidebar-nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #F8FAFC;
        }

        .sidebar-nav-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          font-weight: 600;
        }

        .nav-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #64748B;
          opacity: 0.6;
          transition: all 0.15s ease;
        }

        .sidebar-nav-item.active .nav-bullet {
          background: #DC2626;
          opacity: 1;
          transform: scale(1.3);
        }

        .nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-badge {
          background: #DC2626;
          color: #FFFFFF;
          font-size: 9.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }

        .sidebar-footer {
          padding: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #080C14;
          position: relative;
        }

        .sidebar-user-clickable {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .sidebar-user-clickable:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .sidebar-avatar-capsule {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-avatar-img {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          flex: 1;
          overflow: hidden;
        }

        .sidebar-user-name {
          font-size: 12px;
          font-weight: 600;
          color: #F8FAFC;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          font-size: 10px;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-chevron {
          font-size: 11px;
          color: #64748B;
        }

        .user-popover-menu {
          position: absolute;
          bottom: 58px;
          left: 8px;
          right: 8px;
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          z-index: 100;
          overflow: hidden;
          padding: 4px;
        }

        .menu-header {
          padding: 8px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 2px;
        }

        .menu-header-name {
          font-size: 11.5px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .menu-header-email {
          font-size: 10px;
          color: #94A3B8;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 7px 10px;
          border-radius: 5px;
          background: none;
          border: none;
          color: #CBD5E1;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
        }

        .user-menu-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        .user-menu-item.logout-item:hover {
          background: rgba(220, 38, 38, 0.2);
          color: #F87171;
        }
      `}</style>
    </aside>
  );
}
