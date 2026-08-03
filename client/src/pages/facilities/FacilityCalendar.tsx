import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi, apiCall } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const TIME_SLOTS = [
  { id: 's1', label: '08:00 AM – 10:00 AM', startHour: 8, endHour: 10 },
  { id: 's2', label: '10:00 AM – 12:00 PM', startHour: 10, endHour: 12 },
  { id: 's3', label: '12:00 PM – 02:00 PM', startHour: 12, endHour: 14 },
  { id: 's4', label: '02:00 PM – 04:00 PM', startHour: 14, endHour: 16 },
  { id: 's5', label: '04:00 PM – 06:00 PM', startHour: 16, endHour: 18 },
  { id: 's6', label: '06:00 PM – 08:00 PM', startHour: 18, endHour: 20 },
  { id: 's7', label: '08:00 PM – 10:00 PM', startHour: 20, endHour: 22 },
];

export default function FacilityCalendar() {
  const { user, accessToken } = useAuth();
  const { data: facilities } = useApi<any[]>('/api/facilities');
  const { data: reservations, refetch } = useApi<any[]>('/api/facilities/reservations');
  const { success, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  const [form, setForm] = useState({
    facilityId: '',
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canApprove = user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin';
  const canBook = user?.roleName === 'resident' || canApprove;

  // Helper to check if a specific slot is booked for a facility on a date
  const getSlotBookingStatus = (facilityId: string, dateStr: string, startHour: number, endHour: number) => {
    if (!reservations || !facilityId || !dateStr) return null;

    const slotStart = new Date(`${dateStr}T${startHour.toString().padStart(2, '0')}:00:00`);
    const slotEnd = new Date(`${dateStr}T${endHour.toString().padStart(2, '0')}:00:00`);

    const match = reservations.find((r: any) => {
      if (r.facility_id !== facilityId) return false;
      if (r.status === 'rejected' || r.status === 'cancelled') return false;

      const rStart = new Date(r.start_time);
      const rEnd = new Date(r.end_time);

      return rStart < slotEnd && rEnd > slotStart;
    });

    return match || null;
  };

  const handleSelectSlot = (slot: typeof TIME_SLOTS[0], isTaken: boolean) => {
    if (isTaken) return; // Blocked slot

    setSelectedSlotId(slot.id);

    const startIso = `${selectedDate}T${slot.startHour.toString().padStart(2, '0')}:00`;
    const endIso = `${selectedDate}T${slot.endHour.toString().padStart(2, '0')}:00`;

    setForm(f => ({
      ...f,
      startTime: startIso,
      endTime: endIso,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      showError('Time Slot Required', 'Please click an available green time slot block above.');
      return;
    }

    setIsSubmitting(true);
    setConflictInfo(null);
    try {
      await apiCall('/api/facilities/reservations', 'POST', {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      }, accessToken || undefined);
      success('Booking Submitted! 📅', 'Your reservation has been submitted successfully.');
      setShowModal(false);
      setForm({ facilityId: '', title: '', startTime: '', endTime: '', notes: '' });
      setSelectedSlotId('');
      refetch();
    } catch (err: any) {
      if (err.message.includes('conflict') || err.message.includes('Time slot')) {
        setConflictInfo({ message: err.message });
        showError('Booking Conflict!', 'This time slot is already reserved. Please choose an available green slot.');
      } else {
        showError('Booking Failed', err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (resId: string, status: string) => {
    try {
      await apiCall(`/api/facilities/reservations/${resId}/status`, 'PATCH', { status }, accessToken || undefined);
      success(`Reservation ${status}`, `The reservation has been ${status}.`);
      refetch();
    } catch (err: any) {
      showError('Update Failed', err.message);
    }
  };

  // Group reservations by facility
  const reservationsByFacility = (facilities || []).map(facility => ({
    facility,
    reservations: (reservations || []).filter(r => r.facility_id === facility.id),
  }));

  return (
    <PageContainer title="Facility Booking" subtitle="Schedule & Manage Community Amenities">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* Top Header & Clean Amenity Summary Cards */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-4 flex-wrap">
            {facilities?.map(f => (
              <div key={f.id} className="card" style={{ padding: 'var(--space-4) var(--space-6)', minWidth: 200, textAlign: 'center', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ fontSize: '1.8rem' }}>
                  {f.name.includes('Clubhouse') ? '🏠' : f.name.includes('Basketball') ? '🏀' : f.name.includes('Pool') ? '🏊' : f.name.includes('Hall') ? '🏛' : '🏢'}
                </div>
                <div className="font-bold text-sm" style={{ color: '#FFF', marginTop: 6 }}>{f.name}</div>
                <div className="text-xs text-muted" style={{ color: '#9CA3AF', marginTop: 2 }}>Cap: {f.capacity} Persons</div>
              </div>
            ))}
          </div>

          {canBook && (
            <button id="new-booking-btn" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800, padding: '12px 24px' }} onClick={() => {
              if (facilities && facilities.length > 0 && !form.facilityId) {
                setForm(f => ({ ...f, facilityId: facilities[0].id }));
              }
              setShowModal(true);
            }}>
              + Book Facility
            </button>
          )}
        </div>

        {/* CLEAN INFORMATIONAL NOTICE BANNER */}
        <div className="card mb-6" style={{ background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '14px 20px', borderRadius: 10 }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: '#93C5FD', lineHeight: 1.4 }}>
              <strong style={{ color: '#FFF' }}>Automatic Time Slot Collision Protection Active:</strong> When booking a facility, taken time slots are automatically locked in 🔴 Red (disabled from being clicked) so double-bookings are prevented.
            </div>
          </div>
        </div>

        {/* Existing Reservations Table */}
        {reservationsByFacility.map(({ facility, reservations: res }) => (
          res.length > 0 && (
            <div key={facility.id} className="card" style={{ marginBottom: 'var(--space-6)', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="section-title" style={{ color: '#FFF' }}>
                {facility.name.includes('Clubhouse') ? '🏠' : facility.name.includes('Basketball') ? '🏀' : facility.name.includes('Pool') ? '🏊' : '🏛'} {facility.name}
                <span className="text-xs text-muted" style={{ textTransform: 'none', letterSpacing: 'normal', color: '#9CA3AF', marginLeft: 8 }}>
                  ({res.length} active reservation{res.length !== 1 ? 's' : ''})
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Reserved By</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    {canApprove && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {res.map((r: any) => (
                    <tr key={r.id}>
                      <td className="font-semibold" style={{ color: '#FFF' }}>{r.title}</td>
                      <td>{r.reserved_by_name || 'Homeowner Resident'}</td>
                      <td className="text-xs" style={{ color: '#D1D5DB' }}>{new Date(r.start_time).toLocaleString('en-PH')}</td>
                      <td className="text-xs" style={{ color: '#D1D5DB' }}>{new Date(r.end_time).toLocaleString('en-PH')}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      {canApprove && (
                        <td>
                          <div className="flex gap-2">
                            {r.status === 'pending' && (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(r.id, 'approved')}>✓ Approve</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(r.id, 'rejected')}>✕ Reject</button>
                              </>
                            )}
                            {(r.status === 'approved' || r.status === 'pending') && (
                              <button className="btn btn-sm btn-secondary" onClick={() => handleStatusUpdate(r.id, 'cancelled')}>Cancel</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}

        {(!reservations || reservations.length === 0) && (
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3 style={{ color: '#FFF' }}>No active facility reservations</h3>
              <p style={{ color: '#9CA3AF' }}>Click "+ Book Facility" above to schedule a reservation slot.</p>
            </div>
          </div>
        )}

        {/* BOOKING MODAL WITH CLEAN TIME SLOT PICKER */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ color: '#FFF' }}>📅 Book Facility Time Slot</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              {conflictInfo && (
                <div className="login-error" style={{ marginBottom: 16, background: 'rgba(220,38,38,0.2)', border: '1px solid #DC2626', padding: 12, borderRadius: 8 }}>
                  <span>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FFF' }}>Booking Conflict Detected!</div>
                    <div style={{ fontSize: '12px', color: '#FCA5A5', marginTop: 2 }}>
                      This facility is already reserved for that time slot. Please pick an available green slot.
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Select Facility</label>
                    <select
                      className="form-select"
                      value={form.facilityId}
                      onChange={e => {
                        setForm(f => ({ ...f, facilityId: e.target.value }));
                        setSelectedSlotId('');
                      }}
                      required
                    >
                      <option value="">— Select Facility —</option>
                      {facilities?.map(f => (
                        <option key={f.id} value={f.id}>{f.name} (Cap: {f.capacity})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reservation Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={selectedDate}
                      onChange={e => {
                        setSelectedDate(e.target.value);
                        setSelectedSlotId('');
                      }}
                      required
                    />
                  </div>
                </div>

                {/* TIME SLOT PICKER IN MODAL ONLY */}
                {form.facilityId && (
                  <div>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Select Available Time Slot:</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>🔴 Red = Taken · 🟢 Green = Open</span>
                    </label>

                    <div className="grid grid-2 gap-2" style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                      {TIME_SLOTS.map(slot => {
                        const booked = getSlotBookingStatus(form.facilityId, selectedDate, slot.startHour, slot.endHour);
                        const isTaken = !!booked;
                        const isSelected = selectedSlotId === slot.id;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleSelectSlot(slot, isTaken)}
                            style={{
                              padding: '12px 14px', borderRadius: 8,
                              background: isTaken
                                ? 'rgba(220, 38, 38, 0.18)'
                                : isSelected
                                ? 'rgba(124, 58, 237, 0.3)'
                                : 'rgba(34, 197, 94, 0.12)',
                              border: isTaken
                                ? '1.5px solid #DC2626'
                                : isSelected
                                ? '2px solid #7C3AED'
                                : '1.5px solid #22C55E',
                              cursor: isTaken ? 'not-allowed' : 'pointer',
                              opacity: isTaken ? 0.6 : 1,
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: isTaken ? '#FCA5A5' : isSelected ? '#A78BFA' : '#86EFAC' }}>
                                {slot.label}
                              </div>
                              <div style={{ fontSize: 10, color: isTaken ? '#EF4444' : '#9CA3AF', marginTop: 2 }}>
                                {isTaken ? `🚫 TAKEN by ${booked.reserved_by_name || 'Resident'}` : isSelected ? '✓ SLOT SELECTED' : '🟢 Click to Select'}
                              </div>
                            </div>
                            <div>
                              {isTaken ? (
                                <span style={{ fontSize: 14 }}>🔒</span>
                              ) : isSelected ? (
                                <span style={{ fontSize: 14, color: '#A78BFA' }}>✓</span>
                              ) : (
                                <span style={{ fontSize: 14, color: '#22C55E' }}>+</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Event / Activity Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Birthday Party, HOA Board Meeting"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes or Special Requirements (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g., Audio equipment setup needed..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary mr-2" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800 }} disabled={isSubmitting || !form.startTime}>
                    {isSubmitting ? 'Submitting...' : '📅 Confirm Booking'}
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
