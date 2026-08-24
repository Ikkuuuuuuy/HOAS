import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HOA_OFFICERS_DATA, FacebookIcon } from './admin/HOAOfficersDirectory';

declare global {
  interface Window {
    L: any;
  }
}

const NAV_LINKS = ['Home', 'About', 'Map & Amenities', 'Events', 'HOA Officers', 'Contact'];

const NEWS = [
  {
    tag: 'Maintenance',
    tagClass: 'news-tag-maintenance',
    date: 'July 28, 2026',
    title: 'Annual Pool Maintenance Scheduled for August 10–12',
    excerpt:
      'The community pool will be temporarily closed for its annual deep-clean and equipment inspection. Residents are asked to plan accordingly.',
    img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=380&fit=crop&auto=format',
  },
  {
    tag: 'Landscaping',
    tagClass: 'news-tag-landscaping',
    date: 'July 22, 2026',
    title: 'Phase 2 Entryway Landscaping Project Underway',
    excerpt:
      'Our landscaping committee has approved new native plantings along Northridge Blvd. Installation begins the first week of August.',
    img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=380&fit=crop&auto=format',
  },
  {
    tag: 'Governance',
    tagClass: 'news-tag-governance',
    date: 'July 15, 2026',
    title: 'Q3 Board Meeting Minutes Now Available',
    excerpt:
      'The July board meeting minutes have been posted to the documents portal. Key topics included reserve fund allocation and trash schedule changes.',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=380&fit=crop&auto=format',
  },
];

const EVENTS = [
  {
    month: 'AUG',
    day: '10',
    title: 'National Night Out Block Party',
    time: '5:00 PM – 8:00 PM',
    location: 'Northridge Grove Park',
    color: '#DC2626',
    colorSoft: 'rgba(220,38,38,0.12)',
  },
  {
    month: 'AUG',
    day: '17',
    title: 'HOA Board Meeting — Open Session',
    time: '7:00 PM – 9:00 PM',
    location: 'Community Center, Room B',
    color: '#166534',
    colorSoft: 'rgba(22,101,52,0.12)',
  },
  {
    month: 'SEP',
    day: '6',
    title: 'Fall Yard Sale — Community-Wide',
    time: '8:00 AM – 2:00 PM',
    location: 'Throughout Phase 2',
    color: '#DC2626',
    colorSoft: 'rgba(220,38,38,0.12)',
  },
  {
    month: 'SEP',
    day: '20',
    title: 'Tree Planting Volunteer Day',
    time: '9:00 AM – 12:00 PM',
    location: 'Greenway Trail Entrance',
    color: '#166534',
    colorSoft: 'rgba(22,101,52,0.12)',
  },
];

const GUIDELINES = [
  {
    icon: '🌿',
    iconBg: 'linear-gradient(135deg, #166534, #22C55E)',
    title: 'Landscaping Standards',
    body: 'Front yards must be maintained with mowed grass, trimmed hedges, and no dead vegetation. Approved plant species are listed in the CCRs appendix.',
  },
  {
    icon: '🐾',
    iconBg: 'linear-gradient(135deg, #D97706, #F59E0B)',
    title: 'Pet Policies',
    body: 'All pets must be leashed in common areas. Owners are responsible for immediate waste cleanup. Aggressive breeds require liability insurance on file.',
  },
  {
    icon: '🚗',
    iconBg: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    title: 'Parking Rules',
    body: 'No overnight street parking between 2–6 AM. Recreational vehicles may not be stored in driveways for more than 72 hours without board approval.',
  },
  {
    icon: '🔊',
    iconBg: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    title: 'Noise & Quiet Hours',
    body: 'Quiet hours are 10 PM to 7 AM on weekdays and 11 PM to 8 AM on weekends. Construction and power tools are prohibited before 8 AM.',
  },
];

interface POI {
  id: string;
  name: string;
  category: 'hoa' | 'grocery' | 'hospital' | 'school' | 'dining' | 'transport';
  lat: number;
  lng: number;
  distance: string;
  address: string;
  iconEmoji: string;
  notes: string;
  googleSearchQuery: string;
}

const POI_DATA: POI[] = [
  // HOA Facilities inside Northridge Grove Phase 2 (B7 Maagap St)
  { id: '1', name: 'NRG PH2 Main Entrance & Guardhouse', category: 'hoa', lat: 14.7936, lng: 121.0758, distance: 'B7 Maagap St (Main Gate)', address: 'B7 Maagap St, Northridge Grove Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🚪', notes: '24/7 Security Guardhouse & Automated RFID Boom Barrier Gate', googleSearchQuery: 'B7 Maagap St SJDM 3023 Bulacan' },
  { id: '2', name: 'Phase 2 Clubhouse & Function Hall', category: 'hoa', lat: 14.7940, lng: 121.0778, distance: 'Inside Phase 2', address: 'Block 2, Maagap St, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏛', notes: 'NRG PH2 HOA Admin Office & Multipurpose Event Center', googleSearchQuery: 'Northridge Grove Phase 2 Maagap St San Jose del Monte Bulacan' },
  { id: '3', name: 'Phase 2 Swimming Pools & Gazebo', category: 'hoa', lat: 14.7948, lng: 121.0788, distance: 'Phase 2 Amenities', address: 'Block 3, Poolside Area, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏊', notes: 'Adult Lap Pool & Kiddie Wading Pool with Gazebo', googleSearchQuery: 'Northridge Grove Phase 2 Swimming Pool Bulacan' },
  { id: '4', name: 'Covered Basketball & Sports Court', category: 'hoa', lat: 14.7930, lng: 121.0768, distance: 'Inside Phase 2', address: 'Block 7, Maagap St Park, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏀', notes: 'Full-court basketball, nightly sports & General Assemblies', googleSearchQuery: 'B7 Maagap St Northridge Grove San Jose del Monte' },

  // Commercial & Convenience Landmarks
  { id: '5', name: 'SM City San Jose del Monte', category: 'grocery', lat: 14.7985, lng: 121.0510, distance: '3.2 km (8 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🛒', notes: 'SM Supermarket, Department Store, Cinemas & Shops', googleSearchQuery: 'SM City San Jose del Monte Bulacan' },
  { id: '6', name: 'Savemore Market Tungkong Mangga', category: 'grocery', lat: 14.7950, lng: 121.0525, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🛍', notes: 'Fresh produce & daily grocery essentials', googleSearchQuery: 'Savemore Market Tungkong Mangga San Jose del Monte' },
  { id: '7', name: 'Puregold Extra Tungko', category: 'grocery', lat: 14.7962, lng: 121.0538, distance: '3.0 km (7 mins)', address: 'Tungko Proper, CSJDM, Bulacan', iconEmoji: '🏬', notes: 'Wholesale & retail grocery store', googleSearchQuery: 'Puregold Tungkong Mangga San Jose del Monte' },
  { id: '8', name: 'WalterMart San Jose del Monte', category: 'grocery', lat: 14.8050, lng: 121.0450, distance: '4.5 km (11 mins)', address: 'Quirino Hwy, CSJDM, Bulacan', iconEmoji: '🛒', notes: 'WalterMart Supermarket & Abenson Appliance Store', googleSearchQuery: 'WalterMart San Jose del Monte Bulacan' },

  // Healthcare
  { id: '9', name: 'QualiMed Hospital CSJDM', category: 'hospital', lat: 14.7972, lng: 121.0490, distance: '3.4 km (9 mins)', address: 'Altaraza Town Center, CSJDM, Bulacan', iconEmoji: '🏥', notes: '24/7 Emergency Room & Specialty Hospital', googleSearchQuery: 'QualiMed Hospital San Jose del Monte Bulacan' },
  { id: '10', name: 'Grace General Hospital', category: 'hospital', lat: 14.8100, lng: 121.0600, distance: '3.8 km (10 mins)', address: 'Maharlika Rd, CSJDM, Bulacan', iconEmoji: '🚑', notes: 'Tertiary Care Hospital & ICU', googleSearchQuery: 'Grace General Hospital San Jose del Monte Bulacan' },
  { id: '11', name: 'Barangay Tungkong Mangga Health Center', category: 'hospital', lat: 14.7940, lng: 121.0545, distance: '2.8 km (6 mins)', address: 'Brgy Hall Compound, CSJDM, Bulacan', iconEmoji: '🩺', notes: 'Public Barangay Clinic & Vaccination Facility', googleSearchQuery: 'Barangay Tungkong Mangga Hall San Jose del Monte' },

  // Education
  { id: '12', name: 'Colegio de San Jose del Monte', category: 'school', lat: 14.7960, lng: 121.0580, distance: '2.6 km (6 mins)', address: 'Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🏫', notes: 'Private K-12 & College Campus', googleSearchQuery: 'Colegio de San Jose del Monte Tungkong Mangga' },
  { id: '13', name: 'First City Providential College (FCPC)', category: 'school', lat: 14.8020, lng: 121.0480, distance: '3.9 km (9 mins)', address: 'Narra St, CSJDM, Bulacan', iconEmoji: '🎓', notes: 'Higher Education & Senior High School', googleSearchQuery: 'First City Providential College San Jose del Monte' },
  { id: '14', name: 'Paradise Farms National High School', category: 'school', lat: 14.7945, lng: 121.0790, distance: '600m (2 mins)', address: 'Paradise Farms, Tungkong Mangga, CSJDM', iconEmoji: '📚', notes: 'Public High School nearest to Phase 2', googleSearchQuery: 'Paradise Farms National High School San Jose del Monte' },

  // Dining
  { id: '15', name: 'Jollibee Tungko Drive-Thru', category: 'dining', lat: 14.7955, lng: 121.0530, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, Tungko, CSJDM', iconEmoji: '🍗', notes: '24 Hours Fast Food & Drive-Thru', googleSearchQuery: 'Jollibee Tungko San Jose del Monte' },
  { id: '16', name: "McDonald's Altaraza Drive-Thru", category: 'dining', lat: 14.7978, lng: 121.0505, distance: '3.3 km (8 mins)', address: 'Altaraza Town Center, CSJDM', iconEmoji: '🍔', notes: '24 Hours Burger & Coffee Drive-Thru', googleSearchQuery: 'McDonalds Altaraza San Jose del Monte' },
  { id: '17', name: 'Starbucks SM San Jose del Monte', category: 'dining', lat: 14.7986, lng: 121.0512, distance: '3.2 km (8 mins)', address: 'Ground Floor, SM City CSJDM', iconEmoji: '☕', notes: 'Coffeehouse & Alfresco Seating', googleSearchQuery: 'Starbucks SM City San Jose del Monte' },

  // Transport
  { id: '18', name: 'MRT-7 Tungkong Mangga Station', category: 'transport', lat: 14.7990, lng: 121.0500, distance: '3.5 km (9 mins)', address: 'Quirino Hwy MRT Line 7, CSJDM', iconEmoji: '🚆', notes: 'Future Mass Transit Railway Station connecting to QC', googleSearchQuery: 'MRT 7 Tungkong Mangga Station San Jose del Monte' },
  { id: '19', name: 'Tungko Bus & UV Express Terminal', category: 'transport', lat: 14.7948, lng: 121.0520, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, CSJDM, Bulacan', iconEmoji: '🚌', notes: 'Daily routes to SM Fairview, Cubao, Quezon Ave & PITX', googleSearchQuery: 'Tungkong Mangga Bus Terminal San Jose del Monte' },
];

/* ── Animated Counter Hook ───────────────────────────────── */
function useCountUp(target: string, duration = 1600, triggered = false) {
  const [value, setValue] = useState('0');
  useEffect(() => {
    if (!triggered) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.]/g, '');
    if (isNaN(num)) { setValue(target); return; }
    const steps = 60;
    const step = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      setValue(Number.isInteger(num) ? Math.round(current).toLocaleString() + suffix : current.toFixed(0) + suffix);
      if (current >= num) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [triggered, target, duration]);
  return value;
}

/* ── Scroll Reveal Hook ──────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      const els = document.querySelectorAll('.reveal');
      els.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } catch {
      // Fallback for older browsers
    }
  });
}

export default function PublicLandingPage() {
  const [activeSection, setActiveSection] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsTriggered, setStatsTriggered] = useState(false);
  const heroStatsRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useScrollReveal();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger stat counters when hero stats come into view
  useEffect(() => {
    if (!heroStatsRef.current || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setStatsTriggered(true);
      return;
    }
    try {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry && entry.isIntersecting) setStatsTriggered(true); },
        { threshold: 0.5 }
      );
      obs.observe(heroStatsRef.current);
      return () => obs.disconnect();
    } catch {
      setStatsTriggered(true);
    }
  }, []);

  const SECTION_MAP: Record<string, string> = {
    'Home': 'home',
    'About': 'about',
    'Map & Amenities': 'map-amenities',
    'Events': 'events',
    'HOA Officers': 'hoa-officers',
    'Contact': 'contact',
  };

  const scrollTo = (id: string) => {
    const targetId = SECTION_MAP[id] || id.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setActiveSection(id);
    setMobileOpen(false);
  };

  const handlePortalClick = () => {
    if (user) navigate('/homeowner-portal');
    else navigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--landing-bg)', color: 'var(--landing-text)', minHeight: '100vh', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* ── HEADER / NAVIGATION BAR ── */}
      <header
        className="glass-nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled
            ? (isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)')
            : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: scrolled
            ? (isDark ? '0 4px 20px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(0, 0, 0, 0.08)')
            : 'none',
          borderBottom: scrolled
            ? (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0')
            : '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

          {/* Logo */}
          <button
            onClick={() => scrollTo('Home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 0 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F59E0B', boxShadow: '0 0 12px rgba(245,158,11,0.35)', flexShrink: 0 }}>
              <img src="/nrg-ph2-logo.png" alt="NRG PH2 HOA INC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'left', borderLeft: scrolled && !isDark ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.2)', paddingLeft: 10 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 16,
                color: scrolled && !isDark ? '#0F172A' : '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                transition: 'color 0.2s ease',
              }}>
                NRG PH2 HOA INC
              </div>
              <div style={{
                fontSize: 10,
                color: scrolled && !isDark ? '#166534' : '#F59E0B',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                fontWeight: 800,
                transition: 'color 0.2s ease',
              }}>
                Northridge Grove Phase 2
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="public-nav-desktop" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {NAV_LINKS.map(link => {
              const isSelected = activeSection === link;
              const isLightScrolled = scrolled && !isDark;

              let linkColor = 'rgba(255, 255, 255, 0.88)';
              let linkBg = 'transparent';
              let linkBorder = '1px solid transparent';

              if (isLightScrolled) {
                linkColor = isSelected ? '#DC2626' : '#334155';
                linkBg = isSelected ? 'rgba(220, 38, 38, 0.08)' : 'transparent';
                linkBorder = isSelected ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid transparent';
              } else {
                linkColor = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.88)';
                linkBg = isSelected ? 'rgba(220, 38, 38, 0.25)' : 'transparent';
                linkBorder = isSelected ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid transparent';
              }

              return (
                <button
                  key={link}
                  onClick={() => scrollTo(link)}
                  style={{
                    background: linkBg,
                    border: linkBorder,
                    cursor: 'pointer',
                    padding: '8px 14px', borderRadius: 8,
                    fontSize: 14, fontWeight: isSelected ? 700 : 500,
                    color: linkColor,
                    transition: 'all 0.18s',
                  }}
                >
                  {link}
                </button>
              );
            })}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, marginLeft: 10, alignItems: 'center' }}>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: scrolled && !isDark ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)',
                  border: scrolled && !isDark ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer', fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.22s ease',
                  flexShrink: 0,
                  color: scrolled && !isDark ? '#0F172A' : '#FFFFFF',
                }}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <button
                onClick={handlePortalClick}
                id="btn-resident-portal-nav"
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#FFFFFF',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
                  boxShadow: '0 3px 12px rgba(220,38,38,0.35)',
                  transition: 'all 0.18s ease', letterSpacing: '-0.01em',
                }}
              >
                {user ? 'Enter Portal' : 'Log in'}
              </button>

              {!user && (
                <Link
                  to="/register"
                  style={{
                    padding: '9px 16px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #166534, #15803D)',
                    color: '#FFFFFF',
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.18s ease',
                    boxShadow: '0 3px 12px rgba(22,101,52,0.3)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Register
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
            className="mobile-menu-btn"
          >
            {[0,1,2].map(i => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 2,
                  background: scrolled && !isDark ? '#0F172A' : '#FFFFFF',
                  marginBottom: i < 2 ? 5 : 0,
                  borderRadius: 2,
                  transition: 'background 0.2s ease',
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="landing-mobile-menu"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.98)' : '#FFFFFF',
              backdropFilter: 'blur(16px)',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
              padding: '12px 24px 20px',
              animation: 'fadeInUp 0.2s ease',
            }}
          >
            {NAV_LINKS.map(link => {
              const isSelected = activeSection === link;
              return (
                <button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className="landing-mobile-link"
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '11px 0', fontSize: 15, fontWeight: 600,
                    color: isDark
                      ? (isSelected ? '#F87171' : '#FFFFFF')
                      : (isSelected ? '#DC2626' : '#1E293B'),
                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #F1F5F9',
                  }}
                >
                  {link}
                </button>
              );
            })}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <button
                onClick={toggleTheme}
                style={{ padding: '10px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', fontSize: 14 }}
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button onClick={handlePortalClick} style={{ flex: 1, padding: '11px 0', background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#fff', borderRadius: 8, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                {user ? 'Enter Portal' : 'Resident Login'}
              </button>
              {!user && (
                <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '11px 0', background: 'linear-gradient(135deg,#166534,#15803D)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
                  Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Pending Homeowner Application Banner */}
      {user && (user.status === 'pending_approval' || user.status === 'pending') && (
        <div style={{
          background: 'linear-gradient(135deg, #78350F, #B45309)',
          borderBottom: '1px solid #F59E0B',
          color: '#FEF3C7',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          zIndex: 40,
          position: 'relative'
        }}>
          <span>⏳</span>
          <span>
            Welcome, <strong>{user.fullName}</strong>! Your Homeowner Account Application is currently under review by the HOA Board. You can browse the public website, but portal services remain locked until approval.
          </span>
          <Link to="/dashboard" style={{ color: '#FFF', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4, textDecoration: 'underline', marginLeft: 6 }}>
            View Status →
          </Link>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section id="home" style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1748444146081-d141d1034fcb?w=1600&h=900&fit=crop&auto=format"
          alt="Northridge Grove BRIA Homes entrance sign"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
        />
        {/* Gradient overlay — always dark for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(5,8,17,0.94) 40%, rgba(5,8,17,0.55) 100%)' }} />

        {/* Subtle grain texture overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")', opacity: 0.6 }} />

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '110px 24px 80px', width: '100%' }}>
          <div style={{ maxWidth: 680 }}>

            {/* Floating Badge */}
            <div
              className="glass-hero-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 18px', borderRadius: 24,
                color: '#FDE68A', fontSize: 11.5, fontWeight: 800,
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28,
              }}
            >
              <img src="/nrg-ph2-logo.png" alt="Logo Seal" style={{ width: 18, height: 18, borderRadius: '50%' }} />
              📍 NRG PH2 HOA INC • NORTHRIDGE GROVE PHASE 2 (2026–2027)
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
                fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1,
                margin: '0 0 22px', letterSpacing: '-0.025em',
                animation: 'fadeInUp 0.7s ease both',
                animationDelay: '0.1s',
              }}
            >
              Welcome Home to<br />
              <em style={{ fontStyle: 'normal', fontWeight: 900, color: '#F59E0B' }}>NRG PH2 HOA INC</em>
            </h1>

            <p
              style={{
                fontSize: 16.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.75,
                marginBottom: 38, maxWidth: 580,
                animation: 'fadeInUp 0.7s ease both', animationDelay: '0.22s',
              }}
            >
              Official Web-Based Portal for Northridge Grove Phase 2 Homeowners Association Inc. (NRG PH2 HOA INC), Barangay Tungkong Mangga, San Jose del Monte, Bulacan. Streamlining ledgers, document requests, payments, and real-time community governance.
            </p>

            <div
              style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                animation: 'fadeInUp 0.7s ease both', animationDelay: '0.34s',
              }}
            >
              <button
                onClick={handlePortalClick}
                id="btn-hero-portal"
                style={{
                  padding: '13px 30px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 800,
                  boxShadow: '0 4px 20px rgba(220,38,38,0.45)',
                  transition: 'all 0.2s ease', letterSpacing: '-0.01em',
                }}
              >
                {user ? '🏠 Enter Portal System' : '🔐 Resident Login'}
              </button>
              {!user && (
                <Link
                  to="/register"
                  style={{
                    padding: '13px 26px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF', fontWeight: 700, fontSize: 15,
                    border: '1px solid rgba(255,255,255,0.2)',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                    letterSpacing: '-0.01em',
                  }}
                >
                  📝 Register Account
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* METRICS BAR */}
        <div ref={heroStatsRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(5,8,17,0.88)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
            {[
              { value: '731+', label: 'HOA Members & Followers' },
              { value: '312', label: 'Registered Housing Units' },
              { value: '100%', label: 'Real-Time Financial Tracking' },
              { value: '3023', label: 'Zip Code (CSJDM Bulacan)' },
            ].map(stat => (
              <HeroStat key={stat.label} {...stat} triggered={statsTriggered} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" style={{ padding: '90px 24px', background: 'var(--landing-section-warm)', transition: 'background 0.3s ease' }}>
        <div className="about-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

          <div className="reveal">
            <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#166534', fontWeight: 800, marginBottom: 14 }}>About Our Association</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, marginBottom: 22, letterSpacing: '-0.02em' }}>
              NRG PH2 HOA INC<br />Phase 2 Homeowners Association
            </h2>
            <p style={{ color: 'var(--landing-text-sub)', lineHeight: 1.78, marginBottom: 18, fontSize: 15.5 }}>
              Serving Northridge Grove Phase 2, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines (3023), NRG PH2 HOA INC provides residents with transparent financial ledgers, automated payment history, searchable reports, facility bookings, and real-time community governance.
            </p>
            <p style={{ color: 'var(--landing-text-sub)', lineHeight: 1.78, fontSize: 15.5 }}>
              Replacing manual social media group postings with an integrated web system ensures data protection, verified owner records, and 24/7 security gate integration.
            </p>
            <div style={{ marginTop: 36, display: 'flex', gap: 36 }}>
              {[['CSJDM', 'Bulacan 3023'], ['24/7', 'Gate Guard Security'], ['Real-Time', 'Ledger System']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'var(--landing-text-muted)', marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }} className="reveal reveal-right">
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)' }}>
              <img
                src="https://images.unsplash.com/photo-1770938474431-d1192cac9642?w=700&h=520&fit=crop&auto=format"
                alt="Northridge Grove BRIA Homes neighborhood aerial"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>
            {/* Float Badge */}
            <div
              className="landing-about-float-badge"
              style={{
                position: 'absolute', bottom: -22, left: -22,
                background: 'var(--landing-card-bg)',
                border: `1px solid var(--landing-card-border)`,
                borderRadius: 12, padding: '18px 24px',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                animation: 'floatBadge 4.5s ease-in-out infinite',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: '#DC2626', lineHeight: 1, letterSpacing: '-0.02em' }}>100%</div>
              <div style={{ fontSize: 12, color: 'var(--landing-text-muted)', maxWidth: 150, fontWeight: 700, marginTop: 4, lineHeight: 1.4 }}>Automated Ledger & Financial Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP & AMENITIES SECTION ── */}
      <section id="map-amenities" style={{ padding: '90px 24px', background: 'var(--landing-bg)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 10 }}>Subdivision Location & Official Boundary</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em' }}>
              Interactive Google Map & Subdivision Border
            </h2>
            <p style={{ color: 'var(--landing-text-sub)', fontSize: 15.5, maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
              Official Google Maps tiles for Bria Northridge Grove with highlighted subdivision boundary outline alongside nearby supermarkets, malls, hospitals, schools, and transport terminals in Barangay Tungkong Mangga, San Jose del Monte, Bulacan 3023.
            </p>
          </div>
          <GoogleSubdivisionMapSection isDark={isDark} />
        </div>
      </section>

      {/* ── COMMUNITY NEWS ── */}
      <section style={{ padding: '90px 24px', background: 'var(--landing-section-news)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div className="reveal">
              <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 10 }}>Latest Updates</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>Real-Time Community Announcements</h2>
            </div>
            <button
              onClick={handlePortalClick}
              style={{
                background: 'var(--landing-card-bg)', border: `1px solid var(--landing-card-border)`,
                borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, color: 'var(--landing-text)',
                transition: 'all 0.18s ease', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              View All Notices in Portal →
            </button>
          </div>
          <div className="news-grid reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {NEWS.map(item => <NewsCard key={item.title} {...item} onPortalClick={handlePortalClick} isDark={isDark} />)}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section id="events" style={{ padding: '90px 24px', background: 'var(--landing-bg)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 72, alignItems: 'start' }}>
            <div className="reveal">
              <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>Mark Your Calendar</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>Upcoming Events & Agendas</h2>
              <p style={{ color: 'var(--landing-text-sub)', fontSize: 15.5, lineHeight: 1.75, marginBottom: 30 }}>
                From general assemblies in Tungkong Mangga to facility bookings, stay connected with BRIA Northridge Grove events.
              </p>
              <button
                onClick={handlePortalClick}
                style={{
                  padding: '13px 26px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(220,38,38,0.38)',
                  letterSpacing: '-0.01em',
                }}
              >
                Add to Calendar / Reserve Court
              </button>
            </div>
            <div className="reveal reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {EVENTS.map(evt => <EventCard key={evt.title} {...evt} onClick={handlePortalClick} isDark={isDark} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY GUIDELINES ── */}
      <section id="community-guidelines" style={{ padding: '90px 24px', background: 'var(--landing-guidelines-bg)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F59E0B', fontWeight: 800, marginBottom: 14 }}>Rules & Security Standards</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em' }}>BRIA Northridge Grove Guidelines</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15.5, maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              Designed to preserve property values, maintain peace, and secure homeowner safety in Brgy. Tungkong Mangga.
            </p>
          </div>
          <div className="guidelines-grid reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {GUIDELINES.map(g => <GuidelineCard key={g.title} {...g} />)}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
            <button
              onClick={handlePortalClick}
              style={{
                padding: '13px 32px', borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.25)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                transition: 'all 0.2s ease',
                letterSpacing: '-0.01em',
              }}
            >
              📄 Download Full HOA By-Laws & CCRs (PDF) via Portal
            </button>
          </div>
        </div>
      </section>

      {/* ── HOA OFFICERS & DIRECTORY SECTION ── */}
      <section id="hoa-officers" style={{ padding: '90px 24px', background: 'var(--landing-section-warm)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#166534', fontWeight: 800, marginBottom: 10 }}>Official Association Leadership</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em' }}>
              NRG PH2 HOA Officers & Committee Chairs
            </h2>
            <p style={{ color: 'var(--landing-text-sub)', fontSize: 15.5, maxWidth: 680, margin: '0 auto', lineHeight: 1.7 }}>
              Meet the duly elected Executive Board of Directors, dedicated Block Leaders (Blocks 1–9), and Working Committee Chairs serving Northridge Grove Phase 2.
            </p>
          </div>

          {/* 1. EXECUTIVE BOARD CARDS */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              👑 Executive Board of Directors
            </div>
            <div className="grid grid-3" style={{ gap: 16 }}>
              {HOA_OFFICERS_DATA.filter(o => o.category === 'executive').map((off, i) => (
                <div
                  key={i}
                  className="card hover-lift"
                  style={{
                    background: 'var(--landing-card-bg)',
                    border: `1.5px solid ${off.color}40`,
                    padding: 20,
                    borderRadius: 14,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ height: 4, background: off.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${off.color}15`, color: off.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                        {off.avatarIcon}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: off.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{off.badge}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--landing-text)' }}>{off.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: off.color, marginTop: 4 }}>{off.role}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--landing-text-muted)', marginTop: 2 }}>{off.blockOrDept}</div>
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--landing-text-sub)', marginTop: 12, paddingTop: 10, borderTop: `1px solid var(--landing-card-border)`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <a href={`tel:${off.phone}`} style={{ color: 'var(--landing-text)', fontWeight: 700, textDecoration: 'none' }}>{off.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <a href={`mailto:${off.email}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{off.email}</a>
                    </div>
                    <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: `1px dashed var(--landing-card-border)` }}>
                      <a
                        href={off.facebookUrl}
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
                      <span style={{ fontSize: 10, color: 'var(--landing-text-muted)' }}>Officer Profile</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. BLOCK LEADERS */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0891B2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              🏘️ Block Coordinators (Blocks 1 to 9)
            </div>
            <div className="grid grid-3" style={{ gap: 14 }}>
              {HOA_OFFICERS_DATA.filter(o => o.category === 'block_leader').map((off, i) => (
                <div
                  key={i}
                  className="card hover-lift"
                  style={{
                    background: 'var(--landing-card-bg)',
                    border: `1px solid var(--landing-card-border)`,
                    padding: 16,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="badge" style={{ background: '#ECFEFF', color: '#0891B2', fontWeight: 800, fontSize: 11 }}>{off.badge}</span>
                      <span style={{ fontSize: 16 }}>🏘️</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--landing-text)' }}>{off.name}</div>
                    <div style={{ fontSize: 11.5, color: '#0891B2', fontWeight: 700, marginTop: 2 }}>{off.role}</div>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--landing-text-sub)', marginTop: 10, paddingTop: 8, borderTop: `1px solid var(--landing-card-border)`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div>📞 <strong>{off.phone}</strong></div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉️ {off.email}</div>
                    <div className="mt-1 pt-1 flex items-center justify-between" style={{ borderTop: `1px dashed var(--landing-card-border)` }}>
                      <a
                        href={off.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#1877F2',
                          fontWeight: 700,
                          fontSize: 11,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'none',
                        }}
                      >
                        <FacebookIcon size={12} color="#1877F2" />
                        <span>Facebook</span>
                      </a>
                      <span style={{ fontSize: 9.5, color: 'var(--landing-text-muted)' }}>Block Lead</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. WORKING COMMITTEES */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              🛡️ Working Committees & Special Taskforces (10 Committees)
            </div>
            <div className="grid grid-2" style={{ gap: 14 }}>
              {HOA_OFFICERS_DATA.filter(o => o.category === 'committee').map((off, i) => (
                <div
                  key={i}
                  className="card hover-lift"
                  style={{
                    background: 'var(--landing-card-bg)',
                    border: `1px solid var(--landing-card-border)`,
                    padding: 16,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="badge" style={{ background: `${off.color}15`, color: off.color, fontWeight: 800, fontSize: 10 }}>{off.badge.toUpperCase()}</span>
                      <span style={{ fontSize: 18 }}>{off.avatarIcon}</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--landing-text)' }}>{off.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: off.color, marginTop: 2 }}>{off.role}</div>
                    <div style={{ fontSize: 11, color: 'var(--landing-text-muted)', marginTop: 3 }}>Scope: {off.blockOrDept}</div>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--landing-text-sub)', marginTop: 10, paddingTop: 8, borderTop: `1px solid var(--landing-card-border)`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div className="flex justify-between items-center">
                      <span>📞 <strong>{off.phone}</strong></span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉️ {off.email}</span>
                    </div>
                    <div className="mt-1 pt-1 flex items-center justify-between" style={{ borderTop: `1px dashed var(--landing-card-border)` }}>
                      <a
                        href={off.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#1877F2',
                          fontWeight: 700,
                          fontSize: 11,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'none',
                        }}
                      >
                        <FacebookIcon size={12} color="#1877F2" />
                        <span>Committee Facebook</span>
                      </a>
                      <span style={{ fontSize: 9.5, color: 'var(--landing-text-muted)' }}>Taskforce</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" style={{ padding: '90px 24px', background: 'var(--landing-bg)', transition: 'background 0.3s ease' }}>
        <div className="contact-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72 }}>
          <div className="reveal">
            <p style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>Get in Touch</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--landing-text)', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>Contact BRIA HOA Administration</h2>
            <p style={{ color: 'var(--landing-text-sub)', fontSize: 15.5, lineHeight: 1.75, marginBottom: 36 }}>
              Have a maintenance request, dues inquiry, or TCT verification question?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {[
                { icon: '📍', iconBg: 'linear-gradient(135deg,#DC2626,#EF4444)', label: 'Official Address', value: 'Northridge Grove Phase 2, Barangay Tungkong Mangga\nSan Jose del Monte, Bulacan, Philippines, 3023' },
                { icon: '📞', iconBg: 'linear-gradient(135deg,#166534,#22C55E)', label: 'HOA Office Hotline', value: '(02) 8987-6543 · Mon–Sat 8am–5pm' },
                { icon: '✉️', iconBg: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', label: 'Email Support', value: 'admin@nrg-ph2-hoa.ph' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--landing-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{c.label}</div>
                    <div style={{ fontSize: 14.5, color: 'var(--landing-text)', whiteSpace: 'pre-line', fontWeight: 600 }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="reveal reveal-right landing-contact-form"
            style={{
              background: 'var(--landing-card-bg)',
              border: `1px solid var(--landing-card-border)`,
              borderRadius: 16, padding: 36,
              boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--landing-text)', marginBottom: 24, letterSpacing: '-0.02em' }}>Send Message to HOA Board</h3>
            <ContactForm isDark={isDark} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'var(--landing-footer-bg)',
        color: 'rgba(255,255,255,0.65)',
        padding: '52px 24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 44, marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img src="/nrg-ph2-logo.png" alt="NRG PH2 Seal" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #F59E0B' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>NRG PH2 HOA INC</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>Northridge Grove Phase 2 HOA</div>
              <p style={{ fontSize: 13, lineHeight: 1.72, maxWidth: 280 }}>
                Northridge Grove Phase 2, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines, 3023.
              </p>
            </div>
            {[
              { heading: 'Quick Navigation', links: ['Home', 'About', 'Map & Amenities', 'Events', 'Contact'] },
              { heading: 'Homeowner Portal', links: ['Resident Login', 'Register Account', 'Forgot Password', 'My Dues'] },
              { heading: 'Governance', links: ['Board Officers', 'Meeting Minutes', 'Financial Reports', 'Bylaws'] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: 16 }}>{col.heading}</div>
                {col.links.map(l => (
                  <div
                    key={l}
                    onClick={() => {
                      if (l === 'Resident Login') navigate('/login');
                      else if (l === 'Register Account') navigate('/register');
                      else if (l === 'Forgot Password') navigate('/forgot-password');
                      else handlePortalClick();
                    }}
                    style={{ fontSize: 13, marginBottom: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: 12 }}>
            <div>© 2026 NRG PH2 HOA INC (Northridge Grove Phase 2 Homeowners Association). All rights reserved.</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <button
                onClick={toggleTheme}
                style={{ fontSize: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: 6, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 600 }}
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}>Forgot Password</Link>
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}>Register Account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Hero Stat Item with Counter ────────────────────────────── */
function HeroStat({ value, label, triggered }: { value: string; label: string; triggered: boolean }) {
  const animated = useCountUp(value, 1400, triggered);
  return (
    <div style={{ textAlign: 'center', animation: triggered ? 'counterPop 0.5s ease both' : 'none' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#6EE7B7', lineHeight: 1, letterSpacing: '-0.02em' }}>{triggered ? animated : '—'}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 5, letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ── Google Maps Engine ──────────────────────────────────────── */
function GoogleSubdivisionMapSection({ isDark }: { isDark: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoi, setActivePoi] = useState<POI | null>(null);
  const [mapType, setMapType] = useState<'m' | 'y'>('m');

  const handleSelectPoi = (poi: POI) => {
    if (activePoi?.id === poi.id) {
      setActivePoi(null);
      if (leafletInstance.current) {
        leafletInstance.current.setView([14.7939, 121.0832], 16, { animate: true });
        leafletInstance.current.closePopup();
      }
    } else {
      setActivePoi(poi);
      if (leafletInstance.current) {
        leafletInstance.current.setView([poi.lat, poi.lng], 17, { animate: true });
      }
    }
  };

  const filteredPois = POI_DATA.filter(poi => {
    const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !window.L) return;
    try {
      if (!leafletInstance.current) {
        const map = window.L.map(mapRef.current).setView([14.7946, 121.0800], 16);
        window.L.tileLayer('https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, attribution: '© Google Maps | NRG PH2 HOA INC Boundary' }).addTo(map);
        leafletInstance.current = map;

        // EXACT NORTHRIDGE GROVE PHASE 2 SUBDIVISION PERIMETER BORDER
        const borderPolygonCoords = [
          // ── 1. West Sector: Left Edge & Southwest Entrance Corner ──
          [14.79250, 121.07580], // Southwest Corner (near La Bonita Cosmetics & Main Gate)
          [14.79350, 121.07540], // Western Edge lower (south of Chancezz)
          [14.79460, 121.07530], // Western Edge middle (beside Chancezz / B7 Maagap St)
          [14.79560, 121.07560], // Northwest Flank
          [14.79600, 121.07590], // Northwest Corner (Amy Ella Panaderia area)

          // ── 2. West Sector: Northern Perimeter with BCCCP Inset ──
          [14.79610, 121.07680], // Top boundary lot line
          [14.79570, 121.07760], // Inward dip/cove near BCCCP lot line
          [14.79540, 121.07820], // Inset boundary corner
          [14.79580, 121.07900], // Climbs back to Northern lot line
          [14.79610, 121.07990], // North perimeter of middle block
          [14.79630, 121.08060], // Central spine junction / neck

          // ── 3. Northeast Sector: Fan-Shaped Arch (Top Dome & Parang Rd) ──
          [14.79690, 121.08040], // Neck transition into right lobe
          [14.79770, 121.08030], // Western apex of upper fan (near nathan sari-sari)
          [14.79810, 121.08080], // Topmost northern apex (L&A Laundry Home)
          [14.79800, 121.08180], // Parang Rd upper bend
          [14.79750, 121.08280], // Upper Parang Rd frontage
          [14.79720, 121.08360], // Eastern approach (Bakery area)
          [14.79660, 121.08430], // Near Susana's Kitchen / North-East Corner
          [14.79590, 121.08450], // Far East Corner (Goumn / Casa Resort boundary)

          // ── 4. Northeast Sector: Southeastern Perimeter ──
          [14.79520, 121.08370], // South-east diagonal boundary
          [14.79450, 121.08270], // Lower east lot lines (near Plk A Book)
          [14.79390, 121.08180], // Approach to southern neck (near Tea Alley Station)
          [14.79340, 121.08100], // Inner neck bottom cusp

          // ── 5. West Sector: Southern Perimeter ──
          [14.79290, 121.08120], // Bottom road corner (below JCS Pandes)
          [14.79250, 121.08060], // Southern road curve
          [14.79220, 121.07970], // Southern perimeter road (Farm Fresh)
          [14.79170, 121.07860], // Southernmost bottom dip
          [14.79150, 121.07770], // Southern road curve (Mabuti St south)
          [14.79190, 121.07670], // Southwest perimeter road
          [14.79230, 121.07610], // Curve back to Southwest corner
        ];

        // Outer glow line (Golden Amber)
        window.L.polygon(borderPolygonCoords, {
          color: '#F59E0B',
          weight: 6,
          opacity: 0.5,
          fillOpacity: 0,
        }).addTo(map);

        // Main crisp boundary polygon (Matching exact golden satellite border)
        const polygonLayer = window.L.polygon(borderPolygonCoords, {
          color: '#EAB308',
          fillColor: '#F59E0B',
          fillOpacity: 0.16,
          weight: 3.5,
          dashArray: '8, 5',
        }).addTo(map);

        polygonLayer.bindPopup(`
          <div style="font-family:sans-serif;padding:6px;min-width:240px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="background:#F59E0B;color:#FFF;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:900;">OFFICIAL BOUNDARY</div>
              <div style="font-size:11px;color:#DC2626;font-weight:800;">312 HOUSING UNITS</div>
            </div>
            <div style="font-weight:900;font-size:15px;color:#111827;">Northridge Grove Phase 2</div>
            <div style="font-size:12px;color:#B45309;font-weight:700;margin-top:2px;">NRG PH2 HOA INC Jurisdiction</div>
            <div style="font-size:12px;color:#4B5563;margin-top:6px;line-height:1.4;">
              📍 B7 Maagap St, Barangay Tungkong Mangga, San Jose del Monte, Bulacan 3023
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #E5E7EB;font-size:11.5px;color:#374151;">
              • <strong>Coverage:</strong> Blocks 1, 2, 3, 4, 5, 6, 7, 8, and 9<br/>
              • <strong>Streets:</strong> Maagap St, Mabuti St, Mapayapa St, Magiting St<br/>
              • <strong>Key Amenities:</strong> Clubhouse, Covered Basketball Court, Swimming Pools, Playground, 24/7 RFID Gate
            </div>
          </div>
        `);
      }
    } catch {
      // Map error fallback
    }
  }, []);

  useEffect(() => {
    if (!leafletInstance.current || typeof window === 'undefined' || !window.L) return;
    try {
      const map = leafletInstance.current;
      if (window.L.TileLayer) {
        map.eachLayer((layer: any) => { if (layer instanceof window.L.TileLayer) map.removeLayer(layer); });
      }
      window.L.tileLayer(`https://mt0.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`, { maxZoom: 20, attribution: '© Google Maps' }).addTo(map);
    } catch {
      // Ignore tile switch error
    }
  }, [mapType]);

  useEffect(() => {
    if (!leafletInstance.current || typeof window === 'undefined' || !window.L) return;
    try {
      const map = leafletInstance.current;
      markersRef.current.forEach(m => {
        try { map.removeLayer(m); } catch { /* ignore */ }
      });
      markersRef.current = [];
      filteredPois.forEach(poi => {
        const bg = poi.category === 'hoa' ? '#DC2626' : poi.category === 'grocery' ? '#2563EB' : poi.category === 'hospital' ? '#EF4444' : poi.category === 'school' ? '#D97706' : '#166534';
        const customIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:${bg};color:#FFF;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.4);border:2px solid #FFF;">${poi.iconEmoji}</div>`,
          iconSize: [36, 36], iconAnchor: [18, 18],
        });
        const marker = window.L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`<div style="font-family:sans-serif;padding:4px"><div style="font-weight:800;font-size:15px;color:#111827">${poi.iconEmoji} ${poi.name}</div><div style="font-size:12px;color:#DC2626;font-weight:700;margin-top:2px">📍 ${poi.distance}</div><div style="font-size:12px;color:#4B5563;margin-top:4px">${poi.address}</div><div style="font-size:11px;color:#6B7280;margin-top:4px;font-style:italic">${poi.notes}</div><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.googleSearchQuery)}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:8px;font-size:12px;color:#2563EB;font-weight:700;text-decoration:underline">🗺 Open Directions in Google Maps →</a></div>`);
        marker.on('click', () => setActivePoi(poi));
        markersRef.current.push(marker);
      });
    } catch {
      // Map marker safety
    }
  }, [filteredPois]);

  return (
    <div>
      {/* MAP CONTROLS */}
      <div
        className="landing-map-controls"
        style={{
          background: 'var(--landing-card-bg)',
          border: `1px solid var(--landing-card-border)`,
          borderRadius: 14, padding: 20, marginBottom: 20,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#FFF', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, boxShadow: '0 4px 12px rgba(220,38,38,0.35)' }}>🗺</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--landing-text)' }}>FIND US HERE — BRIA NORTHRIDGE GROVE</div>
              <div style={{ fontSize: 12, color: 'var(--landing-text-muted)', marginTop: 2 }}>Brgy. Tungkong Mangga, San Jose del Monte, Bulacan 3023</div>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-1" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', padding: 3, borderRadius: 10, border: `1px solid var(--landing-card-border)` }}>
              {([['m', '🗺 Roadmap'], ['y', '🛰 Satellite']] as const).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setMapType(type)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                    background: mapType === type ? (type === 'm' ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : 'linear-gradient(135deg,#166534,#15803D)') : 'transparent',
                    color: mapType === type ? '#FFFFFF' : 'var(--landing-text-sub)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: mapType === type ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                >{label}</button>
              ))}
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Bria+Homes+Northridge+Grove+San+Jose+del+Monte+Bulacan"
              target="_blank" rel="noreferrer"
              style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#DC2626,#B91C1C)', color: '#FFFFFF', fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}
            >
              🚗 GET DIRECTIONS
            </a>
          </div>
        </div>

        <div className="grid grid-2 gap-4">
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--landing-text-sub)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Search Nearby Places</label>
            <input
              type="text"
              className="landing-map-search"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `1.5px solid var(--landing-card-border)`, background: 'var(--landing-input-bg)', color: 'var(--landing-text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.18s' }}
              placeholder="Search SM City, Puregold, Hospital, Gate, School..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#DC2626')}
              onBlur={e => (e.target.style.borderColor = 'var(--landing-card-border)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--landing-text-sub)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: `1.5px solid var(--landing-card-border)`, background: 'var(--landing-input-bg)', color: 'var(--landing-text)', fontSize: 13, fontWeight: 600, outline: 'none', fontFamily: 'var(--font-body)' }}
            >
              <option value="all">🗺 All Categories</option>
              <option value="hoa">🏠 HOA Facilities</option>
              <option value="grocery">🛒 Supermarkets & Malls</option>
              <option value="hospital">🏥 Hospitals & Clinics</option>
              <option value="school">🏫 Schools</option>
              <option value="dining">☕ Dining</option>
              <option value="transport">🚍 Transport</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAP CANVAS & SIDEBAR LIST */}
      <div className="map-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ padding: 0, overflow: 'hidden', border: `1px solid var(--landing-card-border)`, borderRadius: 16, height: 560, position: 'relative', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: 8, border: `1px solid var(--landing-card-border)`, fontSize: 11, fontWeight: 700, color: 'var(--landing-text)', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            🔴 Red Dashed Boundary: <span style={{ color: '#DC2626' }}>BRIA Northridge Grove Subdivision Border</span>
          </div>
        </div>

        {/* SIDEBAR POI LIST */}
        <div
          className="landing-poi-card"
          style={{ background: 'var(--landing-card-bg)', border: `1px solid var(--landing-card-border)`, borderRadius: 16, overflowY: 'auto', maxHeight: 560, padding: 18, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14, color: 'var(--landing-text)' }}>
            Found {filteredPois.length} Nearby Places
          </div>
          <div className="flex flex-col gap-2">
            {filteredPois.map(poi => (
              <div
                key={poi.id}
                onClick={() => handleSelectPoi(poi)}
                style={{
                  padding: '11px 12px', borderRadius: 10,
                  background: activePoi?.id === poi.id
                    ? 'rgba(220,38,38,0.1)'
                    : (isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB'),
                  border: activePoi?.id === poi.id
                    ? '1px solid rgba(220,38,38,0.5)'
                    : `1px solid var(--landing-card-border)`,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{poi.iconEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--landing-text)' }}>{poi.name}</div>
                    <div style={{ fontSize: 11.5, color: '#DC2626', fontWeight: 700, marginTop: 2 }}>📍 {poi.distance}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, marginTop: 7, color: 'var(--landing-text-muted)', lineHeight: 1.4 }}>{poi.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── News Card ───────────────────────────────────────────────── */
function NewsCard({ tag, tagClass, date, title, excerpt, img, onPortalClick, isDark }: typeof NEWS[0] & { onPortalClick: () => void; isDark: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="landing-card hover-lift"
      onClick={onPortalClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ overflow: 'hidden', cursor: 'pointer' }}
    >
      <div style={{ height: 200, overflow: 'hidden', background: isDark ? '#1A2440' : '#E5E7EB', position: 'relative' }}>
        <img
          src={img} alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)', transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
        />
        {/* Gradient overlay on image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
      </div>
      <div style={{ padding: '22px 24px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className={tagClass}>{tag}</span>
          <span style={{ fontSize: 12, color: 'var(--landing-text-muted)', fontWeight: 500 }}>{date}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, fontWeight: 800, lineHeight: 1.3, marginBottom: 10, color: 'var(--landing-text)', letterSpacing: '-0.01em' }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: 'var(--landing-text-sub)', lineHeight: 1.68, margin: 0 }}>{excerpt}</p>
        <div style={{ marginTop: 18, fontSize: 13, fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
          Read Details in Portal <span style={{ transition: 'transform 0.15s', transform: hovered ? 'translateX(4px)' : 'none', display: 'inline-block' }}>→</span>
        </div>
      </div>
    </div>
  );
}

/* ── Event Card ──────────────────────────────────────────────── */
function EventCard({ month, day, title, time, location, color, colorSoft, onClick, isDark }: typeof EVENTS[0] & { onClick: () => void; isDark: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="event-card-premium"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: 18, padding: '18px 22px',
        background: hovered ? (isDark ? `rgba(${color === '#DC2626' ? '220,38,38' : '22,101,52'},0.08)` : colorSoft) : 'var(--landing-card-bg)',
        border: `1px solid ${hovered ? color + '55' : 'var(--landing-card-border)'}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12, cursor: 'pointer',
        boxShadow: hovered ? (isDark ? `0 4px 20px rgba(0,0,0,0.35)` : '0 4px 20px rgba(0,0,0,0.08)') : 'none',
        alignItems: 'center', transition: 'all 0.2s ease',
      }}
    >
      <div style={{ flexShrink: 0, width: 58, height: 64, borderRadius: 10, background: `linear-gradient(135deg, ${color}, ${color}CC)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${color}44` }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', lineHeight: 1 }}>{month}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{day}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--landing-text)', marginBottom: 5, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--landing-text-muted)', fontWeight: 500 }}>{time} · {location}</div>
      </div>
      <div style={{ color: hovered ? color : 'var(--landing-text-muted)', transition: 'transform 0.18s, color 0.18s', transform: hovered ? 'translateX(5px)' : 'none', fontWeight: 700, fontSize: 16 }}>→</div>
    </div>
  );
}

/* ── Guideline Card ──────────────────────────────────────────── */
function GuidelineCard({ icon, iconBg, title, body }: typeof GUIDELINES[0]) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="hover-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '30px 32px', borderRadius: 14, cursor: 'default',
        /* Always dark — this section's background is permanently dark regardless of theme */
        background: hovered ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
        border: hovered ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, marginBottom: 18,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s ease',
        transform: hovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginBottom: 12, letterSpacing: '-0.015em' }}>{title}</h3>
      <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.72, margin: 0 }}>{body}</p>
    </div>
  );
}

/* ── Contact Form ────────────────────────────────────────────── */
function ContactForm({ isDark }: { isDark: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '44px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#166534,#22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 18px', boxShadow: '0 4px 20px rgba(22,101,52,0.4)' }}>✓</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--landing-text)', marginBottom: 10, letterSpacing: '-0.02em' }}>Message Sent to HOA Board!</div>
        <p style={{ color: 'var(--landing-text-sub)', fontSize: 14 }}>We will follow up at {form.email} within 2 business days.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} style={{ marginTop: 20, fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 800 }}>Send another message</button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 9,
    border: `1.5px solid var(--landing-input-border)`,
    background: 'var(--landing-input-bg)',
    fontSize: 14, color: 'var(--landing-text)',
    outline: 'none', fontFamily: 'var(--font-body)',
    boxSizing: 'border-box', transition: 'border-color 0.18s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 800, color: 'var(--landing-text-sub)',
    textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan Dela Cruz"
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = 'var(--landing-input-border)')} />
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="juan@email.com"
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = 'var(--landing-input-border)')} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Subject</label>
        <select required style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = '#DC2626')}
          onBlur={e => (e.target.style.borderColor = 'var(--landing-input-border)')}>
          <option value="">Select a topic…</option>
          <option>TCT & Owner Verification Inquiry</option>
          <option>HOA Monthly Dues Inquiry</option>
          <option>Facility Reservation Question</option>
          <option>Gate Pass & Security Notice</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea required rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your question..."
          onFocus={e => (e.target.style.borderColor = '#DC2626')}
          onBlur={e => (e.target.style.borderColor = 'var(--landing-input-border)')} />
      </div>
      <button
        type="submit"
        style={{
          padding: '13px', borderRadius: 10,
          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
          color: '#FFFFFF', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 800, transition: 'opacity 0.18s',
          boxShadow: '0 4px 16px rgba(220,38,38,0.38)',
          letterSpacing: '-0.01em',
        }}
      >
        Send Message to HOA Board
      </button>
    </form>
  );
}
