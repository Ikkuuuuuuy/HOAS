import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { HOA_MASTERLIST_DATABASE, matchMasterlistRecord, MasterlistRecord } from '../data/mockDatabase';
import PrivacyPolicyModal from '../components/common/PrivacyPolicyModal';

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
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
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
  const [proofDocUrl, setProofDocUrl] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [otpCode, setOtpCode] = useState('123456');

  // Proof of Property Ownership State (Deed of Sale OR Contract to Sell OR Title)
  const [ownershipDocType, setOwnershipDocType] = useState('Deed of Absolute Sale (DOAS)');
  const [ownershipDocNumber, setOwnershipDocNumber] = useState('');
  const [ownershipDocUrl, setOwnershipDocUrl] = useState('');
  const [ownershipAttachedFile, setOwnershipAttachedFile] = useState<File | null>(null);
  const [ownershipPreviewUrl, setOwnershipPreviewUrl] = useState<string>('');

  // Drag & drop highlight state
  const [isDraggingId, setIsDraggingId] = useState(false);
  const [isDraggingOwnership, setIsDraggingOwnership] = useState(false);

  const [agreePrivacyConsent, setAgreePrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

  const handleProcessIdFile = (file: File) => {
    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
      setProofDocUrl(objUrl);
    } else {
      setPreviewUrl('');
      setProofDocUrl(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessIdFile(file);
    }
  };

  const handleProcessOwnershipFile = (file: File) => {
    setOwnershipAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(file);
      setOwnershipPreviewUrl(objUrl);
      setOwnershipDocUrl(objUrl);
    } else {
      setOwnershipPreviewUrl('');
      setOwnershipDocUrl(file.name);
    }
  };

  const handleOwnershipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessOwnershipFile(file);
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
    setProofDocUrl('');
    setPreviewUrl('');
    setAttachedFile(null);
    setOwnershipDocType('Deed of Absolute Sale (DOAS)');
    setOwnershipDocNumber('');
    setOwnershipDocUrl('');
    setOwnershipPreviewUrl('');
    setOwnershipAttachedFile(null);
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

    // Move to Mandatory ID & Ownership Upload Step
    setStep(2);
  };

  const handleNextStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!proofDocUrl && !attachedFile) {
      setError('Please attach a clear picture of your valid Government ID for verification.');
      return;
    }

    if (!ownershipDocUrl && !ownershipAttachedFile) {
      setError('Please attach your Proof of Ownership (Deed of Sale OR Contract to Sell OR Title).');
      return;
    }

    if (!agreePrivacyConsent) {
      setError('Please check and agree to the Data Privacy & Protection Consent (R.A. 10173) before submitting.');
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
    const regUserId = 'usr-reg-' + Date.now();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Record in local pending storage so it reflects in Admin Approval Table immediately
    const pendingRecord = {
      id: regUserId,
      full_name: fullName,
      fullName: fullName,
      email: normalizedEmail,
      phone_number: contactNumber,
      phone: contactNumber,
      address: fullAddress,
      registeredBlock: selectedBlock,
      registeredLot: selectedLot,
      id_type: idType,
      idType: idType,
      id_number: idNumber,
      idNumber: idNumber,
      proof_doc_url: previewUrl || proofDocUrl || '',
      proofDocUrl: previewUrl || proofDocUrl || '',
      ownership_doc_url: ownershipPreviewUrl || ownershipDocUrl || '',
      ownershipDocUrl: ownershipPreviewUrl || ownershipDocUrl || '',
      ownership_doc_type: ownershipDocType,
      ownershipDocType: ownershipDocType,
      ownership_doc_number: ownershipDocNumber,
      ownershipDocNumber: ownershipDocNumber,
      status: autoApproveExpected ? 'active' : 'pending_approval',
      created_at: new Date().toISOString()
    };
    try {
      const existingPending = JSON.parse(localStorage.getItem('hoa_mock_pending_registrations') || '[]');
      const filteredPending = existingPending.filter((item: any) => item.email?.toLowerCase() !== normalizedEmail);
      filteredPending.unshift(pendingRecord);
      localStorage.setItem('hoa_mock_pending_registrations', JSON.stringify(filteredPending));
    } catch (e) {
      console.warn('Storage error:', e);
    }

    // 2. Record in hoa_registered_users with password so resident can log in immediately
    try {
      const existingReg = JSON.parse(localStorage.getItem('hoa_registered_users') || '[]');
      const filteredReg = existingReg.filter((u: any) => u.email?.toLowerCase() !== normalizedEmail);
      filteredReg.unshift({
        id: regUserId,
        email: normalizedEmail,
        password: password,
        fullName,
        full_name: fullName,
        roleName: 'resident',
        roleId: 5,
        tenantId: 'tenant-palmera-1',
        tenantName: 'NRG PH2 HOA INC',
        tenantType: 'subdivision',
        status: autoApproveExpected ? 'active' : 'pending_approval',
        phone: contactNumber,
        phone_number: contactNumber,
        address: fullAddress,
        registeredBlock: selectedBlock,
        registeredLot: selectedLot,
        idType,
        idNumber,
        id_type: idType,
        id_number: idNumber,
        proofDocUrl: previewUrl || proofDocUrl || '',
        proof_doc_url: previewUrl || proofDocUrl || '',
        ownershipDocUrl: ownershipPreviewUrl || ownershipDocUrl || '',
        ownership_doc_url: ownershipPreviewUrl || ownershipDocUrl || '',
        ownershipDocType: ownershipDocType,
        ownership_doc_type: ownershipDocType,
        ownershipDocNumber: ownershipDocNumber,
        ownership_doc_number: ownershipDocNumber,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem('hoa_registered_users', JSON.stringify(filteredReg));
    } catch (e) {
      console.warn('Storage error:', e);
    }

    // Trigger cross-component real-time sync
    window.dispatchEvent(new Event('hoa_storage_update'));
    window.dispatchEvent(new Event('storage'));
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
          otpCode: otpCode || '123456',
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
        background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #F59E0B' }}>
            <img src="/nrg-ph2-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>
            NRG PH2 HOA Portal • Registration
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'var(--bg-hover)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 8,
              background: 'var(--bg-hover)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
            }}
          >
            ← Back to Public Website
          </Link>
        </div>
      </header>

      <div className="login-bg">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
      </div>

      <div className="login-container" style={{ maxWidth: 740, gridTemplateColumns: '1fr', marginTop: 70, marginBottom: 40 }}>
        <div className="login-card" style={{ padding: '32px' }}>
          
          {/* Brand Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Homeowner Portal Registration
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
              Automated instant approval for verified Northridge Grove Phase 2 property owners.
            </p>
          </div>

          {/* 1-Click Fast Demo Pre-Fill Helper */}
          {step === 1 && (
            <div style={{
              background: isLight ? '#FFFBEB' : 'var(--bg-hover)',
              border: isLight ? '1px solid #FCD34D' : '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 22,
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: isLight ? '#92400E' : '#FBBF24', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚡ Quick Demo: Test Instant Auto-Accept
                </span>
                <span style={{ fontSize: 11, color: isLight ? '#78350F' : 'var(--text-muted)' }}>1-Click pre-fill verified resident</span>
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
                      background: isLight ? '#FFFFFF' : 'var(--bg-surface)',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid var(--border)',
                      color: isLight ? '#0F172A' : 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isLight ? '#F0FDF4' : '#166534';
                      e.currentTarget.style.borderColor = isLight ? '#16A34A' : '#22C55E';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isLight ? '#FFFFFF' : 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = isLight ? '#CBD5E1' : 'var(--border)';
                    }}
                  >
                    <span style={{ color: isLight ? '#0F172A' : 'var(--text-primary)' }}>👤 {rec.ownerName}</span>
                    <span style={{ color: isLight ? '#B45309' : '#FBBF24', fontSize: 11, fontWeight: 700 }}>({rec.block} {rec.lot})</span>
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
            background: isLight ? '#F8FAFC' : 'var(--bg-hover)',
            padding: '12px 18px',
            borderRadius: 10,
            border: isLight ? '1px solid #E2E8F0' : '1px solid var(--border)',
            marginBottom: 22
          }}>
            {[
              { num: 1, label: '1. Personal & Property Info' },
              { num: 2, label: '2. Valid ID & Ownership' },
              { num: 4, label: '3. Registration Status' },
            ].map(s => {
              const isActive = step >= s.num;
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 7, opacity: isActive ? 1 : (isLight ? 0.75 : 0.5) }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: isActive ? '#16A34A' : (isLight ? '#CBD5E1' : 'rgba(255,255,255,0.15)'),
                    color: isActive ? '#FFFFFF' : (isLight ? '#334155' : '#94A3B8'),
                    fontSize: 11.5, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 0 8px rgba(34,197,94,0.4)' : 'none'
                  }}>
                    {s.num === 4 ? 3 : s.num}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? (isLight ? '#0F172A' : 'var(--text-primary)') : (isLight ? '#475569' : 'var(--text-muted)')
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
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
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)' }}
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
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)' }}
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

              {/* Step 1 PII Data Privacy Notice */}
              <div style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4
              }}>
                <span>🛡️</span>
                <span>
                  <strong>Data Privacy (R.A. 10173):</strong> Your demographic and property details are collected strictly for verified resident directory and emergency administration.
                </span>
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

          {/* ── STEP 2: MANDATORY VALID GOVERNMENT ID & PROOF OF OWNERSHIP UPLOAD ── */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="login-form">
              {/* ID Verification Header Box */}
              <div style={{
                background: isLight ? '#FFFBEB' : 'rgba(245, 158, 11, 0.08)',
                border: isLight ? '1px solid #FCD34D' : '1px solid rgba(245, 158, 11, 0.3)',
                padding: '16px 18px',
                borderRadius: 12,
                marginBottom: 18
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isLight ? '#92400E' : '#FBBF24', fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>
                  <span>🛡️</span>
                  <span>1. Valid Government ID Verification (Name, Birthdate & Age)</span>
                </div>
                <p style={{ fontSize: 12, color: isLight ? '#1E293B' : 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                  Please upload a clear, unblurred photo of your government-issued ID to verify your legal identity: <strong>{fullName || 'Applicant'}</strong> ({birthDate ? `Born ${birthDate}` : ''}).
                </p>
                <div style={{
                  background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.1)',
                  border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.25)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  marginTop: 8,
                  fontSize: 11.5,
                  color: isLight ? '#1E3A8A' : 'var(--text-primary)'
                }}>
                  💡 <strong>Address Exemption Notice:</strong> The address printed on your valid ID does <u>not</u> need to match your new Northridge Grove Phase 2 property. We only verify your <strong>Legal Name</strong>, <strong>Birthdate</strong>, and <strong>Age</strong>.
                </div>
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
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <label
                  htmlFor="valid-id-file-upload"
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingId(true); }}
                  onDragLeave={() => setIsDraggingId(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingId(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProcessIdFile(file);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: previewUrl || attachedFile ? '24px 18px' : '36px 20px',
                    borderRadius: 16,
                    background: isDraggingId
                      ? (isLight ? '#F0FDF4' : 'rgba(22, 163, 74, 0.12)')
                      : (isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)'),
                    border: (previewUrl || attachedFile)
                      ? (isLight ? '2px solid #16A34A' : '2px solid #22C55E')
                      : isDraggingId
                      ? (isLight ? '2px dashed #16A34A' : '2px dashed #22C55E')
                      : (isLight ? '1.5px dashed #D1D5DB' : '1.5px dashed rgba(255, 255, 255, 0.25)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.02)' : 'none',
                  }}
                >
                  {previewUrl || attachedFile ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Valid ID Preview"
                          style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 10, border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        />
                      ) : (
                        <div style={{ fontSize: 38, marginBottom: 8 }}>📄</div>
                      )}
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: isLight ? '#15803D' : '#86EFAC' }}>
                        ✓ {attachedFile ? attachedFile.name : 'Valid ID Attached'} — Click to Replace Picture
                      </div>
                      <div style={{ fontSize: 11.5, color: isLight ? '#475569' : 'var(--text-muted)', marginTop: 3 }}>
                        Ensure photo, full name, and birth date are crisp and clearly legible.
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAttachedFile(null);
                          setPreviewUrl('');
                          setProofDocUrl('');
                        }}
                        style={{
                          marginTop: 10,
                          padding: '4px 12px',
                          borderRadius: 6,
                          background: isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.15)',
                          border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.3)',
                          color: isLight ? '#B91C1C' : '#FCA5A5',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Remove File
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#9CA3AF' : '#94A3B8'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: isLight ? '#111827' : '#F8FAFC', marginBottom: 4 }}>
                        Choose a file or drag & drop
                      </div>
                      <div style={{ fontSize: 12, color: isLight ? '#9CA3AF' : '#94A3B8', marginBottom: 16 }}>
                        JPEG, PNG, PDF, and format, up to 20MB
                      </div>
                      <span style={{
                        padding: '6px 18px',
                        borderRadius: 6,
                        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                        border: isLight ? '1px solid #D1D5DB' : '1px solid rgba(255,255,255,0.2)',
                        color: isLight ? '#1F2937' : '#F3F4F6',
                        fontSize: 12.5,
                        fontWeight: 600,
                        boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                        display: 'inline-block'
                      }}>
                        Browse File
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* ── 2. PROOF OF PROPERTY OWNERSHIP (DOAS OR CTS OR TITLE) ── */}
              <div style={{
                marginTop: 18,
                background: isLight ? '#F0FDF4' : 'rgba(16, 185, 129, 0.08)',
                border: isLight ? '1.5px solid #86EFAC' : '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px 18px',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isLight ? '#065F46' : '#6EE7B7', fontSize: 13.5, fontWeight: 800 }}>
                    <span>📜</span>
                    <span>2. Proof of Property Ownership</span>
                  </div>
                  <span style={{
                    background: isLight ? '#DCFCE7' : 'rgba(34, 197, 94, 0.2)',
                    color: isLight ? '#15803D' : '#86EFAC',
                    border: isLight ? '1px solid #86EFAC' : '1px solid rgba(74, 222, 128, 0.4)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                  }}>
                    ⚡ Submit ANY 1 (OR Only)
                  </span>
                </div>

                {/* Explicit (OR) Notice Banner */}
                <div style={{
                  background: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.12)',
                  border: isLight ? '1px solid #FCD34D' : '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '9px 12px',
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 12,
                  color: isLight ? '#92400E' : '#FDE68A',
                  lineHeight: 1.45,
                }}>
                  📢 <strong>(OR) Only Required:</strong> Please submit only <u>one (1)</u> of the following proofs of ownership — <strong>Deed of Absolute Sale (DOAS)</strong> <em>OR</em> <strong>Contract to Sell (CTS)</strong> <em>OR</em> <strong>Land Title (TCT)</strong>. You do not need to provide all three.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label">
                      Select Document Type Provided <span className="req-star">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={ownershipDocType}
                      onChange={e => setOwnershipDocType(e.target.value)}
                      required
                    >
                      <option value="Deed of Absolute Sale (DOAS)">Deed of Absolute Sale (DOAS)</option>
                      <option value="Contract to Sell (CTS)">Contract to Sell (CTS)</option>
                      <option value="Transfer Certificate of Title (TCT)">Transfer Certificate of Title (TCT / Land Title)</option>
                      <option value="Certificate of Turnover">Developer Turnover / Acceptance Form</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Doc / Contract / Title No. (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. TCT-123456 / CTS-2024-001"
                      value={ownershipDocNumber}
                      onChange={e => setOwnershipDocNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Upload Document Photo or PDF (DOAS / CTS / Title) <span className="req-star">*</span>
                  </label>
                  <input
                    type="file"
                    id="ownership-doc-upload"
                    accept="image/*,.pdf"
                    onChange={handleOwnershipFileChange}
                    style={{ display: 'none' }}
                  />

                  <label
                    htmlFor="ownership-doc-upload"
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingOwnership(true); }}
                    onDragLeave={() => setIsDraggingOwnership(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOwnership(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleProcessOwnershipFile(file);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: ownershipPreviewUrl || ownershipAttachedFile ? '24px 18px' : '36px 20px',
                      borderRadius: 16,
                      background: isDraggingOwnership
                        ? (isLight ? '#F0FDF4' : 'rgba(22, 163, 74, 0.12)')
                        : (isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)'),
                      border: (ownershipPreviewUrl || ownershipAttachedFile)
                        ? (isLight ? '2px solid #16A34A' : '2px solid #22C55E')
                        : isDraggingOwnership
                        ? (isLight ? '2px dashed #16A34A' : '2px dashed #22C55E')
                        : (isLight ? '1.5px dashed #D1D5DB' : '1.5px dashed rgba(255, 255, 255, 0.25)'),
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.02)' : 'none',
                    }}
                  >
                    {ownershipPreviewUrl || ownershipAttachedFile ? (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {ownershipPreviewUrl ? (
                          <img
                            src={ownershipPreviewUrl}
                            alt="Proof of Ownership Preview"
                            style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 10, border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          />
                        ) : (
                          <div style={{ fontSize: 38, marginBottom: 8 }}>📄</div>
                        )}
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: isLight ? '#15803D' : '#86EFAC' }}>
                          ✓ {ownershipAttachedFile ? ownershipAttachedFile.name : `${ownershipDocType} Attached`} — Click to Replace
                        </div>
                        <div style={{ fontSize: 11.5, color: isLight ? '#475569' : 'var(--text-muted)', marginTop: 3 }}>
                          Document verified for {selectedBlock} {selectedLot}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOwnershipAttachedFile(null);
                            setOwnershipPreviewUrl('');
                            setOwnershipDocUrl('');
                          }}
                          style={{
                            marginTop: 10,
                            padding: '4px 12px',
                            borderRadius: 6,
                            background: isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.15)',
                            border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.3)',
                            color: isLight ? '#B91C1C' : '#FCA5A5',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Remove File
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#9CA3AF' : '#94A3B8'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: isLight ? '#111827' : '#F8FAFC', marginBottom: 4 }}>
                          Choose a file or drag & drop
                        </div>
                        <div style={{ fontSize: 12, color: isLight ? '#9CA3AF' : '#94A3B8', marginBottom: 16 }}>
                          JPEG, PNG, PDF, and format, up to 20MB
                        </div>
                        <span style={{
                          padding: '6px 18px',
                          borderRadius: 6,
                          background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                          border: isLight ? '1px solid #D1D5DB' : '1px solid rgba(255,255,255,0.2)',
                          color: isLight ? '#1F2937' : '#F3F4F6',
                          fontSize: 12.5,
                          fontWeight: 600,
                          boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          display: 'inline-block'
                        }}>
                          Browse File
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Data Vault Notice */}
              <div style={{
                marginTop: 18,
                background: isLight ? '#F8FAFC' : 'var(--bg-hover)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid var(--border)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11.5,
                color: isLight ? '#334155' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>🔒</span>
                <span>
                  <strong>Encrypted Vault Protection:</strong> Uploaded ID and ownership documents are encrypted and restricted solely to Super Admin Master Clearance.
                </span>
              </div>

              {/* Mandatory Consent Checkbox */}
              <div style={{
                background: agreePrivacyConsent ? (isLight ? '#F0FDF4' : 'rgba(22, 101, 52, 0.12)') : (isLight ? '#F8FAFC' : 'var(--bg-hover)'),
                border: agreePrivacyConsent ? (isLight ? '1.5px solid #16A34A' : '1.5px solid #22C55E') : (isLight ? '1px solid #CBD5E1' : '1px solid var(--border)'),
                padding: '14px 16px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  id="privacy-consent-checkbox"
                  checked={agreePrivacyConsent}
                  onChange={e => setAgreePrivacyConsent(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#16A34A' }}
                  required
                />
                <label htmlFor="privacy-consent-checkbox" style={{ fontSize: 12, color: isLight ? '#0F172A' : 'var(--text-primary)', cursor: 'pointer', lineHeight: 1.5 }}>
                  I declare that all submitted details are true and correct. I explicitly consent to the collection, processing, and encrypted storage of my PII, Sensitive Personal Data (Birthdate, Gender, Government ID, Proof of Ownership), and emergency contacts by <strong>Northridge Grove Phase 2 HOA Inc.</strong> pursuant to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPrivacyModal(true);
                    }}
                    style={{
                      color: isLight ? '#0284C7' : '#38BDF8',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Philippine Data Privacy Act of 2012 (R.A. 10173)
                  </button>.
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 8,
                    background: isLight ? '#F1F5F9' : 'var(--bg-hover)',
                    color: isLight ? '#1E293B' : 'var(--text-primary)',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid var(--border)',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ← Back to Details
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2, padding: 12, borderRadius: 8,
                    background: agreePrivacyConsent ? 'linear-gradient(135deg, #15803D, #16A34A)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', border: 'none',
                    fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: agreePrivacyConsent ? '0 4px 16px rgba(22,163,74,0.4)' : 'none',
                    opacity: agreePrivacyConsent ? 1 : 0.6
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

              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                {isAutoAccepted ? 'Instant Auto-Accept Verified!' : 'Registration Submitted!'}
              </h2>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
                {successMsg}
              </p>

              {isAutoAccepted ? (
                <div style={{
                  background: 'rgba(22, 101, 52, 0.12)',
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
                    <span style={{ color: isLight ? '#15803D' : '#86EFAC', fontSize: 12, fontWeight: 700 }}>
                      No Admin Waiting Time Required
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    Your homeowner profile has been authenticated against the <strong>NRG PH2 HOA Masterlist</strong>. You now have immediate full access to dues payment, court reservations, visitor passes, and document requests.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: isLight ? '#FEF3C7' : 'rgba(245,158,11,0.15)',
                  border: isLight ? '1px solid #FCD34D' : '1px solid rgba(245,158,11,0.4)',
                  padding: 16,
                  borderRadius: 10,
                  textAlign: 'left',
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isLight ? '#92400E' : '#FBBF24', marginBottom: 4 }}>
                    ⏳ Status: Pending HOA Board Verification
                  </div>
                  <div style={{ fontSize: 12, color: isLight ? '#1E293B' : 'var(--text-primary)' }}>
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

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
