import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface LoginPrivacyAdvisoryModalProps {
  onAccept?: () => void;
}

export default function LoginPrivacyAdvisoryModal({ onAccept }: LoginPrivacyAdvisoryModalProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [agreedCheckbox, setAgreedCheckbox] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const isAccepted = window.sessionStorage.getItem(`hoa_privacy_advisory_${user.email}`);
        if (isAccepted !== 'accepted') {
          // Open popup advisory for this login session
          setIsOpen(true);
        }
      }
    } catch {
      // Fallback
    }
  }, [user]);

  const handleAccept = () => {
    if (!user) return;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`hoa_privacy_advisory_${user.email}`, 'accepted');
      }
    } catch { /* storage fallback */ }

    setIsOpen(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    logout();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="privacy-advisory-overlay">
        <div className="privacy-advisory-box">
          {/* Header Banner */}
          <div className="privacy-advisory-header">
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#86EFAC',
                textTransform: 'uppercase'
              }}>
                Republic of the Philippines • R.A. 10173
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '2px 0 0 0', color: '#FFFFFF' }}>
                DATA PRIVACY ADVISORY & CONSENT NOTICE
              </h2>
              <div style={{ fontSize: 12, color: '#DCFCE7', opacity: 0.95 }}>
                Northridge Grove Phase 2 HOA Inc. Portal Security Protocol
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="privacy-advisory-body">
            {/* Welcome banner */}
            <div className="privacy-advisory-welcome">
              👋 Welcome, <strong>{user?.fullName || 'Resident / Officer'}</strong> ({String(user?.roleName || 'User').replace(/_/g, ' ').toUpperCase()}). Please review the mandatory Data Privacy Advisory below before accessing your portal dashboard.
            </div>

            <p style={{ margin: 0, lineHeight: 1.6 }}>
              In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, its Implementing Rules and Regulations (IRR), and the National Privacy Commission (NPC) circulars, <strong>Northridge Grove Phase 2 Homeowners Association, Inc.</strong> is committed to protecting your personal data, privacy, and sensitive identity records.
            </p>

            <div className="privacy-advisory-card">
              <div style={{ fontWeight: 800, fontSize: 13 }}>
                📋 Key Privacy Commitments & Terms of Use:
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', fontWeight: 900 }}>1.</span>
                <div>
                  <strong>Data Collected:</strong> We process your Personally Identifiable Information (PII) including Legal Name, Contact Numbers, Email, Property Lot/Block, Vehicle Plates, Valid Government ID photos, and Emergency Contacts.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', fontWeight: 900 }}>2.</span>
                <div>
                  <strong>Purpose of Processing:</strong> Your information is processed exclusively for homeowner verification, automated boom barrier gate passes, monthly HOA dues billing, amenity reservations, and community emergency management.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', fontWeight: 900 }}>3.</span>
                <div>
                  <strong>Encrypted Security Vault:</strong> All sensitive identity records (Government IDs, Birthdates) are archived in an encrypted database accessible only to authorized Super Admin officers.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', fontWeight: 900 }}>4.</span>
                <div>
                  <strong>Your Legal Rights:</strong> You retain the right to be informed, access, rectify, erase, or object to the processing of your personal data by contacting our Data Protection Officer at <code>privacy@northridgegroveph2.org</code>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', fontWeight: 900 }}>5.</span>
                <div>
                  <strong>Account Security Duty:</strong> You agree to safeguard your portal credentials and not disclose your login password to unauthorized third parties.
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <button
                type="button"
                onClick={() => setShowFullPolicy(true)}
                className="privacy-footer-link"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                📜 Read Full Comprehensive Data Privacy Policy (R.A. 10173) →
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="privacy-advisory-footer">
            {/* Checkbox Card */}
            <div className="privacy-advisory-checkbox-card">
              <input
                type="checkbox"
                id="login-privacy-consent-checkbox"
                checked={agreedCheckbox}
                onChange={e => setAgreedCheckbox(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#16A34A' }}
              />
              <label
                htmlFor="login-privacy-consent-checkbox"
                style={{
                  fontSize: 12,
                  cursor: 'pointer',
                  lineHeight: 1.5
                }}
              >
                I hereby certify that I have read, understood, and voluntarily agree to the collection, processing, and protection of my personal data under the <strong>Philippine Data Privacy Act of 2012 (R.A. 10173)</strong>.
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDecline}
                className="privacy-advisory-btn-decline"
              >
                ✕ Decline & Logout
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={!agreedCheckbox}
                style={{
                  padding: '12px 28px',
                  borderRadius: 8,
                  background: agreedCheckbox ? 'linear-gradient(135deg, #15803D, #16A34A)' : '#E2E8F0',
                  border: 'none',
                  color: agreedCheckbox ? '#FFFFFF' : '#94A3B8',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: agreedCheckbox ? 'pointer' : 'not-allowed',
                  boxShadow: agreedCheckbox ? '0 4px 18px rgba(34, 197, 94, 0.45)' : 'none',
                  opacity: agreedCheckbox ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>✓</span>
                <span>I Agree & Proceed to Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={showFullPolicy}
        onClose={() => setShowFullPolicy(false)}
      />
    </>
  );
}
