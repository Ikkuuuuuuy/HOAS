import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, background: isLight ? 'rgba(15, 23, 42, 0.6)' : 'rgba(2, 6, 23, 0.85)' }}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 720,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          animation: 'scaleUp 0.2s ease',
          background: isLight ? '#FFFFFF' : 'linear-gradient(135deg, #0F172A, #1E293B)',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 16,
          boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.15)' : '0 25px 50px rgba(0,0,0,0.7)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.2)',
              color: isLight ? '#B45309' : '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              🛡️
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: isLight ? '#0F172A' : '#FFFFFF', margin: 0 }}>
                Data Privacy & Protection Policy
              </h2>
              <div style={{ fontSize: 11, color: isLight ? '#64748B' : '#94A3B8' }}>
                Republic Act No. 10173 (Philippine Data Privacy Act of 2012)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#64748B' : '#9CA3AF',
              fontSize: 20,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          color: isLight ? '#334155' : '#E2E8F0',
          fontSize: 13,
          lineHeight: 1.65,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Intro Box */}
          <div style={{
            background: isLight ? '#F1F5F9' : 'rgba(30, 41, 59, 0.7)',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: 14,
            borderRadius: 10,
            fontSize: 12.5
          }}>
            <strong style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Northridge Grove Phase 2 Homeowners Association, Inc. (NRG PH2 HOA INC)</strong> and Barangay 174 are committed to upholding your fundamental right to privacy. This notice governs how we collect, process, store, and protect your <strong>Personally Identifiable Information (PII)</strong>, <strong>Sensitive Personal Information (SPI)</strong>, and <strong>Emergency/Health Records</strong>.
          </div>

          {/* Section 1 */}
          <div>
            <h4 style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 13.5, fontWeight: 800, margin: '0 0 6px 0' }}>
              1. Information We Collect
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              <li><strong>Personally Identifiable Information (PII):</strong> Full legal name, subdivision Block & Lot address, contact number, email address, vehicle plate numbers.</li>
              <li><strong>Sensitive Personal Information (SPI):</strong> Date of birth, age, sex/gender, civil status, government ID serial numbers, and uploaded photographic copies of valid government IDs.</li>
              <li><strong>Emergency & Health Data (PHI):</strong> Senior citizen/PWD assistance flags, emergency medical contacts, and disaster response notes.</li>
              <li><strong>Visitor & Gate Pass Records:</strong> Visitor full names, vehicle plate numbers, entry/exit timestamps, and destination addresses.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h4 style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 13.5, fontWeight: 800, margin: '0 0 6px 0' }}>
              2. Purpose of Collection & Processing
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              We collect your data solely for legitimate community administration, including:
            </p>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              <li>Cross-referencing homeowner credentials against the official subdivision masterlist for instant, secure account activation.</li>
              <li>Physical security, perimeter patrol monitoring, and automated QR gate pass validation.</li>
              <li>Official monthly dues billing statements, payment receipts, and facility reservations.</li>
              <li>Disaster preparedness, emergency response, and Barangay census coordination.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h4 style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 13.5, fontWeight: 800, margin: '0 0 6px 0' }}>
              3. Super Admin Encrypted Security Vault & Access Control
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              Sensitive identity documents (such as uploaded Government ID photos and raw birth dates) are locked within an <strong>Encrypted Security Vault</strong>. Only authorized Super Administrators with Master Clearance PINs can view these records. General staff and security guards cannot access or download your raw ID images.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h4 style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 13.5, fontWeight: 800, margin: '0 0 6px 0' }}>
              4. Data Retention & Erasure
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              <li><strong>Homeowner & Resident Records:</strong> Retained for the duration of property ownership or active tenancy.</li>
              <li><strong>Visitor Gate Logs:</strong> Temporarily archived for community security and automatically purged on a scheduled cycle.</li>
              <li><strong>Account Deactivation:</strong> Upon formal notice of property sale or turnover, personal records will be securely archived or deleted in accordance with legal and tax audit requirements.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h4 style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 13.5, fontWeight: 800, margin: '0 0 6px 0' }}>
              5. Your Rights as a Data Subject (R.A. 10173)
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              Under the Data Privacy Act of 2012, you possess the right to:
            </p>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: 12.5, color: isLight ? '#334155' : '#CBD5E1' }}>
              <li><strong>Be Informed:</strong> Know how and why your data is collected and processed.</li>
              <li><strong>Access:</strong> Request a copy of your personal data stored in the portal.</li>
              <li><strong>Rectify / Correct:</strong> Update inaccurate or outdated information via your profile or HOA office.</li>
              <li><strong>Object or Block:</strong> Object to processing or request deletion of data processed without legal basis.</li>
            </ul>
          </div>

          {/* Section 6: Contact */}
          <div style={{
            background: isLight ? '#FEF3C7' : 'rgba(15, 23, 42, 0.6)',
            border: isLight ? '1px solid #FDE68A' : '1px solid rgba(245, 158, 11, 0.2)',
            padding: 12,
            borderRadius: 10,
            fontSize: 12,
            color: isLight ? '#78350F' : '#E2E8F0'
          }}>
            <div style={{ fontWeight: 800, color: isLight ? '#92400E' : '#FBBF24', marginBottom: 2 }}>
              📮 Data Protection Officer (DPO) Contact
            </div>
            <div>
              For privacy inquiries, data access requests, or corrections, contact our Data Protection Officer at:
              <br />
              <strong>Email:</strong> <code>privacy@northridgegroveph2.org</code> • <strong>Office:</strong> NRG PH2 Clubhouse Administration
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.9)'
        }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 800,
              background: '#166534',
              border: 'none',
              color: '#FFFFFF'
            }}
          >
            ✓ I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
