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
  // HOA Facilities inside Northridge Grove
  { id: '1', name: 'BRIA Northridge Grove Main Entrance Gate', category: 'hoa', lat: 14.7925, lng: 121.0558, distance: '0 km (Subdivision Gate)', address: 'Northridge Grove Dr, Brgy. Tungkong Mangga', iconEmoji: '🚪', notes: '24/7 Security Guard Guardhouse & RFID Barrier' },
  { id: '2', name: 'Northridge Grove Clubhouse & Function Hall', category: 'hoa', lat: 14.7932, lng: 121.0565, distance: 'Inside Phase 1', address: 'Block 2, Main Ave', iconEmoji: '🏛', notes: 'HOA Office & Indoor Event Center' },
  { id: '3', name: 'Community Swimming Pools & Gazebo', category: 'hoa', lat: 14.7938, lng: 121.0570, distance: 'Inside Phase 1', address: 'Block 3, Poolside Ave', iconEmoji: '🏊', notes: '2 Pools (Adult & Kiddie)' },
  { id: '4', name: 'Covered Basketball & Sports Court', category: 'hoa', lat: 14.7918, lng: 121.0550, distance: 'Inside Phase 2', address: 'Block 8, Phase 2 Park', iconEmoji: '🏀', notes: 'Nightly sports & Barangay Assemblies' },

  // Groceries & Malls nearby
  { id: '5', name: 'SM City San Jose del Monte', category: 'grocery', lat: 14.7985, lng: 121.0510, distance: '1.2 km (5 mins)', address: 'Quirino Hwy, Tungkong Mangga, CSJDM', iconEmoji: '🛒', notes: 'SM Supermarket, Department Store, Cinemas & Shops' },
  { id: '6', name: 'Savemore Market Tungkong Mangga', category: 'grocery', lat: 14.7950, lng: 121.0525, distance: '850m (3 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🛍', notes: 'Fresh produce & daily grocery essentials' },
  { id: '7', name: 'Puregold Extra Tungko', category: 'grocery', lat: 14.7962, lng: 121.0538, distance: '900m (3 mins)', address: 'Tungko Proper, CSJDM', iconEmoji: '🏬', notes: 'Wholesale & retail grocery store' },
  { id: '8', name: 'WalterMart San Jose del Monte', category: 'grocery', lat: 14.8050, lng: 121.0450, distance: '2.4 km (8 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🛒', notes: 'WalterMart Supermarket & Abenson' },

  // Hospitals & Healthcare
  { id: '9', name: 'QualiMed Hospital CSJDM', category: 'hospital', lat: 14.7972, lng: 121.0490, distance: '1.5 km (6 mins)', address: 'Altaraza Town Center, CSJDM', iconEmoji: '🏥', notes: '24/7 Emergency Room & Specialty Hospital' },
  { id: '10', name: 'Grace General Hospital', category: 'hospital', lat: 14.8100, lng: 121.0600, distance: '2.8 km (9 mins)', address: 'Maharlika Rd, CSJDM', iconEmoji: '🚑', notes: 'Tertiary Care Hospital & ICU' },
  { id: '11', name: 'Barangay Tungkong Mangga Health Center', category: 'hospital', lat: 14.7940, lng: 121.0545, distance: '600m (2 mins)', address: 'Brgy Hall Compound, CSJDM', iconEmoji: '🩺', notes: 'Public Barangay Clinic & Vaccination Facility' },

  // Schools & Education
  { id: '12', name: 'Colegio de San Jose del Monte', category: 'school', lat: 14.7960, lng: 121.0580, distance: '950m (4 mins)', address: 'Tungkong Mangga, CSJDM', iconEmoji: '🏫', notes: 'Private K-12 & College Campus' },
  { id: '13', name: 'First City Providential College (FCPC)', category: 'school', lat: 14.8020, lng: 121.0480, distance: '1.8 km (6 mins)', address: 'Narra St, CSJDM', iconEmoji: '🎓', notes: 'Higher Education & Senior High School' },
  { id: '14', name: 'Tungkong Mangga Elementary School', category: 'school', lat: 14.7930, lng: 121.0535, distance: '500m (2 mins)', address: 'School St, Brgy Tungko', iconEmoji: '📚', notes: 'Public Elementary School' },

  // Dining & Restaurants
  { id: '15', name: 'Jollibee Tungko Drive-Thru', category: 'dining', lat: 14.7955, lng: 121.0530, distance: '750m (3 mins)', address: 'Quirino Hwy, Tungko', iconEmoji: '🍗', notes: '24 Hours Fast Food & Drive-Thru' },
  { id: '16', name: 'McDonald\'s Altaraza Drive-Thru', category: 'dining', lat: 14.7978, lng: 121.0505, distance: '1.3 km (5 mins)', address: 'Altaraza Town Center', iconEmoji: '🍔', notes: '24 Hours Burger & Coffee Drive-Thru' },
  { id: '17', name: 'Starbucks SM San Jose del Monte', category: 'dining', lat: 14.7986, lng: 121.0512, distance: '1.2 km (5 mins)', address: 'Ground Floor, SM City CSJDM', iconEmoji: '☕', notes: 'Coffeehouse & Alfresco Seating' },

  // Transport & Terminals
  { id: '18', name: 'MRT-7 Tungkong Mangga Station (Under Construction)', category: 'transport', lat: 14.7990, lng: 121.0500, distance: '1.4 km (5 mins)', address: 'Quirino Hwy MRT Line 7', iconEmoji: '🚆', notes: 'Future Mass Transit Railway Station connecting to North Ave Quezon City' },
  { id: '19', name: 'Tungko Bus & UV Express Terminal', category: 'transport', lat: 14.7948, lng: 121.0520, distance: '700m (3 mins)', address: 'Quirino Hwy, CSJDM', iconEmoji: '🚌', notes: 'Daily routes to SM Fairview, Cubao, Quezon Ave & PITX' },
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
    if (!mapRef.current || !window.L) return;

    if (!leafletInstance.current) {
      // Center at Northridge Grove, Bulacan
      const map = window.L.map(mapRef.current).setView([14.7925, 121.0558], 15);

      // Tile Layer Providers
      const streetLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | BRIA Northridge Grove',
      });

      streetLayer.addTo(map);
      leafletInstance.current = map;

      // Draw Subdivision Polygon Boundary
      const polygonCoords = [
        [14.7915, 121.0540],
        [14.7940, 121.0555],
        [14.7945, 121.0580],
        [14.7920, 121.0585],
        [14.7905, 121.0560],
      ];

      window.L.polygon(polygonCoords, {
        color: '#DC2626',
        fillColor: '#DC2626',
        fillOpacity: 0.2,
        weight: 3,
        dashArray: '6, 6',
      }).addTo(map).bindTooltip('🏠 BRIA Northridge Grove Subdivision Boundary (Phase 1 & 2)', { permanent: true, direction: 'center' });
    }

    return () => {
      // Cleanup map on unmount if needed
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!leafletInstance.current || !window.L) return;
    const map = leafletInstance.current;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.TileLayer) {
        map.removeLayer(layer);
      }
    });

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
  }, [mapTileStyle]);

  // Update Markers
  useEffect(() => {
    if (!leafletInstance.current || !window.L) return;
    const map = leafletInstance.current;

    // Clear existing markers
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
          <a href="https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lng}" target="_blank" rel="noreferrer" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #2563EB; font-weight: 700; text-decoration: underline;">
            🗺 Open Directions in Google Maps →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => setActivePoi(poi));
      markersRef.current.push(marker);
    });
  }, [filteredPois]);

  const handleSelectPoi = (poi: POI) => {
    setActivePoi(poi);
    if (leafletInstance.current) {
      leafletInstance.current.setView([poi.lat, poi.lng], 16, { animate: true });
    }
  };

  return (
    <PageContainer title="Subdivision & Vicinity Map" subtitle="BRIA Homes Northridge Grove • Nearby Supermarkets, Malls, Hospitals, Schools & Amenities">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>

        {/* MAP CONTROLS HEADER */}
        <div className="card mb-6" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary" style={{ color: '#FFF', margin: 0 }}>
                📍 Interactive Subdivision & Nearby Facilities Map
              </h2>
              <p className="text-xs text-muted" style={{ color: '#9CA3AF', margin: '2px 0 0 0' }}>
                Brgy. Tungkong Mangga, San Jose del Monte, Bulacan 3023
              </p>
            </div>

            {/* Tile Layer Switcher */}
            <div className="flex gap-2">
              {[
                { id: 'street', label: '🗺 OpenStreet' },
                { id: 'satellite', label: '🛰 Satellite Hybrid' },
                { id: 'topo', label: '🏔 Topo Terrain' },
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
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, height: 580, position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

            {/* Quick Legend Overlay */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, color: '#FFF' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 Map Legend</div>
              <div className="flex gap-3">
                <span style={{ color: '#F87171' }}>🔴 HOA Gate/Amenities</span>
                <span style={{ color: '#60A5FA' }}>🔵 Malls & Supermarkets</span>
                <span style={{ color: '#FBBF24' }}>🟡 Hospitals & Schools</span>
              </div>
            </div>
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
