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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
      <Route path="/hoa-manage" element={<ProtectedRoute><HOAAdminManagement /></ProtectedRoute>} />
      <Route path="/tenants" element={<ProtectedRoute><TenantsManagement /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/all-users" element={<ProtectedRoute><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/all-user" element={<ProtectedRoute><AllUsersManagement /></ProtectedRoute>} />
      <Route path="/financial-reports" element={<ProtectedRoute><SearchableFinancialReports /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentRequests /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingLedger /></ProtectedRoute>} />
      <Route path="/facilities" element={<ProtectedRoute><FacilityCalendar /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute><VisitorLogbook /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><EmergencyAlerts /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute><ResidentsPage /></ProtectedRoute>} />
      <Route path="/officers" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />
      <Route path="/hoa-officers" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute><HOAOfficersDirectory /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
