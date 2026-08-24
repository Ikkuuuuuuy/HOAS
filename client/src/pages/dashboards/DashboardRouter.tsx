import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import BarangayDashboard from './BarangayDashboard';
import HOAAdminDashboard from './HOAAdminDashboard';
import SecurityDashboard from './SecurityDashboard';
import ResidentDashboard from './ResidentDashboard';
import PendingApprovalWelcomePage from '../homeowner/PendingApprovalWelcomePage';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  // Intercept unverified / pending / rejected applicants
  if (user.status === 'pending_approval' || user.status === 'pending' || user.status === 'rejected') {
    return <PendingApprovalWelcomePage />;
  }

  switch (user.roleName) {
    case 'super_admin': return <SuperAdminDashboard />;
    case 'barangay_official': return <BarangayDashboard />;
    case 'hoa_admin': return <HOAAdminDashboard />;
    case 'admin_staff': return <HOAAdminDashboard />;
    case 'security_guard': return <SecurityDashboard />;
    case 'resident':
    case 'homeowner': return <ResidentDashboard />;
    default: return <HOAAdminDashboard />;
  }
}
