import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

export default function ResidentsPage() {
  const { user } = useAuth();
  const { data: residents, isLoading } = useApi<any[]>('/api/residents');

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [civilStatusFilter, setCivilStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Filter & Sort Residents
  const filteredResidents = useMemo(() => {
    if (!residents) return [];

    let result = residents.filter((r: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q) ||
        (r.contact_number || '').toLowerCase().includes(q);

      const matchesCivilStatus = civilStatusFilter === 'all' || r.civil_status === civilStatusFilter;

      return matchesSearch && matchesCivilStatus;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'name-asc') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortBy === 'name-desc') return (b.full_name || '').localeCompare(a.full_name || '');
      if (sortBy === 'address-asc') return (a.address || '').localeCompare(b.address || '');
      return 0;
    });

    return result;
  }, [residents, searchQuery, civilStatusFilter, sortBy]);

  return (
    <PageContainer title="Resident Registry" subtitle="Homeowner & Resident Profiles">
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        {/* Summary */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Residents', value: residents?.length || 0, icon: '👥', color: 'var(--brgy-color)', bg: 'var(--brgy-soft)' },
            { label: 'Indigent Residents', value: residents?.filter(r => r.indigency_status).length || 0, icon: '🫂', color: 'var(--warning)', bg: 'var(--warning-soft)' },
            { label: 'Married', value: residents?.filter(r => r.civil_status === 'married').length || 0, icon: '💑', color: 'var(--info)', bg: 'var(--info-soft)' },
            { label: 'Single', value: residents?.filter(r => r.civil_status === 'single').length || 0, icon: '👤', color: 'var(--accent)', bg: 'var(--accent-soft)' },
          ].map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH & SORTING FILTER BAR */}
        <div className="card mb-6" style={{ padding: 16 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3 items-center flex-1" style={{ minWidth: 280 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }}>🔍</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Search resident name, address, email, or contact..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 160 }}
                value={civilStatusFilter}
                onChange={e => setCivilStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 180 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="name-asc">Full Name (A-Z)</option>
                <option value="name-desc">Full Name (Z-A)</option>
                <option value="address-asc">Address / Block (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Resident Directory</div>
          {isLoading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Loading residents...</span>
            </div>
          ) : filteredResidents.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Civil Status</th>
                  <th>Birthdate</th>
                  <th>Indigent</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((r: any) => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 34, height: 34, borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 'var(--font-sm)', flexShrink: 0,
                        }}>
                          {r.full_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.full_name}</div>
                          <div className="text-xs text-muted">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">{r.address}</td>
                    <td className="text-xs">{r.contact_number || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.civil_status || '—'}</td>
                    <td className="text-xs">{r.birthdate ? new Date(r.birthdate).toLocaleDateString('en-PH') : '—'}</td>
                    <td>
                      {r.indigency_status
                        ? <span className="badge badge-warning">Yes</span>
                        : <span className="badge badge-resolved">No</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No matching residents found</h3>
              <p>Try adjusting your search query or filter above.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
