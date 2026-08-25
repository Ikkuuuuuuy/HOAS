import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Male Resident', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-2', label: 'Female Resident', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-3', label: 'HOA Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-4', label: 'Admin Staff', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-5', label: 'Security Lead', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-6', label: 'Community Leader', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
];

export default function UserProfileSettings() {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { success, error: showError } = useToast();

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || 'Ricardo Dalisay (Resident Owner)');
  const [phone, setPhone] = useState(user?.phone || '0917-890-1234');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Profile photo must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);
      updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: base64
      });
      success('Photo Updated! 📷', 'Your new profile avatar is active.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    updateUserProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      avatarUrl: url
    });
    success('Avatar Updated! 👤', 'Selected preset avatar applied.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarPreview
      });
      success('Profile Saved! ✓', 'Your name and contact details have been updated.');
      setShowEditModal(false);
    } catch {
      showError('Save Failed', 'Could not update profile information.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showError('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Password Mismatch', 'New password and confirmation password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        success('Password Changed! 🔑', res.message || 'Your account password has been updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      } else {
        showError('Update Failed', res.message || 'Could not change password.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // User Initials
  const getInitials = () => {
    if (!user?.fullName) return 'RD';
    const parts = user.fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.fullName.slice(0, 2).toUpperCase();
  };

  // Role Badging
  const getRoleBadge = () => {
    const role = user?.roleName || 'resident';
    switch (role) {
      case 'super_admin': return 'SUPER ADMIN / GOVERNANCE';
      case 'hoa_admin': return 'HOA BOARD ADMIN';
      case 'admin_staff': return 'ADMIN STAFF';
      case 'security_guard': return 'GATE SECURITY LEAD';
      default: return 'HOMEOWNER / RESIDENT';
    }
  };

  // Role Permissions
  const getPermissions = () => {
    const role = user?.roleName || 'resident';
    if (role === 'super_admin') {
      return [
        '🛡️ Super Admin Master Controls',
        '🏛️ Multi-Tenant Community Provisioning',
        '🔐 Security Vault Encryption Key Management',
        '👥 System User Directory & Role Assignment',
        '📊 Financial & Audit Governance Records'
      ];
    }
    if (role === 'hoa_admin' || role === 'admin_staff') {
      return [
        '📋 HOA Masterlist Registration & Verification',
        '💰 Monthly Dues & Ledger Billing Generator',
        '🏀 Facility Reservations & Court Approvals',
        '📄 Service & Document Requests Processing',
        '👥 Household Member Directory Verification'
      ];
    }
    if (role === 'security_guard') {
      return [
        '🚗 Visitor Gate Logbook Entry & Check-out',
        '🚨 Subdivision Security Alert Broadcasts',
        '🔍 Resident RFID Vehicle Tag Verification',
        '📋 Daily Gate Logs Export'
      ];
    }
    return [
      '🏡 Homeowner Resident Portal',
      '📄 Service Request & Gate Pass Filing',
      '🏀 Sports & Facility Reservations',
      '💰 Statements of Account & Online Payments',
      '👨‍👩‍👧‍👦 Registered Household Occupants Directory'
    ];
  };

  return (
    <PageContainer
      title="Account Overview & Profile"
      subtitle="User profile details, custom avatar, HOA verified credentials, and account security"
    >
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>

        {/* ── TOP BADGE BAR ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Account Overview & Profile
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              User profile details, custom avatar, HOA verified credentials, and account security
            </p>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(22, 101, 52, 0.10)',
            border: '1px solid rgba(22, 101, 52, 0.30)',
            color: '#166534',
            fontSize: 12.5,
            fontWeight: 700
          }}>
            <span>✓</span> HOA Verified Active Account
          </div>
        </div>

        {/* ── 2-COLUMN MAIN LAYOUT (CCP SYSTEM INSPIRED) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 24,
          alignItems: 'start'
        }}>

          {/* ══════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: USER PROFILE SUMMARY CARD                 */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="card" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center'
          }}>

            {/* Avatar with Camera Overlay */}
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 14px' }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.fullName}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #166534',
                    boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)'
                  }}
                />
              ) : (
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D97706, #B45309)',
                  color: '#FFFFFF',
                  fontSize: 32,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
                }}>
                  {getInitials()}
                </div>
              )}

              {/* Upload Badge Icon on Avatar */}
              <label
                htmlFor="avatar-upload-icon"
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#166534',
                  color: '#FFFFFF',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                title="Change Photo"
              >
                📷
              </label>
              <input
                type="file"
                id="avatar-upload-icon"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Upload Photo Outlined Button */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="avatar-upload-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 6,
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>⬆️</span> Upload Photo
              </label>
              <input
                type="file"
                id="avatar-upload-btn"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Full Name */}
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              {user?.fullName || fullName}
            </h2>

            {/* Role Badge */}
            <div style={{ marginBottom: 4 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: 12,
                background: 'rgba(22, 101, 52, 0.12)',
                color: '#166534',
                border: '1px solid rgba(22, 101, 52, 0.25)',
                display: 'inline-block'
              }}>
                {getRoleBadge()}
              </span>
            </div>

            {/* Email */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, wordBreak: 'break-all' }}>
              {user?.email || 'resident@palmera-hoa.com'}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowEditModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #166534, #15803D)',
                  borderColor: '#166534',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '9px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(22, 101, 52, 0.3)'
                }}
              >
                <span>✏️</span> Edit Profile Information
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '8px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>🔑</span> Change Password
              </button>
            </div>

            {/* Property & Account Meta List */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact No:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Division / Lot:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>
                  {user?.registeredBlock || 'Block 3'} {user?.registeredLot || 'Lot 12'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>User ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  NRG-{user?.id?.slice(0, 8) || '0312'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>HOA Cert:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#166534', fontSize: 11 }}>
                  PH-HOA-08942-VERIFIED
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Status:</span>
                <span style={{ fontWeight: 800, color: '#166534' }}>
                  ACTIVE & CERTIFIED
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Password Changed:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Recent</span>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: CARDS STACK                              */}
          {/* ══════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* CARD 1: ROLE PERMISSIONS & ACCESS MATRIX */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Role Permissions & Access Matrix
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    System scopes granted under HOA & Barangay governance security protocols
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {getPermissions().map((perm, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: 6,
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* CARD 2: SECURITY & 2FA SETTINGS */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    HOA Security & 2FA Settings
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Multi-factor authentication and active session governance
                  </p>
                </div>
              </div>

              {/* Row 1: HOA Digital Certificate 2FA */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                marginBottom: 12
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    HOA Verified Digital Certificate (2FA)
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Mandatory digital authentication for dues payments & service requests
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(22, 101, 52, 0.12)',
                  color: '#166534',
                  border: '1px solid rgba(22, 101, 52, 0.3)'
                }}>
                  ENABLED & VERIFIED
                </span>
              </div>

              {/* Row 2: Automatic Session Timeout */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Automatic Session Timeout
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Locks session after inactivity to protect private account records
                  </div>
                </div>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}>
                  30 Minutes
                </span>
              </div>
            </div>

            {/* CARD 3: ACTIVE LOGIN SESSIONS */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>💻</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Active Login Sessions
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Authorized devices and secure IP connections
                  </p>
                </div>
              </div>

              {/* Session 1: Current */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                marginBottom: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🌐</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Chrome on Windows 11 (Current)
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      IP: 192.168.1.45 • Northridge Grove Phase 2, SJDM
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(22, 101, 52, 0.12)',
                  color: '#166534',
                  border: '1px solid rgba(22, 101, 52, 0.3)'
                }}>
                  Active Now
                </span>
              </div>

              {/* Session 2: Mobile */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📱</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Safari on iPhone 15 Pro
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      IP: 112.198.102.88 • Resident Portal Mobile
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  2 hours ago
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* MODAL: EDIT PROFILE INFORMATION                        */}
        {/* ══════════════════════════════════════════════════════ */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div
              className="modal-box"
              style={{ maxWidth: 520, width: '100%', animation: 'scaleIn 0.2s ease' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">✏️ Edit Profile Information</div>
                <button type="button" className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      Full Legal Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      Mobile Contact Number <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email || 'resident@palmera-hoa.com'}
                      disabled
                      style={{ opacity: 0.7, background: 'var(--bg-hover)' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                      Email is linked to your verified Masterlist record.
                    </span>
                  </div>

                  {/* Preset Community Avatars */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
                      Or Pick From Preset Community Avatars:
                    </label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {PRESET_AVATARS.map(av => (
                        <img
                          key={av.id}
                          src={av.url}
                          alt={av.label}
                          onClick={() => handleSelectPreset(av.url)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: avatarPreview === av.url ? '3px solid #166534' : '2px solid var(--border)',
                            transform: avatarPreview === av.url ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                          title={av.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#166534', borderColor: '#166534' }} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : '💾 Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* MODAL: CHANGE PASSWORD                                 */}
        {/* ══════════════════════════════════════════════════════ */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div
              className="modal-box"
              style={{ maxWidth: 460, width: '100%', animation: 'scaleIn 0.2s ease' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">🔑 Change Account Password</div>
                <button type="button" className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>

              <form onSubmit={handleChangePasswordSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      Current Password <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      New Password <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>
                      Confirm New Password <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="toggle-pwd-visibility"
                      checked={showPasswords}
                      onChange={e => setShowPasswords(e.target.checked)}
                    />
                    <label htmlFor="toggle-pwd-visibility" style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Show password characters
                    </label>
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#166534', borderColor: '#166534' }} disabled={isChangingPassword}>
                    {isChangingPassword ? 'Updating...' : '🔒 Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
