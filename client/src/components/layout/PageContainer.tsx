import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import EmergencyBanner from '../ui/EmergencyBanner';
import ToastContainer from '../ui/ToastContainer';
import PrivacyPolicyModal from '../common/PrivacyPolicyModal';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <EmergencyBanner />
        <Navbar title={title} subtitle={subtitle} />
        <div className="page-content" style={{ flex: 1 }}>
          {children}
        </div>

        {/* Global Data Privacy Footer */}
        <footer className="global-app-footer">
          <div>
            © {new Date().getFullYear()} Northridge Grove Phase 2 HOA Inc. & Barangay 174. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="privacy-footer-link"
            >
              <span>🛡️</span> Data Privacy & Protection Policy (R.A. 10173)
            </button>
            <span>•</span>
            <span>Super Admin Encrypted Vault Protected</span>
          </div>
        </footer>
      </main>

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <ToastContainer />
    </div>
  );
}
