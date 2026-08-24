import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface LoginPrivacyAdvisoryModalProps {
  onAccept?: () => void;
}

export default function LoginPrivacyAdvisoryModal({ onAccept }: LoginPrivacyAdvisoryModalProps) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
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

  const isLight = theme === 'light';

  return (
    <>
      <div
        className="modal-overlay"
        style={{
          zIndex: 10000,
          background: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}
      >
        <div
          className="modal-box"
          style={{
            maxWidth: 680,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: 16,
            background: isLight ? '#FFFFFF' : 'linear-gradient(135deg, #0F172A, #1E293B)',
            border: isLight ? '1px solid #E2E8F0' : '2px solid #22C55E',
            boxShadow: isLight
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(34, 197, 94, 0.15)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(34, 197, 94, 0.25)',
            animation: 'scaleUp 0.25s ease'
          }}
        >
          {/* Header Banner - Pag-IBIG style official advisory bar */}
          <div style={{
            background: 'linear-gradient(135deg, #15803D, #166534)',
            padding: '20px 24px',
            color: '#FFFFFF',
            borderBottom: isLight ? '1px solid #14532D' : '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
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

          {/* Scrollable Advisory Content Body */}
          <div
            style={{
              padding: '22px 26px',
              overflowY: 'auto',
              flex: 1,
              color: isLight ? '#334155' : '#E2E8F0',
              fontSize: 13,
              lineHeight: 1.65,
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            {/* Welcome banner */}
            <div style={{
              background: isLight ? 'rgba(22, 101, 52, 0.08)' : 'rgba(34, 197, 94, 0.12)',
              border: isLight ? '1px solid rgba(22, 101, 52, 0.25)' : '1px solid rgba(34, 197, 94, 0.3)',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 12.5,
              color: isLight ? '#166534' : '#DCFCE7',
              fontWeight: 500
            }}>
              👋 Welcome, <strong>{user?.fullName || 'Resident / Officer'}</strong> ({user?.roleName?.replace(/_/g, ' ').toUpperCase()}). Please review the mandatory Data Privacy Advisory below before accessing your portal dashboard.
            </div>

            <p style={{ margin: 0 }}>
              In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, its Implementing Rules and Regulations (IRR), and the National Privacy Commission (NPC) circulars, <strong>Northridge Grove Phase 2 Homeowners Association, Inc.</strong> is committed to protecting your personal data, privacy, and sensitive identity records.
            </p>

            <div style={{
              background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.7)',
              padding: '16px 18px',
              borderRadius: 12,
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ fontWeight: 800, color: isLight ? '#B45309' : '#FBBF24', fontSize: 13 }}>
                📋 Key Privacy Commitments & Terms of Use:
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: isLight ? '#166534' : '#22C55E', fontWeight: 900 }}>1.</span>
                <div>
                  <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Data Collected:</strong> We process your Personally Identifiable Information (PII) including Legal Name, Contact Numbers, Email, Property Lot/Block, Vehicle Plates, Valid Government ID photos, and Emergency Contacts.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: isLight ? '#166534' : '#22C55E', fontWeight: 900 }}>2.</span>
                <div>
                  <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Purpose of Processing:</strong> Your information is processed exclusively for homeowner verification, automated boom barrier gate passes, monthly HOA dues billing, amenity reservations, and community emergency management.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: isLight ? '#166534' : '#22C55E', fontWeight: 900 }}>3.</span>
                <div>
                  <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Encrypted Security Vault:</strong> All sensitive identity records (Government IDs, Birthdates) are archived in an encrypted database accessible only to authorized Super Admin officers.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: isLight ? '#166534' : '#22C55E', fontWeight: 900 }}>4.</span>
                <div>
                  <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Your Legal Rights:</strong> You retain the right to be informed, access, rectify, erase, or object to the processing of your personal data by contacting our Data Protection Officer at <code>privacy@northridgegroveph2.org</code>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: isLight ? '#166534' : '#22C55E', fontWeight: 900 }}>5.</span>
                <div>
                  <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Account Security Duty:</strong> You agree to safeguard your portal credentials and not disclose your login password to unauthorized third parties.
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowFullPolicy(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLight ? '#2563EB' : '#38BDF8',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                📜 Read Full Comprehensive Data Privacy Policy (R.A. 10173) →
              </button>
            </div>
          </div>

          {/* Interactive Checkbox & Footer Actions */}
          <div style={{
            padding: '18px 24px',
            background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.95)',
            borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            {/* Mandatory Checkbox */}
            <div style={{
              background: agreedCheckbox
                ? (isLight ? '#F0FDF4' : 'rgba(34, 197, 94, 0.15)')
                : (isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)'),
              border: agreedCheckbox
                ? (isLight ? '1.5px solid #22C55E' : '1px solid #22C55E')
                : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.15)'),
              padding: '12px 14px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              transition: 'all 0.2s ease'
            }}>
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
                  color: isLight ? '#0F172A' : '#FFFFFF',
                  cursor: 'pointer',
                  lineHeight: 1.5,
                  fontWeight: 600
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
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                  border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: isLight ? '#475569' : '#CBD5E1',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
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
                  background: agreedCheckbox ? 'linear-gradient(135deg, #15803D, #16A34A)' : (isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)'),
                  border: 'none',
                  color: agreedCheckbox ? '#FFFFFF' : (isLight ? '#94A3B8' : '#64748B'),
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
