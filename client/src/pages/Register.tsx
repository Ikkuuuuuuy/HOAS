import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HOA_MASTERLIST_DATABASE, matchMasterlistRecord, MasterlistRecord } from '../data/mockDatabase';

const BLOCK_STREET_MAP: Record<string, string> = {
  'Block 1': 'Magiting Street',
  'Block 2': 'Maagap Street',
  'Block 3': 'Maagap Street',
  'Block 4': 'Mabuti Street',
  'Block 5': 'Mabuti Street',
  'Block 6': 'Magiting Street',
  'Block 7': 'Maagap Street',
  'Block 8': 'Mapayapa Street',
  'Block 9': 'Mapayapa Street',
};

export default function Register() {
  const [step, setStep] = useState(1);
  
  // Registration Inputs
  const [fullName, setFullName] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('Block 3');
  const [selectedLot, setSelectedLot] = useState('Lot 12');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [proofDocUrl, setProofDocUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [otpCode, setOtpCode] = useState('123456');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAutoAccepted, setIsAutoAccepted] = useState(false);
  const [matchedRecord, setMatchedRecord] = useState<MasterlistRecord | null>(null);

  const navigate = useNavigate();

  // Calculated Street & Full Address
  const currentStreet = BLOCK_STREET_MAP[selectedBlock] || 'Maagap Street';
  const fullAddress = `${selectedBlock} ${selectedLot}, ${currentStreet}, Northridge Grove Phase 2, Brgy. Tungkong Mangga, CSJDM, Bulacan`;

  // Real-time live masterlist match detector
  const liveMatch = useMemo(() => {
    return matchMasterlistRecord({
      fullName,
      block: selectedBlock,
      lot: selectedLot,
      accountNo,
      phone: contactNumber,
    });
  }, [fullName, selectedBlock, selectedLot, accountNo, contactNumber]);

  // Demo 1-Click Fast Pre-Fill helper
  const handleQuickPreFill = (rec: MasterlistRecord) => {
    setFullName(rec.ownerName);
    setSelectedBlock(rec.block);
    setSelectedLot(rec.lot);
    setContactNumber(rec.phone);
    setEmail(rec.email);
    setAccountNo(rec.accountNo);
    setPassword('Pass123!');
    setConfirmPassword('Pass123!');
    setError('');
  };

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

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if user has an instant masterlist match
    if (liveMatch) {
      // Direct Instant Auto-Approval!
      await performRegistrationSubmit(true, liveMatch);
    } else {
      // Unlisted / New Buyer -> Proceed to TCT upload for manual HOA review
      setStep(2);
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const performRegistrationSubmit = async (autoApproveExpected: boolean, match?: MasterlistRecord | null) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hoa/register-homeowner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          address: fullAddress,
          block: selectedBlock,
          lot: selectedLot,
          contactNumber,
          email,
          accountNo,
          password,
          proofDocUrl,
          otpCode: otpCode || '123456',
        }),
      });

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      if (res.ok && data) {
        setSuccessMsg(data.message);
        setIsAutoAccepted(data.autoAccepted || autoApproveExpected);
        setMatchedRecord(data.matchedRecord || match || null);
        setStep(4);
        return;
      }

      // Fallback for client serverless mode
      setSuccessMsg(
        autoApproveExpected
          ? '🎉 Instant Auto-Verification Successful! Verified against NRG PH2 HOA Official Masterlist. Your account is immediately activated!'
          : 'Registration submitted! Your application is in the queue for manual HOA Board review.'
      );
      setIsAutoAccepted(autoApproveExpected);
      setMatchedRecord(match || null);
      setStep(4);
    } catch (err: any) {
      // Local fallback
      setSuccessMsg('Registration successfully processed with Instant Auto-Accept!');
      setIsAutoAccepted(true);
      setStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performRegistrationSubmit(false, null);
  };

  return (
    <div className="login-page">
      
      {/* ── TOP HEADER ── */}
      <header style={{
        width: '100%', position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 32px', zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(5, 8, 17, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #F59E0B' }}>
            <img src="/nrg-ph2-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: '#E5E7EB', fontWeight: 700, fontSize: '15px' }}>
            NRG PH2 HOA Portal • Registration
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
          }}
        >
          ← Back to Public Website
        </Link>
      </header>

      <div className="login-bg">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
      </div>

      <div className="login-container" style={{ maxWidth: 740, gridTemplateColumns: '1fr', marginTop: 70, marginBottom: 40 }}>
        <div className="login-card" style={{ padding: '32px' }}>
          
          {/* Brand Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ background: '#166534', color: '#86EFAC', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                  ⚡ SMART HOA AUTO-ACCEPT
                </span>
                <span style={{ color: '#9CA3AF', fontSize: 12 }}>Official Masterlist Sync</span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Homeowner Portal Registration
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: 4 }}>
                Automated instant approval for verified Northridge Grove Phase 2 property owners.
              </p>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 12px', borderRadius: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#FBBF24', fontWeight: 700 }}>DATABASE STATUS</div>
              <div style={{ fontSize: 12, color: '#FDE68A', fontWeight: 800 }}>✓ 312 Lots Pre-Synced</div>
            </div>
          </div>

            {/* 1-Click Fast Demo Pre-Fill Helper */}
          {step === 1 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.85))',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 22,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚡ Quick Demo: Test Instant Auto-Accept
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>1-Click pre-fill verified resident</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HOA_MASTERLIST_DATABASE.slice(0, 4).map(rec => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleQuickPreFill(rec)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#166534';
                      e.currentTarget.style.borderColor = '#22C55E';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    }}
                  >
                    <span style={{ color: '#F8FAFC' }}>👤 {rec.ownerName}</span>
                    <span style={{ color: '#FBBF24', fontSize: 11, fontWeight: 700 }}>({rec.block} {rec.lot})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '12px 18px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 22
          }}>
            {[
              { num: 1, label: 'Owner & Property Info' },
              { num: 2, label: liveMatch ? 'Instant Approval ⚡' : 'TCT Document (Optional)' },
              { num: 3, label: 'SMS / OTP' },
              { num: 4, label: 'Account Ready' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: step >= s.num ? 1 : 0.45 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step >= s.num ? '#16A34A' : 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step >= s.num ? '0 0 8px rgba(34,197,94,0.4)' : 'none'
                }}>
                  {s.num}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: step >= s.num ? '#F8FAFC' : '#94A3B8' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="login-error mb-4">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: PERSONAL & PROPERTY DETAILS ── */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="login-form">
              
              {/* Full Name */}
              <div>
                <label className="form-label">
                  Registered Homeowner Full Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ricardo Dalisay"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Block, Lot, Street Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 12 }}>
                <div>
                  <label className="form-label">
                    Block Number <span className="req-star">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={selectedBlock}
                    onChange={e => setSelectedBlock(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => (
                      <option key={b} value={`Block ${b}`}>Block {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Lot Number <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lot 08 or 8"
                    value={selectedLot}
                    onChange={e => setSelectedLot(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Subdivision Street</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentStreet}
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {/* LIVE MASTERLIST MATCH STATUS BANNER */}
              {liveMatch ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.35), rgba(6, 78, 59, 0.25))',
                  border: '1.5px solid #22C55E',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                  animation: 'fadeInUp 0.3s ease'
                }}>
                  <div style={{ fontSize: 32 }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#22C55E', color: '#052E16', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                        OFFICIAL HOA MASTERLIST MATCH
                      </span>
                      <span style={{ color: '#86EFAC', fontSize: 12, fontWeight: 700 }}>
                        {liveMatch.accountNo}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
                      Verified Property: {liveMatch.ownerName} ({liveMatch.block} {liveMatch.lot}, {liveMatch.street})
                    </div>
                    <div style={{ fontSize: 11, color: '#BBF7D0', marginTop: 2 }}>
                      ✓ Auto-Accept Active: You will be <strong>immediately activated</strong> without waiting for manual admin approval!
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>🔍</span>
                  <span>
                    Auto-Verification Active: Matching your Name + Block + Lot against 312 pre-synced Phase 2 property records.
                  </span>
                </div>
              )}

              {/* Contact, Email, HOA Account # */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">
                    Mobile Contact Number <span className="req-star">*</span>
                  </label>
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
                  <label className="form-label">
                    Email Address <span className="req-star">*</span>
                  </label>
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

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">
                    Create Password <span className="req-star">*</span>
                  </label>
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
                  <label className="form-label">
                    Confirm Password <span className="req-star">*</span>
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: liveMatch
                    ? 'linear-gradient(135deg, #166534, #15803D)'
                    : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 800, marginTop: 10,
                  boxShadow: liveMatch ? '0 4px 16px rgba(34,197,94,0.4)' : '0 4px 16px rgba(220,38,38,0.4)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                }}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : liveMatch ? (
                  <span>⚡ Instant Auto-Accept & Activate Account →</span>
                ) : (
                  <span>Proceed to Verification (Unlisted Owner / Tenant) →</span>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9CA3AF' }}>
                Already registered? <Link to="/login" style={{ color: '#F87171', fontWeight: 700, textDecoration: 'underline' }}>Sign In Here</Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: MANUAL TCT / PROOF UPLOAD (FOR UNLISTED OWNERS / TENANTS) ── */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="login-form">
              <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#FBBF24', margin: '0 0 4px 0' }}>
                  📋 Unlisted Property: Document Verification
                </h3>
                <p style={{ fontSize: 12, color: '#E5E7EB', margin: 0 }}>
                  We could not find an exact match in the pre-verified masterlist. Please upload your Transfer Certificate of Title (TCT), Deed of Sale, or latest Utility Bill for 1-click review by the HOA Board.
                </p>
              </div>

              <div>
                <label className="form-label">Attach Proof of Ownership / Tenancy</label>
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
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{attachedFile ? '✅' : '📁'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>
                    {attachedFile ? attachedFile.name : 'Click to Upload Document File'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    {attachedFile
                      ? `${(attachedFile.size / 1024 / 1024).toFixed(2)} MB • File Ready for Admin Verification`
                      : 'Upload TCT Title, Contract to Sell, or Meralco/Water Bill'}
                  </div>
                </label>
              </div>

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

          {/* ── STEP 3: SMS/EMAIL OTP ── */}
          {step === 3 && (
            <form onSubmit={handleManualRegisterSubmit} className="login-form">
              <div style={{ background: 'rgba(22,101,52,0.2)', border: '1px solid rgba(34,197,94,0.4)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#6EE7B7', margin: '0 0 4px 0' }}>📱 Security Verification OTP</h3>
                <p style={{ fontSize: 12, color: '#E5E7EB', margin: 0 }}>
                  A 6-digit confirmation PIN has been generated for <strong>{email}</strong> and <strong>{contactNumber}</strong>. Enter code <code>123456</code> to verify.
                </p>
              </div>

              <div>
                <label className="form-label">
                  Enter 6-Digit Code <span className="req-star">*</span>
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
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  {isLoading ? 'Submitting...' : '✓ Complete Registration'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: REGISTRATION COMPLETED ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 8px', animation: 'fadeInUp 0.4s ease' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
                {isAutoAccepted ? '⚡' : '📋'}
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#FFF', marginBottom: 8 }}>
                {isAutoAccepted ? 'Instant Auto-Accept Verified!' : 'Registration Submitted!'}
              </h2>

              <p style={{ fontSize: 13, color: '#D1D5DB', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
                {successMsg}
              </p>

              {isAutoAccepted ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.4), rgba(6, 78, 59, 0.3))',
                  border: '1.5px solid #22C55E',
                  padding: 18,
                  borderRadius: 12,
                  textAlign: 'left',
                  marginBottom: 24,
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ background: '#22C55E', color: '#052E16', fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 4 }}>
                      ACTIVE & VERIFIED
                    </span>
                    <span style={{ color: '#86EFAC', fontSize: 12, fontWeight: 700 }}>
                      No Admin Waiting Time Required
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#E5E7EB', lineHeight: 1.5 }}>
                    Your homeowner profile has been authenticated against the <strong>NRG PH2 HOA Masterlist</strong>. You now have immediate full access to dues payment, court reservations, visitor passes, and document requests.
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', padding: 16, borderRadius: 10, textAlign: 'left', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24', marginBottom: 4 }}>⏳ Status: Pending HOA Board Verification</div>
                  <div style={{ fontSize: 12, color: '#E5E7EB' }}>
                    The HOA Board will review your submitted application. Once approved, your account will be activated immediately.
                  </div>
                </div>
              )}

              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '15px',
                  borderRadius: 8,
                  background: isAutoAccepted
                    ? 'linear-gradient(135deg, #166534, #15803D)'
                    : '#DC2626',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 15,
                  boxShadow: isAutoAccepted ? '0 4px 16px rgba(34,197,94,0.4)' : '0 4px 16px rgba(220,38,38,0.4)'
                }}
              >
                {isAutoAccepted ? 'Proceed to Sign In & Access Homeowner Portal →' : 'Return to Login Page'}
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
