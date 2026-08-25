import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLandingPage from './pages/PublicLandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import HomeownerPortal from './pages/homeowner/HomeownerPortal';
import HOAAdminManagement from './pages/admin/HOAAdminManagement';
import TenantsManagement from './pages/admin/TenantsManagement';
import AllUsersManagement from './pages/admin/AllUsersManagement';
import SearchableFinancialReports from './pages/financials/SearchableFinancialReports';
import DocumentRequests from './pages/documents/DocumentRequests';
import BillingLedger from './pages/billing/BillingLedger';
import FacilityCalendar from './pages/facilities/FacilityCalendar';
import VisitorLogbook from './pages/visitors/VisitorLogbook';
import EmergencyAlerts from './pages/alerts/EmergencyAlerts';
import ResidentsPage from './pages/residents/ResidentsPage';
import HouseholdMembers from './pages/household/HouseholdMembers';
import CalendarEvents from './pages/events/CalendarEvents';
import HOAOfficersDirectory from './pages/admin/HOAOfficersDirectory';
import HOAMasterlistManagement from './pages/admin/HOAMasterlistManagement';
import UserProfileSettings from './pages/profile/UserProfileSettings';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
          <p className="text-muted" style={{ marginTop: 'var(--space-4)' }}>Loading portal...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(r => {
      if (r === 'resident' || r === 'homeowner') {
        return user.roleName === 'resident' || user.roleName === 'homeowner';
      }
      return user.roleName === r;
    });

    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/homeowner-portal" element={<ProtectedRoute><HomeownerPortal /></ProtectedRoute>} />
      <Route path="/household" element={<ProtectedRoute><HouseholdMembers /></ProtectedRoute>} />
      <Route path="/household-members" element={<ProtectedRoute><HouseholdMembers /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><CalendarEvents /></ProtectedRoute>} />
      <Route path="/calendar-events" element={<ProtectedRoute><CalendarEvents /></ProtectedRoute>} />
      <Route path="/hoa-manage" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff']}><HOAAdminManagement /></ProtectedRoute>} />
      <Route path="/tenants" element={<ProtectedRoute allowedRoles={['super_admin']}><TenantsManagement /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin']}><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/all-users" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin']}><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/all-user" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin']}><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/financial-reports" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff']}><SearchableFinancialReports /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentRequests /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingLedger /></ProtectedRoute>} />
      <Route path="/facilities" element={<ProtectedRoute><FacilityCalendar /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff', 'security_guard']}><VisitorLogbook /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><EmergencyAlerts /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff']}><ResidentsPage /></ProtectedRoute>} />
      <Route path="/officers" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />
      <Route path="/hoa-officers" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />
      <Route path="/masterlist" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff']}><HOAMasterlistManagement /></ProtectedRoute>} />
      <Route path="/hoa-masterlist" element={<ProtectedRoute allowedRoles={['super_admin', 'hoa_admin', 'admin_staff']}><HOAMasterlistManagement /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfileSettings /></ProtectedRoute>} />
      <Route path="/account-settings" element={<ProtectedRoute><UserProfileSettings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
