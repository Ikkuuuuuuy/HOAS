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

const getUserKey = (u: any): string => {
  return u?.id ? String(u.id) : (u?.email || u?.roleName || 'guest');
};

const getReadNotificationIds = (userKey: string): Set<string> => {
  try {
    const raw = localStorage.getItem(`hoa_read_notifications_${userKey}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const saveReadNotificationIds = (userKey: string, ids: Set<string> | string[]) => {
  try {
    const arr = Array.isArray(ids) ? ids : Array.from(ids);
    localStorage.setItem(`hoa_read_notifications_${userKey}`, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('hoa_notification_read', { detail: { userKey, ids: arr } }));
    window.dispatchEvent(new Event('hoa_storage_update'));
  } catch (err) {
    console.error('Failed to save read notification IDs:', err);
  }
};

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
      const userKey = getUserKey(currentUser);
      const readIds = getReadNotificationIds(userKey);

      const isRead = (id: string, defaultRead = false): boolean => {
        if (readIds.has(id)) return true;
        return defaultRead;
      };

      // 1. Active Emergency Alerts (Top Priority for all roles)
      if (activeAlerts && activeAlerts.length > 0) {
        activeAlerts.forEach(alert => {
          const alertId = `alert-${alert.id}`;
          const typeLabel = (alert.alertType || (alert as any).alert_type || 'emergency').toUpperCase();
          items.push({
            id: alertId,
            title: `🚨 ${typeLabel}: ${alert.location || 'Emergency Alert'}`,
            time: 'Active Now',
            read: isRead(alertId),
            type: 'alert',
            targetPath: '/alerts',
          });
        });
      }

      try {
        // Shared live metric counts
        let pendingRegCount = 0;
        try {
          const pendList = JSON.parse(localStorage.getItem('hoa_mock_pending_registrations') || '[]');
          const regList = JSON.parse(localStorage.getItem('hoa_registered_users') || '[]');
          const regPending = regList.filter((u: any) => u.status === 'pending_approval' || u.is_active === 0);
          const emails = new Set([...pendList.map((p: any) => p.email?.toLowerCase()), ...regPending.map((p: any) => p.email?.toLowerCase())].filter(Boolean));
          pendingRegCount = emails.size;
        } catch {
          pendingRegCount = 0;
        }

        let pendingPaymentCount = 0;
        try {
          const paymentApprovals = JSON.parse(localStorage.getItem('nrg_hoa_payment_approvals') || '[]');
          pendingPaymentCount = paymentApprovals.filter((p: any) => p.status === 'Pending Approval').length;
        } catch {
          pendingPaymentCount = 0;
        }

        const docs = getMockData('documents') || [];
        const pendingDocCount = docs.filter((d: any) => d.status === 'pending').length;

        const resList = getMockData('reservations') || [];
        const pendingResCount = resList.filter((r: any) => r.status === 'pending').length;

        const visitors = getMockData('visitors') || [];
        const insideVisitorCount = visitors.filter((v: any) => v.status === 'inside' || !v.time_out).length;

        const bills = getMockData('billing') || [];
        const unpaidLedgers = bills.filter((b: any) => b.status === 'unpaid' || b.status === 'overdue');

        const tenants = getMockData('tenants') || [];
        const tenantsCount = tenants.length || 3;

        // ══════════════════════════════════════════════════════════════
        // ROLE 1: SUPER ADMIN (Platform Master & Multi-Tenant Clearance)
        // ══════════════════════════════════════════════════════════════
        if (currentUser.roleName === 'super_admin') {
          if (pendingRegCount > 0) {
            const id = `sa-pending-reg-${pendingRegCount}`;
            items.push({
              id,
              title: `👥 ${pendingRegCount} Homeowner Registration Application${pendingRegCount > 1 ? 's' : ''} Awaiting Clearance`,
              time: 'Staff Hub',
              read: isRead(id),
              type: 'hoa',
              targetPath: '/hoa-manage',
            });
          }
          if (pendingPaymentCount > 0) {
            const id = `sa-pending-payments-${pendingPaymentCount}`;
            items.push({
              id,
              title: `💳 ${pendingPaymentCount} GCash Dues Submission${pendingPaymentCount > 1 ? 's' : ''} in Treasury Queue`,
              time: 'Finance',
              read: isRead(id),
              type: 'billing',
              targetPath: '/payment-approvals',
            });
          }
          if (pendingDocCount > 0) {
            const id = `sa-pending-docs-${pendingDocCount}`;
            items.push({
              id,
              title: `📄 ${pendingDocCount} Service & Barangay Clearance Request${pendingDocCount > 1 ? 's' : ''} Pending`,
              time: 'Operations',
              read: isRead(id),
              type: 'document',
              targetPath: '/documents',
            });
          }
          items.push({
            id: 'sa-tenants-sync',
            title: `🏛️ ${tenantsCount} Subdivision Jurisdictions & HOAs Synchronized`,
            time: 'System Online',
            read: isRead('sa-tenants-sync', true),
            type: 'tenant',
            targetPath: '/tenants',
          });
          items.push({
            id: 'sa-users-rbac',
            title: `🛡️ All System User Accounts & RBAC Roles Managed`,
            time: 'Access Control',
            read: isRead('sa-users-rbac', true),
            type: 'hoa',
            targetPath: '/users',
          });
        }

        // ══════════════════════════════════════════════════════════════
        // ROLE 2: HOA ADMIN (HOA President, Treasurer, Board Governance)
        // ══════════════════════════════════════════════════════════════
        else if (currentUser.roleName === 'hoa_admin') {
          if (pendingRegCount > 0) {
            const id = `hoa-pending-reg-${pendingRegCount}`;
            items.push({
              id,
              title: `👥 ${pendingRegCount} Homeowner Application${pendingRegCount > 1 ? 's' : ''} Awaiting Board Approval`,
              time: 'Action Needed',
              read: isRead(id),
              type: 'hoa',
              targetPath: '/hoa-manage',
            });
          }
          if (pendingPaymentCount > 0) {
            const id = `hoa-pending-payments-${pendingPaymentCount}`;
            items.push({
              id,
              title: `💳 ${pendingPaymentCount} GCash Dues Payment${pendingPaymentCount > 1 ? 's' : ''} Awaiting Official Receipt`,
              time: 'Treasury',
              read: isRead(id),
              type: 'billing',
              targetPath: '/payment-approvals',
            });
          }
          if (unpaidLedgers.length > 0) {
            const id = `hoa-unpaid-dues-${unpaidLedgers.length}`;
            items.push({
              id,
              title: `📊 ${unpaidLedgers.length} Unpaid Homeowner Dues Statements in Master Ledger`,
              time: 'Billing Q3',
              read: isRead(id),
              type: 'billing',
              targetPath: '/billing',
            });
          }
          if (pendingResCount > 0) {
            const id = `hoa-pending-res-${pendingResCount}`;
            items.push({
              id,
              title: `📅 ${pendingResCount} Clubhouse / Court Reservation Request${pendingResCount > 1 ? 's' : ''}`,
              time: 'Amenities',
              read: isRead(id),
              type: 'facility',
              targetPath: '/facilities',
            });
          }
          items.push({
            id: 'hoa-board-minutes',
            title: `📢 2026-2027 HOA Board Resolutions & Meeting Minutes Active`,
            time: 'Official',
            read: isRead('hoa-board-minutes', true),
            type: 'hoa',
            targetPath: '/hoa-manage',
          });
        }

        // ══════════════════════════════════════════════════════════════
        // ROLE 3: ADMIN STAFF (Front Desk, ID Verifications, Helpdesk)
        // ══════════════════════════════════════════════════════════════
        else if (currentUser.roleName === 'admin_staff') {
          if (pendingRegCount > 0) {
            const id = `staff-pending-reg-${pendingRegCount}`;
            items.push({
              id,
              title: `🔍 ${pendingRegCount} Applicant ID & Deed Document${pendingRegCount > 1 ? 's' : ''} to Inspect`,
              time: 'Staff Queue',
              read: isRead(id),
              type: 'hoa',
              targetPath: '/hoa-manage',
            });
          }
          if (pendingDocCount > 0) {
            const id = `staff-pending-docs-${pendingDocCount}`;
            items.push({
              id,
              title: `📋 ${pendingDocCount} Resident Service Request${pendingDocCount > 1 ? 's' : ''} Awaiting Processing`,
              time: 'Helpdesk',
              read: isRead(id),
              type: 'document',
              targetPath: '/documents',
            });
          }
          if (pendingPaymentCount > 0) {
            const id = `staff-payment-verify-${pendingPaymentCount}`;
            items.push({
              id,
              title: `💳 ${pendingPaymentCount} Payment Proof Screenshot${pendingPaymentCount > 1 ? 's' : ''} Ready for Verification`,
              time: 'Cashier',
              read: isRead(id),
              type: 'billing',
              targetPath: '/payment-approvals',
            });
          }
          if (pendingResCount > 0) {
            const id = `staff-facility-res-${pendingResCount}`;
            items.push({
              id,
              title: `📅 ${pendingResCount} Facility Booking Schedule${pendingResCount > 1 ? 's' : ''} to Confirm`,
              time: 'Calendar',
              read: isRead(id),
              type: 'facility',
              targetPath: '/facilities',
            });
          }
          items.push({
            id: 'staff-household-sync',
            title: `👥 Household Member Directory Up to Date`,
            time: 'Records',
            read: isRead('staff-household-sync', true),
            type: 'hoa',
            targetPath: '/household',
          });
        }

        // ══════════════════════════════════════════════════════════════
        // ROLE 4: BARANGAY OFFICIAL (Barangay Captain, Lupon, Indigency)
        // ══════════════════════════════════════════════════════════════
        else if (currentUser.roleName === 'barangay_official') {
          if (pendingDocCount > 0) {
            const id = `brgy-clearance-docs-${pendingDocCount}`;
            items.push({
              id,
              title: `📄 ${pendingDocCount} Barangay Clearance & Indigency Application${pendingDocCount > 1 ? 's' : ''} Pending`,
              time: 'Brgy 174',
              read: isRead(id),
              type: 'document',
              targetPath: '/documents',
            });
          }
          items.push({
            id: 'brgy-lupon-concil',
            title: `⚖️ Lupon Tagapamayapa Mediation Docket & Blotter Active`,
            time: 'Justice',
            read: isRead('brgy-lupon-concil', true),
            type: 'document',
            targetPath: '/documents',
          });
          items.push({
            id: 'brgy-hoa-sync',
            title: `📍 Northridge Grove Phase 2 Subdivision Masterlist Synchronized`,
            time: 'Registry',
            read: isRead('brgy-hoa-sync', true),
            type: 'hoa',
            targetPath: '/masterlist',
          });
          items.push({
            id: 'brgy-disaster-preparedness',
            title: `🚨 Tungkong Mangga Disaster & Peace & Order Taskforce Active`,
            time: 'Standby',
            read: isRead('brgy-disaster-preparedness', true),
            type: 'alert',
            targetPath: '/alerts',
          });
        }

        // ══════════════════════════════════════════════════════════════
        // ROLE 5: SECURITY GUARD (Gate Entry, Visitors, Vehicle Passes)
        // ══════════════════════════════════════════════════════════════
        else if (currentUser.roleName === 'security_guard') {
          const id = `guard-visitors-inside-${insideVisitorCount}`;
          items.push({
            id,
            title: `🛂 ${insideVisitorCount} Visitor${insideVisitorCount !== 1 ? 's' : ''} Currently Inside Phase 2 Premises`,
            time: 'Gate 1 RFID',
            read: isRead(id),
            type: 'visitors',
            targetPath: '/visitors',
          });
          items.push({
            id: 'guard-expected-deliveries',
            title: `🚗 Courier & Delivery Vehicle Passes Scheduled for Today`,
            time: 'Gate Queue',
            read: isRead('guard-expected-deliveries'),
            type: 'visitors',
            targetPath: '/visitors',
          });
          items.push({
            id: 'guard-gate-passes',
            title: `📋 Moving Out & Contractor Entry Passes Logged`,
            time: 'Passes',
            read: isRead('guard-gate-passes', true),
            type: 'document',
            targetPath: '/documents',
          });
          items.push({
            id: 'guard-emergency-hotline',
            title: `🚨 Main Gate SOS Radio & Security Incident Protocol Active`,
            time: '24/7 Gate',
            read: isRead('guard-emergency-hotline', true),
            type: 'alert',
            targetPath: '/alerts',
          });
        }

        // ══════════════════════════════════════════════════════════════
        // ROLE 6: HOMEOWNER / RESIDENT (Personalized Homeowner Account)
        // ══════════════════════════════════════════════════════════════
        else if (currentUser.roleName === 'resident' || currentUser.roleName === 'homeowner') {
          // Resident status
          if (currentUser.status === 'active') {
            items.push({
              id: 'res-account-active',
              title: `🎉 Homeowner Account Verified & Active (${currentUser.registeredBlock || 'Block 7'} ${currentUser.registeredLot || 'Lot 08'})`,
              time: 'Active',
              read: true,
              type: 'hoa',
              targetPath: '/homeowner-portal',
            });
          } else if (currentUser.status === 'pending_approval') {
            const id = 'res-account-pending';
            items.push({
              id,
              title: `⏳ Registration Submitted: HOA Board is reviewing your ID & Proof of Ownership`,
              time: 'Under Review',
              read: isRead(id),
              type: 'hoa',
              targetPath: '/homeowner-portal',
            });
          }

          // Check resident billing
          const userBills = bills.filter((b: any) => 
            b.resident_id === currentUser.id || 
            (b.resident_name && b.resident_name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
          );
          const unpaid = userBills.find((b: any) => b.status === 'unpaid' || b.status === 'overdue');
          if (unpaid) {
            const id = `bill-${unpaid.id}`;
            items.push({
              id,
              title: `💳 ${unpaid.billing_period} Dues Unpaid: ₱${(unpaid.amount + (unpaid.previous_balance || 0)).toLocaleString()}`,
              time: `Due ${unpaid.due_date}`,
              read: isRead(id),
              type: 'billing',
              targetPath: '/billing',
            });
          } else {
            items.push({
              id: 'bill-clear',
              title: `✅ All HOA Association Dues are Fully Paid`,
              time: 'Current',
              read: true,
              type: 'billing',
              targetPath: '/billing',
            });
          }

          // Check resident reservations
          const myReservations = resList.filter((r: any) => r.user_id === currentUser.id || r.reserved_by === currentUser.id);
          if (myReservations.length > 0) {
            const latest = myReservations[0];
            const id = `res-${latest.id}`;
            items.push({
              id,
              title: `📅 Facility Booking: ${latest.title || 'Clubhouse/Court'} (${latest.status})`,
              time: latest.start_time?.split('T')[0] || 'Upcoming',
              read: isRead(id, latest.status === 'approved'),
              type: 'facility',
              targetPath: '/facilities',
            });
          } else {
            items.push({
              id: 'res-facility-info',
              title: `📅 Basketball Court & Clubhouse Reservations Open for Booking`,
              time: 'Amenities',
              read: true,
              type: 'facility',
              targetPath: '/facilities',
            });
          }

          // Resident service requests
          const myRequests = docs.filter((d: any) => d.requester_id === currentUser.id || (d.requester_name && d.requester_name.toLowerCase() === currentUser.fullName.toLowerCase()));
          if (myRequests.length > 0) {
            const latestReq = myRequests[0];
            const id = `req-${latestReq.id}`;
            items.push({
              id,
              title: `📋 Service Request: ${latestReq.title || 'Request'} (${latestReq.status})`,
              time: 'Update',
              read: isRead(id, latestReq.status === 'approved'),
              type: 'document',
              targetPath: '/documents',
            });
          }

          // Household directory link
          items.push({
            id: 'res-household-link',
            title: `👥 Manage Registered Household Members & Vehicle RFID Passes`,
            time: 'Portal',
            read: true,
            type: 'hoa',
            targetPath: '/household',
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

    // Listen to real-time events and poll periodically so notifications ALWAYS update
    window.addEventListener('storage', loadDynamicNotifications);
    window.addEventListener('hoa_storage_update', loadDynamicNotifications);
    window.addEventListener('hoa_notification_read', loadDynamicNotifications);
    const intervalTimer = setInterval(loadDynamicNotifications, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', loadDynamicNotifications);
      window.removeEventListener('hoa_storage_update', loadDynamicNotifications);
      window.removeEventListener('hoa_notification_read', loadDynamicNotifications);
      clearInterval(intervalTimer);
    };
  }, [user, activeAlerts]);

  // Automatically mark notification as read if the user is currently viewing that page
  useEffect(() => {
    if (!user || !location.pathname || notifications.length === 0) return;
    const userKey = getUserKey(user);
    const readIds = getReadNotificationIds(userKey);
    let changed = false;

    notifications.forEach(n => {
      if (n.targetPath && n.targetPath === location.pathname && !n.read) {
        readIds.add(n.id);
        changed = true;
      }
    });

    if (changed) {
      saveReadNotificationIds(userKey, readIds);
      setNotifications(prev => prev.map(item => (readIds.has(item.id) ? { ...item, read: true } : item)));
    }
  }, [location.pathname, user, notifications]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    if (!user) return;
    const userKey = getUserKey(user);
    const readIds = getReadNotificationIds(userKey);
    notifications.forEach(n => readIds.add(n.id));
    saveReadNotificationIds(userKey, readIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleDropdown = () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen && unreadCount > 0) {
      // When opened / viewed, mark all current notifications as read so badge vanishes
      handleMarkAllAsRead();
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (user) {
      const userKey = getUserKey(user);
      const readIds = getReadNotificationIds(userKey);
      readIds.add(item.id);
      saveReadNotificationIds(userKey, readIds);
      setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, read: true } : n)));
    }
    if (item.targetPath) {
      navigate(item.targetPath);
    }
    setShowNotifications(false);
  };

  const handleMarkSingleAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    const userKey = getUserKey(user);
    const readIds = getReadNotificationIds(userKey);
    readIds.add(id);
    saveReadNotificationIds(userKey, readIds);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

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
            onClick={handleToggleDropdown}
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
              width: 340,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              zIndex: 100,
              padding: 6,
              animation: 'fadeInUp 0.15s ease'
            }}>
              <div style={{
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 800,
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Notifications</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllAsRead();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary, #3B82F6)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}
                      title="Mark all notifications as read"
                    >
                      <span>✓ Mark all read</span>
                    </button>
                  )}
                  {unreadCount > 0 ? (
                    <span style={{
                      fontSize: 11,
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontWeight: 700
                    }}>
                      {unreadCount} New
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11,
                      background: 'rgba(22, 163, 74, 0.15)',
                      color: '#16A34A',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontWeight: 700
                    }}>
                      All Caught Up
                    </span>
                  )}
                </div>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                    🔔 You're all caught up! No active notifications.
                  </div>
                ) : (
                  notifications.map(n => {
                    const isUnread = !n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          color: isUnread ? 'var(--text-primary)' : 'var(--text-muted)',
                          background: isUnread ? 'var(--bg-elevated, rgba(59, 130, 246, 0.05))' : 'transparent',
                          transition: 'background 0.15s ease',
                          borderBottom: '1px solid var(--border)'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = isUnread ? 'var(--bg-elevated, rgba(59, 130, 246, 0.05))' : 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0 }}>
                          {isUnread && (
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: '#3B82F6',
                              marginTop: 5,
                              flexShrink: 0,
                              boxShadow: '0 0 6px #3B82F6'
                            }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: isUnread ? 700 : 500, lineHeight: 1.35, wordBreak: 'break-word' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {n.time}
                            </div>
                          </div>
                        </div>

                        {/* Quick Mark as Read button */}
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkSingleAsRead(e, n.id)}
                            title="Mark as read"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: 4,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#16A34A')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
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
