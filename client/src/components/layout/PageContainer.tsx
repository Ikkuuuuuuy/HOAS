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
        <footer style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 11.5,
          color: 'var(--text-muted)',
          background: 'rgba(15, 23, 42, 0.4)',
          marginTop: 'auto'
        }}>
          <div>
            © {new Date().getFullYear()} Northridge Grove Phase 2 HOA Inc. & Barangay 174. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                cursor: 'pointer',
                fontSize: 11.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'underline'
              }}
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
