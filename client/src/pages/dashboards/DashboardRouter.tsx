import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import BarangayDashboard from './BarangayDashboard';
import HOAAdminDashboard from './HOAAdminDashboard';
import SecurityDashboard from './SecurityDashboard';
import ResidentDashboard from './ResidentDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.roleName) {
    case 'super_admin': return <SuperAdminDashboard />;
    case 'hoa_admin': return <HOAAdminDashboard />;
    case 'admin_staff': return <HOAAdminDashboard />;
    case 'security_guard': return <SecurityDashboard />;
    case 'resident': return <ResidentDashboard />;
    default: return <HOAAdminDashboard />;
  }
}
