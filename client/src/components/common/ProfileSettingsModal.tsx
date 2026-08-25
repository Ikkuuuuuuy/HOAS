import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Male Resident', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-2', label: 'Female Resident', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-3', label: 'HOA Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-4', label: 'Admin Staff', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-5', label: 'Security Lead', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&h=200&fit=crop&crop=faces' },
  { id: 'av-6', label: 'Community Leader', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
];

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '0917-890-1234');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select an image file (JPG, PNG, WEBP).');
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
      success('Photo Selected!', 'Click "Save Profile" to apply changes.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarPreview
      });
      success('Profile Updated! ✓', 'Profile details and photo updated successfully.');
      onClose();
    } catch {
      showError('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showError('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        success('Password Changed! 🔑', res.message || 'Account password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        showError('Update Failed', res.message || 'Could not update password.');
      }
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          animation: 'scaleUp 0.2s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Profile & Security Settings
              </h2>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                {user?.fullName || 'User'} • {(user?.roleName || '').replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              fontSize: 20,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.5)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'profile' ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
              borderBottom: activeTab === 'profile' ? '2px solid #DC2626' : 'none',
              color: activeTab === 'profile' ? '#FFF' : '#94A3B8',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>📷</span> Profile & Photo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'password' ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
              borderBottom: activeTab === 'password' ? '2px solid #DC2626' : 'none',
              color: activeTab === 'password' ? '#FFF' : '#94A3B8',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>🔒</span> Change Password
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Photo selector box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FBBF24', marginBottom: 10 }}>
                  Profile Picture
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22C55E' }}
                    />
                  ) : (
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                      color: '#FFF', fontSize: 24, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {fullName.charAt(0) || 'U'}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label
                      htmlFor="modal-avatar-file-upload"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.12)',
                        color: '#FFF',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      📁 Upload Photo
                    </label>
                    <input
                      type="file"
                      id="modal-avatar-file-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview('')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid #EF4444',
                          color: '#FCA5A5',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatars */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>
                    Or select a community avatar preset:
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarPreview(av.url)}
                        style={{
                          padding: 2,
                          borderRadius: '50%',
                          border: avatarPreview === av.url ? '2px solid #22C55E' : '1px solid rgba(255,255,255,0.15)',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Full Name <span className="req-star">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Mobile Contact Number <span className="req-star">*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ background: '#166534', border: 'none', fontWeight: 800 }}>
                  {isSaving ? 'Saving...' : '💾 Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#FDE68A' }}>
                🔒 Enter your current password followed by your new password (minimum 6 characters).
              </div>

              <div>
                <label className="form-label">Current Password <span className="req-star">*</span></label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">New Password <span className="req-star">*</span></label>
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
                <label className="form-label">Confirm New Password <span className="req-star">*</span></label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="modal-show-pwd"
                  checked={showPasswords}
                  onChange={e => setShowPasswords(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#DC2626' }}
                />
                <label htmlFor="modal-show-pwd" style={{ fontSize: 12, color: '#E2E8F0', cursor: 'pointer' }}>
                  Show Passwords
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ background: '#DC2626', border: 'none', fontWeight: 800 }}>
                  {isSaving ? 'Updating...' : '🔒 Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
