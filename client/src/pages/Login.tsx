import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const STAFF_ACCOUNTS = [
  { label: '⚙️ Super Admin', email: 'superadmin@portal.gov.ph', password: 'Admin@1234', role: 'super_admin', darkColor: '#A78BFA', darkBg: 'rgba(167, 139, 250, 0.15)', lightColor: '#6D28D9', lightBg: '#F5F3FF', lightBorder: '#C4B5FD' },
  { label: '🏛️ Barangay Captain', email: 'kapitan@brgy174.gov.ph', password: 'Official@1234', role: 'barangay_official', darkColor: '#38BDF8', darkBg: 'rgba(56, 189, 248, 0.15)', lightColor: '#0284C7', lightBg: '#F0F9FF', lightBorder: '#BAE6FD' },
  { label: '🏢 HOA President', email: 'treasurer@palmera-hoa.com', password: 'HOAAdmin@1234', role: 'hoa_admin', darkColor: '#F87171', darkBg: 'rgba(248, 113, 113, 0.15)', lightColor: '#DC2626', lightBg: '#FEF2F2', lightBorder: '#FECACA' },
  { label: '🛡 Admin Staff', email: 'staff@palmera-hoa.com', password: 'Staff@1234', role: 'admin_staff', darkColor: '#60A5FA', darkBg: 'rgba(96, 165, 250, 0.15)', lightColor: '#2563EB', lightBg: '#EFF6FF', lightBorder: '#BFDBFE' },
  { label: '👮 Security Guard', email: 'guard@palmera-hoa.com', password: 'Guard@1234', role: 'security_guard', darkColor: '#FBBF24', darkBg: 'rgba(251, 191, 36, 0.15)', lightColor: '#B45309', lightBg: '#FFFBEB', lightBorder: '#FDE68A' },
  { label: '⏳ Pending Applicant', email: 'pending.applicant@palmera-hoa.com', password: 'Pass123!', role: 'resident', darkColor: '#FDE047', darkBg: 'rgba(253, 224, 71, 0.15)', lightColor: '#A16207', lightBg: '#FEFCE8', lightBorder: '#FEF08A' },
];

export const TEST_HOMEOWNERS = [
  { id: 'usr-res-1', name: 'Ricardo Dalisay', email: 'resident@palmera-hoa.com', block: 'Blk 7 Lot 08', status: 'unpaid', dues: '₱3,000 Due' },
  { id: 'usr-res-2', name: 'Elena Adarna', email: 'resident2@palmera-hoa.com', block: 'Blk 3 Lot 08', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-3', name: 'Ramon Revilla Sr.', email: 'ramon.revilla@nrgph2.org', block: 'Blk 1 Lot 04', status: 'overdue', dues: '₱3,000 Overdue' },
  { id: 'usr-res-4', name: 'Vilma Santos-Recto', email: 'vilma.santos@nrgph2.org', block: 'Blk 2 Lot 11', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-5', name: 'Fernando Poe Jr.', email: 'applicant@palmera-hoa.com', block: 'Blk 4 Lot 02', status: 'pending', dues: 'Pending Approval' },
  { id: 'usr-res-6', name: 'Nora Aunor', email: 'nora.aunor@nrgph2.org', block: 'Blk 5 Lot 09', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-7', name: 'Sharon Cuneta-Pangilinan', email: 'sharon.cuneta@nrgph2.org', block: 'Blk 6 Lot 14', status: 'unpaid', dues: '₱3,000 Due' },
  { id: 'usr-res-8', name: 'Robin Padilla', email: 'robin.padilla@nrgph2.org', block: 'Blk 7 Lot 01', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-9', name: 'Coco Martin', email: 'coco.martin@nrgph2.org', block: 'Blk 1 Lot 15', status: 'unpaid', dues: '₱3,000 Due' },
  { id: 'usr-res-10', name: 'Dingdong Dantes', email: 'dingdong.dantes@nrgph2.org', block: 'Blk 2 Lot 03', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-11', name: 'Marian Rivera-Dantes', email: 'marian.rivera@nrgph2.org', block: 'Blk 3 Lot 05', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-12', name: 'Bea Alonzo', email: 'bea.alonzo@nrgph2.org', block: 'Blk 4 Lot 10', status: 'overdue', dues: '₱3,000 Overdue' },
  { id: 'usr-res-13', name: 'John Lloyd Cruz', email: 'johnlloyd.cruz@nrgph2.org', block: 'Blk 5 Lot 02', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-14', name: 'Piolo Pascual', email: 'piolo.pascual@nrgph2.org', block: 'Blk 6 Lot 07', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-15', name: 'Jericho Rosales', email: 'jericho.rosales@nrgph2.org', block: 'Blk 7 Lot 12', status: 'unpaid', dues: '₱3,000 Due' },
  { id: 'usr-res-16', name: 'Kathryn Bernardo', email: 'kathryn.bernardo@nrgph2.org', block: 'Blk 1 Lot 09', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-17', name: 'Daniel Padilla', email: 'daniel.padilla@nrgph2.org', block: 'Blk 2 Lot 18', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-18', name: 'Liza Soberano', email: 'liza.soberano@nrgph2.org', block: 'Blk 3 Lot 14', status: 'unpaid', dues: '₱3,000 Due' },
  { id: 'usr-res-19', name: 'Enrique Gil', email: 'enrique.gil@nrgph2.org', block: 'Blk 4 Lot 07', status: 'paid', dues: '₱0 (Paid)' },
  { id: 'usr-res-20', name: 'Alden Richards', email: 'alden.richards@nrgph2.org', block: 'Blk 5 Lot 20', status: 'unpaid', dues: '₱3,000 Due' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHomeownerModal, setShowHomeownerModal] = useState(false);
  const [searchHomeowner, setSearchHomeowner] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isLight = theme === 'light';

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

  const handleQuickLogin = async (targetEmail: string, targetPass: string, isResident = false) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setIsLoading(true);
    setError('');
    setShowHomeownerModal(false);

    try {
      await login(targetEmail, targetPass);
      if (isResident) {
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

  const filteredHomeowners = TEST_HOMEOWNERS.filter(h =>
    h.name.toLowerCase().includes(searchHomeowner.toLowerCase()) ||
    h.block.toLowerCase().includes(searchHomeowner.toLowerCase()) ||
    h.email.toLowerCase().includes(searchHomeowner.toLowerCase()) ||
    h.status.toLowerCase().includes(searchHomeowner.toLowerCase())
  );

  return (
    <div className="login-page">
      
      {/* ── TOP HEADER WITH CLEAR BACK TO HOME BUTTON & THEME TOGGLE ── */}
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
            id="btn-back-to-home"
            className="auth-back-btn"
          >
            ← Back to Public Website
          </Link>
        </div>
      </header>

      <div className="login-bg">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
        <div className="mesh-orb orb-3" />
      </div>

      <div className="login-container" style={{ marginTop: 60 }}>
        
        {/* Left Side Branding */}
        <div className="login-left">
          <div className="auth-brand-badge">
            <img src="/nrg-ph2-logo.png" alt="Logo Seal" style={{ width: 18, height: 18, borderRadius: '50%' }} />
            📍 NRG PH2 HOA INC • PHASE 2 (2026-2027)
          </div>

          <h1 className="auth-heading">
            NRG PH2 HOA INC <br />
            <span className="auth-heading-accent">Northridge Grove Phase 2</span>
          </h1>

          <p className="auth-subtext">
            Sign in to access your Phase 2 automated financial ledgers, community notices, facility bookings, RFID gate visitor passes, and Barangay Tungkong Mangga services.
          </p>

          <div className="auth-address-card">
            <div className="auth-address-label">
              📍 OFFICIAL PHASE 2 COMMUNITY ADDRESS
            </div>
            <div className="auth-address-val">
              Northridge Grove Phase 2, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines, 3023
            </div>
          </div>

          {/* Quick Notice about 20 Seeded Homeowners */}
          <div className="auth-seeded-card">
            <div className="auth-seeded-title">
              <span>👥</span> 20 Pre-Configured Homeowners Seeded
            </div>
            <p className="auth-seeded-text">
              Test realistic ledgers, parking requests, gate visitor passes, and notifications across 20 distinct homeowner accounts. Universal password: <code>Resident@1234</code>.
            </p>
          </div>
        </div>

        {/* Right Side High Contrast Login Card */}
        <div className="login-card">
          <div className="login-brand mb-6" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.3)', flexShrink: 0 }}>
              <img src="/nrg-ph2-logo.png" alt="NRG PH2 Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h2 className="login-brand-name" style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0 }}>NRG PH2 HOA INC</h2>
              <p className="login-brand-tagline" style={{ fontSize: '0.84rem', fontWeight: 700, margin: '2px 0 0 0' }}>Phase 2 Resident & Staff Sign In</p>
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
              <label className="form-label">
                Email Address <span className="req-star">*</span>
              </label>
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
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>
                Password <span className="req-star">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: isLight ? '#DC2626' : '#F87171', fontWeight: 700, textDecoration: 'none' }}>
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

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: isLight ? '#475569' : '#9CA3AF' }}>
              New Homeowner in Northridge Grove?{' '}
              <Link to="/register" style={{ color: isLight ? '#15803D' : '#6EE7B7', fontWeight: 800, textDecoration: 'underline' }}>
                Register Account Here
              </Link>
            </div>
          </form>

          {/* Quick Demo Sign-In Buttons */}
          <div className="auth-divider">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="auth-demo-label">
                ⚡ 1-Click Quick Demo Sign In:
              </span>
              <button
                type="button"
                onClick={() => setShowHomeownerModal(true)}
                style={{
                  background: '#059669', color: '#FFFFFF',
                  border: 'none', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                }}
              >
                <span>🏠</span> Pick from 20 Homeowners
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {STAFF_ACCOUNTS.map((acc, i) => {
                const bg = isLight ? acc.lightBg : acc.darkBg;
                const border = isLight ? `1px solid ${acc.lightBorder}` : `1px solid ${acc.darkColor}`;
                const color = isLight ? acc.lightColor : acc.darkColor;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.password, acc.role === 'resident')}
                    className="auth-staff-btn"
                    style={{
                      background: bg,
                      border: border,
                      color: color,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    {acc.label}
                  </button>
                );
              })}
              
              {/* Primary Resident Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('resident@palmera-hoa.com', 'Resident@1234', true)}
                className="auth-primary-res-btn"
                style={{
                  gridColumn: '1 / -1',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
                  border: isLight ? '1.5px solid #86EFAC' : '1px solid rgba(52, 211, 153, 0.4)',
                  color: isLight ? '#065F46' : '#6EE7B7',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isLight ? '0 1px 3px rgba(16, 185, 129, 0.12)' : 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  if (isLight) {
                    e.currentTarget.style.background = '#D1FAE5';
                    e.currentTarget.style.borderColor = '#34D399';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                  } else {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.borderColor = '#34D399';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.25)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.background = isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = isLight ? '#86EFAC' : 'rgba(52, 211, 153, 0.4)';
                  e.currentTarget.style.boxShadow = isLight ? '0 1px 3px rgba(16, 185, 129, 0.12)' : 'none';
                }}
              >
                <span style={{ fontSize: 14 }}>🏡</span>
                <span>
                  Log In as Primary Homeowner{' '}
                  <span style={{ fontWeight: 600, opacity: isLight ? 0.9 : 0.85 }}>
                    (Ricardo Dalisay - Blk 7 Lot 08)
                  </span>
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── 20 HOMEOWNERS SELECTOR MODAL ── */}
      {showHomeownerModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowHomeownerModal(false)}
        >
          <div
            style={{
              background: isLight ? '#FFFFFF' : '#0F172A',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, width: '100%', maxWidth: 720, maxHeight: '85vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.15)' : '0 25px 50px -12px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: isLight ? '#F8FAFC' : 'transparent',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏡</span> Select from 20 Homeowner Test Accounts
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: isLight ? '#64748B' : '#94A3B8' }}>
                  Click any resident to immediately log in and inspect their dues, profile, vehicles, and requests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHomeownerModal(false)}
                style={{
                  background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: isLight ? '#475569' : '#CBD5E1',
                  fontSize: 18, borderRadius: 8, width: 32, height: 32,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Search Filter */}
            <div style={{
              padding: '12px 24px',
              background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)',
              borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)'
            }}>
              <input
                type="text"
                placeholder="🔍 Search by name, block, or status (e.g. 'unpaid', 'Blk 3', 'Vilma')..."
                value={searchHomeowner}
                onChange={e => setSearchHomeowner(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)',
                  border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
                  color: isLight ? '#0F172A' : '#FFFFFF',
                  fontSize: 13, outline: 'none',
                }}
              />
            </div>

            {/* Homeowners Grid */}
            <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {filteredHomeowners.map(h => (
                <div
                  key={h.id}
                  onClick={() => handleQuickLogin(h.email, 'Resident@1234', true)}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isLight ? '#F0FDF4' : 'rgba(16, 185, 129, 0.12)';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: isLight ? '#0F172A' : '#FFFFFF', fontWeight: 700, fontSize: 14 }}>{h.name}</span>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                        background: h.status === 'paid'
                          ? (isLight ? '#DCFCE7' : 'rgba(16, 185, 129, 0.2)')
                          : h.status === 'overdue'
                          ? (isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)')
                          : (isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.2)'),
                        color: h.status === 'paid'
                          ? (isLight ? '#15803D' : '#34D399')
                          : h.status === 'overdue'
                          ? (isLight ? '#B91C1C' : '#F87171')
                          : (isLight ? '#B45309' : '#FBBF24'),
                      }}
                    >
                      {h.dues}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: isLight ? '#64748B' : '#94A3B8' }}>
                    <span>📍 {h.block}</span>
                    <span style={{ fontSize: 11 }}>{h.email}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)',
              background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, color: isLight ? '#64748B' : '#64748B'
            }}>
              <span>Showing {filteredHomeowners.length} of {TEST_HOMEOWNERS.length} homeowner accounts</span>
              <span style={{ color: isLight ? '#475569' : '#94A3B8' }}>Password: <code style={{ color: '#D97706', fontWeight: 700 }}>Resident@1234</code></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
