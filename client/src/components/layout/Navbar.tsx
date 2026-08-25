import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: string;
  targetPath?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { user } = useAuth();
  const { activeAlerts } = useAlerts();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [timeString, setTimeString] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let roleNotifications: NotificationItem[] = [];
    if (user.roleName === 'super_admin') {
      roleNotifications = [
        { id: 'sa-1', title: 'New Tenant: Palmera Residences HOA', time: '10m ago', read: false, type: 'tenant', targetPath: '/tenants' },
        { id: 'sa-2', title: 'User Created: Sgt. Pedro Penduko', time: '1h ago', read: false, type: 'users', targetPath: '/users' },
      ];
    } else if (user.roleName === 'hoa_admin' || user.roleName === 'admin_staff') {
      roleNotifications = [
        { id: 'hoa-1', title: '3 Pending Homeowner Approvals', time: '5m ago', read: false, type: 'hoa', targetPath: '/hoa-manage' },
        { id: 'hoa-2', title: '₱45,200 Dues Payments Recorded', time: '1h ago', read: false, type: 'billing', targetPath: '/billing' },
      ];
    } else {
      roleNotifications = [
        { id: 'res-1', title: 'Monthly HOA Dues Statement Issued', time: '20m ago', read: false, type: 'billing', targetPath: '/billing' },
        { id: 'res-2', title: 'Service Request Approved', time: '2h ago', read: false, type: 'document', targetPath: '/homeowner-portal' },
      ];
    }
    setNotifications(roleNotifications);
  }, [user]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleString('en-PH', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length + activeAlerts.length;

  return (
    <header className="navbar minimalist-navbar">
      {/* Left: Clean Breadcrumb Trail */}
      <div className="navbar-left">
        <div className="breadcrumb-trail" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            Dashboard
          </span>
          <span style={{ color: 'var(--border)', fontSize: 11 }}>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {title}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme Toggle Pill */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-theme-minimal"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <span>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className="btn-icon-minimal"
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown" style={{
              position: 'absolute',
              top: 40,
              right: 0,
              width: 280,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 100,
              padding: 6
            }}>
              <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Notifications
              </div>
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.targetPath) navigate(n.targetPath);
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{n.title}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div style={{
          fontSize: 11.5,
          fontFamily: 'monospace',
          color: 'var(--text-muted)',
          padding: '4px 8px',
          borderRadius: 4,
          background: 'var(--bg-hover)',
          border: '1px solid var(--border)'
        }}>
          {timeString}
        </div>

        {/* User Avatar Button */}
        {user && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="navbar-profile-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '3px 8px 3px 4px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#111827', color: '#FFFFFF',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user.fullName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.fullName.split(' ')[0]}
            </span>
          </button>
        )}
      </div>

      <style>{`
        .minimalist-navbar {
          height: 52px;
          min-height: 52px;
          background: var(--navbar-bg);
          border-bottom: 1px solid var(--navbar-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .btn-theme-minimal {
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-theme-minimal:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .btn-icon-minimal {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        }
        .btn-icon-minimal:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #DC2626;
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 10px;
        }
      `}</style>
    </header>
  );
}
