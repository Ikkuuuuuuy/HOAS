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

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
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
      success('Photo Selected!', 'Click "Save Profile Changes" to apply your new profile photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    success('Avatar Selected!', 'Click "Save Profile Changes" to update your profile photo.');
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    success('Photo Removed', 'Reverted to default initial letter avatar.');
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
      success('Profile Updated! ✓', 'Your name, contact details, and profile photo have been saved.');
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
      } else {
        showError('Update Failed', res.message || 'Could not change password.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.roleName) {
      case 'super_admin': return { bg: 'rgba(245,158,11,0.2)', color: '#FBBF24', border: '#F59E0B' };
      case 'hoa_admin': return { bg: 'rgba(22,101,52,0.2)', color: '#86EFAC', border: '#22C55E' };
      case 'admin_staff': return { bg: 'rgba(59,130,246,0.2)', color: '#93C5FD', border: '#3B82F6' };
      case 'security_guard': return { bg: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '#EF4444' };
      default: return { bg: 'rgba(16,185,129,0.2)', color: '#6EE7B7', border: '#10B981' };
    }
  };

  const roleMeta = getRoleBadgeColor();

  return (
    <PageContainer
      title="User Profile & Account Security"
      subtitle="Manage your profile picture, personal details, password, and security preferences"
    >
      <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeInUp 0.3s ease' }}>

        {/* ── TOP USER IDENTITY CARD ── */}
        <div className="card" style={{
          padding: '24px',
          marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar container */}
            <div style={{ position: 'relative' }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.fullName}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #22C55E',
                    boxShadow: '0 0 16px rgba(34,197,94,0.4)'
                  }}
                />
              ) : (
                <div style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                  color: '#FFFFFF',
                  fontSize: 34,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#22C55E',
                border: '3px solid #0F172A',
                boxShadow: '0 0 8px rgba(34,197,94,0.6)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  {user?.fullName}
                </h1>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: roleMeta.bg,
                  color: roleMeta.color,
                  border: `1px solid ${roleMeta.border}`
                }}>
                  {user?.roleName?.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                ✉️ {user?.email} • 🏢 {user?.tenantName}
              </div>
              <div style={{ fontSize: 12, color: '#FBBF24', marginTop: 2, fontWeight: 700 }}>
                🏠 {user?.registeredBlock || 'Block 3'} {user?.registeredLot || 'Lot 12'}, Northridge Grove Phase 2
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <label
              htmlFor="quick-avatar-upload"
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #166534, #15803D)',
                color: '#FFF',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(22,101,52,0.4)',
                border: 'none'
              }}
            >
              <span>📷</span> Change Photo
            </label>
            <input
              type="file"
              id="quick-avatar-upload"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 8
        }}>
          {[
            { id: 'profile', label: '👤 Profile & Photo', icon: '📷' },
            { id: 'password', label: '🔑 Change Password', icon: '🔒' },
            { id: 'security', label: '🛡️ Privacy & Clearance', icon: '📜' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === t.id ? '#DC2626' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: activeTab === t.id ? '0 4px 14px rgba(220,38,38,0.4)' : 'none'
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: PROFILE PICTURE & DETAILS ── */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📷</span> Profile Picture & Personal Details
            </h3>

            {/* Avatar Selection & Preset Gallery */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '20px',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FBBF24', marginBottom: 12 }}>
                1. Select or Upload Profile Picture
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22C55E' }}
                  />
                ) : (
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    color: '#FFF', fontSize: 28, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {fullName.charAt(0) || 'U'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <label
                    htmlFor="main-avatar-upload"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.12)',
                      color: '#FFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    📁 Upload Image from Device (Max 5MB)
                  </label>
                  <input
                    type="file"
                    id="main-avatar-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid #EF4444',
                        color: '#FCA5A5',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Gallery */}
              <div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', marginBottom: 10 }}>
                  Or pick from high-definition preset community avatars:
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectPreset(av.url)}
                      style={{
                        padding: 4,
                        borderRadius: '50%',
                        border: avatarPreview === av.url ? '3px solid #22C55E' : '2px solid rgba(255,255,255,0.15)',
                        background: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: avatarPreview === av.url ? '0 0 10px rgba(34,197,94,0.5)' : 'none'
                      }}
                      title={av.label}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">
                    Full Legal Name <span className="req-star">*</span>
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
                  <label className="form-label">
                    Mobile Contact Number <span className="req-star">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Email Address (Login ID)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 3, display: 'block' }}>
                    Email is linked to your verified Masterlist record.
                  </span>
                </div>

                <div>
                  <label className="form-label">Subdivision Property</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`${user?.registeredBlock || 'Block 3'} ${user?.registeredLot || 'Lot 12'}, Northridge Grove Phase 2`}
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #166534, #15803D)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(22,101,52,0.4)'
                  }}
                >
                  {isSavingProfile ? 'Saving Changes...' : '💾 Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: CHANGE PASSWORD ── */}
        {activeTab === 'password' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔑</span> Change Account Password
            </h3>

            <div style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              padding: '14px 18px',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 12.5,
              color: '#FDE68A'
            }}>
              🔒 <strong>Security Standard:</strong> Use at least 6 characters with a combination of letters, numbers, and symbols to ensure optimal account protection.
            </div>

            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
              <div>
                <label className="form-label">
                  Current Password <span className="req-star">*</span>
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your existing password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  New Password <span className="req-star">*</span>
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Minimum 6 characters"
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
                  type={showPasswords ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <input
                  type="checkbox"
                  id="show-pwd-checkbox"
                  checked={showPasswords}
                  onChange={e => setShowPasswords(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#DC2626' }}
                />
                <label htmlFor="show-pwd-checkbox" style={{ fontSize: 12, color: '#E2E8F0', cursor: 'pointer' }}>
                  Show Passwords
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(220,38,38,0.4)'
                  }}
                >
                  {isChangingPassword ? 'Updating Password...' : '🔒 Update Account Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: PRIVACY & CLEARANCE ── */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛡️</span> Security Clearance & Data Privacy Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: 18, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>ACCOUNT ACCESS LEVEL</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#86EFAC', marginTop: 4 }}>
                  {user?.roleName?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 6 }}>
                  Role permissions active for {user?.tenantName}.
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: 18, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>DATA PRIVACY PROTECTION</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#38BDF8', marginTop: 4 }}>
                  R.A. 10173 Compliant
                </div>
                <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 6 }}>
                  PII and Sensitive ID photos protected in Encrypted Vault.
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(22, 101, 52, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '16px 20px',
              borderRadius: 10,
              fontSize: 12.5,
              color: '#D1FAE5',
              lineHeight: 1.6
            }}>
              ✓ <strong>Continuous Session Protection:</strong> Your account password and profile changes are automatically synchronized and encrypted across portal sessions.
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
