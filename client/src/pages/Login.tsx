import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: '⚙️ Super Admin', email: 'superadmin@portal.gov.ph', password: 'Admin@1234', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)' },
  { label: '🏢 Main Admin', email: 'treasurer@palmera-hoa.com', password: 'HOAAdmin@1234', color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' },
  { label: '🛡 Admin Staff', email: 'staff@palmera-hoa.com', password: 'Staff@1234', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' },
  { label: '👮 Security Guard', email: 'guard@palmera-hoa.com', password: 'Guard@1234', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' },
  { label: '🏠 Homeowner', email: 'resident@palmera-hoa.com', password: 'Resident@1234', color: '#6EE7B7', bg: 'rgba(110, 231, 183, 0.15)' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setIsLoading(true);
    setError('');

    try {
      await login(acc.email, acc.password);
      if (acc.email === 'resident@palmera-hoa.com') {
        navigate('/homeowner-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* ── TOP HEADER WITH CLEAR BACK TO HOME BUTTON ── */}
      <header style={{ width: '100%', position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 32px', zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 17, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px' }}>BRIA</span>
            <span style={{ background: '#166534', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>HOMES</span>
          </div>
          <span style={{ color: '#E5E7EB', fontWeight: 600, fontSize: '14px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 10 }}>
            Northridge Grove HOA
          </span>
        </Link>

        {/* ALWAYS VISIBLE RETURN TO PUBLIC WEBSITE BUTTON */}
        <Link
          to="/"
          id="btn-back-to-home"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 8,
            background: 'rgba(255,255,255,0.1)', color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.25)',
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#DC2626';
            e.currentTarget.style.borderColor = '#DC2626';
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
        <div className="mesh-orb orb-3" />
      </div>

      <div className="login-container" style={{ marginTop: 60 }}>
        
        {/* Left Side Branding */}
        <div className="login-left">
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#F87171', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20 }}>
            📍 BRIA HOMES • BULACAN (3023)
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 16 }}>
            Northridge Grove <br />
            <span style={{ color: '#6EE7B7', fontWeight: 400, fontStyle: 'italic' }}>Homeowners Association</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#9CA3AF', lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
            Sign in to access your automated financial history, real-time community notices, facility reservations, gate visitor passes, and Barangay Tungkong Mangga services.
          </p>

          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              📍 OFFICIAL COMMUNITY ADDRESS
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F3F4F6' }}>
              Northridge Grove, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines, 3023
            </div>
          </div>
        </div>

        {/* Right Side High Contrast Login Card */}
        <div className="login-card">
          <div className="login-brand mb-6">
            <div className="login-brand-icon" style={{ background: '#DC2626', color: '#FFF' }}>
              🏠
            </div>
            <div>
              <h2 className="login-brand-name" style={{ fontSize: '1.3rem' }}>BRIA Northridge Grove</h2>
              <p className="login-brand-tagline">Sign in to your account</p>
            </div>
          </div>

          {error && (
            <div className="login-error mb-4">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="resident@palmera-hoa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#F87171', fontWeight: 700, textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '14px', borderRadius: 8,
                background: '#DC2626', color: '#FFFFFF',
                border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, marginTop: 8,
                boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {isLoading ? 'Signing in...' : '🔑 Sign In to Portal'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#9CA3AF' }}>
              New Homeowner in Northridge Grove?{' '}
              <Link to="/register" style={{ color: '#6EE7B7', fontWeight: 700, textDecoration: 'underline' }}>
                Register Account Here
              </Link>
            </div>
          </form>

          {/* Quick Demo Sign-In Buttons */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              ⚡ 1-Click Quick Demo Sign In:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: acc.bg, border: `1px solid ${acc.color}`,
                    color: acc.color, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
