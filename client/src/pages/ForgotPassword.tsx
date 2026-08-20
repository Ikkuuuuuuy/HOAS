import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailOrPhone) {
      setError('Please enter your registered email or phone number');
      return;
    }
    setStep(2);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpCode !== '123456' && otpCode.length !== 6) {
      setError('Invalid 6-digit verification code');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Your password has been successfully reset! You can now log in with your new password.');
      setStep(4);
    }, 1000);
  };

  return (
    <div className="login-page">
      
      {/* ── TOP HEADER WITH BACK TO HOME BUTTON ── */}
      <header style={{ width: '100%', position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 32px', zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 17, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B' }}>
            <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA INC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
            NRG PH2 HOA INC
          </span>
        </Link>

        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 8,
            background: 'rgba(255,255,255,0.1)', color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.25)',
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#166534';
            e.currentTarget.style.borderColor = '#166534';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
        >
          ← Back to Public Website
        </Link>
      </header>

      <div className="login-bg">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
      </div>

      <div className="login-container" style={{ maxWidth: 520, gridTemplateColumns: '1fr', marginTop: 80 }}>
        <div className="login-card">
          
          {/* Brand Header */}
          <div className="login-brand mb-6" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.3)', flexShrink: 0 }}>
              <img src="/nrg-ph2-logo.png" alt="NRG PH2 Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 className="login-brand-name" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Password Recovery</h2>
              <p className="login-brand-tagline" style={{ fontSize: '0.82rem', color: '#F59E0B' }}>NRG PH2 HOA INC • Phase 2</p>
            </div>
          </div>

          {error && (
            <div className="login-error mb-4">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email/Phone */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="login-form">
              <div>
                <label className="form-label">Registered Email or Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="resident@palmera-hoa.com or 0917XXXXXXX"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: '#DC2626', color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, marginTop: 8,
                  boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                }}
              >
                📩 Send Verification Code
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#9CA3AF' }}>
                Remember your password? <Link to="/login" style={{ color: '#F87171', fontWeight: 700, textDecoration: 'underline' }}>Back to Login</Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="login-form">
              <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F87171' }}>Code Sent to {emailOrPhone}</div>
                <div style={{ fontSize: 12, color: '#E5E7EB', marginTop: 4 }}>Enter simulation code <code>123456</code> to proceed.</div>
              </div>

              <div>
                <label className="form-label">6-Digit Verification Code</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 800 }}
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Verify Code →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: '#DC2626', color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, marginTop: 8,
                }}
              >
                {isLoading ? 'Updating Password...' : '🔒 Reset & Update Password'}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFF', marginBottom: 8 }}>Password Updated!</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>{successMsg}</p>

              <button
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: '#DC2626', color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700,
                }}
                onClick={() => navigate('/login')}
              >
                🔑 Sign In Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
