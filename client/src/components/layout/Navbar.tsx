import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';
import { getMockData } from '../../data/mockDatabase';

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
    const currentUser = user;
    let isMounted = true;

    async function loadDynamicNotifications() {
      const items: NotificationItem[] = [];

      // 1. Active Emergency Alerts (Top Priority for all roles)
      if (activeAlerts && activeAlerts.length > 0) {
        activeAlerts.forEach(alert => {
          const typeLabel = (alert.alertType || (alert as any).alert_type || 'emergency').toUpperCase();
          items.push({
            id: `alert-${alert.id}`,
            title: `🚨 ${typeLabel}: ${alert.location || 'Emergency Alert'}`,
            time: 'Active Now',
            read: false,
            type: 'alert',
            targetPath: '/alerts',
          });
        });
      }

      try {
        // 2. Role-specific database-driven notifications
        if (currentUser.roleName === 'resident' || currentUser.roleName === 'homeowner') {
          // Check resident billing
          const bills = getMockData('billing') || [];
          const userBills = bills.filter((b: any) => 
            b.resident_id === currentUser.id || 
            (b.resident_name && b.resident_name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
          );
          const unpaid = userBills.find((b: any) => b.status === 'unpaid' || b.status === 'overdue');
          if (unpaid) {
            items.push({
              id: `bill-${unpaid.id}`,
              title: `💳 ${unpaid.billing_period} Dues Unpaid: ₱${(unpaid.amount + (unpaid.previous_balance || 0)).toLocaleString()}`,
              time: `Due ${unpaid.due_date}`,
              read: false,
              type: 'billing',
              targetPath: '/homeowner-portal',
            });
          } else {
            items.push({
              id: 'bill-clear',
              title: `✅ All Association Dues are Fully Paid`,
              time: 'Current',
              read: true,
              type: 'billing',
              targetPath: '/homeowner-portal',
            });
          }

          // Check resident reservations
          const resList = getMockData('reservations') || [];
          const myReservations = resList.filter((r: any) => r.user_id === currentUser.id || r.reserved_by === currentUser.id);
          if (myReservations.length > 0) {
            const latest = myReservations[0];
            items.push({
              id: `res-${latest.id}`,
              title: `📅 Facility Booking: ${latest.title || 'Reservation'} (${latest.status})`,
              time: latest.start_time?.split('T')[0] || 'Upcoming',
              read: latest.status === 'approved',
              type: 'facility',
              targetPath: '/facilities',
            });
          }
        } else if (currentUser.roleName === 'hoa_admin' || currentUser.roleName === 'admin_staff') {
          // HOA Admin & Staff
          const users = getMockData('users') || [];
          const pendingApps = users.filter((u: any) => u.status === 'pending_approval');
          if (pendingApps.length > 0) {
            items.push({
              id: 'hoa-pending-apps',
              title: `👥 ${pendingApps.length} Homeowner Application${pendingApps.length > 1 ? 's' : ''} Pending Approval`,
              time: 'Action Needed',
              read: false,
              type: 'hoa',
              targetPath: '/hoa-manage',
            });
          }

          const bills = getMockData('billing') || [];
          const unpaidLedgers = bills.filter((b: any) => b.status === 'unpaid' || b.status === 'overdue');
          if (unpaidLedgers.length > 0) {
            items.push({
              id: 'hoa-unpaid-dues',
              title: `📊 ${unpaidLedgers.length} Delinquent / Unpaid Dues in Ledger`,
              time: 'Billing Q3',
              read: false,
              type: 'billing',
              targetPath: '/billing',
            });
          }

          const resList = getMockData('reservations') || [];
          const pendingRes = resList.filter((r: any) => r.status === 'pending');
          if (pendingRes.length > 0) {
            items.push({
              id: 'hoa-pending-res',
              title: `📅 ${pendingRes.length} Facility Reservation Request${pendingRes.length > 1 ? 's' : ''}`,
              time: 'Pending Review',
              read: false,
              type: 'facility',
              targetPath: '/facilities',
            });
          }
        } else if (currentUser.roleName === 'barangay_official' || currentUser.roleName === 'super_admin') {
          // Barangay Official & Super Admin
          const docs = getMockData('documents') || [];
          const pendingDocs = docs.filter((d: any) => d.status === 'pending');
          if (pendingDocs.length > 0) {
            items.push({
              id: 'brgy-pending-docs',
              title: `📄 ${pendingDocs.length} Barangay Clearance / Certificate Request${pendingDocs.length > 1 ? 's' : ''}`,
              time: 'Processing',
              read: false,
              type: 'document',
              targetPath: '/documents',
            });
          }

          const tenants = getMockData('tenants') || [];
          items.push({
            id: 'brgy-tenants',
            title: `🏛️ ${tenants.length} Active Jurisdictions & HOAs Registered`,
            time: 'System Online',
            read: true,
            type: 'tenant',
            targetPath: '/tenants',
          });
        } else if (currentUser.roleName === 'security_guard') {
          // Security Guard
          const visitors = getMockData('visitors') || [];
          const inside = visitors.filter((v: any) => v.status === 'inside' || !v.time_out);
          items.push({
            id: 'guard-visitors',
            title: `🛂 ${inside.length} Active Visitors Inside Phase 2 Premises`,
            time: 'Gate 1 RFID',
            read: false,
            type: 'visitors',
            targetPath: '/visitors',
          });
        }
      } catch (err) {
        console.error('Failed to load dynamic notifications:', err);
      }

      if (isMounted) {
        setNotifications(items);
      }
    }

    loadDynamicNotifications();
    return () => { isMounted = false; };
  }, [user, activeAlerts]);

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

  // Dynamic Breadcrumb Section based on current route
  const getSectionCategory = (pathname: string): string => {
    const path = pathname.toLowerCase();
    if (path === '/dashboard' || path === '/masterlist' || path === '/hoa-masterlist') {
      return 'Main';
    }
    if (
      path === '/homeowner-portal' ||
      path === '/officers' ||
      path === '/hoa-officers' ||
      path === '/directory' ||
      path === '/household' ||
      path === '/household-members' ||
      path === '/events' ||
      path === '/calendar-events' ||
      path === '/residents'
    ) {
      return 'Community';
    }
    if (
      path === '/documents' ||
      path === '/hoa-manage' ||
      path === '/facilities' ||
      path === '/visitors'
    ) {
      return 'Operations';
    }
    if (
      path === '/billing' ||
      path === '/financial-reports' ||
      path === '/tenants' ||
      path === '/users' ||
      path === '/all-users' ||
      path === '/all-user' ||
      path === '/alerts' ||
      path === '/profile' ||
      path === '/account-settings'
    ) {
      return 'Finance & Administration';
    }
    return 'Main';
  };

  const sectionCategory = getSectionCategory(location.pathname);

  return (
    <header className="navbar minimalist-navbar">
      {/* Left: Clean Breadcrumb Trail */}
      <div className="navbar-left">
        <div className="breadcrumb-trail" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500, userSelect: 'none' }}>
            {sectionCategory}
          </span>
          <span style={{ color: 'var(--border)', fontSize: 13 }}>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14.5 }}>
            {title}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown" style={{
              position: 'absolute',
              top: 46,
              right: 0,
              width: 300,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 100,
              padding: 6
            }}>
              <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Notifications
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.targetPath) navigate(n.targetPath);
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{n.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div style={{
          fontSize: 12.5,
          fontFamily: 'monospace',
          color: 'var(--text-muted)',
          padding: '6px 12px',
          borderRadius: 6,
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
              gap: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '4px 12px 4px 6px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.15s ease'
            }}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.fullName || 'User'} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#111827', color: '#FFFFFF',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(user?.fullName || 'User').split(' ')[0]}
            </span>
          </button>
        )}
      </div>

      <style>{`
        .minimalist-navbar {
          height: 68px;
          min-height: 68px;
          max-height: 68px;
          box-sizing: border-box;
          background: var(--navbar-bg);
          border-bottom: 2px solid #16A34A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        [data-theme="dark"] .minimalist-navbar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .btn-theme-minimal {
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-theme-minimal:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .btn-icon-minimal {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
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
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 10px;
        }
        .navbar-profile-btn:hover {
          background: var(--bg-hover) !important;
        }
      `}</style>
    </header>
  );
}
