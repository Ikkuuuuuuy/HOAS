import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface OfficerMember {
  name: string;
  role: string;
  category: 'executive' | 'block_leader' | 'committee';
  blockOrDept: string;
  avatarIcon: string;
  color: string;
  badge: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
}

export const HOA_OFFICERS_DATA: OfficerMember[] = [
  // ── Executive Board ──────────────────────────────────────────────
  {
    name: 'Rey Mar Villanueva',
    role: 'HOA President',
    category: 'executive',
    blockOrDept: 'Executive Board & Community Leadership',
    avatarIcon: '👑',
    color: '#DC2626',
    badge: 'President',
  },
  {
    name: 'Cezar Climaco',
    role: 'HOA Vice President',
    category: 'executive',
    blockOrDept: 'Executive Board & Operations',
    avatarIcon: '🏛️',
    color: '#2563EB',
    badge: 'Vice President',
  },
  {
    name: 'Alma Valdezco',
    role: 'HOA Treasurer',
    category: 'executive',
    blockOrDept: 'Finance, Treasury & Dues Accounting',
    avatarIcon: '💰',
    color: '#166534',
    badge: 'Treasurer',
  },
  {
    name: 'Ronilo Villagantol',
    role: 'HOA Auditor',
    category: 'executive',
    blockOrDept: 'Internal Audit & Transparency Committee',
    avatarIcon: '📋',
    color: '#7C3AED',
    badge: 'Auditor',
  },
  {
    name: 'Josaphat Aguiman',
    role: 'HOA Secretary',
    category: 'executive',
    blockOrDept: 'Secretariat, Records & Documentation',
    avatarIcon: '✍️',
    color: '#D97706',
    badge: 'Secretary',
  },

  // ── Block Leaders (Blocks 1 to 9) ────────────────────────────────
  {
    name: 'Anne Gregori / Ronalyn Villarte',
    role: 'Block 1 Coordinators',
    category: 'block_leader',
    blockOrDept: 'Block 1 Community (Lots 1–34)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 1',
  },
  {
    name: 'Jemma Alamillo',
    role: 'Block 2 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 2 Community (Lots 1–28)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 2',
  },
  {
    name: 'Jocelyn Selanova',
    role: 'Block 3 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 3 Community (Lots 1–36)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 3',
  },
  {
    name: 'Melinda Domingo',
    role: 'Block 4 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 4 Community (Lots 1–30)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 4',
  },
  {
    name: 'Alma Miralles',
    role: 'Block 5 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 5 Community (Lots 1–32)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 5',
  },
  {
    name: 'Ofelia Esloyo',
    role: 'Block 6 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 6 Community (Lots 1–26)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 6',
  },
  {
    name: 'Rina Dorate',
    role: 'Block 7 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 7 Community (Lots 1–38)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 7',
  },
  {
    name: 'Rina Dorate',
    role: 'Block 8 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 8 Community (Lots 1–34)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 8',
  },
  {
    name: 'Jennerfer Barlaan',
    role: 'Block 9 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 9 Community (Lots 1–24)',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 9',
  },

  // ── Committees (10 Working Taskforces) ───────────────────────────
  {
    name: 'Melody Matienzo',
    role: 'Chairperson — Grievance Committee',
    category: 'committee',
    blockOrDept: 'Dispute Mediation & Resident Conflict Resolution',
    avatarIcon: '⚖️',
    color: '#E11D48',
    badge: 'Grievance',
  },
  {
    name: 'Patrick Gariando',
    role: 'Chairperson — Inventory Committee',
    category: 'committee',
    blockOrDept: 'Subdivision Asset Management & Equipment Auditing',
    avatarIcon: '📦',
    color: '#4F46E5',
    badge: 'Inventory',
  },
  {
    name: 'Xandrix Pagligaran',
    role: 'Chairperson — Committee on Election (COMELEC)',
    category: 'committee',
    blockOrDept: 'Electoral Board, Voter Registry & Ballot Overseer',
    avatarIcon: '🗳️',
    color: '#D97706',
    badge: 'COMELEC',
  },
  {
    name: 'Jhon Magdaluyo',
    role: 'Chairperson — Disaster Risk Reduction Management (DRRM)',
    category: 'committee',
    blockOrDept: 'Emergency Evacuation, Calamity Response & Fire Safety',
    avatarIcon: '🚨',
    color: '#DC2626',
    badge: 'DRRM',
  },
  {
    name: 'Wennie Arago',
    role: 'Chairperson — Peace and Order Committee',
    category: 'committee',
    blockOrDept: 'Security Guard Coordination & 24/7 Gate Patrols',
    avatarIcon: '🛡️',
    color: '#059669',
    badge: 'Peace & Order',
  },
  {
    name: 'Ronald Balbin',
    role: 'Chairperson — Sports & Recreation Committee',
    category: 'committee',
    blockOrDept: 'Covered Court Bookings & Community Sports Leagues',
    avatarIcon: '🏀',
    color: '#EA580C',
    badge: 'Sports',
  },
  {
    name: 'Allen Tabasa',
    role: 'Chairperson — Facilities & Improvement Committee',
    category: 'committee',
    blockOrDept: 'Infrastructure Projects, Renovation Permits & Blueprints',
    avatarIcon: '🏗️',
    color: '#2563EB',
    badge: 'Facilities',
  },
  {
    name: 'Alan Talaba',
    role: 'Chairperson — Gender and Development (GAD)',
    category: 'committee',
    blockOrDept: 'Women & Children Welfare, Senior Citizens & Social Dev.',
    avatarIcon: '🤝',
    color: '#9333EA',
    badge: 'GAD',
  },
  {
    name: 'Clemente Sibayan, Ferdinand Lazo, and Nicanor Lasac',
    role: 'Committee Heads — Livelihood Programs',
    category: 'committee',
    blockOrDept: 'Community Enterprise, Skills Training & Cooperative Hub',
    avatarIcon: '🌱',
    color: '#166534',
    badge: 'Livelihood',
  },
  {
    name: 'Conrado Laoang',
    role: 'Chairperson — Maintenance Committee',
    category: 'committee',
    blockOrDept: 'Drainage Cleansing, Solar Streetlights & Road Repair',
    avatarIcon: '🛠️',
    color: '#475569',
    badge: 'Maintenance',
  },
];

// SVG Facebook Icon Helper
export function FacebookIcon({ size = 16, color = '#1877F2' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function HOAOfficersDirectory() {
  const { user } = useAuth();
  const { success } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'executive' | 'block_leader' | 'committee'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOfficers = HOA_OFFICERS_DATA.filter(officer => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      officer.name.toLowerCase().includes(q) ||
      officer.role.toLowerCase().includes(q) ||
      officer.blockOrDept.toLowerCase().includes(q);
    const matchesCat = activeCategory === 'all' || officer.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <PageContainer
      title="HOA Officers & Committee Directory"
      subtitle="NRG PH2 HOA INC — Official Leadership Board, Block Coordinators & Committee Chairs"
    >
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* HERO SEAL BANNER */}
        <div
          className="card mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(22,101,52,0.15), rgba(220,38,38,0.12))',
            border: '1px solid rgba(22,101,52,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: 24,
          }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid #166534', flexShrink: 0 }}>
            <img src="/nrg-ph2-logo.png" alt="NRG PH2 Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Governance & Community Representation
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>
              NRG PH2 HOA Inc. Officers & Leadership Directory
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Official leadership roster for your elected Executive Board, Block Leaders 1–9, and 10 Working Committees. Official inquiries can be submitted through the HOA Admin Office or Portal Helpdesk.
            </p>
          </div>
          <div className="hidden md:block" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#166534' }}>{HOA_OFFICERS_DATA.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Official Officers & Chairs</div>
          </div>
        </div>

        {/* CONTROLS & FILTER TABS */}
        <div className="card mb-6" style={{ padding: 16 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: '🌟 All Officers (24)' },
                { id: 'executive', label: '👑 Executive Board (5)' },
                { id: 'block_leader', label: '🏘️ Block Leaders (9)' },
                { id: 'committee', label: '🛡️ Working Committees (10)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn btn-sm ${activeCategory === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={activeCategory === tab.id ? { background: '#166534', borderColor: '#166534', fontWeight: 800 } : {}}
                  onClick={() => setActiveCategory(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Search by name, role, department, or block..."
              style={{ maxWidth: 320 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── 1. EXECUTIVE BOARD SECTION ───────────────────────────── */}
        {(activeCategory === 'all' || activeCategory === 'executive') && (
          <div style={{ marginBottom: 36 }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 22 }}>👑</span>
              <h3 className="section-title" style={{ margin: 0, color: '#DC2626' }}>
                Executive Board of Directors
              </h3>
            </div>
            <div className="grid grid-3" style={{ gap: 18 }}>
              {filteredOfficers.filter(o => o.category === 'executive').map((officer, idx) => (
                <div
                  key={idx}
                  className="card hover-lift"
                  style={{
                    border: `1.5px solid ${officer.color}40`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ height: 4, background: officer.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
                  
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: `${officer.color}15`,
                          color: officer.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {officer.avatarIcon}
                      </div>
                      <div>
                        <span className="badge" style={{ background: `${officer.color}15`, color: officer.color, fontWeight: 800, fontSize: 10 }}>
                          {String(officer.badge || 'OFFICER').toUpperCase()}
                        </span>
                        <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginTop: 2, margin: 0 }}>
                          {officer.name}
                        </h4>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: officer.color, marginBottom: 4 }}>
                      {officer.role}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {officer.blockOrDept}
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      🏛️ Official Executive Board
                    </span>
                    <span style={{ fontSize: 10, background: `${officer.color}15`, color: officer.color, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Elected Officer
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. BLOCK LEADERS SECTION ─────────────────────────────── */}
        {(activeCategory === 'all' || activeCategory === 'block_leader') && (
          <div style={{ marginBottom: 36 }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 22 }}>🏘️</span>
              <h3 className="section-title" style={{ margin: 0, color: '#0891B2' }}>
                Block Coordinators & Leaders (Blocks 1 to 9)
              </h3>
            </div>
            <div className="grid grid-3" style={{ gap: 16 }}>
              {filteredOfficers.filter(o => o.category === 'block_leader').map((officer, idx) => (
                <div
                  key={idx}
                  className="card hover-lift"
                  style={{
                    padding: 18,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge" style={{ background: '#ECFEFF', color: '#0891B2', fontWeight: 800 }}>
                        {officer.badge}
                      </span>
                      <span style={{ fontSize: 18 }}>🏘️</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{officer.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0891B2', marginTop: 2 }}>{officer.role}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      Liaison for {officer.blockOrDept}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>Designated Leader: {officer.blockOrDept}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#0891B2', background: '#ECFEFF', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Verified Leader
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. COMMITTEES SECTION ────────────────────────────────── */}
        {(activeCategory === 'all' || activeCategory === 'committee') && (
          <div style={{ marginBottom: 36 }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 22 }}>🛡️</span>
              <h3 className="section-title" style={{ margin: 0, color: '#166534' }}>
                Working Committees & Special Taskforces (10 Committees)
              </h3>
            </div>
            <div className="grid grid-2" style={{ gap: 16 }}>
              {filteredOfficers.filter(o => o.category === 'committee').map((officer, idx) => (
                <div
                  key={idx}
                  className="card hover-lift"
                  style={{
                    padding: 18,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge" style={{ background: `${officer.color}15`, color: officer.color, fontWeight: 800 }}>
                        {String(officer.badge || 'OFFICER').toUpperCase()}
                      </span>
                      <span style={{ fontSize: 20 }}>{officer.avatarIcon}</span>
                    </div>
                    <div style={{ fontSize: 15.5, fontWeight: 900, color: 'var(--text-primary)' }}>
                      {officer.name}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: officer.color, marginTop: 2 }}>
                      {officer.role}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                      Mandate: <strong>{officer.blockOrDept}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Mandate: {officer.blockOrDept}</span>
                    </div>
                    <span style={{ fontSize: 10, color: officer.color, background: `${officer.color}15`, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Official Taskforce
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
