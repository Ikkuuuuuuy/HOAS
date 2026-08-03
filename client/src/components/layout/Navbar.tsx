import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  read: boolean;
  type: string;
  targetPath?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth();
  const { activeAlerts } = useAlerts();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Real-time Clock with Seconds state
  const [timeString, setTimeString] = useState<string>('');
  
  // Notifications state & dropdown ref
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate Role-Based Notifications
  useEffect(() => {
    if (!user) return;

    let roleNotifications: NotificationItem[] = [];

    if (user.roleName === 'super_admin') {
      roleNotifications = [
        { id: 'sa-1', icon: '🏛', title: 'New Tenant Provisioned: Palmera Residences HOA', time: '10 mins ago', read: false, type: 'tenant', targetPath: '/tenants' },
        { id: 'sa-2', icon: '👥', title: 'User Account Created: Sgt. Pedro Penduko', time: '1 hour ago', read: false, type: 'users', targetPath: '/users' },
        { id: 'sa-3', icon: '🔒', title: 'Multi-Tenant Data Isolation Audit: Passed 100%', time: '3 hours ago', read: true, type: 'system', targetPath: '/dashboard' },
      ];
    } else if (user.roleName === 'barangay_official') {
      roleNotifications = [
        { id: 'bo-1', icon: '📄', title: '4 Pending Barangay Clearance Requests', time: '15 mins ago', read: false, type: 'document', targetPath: '/documents' },
        { id: 'bo-2', icon: '👨‍👩‍👧‍👦', title: 'New Resident Registration in Tungkong Mangga', time: '2 hours ago', read: false, type: 'resident', targetPath: '/residents' },
        { id: 'bo-3', icon: '🏛', title: 'Barangay General Assembly Reserved at Court', time: 'Yesterday', read: true, type: 'facility', targetPath: '/facilities' },
      ];
    } else if (user.roleName === 'hoa_admin' || user.roleName === 'admin_staff') {
      roleNotifications = [
        { id: 'hoa-1', icon: '👤', title: '3 Pending Homeowner Account Approvals', time: '5 mins ago', read: false, type: 'hoa', targetPath: '/hoa-manage' },
        { id: 'hoa-2', icon: '💳', title: '₱45,200 Dues Payments Recorded Today', time: '1 hour ago', read: false, type: 'billing', targetPath: '/billing' },
        { id: 'hoa-3', icon: '📊', title: 'Q3 Searchable Financial Report Published', time: '3 hours ago', read: true, type: 'financial', targetPath: '/financial-reports' },
      ];
    } else if (user.roleName === 'security_guard') {
      roleNotifications = [
        { id: 'sg-1', icon: '🚗', title: 'Gate Pass #8841 Active for Visitor Entry', time: 'Just now', read: false, type: 'visitor', targetPath: '/visitors' },
        { id: 'sg-2', icon: '🚨', title: 'Overnight Parking Alert logged at Block 4', time: '30 mins ago', read: false, type: 'alert', targetPath: '/alerts' },
        { id: 'sg-3', icon: '🚚', title: 'Delivery Truck Pre-Approved for Phase 2', time: '2 hours ago', read: true, type: 'visitor', targetPath: '/visitors' },
      ];
    } else {
      // Homeowner Resident
      roleNotifications = [
        { id: 'res-1', icon: '💳', title: 'Monthly HOA Dues Statement Issued (#INV-2026-08)', time: '20 mins ago', read: false, type: 'billing', targetPath: '/billing' },
        { id: 'res-2', icon: '📄', title: 'Barangay Residency Certificate Approved', time: '2 hours ago', read: false, type: 'document', targetPath: '/homeowner-portal' },
        { id: 'res-3', icon: '🏀', title: 'Basketball Court Reservation Confirmed', time: 'Yesterday', read: true, type: 'facility', targetPath: '/facilities' },
      ];
    }

    setNotifications(roleNotifications);
  }, [user]);

  // Update Clock every second (hh:mm:ss AM/PM)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTimeString(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length + activeAlerts.length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (item.targetPath) {
      navigate(item.targetPath);
    }
  };

  const toggleMobileSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="btn-mobile-sidebar-toggle"
          onClick={toggleMobileSidebar}
          title="Toggle Navigation Menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: 'var(--text-primary)',
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          ☰
        </button>
        <div>
          <h1 className="navbar-title">{title}</h1>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="navbar-right">
        {/* Active Emergency Alert Badge if any */}
        {activeAlerts.length > 0 && (
          <div className="navbar-alert-badge">
            <span className="pulse-dot" style={{ background: 'var(--danger)' }} />
            <span>{activeAlerts.length} Emergency Alert{activeAlerts.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* 🌙 / ☀️ THEME TOGGLE BUTTON */}
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* 🔔 NOTIFICATION CENTER BUTTON & DROPDOWN FOR ALL ROLES */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className={`btn-notification ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(prev => !prev)}
            title="System Notifications & Alerts"
          >
            <span className="bell-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* DROPDOWN PANEL */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--popover-text)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 6px', background: '#DC2626' }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="btn-mark-read" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {activeAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="notification-item unread alert-item"
                    onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                  >
                    <span className="item-icon">🚨</span>
                    <div className="item-content">
                      <div className="item-title">{alert.title || 'Emergency Broadcast'}</div>
                      <div className="item-sub">{alert.description || alert.message || 'Urgent HOA alert in progress.'}</div>
                      <div className="item-time">Active Now — Click to View</div>
                    </div>
                  </div>
                ))}

                {notifications.map(item => (
                  <div
                    key={item.id}
                    className={`notification-item ${!item.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <div className="item-content">
                      <div className="item-title">{item.title}</div>
                      <div className="item-time">{item.time}</div>
                    </div>
                    {!item.read && <div className="unread-dot" />}
                  </div>
                ))}
              </div>

              <div className="notification-footer">
                <span style={{ fontSize: 11, color: 'var(--popover-sub)' }}>BRIA Northridge Grove Broadcast Network</span>
              </div>
            </div>
          )}
        </div>

        {/* REAL-TIME CLOCK WITH SECONDS */}
        <div className="navbar-time font-mono">
          <span style={{ color: 'var(--shell-text-sub)', marginRight: 4 }}>🕒</span>
          <span>{timeString}</span>
        </div>
      </div>

      <style>{`
        .navbar {
          height: 76px;
          min-height: 76px;
          box-sizing: border-box;
          background: var(--shell-bg);
          border-bottom: 1px solid var(--shell-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-8);
          position: sticky;
          top: 0;
          z-index: 40;
          transition: background 0.25s ease;
        }
        .navbar-left { display: flex; align-items: center; gap: var(--space-4); }
        .navbar-title { font-size: var(--font-xl); font-weight: 800; color: var(--shell-text-title); margin: 0; }
        .navbar-subtitle { font-size: var(--font-xs); color: var(--shell-text-sub); margin-top: 1px; }
        .navbar-right { display: flex; align-items: center; gap: var(--space-4); }
        .navbar-alert-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--danger-soft);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: var(--font-xs);
          font-weight: 600;
          color: var(--danger);
        }
        .pulse-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          display: inline-block;
        }
        .navbar-time {
          font-size: var(--font-xs);
          color: var(--shell-text-title);
          font-weight: 700;
          background: var(--shell-card-bg);
          padding: 6px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--shell-card-bdr);
          font-family: monospace, monospace;
          white-space: nowrap;
        }

        /* Theme Toggle Button */
        .btn-theme-toggle {
          background: var(--shell-card-bg);
          border: 1px solid var(--shell-card-bdr);
          color: var(--shell-text-title);
          padding: 6px 12px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; gap: 6px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s ease;
        }
        .btn-theme-toggle:hover {
          background: var(--shell-nav-act-bg);
          border-color: #7C3AED;
        }

        /* Notification Dropdown Styles */
        .notification-wrapper {
          position: relative;
        }
        .btn-notification {
          position: relative;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border);
          width: 38px; height: 38px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-notification:hover, .btn-notification.active {
          background: rgba(124, 58, 237, 0.2);
          border-color: #7C3AED;
        }
        .bell-icon { font-size: 16px; }
        .notification-badge {
          position: absolute;
          top: -4px; right: -4px;
          background: #DC2626;
          color: #FFF;
          font-size: 10px;
          font-weight: 800;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--bg-surface);
          animation: pulse 2s infinite;
        }
        .notification-dropdown {
          position: absolute;
          top: 48px; right: 0;
          width: 340px;
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          z-index: 100;
          overflow: hidden;
          animation: fadeInUp 0.2s ease;
        }
        .notification-header {
          padding: 12px 16px;
          background: #1E293B;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .btn-mark-read {
          background: none; border: none;
          color: #A78BFA; font-size: 11px; font-weight: 700;
          cursor: pointer; text-decoration: underline;
        }
        .notification-list {
          max-height: 320px;
          overflow-y: auto;
        }
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; gap: 12px; align-items: flex-start;
          cursor: pointer; transition: background 0.15s;
          position: relative;
        }
        .notification-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .notification-item.unread {
          background: rgba(124, 58, 237, 0.08);
        }
        .notification-item.alert-item {
          background: rgba(220, 38, 38, 0.15);
          border-left: 3px solid #DC2626;
        }
        .item-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
        .item-content { flex: 1; }
        .item-title { font-size: 12px; font-weight: 700; color: #FFF; line-height: 1.3; }
        .item-sub { font-size: 11px; color: #D1D5DB; margin-top: 2px; }
        .item-time { font-size: 10px; color: #9CA3AF; margin-top: 4px; }
        .unread-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #7C3AED; flex-shrink: 0; margin-top: 6px;
        }
        .notification-footer {
          padding: 10px 16px;
          background: #1E293B;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
      `}</style>
    </header>
  );
}
