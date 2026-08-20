import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('Block 3 Lot 12, Northridge Grove, Brgy. Tungkong Mangga');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [proofDocUrl, setProofDocUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith('image/')) {
        const objUrl = URL.createObjectURL(file);
        setPreviewUrl(objUrl);
        setProofDocUrl(objUrl);
      } else {
        setPreviewUrl('');
        setProofDocUrl(file.name);
      }
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hoa/register-homeowner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          address,
          contactNumber,
          email,
          password,
          proofDocUrl,
          otpCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg(data.message);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* ── TOP HEADER WITH BACK TO HOME BUTTON ── */}
      <header style={{ width: '100%', position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 32px', zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 17, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px' }}>BRIA</span>
            <span style={{ background: '#166534', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>HOMES</span>
          </div>
          <span style={{ color: '#E5E7EB', fontWeight: 600, fontSize: '14px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 10 }}>
            Homeowner Account Registration
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
      </div>

      <div className="login-container" style={{ maxWidth: 680, gridTemplateColumns: '1fr', marginTop: 80 }}>
        <div className="login-card">
          
          {/* Brand Header */}
          <div className="login-brand mb-4" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.3)', flexShrink: 0 }}>
              <img src="/nrg-ph2-logo.png" alt="NRG PH2 Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 className="login-brand-name" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>NRG PH2 HOA INC</h1>
              <p className="login-brand-tagline" style={{ fontSize: '0.82rem', color: '#F59E0B' }}>Northridge Grove Phase 2 • Brgy. Tungkong Mangga, CSJDM 3023</p>
            </div>
          </div>

          {/* Stepper Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17, 24, 39, 0.8)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
            {[
              { num: 1, label: 'Owner Info' },
              { num: 2, label: 'TCT Upload' },
              { num: 3, label: 'SMS/Email OTP' },
              { num: 4, label: 'Complete' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: step >= s.num ? 1 : 0.4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: step >= s.num ? '#166534' : 'rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {s.num}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#F3F4F6' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="login-error mb-4">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Input Personal Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="login-form">
              <div>
                <label className="form-label">Registered Owner Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">House / Unit Address (Northridge Grove Phase 2)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Block 3 Lot 12, Phase 2, NRG PH2 HOA INC, Brgy. Tungkong Mangga"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="form-label">Mobile Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0917XXXXXXX"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="form-label">Create Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: '#DC2626', color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, marginTop: 12,
                  boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                }}
              >
                Next: TCT / Proof Verification →
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#9CA3AF' }}>
                Already registered? <Link to="/login" style={{ color: '#F87171', fontWeight: 700, textDecoration: 'underline' }}>Sign In Here</Link>
              </div>
            </form>
          )}

          {/* Step 2: Proof of Ownership Verification */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="login-form">
              <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F87171', margin: '0 0 4px 0' }}>📋 Transfer Certificate of Title (TCT) / Proof Upload</h3>
                <p style={{ fontSize: 12, color: '#E5E7EB', margin: 0 }}>
                  Please attach a copy of your Transfer Certificate of Title (TCT) or latest Meralco/Water bill for HOA Admin verification.
                </p>
              </div>

              <div>
                <label className="form-label">Attach Document File</label>
                <input
                  type="file"
                  id="tct-file-upload"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="tct-file-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px 18px',
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: attachedFile ? '2px solid #22C55E' : '2px dashed rgba(220, 38, 38, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!attachedFile) e.currentTarget.style.borderColor = '#DC2626';
                  }}
                  onMouseLeave={e => {
                    if (!attachedFile) e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{attachedFile ? '✅' : '📁'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>
                    {attachedFile ? attachedFile.name : 'Click to Upload Document File'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    {attachedFile
                      ? `${(attachedFile.size / 1024 / 1024).toFixed(2)} MB • File Ready for Admin Verification`
                      : 'Upload TCT Title, Meralco Bill, or Water Bill (JPG, PNG, PDF)'}
                  </div>
                  {attachedFile && (
                    <div style={{ marginTop: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', color: '#86EFAC', fontSize: 11, fontWeight: 800 }}>
                      ✓ Document Attached
                    </div>
                  )}
                </label>
              </div>

              {(previewUrl || attachedFile) && (
                <div style={{ padding: 12, background: 'rgba(17, 24, 39, 0.8)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>Attached Document Preview:</div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Proof" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <div style={{ padding: 16, background: '#0F172A', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>📄</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>{attachedFile?.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Document File Ready</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Next: OTP Verification →
                </button>
              </div>
            </form>
          )}

          {/* Step 3: SMS/Email OTP */}
          {step === 3 && (
            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div style={{ background: 'rgba(22,101,52,0.2)', border: '1px solid rgba(34,197,94,0.4)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#6EE7B7', margin: '0 0 4px 0' }}>📱 Security OTP Sent</h3>
                <p style={{ fontSize: 12, color: '#E5E7EB', margin: 0 }}>
                  A 6-digit verification code was sent to <strong>{email}</strong> and <strong>{contactNumber}</strong>. Enter code <code>123456</code> to verify.
                </p>
              </div>

              <div>
                <label className="form-label">Enter 6-Digit Code</label>
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
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  {isLoading ? 'Submitting...' : '✓ Complete Registration'}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFF', marginBottom: 8 }}>Registration Submitted!</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                {successMsg}
              </p>

              <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', padding: 14, borderRadius: 8, textAlign: 'left', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24', marginBottom: 4 }}>⏳ Verification Status: Pending Phase 2 HOA Approval</div>
                <div style={{ fontSize: 12, color: '#E5E7EB' }}>
                  The NRG PH2 HOA INC Administrator will review your proof of ownership document. Once verified, your account will be activated and you can sign in.
                </div>
              </div>

              <Link to="/login" style={{ display: 'block', padding: 14, borderRadius: 8, background: '#DC2626', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                Return to Login Page
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
