import React, { useEffect, useRef, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';

declare global {
  interface Window {
    L: any;
  }
}

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
}

const POI_DATA: POI[] = [
  // HOA Facilities inside Northridge Grove Phase 2 (B7 Maagap St)
  { id: '1', name: 'NRG PH2 Main Entrance & Guardhouse', category: 'hoa', lat: 14.7939, lng: 121.0832, distance: 'B7 Maagap St (Main Gate)', address: 'B7 Maagap St, Northridge Grove Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🚪', notes: '24/7 Security Guardhouse & Automated RFID Boom Barrier Gate' },
  { id: '2', name: 'Phase 2 Clubhouse & Function Hall', category: 'hoa', lat: 14.7946, lng: 121.0838, distance: 'Inside Phase 2', address: 'Block 2, Maagap St, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏛', notes: 'NRG PH2 HOA Admin Office & Multipurpose Event Center' },
  { id: '3', name: 'Phase 2 Swimming Pools & Gazebo', category: 'hoa', lat: 14.7952, lng: 121.0844, distance: 'Phase 2 Amenities', address: 'Block 3, Poolside Area, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏊', notes: 'Adult Lap Pool & Kiddie Wading Pool with Gazebo' },
  { id: '4', name: 'Covered Basketball & Sports Court', category: 'hoa', lat: 14.7930, lng: 121.0820, distance: 'Inside Phase 2', address: 'Block 7, Maagap St Park, Phase 2, SJDM, 3023 Bulacan', iconEmoji: '🏀', notes: 'Full-court basketball, nightly sports & General Assemblies' },

  // Commercial & Convenience Landmarks
  { id: '5', name: 'SM City San Jose del Monte', category: 'grocery', lat: 14.7985, lng: 121.0510, distance: '3.2 km (8 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM', iconEmoji: '🛒', notes: 'SM Supermarket, Department Store, Cinemas & Shops' },
  { id: '6', name: 'Savemore Market Tungkong Mangga', category: 'grocery', lat: 14.7950, lng: 121.0525, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🛍', notes: 'Fresh produce & daily grocery essentials' },
  { id: '7', name: 'Puregold Extra Tungko', category: 'grocery', lat: 14.7962, lng: 121.0538, distance: '3.0 km (7 mins)', address: 'Tungko Proper, CSJDM', iconEmoji: '🏬', notes: 'Wholesale & retail grocery store' },
  { id: '8', name: 'WalterMart San Jose del Monte', category: 'grocery', lat: 14.8050, lng: 121.0450, distance: '4.5 km (11 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🛒', notes: 'WalterMart Supermarket & Abenson' },

  // Hospitals & Healthcare
  { id: '9', name: 'QualiMed Hospital CSJDM', category: 'hospital', lat: 14.7972, lng: 121.0490, distance: '3.4 km (9 mins)', address: 'Altaraza Town Center, CSJDM', iconEmoji: '🏥', notes: '24/7 Emergency Room & Specialty Hospital' },
  { id: '10', name: 'Grace General Hospital', category: 'hospital', lat: 14.8100, lng: 121.0600, distance: '3.8 km (10 mins)', address: 'Maharlika Rd, CSJDM', iconEmoji: '🚑', notes: 'Tertiary Care Hospital & ICU' },
  { id: '11', name: 'Barangay Tungkong Mangga Health Center', category: 'hospital', lat: 14.7940, lng: 121.0545, distance: '2.8 km (6 mins)', address: 'Brgy Hall Compound, CSJDM', iconEmoji: '🩺', notes: 'Public Barangay Clinic & Vaccination Facility' },

  // Schools & Education
  { id: '12', name: 'Colegio de San Jose del Monte', category: 'school', lat: 14.7960, lng: 121.0580, distance: '2.6 km (6 mins)', address: 'Tungkong Mangga, CSJDM', iconEmoji: '🏫', notes: 'Private K-12 & College Campus' },
  { id: '13', name: 'First City Providential College (FCPC)', category: 'school', lat: 14.8020, lng: 121.0480, distance: '3.9 km (9 mins)', address: 'Narra St, CSJDM', iconEmoji: '🎓', notes: 'Higher Education & Senior High School' },
  { id: '14', name: 'Paradise Farms National High School', category: 'school', lat: 14.7945, lng: 121.0790, distance: '600m (2 mins)', address: 'Paradise Farms, Tungkong Mangga, CSJDM', iconEmoji: '📚', notes: 'Public High School nearest to Phase 2' },

  // Dining & Restaurants
  { id: '15', name: 'Jollibee Tungko Drive-Thru', category: 'dining', lat: 14.7955, lng: 121.0530, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, Tungko', iconEmoji: '🍗', notes: '24 Hours Fast Food & Drive-Thru' },
  { id: '16', name: "McDonald's Altaraza Drive-Thru", category: 'dining', lat: 14.7978, lng: 121.0505, distance: '3.3 km (8 mins)', address: 'Altaraza Town Center', iconEmoji: '🍔', notes: '24 Hours Burger & Coffee Drive-Thru' },
  { id: '17', name: 'Starbucks SM San Jose del Monte', category: 'dining', lat: 14.7986, lng: 121.0512, distance: '3.2 km (8 mins)', address: 'Ground Floor, SM City CSJDM', iconEmoji: '☕', notes: 'Coffeehouse & Alfresco Seating' },

  // Transport & Terminals
  { id: '18', name: 'MRT-7 Tungkong Mangga Station (Under Construction)', category: 'transport', lat: 14.7990, lng: 121.0500, distance: '3.5 km (9 mins)', address: 'Quirino Hwy MRT Line 7', iconEmoji: '🚆', notes: 'Future Mass Transit Railway Station connecting to North Ave Quezon City' },
  { id: '19', name: 'Tungko Bus & UV Express Terminal', category: 'transport', lat: 14.7948, lng: 121.0520, distance: '2.9 km (7 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🚌', notes: 'Daily routes to SM Fairview, Cubao, Quezon Ave & PITX' },
];

export default function SubdivisionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoi, setActivePoi] = useState<POI | null>(null);
  const [mapTileStyle, setMapTileStyle] = useState<'street' | 'satellite' | 'topo'>('street');

  // Filtered POIs
  const filteredPois = POI_DATA.filter(poi => {
    const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !window.L) return;

    try {
      if (!leafletInstance.current) {
        // Center directly at Northridge Grove Phase 2 (Right sector)
        const map = window.L.map(mapRef.current).setView([14.7956, 121.0824], 17);

        // Tile Layer Providers
        const streetLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors | NRG PH2 HOA INC (B7 Maagap St)',
        });

        streetLayer.addTo(map);
        leafletInstance.current = map;

        // Draw Accurate Phase 2 Boundary Polygon (Right Side / Phase 2 Sector)
        const polygonCoords = [
          // ── 1. Western dividing boundary (along the dividing spine/road) ──
          [14.79300, 121.08050], // Bottom-left corner (near dividing spine)
          [14.79420, 121.08020], // Mid dividing boundary
          [14.79540, 121.08010], // Upper dividing boundary (past BCCCP)
          [14.79630, 121.08040], // Top-left junction

          // ── 2. Northern Arc & Parang Rd Frontage (near Bekiry & Gourmet) ──
          [14.79700, 121.08050], // North flank
          [14.79770, 121.08080], // Upper apex curve
          [14.79810, 121.08160], // Parang Rd entrance / upper bend
          [14.79780, 121.08260], // Parang Rd frontage near Bekiry
          [14.79730, 121.08370], // Near Gourmet & Susana's Kitchen

          // ── 3. Eastern Perimeter (Casa Estrella Private Resort area) ──
          [14.79660, 121.08440], // Casa Estrella Private Resort corner
          [14.79580, 121.08460], // Far East boundary
          [14.79500, 121.08380], // Southeast lot lines

          // ── 4. Southern Flank (TeaAlley Milktea Station area) ──
          [14.79410, 121.08270], // South approach
          [14.79350, 121.08160], // Southern road near TeaAlley Milktea Station
          [14.79300, 121.08050], // Closes back to Southwest base
        ];

        // Golden outer glow
        window.L.polygon(polygonCoords, {
          color: '#16A34A',
          weight: 6,
          opacity: 0.5,
          fillOpacity: 0,
        }).addTo(map);

        // Main crisp boundary polygon
        const polygonLayer = window.L.polygon(polygonCoords, {
          color: '#15803D',
          fillColor: '#16A34A',
          fillOpacity: 0.22,
          weight: 3.5,
          dashArray: '6, 4',
        }).addTo(map);

        polygonLayer.bindPopup(`
          <div style="font-family:sans-serif;padding:6px;min-width:240px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="background:#16A34A;color:#FFF;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:900;">PHASE 2 OFFICIAL BOUNDARY</div>
              <div style="font-size:11px;color:#D97706;font-weight:800;">312 HOUSING UNITS</div>
            </div>
            <div style="font-weight:900;font-size:15px;color:#111827;">Northridge Grove Phase 2</div>
            <div style="font-size:12px;color:#166534;font-weight:700;margin-top:2px;">NRG PH2 HOA INC Jurisdiction</div>
            <div style="font-size:12px;color:#4B5563;margin-top:6px;line-height:1.4;">
              📍 B7 Maagap St, Barangay Tungkong Mangga, San Jose del Monte, Bulacan 3023
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #E5E7EB;font-size:11.5px;color:#374151;">
              • <strong>Coverage:</strong> Blocks 1, 2, 3, 4, 5, 6, 7, 8, and 9<br/>
              • <strong>Landmarks:</strong> Bekiry, Gourmet, Casa Estrella, TeaAlley Milktea<br/>
              • <strong>Streets:</strong> Maagap St, Mabuti St, Mapayapa St, Magiting St<br/>
              • <strong>Key Amenities:</strong> Clubhouse, Covered Basketball Court, Swimming Pools, 24/7 RFID Gate
            </div>
          </div>
        `);
      }
    } catch {
      // Map error fallback
    }

    return () => {
      // Cleanup map on unmount if needed
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!leafletInstance.current || typeof window === 'undefined' || !window.L) return;
    try {
      const map = leafletInstance.current;

      // Remove existing tile layers
      if (window.L.TileLayer) {
        map.eachLayer((layer: any) => {
          if (layer instanceof window.L.TileLayer) {
            map.removeLayer(layer);
          }
        });
      }

      let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      let attr = '© OpenStreetMap';

      if (mapTileStyle === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attr = '© Esri World Imagery';
      } else if (mapTileStyle === 'topo') {
        url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attr = '© OpenTopoMap';
      }

      window.L.tileLayer(url, { maxZoom: 18, attribution: attr }).addTo(map);
    } catch {
      // Ignore tile switch error
    }
  }, [mapTileStyle]);

  // Update Markers
  useEffect(() => {
    if (!leafletInstance.current || typeof window === 'undefined' || !window.L) return;
    try {
      const map = leafletInstance.current;

      // Clear existing markers
      markersRef.current.forEach(m => {
        try { map.removeLayer(m); } catch { /* ignore */ }
      });
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
            <a href="https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lng}" target="_blank" rel="noreferrer" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #2563EB; font-weight: 700; text-decoration: underline;">
              🗺 Open Directions in Google Maps →
            </a>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => setActivePoi(poi));
        markersRef.current.push(marker);
      });
    } catch {
      // Marker safety
    }
  }, [filteredPois]);


  const handleSelectPoi = (poi: POI) => {
    setActivePoi(poi);
    if (leafletInstance.current) {
      leafletInstance.current.setView([poi.lat, poi.lng], 16, { animate: true });
    }
  };

  const [viewMode, setViewMode] = useState<'leaflet' | 'image_layout'>('image_layout');

  return (
    <PageContainer title="Phase 2 Subdivision Map" subtitle="NRG PH2 HOA INC — Phase 2 Boundaries, Facilities & Vicinity Coordinates">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* VIEW MODE TOGGLE & MAP CONTROLS */}
        <div className="card mb-6" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary" style={{ color: '#FFF', margin: 0 }}>
                📍 NRG PH2 HOA INC — Phase 2 Official Map & Boundaries
              </h2>
              <p className="text-xs text-muted" style={{ color: '#9CA3AF', margin: '2px 0 0 0' }}>
                Brgy. Tungkong Mangga, San Jose del Monte, Bulacan 3023
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${viewMode === 'image_layout' ? 'btn-success' : 'btn-secondary'}`}
                style={viewMode === 'image_layout' ? { background: '#166534', borderColor: '#166534', fontWeight: 800 } : {}}
                onClick={() => setViewMode('image_layout')}
              >
                🗺️ Official Layout & Phase 2 Border
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'leaflet' ? 'btn-primary' : 'btn-secondary'}`}
                style={viewMode === 'leaflet' ? { background: '#2563EB', borderColor: '#2563EB', fontWeight: 800 } : {}}
                onClick={() => setViewMode('leaflet')}
              >
                📍 GPS Pin Coordinates
              </button>

              {viewMode === 'leaflet' && [
                { id: 'street', label: 'OpenStreet' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'topo', label: 'Topo' },
              ].map(tile => (
                <button
                  key={tile.id}
                  onClick={() => setMapTileStyle(tile.id as any)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                    background: mapTileStyle === tile.id ? '#DC2626' : 'rgba(255,255,255,0.1)',
                    color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                  }}
                >
                  {tile.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Category Filter Toggles */}
          <div className="grid grid-2 gap-4">
            <div>
              <label className="form-label" style={{ color: '#E5E7EB' }}>Search Places, Groceries & Amenities</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search SM City, Puregold, Hospital, Gate, School..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Filter Places by Category</label>
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
                }}
              >
                <option value="all">🌐 All Places & Categories</option>
                <option value="hoa">🏠 HOA Amenities</option>
                <option value="grocery">🛒 Groceries & Malls</option>
                <option value="hospital">🏥 Medical & ER</option>
                <option value="school">🏫 Schools</option>
                <option value="dining">☕ Dining</option>
                <option value="transport">🚍 Transport</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAP CANVAS & SIDE LIST GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)' }}>
          
          {/* MAP CANVAS */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, height: 580, position: 'relative', background: '#0F172A' }}>
            
            {viewMode === 'image_layout' ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                {/* Official Map Image */}
                <img
                  src="/subdivision-map-ph1-ph2.png"
                  alt="Subdivision Layout Phase 1 and Phase 2"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                
                {/* SVG Overlay Drawing Phase 2 Green Border */}
                <svg
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Phase 2 Polygon Border (Bekiry, Gourmet, Casa Estrella, TeaAlley, Parang Rd) */}
                  <polygon
                    points="26,62 38,48 52,32 66,15 78,5 98,24 98,58 78,82 56,88 38,82 26,62"
                    fill="rgba(34, 197, 94, 0.22)"
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeDasharray="3 1.5"
                  />
                  <polygon
                    points="26,62 38,48 52,32 66,15 78,5 98,24 98,58 78,82 56,88 38,82 26,62"
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="0.8"
                    strokeDasharray="1.5 1.5"
                  />
                </svg>

                {/* Interactive Landmark Pins Overlaid on Map Image */}
                {/* 1. TeaAlley Milktea Station Pin */}
                <div
                  style={{
                    position: 'absolute', top: '58%', left: '55%',
                    background: '#EA580C', color: '#FFF',
                    padding: '4px 10px', borderRadius: 16,
                    fontSize: 10.5, fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.5)',
                    display: 'flex', alignItems: 'center', gap: 4,
                    border: '2px solid #FFF', zIndex: 10
                  }}
                  title="TeaAlley Milktea Station"
                >
                  <span>☕</span>
                  <span>TeaAlley Milktea Station</span>
                </div>

                {/* 2. Parang Rd & Bekiry */}
                <div
                  style={{
                    position: 'absolute', top: '16%', left: '66%',
                    background: '#1F2937', color: '#F9FAFB',
                    padding: '3px 8px', borderRadius: 12,
                    fontSize: 10, fontWeight: 700,
                    border: '1px solid #4B5563', zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <span>🥖 Bekiry • Parang Rd</span>
                </div>

                {/* 3. Casa Estrella Private Resort */}
                <div
                  style={{
                    position: 'absolute', top: '44%', left: '76%',
                    background: '#7C3AED', color: '#FFF',
                    padding: '3px 9px', borderRadius: 14,
                    fontSize: 10, fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                    display: 'flex', alignItems: 'center', gap: 4,
                    border: '1.5px solid #FFF', zIndex: 10
                  }}
                >
                  <span>🏊 Casa Estrella Resort</span>
                </div>

                {/* Floating Phase 2 Badge Overlay */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: '#166534', color: '#FFF',
                  padding: '8px 16px', borderRadius: 20,
                  fontSize: 12, fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  zIndex: 10
                }}>
                  <span style={{ fontSize: 14 }}>🟩</span>
                  <span>NRG PH2 HOA INC — Exclusive Phase 2 Territory</span>
                </div>

                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
                  color: '#FFF', padding: '10px 16px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)', fontSize: 11,
                  zIndex: 10
                }}>
                  <div style={{ fontWeight: 800, color: '#22C55E', marginBottom: 2 }}>📍 Phase 2 Map Coordinates & Pins:</div>
                  <div>• ☕ TeaAlley Milktea Station (Phase 2 Corner Entrance)</div>
                  <div>• 🛣️ Parang Rd (North Border) | 🥖 Bekiry | 🛒 Walisons</div>
                  <div style={{ color: '#9CA3AF', marginTop: 2 }}>Paradise Farms HS & Phase 1 (Left Side) excluded from NRG PH2 HOA INC.</div>
                </div>
              </div>
            ) : (
              <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
            )}

            {/* Quick Legend Overlay for Leaflet */}
            {viewMode === 'leaflet' && (
              <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, color: '#FFF' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 Map Legend</div>
                <div className="flex gap-3">
                  <span style={{ color: '#F87171' }}>🔴 HOA Gate/Amenities</span>
                  <span style={{ color: '#60A5FA' }}>🔵 Malls & Supermarkets</span>
                  <span style={{ color: '#FBBF24' }}>🟡 Hospitals & Schools</span>
                </div>
              </div>
            )}
          </div>

          {/* SIDE LIST OF NEARBY PLACES */}
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(255,255,255,0.15)', overflowY: 'auto', maxHeight: 580, padding: 18 }}>
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-sm" style={{ color: '#FFF' }}>
                Found {filteredPois.length} Nearby Places
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {filteredPois.map(poi => (
                <div
                  key={poi.id}
                  onClick={() => handleSelectPoi(poi)}
                  style={{
                    padding: 12, borderRadius: 8,
                    background: activePoi?.id === poi.id ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.04)',
                    border: activePoi?.id === poi.id ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 18 }}>{poi.iconEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-bold text-xs" style={{ color: '#FFF' }}>{poi.name}</div>
                      <div className="text-xs" style={{ color: '#F87171', fontWeight: 700, marginTop: 2 }}>📍 {poi.distance}</div>
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#9CA3AF', fontSize: 11 }}>{poi.notes}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
