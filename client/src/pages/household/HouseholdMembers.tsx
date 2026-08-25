import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiCall } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';

interface HouseholdMember {
  id: string;
  tenant_id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  gender: string;
  birthdate?: string;
  age?: number;
  contact_number?: string;
  email?: string;
  occupation?: string;
  is_emergency_contact: number;
  has_rfid_access: number;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

const RELATIONSHIP_OPTIONS = [
  'Head of Household (Owner)',
  'Spouse',
  'Dependent (Child)',
  'Parent (Senior Citizen)',
  'Sibling',
  'Relative',
  'Tenant / Renter',
  'Household Staff / Helper / Driver',
  'Other',
];

const getRelationshipColor = (rel: string) => {
  if (rel.includes('Head') || rel.includes('Owner')) return { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.3)' };
  if (rel.includes('Spouse')) return { bg: 'rgba(22, 101, 52, 0.12)', text: '#166534', border: 'rgba(22, 101, 52, 0.3)' };
  if (rel.includes('Child') || rel.includes('Dependent')) return { bg: 'rgba(37, 99, 235, 0.12)', text: '#2563EB', border: 'rgba(37, 99, 235, 0.3)' };
  if (rel.includes('Senior') || rel.includes('Parent')) return { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706', border: 'rgba(217, 119, 6, 0.3)' };
  if (rel.includes('Tenant')) return { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.3)' };
  return { bg: 'rgba(100, 116, 139, 0.12)', text: '#64748B', border: 'rgba(100, 116, 139, 0.3)' };
};

const getInitials = (name: string) => {
  if (!name) return 'HM';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function HouseholdMembers() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();

  const { data: members, isLoading: loading, refetch } = useApi<HouseholdMember[]>('/api/household');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRel, setSelectedRel] = useState('ALL');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [filterRfidOnly, setFilterRfidOnly] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRel, setFormRel] = useState('Dependent (Child)');
  const [formGender, setFormGender] = useState('Male');
  const [formBirthdate, setFormBirthdate] = useState('');
  const [formAge, setFormAge] = useState<number | ''>('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formEmergency, setFormEmergency] = useState(false);
  const [formRfid, setFormRfid] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<HouseholdMember | null>(null);

  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormRel('Dependent (Child)');
    setFormGender('Male');
    setFormBirthdate('');
    setFormAge('');
    setFormContact('');
    setFormEmail('');
    setFormOccupation('');
    setFormEmergency(false);
    setFormRfid(false);
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (member: HouseholdMember) => {
    setEditingMember(member);
    setFormName(member.full_name);
    setFormRel(member.relationship);
    setFormGender(member.gender || 'Male');
    setFormBirthdate(member.birthdate || '');
    setFormAge(member.age ?? '');
    setFormContact(member.contact_number || '');
    setFormEmail(member.email || '');
    setFormOccupation(member.occupation || '');
    setFormEmergency(!!member.is_emergency_contact);
    setFormRfid(!!member.has_rfid_access);
    setFormNotes(member.notes || '');
    setShowModal(true);
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormBirthdate(val);
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let calculatedAge = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setFormAge(calculatedAge >= 0 ? calculatedAge : 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError('Validation Error', 'Please enter the member full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formName.trim(),
        relationship: formRel,
        gender: formGender,
        birthdate: formBirthdate || undefined,
        age: formAge !== '' ? Number(formAge) : undefined,
        contactNumber: formContact.trim(),
        email: formEmail.trim(),
        occupation: formOccupation.trim(),
        isEmergencyContact: formEmergency,
        hasRfidAccess: formRfid,
        notes: formNotes.trim(),
      };

      if (editingMember) {
        await apiCall(`/api/household/${editingMember.id}`, 'PUT', payload, accessToken || undefined);
        success('Member Updated! ✏️', `${formName} records have been updated.`);
      } else {
        await apiCall('/api/household', 'POST', payload, accessToken || undefined);
        success('Member Registered! 👨‍👩‍👧‍👦', `${formName} has been added to your household directory.`);
      }

      setShowModal(false);
      refetch();
    } catch (err: any) {
      showError('Submission Failed', err.message || 'Unable to save member details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiCall(`/api/household/${deleteTarget.id}`, 'DELETE', {}, accessToken || undefined);
      success('Member Removed', `${deleteTarget.full_name} was removed from household records.`);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  };

  // Metrics Calculations
  const allMembers = members || [];
  const totalCount = allMembers.length;
  const emergencyCount = allMembers.filter(m => m.is_emergency_contact === 1).length;
  const rfidCount = allMembers.filter(m => m.has_rfid_access === 1).length;
  const seniorsOrMinorsCount = allMembers.filter(m => (m.age !== undefined && (m.age < 18 || m.age >= 60))).length;

  // Filtered list
  const filteredMembers = allMembers.filter(m => {
    const matchesSearch =
      !searchQuery ||
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.contact_number && m.contact_number.includes(searchQuery)) ||
      (m.occupation && m.occupation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRel = selectedRel === 'ALL' || m.relationship === selectedRel;
    const matchesEmergency = !filterEmergencyOnly || m.is_emergency_contact === 1;
    const matchesRfid = !filterRfidOnly || m.has_rfid_access === 1;

    return matchesSearch && matchesRel && matchesEmergency && matchesRfid;
  });

  return (
    <PageContainer
      title="Household Members Directory"
      subtitle={`NRG PH2 HOA INC — Registered Occupants & Dependents for ${user?.fullName || 'Resident'}`}
    >
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>

        {/* ── TOP STATS BAR ── */}
        <div className="grid grid-4 mb-6">
          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</span>
              <span className="badge badge-primary" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                Registered
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Total Household Members
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>🚨</span>
              <span className="badge badge-primary" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                Critical
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>
              {emergencyCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Emergency Contacts on File
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>🚗</span>
              <span className="badge badge-primary" style={{ background: 'rgba(22, 101, 52, 0.1)', color: '#166534', border: '1px solid rgba(22, 101, 52, 0.25)' }}>
                Gate Access
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#166534', letterSpacing: '-0.02em' }}>
              {rfidCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              RFID Boom Barrier Passes
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>🧓</span>
              <span className="badge badge-primary" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                Special Care
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#D97706', letterSpacing: '-0.02em' }}>
              {seniorsOrMinorsCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Seniors & Minors
            </div>
          </div>
        </div>

        {/* ── CONTROLS & FILTER BAR ── */}
        <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '18px 22px' }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap" style={{ flex: 1, minWidth: 280 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="🔍 Search by name, phone, relationship, occupation..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, height: 42 }}
                />
                <span style={{ position: 'absolute', left: 12, top: 12, fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
              </div>

              <select
                className="form-select"
                value={selectedRel}
                onChange={e => setSelectedRel(e.target.value)}
                style={{ width: 220, height: 42 }}
              >
                <option value="ALL">All Relationships</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <button
                className={`btn btn-sm ${filterEmergencyOnly ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 9,
                  background: filterEmergencyOnly ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'var(--bg-hover)',
                  color: filterEmergencyOnly ? '#FFFFFF' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontWeight: 700,
                  fontSize: 12,
                }}
                onClick={() => setFilterEmergencyOnly(prev => !prev)}
              >
                🚨 Emergency Contacts {filterEmergencyOnly ? '✓' : ''}
              </button>

              <button
                className={`btn btn-sm ${filterRfidOnly ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 9,
                  background: filterRfidOnly ? 'linear-gradient(135deg, #166534, #15803D)' : 'var(--bg-hover)',
                  color: filterRfidOnly ? '#FFFFFF' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontWeight: 700,
                  fontSize: 12,
                }}
                onClick={() => setFilterRfidOnly(prev => !prev)}
              >
                🚗 RFID Pass Holders {filterRfidOnly ? '✓' : ''}
              </button>
            </div>

            <div>
              <button
                className="btn btn-primary"
                onClick={openAddModal}
                style={{
                  background: 'linear-gradient(135deg, #166534, #15803D)',
                  color: '#FFFFFF',
                  padding: '11px 22px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13.5,
                  boxShadow: '0 4px 14px rgba(22, 101, 52, 0.35)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                + Register New Member
              </button>
            </div>
          </div>
        </div>

        {/* ── MEMBERS DIRECTORY GRID ── */}
        {loading ? (
          <div className="card text-center" style={{ padding: '60px 0', background: 'var(--bg-surface)' }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
            <p className="text-muted">Loading household directory...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card empty-state text-center" style={{ padding: '60px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800 }}>No Household Members Found</h3>
            <p className="text-muted" style={{ maxWidth: 450, margin: '8px auto 20px' }}>
              {searchQuery || selectedRel !== 'ALL' || filterEmergencyOnly || filterRfidOnly
                ? 'No registered household members match your active filter criteria.'
                : 'You have not registered any additional occupants or dependents under your household profile.'}
            </p>
            <button className="btn btn-primary" onClick={openAddModal} style={{ background: 'linear-gradient(135deg, #166534, #15803D)', border: 'none', fontWeight: 800 }}>
              + Add First Household Member
            </button>
          </div>
        ) : (
          <div className="grid grid-2 gap-4">
            {filteredMembers.map(member => {
              const relTheme = getRelationshipColor(member.relationship);
              const initials = getInitials(member.full_name);

              return (
                <div
                  key={member.id}
                  className="card hover-lift"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '22px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Header Row with Avatar + Tags */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${relTheme.text}, #1F2937)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 900,
                            color: '#FFFFFF',
                            boxShadow: `0 4px 14px ${relTheme.border}`,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {member.full_name}
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: relTheme.bg,
                                color: relTheme.text,
                                border: `1px solid ${relTheme.border}`,
                              }}
                            >
                              {member.relationship}
                            </span>
                            {member.gender && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                • {member.gender}
                              </span>
                            )}
                            {member.age !== undefined && member.age !== null && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                • {member.age} yrs old
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-sm"
                          onClick={() => openEditModal(member)}
                          title="Edit Member"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => setDeleteTarget(member)}
                          title="Remove Member"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: 'rgba(220, 38, 38, 0.08)',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            color: '#DC2626',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12.5 }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Contact Number</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{member.contact_number || '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{member.email || '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Occupation / School</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{member.occupation || '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Date of Birth</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{member.birthdate || '—'}</span>
                      </div>
                    </div>

                    {member.notes && (
                      <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                        💬 <strong>Note:</strong> {member.notes}
                      </div>
                    )}
                  </div>

                  {/* Badges Footer */}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {member.is_emergency_contact === 1 ? (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                        🚨 Emergency Contact
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 6, background: 'var(--bg-hover)' }}>
                        Standard Member
                      </span>
                    )}

                    {member.has_rfid_access === 1 && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(22, 101, 52, 0.12)', color: '#166534', border: '1px solid rgba(22, 101, 52, 0.3)' }}>
                        🚗 RFID Gate Pass Enabled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADD / EDIT MEMBER MODAL ── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: '100%', animation: 'scaleIn 0.2s ease' }}>
              <div className="modal-header">
                <div className="modal-title">
                  {editingMember ? '✏️ Edit Household Member' : '👨‍👩‍👧‍👦 Register Household Member'}
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                {/* Household Data Privacy Notice */}
                <div style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 14
                }}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Household Data Protection (R.A. 10173):</strong> By registering family members, dependents, or domestic staff, you confirm consent to record their demographic, gate access, and emergency contact details for community security and emergency response.
                  </span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Maria Santos Dela Cruz"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div>
                      <label className="form-label">Relationship to Owner *</label>
                      <select
                        className="form-select"
                        value={formRel}
                        onChange={e => setFormRel(e.target.value)}
                      >
                        {RELATIONSHIP_OPTIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={formGender}
                        onChange={e => setFormGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div>
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formBirthdate}
                        onChange={handleBirthdateChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Age (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        className="form-input"
                        placeholder="e.g. 14"
                        value={formAge}
                        onChange={e => setFormAge(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div>
                      <label className="form-label">Contact Mobile Number</label>
                      <input
                        className="form-input"
                        placeholder="e.g. 0917-890-1234"
                        value={formContact}
                        onChange={e => setFormContact(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. member@email.com"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Occupation / School / Affiliation</label>
                    <input
                      className="form-input"
                      placeholder="e.g. High School Student / Registered Nurse"
                      value={formOccupation}
                      onChange={e => setFormOccupation(e.target.value)}
                    />
                  </div>

                  {/* Checkbox Options */}
                  <div style={{ background: 'var(--bg-hover)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={formEmergency}
                        onChange={e => setFormEmergency(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#DC2626' }}
                      />
                      <span>🚨 Designate as Primary Emergency Contact</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={formRfid}
                        onChange={e => setFormRfid(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#166534' }}
                      />
                      <span>🚗 Request RFID Gate Barrier / Vehicle Pass Access</span>
                    </label>
                  </div>

                  <div>
                    <label className="form-label">Special Notes / Medical / Instructions</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Any medical allergies, vehicle plate numbers, or gate instructions..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{ background: 'linear-gradient(135deg, #166534, #15803D)', border: 'none', fontWeight: 800 }}
                    >
                      {isSubmitting ? 'Saving...' : editingMember ? 'Save Changes' : '✓ Register Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, width: '100%', animation: 'scaleIn 0.2s ease' }}>
              <div className="modal-header">
                <div className="modal-title" style={{ color: '#DC2626' }}>🗑️ Remove Household Member</div>
                <button onClick={() => setDeleteTarget(null)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 16 }}>
                  Are you sure you want to remove <strong>{deleteTarget.full_name}</strong> ({deleteTarget.relationship}) from your household records?
                </p>
                <div className="flex justify-end gap-2">
                  <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleDelete} style={{ background: '#DC2626', border: 'none', fontWeight: 800 }}>
                    Confirm Removal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
