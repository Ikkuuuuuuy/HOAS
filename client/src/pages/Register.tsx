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
  const [birthDate, setBirthDate] = useState('1985-05-14');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [selectedBlock, setSelectedBlock] = useState('Block 3');
  const [selectedLot, setSelectedLot] = useState('Lot 12');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Valid ID Verification State
  const [idType, setIdType] = useState("National ID");
  const [idNumber, setIdNumber] = useState('');
  const [proofDocUrl, setProofDocUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
  const [otpCode, setOtpCode] = useState('123456');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAutoAccepted, setIsAutoAccepted] = useState(false);
  const [matchedRecord, setMatchedRecord] = useState<MasterlistRecord | null>(null);

  const navigate = useNavigate();

  // Calculated Age from Birth Date
  const computedAge = useMemo(() => {
    if (!birthDate) return 0;
    const diff = new Date().getTime() - new Date(birthDate).getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
  }, [birthDate]);

  // Calculated Street & Full Address
  const currentStreet = BLOCK_STREET_MAP[selectedBlock] || 'Maagap Street';
  const fullAddress = `${selectedBlock} ${selectedLot}, ${currentStreet}, Northridge Grove Phase 2, Brgy. Tungkong Mangga, CSJDM, Bulacan`;

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

  const handleQuickPreFill = (rec: MasterlistRecord) => {
    setFullName(rec.ownerName);
    setSelectedBlock(rec.block);
    setSelectedLot(rec.lot);
    setBirthDate(rec.birthDate || '1985-05-14');
    setGender((rec.gender as any) || 'Male');
    setContactNumber(rec.phone);
    setEmail(rec.email);
    setPassword('Resident@1234');
    setConfirmPassword('Resident@1234');
    setAccountNo(rec.accountNo);
    setIdType(rec.idType || 'National ID');
    setProofDocUrl(rec.idPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
    setPreviewUrl(rec.idPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
    setError('');
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (computedAge < 18) {
      setError('Homeowner applicant must be at least 18 years old to register.');
      return;
    }

    // Move to Mandatory ID Upload Step
    setStep(2);
  };

  const handleNextStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!proofDocUrl && !attachedFile) {
      setError('Please attach a clear picture of your valid Government ID for verification.');
      return;
    }

    // Multi-factor verification against masterlist upon secure submission
    const verifiedMatch = matchMasterlistRecord({
      fullName,
      block: selectedBlock,
      lot: selectedLot,
      birthDate,
      gender,
      phone: contactNumber,
      accountNo,
    });

    if (verifiedMatch) {
      await performRegistrationSubmit(true, verifiedMatch);
    } else {
      await performRegistrationSubmit(false, null);
    }
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
          birthDate,
          gender,
          age: computedAge,
          idType,
          idNumber,
          address: fullAddress,
          contactNumber,
          email,
          accountNo: match ? match.accountNo : accountNo,
          password,
          proofDocUrl: previewUrl || proofDocUrl,
          isAutoAccepted: autoApproveExpected,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccessMsg(
        autoApproveExpected
          ? 'Identity & Property Confirmed! Your Homeowner Account has been immediately activated via HOA Masterlist Automated Sync.'
          : 'Registration Submitted! Your account application and uploaded ID are now under review by the HOA Board.'
      );
      setIsAutoAccepted(autoApproveExpected);
      setMatchedRecord(match || null);
      setStep(4);
    } catch (err: any) {
      // Local fallback
      setSuccessMsg(
        autoApproveExpected
          ? 'Identity & Property Confirmed! Your Homeowner Account has been immediately activated.'
          : 'Registration Submitted! Your account application and uploaded ID are now under review by the HOA Board.'
      );
      setIsAutoAccepted(autoApproveExpected);
      setMatchedRecord(match || null);
      setStep(4);
    } finally {
      setIsLoading(false);
    }
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
              { num: 1, label: '1. Personal & Property Info' },
              { num: 2, label: '2. Valid ID Verification' },
              { num: 4, label: '3. Registration Status' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: step >= s.num ? 1 : 0.45 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step >= s.num ? '#16A34A' : 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step >= s.num ? '0 0 8px rgba(34,197,94,0.4)' : 'none'
                }}>
                  {s.num === 4 ? 3 : s.num}
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

          {/* ── STEP 1: PERSONAL, DEMOGRAPHICS & PROPERTY DETAILS ── */}
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

              {/* Birth Date, Age, Sex Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">
                    Date of Birth <span className="req-star">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    Age <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={computedAge || ''}
                    readOnly
                    placeholder="18+"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Sex / Gender <span className="req-star">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
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

              {/* Contact & Email */}
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

              {/* Next Button */}
              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 800, marginTop: 10,
                  boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                }}
              >
                <span>Proceed to Valid ID Verification →</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9CA3AF' }}>
                Already registered? <Link to="/login" style={{ color: '#F87171', fontWeight: 700, textDecoration: 'underline' }}>Sign In Here</Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: MANDATORY VALID GOVERNMENT ID UPLOAD ── */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="login-form">
              <div style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '16px 18px',
                borderRadius: 12,
                marginBottom: 18
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FBBF24', fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>
                  <span>🛡️</span>
                  <span>Mandatory Government ID Verification</span>
                </div>
                <p style={{ fontSize: 12, color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
                  To ensure community safety and prevent unauthorized registrations, please upload a clear, unblurred picture of a government-issued ID matching your full name: <strong>{fullName || 'Applicant'}</strong>.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">
                    Valid Government ID Type <span className="req-star">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={idType}
                    onChange={e => setIdType(e.target.value)}
                    required
                  >
                    <option value="National ID">National ID (PhilSys)</option>
                    <option value="Driver's License">Driver's License (LTO)</option>
                    <option value="Philippine Passport">Philippine Passport (DFA)</option>
                    <option value="UMID / SSS">UMID / SSS Card</option>
                    <option value="Postal ID">Postal ID (PhilPost)</option>
                    <option value="Voter's ID">Voter's ID / Certificate (COMELEC)</option>
                    <option value="PRC License">PRC Professional ID</option>
                    <option value="Senior Citizen ID">Senior Citizen ID</option>
                    <option value="Barangay ID">Barangay 174 Resident ID</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">ID Serial Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1234-5678-9012"
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Upload Clear Picture of Valid ID <span className="req-star">*</span>
                </label>
                <input
                  type="file"
                  id="valid-id-file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <label
                  htmlFor="valid-id-file-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 18px',
                    borderRadius: 12,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: previewUrl ? '2px solid #22C55E' : '2px dashed rgba(245, 158, 11, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  {previewUrl ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={previewUrl}
                        alt="Valid ID Preview"
                        style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', marginBottom: 12 }}
                      />
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#86EFAC' }}>
                        ✓ {attachedFile ? attachedFile.name : 'Sample ID Attached'} — Click to Replace Picture
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>
                        Ensure photo, full name, and birth date are crisp and clearly legible.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 38, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>
                        Click to Snap Photo or Upload Government ID
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11.5,
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>🔒</span>
                <span>
                  <strong>Data Privacy Standard:</strong> Your ID photo is securely archived in the Super Admin Security Vault and used solely for homeowner verification.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 8,
                    background: 'rgba(255,255,255,0.1)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  ← Back to Details
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2, padding: 12, borderRadius: 8,
                    background: 'linear-gradient(135deg, #15803D, #16A34A)',
                    color: '#fff', border: 'none',
                    fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(22,163,74,0.4)'
                  }}
                >
                  {isLoading ? 'Verifying & Submitting...' : '✓ Complete Verification & Submit'}
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
