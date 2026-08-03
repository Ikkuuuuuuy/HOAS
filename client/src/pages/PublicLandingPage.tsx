import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    L: any;
  }
}

const NAV_LINKS = ['Home', 'About', 'Map & Amenities', 'Events', 'Contact'];

const NEWS = [
  {
    tag: 'Maintenance',
    date: 'July 28, 2026',
    title: 'Annual Pool Maintenance Scheduled for August 10–12',
    excerpt:
      'The community pool will be temporarily closed for its annual deep-clean and equipment inspection. Residents are asked to plan accordingly.',
    img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=380&fit=crop&auto=format',
  },
  {
    tag: 'Landscaping',
    date: 'July 22, 2026',
    title: 'Phase 2 Entryway Landscaping Project Underway',
    excerpt:
      'Our landscaping committee has approved new native plantings along Northridge Blvd. Installation begins the first week of August.',
    img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=380&fit=crop&auto=format',
  },
  {
    tag: 'Governance',
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
  },
  {
    month: 'AUG',
    day: '17',
    title: 'HOA Board Meeting — Open Session',
    time: '7:00 PM – 9:00 PM',
    location: 'Community Center, Room B',
    color: '#166534',
  },
  {
    month: 'SEP',
    day: '6',
    title: 'Fall Yard Sale — Community-Wide',
    time: '8:00 AM – 2:00 PM',
    location: 'Throughout Phase 2',
    color: '#DC2626',
  },
  {
    month: 'SEP',
    day: '20',
    title: 'Tree Planting Volunteer Day',
    time: '9:00 AM – 12:00 PM',
    location: 'Greenway Trail Entrance',
    color: '#166534',
  },
];

const GUIDELINES = [
  {
    icon: '🌿',
    title: 'Landscaping Standards',
    body: 'Front yards must be maintained with mowed grass, trimmed hedges, and no dead vegetation. Approved plant species are listed in the CCRs appendix.',
  },
  {
    icon: '🐾',
    title: 'Pet Policies',
    body: 'All pets must be leashed in common areas. Owners are responsible for immediate waste cleanup. Aggressive breeds require liability insurance on file.',
  },
  {
    icon: '🚗',
    title: 'Parking Rules',
    body: 'No overnight street parking between 2–6 AM. Recreational vehicles may not be stored in driveways for more than 72 hours without board approval.',
  },
  {
    icon: '🔊',
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
  // HOA Facilities inside Northridge Grove
  { id: '1', name: 'BRIA Northridge Grove Main Entrance Gate', category: 'hoa', lat: 14.7925, lng: 121.0558, distance: '0 km (Subdivision Gate)', address: 'Northridge Grove Dr, Brgy. Tungkong Mangga, CSJDM', iconEmoji: '🚪', notes: '24/7 Security Guardhouse & RFID Barrier Gate', googleSearchQuery: 'Northridge Grove Tungkong Mangga San Jose del Monte Bulacan' },
  { id: '2', name: 'Northridge Grove Clubhouse & Function Hall', category: 'hoa', lat: 14.7932, lng: 121.0565, distance: 'Inside Phase 1', address: 'Block 2, Main Ave, Northridge Grove, CSJDM', iconEmoji: '🏛', notes: 'HOA Office & Indoor Event Center', googleSearchQuery: 'Northridge Grove Brgy Tungkong Mangga San Jose del Monte' },
  { id: '3', name: 'Community Swimming Pools & Gazebo', category: 'hoa', lat: 14.7938, lng: 121.0570, distance: 'Inside Phase 1', address: 'Block 3, Poolside Ave, Northridge Grove, CSJDM', iconEmoji: '🏊', notes: '2 Pools (Adult & Kiddie)', googleSearchQuery: 'Northridge Grove Bulacan' },
  { id: '4', name: 'Covered Basketball & Sports Court', category: 'hoa', lat: 14.7918, lng: 121.0550, distance: 'Inside Phase 2', address: 'Block 8, Phase 2 Park, Northridge Grove, CSJDM', iconEmoji: '🏀', notes: 'Nightly sports & Barangay Assemblies', googleSearchQuery: 'Northridge Grove San Jose del Monte' },

  // Groceries & Malls nearby
  { id: '5', name: 'SM City San Jose del Monte', category: 'grocery', lat: 14.7985, lng: 121.0510, distance: '1.2 km (5 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🛒', notes: 'SM Supermarket, Department Store, Cinemas & Shops', googleSearchQuery: 'SM City San Jose del Monte Bulacan' },
  { id: '6', name: 'Savemore Market Tungkong Mangga', category: 'grocery', lat: 14.7950, lng: 121.0525, distance: '850m (3 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🛍', notes: 'Fresh produce & daily grocery essentials', googleSearchQuery: 'Savemore Market Tungkong Mangga San Jose del Monte' },
  { id: '7', name: 'Puregold Extra Tungko', category: 'grocery', lat: 14.7962, lng: 121.0538, distance: '900m (3 mins)', address: 'Tungko Proper, CSJDM, Bulacan', iconEmoji: '🏬', notes: 'Wholesale & retail grocery store', googleSearchQuery: 'Puregold Tungkong Mangga San Jose del Monte' },
  { id: '8', name: 'WalterMart San Jose del Monte', category: 'grocery', lat: 14.8050, lng: 121.0450, distance: '2.4 km (8 mins)', address: 'Quirino Hwy, CSJDM, Bulacan', iconEmoji: '🛒', notes: 'WalterMart Supermarket & Abenson', googleSearchQuery: 'WalterMart San Jose del Monte Bulacan' },

  // Hospitals & Healthcare
  { id: '9', name: 'QualiMed Hospital CSJDM', category: 'hospital', lat: 14.7972, lng: 121.0490, distance: '1.5 km (6 mins)', address: 'Altaraza Town Center, CSJDM, Bulacan', iconEmoji: '🏥', notes: '24/7 Emergency Room & Specialty Hospital', googleSearchQuery: 'QualiMed Hospital San Jose del Monte Bulacan' },
  { id: '10', name: 'Grace General Hospital', category: 'hospital', lat: 14.8100, lng: 121.0600, distance: '2.8 km (9 mins)', address: 'Maharlika Rd, CSJDM, Bulacan', iconEmoji: '🚑', notes: 'Tertiary Care Hospital & ICU', googleSearchQuery: 'Grace General Hospital San Jose del Monte Bulacan' },
  { id: '11', name: 'Barangay Tungkong Mangga Health Center', category: 'hospital', lat: 14.7940, lng: 121.0545, distance: '600m (2 mins)', address: 'Brgy Hall Compound, CSJDM, Bulacan', iconEmoji: '🩺', notes: 'Public Barangay Clinic & Vaccination Facility', googleSearchQuery: 'Barangay Tungkong Mangga Hall San Jose del Monte' },

  // Schools & Education
  { id: '12', name: 'Colegio de San Jose del Monte', category: 'school', lat: 14.7960, lng: 121.0580, distance: '950m (4 mins)', address: 'Tungkong Mangga, CSJDM, Bulacan', iconEmoji: '🏫', notes: 'Private K-12 & College Campus', googleSearchQuery: 'Colegio de San Jose del Monte Tungkong Mangga' },
  { id: '13', name: 'First City Providential College (FCPC)', category: 'school', lat: 14.8020, lng: 121.0480, distance: '1.8 km (6 mins)', address: 'Narra St, CSJDM, Bulacan', iconEmoji: '🎓', notes: 'Higher Education & Senior High School', googleSearchQuery: 'First City Providential College San Jose del Monte' },
  { id: '14', name: 'Tungkong Mangga Elementary School', category: 'school', lat: 14.7930, lng: 121.0535, distance: '500m (2 mins)', address: 'School St, Brgy Tungko, CSJDM', iconEmoji: '📚', notes: 'Public Elementary School', googleSearchQuery: 'Tungkong Mangga Elementary School San Jose del Monte' },

  // Dining & Restaurants
  { id: '15', name: 'Jollibee Tungko Drive-Thru', category: 'dining', lat: 14.7955, lng: 121.0530, distance: '750m (3 mins)', address: 'Quirino Hwy, Tungko, CSJDM', iconEmoji: '🍗', notes: '24 Hours Fast Food & Drive-Thru', googleSearchQuery: 'Jollibee Tungko San Jose del Monte' },
  { id: '16', name: 'McDonald\'s Altaraza Drive-Thru', category: 'dining', lat: 14.7978, lng: 121.0505, distance: '1.3 km (5 mins)', address: 'Altaraza Town Center, CSJDM', iconEmoji: '🍔', notes: '24 Hours Burger & Coffee Drive-Thru', googleSearchQuery: 'McDonalds Altaraza San Jose del Monte' },
  { id: '17', name: 'Starbucks SM San Jose del Monte', category: 'dining', lat: 14.7986, lng: 121.0512, distance: '1.2 km (5 mins)', address: 'Ground Floor, SM City CSJDM', iconEmoji: '☕', notes: 'Coffeehouse & Alfresco Seating', googleSearchQuery: 'Starbucks SM City San Jose del Monte' },

  // Transport & Terminals
  { id: '18', name: 'MRT-7 Tungkong Mangga Station', category: 'transport', lat: 14.7990, lng: 121.0500, distance: '1.4 km (5 mins)', address: 'Quirino Hwy MRT Line 7, CSJDM', iconEmoji: '🚆', notes: 'Future Mass Transit Railway Station connecting to QC', googleSearchQuery: 'MRT 7 Tungkong Mangga Station San Jose del Monte' },
  { id: '19', name: 'Tungko Bus & UV Express Terminal', category: 'transport', lat: 14.7948, lng: 121.0520, distance: '700m (3 mins)', address: 'Quirino Hwy, CSJDM, Bulacan', iconEmoji: '🚌', notes: 'Daily routes to SM Fairview, Cubao, Quezon Ave & PITX', googleSearchQuery: 'Tungkong Mangga Bus Terminal San Jose del Monte' },
];

export default function PublicLandingPage() {
  const [activeSection, setActiveSection] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const targetId = id.toLowerCase().replace(/\s+/g, '-');
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
    setMobileOpen(false);
  };

  const handlePortalClick = () => {
    if (user) {
      navigate('/homeowner-portal');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#FDFBF7', color: '#111827', minHeight: '100vh' }}>

      {/* ── HEADER / NAVIGATION BAR ── */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(15,23,41,0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : 'none',
          borderBottom: scrolled ? '1px solid #E5E7EB' : '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          
          {/* BRIA Brand Logo */}
          <button
            onClick={() => scrollTo('Home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 0 }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.7rem', letterSpacing: '-1px', fontFamily: "'Inter', sans-serif" }}>BRIA</span>
              <span style={{ background: '#166534', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>HOMES</span>
            </div>
            <div style={{ textAlign: 'left', borderLeft: scrolled ? '1px solid #D1D5DB' : '1px solid rgba(255,255,255,0.2)', paddingLeft: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: scrolled ? '#111827' : '#FFFFFF', lineHeight: 1.1 }}>
                Northridge Grove
              </div>
              <div style={{ fontSize: 10, color: scrolled ? '#4B5563' : '#A0B4A5', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                Brgy. Tungkong Mangga, CSJDM
              </div>
            </div>
          </button>

          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', borderRadius: 'var(--radius)',
                  fontSize: 14, fontWeight: activeSection === link ? 700 : 500,
                  color: scrolled
                    ? (activeSection === link ? '#DC2626' : '#1F2937')
                    : (activeSection === link ? '#FFFFFF' : 'rgba(255,255,255,0.9)'),
                  backgroundColor: activeSection === link
                    ? (scrolled ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.15)')
                    : 'transparent',
                  transition: 'all 0.18s',
                }}
              >
                {link}
              </button>
            ))}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
              <button
                onClick={handlePortalClick}
                id="btn-resident-portal-bria"
                style={{
                  padding: '9px 18px', borderRadius: 'var(--radius)',
                  background: '#DC2626', color: '#FFFFFF',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(220,38,38,0.3)',
                  transition: 'all 0.18s',
                }}
              >
                {user ? 'Enter Portal' : 'Log in'}
              </button>

              {!user && (
                <Link
                  to="/register"
                  style={{
                    padding: '9px 16px', borderRadius: 'var(--radius)',
                    background: '#166534', color: '#FFFFFF',
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.18s',
                  }}
                >
                  Register
                </Link>
              )}
            </div>
          </nav>

          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            className="mobile-menu-btn"
          >
            {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: scrolled ? '#111827' : '#fff', marginBottom: i < 2 ? 5 : 0 }} />)}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '12px 24px 20px' }}>
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', fontSize: 15, color: '#111827', borderBottom: '1px solid #F3F4F6' }}>
                {link}
              </button>
            ))}
            <div className="flex gap-2 mt-3">
              <button onClick={handlePortalClick} style={{ flex: 1, padding: '10px 0', background: '#DC2626', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, border: 'none' }}>
                {user ? 'Enter Portal' : 'Resident Login'}
              </button>
              <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#166534', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section id="home" style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1748444146081-d141d1034fcb?w=1600&h=900&fit=crop&auto=format"
          alt="Northridge Grove BRIA Homes entrance sign"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(8,12,20,0.9) 40%, rgba(8,12,20,0.5) 100%)' }} />
        
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '110px 24px 60px', width: '100%' }}>
          <div style={{ maxWidth: 660 }}>
            
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(220,38,38,0.3)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(220,38,38,0.6)', color: '#FECACA', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              📍 BRIA HOMES • NORTHRIDGE GROVE, BULACAN (3023)
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Welcome Home to<br />
              <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#6EE7B7' }}>Bria Northridge Grove</em>
            </h1>
            
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: 36, maxWidth: 560 }}>
              Official Web-Based Information System for the Bria Homes Northridge Grove Home Owners Association in Barangay Tungkong Mangga, San Jose del Monte, Bulacan. Streamlining ledgers, document requests, payments, and real-time announcements.
            </p>

            {user && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={handlePortalClick}
                  style={{ padding: '13px 28px', borderRadius: 'var(--radius)', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 16px rgba(220,38,38,0.4)', transition: 'opacity 0.18s' }}
                >
                  Enter Portal System
                </button>
              </div>
            )}

          </div>
        </div>

        {/* METRICS BAR */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
            {[
              { value: '731+', label: 'HOA Members & Followers' },
              { value: '312', label: 'Registered Housing Units' },
              { value: '100%', label: 'Real-Time Financial Tracking' },
              { value: '3023', label: 'Zip Code (CSJDM Bulacan)' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#6EE7B7', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: '0.04em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" style={{ padding: '80px 24px', background: '#F5F1EB' }}>
        <div className="about-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>About Our Community</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 20 }}>
              Bria Homes Northridge Grove<br />Home Owners Association
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.75, marginBottom: 16, fontSize: 15, fontWeight: 400 }}>
              Located in Northridge Grove, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines (3023), our HOA system provides homeowners with transparent financial ledgers, automated payment history, searchable reports, and real-time community announcements.
            </p>
            <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, fontWeight: 400 }}>
              Replacing manual social media group postings with an integrated web system ensures data protection, verified owner records, and 24/7 security gate integration.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 32 }}>
              {[['CSJDM', 'Bulacan 3023'], ['24/7', 'Gate Guard Security'], ['Real-Time', 'Ledger System']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#DC2626' }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#4B5563', marginTop: 2, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1770938474431-d1192cac9642?w=700&h=520&fit=crop&auto=format"
              alt="Northridge Grove BRIA Homes neighborhood aerial"
              style={{ width: '100%', borderRadius: 12, display: 'block', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: -20, left: -20, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#DC2626' }}>100%</div>
              <div style={{ fontSize: 12, color: '#4B5563', maxWidth: 140, fontWeight: 600 }}>Automated Ledger & Financial Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGH-ACCURACY GOOGLE MAPS SECTION WITH POLYGON BOUNDARY ── */}
      <section id="map-&-amenities" style={{ padding: '80px 24px', background: '#FDFBF7', color: '#111827' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 10 }}>Subdivision Location & Official Boundary</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 12 }}>
              Interactive Google Map & Subdivision Border
            </h2>
            <p style={{ color: '#374151', fontSize: 15, maxWidth: 640, margin: '0 auto', fontWeight: 400 }}>
              Official Google Maps tiles for Bria Northridge Grove with highlighted subdivision boundary outline alongside nearby supermarkets, malls, hospitals, schools, and transport terminals in Barangay Tungkong Mangga, San Jose del Monte, Bulacan 3023.
            </p>
          </div>

          <GoogleSubdivisionMapSection />
        </div>
      </section>

      {/* ── COMMUNITY NEWS ── */}
      <section style={{ padding: '80px 24px', background: '#F3F0E6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 10 }}>Latest Updates</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: '#111827', lineHeight: 1.2, margin: 0 }}>Real-Time Community Announcements</h2>
            </div>
            <button
              onClick={handlePortalClick}
              style={{ background: '#FFFFFF', borderWidth: 1, borderStyle: 'solid', borderColor: '#D1D5DB', borderRadius: 'var(--radius)', padding: '9px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#111827', transition: 'border-color 0.18s' }}
            >
              View All Notices in Portal →
            </button>
          </div>
          <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {NEWS.map(item => <NewsCard key={item.title} {...item} onPortalClick={handlePortalClick} />)}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section id="events" style={{ padding: '80px 24px', background: '#FDFBF7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 64, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>Mark Your Calendar</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 18 }}>Upcoming Events & Agendas</h2>
              <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                From general assemblies in Tungkong Mangga to facility bookings, stay connected with BRIA Northridge Grove events.
              </p>
              <button
                onClick={handlePortalClick}
                style={{ padding: '12px 24px', borderRadius: 'var(--radius)', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >
                Add to Calendar / Reserve Court
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {EVENTS.map(evt => <EventCard key={evt.title} {...evt} onClick={handlePortalClick} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY GUIDELINES ── */}
      <section id="community-guidelines" style={{ padding: '80px 24px', background: '#090E17' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>Rules & Security Standards</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 14 }}>BRIA Northridge Grove Guidelines</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 580, margin: '0 auto' }}>
              Designed to preserve property values, maintain peace, and secure homeowner safety in Brgy. Tungkong Mangga.
            </p>
          </div>
          <div className="guidelines-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {GUIDELINES.map(g => <GuidelineCard key={g.title} {...g} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <button
              onClick={handlePortalClick}
              style={{ padding: '13px 30px', borderRadius: 'var(--radius)', background: 'transparent', color: '#FFFFFF', borderWidth: '1.5px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              📄 Download Full HOA By-Laws & CCRs (PDF) via Portal
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" style={{ padding: '80px 24px', background: '#FDFBF7' }}>
        <div className="contact-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: 14 }}>Get in Touch</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 18 }}>Contact BRIA HOA Administration</h2>
            <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              Have a maintenance request, dues inquiry, or TCT verification question?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '📍', label: 'Official Address', value: 'Northridge Grove, Barangay Tungkong Mangga\nSan Jose del Monte, Bulacan, Philippines, 3023' },
                { icon: '📞', label: 'HOA Office Hotline', value: '(02) 8987-6543 · Mon–Sat 8am–5pm' },
                { icon: '✉️', label: 'Email Support', value: 'admin@bria-northridgegrove-hoa.ph' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 14, color: '#111827', whiteSpace: 'pre-line', fontWeight: 600 }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 24 }}>Send Message to HOA Board</h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#090E17', color: 'rgba(255,255,255,0.7)', padding: '44px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 44, paddingBottom: 44, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.4rem' }}>BRIA</span>
                <span style={{ background: '#166534', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>HOMES</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>Bria Northridge Grove HOA</div>
              <p style={{ fontSize: 12, lineHeight: 1.7, maxWidth: 280 }}>
                Northridge Grove, Barangay Tungkong Mangga, San Jose del Monte, Bulacan, Philippines, 3023.
              </p>
            </div>
            {[
              { heading: 'Quick Navigation', links: ['Home', 'About', 'Map & Amenities', 'Events', 'Contact'] },
              { heading: 'Homeowner Portal', links: ['Resident Login', 'Register Account', 'Forgot Password', 'My Dues'] },
              { heading: 'Governance', links: ['Board Officers', 'Meeting Minutes', 'Financial Reports', 'Bylaws'] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: 16 }}>{col.heading}</div>
                {col.links.map(l => (
                  <div
                    key={l}
                    onClick={() => {
                      if (l === 'Resident Login') navigate('/login');
                      else if (l === 'Register Account') navigate('/register');
                      else if (l === 'Forgot Password') navigate('/forgot-password');
                      else handlePortalClick();
                    }}
                    style={{ fontSize: 13, marginBottom: 9, cursor: 'pointer', transition: 'color 0.15s' }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12 }}>
            <div>© 2026 BRIA Homes Northridge Grove Home Owners Association. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Forgot Password</Link>
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Register Account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

{/* ── GOOGLE MAPS ENGINE WITH ACCURATE SUBDIVISION BORDER POLYGON ── */}
function GoogleSubdivisionMapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoi, setActivePoi] = useState<POI | null>(null);
  const [mapType, setMapType] = useState<'m' | 'y'>('m'); // 'm' = Google Roadmap, 'y' = Google Satellite Hybrid
  const [showBorder, setShowBorder] = useState<boolean>(true);

  const handleSelectPoi = (poi: POI) => {
    if (activePoi?.id === poi.id) {
      // Toggle unselect / deselect card!
      setActivePoi(null);
      if (leafletInstance.current) {
        leafletInstance.current.setView([14.7925, 121.0558], 15, { animate: true });
        leafletInstance.current.closePopup();
      }
    } else {
      setActivePoi(poi);
      if (leafletInstance.current) {
        leafletInstance.current.setView([poi.lat, poi.lng], 16, { animate: true });
      }
    }
  };

  // Filtered POIs
  const filteredPois = POI_DATA.filter(poi => {
    const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Initialize Google Maps Engine in Leaflet
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!leafletInstance.current) {
      // Center at Northridge Grove, CSJDM
      const map = window.L.map(mapRef.current).setView([14.7925, 121.0558], 16);

      // Google Maps Roadmap Tile Layer
      const googleRoadmap = window.L.tileLayer('http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps | BRIA Northridge Grove Boundary',
      });

      googleRoadmap.addTo(map);
      leafletInstance.current = map;

      // Accurate Subdivision Border Polygon (Phase 1 & Phase 2)
      const borderPolygonCoords = [
        [14.7942, 121.0545], // Main Entrance Gate (Quirino Hwy Access)
        [14.7952, 121.0565], // North Boundary (Phase 1 Perimeter)
        [14.7943, 121.0585], // North-East Corner
        [14.7924, 121.0590], // East Perimeter
        [14.7905, 121.0572], // South-East Corner (Phase 2 Perimeter)
        [14.7900, 121.0552], // South Boundary
        [14.7912, 121.0538], // South-West Boundary
        [14.7930, 121.0540], // West Gate Boundary
      ];

      const polygonLayer = window.L.polygon(borderPolygonCoords, {
        color: '#DC2626',
        fillColor: '#DC2626',
        fillOpacity: 0.22,
        weight: 3,
        dashArray: '6, 6',
      }).addTo(map);

      polygonLayer.bindTooltip('🏠 BRIA Northridge Grove Subdivision Border (Phase 1 & Phase 2)', {
        permanent: true,
        direction: 'center',
        className: 'subdivision-border-tooltip',
      });
    }
  }, []);

  // Update Google Maps Tile Provider (Roadmap vs Satellite Hybrid)
  useEffect(() => {
    if (!leafletInstance.current || !window.L) return;
    const map = leafletInstance.current;

    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Google Maps Tile URLs: 'm' = Roadmap, 'y' = Hybrid Satellite
    const googleTileUrl = `http://mt0.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`;
    window.L.tileLayer(googleTileUrl, {
      maxZoom: 20,
      attribution: '© Google Maps',
    }).addTo(map);
  }, [mapType]);

  // Update Markers
  useEffect(() => {
    if (!leafletInstance.current || !window.L) return;
    const map = leafletInstance.current;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    filteredPois.forEach(poi => {
      const customIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background: ${poi.category === 'hoa' ? '#DC2626' : poi.category === 'grocery' ? '#2563EB' : poi.category === 'hospital' ? '#EF4444' : poi.category === 'school' ? '#D97706' : '#166534'};
          color: #FFF;
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 2px solid #FFF;
        ">${poi.iconEmoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = window.L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 15px; color: #111827;">${poi.iconEmoji} ${poi.name}</div>
          <div style="font-size: 12px; color: #DC2626; font-weight: 700; margin-top: 2px;">📍 ${poi.distance}</div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 4px;">${poi.address}</div>
          <div style="font-size: 11px; color: #6B7280; margin-top: 4px; font-style: italic;">${poi.notes}</div>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.googleSearchQuery)}" target="_blank" rel="noreferrer" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #2563EB; font-weight: 700; text-decoration: underline;">
            🗺 Open Directions in Google Maps →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => setActivePoi(poi));
      markersRef.current.push(marker);
    });
  }, [filteredPois]);

  // handleSelectPoi is defined above with toggle support


  return (
    <div>
      {/* MAP CONTROLS HEADER */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{ background: '#DC2626', color: '#FFF', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
              🗺
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>FIND US HERE — BRIA NORTHRIDGE GROVE</div>
              <div style={{ fontSize: 12, color: '#4B5563', marginTop: 1 }}>Brgy. Tungkong Mangga, San Jose del Monte, Bulacan 3023</div>
            </div>
          </div>

          {/* Action Buttons: Google Maps Mode Switcher & Direct Directions Button */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-1" style={{ background: '#F3F4F6', padding: 3, borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setMapType('m')}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                  background: mapType === 'm' ? '#DC2626' : 'transparent',
                  color: mapType === 'm' ? '#FFFFFF' : '#374151',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                🗺 Google Roadmap
              </button>
              <button
                onClick={() => setMapType('y')}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                  background: mapType === 'y' ? '#166534' : 'transparent',
                  color: mapType === 'y' ? '#FFFFFF' : '#374151',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                🛰 Google Satellite View
              </button>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Bria+Homes+Northridge+Grove+San+Jose+del+Monte+Bulacan"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '9px 18px', borderRadius: '8px', background: '#DC2626', color: '#FFFFFF',
                fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(220,38,38,0.3)', transition: 'opacity 0.15s',
              }}
            >
              🚗 GET DIRECTIONS
            </a>
          </div>
        </div>

        {/* Search Bar & Category Filter Buttons */}
        <div className="grid grid-2 gap-4">
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Search Nearby Supermarkets & Places</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#F9FAFB', color: '#111827', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }}
              placeholder="Search SM City, Puregold, Hospital, Gate, School..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Places by Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 220,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <option value="all">🌐 All Places & Categories</option>
              <option value="hoa">🏠 HOA Gate & Facilities</option>
              <option value="grocery">🛒 Malls & Groceries</option>
              <option value="hospital">🏥 Medical & ER</option>
              <option value="school">🏫 Schools</option>
              <option value="dining">☕ Dining</option>
              <option value="transport">🚍 Transport</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAP CANVAS & SIDEBAR LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        
        {/* GOOGLE MAPS TILE ENGINE CANVAS WITH BOUNDARY OVERLAY */}
        <div style={{ padding: 0, overflow: 'hidden', border: '1px solid #E5E7EB', borderRadius: 16, height: 560, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Border Overlay Badge */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 700, color: '#111827', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            🔴 Red Dashed Boundary: <span style={{ color: '#DC2626' }}>BRIA Northridge Grove Subdivision Border</span>
          </div>
        </div>

        {/* SIDEBAR NEARBY PLACES LIST */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, overflowY: 'auto', maxHeight: 560, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="font-bold text-sm mb-3" style={{ color: '#111827' }}>
            Found {filteredPois.length} Nearby Places
          </div>

          <div className="flex flex-col gap-2">
            {filteredPois.map(poi => (
              <div
                key={poi.id}
                onClick={() => handleSelectPoi(poi)}
                style={{
                  padding: 12, borderRadius: 8,
                  background: activePoi?.id === poi.id ? 'rgba(220,38,38,0.08)' : '#F9FAFB',
                  border: activePoi?.id === poi.id ? '1px solid #DC2626' : '1px solid #F3F4F6',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{poi.iconEmoji}</span>
                  <div style={{ flex: 1 }}>
                    <div className="font-bold text-xs" style={{ color: '#111827' }}>{poi.name}</div>
                    <div className="text-xs" style={{ color: '#DC2626', fontWeight: 700, marginTop: 2 }}>📍 {poi.distance}</div>
                  </div>
                </div>
                <div className="text-xs mt-2" style={{ color: '#4B5563', fontSize: 11 }}>{poi.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ tag, date, title, excerpt, img, onPortalClick }: typeof NEWS[0] & { onPortalClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onPortalClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#FFFFFF', borderWidth: 1, borderStyle: 'solid', borderColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)', transform: hovered ? 'translateY(-3px)' : 'none' }}
    >
      <div style={{ height: 200, overflow: 'hidden', background: '#E5E7EB' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
      </div>
      <div style={{ padding: '20px 22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#DC2626', background: 'rgba(220,38,38,0.1)', padding: '3px 10px', borderRadius: 20 }}>{tag}</span>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{date}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, lineHeight: 1.3, marginBottom: 10, color: '#111827' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{excerpt}</p>
        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
          Read Details in Portal <span style={{ transition: 'transform 0.15s', transform: hovered ? 'translateX(3px)' : 'none', display: 'inline-block' }}>→</span>
        </div>
      </div>
    </div>
  );
}

function EventCard({ month, day, title, time, location, color, onClick }: typeof EVENTS[0] & { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', gap: 18, padding: '18px 22px', background: '#FFFFFF', borderWidth: 1, borderStyle: 'solid', borderColor: hovered ? color : '#E5E7EB', borderRadius: 10, cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s', boxShadow: hovered ? '0 4px 18px rgba(0,0,0,0.08)' : 'none', alignItems: 'center' }}
    >
      <div style={{ flexShrink: 0, width: 54, height: 60, borderRadius: 8, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', lineHeight: 1 }}>{month}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{day}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{time} · {location}</div>
      </div>
      <div style={{ color: hovered ? color : '#9CA3AF', transition: 'transform 0.15s, color 0.15s', transform: hovered ? 'translateX(4px)' : 'none' }}>→</div>
    </div>
  );
}

function GuidelineCard({ icon, title, body }: typeof GUIDELINES[0]) {
  return (
    <div
      style={{ padding: '28px 30px', borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', cursor: 'default' }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>{body}</p>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Message Sent to HOA Board!</div>
        <p style={{ color: '#4B5563', fontSize: 14 }}>We will follow up at {form.email} within 2 business days.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} style={{ marginTop: 20, fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>Send another message</button>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', borderWidth: '1.5px' as const, borderStyle: 'solid' as const, borderColor: '#D1D5DB', background: '#FFFFFF', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' as const, transition: 'border-color 0.18s' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Full Name</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan Dela Cruz"
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Email Address</label>
          <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="juan@email.com"
            onFocus={e => (e.target.style.borderColor = '#DC2626')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Subject</label>
        <select required style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = '#DC2626')}
          onBlur={e => (e.target.style.borderColor = '#D1D5DB')}>
          <option value="">Select a topic…</option>
          <option>TCT & Owner Verification Inquiry</option>
          <option>HOA Monthly Dues Inquiry</option>
          <option>Facility Reservation Question</option>
          <option>Gate Pass & Security Notice</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Message</label>
        <textarea required rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your question..."
          onFocus={e => (e.target.style.borderColor = '#DC2626')}
          onBlur={e => (e.target.style.borderColor = '#D1D5DB')} />
      </div>
      <button type="submit" style={{ padding: '13px', borderRadius: 'var(--radius)', background: '#DC2626', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'opacity 0.18s' }}
      >
        Send Message to HOA Board
      </button>
    </form>
  );
}
