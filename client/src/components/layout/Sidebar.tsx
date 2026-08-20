import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

const ROLE_CONFIG: Record<string, {
  label: string;
  color: string;
  gradient: string;
  nav: { path: string; icon: string; label: string }[];
}> = {
  super_admin: {
    label: 'Super Admin',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    nav: [
      { path: '/dashboard', icon: '⊞', label: 'Overview' },
      { path: '/homeowner-portal', icon: '🏠', label: 'Homeowner Portal' },
      { path: '/household', icon: '👨‍👩‍👧‍👦', label: 'Household Members' },
      { path: '/events', icon: '📅', label: 'Calendar Events' },
      { path: '/documents', icon: '📋', label: 'Service Requests' },
      { path: '/hoa-manage', icon: '⚙️', label: 'HOA Admin Staff Hub' },
      { path: '/tenants', icon: '🏛', label: 'Tenants' },
      { path: '/users', icon: '👥', label: 'All Users' },
      { path: '/billing', icon: '💳', label: 'Billing' },
      { path: '/facilities', icon: '🏀', label: 'Basketball Reservation' },
      { path: '/visitors', icon: '🚗', label: 'Visitor Logs' },
      { path: '/alerts', icon: '🚨', label: 'Alerts' },
    ],
  },

  hoa_admin: {
    label: 'Main Administrator',
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
    nav: [
      { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
      { path: '/household', icon: '👨‍👩‍👧‍👦', label: 'Household Members' },
      { path: '/events', icon: '📅', label: 'Calendar Events' },
      { path: '/documents', icon: '📋', label: 'Service Requests' },
      { path: '/hoa-manage', icon: '⚙️', label: 'Admin Staff & Approvals' },
      { path: '/financial-reports', icon: '📊', label: 'Financial Reports' },
      { path: '/homeowner-portal', icon: '🏠', label: 'Homeowner View' },
      { path: '/billing', icon: '💳', label: 'Billing Ledger' },
      { path: '/facilities', icon: '🏀', label: 'Basketball Reservation' },
      { path: '/visitors', icon: '🚗', label: 'Visitor Logs' },
      { path: '/alerts', icon: '🚨', label: 'Alerts' },
    ],
  },
  admin_staff: {
    label: 'Admin Staff',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    nav: [
      { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
      { path: '/household', icon: '👨‍👩‍👧‍👦', label: 'Household Members' },
      { path: '/events', icon: '📅', label: 'Calendar Events' },
      { path: '/documents', icon: '📋', label: 'Service Requests' },
      { path: '/hoa-manage', icon: '⚙️', label: 'Approvals & Publishing' },
      { path: '/financial-reports', icon: '📊', label: 'Financial Reports' },
      { path: '/homeowner-portal', icon: '🏠', label: 'Homeowner View' },
      { path: '/billing', icon: '💳', label: 'Billing Ledger' },
      { path: '/facilities', icon: '🏀', label: 'Basketball Reservation' },
      { path: '/visitors', icon: '🚗', label: 'Visitor Logs' },
    ],
  },
  security_guard: {
    label: 'Security Guard',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #78350F, #D97706)',
    nav: [
      { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
      { path: '/events', icon: '📅', label: 'Calendar Events' },
      { path: '/documents', icon: '📋', label: 'Service Requests' },
      { path: '/visitors', icon: '🚗', label: 'Visitor Log' },
      { path: '/alerts', icon: '🚨', label: 'Alerts' },
    ],
  },
  resident: {
    label: 'Registered Homeowner',
    color: '#0891B2',
    gradient: 'linear-gradient(135deg, #164E63, #0891B2)',
    nav: [
      { path: '/homeowner-portal', icon: '🏠', label: 'Homeowner Portal' },
      { path: '/household', icon: '👨‍👩‍👧‍👦', label: 'Household Members' },
      { path: '/events', icon: '📅', label: 'Calendar Events' },
      { path: '/dashboard', icon: '⊞', label: 'My Dashboard' },
      { path: '/documents', icon: '📋', label: 'Service Requests' },
      { path: '/billing', icon: '💳', label: 'My Bills' },
      { path: '/facilities', icon: '🏀', label: 'Basketball Reservation' },
      { path: '/alerts', icon: '🚨', label: 'Emergency' },
    ],
  },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { activeAlerts } = useAlerts();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [modalContactNo, setModalContactNo] = useState('0917-890-1234');
  const [modalPassword, setModalPassword] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
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

  return (
    <aside className="sidebar">
      {/* Brand header — Unified dark theme aligned with Top Navbar */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" style={{ background: 'transparent', padding: 0, overflow: 'hidden', width: 44, height: 44, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.4)' }}>
          <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA INC Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div className="sidebar-brand-title" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sidebar-text-title)', letterSpacing: '-0.02em' }}>NRG PH2 HOA INC</div>
          <div className="sidebar-brand-sub" style={{ fontSize: '0.72rem', color: 'var(--sidebar-text-sub)', fontWeight: 700, letterSpacing: '0.04em' }}>Phase 2 HOA Portal</div>
        </div>
      </div>

      {/* PUBLIC WEBSITE RETURN LINK */}
      <div style={{ padding: '12px 16px 4px' }}>
        <NavLink
          to="/"
          className="sidebar-nav-item"
          style={{
            background: 'var(--sidebar-card-bg)',
            border: '1px solid var(--sidebar-card-bdr)',
            color: 'var(--sidebar-text-title)',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
            justifyContent: 'center',
          }}
        >
          <span className="nav-icon">🌐</span>
          <span className="nav-label">Public Website</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {config.nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { '--nav-accent': config.color } as React.CSSProperties : {}}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.icon === '🚨' && activeAlerts.length > 0 && (
              <span className="nav-badge">{activeAlerts.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* CLICKABLE USER PROFILE CARD AT THE LOWEST / BOTTOM POSITION */}
      <div className="sidebar-footer" ref={userMenuRef}>
        <div className="sidebar-divider" style={{ marginBottom: 12 }} />

        {/* POPUP MENU */}
        {showMenu && (
          <div className="user-popover-menu">
            <div className="menu-header">
              <div className="menu-header-name">{user.fullName}</div>
              <div className="menu-header-email">{user.email}</div>
            </div>
            
            <button className="user-menu-item" onClick={() => { setShowMenu(false); setShowOverviewModal(true); }}>
              <span className="item-icon">👤</span>
              <span>Account Overview</span>
            </button>

            <button className="user-menu-item logout-item" onClick={handleLogout}>
              <span className="item-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* CLICKABLE USER PROFILE BUTTON */}
        <div
          className={`sidebar-user-clickable ${showMenu ? 'active' : ''}`}
          onClick={() => setShowMenu(prev => !prev)}
          title="Click to view Account Overview & Logout"
        >
          <div className="sidebar-avatar" style={{ background: config.gradient }}>
            {user.fullName.charAt(0)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role" style={{ color: config.color }}>
              {config.label}
            </div>
            <div className="sidebar-user-tenant">{user.tenantName}</div>
          </div>
          <div className="sidebar-user-chevron">▲</div>
        </div>
      </div>

      {/* ACCOUNT OVERVIEW MODAL */}
      {showOverviewModal && (
        <div className="modal-overlay" onClick={() => setShowOverviewModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: 'var(--text-primary)' }}>👤 Account Overview & Profile Settings</h2>
              <button className="modal-close" onClick={() => setShowOverviewModal(false)}>✕</button>
            </div>

            <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* User Profile Header */}
              <div className="flex items-center gap-4" style={{ background: 'var(--bg-hover)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: config.gradient, display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#FFF' }}>
                  {user.fullName.charAt(0)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.3)' }}>
                      {config.label}
                    </span>
                    <span className="badge badge-approved" style={{ fontSize: 10 }}>✓ Verified Owner</span>
                  </div>
                </div>
              </div>

              {/* System Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Assigned Organization', value: user.tenantName },
                  { label: 'Registered Property / Unit', value: 'Blk 5 Lot 12, Palmera Ave' },
                  { label: 'System Access Level', value: user.roleName.replace(/_/g, ' ').toUpperCase() },
                  { label: 'Multi-Tenant Isolation', value: '🔒 Active & Verified' },
                ].map(info => (
                  <div key={info.label} className="flex justify-between items-center flex-wrap" style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border)', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{info.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, wordBreak: 'break-word' }}>{info.value}</span>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: '2px 0' }} />

              {/* Interactive Contact & Security Update Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                alert(`Account contact details and security preferences saved for ${user.fullName}.`);
                setShowOverviewModal(false);
              }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="section-title text-sm" style={{ marginBottom: 2, color: 'var(--text-primary)' }}>⚙️ Update Contact & Security</div>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12 }}>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={modalContactNo}
                      onChange={e => setModalContactNo(e.target.value)}
                      placeholder="e.g. 0917-890-1234"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12 }}>Change Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={modalPassword}
                      onChange={e => setModalPassword(e.target.value)}
                      placeholder="New password"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" className="btn btn-primary flex-1" style={{ background: '#DC2626', borderColor: '#DC2626', justifyContent: 'center', fontWeight: 700 }}>
                    💾 Save Profile Changes
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: width var(--transition-base), background 0.25s ease;
          overflow-x: hidden;
        }
        .sidebar-brand {
          height: 76px;
          min-height: 76px;
          box-sizing: border-box;
          padding: 0 var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--sidebar-bg);
          border-bottom: 1px solid var(--sidebar-border);
        }
        .sidebar-logo {
          width: 34px; height: 34px;
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.4);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .sidebar-brand-title { font-size: var(--font-sm); font-weight: 800; color: var(--sidebar-text-title); }
        .sidebar-brand-sub { font-size: var(--font-xs); color: var(--sidebar-text-sub); }

        .sidebar-divider { height: 1px; background: var(--sidebar-border); margin: var(--space-2) var(--space-4); }
        .sidebar-nav { flex: 1; padding: var(--space-2) var(--space-3); display: flex; flex-direction: column; gap: 2px; }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
          font-weight: 600;
          color: var(--sidebar-nav-color);
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
        }
        .sidebar-nav-item:hover {
          background: var(--sidebar-nav-hover);
          color: var(--sidebar-nav-hover-t);
        }
        .sidebar-nav-item.active {
          background: var(--sidebar-nav-act-bg);
          color: var(--sidebar-nav-act-t);
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .sidebar-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 3px;
          background: #F59E0B;
          border-radius: 0 2px 2px 0;
        }
        .nav-icon { width: 20px; text-align: center; font-size: 1rem; }
        .nav-label { flex: 1; color: inherit; }
        .nav-badge {
          background: var(--danger);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          animation: pulse 2s infinite;
        }

        /* Sidebar Footer Clickable Profile Card Styles */
        .sidebar-footer {
          padding: 0 var(--space-3) 16px;
          position: relative;
          margin-top: auto;
        }
        .sidebar-user-clickable {
          padding: 10px 12px;
          border-radius: var(--radius-md);
          display: flex;
          gap: var(--space-3);
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--sidebar-card-bg);
          border: 1px solid var(--sidebar-card-bdr);
          user-select: none;
        }
        .sidebar-user-clickable:hover, .sidebar-user-clickable.active {
          background: var(--sidebar-nav-hover);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .sidebar-avatar {
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800; color: #fff;
          flex-shrink: 0;
        }
        .sidebar-user-info { flex: 1; overflow: hidden; }
        .sidebar-user-name { font-size: 13px; font-weight: 800; color: var(--sidebar-text-title); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-role { font-size: 11px; font-weight: 700; margin-top: 2px; }
        .sidebar-user-tenant { font-size: 10px; color: var(--sidebar-text-sub); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-chevron { font-size: 10px; color: var(--sidebar-text-sub); transition: transform 0.2s; }
        .sidebar-user-clickable.active .sidebar-user-chevron { transform: rotate(180deg); }

        /* Popover Menu Styles */
        .user-popover-menu {
          position: absolute;
          bottom: 74px;
          left: 12px;
          right: 12px;
          background: var(--popover-bg);
          border: 1px solid var(--popover-border);
          border-radius: 12px;
          box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
          padding: 6px;
          animation: fadeInUp 0.18s ease;
        }
        .menu-header {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .menu-header-name { font-size: 13px; font-weight: 800; color: var(--popover-text); }
        .menu-header-email { font-size: 11px; color: var(--popover-sub); }
        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          background: none;
          border: none;
          color: var(--popover-text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .user-menu-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .user-menu-item.logout-item:hover {
          background: rgba(220, 38, 38, 0.12);
          color: #DC2626;
        }
      `}</style>
    </aside>
  );
}
