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
  category: 'hoa' | 'bakery' | 'cafe' | 'dining' | 'shop';
  lat: number;
  lng: number;
  distance: string;
  address: string;
  iconEmoji: string;
  notes: string;
}

const POI_DATA: POI[] = [
  // ── 1. PRIMARY SUBDIVISION PIN ──────────────────────────────
  {
    id: '1',
    name: 'North Ridge Grove Pin Location (NRG PH2 HOA INC)',
    category: 'hoa',
    lat: 14.793768,
    lng: 121.082387,
    distance: 'Official Pin (14.793768, 121.082387)',
    address: 'Northridge Grove Phase 2, Tungkong Mangga, San Jose del Monte, 3023 Bulacan',
    iconEmoji: '📍',
    notes: 'Official North Ridge Grove Pin Location • Jurisdiction: Blocks 1–9, 312 Housing Units, HOA Office & Facilities',
  },

  // ── 2. LOCAL BAKERIES & BREAD SHOPS ─────────────────────────
  {
    id: '2',
    name: 'JCS PANDESAL (Bakeshop & Merienda)',
    category: 'bakery',
    lat: 14.793750,
    lng: 121.082200,
    distance: '20m (Beside NRG Pin · 1 min walk)',
    address: 'Near Block 8 / Maagap St, Northridge Grove, SJDM',
    iconEmoji: '🥐',
    notes: 'Hot freshly baked pugon pandesal, Spanish bread, pan de coco, ensaymada & morning coffee',
  },
  {
    id: '3',
    name: 'Bekiry (Artisan Bakeshop & Pastries)',
    category: 'bakery',
    lat: 14.797800,
    lng: 121.082600,
    distance: '250m (Parang Rd · 2 mins walk)',
    address: 'Parang Rd, Tungkong Mangga, CSJDM, Bulacan',
    iconEmoji: '🥖',
    notes: 'Artisan sourdough, croissants, cheese rolls, baguettes, freshly baked bread & breakfast items',
  },

  // ── 3. LOCAL COFFEE SHOPS & CAFES ───────────────────────────
  {
    id: '4',
    name: 'TeaAlley Milktea Station',
    category: 'cafe',
    lat: 14.793800,
    lng: 121.081600,
    distance: '80m (Corner Road · 1 min walk)',
    address: 'Corner Spine Road, Northridge Grove, SJDM',
    iconEmoji: '🧋',
    notes: 'Signature brown sugar boba milk tea, fruit teas, smoothies, frappes, waffle bites & snacks',
  },
  {
    id: '5',
    name: 'Kofe Cafe Sjdm',
    category: 'cafe',
    lat: 14.792900,
    lng: 121.079200,
    distance: '150m (Lower Main Road · 2 mins walk)',
    address: 'Lower Main Road, Northridge Grove Area, SJDM',
    iconEmoji: '☕',
    notes: 'Cozy neighborhood cafe serving handcrafted espresso, iced Spanish latte, cold brew & pastries',
  },
  {
    id: '6',
    name: 'MARCOFFEE IN-HOUSE CAFE',
    category: 'cafe',
    lat: 14.795800,
    lng: 121.077200,
    distance: '220m (Northridge Spine · 3 mins walk)',
    address: 'Mabuti St / Northridge Spine, SJDM, 3023 Bulacan',
    iconEmoji: '☕',
    notes: 'In-house specialty coffee bar, artisan drip blends, iced drinks & light merienda meals',
  },

  // ── 4. LOCAL FOOD & DINING ──────────────────────────────────
  {
    id: '7',
    name: "Susana's Kitchen Filipino",
    category: 'dining',
    lat: 14.797700,
    lng: 121.083700,
    distance: '260m (Parang Rd · 3 mins walk)',
    address: 'Parang Rd, Tungkong Mangga, CSJDM, Bulacan',
    iconEmoji: '🍛',
    notes: 'Authentic Filipino lutong bahay, all-day silog meals, bulalo, caldereta, sizzling sisig & catering',
  },
  {
    id: '8',
    name: 'Gourmet Food & Dining Hub',
    category: 'dining',
    lat: 14.796800,
    lng: 121.084500,
    distance: '200m (East Lane · 2 mins walk)',
    address: 'Parang Rd / East Lane, Tungkong Mangga, CSJDM',
    iconEmoji: '🍽️',
    notes: 'Specialty sizzling plates, chicken inasal, grilled meats, rice bowls & family dishes',
  },
  {
    id: '9',
    name: 'Casa Estrella Private Resort and Events Place',
    category: 'dining',
    lat: 14.796200,
    lng: 121.086000,
    distance: '280m (East Perimeter · 3 mins walk)',
    address: 'East Boundary Road, Northridge Grove Area, CSJDM',
    iconEmoji: '🌴',
    notes: 'Private swimming resort, outdoor grill pavilion, event venue & weekend gatherings',
  },

  // ── 5. LOCAL SHOPS, RETAIL & SERVICES ───────────────────────
  {
    id: '10',
    name: "Pik-A-Book Children's Book Store",
    category: 'shop',
    lat: 14.795800,
    lng: 121.083200,
    distance: '180m (Central Walkway · 2 mins walk)',
    address: 'Northridge Grove Central Sector, SJDM, 3023 Bulacan',
    iconEmoji: '📚',
    notes: "Children's books, educational toys, learning materials & storybooks for young readers",
  },
  {
    id: '11',
    name: "Triple Zxai's Trendyshop Ph",
    category: 'shop',
    lat: 14.796900,
    lng: 121.078800,
    distance: '240m (Upper Block · 3 mins walk)',
    address: 'Upper Sector Road, Northridge Grove, SJDM',
    iconEmoji: '🛍️',
    notes: 'Trendy fashion accessories, apparel, online orders pickup & local retail shopping',
  },
  {
    id: '12',
    name: 'J&A Laundry Home',
    category: 'shop',
    lat: 14.798300,
    lng: 121.080000,
    distance: '280m (Parang Access · 3 mins walk)',
    address: 'Parang Access Road, Tungkong Mangga, CSJDM',
    iconEmoji: '🧺',
    notes: 'Wash, dry & fold laundry service, fabric care & pickup convenience',
  },
  {
    id: '13',
    name: 'nathan sari-sari store',
    category: 'shop',
    lat: 14.798700,
    lng: 121.079200,
    distance: '300m (North Edge · 4 mins walk)',
    address: 'North Edge Lane, Tungkong Mangga, CSJDM',
    iconEmoji: '🛒',
    notes: 'Daily cooking essentials, cold beverages, load, snacks, eggs & neighborhood grocery',
  },
  {
    id: '14',
    name: 'Mm1 farm',
    category: 'shop',
    lat: 14.799200,
    lng: 121.080800,
    distance: '350m (North Hillside · 4 mins walk)',
    address: 'North Hillside, Tungkong Mangga, CSJDM',
    iconEmoji: '🌾',
    notes: 'Local agricultural greens, plant nursery & fresh produce supplies',
  },
  {
    id: '15',
    name: 'La Bonita Cosmetics Supply by Tinta...',
    category: 'shop',
    lat: 14.792500,
    lng: 121.076000,
    distance: '320m (Southwest Entrance Curve)',
    address: 'Near Entrance Gate, Northridge Grove, SJDM',
    iconEmoji: '💄',
    notes: 'Cosmetics, skincare supplies, personal grooming products & beauty essentials',
  },
  {
    id: '16',
    name: "Sonia's Haven",
    category: 'shop',
    lat: 14.793800,
    lng: 121.075400,
    distance: '310m (Mabuti St West · 4 mins walk)',
    address: 'Mabuti Street, Northridge Grove Area, SJDM',
    iconEmoji: '🌸',
    notes: 'Personal care gifts, home wellness items & local artisanal goods',
  },
  {
    id: '17',
    name: 'NatMed Co Medical Supply Store',
    category: 'shop',
    lat: 14.794800,
    lng: 121.074600,
    distance: '350m (West Gate Road · 4 mins walk)',
    address: 'West Gate Approach, Tungkong Mangga, CSJDM',
    iconEmoji: '💊',
    notes: 'First aid, medical supply essentials, health devices & healthcare equipment',
  },
  {
    id: '18',
    name: 'Chanceux',
    category: 'shop',
    lat: 14.795600,
    lng: 121.074400,
    distance: '380m (Northwest Flank · 4 mins walk)',
    address: 'Northwest Flank, Tungkong Mangga, CSJDM',
    iconEmoji: '🏢',
    notes: 'Local business studio & merchandise boutique',
  },
  {
    id: '19',
    name: 'BCCCP (Community Church)',
    category: 'hoa',
    lat: 14.796300,
    lng: 121.077600,
    distance: '200m (Central Community Road · 2 mins walk)',
    address: 'Central Community Road, Northridge Grove, SJDM',
    iconEmoji: '⛪',
    notes: 'Community fellowship, Sunday worship services & family spiritual activities',
  },
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
        // Center directly at North Ridge Grove Pin Location
        const map = window.L.map(mapRef.current).setView([14.793768, 121.082387], 17);

        // Tile Layer Providers
        const streetLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors | NRG PH2 HOA INC (B7 Maagap St)',
        });

        streetLayer.addTo(map);
        leafletInstance.current = map;
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
        const bg =
          poi.category === 'hoa' ? '#DC2626' :
          poi.category === 'bakery' ? '#D97706' :
          poi.category === 'cafe' ? '#0D9488' :
          poi.category === 'dining' ? '#EA580C' : '#2563EB';
        const customIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="
            background: ${bg};
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
                🗺️ Official Subdivision Map Layout & Pins
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
              <label className="form-label" style={{ color: '#E5E7EB' }}>Search Places, Bakeries, Cafes & Restos</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search Bakery, Coffee, Milk Tea, Cafe, Resto, Grocery..."
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
                <option value="all">🌐 All Nearby Businesses ({POI_DATA.length})</option>
                <option value="hoa">📍 North Ridge Grove Pin & Church</option>
                <option value="bakery">🥖 Bakeries & Pandesal</option>
                <option value="cafe">☕ Cafes & Coffee Shops</option>
                <option value="dining">🍽️ Food & Restaurants</option>
                <option value="shop">🛒 Local Shops, Retail & Services</option>
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
                  <span>NRG PH2 HOA INC — Phase 2 Official Community</span>
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
              <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, color: '#FFF' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 Map Pin Legend</div>
                <div className="flex gap-3 flex-wrap">
                  <span style={{ color: '#F87171' }}>📍 NRG Location</span>
                  <span style={{ color: '#FBBF24' }}>🥖 Bakery</span>
                  <span style={{ color: '#2DD4BF' }}>☕ Cafe / Coffee</span>
                  <span style={{ color: '#FB923C' }}>🍽️ Dining / Resto</span>
                  <span style={{ color: '#60A5FA' }}>🛒 Grocery / Mart</span>
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
