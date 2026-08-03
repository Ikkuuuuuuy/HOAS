import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import EmergencyBanner from '../ui/EmergencyBanner';
import ToastContainer from '../ui/ToastContainer';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <EmergencyBanner />
        <Navbar title={title} subtitle={subtitle} />
        <div className="page-content">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
