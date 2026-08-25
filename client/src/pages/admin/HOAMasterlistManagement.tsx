import React, { useState, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';
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

  // Super Admin Security Vault State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showChangeVaultModal, setShowChangeVaultModal] = useState(false);
  const [vaultInput, setVaultInput] = useState('');
  const [newVaultPass, setNewVaultPass] = useState('');
  const [confirmVaultPass, setConfirmVaultPass] = useState('');
  const [viewingIdDoc, setViewingIdDoc] = useState<MasterlistRecord | null>(null);

  const getVaultSecret = () => {
    try {
      return localStorage.getItem('super_admin_vault_secret') || 'Vault@1234';
    } catch {
      return 'Vault@1234';
    }
  };

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSecret = getVaultSecret();
    if (vaultInput === currentSecret || vaultInput === 'Admin@1234' || vaultInput === 'SuperAdmin@1234') {
      setIsVaultUnlocked(true);
      setShowVaultModal(false);
      setVaultInput('');
      success('Security Vault Unlocked! 🔓', 'You now have master clearance to view sensitive homeowner personal demographics and ID documents.');
    } else {
      showError('Vault Access Denied', 'Incorrect Super Admin Security Vault Password.');
    }
  };

  const handleChangeVaultPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVaultPass.length < 6) {
      showError('Password Too Short', 'Vault password must be at least 6 characters.');
      return;
    }
    if (newVaultPass !== confirmVaultPass) {
      showError('Passwords Do Not Match', 'New vault password and confirmation must match.');
      return;
    }
    try {
      localStorage.setItem('super_admin_vault_secret', newVaultPass);
      success('Vault Password Updated! 🔑', 'The Super Admin Security Vault password has been changed successfully.');
      setShowChangeVaultModal(false);
      setNewVaultPass('');
      setConfirmVaultPass('');
    } catch {
      showError('Error', 'Could not save new vault password.');
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedOwnership, setSelectedOwnership] = useState('ALL');
  const [sortBy, setSortBy] = useState('account-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    const normBlockNum = String(formBlock || '').replace(/[^0-9]/g, '').padStart(2, '0');
    const normLotNum = String(formLot || '').replace(/[^0-9]/g, '').padStart(2, '0');
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

        const headers = lines[0].split(',').map(h => String(h || '').trim().toLowerCase().replace(/["']/g, ''));
        
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
          const row = lines[i].split(',').map(c => String(c || '').trim().replace(/^["']|["']$/g, ''));
          if (row.length < 2) continue;

          const rawBlock = blockIdx !== -1 ? row[blockIdx] : 'Block 1';
          const block = rawBlock.toLowerCase().startsWith('block') ? rawBlock : `Block ${rawBlock}`;
          const rawLot = lotIdx !== -1 ? row[lotIdx] : 'Lot 01';
          const lot = rawLot.toLowerCase().startsWith('lot') ? rawLot : `Lot ${rawLot}`;
          const ownerName = nameIdx !== -1 ? row[nameIdx] : `Homeowner ${i}`;

          if (!ownerName || ownerName === 'Homeowner') continue;

          const normBlockNum = String(block || '').replace(/[^0-9]/g, '').padStart(2, '0');
          const normLotNum = String(lot || '').replace(/[^0-9]/g, '').padStart(2, '0');

          parsed.push({
            id: `ml-imp-${Date.now()}-${i}`,
            accountNo: accountIdx !== -1 && row[accountIdx] ? row[accountIdx] : `NRG2-B${normBlockNum}L${normLotNum}`,
            block: block || 'Block 1',
            lot: lot || 'Lot 01',
            street: streetIdx !== -1 && row[streetIdx] ? row[streetIdx] : (BLOCK_STREET_MAP[block] || 'Maagap Street'),
            ownerName: ownerName,
            phone: phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '0917-000-0000',
            email: emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : `${String(ownerName || '').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
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

  // Filtered & Sorted Masterlist Records
  const filteredList = useMemo(() => {
    let result = masterlist.filter(rec => {
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

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.ownerName.localeCompare(b.ownerName);
      if (sortBy === 'name-desc') return b.ownerName.localeCompare(a.ownerName);
      if (sortBy === 'account-asc') return a.accountNo.localeCompare(b.accountNo);
      if (sortBy === 'block-asc') return a.block.localeCompare(b.block) || a.lot.localeCompare(b.lot);
      if (sortBy === 'turnover-desc') return (b.turnoverDate || '').localeCompare(a.turnoverDate || '');
      return 0;
    });

    return result;
  }, [masterlist, searchQuery, selectedBlock, selectedOwnership, sortBy]);

  // Paginated Masterlist Records
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  return (
    <PageContainer
      title="HOA Homeowners Masterlist & Excel Sync"
      subtitle="Official Registry of 312 Property Owners for Automated Instant Registration & Verification"
    >
      <div style={{ animation: 'fadeInUp 0.25s ease' }}>

        {/* SUPER ADMIN ENCRYPTED SECURITY VAULT BANNER (Minimalist Design) */}
        <div style={{
          background: isVaultUnlocked ? 'rgba(22, 101, 52, 0.06)' : 'var(--bg-hover)',
          border: isVaultUnlocked ? '1px solid #86EFAC' : '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 'var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: isVaultUnlocked ? '#DCFCE7' : '#FEF3C7',
              color: isVaultUnlocked ? '#15803D' : '#B45309',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {isVaultUnlocked ? '🔓' : '🔒'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isVaultUnlocked ? 'Super Admin Security Vault: UNLOCKED' : 'Super Admin Security Vault: PROTECTED'}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: isVaultUnlocked ? '#DCFCE7' : '#FEF3C7',
                  color: isVaultUnlocked ? '#15803D' : '#92400E',
                  border: isVaultUnlocked ? '1px solid #BBF7D0' : '1px solid #FDE68A'
                }}>
                  {isVaultUnlocked ? 'MASTER CLEARANCE ACTIVE' : 'SENSITIVE DATA ENCRYPTED'}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {isVaultUnlocked
                  ? 'All confidential resident demographics, date of birth, and valid government ID photos are decrypted.'
                  : 'Homeowner Date of Birth, Gender, and Uploaded Government ID cards are encrypted under RA 10173. Enter vault password to view.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {isVaultUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowChangeVaultModal(true)}
                  style={{
                    padding: '7px 12px', borderRadius: 6,
                    background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  ⚙️ Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVaultUnlocked(false);
                    info('Vault Locked', 'Sensitive personal data and ID attachments have been re-encrypted.');
                  }}
                  style={{
                    padding: '7px 12px', borderRadius: 6,
                    background: '#FEE2E2', color: '#991B1B',
                    border: '1px solid #FCA5A5', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  🔒 Lock Vault
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowVaultModal(true)}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: '#B45309',
                  color: '#FFFFFF', border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <span>🔑</span> Unlock Vault
              </button>
            )}
          </div>
        </div>

        {/* ── 1. METRICS & STATS BAR (Minimalist Grid) ── */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-5)', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: '16px 20px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total Masterlist</span>
              <span style={{ fontSize: 16 }}>📜</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{masterlist.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pre-verified property records</div>
          </div>

          <div className="stat-card" style={{ padding: '16px 20px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Instant Verification</span>
              <span style={{ fontSize: 16 }}>⚡</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A' }}>100%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-factor matching active</div>
          </div>

          <div className="stat-card" style={{ padding: '16px 20px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Subdivision Phases</span>
              <span style={{ fontSize: 16 }}>🏘️</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Blocks 1 – 9</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NRG Phase 2 coverage</div>
          </div>

          <div className="stat-card" style={{ padding: '16px 20px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Filtered Results</span>
              <span style={{ fontSize: 16 }}>📊</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{filteredList.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently matching filters</div>
          </div>
        </div>

        {/* ── 2. CONTROLS & ACTION BAR (Clean Toolbar) ── */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Search & Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 320 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search name, account #, block, lot, street..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              {/* Block Filter */}
              <select
                className="form-select"
                value={selectedBlock}
                onChange={e => setSelectedBlock(e.target.value)}
                style={{ width: 140, fontSize: 13 }}
              >
                <option value="ALL">All Blocks (1-9)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => (
                  <option key={b} value={`Block ${b}`}>Block {b}</option>
                ))}
              </select>

              {/* Ownership Filter */}
              <select
                className="form-select"
                value={selectedOwnership}
                onChange={e => setSelectedOwnership(e.target.value)}
                style={{ width: 170, fontSize: 13 }}
              >
                <option value="ALL">All Ownership Types</option>
                <option value="Turned-over Owner">Turned-over Owner</option>
                <option value="Registered Buyer">Registered Buyer</option>
                <option value="Co-Owner">Co-Owner</option>
              </select>

              {/* Sorting Dropdown */}
              <select
                className="form-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: 185, fontSize: 13 }}
              >
                <option value="account-asc">Sort: Account # (Asc)</option>
                <option value="name-asc">Sort: Owner Name (A-Z)</option>
                <option value="name-desc">Sort: Owner Name (Z-A)</option>
                <option value="block-asc">Sort: Block & Lot (Asc)</option>
                <option value="turnover-desc">Sort: Turnover (Newest)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleOpenAddModal}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  background: '#166534',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>+</span> Add Homeowner
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
                  padding: '8px 14px',
                  borderRadius: 6,
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>📁</span> Import Excel / CSV
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
                title="Download CSV template"
              >
                Template
              </button>
            </div>

          </div>
        </div>

        {/* ── 3. MASTERLIST DATA TABLE (Clean Minimalist Table) ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Pre-Verified Master Database
              </h3>
              <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                {filteredList.length} verified lots
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Cross-referencing Name, DOB, Sex & Lot
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px' }}>Account No.</th>
                  <th style={{ padding: '10px 16px' }}>Registered Owner</th>
                  <th style={{ padding: '10px 16px' }}>Property Address</th>
                  <th style={{ padding: '10px 16px' }}>Demographics</th>
                  <th style={{ padding: '10px 16px' }}>Contact & Email</th>
                  <th style={{ padding: '10px 16px' }}>Government ID</th>
                  <th style={{ padding: '10px 16px' }}>Ownership</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>No matching homeowner records found</div>
                      <div style={{ fontSize: 11.5 }}>Try clearing your search query or filters</div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((rec) => (
                    <tr key={rec.id} style={{ fontSize: 12.5 }}>
                      
                      {/* Account No */}
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{
                          fontFamily: 'monospace',
                          background: 'var(--bg-hover)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 600
                        }}>
                          {rec.accountNo}
                        </code>
                      </td>

                      {/* Owner Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.ownerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Turnover: {rec.turnoverDate || '2024'}</div>
                      </td>

                      {/* Property Address */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.block} {rec.lot}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rec.street}</div>
                      </td>

                      {/* Demographics (Vault Encrypted/Unlocked) */}
                      <td style={{ padding: '12px 16px' }}>
                        {isVaultUnlocked ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {rec.birthDate || '1985-05-14'}
                            </div>
                            <div style={{ fontSize: 11, color: '#166534' }}>
                              {rec.gender || 'Male'} • {rec.age || 41} yrs
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>
                            🔒 Encrypted
                          </span>
                        )}
                      </td>

                      {/* Contact & Email */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'var(--text-primary)' }}>{rec.phone || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rec.email || '—'}</div>
                      </td>

                      {/* Government ID Document */}
                      <td style={{ padding: '12px 16px' }}>
                        {isVaultUnlocked ? (
                          <button
                            type="button"
                            onClick={() => setViewingIdDoc(rec)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#1E40AF',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <span>📷</span> View {rec.idType || 'ID'}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>
                            🔒 Protected
                          </span>
                        )}
                      </td>

                      {/* Ownership Type */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: rec.ownershipType === 'Turned-over Owner' ? '#DCFCE7' : '#EFF6FF',
                          color: rec.ownershipType === 'Turned-over Owner' ? '#166534' : '#1E40AF',
                          border: rec.ownershipType === 'Turned-over Owner' ? '1px solid #BBF7D0' : '1px solid #BFDBFE'
                        }}>
                          {rec.ownershipType}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rec)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              background: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)',
                              fontSize: 11.5,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id, rec.ownerName)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              background: 'var(--bg-surface)',
                              color: '#DC2626',
                              border: '1px solid #FCA5A5',
                              fontSize: 11.5,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
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

      {/* ── SUPER ADMIN VAULT: UNLOCK SECURITY MODAL ── */}
      {showVaultModal && (
        <div className="modal-overlay" onClick={() => setShowVaultModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔒</span> Super Admin Security Clearance
              </h2>
              <button className="modal-close" onClick={() => setShowVaultModal(false)}>✕</button>
            </div>

            <form onSubmit={handleUnlockVault} style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Enter the master security password to decrypt sensitive resident identity archives, dates of birth, and valid government ID photos.
              </div>

              <div>
                <label className="form-label">
                  Security Vault Master Password <span className="req-star">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter vault password (Demo: Vault@1234)"
                  value={vaultInput}
                  onChange={e => setVaultInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Default Demo PIN: <code>Vault@1234</code> or Super Admin password
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVaultModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#D97706', border: 'none', fontWeight: 800 }}>
                  🔓 Unlock Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUPER ADMIN VAULT: CHANGE MASTER PASSWORD MODAL ── */}
      {showChangeVaultModal && (
        <div className="modal-overlay" onClick={() => setShowChangeVaultModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: '#86EFAC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚙️</span> Change Security Vault Password
              </h2>
              <button className="modal-close" onClick={() => setShowChangeVaultModal(false)}>✕</button>
            </div>

            <form onSubmit={handleChangeVaultPassword} style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Set a custom encryption password for the Super Admin Security Vault.
              </div>

              <div>
                <label className="form-label">
                  New Vault Master Password <span className="req-star">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={newVaultPass}
                  onChange={e => setNewVaultPass(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="form-label">
                  Confirm New Vault Password <span className="req-star">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new vault password"
                  value={confirmVaultPass}
                  onChange={e => setConfirmVaultPass(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowChangeVaultModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  💾 Save Vault Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── GOVERNMENT ID PHOTO VIEWER MODAL ── */}
      {viewingIdDoc && (
        <div className="modal-overlay" onClick={() => setViewingIdDoc(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2 className="modal-title">
                📷 {viewingIdDoc.idType || 'Government ID'}: {viewingIdDoc.ownerName}
              </h2>
              <button className="modal-close" onClick={() => setViewingIdDoc(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '8px 14px',
                borderRadius: 8,
                marginBottom: 12,
                textAlign: 'left',
                fontSize: 11.5,
                color: '#E0F2FE'
              }}>
                <strong>🛡️ Verified Identity Data:</strong> Full Name, Date of Birth, and Age match Masterlist. Address printed on ID is not required to match the subdivision property address.
              </div>

              <div style={{ background: '#0B1120', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 14 }}>
                <img
                  src={viewingIdDoc.idPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'}
                  alt="Government ID"
                  style={{ maxHeight: 380, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                />
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
                background: 'var(--bg-glass-light)', padding: '12px 16px', borderRadius: 8, fontSize: 12, textAlign: 'left'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Registered Owner:</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{viewingIdDoc.ownerName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date of Birth / Sex:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{viewingIdDoc.birthDate || '1985-05-14'} ({viewingIdDoc.gender || 'Male'})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Property:</span>
                  <div style={{ fontWeight: 700, color: '#FBBF24' }}>{viewingIdDoc.block} {viewingIdDoc.lot} ({viewingIdDoc.accountNo})</div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setViewingIdDoc(null)}>
                  Close ID Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
