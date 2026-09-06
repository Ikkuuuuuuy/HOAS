import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import SortableHeader, { SortDirection } from '../../components/common/SortableHeader';

export default function ResidentsPage() {
  const { user } = useAuth();
  const { data: residents, isLoading } = useApi<any[]>('/api/residents');

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [civilStatusFilter, setCivilStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: string, direction?: SortDirection) => {
    if (direction) {
      setSortField(field);
      setSortDirection(direction);
    } else if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'address':
          cmp = (a.address || '').localeCompare(b.address || '');
          break;
        case 'contact':
          cmp = (a.contact_number || '').localeCompare(b.contact_number || '');
          break;
        case 'civil_status':
          cmp = (a.civil_status || '').localeCompare(b.civil_status || '');
          break;
        case 'birthdate':
          cmp = new Date(a.birthdate || '1900-01-01').getTime() - new Date(b.birthdate || '1900-01-01').getTime();
          break;
        case 'indigent':
          cmp = (a.indigency_status ? 1 : 0) - (b.indigency_status ? 1 : 0);
          break;
        default:
          cmp = (a.full_name || '').localeCompare(b.full_name || '');
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [residents, searchQuery, civilStatusFilter, sortField, sortDirection]);

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
                style={{ width: 190 }}
                value={`${sortField}-${sortDirection}`}
                onChange={e => {
                  const parts = e.target.value.split('-');
                  const dir = parts.pop() as SortDirection;
                  const fld = parts.join('-');
                  handleSort(fld, dir);
                }}
              >
                <option value="name-asc">Full Name (A-Z)</option>
                <option value="name-desc">Full Name (Z-A)</option>
                <option value="address-asc">Address (A-Z)</option>
                <option value="address-desc">Address (Z-A)</option>
                <option value="birthdate-asc">Birthdate (Oldest First)</option>
                <option value="birthdate-desc">Birthdate (Youngest First)</option>
                <option value="civil_status-asc">Civil Status (A-Z)</option>
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
                  <SortableHeader
                    label="Resident"
                    field="name"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Address"
                    field="address"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Contact"
                    field="contact"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Civil Status"
                    field="civil_status"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Birthdate"
                    field="birthdate"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Indigent"
                    field="indigent"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
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
