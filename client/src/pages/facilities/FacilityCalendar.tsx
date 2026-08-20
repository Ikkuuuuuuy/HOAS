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
  
  // Default to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<typeof TIME_SLOTS[0] | null>(null);
  const [bookingFor, setBookingFor] = useState<'household' | 'guest' | 'admin_event'>('household');

  const [tableFilter, setTableFilter] = useState<'all' | 'approved' | 'pending' | 'mine'>('all');

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

  // EXCLUSIVELY BASKETBALL COURT ONLY
  const basketballFacility = {
    id: 'fac-basketball-ph2',
    name: 'NRG PH2 Covered Basketball & Sports Court',
    description: 'Phase 2 Covered Court with LED Night Lights, Scoreboard & Spectator Bleachers',
    capacity: 100,
    hourly_rate: 0
  };

  // Helper to check if a specific slot is booked on selected date
  const getSlotBookingStatus = (dateStr: string, startHour: number, endHour: number) => {
    if (!reservations || !dateStr) return null;
    if (!basketballFacility) return null;

    const slotStart = new Date(`${dateStr}T${startHour.toString().padStart(2, '0')}:00:00`);
    const slotEnd = new Date(`${dateStr}T${endHour.toString().padStart(2, '0')}:00:00`);

    const match = reservations.find((r: any) => {
      if (r.status === 'rejected' || r.status === 'cancelled') return false;

      const rStart = new Date(r.start_time);
      const rEnd = new Date(r.end_time);

      return rStart < slotEnd && rEnd > slotStart;
    });

    return match || null;
  };

  // Quick date jump helpers
  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleOpenBookingModal = (slot?: typeof TIME_SLOTS[0]) => {
    const targetSlot = slot || TIME_SLOTS[0];
    setSelectedSlot(targetSlot);

    const facilityId = basketballFacility?.id || '';
    const startIso = `${selectedDate}T${targetSlot.startHour.toString().padStart(2, '0')}:00`;
    const endIso = `${selectedDate}T${targetSlot.endHour.toString().padStart(2, '0')}:00`;

    setForm({
      facilityId,
      title: '',
      startTime: startIso,
      endTime: endIso,
      notes: '',
    });
    setConflictInfo(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      showError('Time Slot Required', 'Please select a valid available time slot.');
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
      
      success('Booking Submitted! 🏀', 'Basketball court reservation has been created successfully.');
      setShowModal(false);
      setForm({ facilityId: '', title: '', startTime: '', endTime: '', notes: '' });
      setSelectedSlot(null);
      refetch();
    } catch (err: any) {
      if (err.message?.includes('conflict') || err.message?.includes('Time slot')) {
        setConflictInfo({ message: err.message });
        showError('Booking Conflict!', 'This basketball court slot is already reserved. Please choose an open green slot.');
      } else {
        showError('Booking Failed', err.message || 'Failed to submit reservation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (resId: string, status: string) => {
    try {
      await apiCall(`/api/facilities/reservations/${resId}/status`, 'PATCH', { status }, accessToken || undefined);
      success(`Reservation ${status.toUpperCase()}`, `Court reservation has been marked as ${status}.`);
      refetch();
    } catch (err: any) {
      showError('Update Failed', err.message);
    }
  };

  // Generate 7 upcoming day tabs starting from Today
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { iso, dayLabel, dateNum };
  });

  // Basketball reservations list filtering
  const allCourtReservations = (reservations || []).filter(r => 
    !basketballFacility || r.facility_id === basketballFacility.id
  );

  const filteredReservations = allCourtReservations.filter(r => {
    if (tableFilter === 'approved') return r.status === 'approved';
    if (tableFilter === 'pending') return r.status === 'pending';
    if (tableFilter === 'mine') return r.reserved_by === user?.id;
    return true;
  });

  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <PageContainer title="Basketball Court Reservation" subtitle="View Real-Time Available Slots & Book Basketball Court">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* TOP NOTICE & FACILITY CARD */}
        <div className="grid grid-2 gap-4 mb-6">
          
          {/* Covered Basketball Court Details Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(249, 115, 22, 0.08))', border: '1px solid rgba(220, 38, 38, 0.3)', padding: 20 }}>
            <div className="flex items-center gap-3">
              <div style={{ fontSize: '2.5rem', background: '#DC2626', color: '#FFF', borderRadius: 12, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🏀
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 800 }}>
                  {basketballFacility?.name || 'Covered Basketball Court'}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Capacity: {basketballFacility?.capacity || 80} Persons • Full-Court • LED Lighting • Acrylic Flooring
                </div>
                <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, marginTop: 4 }}>
                  ⚡ Real-Time Collision Protection Active
                </div>
              </div>
            </div>
          </div>

          {/* Policy / Scope Notice Card */}
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 16 }}>ℹ️</span>
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Facility Scope & Scheduling Guidelines:</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Basketball court scheduling is enabled exclusively for Phase 2 Household Members and Invited Guests. Admins can reserve slots directly on behalf of residents or for community assemblies.
            </p>
          </div>

        </div>

        {/* DATE SELECTION & NAVIGATION BAR */}
        <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 18 }}>
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                📅 Court Schedule Date:
              </h3>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', background: 'rgba(220, 38, 38, 0.1)', padding: '4px 12px', borderRadius: 6 }}>
                {formattedSelectedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => handleDateShift(-1)}
                title="Previous Day"
              >
                ◀ Prev Day
              </button>
              
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSelectedDate(todayStr)}
                style={{ fontWeight: selectedDate === todayStr ? 800 : 400, borderColor: selectedDate === todayStr ? '#DC2626' : undefined }}
              >
                Today
              </button>

              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => handleDateShift(1)}
                title="Next Day"
              >
                Next Day ▶
              </button>

              <input
                type="date"
                className="form-input"
                style={{ padding: '4px 8px', fontSize: 13, width: 'auto' }}
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Quick 7-Day Pills Selector */}
          <div className="flex gap-2 flex-wrap" style={{ borderTop: '1px dashed var(--border)', paddingTop: 14 }}>
            {upcomingDays.map(d => {
              const isSelected = selectedDate === d.iso;
              return (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: isSelected ? 800 : 600,
                    background: isSelected ? '#DC2626' : 'var(--bg-card)',
                    color: isSelected ? '#FFF' : 'var(--text-primary)',
                    border: isSelected ? '1px solid #DC2626' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 80,
                  }}
                >
                  <span style={{ fontSize: 10, opacity: isSelected ? 0.9 : 0.7 }}>{d.dayLabel}</span>
                  <span>{d.dateNum}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* VIEWABLE TIME SLOTS AVAILABLE GRID */}
        <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 20 }}>
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏀 Available Court Time Slots</span>
                <span className="badge badge-info" style={{ fontSize: 11 }}>Viewable Availability Schedule</span>
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Click any open green slot to book your basketball court session instantly.
              </p>
            </div>

            {/* LEGEND BADGES */}
            <div className="flex gap-3 text-xs flex-wrap" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>🟢 Open / Available</span>
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>🔴 Reserved / Taken</span>
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>🟡 Pending Approval</span>
              </span>
            </div>
          </div>

          {/* TIME SLOTS CARDS GRID */}
          <div className="grid grid-2 gap-3">
            {TIME_SLOTS.map(slot => {
              const booking = getSlotBookingStatus(selectedDate, slot.startHour, slot.endHour);
              const isTaken = !!booking;
              const isApproved = booking?.status === 'approved';
              const isPending = booking?.status === 'pending';
              const isMine = booking?.reserved_by === user?.id;

              let slotBg = 'rgba(34, 197, 94, 0.08)';
              let slotBorder = '1.5px solid rgba(34, 197, 94, 0.4)';
              let statusText = '🟢 Available Slot';
              let badgeColor = '#22C55E';

              if (isMine) {
                slotBg = 'rgba(124, 58, 237, 0.12)';
                slotBorder = '2px solid #7C3AED';
                statusText = '🔵 Reserved by You';
                badgeColor = '#A78BFA';
              } else if (isApproved) {
                slotBg = 'rgba(220, 38, 38, 0.1)';
                slotBorder = '1.5px solid rgba(220, 38, 38, 0.5)';
                statusText = '🔴 Reserved / Taken';
                badgeColor = '#FCA5A5';
              } else if (isPending) {
                slotBg = 'rgba(245, 158, 11, 0.1)';
                slotBorder = '1.5px solid rgba(245, 158, 11, 0.5)';
                statusText = '🟡 Pending Approval';
                badgeColor = '#FCD34D';
              }

              return (
                <div
                  key={slot.id}
                  className="card-hover"
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: slotBg,
                    border: slotBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14 }}>🏀</span>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{slot.label}</strong>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 700, color: badgeColor, marginTop: 4 }}>
                      {statusText}
                    </div>

                    {booking && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        <span className="font-semibold">{booking.title}</span>
                        {booking.reserved_by_name && (
                          <span style={{ opacity: 0.8 }}> • {booking.reserved_by_name}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {!isTaken && canBook ? (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ background: '#22C55E', borderColor: '#22C55E', fontWeight: 700, fontSize: 12, padding: '6px 14px' }}
                        onClick={() => handleOpenBookingModal(slot)}
                      >
                        + Reserve Slot
                      </button>
                    ) : isMine ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', background: 'rgba(124, 58, 237, 0.2)', padding: '4px 10px', borderRadius: 6 }}>
                        Your Session
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: 'rgba(220, 38, 38, 0.15)', padding: '4px 10px', borderRadius: 6 }}>
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* BASKETBALL RESERVATION HISTORY & MANAGEMENT TABLE */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 20 }}>
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16, fontWeight: 800 }}>
                📋 Basketball Court Reservation Directory
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Total Reservations: {allCourtReservations.length}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              {(['all', 'approved', 'pending', 'mine'] as const).map(tab => (
                <button
                  key={tab}
                  className={`btn btn-sm ${tableFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    textTransform: 'capitalize',
                    fontWeight: tableFilter === tab ? 700 : 500,
                    background: tableFilter === tab ? '#DC2626' : undefined,
                    borderColor: tableFilter === tab ? '#DC2626' : undefined,
                  }}
                  onClick={() => setTableFilter(tab)}
                >
                  {tab === 'mine' ? 'My Bookings' : tab}
                </button>
              ))}
            </div>
          </div>

          {filteredReservations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event / Activity Title</th>
                  <th>Reserved By</th>
                  <th>Date & Time Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r: any) => {
                  const startDate = new Date(r.start_time);
                  const endDate = new Date(r.end_time);
                  const isOwner = r.reserved_by === user?.id;

                  return (
                    <tr key={r.id}>
                      <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        🏀 {r.title}
                        {r.notes && <div className="text-xs text-muted" style={{ fontWeight: 400 }}>{r.notes}</div>}
                      </td>
                      <td>{r.reserved_by_name || (isOwner ? `${user?.fullName} (You)` : 'Resident')}</td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div>{startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {canApprove && r.status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(r.id, 'approved')}>✓ Approve</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(r.id, 'rejected')}>✕ Reject</button>
                            </>
                          )}
                          {(isOwner || canApprove) && (r.status === 'approved' || r.status === 'pending') && (
                            <button className="btn btn-sm btn-secondary" onClick={() => handleStatusUpdate(r.id, 'cancelled')}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏀</div>
              <h4 style={{ color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>No court reservations found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Click "+ Reserve Slot" on any available green time slot block above to schedule a basketball court session.
              </p>
            </div>
          )}

        </div>

        {/* BOOKING CONFIRMATION MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
              
              <div className="modal-header">
                <h2 className="modal-title" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏀</span>
                  <span>Book Basketball Court Slot</span>
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              {conflictInfo && (
                <div style={{ marginBottom: 16, background: 'rgba(220,38,38,0.2)', border: '1px solid #DC2626', padding: 12, borderRadius: 8, display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FFF' }}>Booking Conflict Detected!</div>
                    <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 2 }}>
                      This time slot was taken by another resident. Please select an available green slot.
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* PRE-FILLED SLOT & DATE SUMMARY */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Selected Session Details:
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                    🏀 {basketballFacility?.name || 'Covered Basketball Court'}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>📅 Date: <strong style={{ color: '#DC2626' }}>{formattedSelectedDate}</strong></span>
                    <span>⏰ Slot: <strong style={{ color: '#22C55E' }}>{selectedSlot?.label || 'Custom Slot'}</strong></span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event / Activity Title <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Block 5 Evening 3v3 Practice, Friendly Match"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Notes / Requirements (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g., Scoreboard requirement, LED lighting request..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2" style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ background: '#DC2626', borderColor: '#DC2626', fontWeight: 800, padding: '10px 20px' }}
                    disabled={isSubmitting || !form.startTime}
                  >
                    {isSubmitting ? 'Submitting...' : '🏀 Confirm Basketball Booking'}
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
