import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiCall } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';

interface HoaEvent {
  id: string;
  tenant_id: string;
  title: string;
  meeting_date: string; // "YYYY-MM-DD" or "YYYY-MM-DD HH:mm"
  location: string;
  agenda: string;
  minutes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  category?: 'meeting' | 'maintenance' | 'assembly' | 'community' | 'emergency';
}

const DEFAULT_EVENTS: HoaEvent[] = [
  {
    id: 'ev-01',
    tenant_id: 'tenant-palmera-hoa',
    title: 'Phase 2 HOA Annual General Assembly & Board Elections',
    meeting_date: '2026-08-28 09:00',
    location: 'NRG PH2 Main Clubhouse & Virtual Zoom',
    agenda: '1. Presentation of 2025-2026 Audited Financial Report\n2. Election of Board of Directors for Term 2026-2028\n3. Approval of Proposed Solar Streetlighting Expansion\n4. Open Forum & Resident Q&A',
    status: 'upcoming',
    category: 'assembly',
  },
  {
    id: 'ev-02',
    tenant_id: 'tenant-palmera-hoa',
    title: 'Swimming Pool & Water Filtration System Maintenance',
    meeting_date: '2026-08-22 08:00',
    location: 'Community Swimming Pool Area',
    agenda: 'Deep chemical shock treatment, filter backwash, tile regrouting, and pump inspection. Pool facility closed to residents until 6:00 PM.',
    status: 'upcoming',
    category: 'maintenance',
  },
  {
    id: 'ev-03',
    tenant_id: 'tenant-palmera-hoa',
    title: 'HOA Board of Directors Monthly Executive Session',
    meeting_date: '2026-08-17 19:00',
    location: 'HOA Admin Conference Room',
    agenda: '1. Review of monthly dues collection efficiency\n2. Delinquent account resolution framework\n3. Security CCTV maintenance contract renewal\n4. Basketball court reservation system updates',
    minutes: 'Approved budget for CCTV spare parts (₱12,500). Noted 94.2% dues collection rate for July. Meeting adjourned at 8:45 PM.',
    status: 'completed',
    category: 'meeting',
  },
  {
    id: 'ev-04',
    tenant_id: 'tenant-palmera-hoa',
    title: 'Northridge Grove Tree Trimming & Eco-Clean Up Drive',
    meeting_date: '2026-08-30 06:30',
    location: 'Subdivision Perimeter & Block 4 Park',
    agenda: 'Barangay Tungkong Mangga coordinated tree branch trimming along power lines and community botanical cleanup.',
    status: 'upcoming',
    category: 'community',
  },
  {
    id: 'ev-05',
    tenant_id: 'tenant-palmera-hoa',
    title: 'Emergency Earthquake & Fire Evacuation Drill',
    meeting_date: '2026-09-05 15:00',
    location: 'Covered Basketball Court & Evacuation Point',
    agenda: 'Community safety orientation, siren test, evacuation pathway run, and basic first aid briefing with CSJDM DRRMO.',
    status: 'upcoming',
    category: 'emergency',
  },
];

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  assembly: { label: 'General Assembly', bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', icon: '🏛️' },
  meeting: { label: 'Board Meeting', bg: 'rgba(37, 99, 235, 0.12)', text: '#2563EB', icon: '📋' },
  maintenance: { label: 'Maintenance Work', bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706', icon: '🛠️' },
  community: { label: 'Community Event', bg: 'rgba(22, 101, 52, 0.12)', text: '#166534', icon: '🎉' },
  emergency: { label: 'Drill & Safety', bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626', icon: '🚨' },
};

const getEventCategory = (ev: HoaEvent) => {
  if (ev.category && CATEGORY_MAP[ev.category]) return CATEGORY_MAP[ev.category];
  const title = (ev.title + ' ' + ev.agenda).toLowerCase();
  if (title.includes('assembly') || title.includes('annual')) return CATEGORY_MAP.assembly;
  if (title.includes('maintenance') || title.includes('pool') || title.includes('repair')) return CATEGORY_MAP.maintenance;
  if (title.includes('drill') || title.includes('fire') || title.includes('earthquake')) return CATEGORY_MAP.emergency;
  if (title.includes('clean') || title.includes('fest') || title.includes('sports')) return CATEGORY_MAP.community;
  return CATEGORY_MAP.meeting;
};

export default function CalendarEvents() {
  const { user, accessToken, hasRole } = useAuth();
  const { success, error: showError } = useToast();

  const { data: apiEvents, isLoading: loading, refetch } = useApi<HoaEvent[]>('/api/hoa/meetings');
  const eventsList: HoaEvent[] = (apiEvents && apiEvents.length > 0) ? apiEvents : DEFAULT_EVENTS;

  // View Mode: 'calendar' | 'agenda'
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  // Calendar Date State (Default August 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 20)); // Month index 7 = August

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [viewingDayModal, setViewingDayModal] = useState<{ day: number; dateStr: string; events: HoaEvent[] } | null>(null);
  const [editingEvent, setEditingEvent] = useState<HoaEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('meeting');
  const [formDate, setFormDate] = useState('2026-08-28');
  const [formTime, setFormTime] = useState('09:00');
  const [formLocation, setFormLocation] = useState('NRG PH2 Main Clubhouse');
  const [formAgenda, setFormAgenda] = useState('');
  const [formMinutes, setFormMinutes] = useState('');
  const [formStatus, setFormStatus] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<HoaEvent | null>(null);

  const openAddModal = (initialDate?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('meeting');
    setFormDate(initialDate || new Date().toISOString().slice(0, 10));
    setFormTime('09:00');
    setFormLocation('NRG PH2 Main Clubhouse');
    setFormAgenda('');
    setFormMinutes('');
    setFormStatus('upcoming');
    setShowModal(true);
  };

  const openEditModal = (ev: HoaEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormCategory(ev.category || 'meeting');
    const dateParts = (ev.meeting_date || '').split(' ');
    setFormDate(dateParts[0] || '2026-08-20');
    setFormTime(dateParts[1] || '09:00');
    setFormLocation(ev.location || 'NRG PH2 Main Clubhouse');
    setFormAgenda(ev.agenda || '');
    setFormMinutes(ev.minutes || '');
    setFormStatus(ev.status || 'upcoming');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate || !formAgenda.trim()) {
      showError('Validation Error', 'Title, date, and agenda description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDate = `${formDate} ${formTime}`.trim();
      const payload = {
        title: formTitle.trim(),
        meetingDate: fullDate,
        location: formLocation.trim(),
        agenda: formAgenda.trim(),
        minutes: formMinutes.trim() || undefined,
        status: formStatus,
      };

      if (editingEvent) {
        await apiCall(`/api/hoa/meetings/${editingEvent.id}`, 'PUT', payload, accessToken || undefined);
        success('Event Updated! 📅', `${formTitle} schedule updated.`);
      } else {
        await apiCall('/api/hoa/meetings', 'POST', payload, accessToken || undefined);
        success('Event Scheduled! 📅', `${formTitle} published to community calendar.`);
      }

      setShowModal(false);
      refetch();
    } catch (err: any) {
      showError('Failed to Save Event', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiCall(`/api/hoa/meetings/${deleteTarget.id}`, 'DELETE', {}, accessToken || undefined);
      success('Event Removed', `${deleteTarget.title} was removed from the calendar.`);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  };

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const gotoToday = () => setCurrentDate(new Date(2026, 7, 20));

  // Map events to day numbers
  const eventsByDay: Record<number, HoaEvent[]> = {};
  eventsList.forEach(ev => {
    if (!ev.meeting_date) return;
    const dateOnly = ev.meeting_date.split(' ')[0];
    const [y, m, d] = dateOnly.split('-').map(Number);
    if (y === year && m === month + 1) {
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(ev);
    }
  });

  // Filtered Events
  const filteredEvents = eventsList.filter(ev => {
    const matchesSearch =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.agenda.toLowerCase().includes(searchQuery.toLowerCase());

    const cat = getEventCategory(ev);
    const matchesCat = selectedCategory === 'ALL' || cat.label === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || ev.status === selectedStatus;

    if (selectedDay !== null) {
      const dateOnly = (ev.meeting_date || '').split(' ')[0];
      const [y, m, d] = dateOnly.split('-').map(Number);
      const isSelectedDay = y === year && m === month + 1 && d === selectedDay;
      return matchesSearch && matchesCat && matchesStatus && isSelectedDay;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalUpcoming = eventsList.filter(e => e.status === 'upcoming').length;
  const totalAssemblies = eventsList.filter(e => e.title.toLowerCase().includes('assembly') || e.title.toLowerCase().includes('board')).length;
  const totalMaintenance = eventsList.filter(e => e.title.toLowerCase().includes('maintenance') || e.title.toLowerCase().includes('clean') || e.title.toLowerCase().includes('pool')).length;

  return (
    <PageContainer
      title="Community Calendar & Events"
      subtitle={`NRG PH2 HOA INC — General Assemblies, Board Meetings, Facility Maintenance & Activities`}
    >
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>

        {/* ── TOP STATS BAR ── */}
        <div className="grid grid-4 mb-6">
          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>📅</span>
              <span className="badge badge-primary" style={{ background: 'rgba(22, 101, 52, 0.1)', color: '#166534', border: '1px solid rgba(22, 101, 52, 0.25)' }}>
                Upcoming
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {totalUpcoming}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Active Scheduled Events
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>🏛️</span>
              <span className="badge badge-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                Governance
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#7C3AED', letterSpacing: '-0.02em' }}>
              {totalAssemblies}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Assemblies & Board Meetings
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>🛠️</span>
              <span className="badge badge-primary" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                Operations
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#D97706', letterSpacing: '-0.02em' }}>
              {totalMaintenance}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Facility Maintenance Works
            </div>
          </div>

          <div className="card hover-lift" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px 22px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 24 }}>📍</span>
              <span className="badge badge-primary" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                Venues
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>
              Clubhouse / Court
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>
              Designated Assembly Grounds
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
                  placeholder="🔍 Search event title, agenda topic, location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, height: 42 }}
                />
                <span style={{ position: 'absolute', left: 12, top: 12, fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
              </div>

              <select
                className="form-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ width: 180, height: 42 }}
              >
                <option value="ALL">All Categories</option>
                <option value="General Assembly">General Assembly</option>
                <option value="Board Meeting">Board Meeting</option>
                <option value="Maintenance Work">Maintenance Work</option>
                <option value="Community Event">Community Event</option>
                <option value="Drill & Safety">Drill & Safety</option>
              </select>

              <select
                className="form-select"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ width: 150, height: 42 }}
              >
                <option value="ALL">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {selectedDay !== null && (
                <button
                  className="btn btn-sm"
                  onClick={() => setSelectedDay(null)}
                  style={{ height: 42, background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)', fontWeight: 800, borderRadius: 8 }}
                >
                  Clear Day ({selectedDay}) ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-hover)', padding: '4px', borderRadius: 10, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setViewMode('calendar')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 7,
                    border: 'none',
                    background: viewMode === 'calendar' ? 'linear-gradient(135deg, #166534, #15803D)' : 'transparent',
                    color: viewMode === 'calendar' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  📅 Month View
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 7,
                    border: 'none',
                    background: viewMode === 'agenda' ? 'linear-gradient(135deg, #166534, #15803D)' : 'transparent',
                    color: viewMode === 'agenda' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  📋 Agenda List
                </button>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => openAddModal()}
                style={{
                  background: 'linear-gradient(135deg, #166534, #15803D)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow: '0 4px 14px rgba(22, 101, 52, 0.35)',
                  border: 'none',
                }}
              >
                + Schedule Event
              </button>
            </div>
          </div>
        </div>

        {/* ── CALENDAR VIEW ── */}
        {viewMode === 'calendar' && (
          <div className="card mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '24px 26px', borderRadius: 16 }}>
            {/* Month Header Controls */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {monthName} {year}
                </h2>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={gotoToday}
                  style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ‹
                </button>
                <button
                  onClick={nextMonth}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ›
                </button>
              </div>
            </div>

            {/* Days of Week Header — Guaranteed Equal 1fr Column Widths */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8, textAlign: 'center', marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 0', letterSpacing: '0.05em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Month Day Cells — Guaranteed Equal 1fr Column Widths */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 110, height: 115, minWidth: 0, overflow: 'hidden', background: 'rgba(0,0,0,0.02)', borderRadius: 10, border: '1px dashed rgba(100,116,139,0.1)' }} />
              ))}

              {/* Days of Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = year === 2026 && month === 7 && dayNum === 20;
                const isSelected = selectedDay === dayNum;
                const dayEvents = eventsByDay[dayNum] || [];

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => {
                      setSelectedDay(prev => prev === dayNum ? null : dayNum);
                      if (dayEvents.length > 0) {
                        setViewingDayModal({
                          day: dayNum,
                          dateStr: `${monthName} ${dayNum}, ${year}`,
                          events: dayEvents,
                        });
                      }
                    }}
                    style={{
                      minHeight: 110,
                      height: 115,
                      minWidth: 0,
                      overflow: 'hidden',
                      padding: '8px 8px',
                      background: isSelected ? 'rgba(22, 101, 52, 0.08)' : (isToday ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-hover)'),
                      border: isSelected
                        ? '2px solid #166534'
                        : (isToday ? '2px solid #DC2626' : '1px solid var(--border)'),
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#166534'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = isToday ? '#DC2626' : 'var(--border)'; }}
                  >
                    <div className="flex justify-between items-center" style={{ minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: (isToday || isSelected) ? 900 : 700,
                          color: isToday ? '#DC2626' : (isSelected ? '#166534' : 'var(--text-primary)'),
                        }}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: 8.5, fontWeight: 900, background: '#DC2626', color: '#FFF', padding: '1px 4px', borderRadius: 6, letterSpacing: '0.02em' }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4, minWidth: 0, overflow: 'hidden' }}>
                      {dayEvents.slice(0, 2).map(ev => {
                        const cat = getEventCategory(ev);
                        return (
                          <div
                            key={ev.id}
                            title={`${ev.title} (${ev.meeting_date})`}
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: cat.bg,
                              color: cat.text,
                              padding: '2px 5px',
                              borderRadius: 4,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.2,
                              minWidth: 0,
                              display: 'block',
                            }}
                          >
                            {cat.icon} {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(dayNum);
                            setViewingDayModal({
                              day: dayNum,
                              dateStr: `${monthName} ${dayNum}, ${year}`,
                              events: dayEvents,
                            });
                          }}
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            background: 'rgba(22, 101, 52, 0.12)',
                            color: '#166534',
                            border: '1px solid rgba(22, 101, 52, 0.25)',
                            padding: '2px 4px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            textAlign: 'center',
                            width: '100%',
                            lineHeight: 1.1,
                          }}
                        >
                          +{dayEvents.length - 2} more →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AGENDA & EVENT CARDS LIST ── */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {selectedDay !== null ? `Events Scheduled for ${monthName} ${selectedDay}, ${year}` : 'Upcoming Community Agendas & Meetings'}
            </h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="card text-center" style={{ padding: '60px 0', background: 'var(--bg-surface)' }}>
              <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
              <p className="text-muted">Loading events calendar...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="card empty-state text-center" style={{ padding: '60px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800 }}>No Events Scheduled</h3>
              <p className="text-muted" style={{ maxWidth: 450, margin: '8px auto 20px' }}>
                There are no meetings or community activities found matching your active filter criteria.
              </p>
              <button className="btn btn-primary" onClick={() => openAddModal()} style={{ background: 'linear-gradient(135deg, #166534, #15803D)', border: 'none', fontWeight: 800 }}>
                + Add First Community Event
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredEvents.map(ev => {
                const cat = getEventCategory(ev);
                const dateParts = (ev.meeting_date || '').split(' ');
                const dateStr = dateParts[0];
                const timeStr = dateParts[1] || '';

                return (
                  <div
                    key={ev.id}
                    className="card hover-lift"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '24px 26px',
                      display: 'flex',
                      gap: 20,
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Left Date Block */}
                    <div
                      style={{
                        width: 80,
                        padding: '12px 8px',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {dateStr ? new Date(dateStr).toLocaleString('default', { month: 'short' }) : 'AUG'}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {dateStr ? dateStr.split('-')[2] : '20'}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>
                        {timeStr || 'ALL DAY'}
                      </div>
                    </div>

                    {/* Middle Content */}
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: 12,
                            background: cat.bg,
                            color: cat.text,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {cat.icon} {cat.label}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: 12,
                            background: ev.status === 'completed' ? 'rgba(22, 101, 52, 0.1)' : (ev.status === 'cancelled' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)'),
                            color: ev.status === 'completed' ? '#166534' : (ev.status === 'cancelled' ? '#DC2626' : '#2563EB'),
                            textTransform: 'uppercase',
                          }}
                        >
                          {ev.status === 'completed' ? '✓ Completed' : (ev.status === 'cancelled' ? '✕ Cancelled' : '● Scheduled')}
                        </span>

                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          📍 {ev.location}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 8px', letterSpacing: '-0.015em' }}>
                        {ev.title}
                      </h3>

                      <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {ev.agenda}
                      </div>

                      {ev.minutes && (
                        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 9, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-primary)' }}>
                          📝 <strong>Meeting Minutes & Resolutions:</strong> {ev.minutes}
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => openEditModal(ev)}
                        style={{
                          padding: '7px 12px',
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
                        onClick={() => setDeleteTarget(ev)}
                        style={{
                          padding: '7px 12px',
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
                );
              })}
            </div>
          )}
        </div>

        {/* ── ADD / EDIT EVENT MODAL ── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: '100%', animation: 'scaleIn 0.2s ease' }}>
              <div className="modal-header">
                <div className="modal-title">
                  {editingEvent ? '✏️ Edit Calendar Event' : '📅 Schedule Community Event / Meeting'}
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="form-label">Event / Meeting Title *</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Phase 2 HOA Quarterly General Assembly"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div>
                      <label className="form-label">Event Category *</label>
                      <select
                        className="form-select"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                      >
                        <option value="assembly">🏛️ General Assembly</option>
                        <option value="meeting">📋 Board Meeting</option>
                        <option value="maintenance">🛠️ Facility Maintenance</option>
                        <option value="community">🎉 Community Activity</option>
                        <option value="emergency">🚨 Emergency Drill</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as any)}
                      >
                        <option value="upcoming">Scheduled (Upcoming)</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div>
                      <label className="form-label">Event Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Venue / Location *</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. NRG PH2 Main Clubhouse / Covered Basketball Court"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Agenda & Description Topics *</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      required
                      placeholder="List agenda points, items to discuss, or maintenance details..."
                      value={formAgenda}
                      onChange={e => setFormAgenda(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Meeting Minutes / Outcome Notes (Optional)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Official resolutions passed, voting results, or maintenance completion notes..."
                      value={formMinutes}
                      onChange={e => setFormMinutes(e.target.value)}
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
                      {isSubmitting ? 'Saving...' : editingEvent ? 'Save Changes' : '✓ Publish Event'}
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
                <div className="modal-title" style={{ color: '#DC2626' }}>🗑️ Delete Calendar Event</div>
                <button onClick={() => setDeleteTarget(null)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 16 }}>
                  Are you sure you want to delete <strong>{deleteTarget.title}</strong> from the community calendar?
                </p>
                <div className="flex justify-end gap-2">
                  <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleDelete} style={{ background: '#DC2626', border: 'none', fontWeight: 800 }}>
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DAY EVENTS EXPANDED MODAL ── */}
        {viewingDayModal && (
          <div className="modal-overlay" onClick={() => setViewingDayModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: '100%', animation: 'scaleIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(22, 101, 52, 0.12)', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    📅
                  </div>
                  <div>
                    <div className="modal-title">Events for {viewingDayModal.dateStr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {viewingDayModal.events.length} event{viewingDayModal.events.length !== 1 ? 's' : ''} scheduled on this date
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewingDayModal(null)} className="modal-close">✕</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {viewingDayModal.events.map(ev => {
                  const cat = getEventCategory(ev);
                  const time = (ev.meeting_date || '').split(' ')[1] || '09:00';
                  return (
                    <div
                      key={ev.id}
                      className="card"
                      style={{
                        border: `1.5px solid ${cat.text}40`,
                        background: 'var(--bg-surface)',
                        padding: 16,
                        borderRadius: 12,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ background: cat.bg, color: cat.text, fontWeight: 800 }}>
                            {cat.icon} {cat.label}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>⏰ {time}</span>
                        </div>
                        <span className={`badge badge-${ev.status === 'completed' ? 'success' : ev.status === 'cancelled' ? 'danger' : 'primary'}`}>
                          {ev.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                        {ev.title}
                      </h4>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>
                        📍 {ev.location}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: 10, borderRadius: 8, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {ev.agenda}
                      </div>

                      {ev.minutes && (
                        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'rgba(22,101,52,0.06)', borderLeft: '3px solid #166534', fontSize: 12, color: 'var(--text-primary)' }}>
                          <strong>📋 Minutes / Outcome:</strong> {ev.minutes}
                        </div>
                      )}

                      {hasRole('super_admin', 'hoa_admin', 'admin_staff') && (
                        <div className="flex justify-end gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setViewingDayModal(null);
                              openEditModal(ev);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)' }}
                            onClick={() => {
                              setViewingDayModal(null);
                              setDeleteTarget(ev);
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-between items-center mt-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setViewingDayModal(null)}
                  >
                    Close
                  </button>
                  {hasRole('super_admin', 'hoa_admin', 'admin_staff') && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const dayPadded = String(viewingDayModal.day).padStart(2, '0');
                        const monthPadded = String(month + 1).padStart(2, '0');
                        const dateIso = `${year}-${monthPadded}-${dayPadded}`;
                        setViewingDayModal(null);
                        openAddModal(dateIso);
                      }}
                      style={{ background: 'linear-gradient(135deg, #166534, #15803D)', border: 'none', fontWeight: 800 }}
                    >
                      + Add Event on This Date
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
