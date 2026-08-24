import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HOA_MASTERLIST_DATABASE, MasterlistRecord, getMockData, setMockData } from '../../data/mockDatabase';

const BLOCK_STREET_MAP: Record<string, string> = {
  'Block 1': 'Magiting Street',
  'Block 2': 'Maagap Street',
  'Block 3': 'Maagap Street',
  'Block 4': 'Mabuti Street',
  'Block 5': 'Mabuti Street',
  'Block 6': 'Magiting Street',
  'Block 7': 'Maagap Street',
  'Block 8': 'Mapayapa Street',
  'Block 9': 'Mapayapa Street',
};

export default function HOAMasterlistManagement() {
  const { user } = useAuth();
  const { success, error: showError, info } = useToast();

  // Masterlist State initialized from persistent local storage / initial mock
  const [masterlist, setMasterlist] = useState<MasterlistRecord[]>(() => {
    try {
      const stored = localStorage.getItem('hoa_mock_masterlist_records');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch { /* storage fallback */ }
    return HOA_MASTERLIST_DATABASE;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedOwnership, setSelectedOwnership] = useState('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterlistRecord | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State (Add / Edit)
  const [formName, setFormName] = useState('');
  const [formBlock, setFormBlock] = useState('Block 3');
  const [formLot, setFormLot] = useState('Lot 12');
  const [formStreet, setFormStreet] = useState('Maagap Street');
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOwnership, setFormOwnership] = useState<'Turned-over Owner' | 'Registered Buyer' | 'Co-Owner'>('Turned-over Owner');
  const [formTurnoverDate, setFormTurnoverDate] = useState('2024-01-15');

  // Excel / CSV Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<MasterlistRecord[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Save helper
  const persistRecords = (records: MasterlistRecord[]) => {
    setMasterlist(records);
    try {
      localStorage.setItem('hoa_mock_masterlist_records', JSON.stringify(records));
    } catch { /* fallback */ }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormName('');
    setFormBlock('Block 3');
    setFormLot('Lot 12');
    setFormStreet(BLOCK_STREET_MAP['Block 3']);
    setFormAccountNo('NRG2-B03L12');
    setFormPhone('');
    setFormEmail('');
    setFormOwnership('Turned-over Owner');
    setFormTurnoverDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: MasterlistRecord) => {
    setEditingRecord(rec);
    setFormName(rec.ownerName);
    setFormBlock(rec.block);
    setFormLot(rec.lot);
    setFormStreet(rec.street || BLOCK_STREET_MAP[rec.block] || 'Maagap Street');
    setFormAccountNo(rec.accountNo);
    setFormPhone(rec.phone || '');
    setFormEmail(rec.email || '');
    setFormOwnership(rec.ownershipType);
    setFormTurnoverDate(rec.turnoverDate || '2024-01-01');
    setShowAddModal(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBlock || !formLot.trim()) {
      showError('Validation Error', 'Please complete the Owner Name, Block, and Lot number.');
      return;
    }

    const calculatedStreet = BLOCK_STREET_MAP[formBlock] || formStreet || 'Maagap Street';
    const normBlockNum = formBlock.replace(/[^0-9]/g, '').padStart(2, '0');
    const normLotNum = formLot.replace(/[^0-9]/g, '').padStart(2, '0');
    const finalAccountNo = formAccountNo.trim() || `NRG2-B${normBlockNum}L${normLotNum}`;

    if (editingRecord) {
      // Edit
      const updated = masterlist.map(r => r.id === editingRecord.id ? {
        ...r,
        ownerName: formName.trim(),
        block: formBlock,
        lot: formLot.trim(),
        street: calculatedStreet,
        accountNo: finalAccountNo,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        ownershipType: formOwnership,
        turnoverDate: formTurnoverDate,
      } : r);
      persistRecords(updated);
      success('Record Updated!', `Masterlist details for ${formName.trim()} saved.`);
    } else {
      // Add
      const newRec: MasterlistRecord = {
        id: `ml-${Date.now()}`,
        accountNo: finalAccountNo,
        block: formBlock,
        lot: formLot.trim(),
        street: calculatedStreet,
        ownerName: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        ownershipType: formOwnership,
        turnoverDate: formTurnoverDate,
        status: 'verified_active',
      };
      persistRecords([newRec, ...masterlist]);
      success('Homeowner Added!', `${formName.trim()} is now active in the HOA Masterlist for instant auto-approval.`);
    }

    setShowAddModal(false);
  };

  // Delete Record
  const handleDeleteRecord = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the pre-verified HOA Masterlist?`)) {
      const updated = masterlist.filter(r => r.id !== id);
      persistRecords(updated);
      info('Record Removed', `${name} removed from masterlist.`);
    }
  };

  // ── EXCEL / CSV PARSER ─────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);

        if (lines.length < 2) {
          throw new Error('The file appears empty or missing table headers.');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
        
        // Match header indices
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('owner'));
        const blockIdx = headers.findIndex(h => h.includes('block'));
        const lotIdx = headers.findIndex(h => h.includes('lot'));
        const streetIdx = headers.findIndex(h => h.includes('street'));
        const accountIdx = headers.findIndex(h => h.includes('account') || h.includes('code') || h.includes('id'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('contact') || h.includes('mobile'));
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('ownership'));

        const parsed: MasterlistRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 2) continue;

          const rawBlock = blockIdx !== -1 ? row[blockIdx] : 'Block 1';
          const block = rawBlock.toLowerCase().startsWith('block') ? rawBlock : `Block ${rawBlock}`;
          const rawLot = lotIdx !== -1 ? row[lotIdx] : 'Lot 01';
          const lot = rawLot.toLowerCase().startsWith('lot') ? rawLot : `Lot ${rawLot}`;
          const ownerName = nameIdx !== -1 ? row[nameIdx] : `Homeowner ${i}`;

          if (!ownerName || ownerName === 'Homeowner') continue;

          const normBlockNum = block.replace(/[^0-9]/g, '').padStart(2, '0');
          const normLotNum = lot.replace(/[^0-9]/g, '').padStart(2, '0');

          parsed.push({
            id: `ml-imp-${Date.now()}-${i}`,
            accountNo: accountIdx !== -1 && row[accountIdx] ? row[accountIdx] : `NRG2-B${normBlockNum}L${normLotNum}`,
            block: block || 'Block 1',
            lot: lot || 'Lot 01',
            street: streetIdx !== -1 && row[streetIdx] ? row[streetIdx] : (BLOCK_STREET_MAP[block] || 'Maagap Street'),
            ownerName: ownerName,
            phone: phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '0917-000-0000',
            email: emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : `${ownerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            ownershipType: (typeIdx !== -1 && row[typeIdx]) ? (row[typeIdx] as any) : 'Turned-over Owner',
            turnoverDate: '2024-01-15',
            status: 'verified_active',
          });
        }

        if (parsed.length === 0) {
          throw new Error('Could not parse valid homeowner records from this file.');
        }

        setParsedRows(parsed);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse spreadsheet file.');
        setParsedRows([]);
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(file);
  };

  // Confirm Excel Import
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    // Merge without duplicate account numbers
    const existingAccounts = new Set(masterlist.map(m => m.accountNo.toLowerCase()));
    const newItems = parsedRows.filter(p => !existingAccounts.has(p.accountNo.toLowerCase()));
    const updated = [...newItems, ...masterlist];

    persistRecords(updated);
    success('Excel Import Successful!', `Imported ${newItems.length} homeowner records into the Masterlist.`);
    setShowImportModal(false);
    setParsedRows([]);
    setImportFile(null);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Account No,Owner Full Name,Block,Lot,Street Name,Mobile Phone,Email Address,Ownership Type',
      'NRG2-B01L02,Pedro Penduko,Block 1,Lot 02,Magiting Street,0922-345-6789,pedro.penduko@gmail.com,Turned-over Owner',
      'NRG2-B03L12,Juan Dela Cruz,Block 3,Lot 12,Maagap Street,0917-123-4567,juan.delacruz@gmail.com,Turned-over Owner',
      'NRG2-B04L05,Maria Santos,Block 4,Lot 05,Mabuti Street,0918-234-5678,maria.santos@gmail.com,Turned-over Owner',
      'NRG2-B07L08,Ricardo Dalisay,Block 7,Lot 08,Maagap Street,0917-888-9999,resident@palmera-hoa.com,Turned-over Owner',
      'NRG2-B08L14,Ana Elena Reyes,Block 8,Lot 14,Mapayapa Street,0905-456-7890,ana.reyes@gmail.com,Turned-over Owner',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NRG_PH2_HOA_Masterlist_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Masterlist Records
  const filteredList = useMemo(() => {
    return masterlist.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        rec.ownerName.toLowerCase().includes(q) ||
        rec.accountNo.toLowerCase().includes(q) ||
        rec.block.toLowerCase().includes(q) ||
        rec.lot.toLowerCase().includes(q) ||
        rec.street.toLowerCase().includes(q) ||
        rec.phone.toLowerCase().includes(q) ||
        rec.email.toLowerCase().includes(q);

      const matchesBlock = selectedBlock === 'ALL' || rec.block === selectedBlock;
      const matchesOwnership = selectedOwnership === 'ALL' || rec.ownershipType === selectedOwnership;

      return matchesSearch && matchesBlock && matchesOwnership;
    });
  }, [masterlist, searchQuery, selectedBlock, selectedOwnership]);

  return (
    <PageContainer
      title="HOA Homeowners Masterlist & Excel Sync"
      subtitle="Official Registry of 312 Property Owners for Automated Instant Registration & Verification"
    >
      <div style={{ animation: 'fadeInUp 0.3s ease' }}>

        {/* ── 1. METRICS & STATS BAR ── */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #166534' }}>
            <div className="stat-icon" style={{ background: 'rgba(22, 101, 52, 0.2)', color: '#22C55E' }}>📜</div>
            <div>
              <div className="stat-value">{masterlist.length}</div>
              <div className="stat-label">Total Masterlist Lots</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #DC2626' }}>
            <div className="stat-icon" style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#EF4444' }}>⚡</div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Instant Auto-Accept Active</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #D97706' }}>
            <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#F59E0B' }}>🏘️</div>
            <div>
              <div className="stat-value">Blocks 1 – 9</div>
              <div className="stat-label">Subdivision Phases</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #2563EB' }}>
            <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#3B82F6' }}>📊</div>
            <div>
              <div className="stat-value">{filteredList.length}</div>
              <div className="stat-label">Displayed Records</div>
            </div>
          </div>
        </div>

        {/* ── 2. CONTROLS & ACTION BAR ── */}
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Search & Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, flex: 1, minWidth: 320 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="🔍 Search name, account #, block, lot, street..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Block Filter */}
              <select
                className="form-input"
                value={selectedBlock}
                onChange={e => setSelectedBlock(e.target.value)}
                style={{ width: 140 }}
              >
                <option value="ALL">All Blocks (1-9)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => (
                  <option key={b} value={`Block ${b}`}>Block {b}</option>
                ))}
              </select>

              {/* Ownership Filter */}
              <select
                className="form-input"
                value={selectedOwnership}
                onChange={e => setSelectedOwnership(e.target.value)}
                style={{ width: 170 }}
              >
                <option value="ALL">All Ownership Types</option>
                <option value="Turned-over Owner">Turned-over Owner</option>
                <option value="Registered Buyer">Registered Buyer</option>
                <option value="Co-Owner">Co-Owner</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleOpenAddModal}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: '#166534',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(22,101,52,0.3)',
                }}
              >
                <span>➕</span> Add Homeowner
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportFile(null);
                  setParsedRows([]);
                  setImportError(null);
                  setShowImportModal(true);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                }}
              >
                <span>📁</span> Import Excel / CSV
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#E5E7EB',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                title="Download CSV template"
              >
                📥 Template
              </button>
            </div>

          </div>
        </div>

        {/* ── 3. MASTERLIST DATA TABLE ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📜 Pre-Verified Homeowners Master Database</span>
              <span style={{ fontSize: 12, background: 'rgba(34,197,94,0.2)', color: '#86EFAC', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                {filteredList.length} Verified Lots
              </span>
            </h3>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              ⚡ Auto-accept matches are applied live in <code>/register</code>
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', fontSize: 12, color: '#9CA3AF' }}>
                  <th style={{ padding: '12px 16px' }}>Account No.</th>
                  <th style={{ padding: '12px 16px' }}>Registered Owner</th>
                  <th style={{ padding: '12px 16px' }}>Property Address</th>
                  <th style={{ padding: '12px 16px' }}>Contact & Email</th>
                  <th style={{ padding: '12px 16px' }}>Ownership</th>
                  <th style={{ padding: '12px 16px' }}>Auto-Verification</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#9CA3AF' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>No matching homeowner records found</div>
                      <div style={{ fontSize: 12 }}>Try clearing your search query or filters</div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                      
                      {/* Account No */}
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>
                          {rec.accountNo}
                        </code>
                      </td>

                      {/* Owner Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{rec.ownerName}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Turnover: {rec.turnoverDate || '2024'}</div>
                      </td>

                      {/* Property Address */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#E5E7EB' }}>{rec.block} {rec.lot}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{rec.street}</div>
                      </td>

                      {/* Contact & Email */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#E5E7EB' }}>📞 {rec.phone || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>✉️ {rec.email || 'N/A'}</div>
                      </td>

                      {/* Ownership Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: rec.ownershipType === 'Turned-over Owner' ? 'rgba(22,101,52,0.2)' : 'rgba(37,99,235,0.2)',
                          color: rec.ownershipType === 'Turned-over Owner' ? '#86EFAC' : '#93C5FD',
                        }}>
                          {rec.ownershipType}
                        </span>
                      </td>

                      {/* Auto-Verification Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 800,
                          background: 'rgba(34,197,94,0.15)',
                          color: '#4ADE80',
                          border: '1px solid rgba(34,197,94,0.3)',
                          padding: '3px 8px',
                          borderRadius: 20
                        }}>
                          <span>⚡</span> Auto-Accept Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rec)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: 'rgba(255,255,255,0.08)',
                              color: '#93C5FD',
                              border: '1px solid rgba(147,197,253,0.3)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id, rec.ownerName)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: 'rgba(239,68,68,0.1)',
                              color: '#F87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: ADD / EDIT HOMEOWNER ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="card" style={{ maxWidth: 580, width: '100%', padding: 28, animation: 'fadeInUp 0.25s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#FFF', margin: 0 }}>
                {editingRecord ? '✏️ Edit Masterlist Homeowner' : '➕ Add Pre-Verified Homeowner'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="login-form">
              
              <div>
                <label className="form-label">Registered Owner Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ricardo Dalisay"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 12 }}>
                <div>
                  <label className="form-label">Block Number *</label>
                  <select
                    className="form-input"
                    value={formBlock}
                    onChange={e => {
                      setFormBlock(e.target.value);
                      setFormStreet(BLOCK_STREET_MAP[e.target.value] || 'Maagap Street');
                    }}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => (
                      <option key={b} value={`Block ${b}`}>Block {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Lot Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lot 08"
                    value={formLot}
                    onChange={e => setFormLot(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Subdivision Street</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formStreet}
                    onChange={e => setFormStreet(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Account Code / Member ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. NRG2-B07L08"
                    value={formAccountNo}
                    onChange={e => setFormAccountNo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Ownership Type</label>
                  <select
                    className="form-input"
                    value={formOwnership}
                    onChange={e => setFormOwnership(e.target.value as any)}
                  >
                    <option value="Turned-over Owner">Turned-over Owner</option>
                    <option value="Registered Buyer">Registered Buyer</option>
                    <option value="Co-Owner">Co-Owner</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Mobile Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0917-888-9999"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="owner@email.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(22, 101, 52, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                color: '#86EFAC',
                marginTop: 6
              }}>
                ⚡ Auto-Accept Sync: Once saved, this homeowner can register with their Name and Block/Lot to get instant approved access!
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    background: '#166534',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22,101,52,0.4)'
                  }}
                >
                  ✓ Save Masterlist Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EXCEL / CSV BULK IMPORT ── */}
      {showImportModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="card" style={{ maxWidth: 720, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.25s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#FFF', margin: 0 }}>
                  📁 Import Homeowners Masterlist (Excel / CSV)
                </h3>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0 0' }}>
                  Upload a spreadsheet to bulk-populate and pre-verify all Northridge Grove Phase 2 lots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Upload Zone */}
            <div style={{ marginBottom: 18 }}>
              <input
                type="file"
                id="excel-masterlist-upload"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="excel-masterlist-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: importFile ? '2px solid #22C55E' : '2px dashed rgba(37, 99, 235, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 6 }}>{importFile ? '📊' : '📥'}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>
                  {importFile ? importFile.name : 'Click or Drag & Drop Masterlist Spreadsheet (.csv, .xlsx)'}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  Expected Columns: Account No, Owner Name, Block, Lot, Street, Phone, Email, Ownership Type
                </div>
              </label>
            </div>

            {importError && (
              <div className="login-error mb-4" style={{ padding: 12 }}>
                <span>⚠️</span>
                <span>{importError}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#86EFAC' }}>
                    ✓ Preview: {parsedRows.length} Rows Detected Ready for Sync
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    Duplicates with existing account numbers will be skipped safely.
                  </span>
                </div>

                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <table className="table" style={{ width: '100%', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}>
                        <th style={{ padding: '8px 12px' }}>Code</th>
                        <th style={{ padding: '8px 12px' }}>Owner Name</th>
                        <th style={{ padding: '8px 12px' }}>Block & Lot</th>
                        <th style={{ padding: '8px 12px' }}>Street</th>
                        <th style={{ padding: '8px 12px' }}>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 10).map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '6px 12px', color: '#FBBF24', fontWeight: 700 }}>{p.accountNo}</td>
                          <td style={{ padding: '6px 12px', color: '#FFF', fontWeight: 700 }}>{p.ownerName}</td>
                          <td style={{ padding: '6px 12px' }}>{p.block} {p.lot}</td>
                          <td style={{ padding: '6px 12px', color: '#9CA3AF' }}>{p.street}</td>
                          <td style={{ padding: '6px 12px', color: '#9CA3AF' }}>{p.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 4 }}>
                    + {parsedRows.length - 10} more rows ready for batch import
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedRows.length === 0}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  background: parsedRows.length > 0 ? '#166534' : 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: parsedRows.length > 0 ? '0 4px 12px rgba(22,101,52,0.4)' : 'none'
                }}
              >
                {parsedRows.length > 0 ? `✓ Confirm Import (${parsedRows.length} Records)` : 'Select a File to Preview'}
              </button>
            </div>

          </div>
        </div>
      )}

    </PageContainer>
  );
}
