import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function PendingApprovalWelcomePage() {
  const { user, logout } = useAuth();
  const { info, success } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const isRejected = user?.status === 'rejected';
  const rejectionReason = (user as any)?.rejectionReason || 'Uploaded document is unreadable or property address requires additional verification with developer turnover records.';

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      if (user?.status === 'active') {
        success('Account Approved!', 'Your account has been activated! Welcome to the Homeowner Portal.');
        navigate('/homeowner-portal');
      } else {
        info('Status: Under Review', 'Your registration is still pending verification by the HOA Board.');
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #111827 0%, #030712 100%)',
      color: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>

      {/* ── TOP HEADER ── */}
      <header style={{
        padding: '16px 32px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #F59E0B' }}>
            <img src="/nrg-ph2-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#FFF' }}>NRG PH2 HOA INC</div>
            <div style={{ fontSize: 11, color: '#F59E0B' }}>Northridge Grove Phase 2 • Tungkong Mangga</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            🏠 Public Website
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.15)',
              color: '#FCA5A5',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{
          maxWidth: 680,
          width: '100%',
          background: 'rgba(17, 24, 39, 0.9)',
          border: isRejected ? '1.5px solid #EF4444' : '1.5px solid #F59E0B',
          borderRadius: 16,
          padding: '36px 28px',
          boxShadow: isRejected ? '0 0 30px rgba(239, 68, 68, 0.2)' : '0 0 30px rgba(245, 158, 11, 0.2)',
          animation: 'fadeInUp 0.35s ease'
        }}>

          {/* Status Icon & Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: isRejected ? '2px solid #EF4444' : '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              margin: '0 auto 16px'
            }}>
              {isRejected ? '❌' : '⏳'}
            </div>

            <span style={{
              background: isRejected ? '#DC2626' : '#D97706',
              color: '#FFF',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              {isRejected ? 'APPLICATION DECLINED' : 'APPLICATION UNDER REVIEW'}
            </span>

            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#FFF', margin: '14px 0 6px 0' }}>
              Welcome, {user?.fullName || 'Homeowner Applicant'}!
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              Registered Email: <strong style={{ color: '#E5E7EB' }}>{user?.email}</strong>
            </p>
          </div>

          {/* Detailed Status Explanation Box */}
          {isRejected ? (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: '18px 20px',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F87171', marginBottom: 6 }}>
                ⚠️ Rejection Notice & Official Board Feedback
              </div>
              <div style={{ fontSize: 13, color: '#FCA5A5', lineHeight: 1.6, marginBottom: 12 }}>
                {rejectionReason}
              </div>
              <div style={{ fontSize: 12, color: '#D1D5DB' }}>
                ✉️ An official notification email was sent to <strong>{user?.email}</strong> with details on how to appeal or submit corrected documents.
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 12,
              padding: '18px 20px',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FBBF24', marginBottom: 6 }}>
                🛡️ Verification Notice & Security Policy
              </div>
              <div style={{ fontSize: 13, color: '#E5E7EB', lineHeight: 1.6, marginBottom: 12 }}>
                Your account application is currently being cross-referenced with the <strong>NRG PH2 HOA Master Property Records</strong>.
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
                🔒 <strong>Why is portal access locked?</strong> To protect homeowners' private billing ledgers, basketball court reservations, and vehicle gate access, all unlisted applicants require 1-click verification from the HOA Board before access is granted.
              </div>
            </div>
          )}

          {/* Public Resources You Can Access While Waiting */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              Available Community Resources:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Link
                to="/"
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: 24 }}>🏠</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Public Homepage</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Amenities & GIS Map</div>
                </div>
              </Link>

              <Link
                to="/officers"
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: 24 }}>🏛️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>HOA Officers</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Board & Block Leaders</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!isRejected ? (
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isChecking}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #166534, #15803D)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: isChecking ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>🔄</span>
                <span>{isChecking ? 'Checking Board Verification Status...' : 'Check / Refresh Verification Status'}</span>
              </button>
            ) : (
              <Link
                to="/register"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  borderRadius: 8,
                  background: '#DC2626',
                  color: '#FFF',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: '0 4px 14px rgba(220,38,38,0.3)'
                }}
              >
                📝 Submit New Registration with Updated Proof
              </Link>
            )}

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign out of this session
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: '#6B7280', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        Northridge Grove Phase 2 Homeowners Association, Inc. • DHSUD / HLURB Reg. No. 04-1928 • B7 Maagap St, Tungkong Mangga, CSJDM
      </footer>

    </div>
  );
}
