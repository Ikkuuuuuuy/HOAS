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
    const parts = (user.fullName || '').trim().split(' ').filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    return String(user.fullName || 'RD').slice(0, 2).toUpperCase();
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
      title="Member Profile & HOA Credentials"
      subtitle="Official resident membership records, verified property credentials, and security settings"
    >
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>

        {/* ── TOP RESIDENT IDENTITY PASSPORT CARD ── */}
        <div className="card mb-6" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Green Accent Stripe on top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #16A34A, #15803D, #D97706)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            {/* Left: Avatar + Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.fullName}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #16A34A',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #064E3B, #0D4A36)',
                    color: '#FCD34D',
                    fontSize: 28,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {getInitials()}
                  </div>
                )}

                <label
                  htmlFor="avatar-passport-upload"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: '2px solid var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                  title="Upload Custom Photo"
                >
                  📷
                </label>
                <input
                  type="file"
                  id="avatar-passport-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {user?.fullName || fullName}
                  </h1>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: 'rgba(22, 163, 74, 0.12)',
                    color: '#16A34A',
                    border: '1px solid rgba(22, 163, 74, 0.3)'
                  }}>
                    ✓ {getRoleBadge()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <span>✉️ {user?.email || 'resident@palmera-hoa.com'}</span>
                  <span>•</span>
                  <span>📞 {phone}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    🏡 {user?.registeredBlock || 'Block 3'} {user?.registeredLot || 'Lot 12'}, Northridge Grove Ph2
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowEditModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: '9px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 10px rgba(22, 163, 74, 0.3)'
                }}
              >
                <span>✏️</span> Edit Profile
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: '9px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🔑</span> Change Password
              </button>
            </div>
          </div>

          {/* Bottom Highlights Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-hover)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>HOA REGISTRY STATUS</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>
                ✓ Active & Good Standing
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-hover)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RFID GATE ACCESS</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>
                🚗 Enabled (Tag #RFID-8832)
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN BALANCED FEATURE GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          alignItems: 'start'
        }}>

          {/* ══════════════════════════════════════════════════════ */}
          {/* COLUMN 1: GOVERNANCE & COMMUNITY PRIVILEGES           */}
          {/* ══════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card: Community Access Matrix */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Governance & Member Privileges
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Active community scopes authorized for your property
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getPermissions().map((perm, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Data Protection Compliance */}
            <div className="card" style={{
              background: 'rgba(22, 101, 52, 0.06)',
              border: '1px solid rgba(22, 101, 52, 0.25)',
              borderRadius: 14,
              padding: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 22 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>
                    Republic Act 10173 (Data Privacy Act of 2012)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                    Your personal information, lot ownership records, and contact details are strictly encrypted under tenant isolation guidelines.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* COLUMN 2: ACTIVE SESSIONS & DEVICE AUDIT               */}
          {/* ══════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Card: Active Devices & Logins */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>💻</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Active Authorized Devices
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Currently verified browser sessions
                  </p>
                </div>
              </div>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🌐</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Chrome on Windows 11
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      IP: 192.168.1.45 • Current Portal Session
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(22, 101, 52, 0.12)',
                  color: '#166534',
                  border: '1px solid rgba(22, 101, 52, 0.3)'
                }}>
                  Active
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📱</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Safari on iPhone 15 Pro
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      IP: 112.198.102.88 • Mobile Access
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                  2h ago
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
