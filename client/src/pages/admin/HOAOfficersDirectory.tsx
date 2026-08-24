import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface OfficerMember {
  name: string;
  role: string;
  category: 'executive' | 'block_leader' | 'committee';
  blockOrDept: string;
  phone: string;
  email: string;
  facebookUrl: string;
  avatarIcon: string;
  color: string;
  badge: string;
}

export const HOA_OFFICERS_DATA: OfficerMember[] = [
  // ── Executive Board ──────────────────────────────────────────────
  {
    name: 'Rey Mar Villanueva',
    role: 'HOA President',
    category: 'executive',
    blockOrDept: 'Executive Board & Community Leadership',
    phone: '0917-882-9401',
    email: 'president.reymar@nrgph2.org',
    facebookUrl: 'https://facebook.com/reymar.villanueva.nrgph2',
    avatarIcon: '👑',
    color: '#DC2626',
    badge: 'President',
  },
  {
    name: 'Cezar Climaco',
    role: 'HOA Vice President',
    category: 'executive',
    blockOrDept: 'Executive Board & Operations',
    phone: '0918-554-1102',
    email: 'vp.cezar@nrgph2.org',
    facebookUrl: 'https://facebook.com/cezar.climaco.nrgph2',
    avatarIcon: '🏛️',
    color: '#2563EB',
    badge: 'Vice President',
  },
  {
    name: 'Alma Valdezco',
    role: 'HOA Treasurer',
    category: 'executive',
    blockOrDept: 'Finance, Treasury & Dues Accounting',
    phone: '0917-123-4567',
    email: 'treasurer.alma@nrgph2.org',
    facebookUrl: 'https://facebook.com/alma.valdezco.nrgph2',
    avatarIcon: '💰',
    color: '#166534',
    badge: 'Treasurer',
  },
  {
    name: 'Ronilo Villagantol',
    role: 'HOA Auditor',
    category: 'executive',
    blockOrDept: 'Internal Audit & Transparency Committee',
    phone: '0922-778-9904',
    email: 'auditor.ronilo@nrgph2.org',
    facebookUrl: 'https://facebook.com/ronilo.villagantol.nrgph2',
    avatarIcon: '📋',
    color: '#7C3AED',
    badge: 'Auditor',
  },
  {
    name: 'Josaphat Aguiman',
    role: 'HOA Secretary',
    category: 'executive',
    blockOrDept: 'Secretariat, Records & Documentation',
    phone: '0905-667-2205',
    email: 'secretary.josaphat@nrgph2.org',
    facebookUrl: 'https://facebook.com/josaphat.aguiman.nrgph2',
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
    phone: '0919-334-8811',
    email: 'block1.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/nrgph2.block1.coordinators',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 1',
  },
  {
    name: 'Jemma Alamillo',
    role: 'Block 2 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 2 Community (Lots 1–28)',
    phone: '0917-445-9922',
    email: 'block2.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/jemma.alamillo.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 2',
  },
  {
    name: 'Jocelyn Selanova',
    role: 'Block 3 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 3 Community (Lots 1–36)',
    phone: '0920-881-2233',
    email: 'block3.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/jocelyn.selanova.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 3',
  },
  {
    name: 'Melinda Domingo',
    role: 'Block 4 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 4 Community (Lots 1–30)',
    phone: '0918-662-7744',
    email: 'block4.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/melinda.domingo.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 4',
  },
  {
    name: 'Alma Miralles',
    role: 'Block 5 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 5 Community (Lots 1–32)',
    phone: '0922-339-4455',
    email: 'block5.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/alma.miralles.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 5',
  },
  {
    name: 'Ofelia Esloyo',
    role: 'Block 6 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 6 Community (Lots 1–26)',
    phone: '0917-551-8866',
    email: 'block6.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/ofelia.esloyo.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 6',
  },
  {
    name: 'Rina Dorate',
    role: 'Block 7 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 7 Community (Lots 1–38)',
    phone: '0906-443-1177',
    email: 'block7.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/rina.dorate.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 7',
  },
  {
    name: 'Rina Dorate',
    role: 'Block 8 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 8 Community (Lots 1–34)',
    phone: '0906-443-1177',
    email: 'block8.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/rina.dorate.nrgph2',
    avatarIcon: '🏘️',
    color: '#0891B2',
    badge: 'Block 8',
  },
  {
    name: 'Jennerfer Barlaan',
    role: 'Block 9 Leader',
    category: 'block_leader',
    blockOrDept: 'Block 9 Community (Lots 1–24)',
    phone: '0918-994-5599',
    email: 'block9.leader@nrgph2.org',
    facebookUrl: 'https://facebook.com/jennerfer.barlaan.nrgph2',
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
    phone: '0917-881-3301',
    email: 'grievance.melody@nrgph2.org',
    facebookUrl: 'https://facebook.com/melody.matienzo.nrgph2',
    avatarIcon: '⚖️',
    color: '#E11D48',
    badge: 'Grievance',
  },
  {
    name: 'Patrick Gariando',
    role: 'Chairperson — Inventory Committee',
    category: 'committee',
    blockOrDept: 'Subdivision Asset Management & Equipment Auditing',
    phone: '0922-114-8802',
    email: 'inventory.patrick@nrgph2.org',
    facebookUrl: 'https://facebook.com/patrick.gariando.nrgph2',
    avatarIcon: '📦',
    color: '#4F46E5',
    badge: 'Inventory',
  },
  {
    name: 'Xandrix Pagligaran',
    role: 'Chairperson — Committee on Election (COMELEC)',
    category: 'committee',
    blockOrDept: 'Electoral Board, Voter Registry & Ballot Overseer',
    phone: '0919-445-6603',
    email: 'comelec.xandrix@nrgph2.org',
    facebookUrl: 'https://facebook.com/xandrix.pagligaran.nrgph2',
    avatarIcon: '🗳️',
    color: '#D97706',
    badge: 'COMELEC',
  },
  {
    name: 'Jhon Magdaluyo',
    role: 'Chairperson — Disaster Risk Reduction Management (DRRM)',
    category: 'committee',
    blockOrDept: 'Emergency Evacuation, Calamity Response & Fire Safety',
    phone: '0917-911-0004',
    email: 'drrm.jhon@nrgph2.org',
    facebookUrl: 'https://facebook.com/jhon.magdaluyo.nrgph2',
    avatarIcon: '🚨',
    color: '#DC2626',
    badge: 'DRRM',
  },
  {
    name: 'Wennie Arago',
    role: 'Chairperson — Peace and Order Committee',
    category: 'committee',
    blockOrDept: 'Security Guard Coordination & 24/7 Gate Patrols',
    phone: '0918-223-7705',
    email: 'peaceorder.wennie@nrgph2.org',
    facebookUrl: 'https://facebook.com/wennie.arago.nrgph2',
    avatarIcon: '🛡️',
    color: '#059669',
    badge: 'Peace & Order',
  },
  {
    name: 'Ronald Balbin',
    role: 'Chairperson — Sports & Recreation Committee',
    category: 'committee',
    blockOrDept: 'Covered Court Bookings & Community Sports Leagues',
    phone: '0920-556-8806',
    email: 'sports.ronald@nrgph2.org',
    facebookUrl: 'https://facebook.com/ronald.balbin.nrgph2',
    avatarIcon: '🏀',
    color: '#EA580C',
    badge: 'Sports',
  },
  {
    name: 'Allen Tabasa',
    role: 'Chairperson — Facilities & Improvement Committee',
    category: 'committee',
    blockOrDept: 'Infrastructure Projects, Renovation Permits & Blueprints',
    phone: '0917-334-1107',
    email: 'facilities.allen@nrgph2.org',
    facebookUrl: 'https://facebook.com/allen.tabasa.nrgph2',
    avatarIcon: '🏗️',
    color: '#2563EB',
    badge: 'Facilities',
  },
  {
    name: 'Alan Talaba',
    role: 'Chairperson — Gender and Development (GAD)',
    category: 'committee',
    blockOrDept: 'Women & Children Welfare, Senior Citizens & Social Dev.',
    phone: '0922-887-2208',
    email: 'gad.alan@nrgph2.org',
    facebookUrl: 'https://facebook.com/alan.talaba.nrgph2',
    avatarIcon: '🤝',
    color: '#9333EA',
    badge: 'GAD',
  },
  {
    name: 'Clemente Sibayan, Ferdinand Lazo, and Nicanor Lasac',
    role: 'Committee Heads — Livelihood Programs',
    category: 'committee',
    blockOrDept: 'Community Enterprise, Skills Training & Cooperative Hub',
    phone: '0919-665-4409',
    email: 'livelihood.leads@nrgph2.org',
    facebookUrl: 'https://facebook.com/nrgph2.livelihood.committee',
    avatarIcon: '🌱',
    color: '#166534',
    badge: 'Livelihood',
  },
  {
    name: 'Conrado Laoang',
    role: 'Chairperson — Maintenance Committee',
    category: 'committee',
    blockOrDept: 'Drainage Cleansing, Solar Streetlights & Road Repair',
    phone: '0917-772-5510',
    email: 'maintenance.conrado@nrgph2.org',
    facebookUrl: 'https://facebook.com/conrado.laoang.nrgph2',
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
      officer.phone.toLowerCase().includes(q) ||
      officer.email.toLowerCase().includes(q) ||
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
              Direct contact coordinates (Phone, Official Email & Facebook profiles) for your elected Executive Board, Block Leaders 1–9, and 10 Working Committees.
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
              placeholder="Search by name, role, email, phone, or block..."
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
                          {officer.badge.toUpperCase()}
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

                  {/* CONTACT COORDINATES BOX */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>📞</span>
                      <a href={`tel:${officer.phone}`} style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
                        {officer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>✉️</span>
                      <a href={`mailto:${officer.email}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {officer.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px dashed var(--border)' }}>
                      <a
                        href={officer.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{
                          background: '#1877F2',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 11.5,
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <FacebookIcon size={14} color="#FFF" />
                        <span>Facebook Profile</span>
                      </a>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Mock Profile</span>
                    </div>
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

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11.5 }}>
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <a href={`tel:${officer.phone}`} style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
                        {officer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <a href={`mailto:${officer.email}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                        {officer.email}
                      </a>
                    </div>
                    <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px dashed var(--border)' }}>
                      <a
                        href={officer.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{
                          background: '#1877F2',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '3px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <FacebookIcon size={12} color="#FFF" />
                        <span>Facebook</span>
                      </a>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Verified Leader</span>
                    </div>
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
                        {officer.badge.toUpperCase()}
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

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <a href={`tel:${officer.phone}`} style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
                          {officer.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <a href={`mailto:${officer.email}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                          {officer.email}
                        </a>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px dashed var(--border)' }}>
                      <a
                        href={officer.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{
                          background: '#1877F2',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <FacebookIcon size={13} color="#FFF" />
                        <span>Committee Facebook Channel</span>
                      </a>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Official Taskforce</span>
                    </div>
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
