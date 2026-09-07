import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isLight = theme === 'light';

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 600);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpCode.trim() !== '123456') {
      setError('Invalid verification code. Please enter simulation code 123456.');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Your account password has been updated securely. You can now sign in to Northridge Grove Phase 2 Portal.');
      setStep(4);
    }, 800);
  };

  return (
    <div className={`login-page ${theme}`}>
      
      {/* ── TOP HEADER WITH BACK TO HOME BUTTON & THEME TOGGLE ── */}
      <header className="auth-top-header">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', flexShrink: 0 }}>
            <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA INC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span className="auth-header-title">
            NRG PH2 HOA INC
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
              color: isLight ? '#1E293B' : '#FFFFFF',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link
            to="/"
            className="auth-back-btn"
          >
            ← Back to Public Website
          </Link>
        </div>
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
              <h2 className="login-brand-name" style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0 }}>Password Recovery</h2>
              <p className="login-brand-tagline" style={{ fontSize: '0.84rem', fontWeight: 700, margin: '2px 0 0 0' }}>NRG PH2 HOA INC • Phase 2</p>
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
                <label className="form-label">
                  Registered Email or Mobile Number <span className="req-star">*</span>
                </label>
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

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: isLight ? '#475569' : '#9CA3AF' }}>
                Remember your password? <Link to="/login" style={{ color: isLight ? '#DC2626' : '#F87171', fontWeight: 700, textDecoration: 'underline' }}>Back to Login</Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="login-form">
              <div style={{
                background: isLight ? '#FEF2F2' : 'rgba(220,38,38,0.15)',
                border: isLight ? '1px solid #FECACA' : '1px solid rgba(220,38,38,0.4)',
                padding: 14, borderRadius: 8, marginBottom: 16
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? '#B91C1C' : '#F87171' }}>Code Sent to {emailOrPhone}</div>
                <div style={{ fontSize: 12, color: isLight ? '#475569' : '#E5E7EB', marginTop: 4 }}>
                  Enter simulation code <code style={{ background: isLight ? '#FEE2E2' : 'rgba(255,255,255,0.1)', color: isLight ? '#B91C1C' : '#FFFFFF', padding: '2px 6px', borderRadius: 4 }}>123456</code> to proceed.
                </div>
              </div>

              <div>
                <label className="form-label">
                  6-Digit Verification Code <span className="req-star">*</span>
                </label>
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
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-btn-back"
                  style={{ flex: 1 }}
                >
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
                <label className="form-label">
                  New Password <span className="req-star">*</span>
                </label>
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
                <label className="form-label">
                  Confirm New Password <span className="req-star">*</span>
                </label>
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
              <h3 style={{ fontSize: 20, fontWeight: 800, color: isLight ? '#0F172A' : '#FFF', marginBottom: 8 }}>Password Updated!</h3>
              <p style={{ fontSize: 13, color: isLight ? '#475569' : '#9CA3AF', marginBottom: 24 }}>{successMsg}</p>

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
