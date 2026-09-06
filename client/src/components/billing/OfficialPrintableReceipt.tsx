import React from 'react';

export interface ReceiptData {
  orNumber: string;
  dateStr: string;
  billingPeriod: string;
  payorName: string;
  propertyAddress: string;
  memberId: string;
  paymentChannel: string;
  refNo: string;
  amountNumber: number;
  amountStr: string;
  amountInWords?: string;
  breakdown: { item: string; cost: number }[];
  approvedBy: string;
  approvedAt: string;
  screenshotUrl?: string;
}

interface Props {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function OfficialPrintableReceipt({ receipt, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box printable-receipt-modal"
        style={{
          maxWidth: 780,
          width: '95%',
          borderRadius: 16,
          background: '#FFFFFF',
          color: '#111827',
          border: '1px solid #E5E7EB',
          padding: 0,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.2s ease',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Actions Bar (Hidden during Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🧾</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                Official Receipt Preview
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                Receipt No: {receipt.orNumber} • Verified by HOA Treasury
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.3)',
              }}
            >
              <span>🖨️</span> Print Official Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div
          style={{
            overflowY: 'auto',
            padding: '28px 36px',
            background: '#FFFFFF',
            color: '#111827',
          }}
          id="printable-receipt-area"
        >
          <div
            id="official-printable-receipt"
            style={{
              border: '2px solid #1E3A8A',
              padding: '28px 32px',
              borderRadius: 8,
              background: '#FFFFFF',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px #93C5FD',
            }}
          >
            {/* Watermark Logo in Background */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.05,
                pointerEvents: 'none',
                zIndex: 0,
                width: 320,
                height: 320,
                backgroundImage: 'url(/nrg-ph2-logo.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />

            {/* Official Header */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', borderBottom: '2px solid #1E3A8A', paddingBottom: 16, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                <img
                  src="/nrg-ph2-logo.png"
                  alt="NRG PH2 Logo"
                  style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '50%', border: '1px solid #E5E7EB' }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Republic of the Philippines • Province of Bulacan
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#1E3A8A', letterSpacing: '-0.2px', marginTop: 2 }}>
                    NORTHRIDGE GROVE PHASE 2 HOMEOWNERS ASSOCIATION, INC.
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                    DHSUD / HLURB Reg. No. 2014-08-0192 • TIN: 452-901-882-000
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#4B5563', fontStyle: 'italic' }}>
                Clubhouse & Administration Grounds, Maagap St., Northridge Grove Phase 2, Barangay Palmera, City of San Jose del Monte
              </div>
            </div>

            {/* Document Title Banner */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 16px', borderRadius: 6, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#1E3A8A', letterSpacing: '0.04em' }}>
                  OFFICIAL RECEIPT / ELECTRONIC ACKNOWLEDGMENT
                </div>
                <div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>
                  Assessment Settlement for {receipt.billingPeriod}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700 }}>OR NUMBER</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#DC2626', fontFamily: 'monospace' }}>
                  {receipt.orNumber}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20, fontSize: 12.5 }}>
              {/* Left Column: Homeowner Details */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>
                  Payor Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 4 }}>
                  <span style={{ color: '#6B7280' }}>Homeowner:</span>
                  <strong style={{ color: '#111827' }}>{receipt.payorName}</strong>
                  <span style={{ color: '#6B7280' }}>Property:</span>
                  <span style={{ color: '#111827' }}>{receipt.propertyAddress}</span>
                  <span style={{ color: '#6B7280' }}>Member ID:</span>
                  <span style={{ color: '#111827', fontFamily: 'monospace' }}>{receipt.memberId}</span>
                  <span style={{ color: '#6B7280' }}>Standing:</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>Active Member in Good Standing</span>
                </div>
              </div>

              {/* Right Column: Transaction & Verification */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>
                  Payment Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: 4 }}>
                  <span style={{ color: '#6B7280' }}>Date Issued:</span>
                  <strong style={{ color: '#111827' }}>{receipt.dateStr}</strong>
                  <span style={{ color: '#6B7280' }}>Channel:</span>
                  <span style={{ color: '#005CEE', fontWeight: 700 }}>{receipt.paymentChannel}</span>
                  <span style={{ color: '#6B7280' }}>GCash Ref No:</span>
                  <span style={{ color: '#111827', fontFamily: 'monospace', fontWeight: 700 }}>{receipt.refNo}</span>
                  <span style={{ color: '#6B7280' }}>Payment Status:</span>
                  <span style={{
                    color: '#15803D',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    ✓ PAID & VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Dues Assessment Table */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>
                Statement & Assessment Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#1E3A8A', color: '#FFFFFF' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderRadius: '4px 0 0 0' }}>Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>Period</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, borderRadius: '0 4px 0 0' }}>Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.breakdown.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB', background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                      <td style={{ padding: '8px 12px', color: '#1F2937' }}>{row.item}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#4B5563' }}>{receipt.billingPeriod}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>
                        ₱{row.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr style={{ background: '#EFF6FF', borderTop: '2px solid #1E3A8A' }}>
                    <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 800, color: '#1E3A8A', fontSize: 13 }}>
                      TOTAL SETTLEMENT AMOUNT
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#15803D', fontSize: 16, fontFamily: 'monospace' }}>
                      {receipt.amountStr}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount in words */}
              <div style={{ marginTop: 6, fontSize: 11.5, color: '#4B5563', fontStyle: 'italic', paddingLeft: 4 }}>
                Amount in Words: <strong>{receipt.amountInWords || 'Three Thousand Philippine Pesos Only'}</strong>
              </div>
            </div>

            {/* Signatures & Official Seal Section */}
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 16, alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
              {/* Verification & Proof */}
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>Verified & Approved by:</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{receipt.approvedBy}</div>
                <div style={{ fontSize: 10.5, color: '#4B5563' }}>HOA Treasury & Collection Office</div>
                <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 2 }}>
                  Approval Timestamp: {receipt.approvedAt}
                </div>
              </div>

              {/* Official Seal / Stamp */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-block',
                    border: '2px dashed #15803D',
                    borderRadius: '50%',
                    padding: '8px 12px',
                    color: '#15803D',
                    textAlign: 'center',
                    transform: 'rotate(-4deg)',
                    background: 'rgba(34, 197, 94, 0.05)',
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    ★ NORTHRIDGE GROVE PH2 HOA ★
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.05em' }}>
                    PAID & VERIFIED
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>
                    TREASURY AUDIT PASSED
                  </div>
                </div>
              </div>

              {/* Security QR Verification */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 100 100" fill="#1E3A8A">
                    <rect x="10" y="10" width="25" height="25" fill="#1E3A8A" />
                    <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
                    <rect x="18" y="18" width="9" height="9" fill="#1E3A8A" />
                    
                    <rect x="65" y="10" width="25" height="25" fill="#1E3A8A" />
                    <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
                    <rect x="73" y="18" width="9" height="9" fill="#1E3A8A" />
                    
                    <rect x="10" y="65" width="25" height="25" fill="#1E3A8A" />
                    <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
                    <rect x="18" y="73" width="9" height="9" fill="#1E3A8A" />
                    
                    <rect x="42" y="15" width="12" height="8" fill="#1E3A8A" />
                    <rect x="40" y="30" width="20" height="8" fill="#1E3A8A" />
                    <rect x="45" y="45" width="15" height="15" fill="#1E3A8A" />
                    <rect x="65" y="45" width="10" height="12" fill="#1E3A8A" />
                    <rect x="42" y="70" width="14" height="18" fill="#1E3A8A" />
                    <rect x="62" y="68" width="25" height="20" fill="#1E3A8A" />
                  </svg>
                  <div style={{ fontSize: 9, color: '#6B7280', marginTop: 2, fontFamily: 'monospace' }}>
                    VALIDATED SECURE
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Payment Screenshot Proof if present */}
            {receipt.screenshotUrl && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px dashed #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: '#4B5563',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📎 Attached Verification Proof:</span>
                  <span style={{ fontWeight: 700, color: '#005CEE' }}>GCash Payment Confirmation Screenshot (Verified)</span>
                </div>
                <img
                  src={receipt.screenshotUrl}
                  alt="GCash Proof Thumbnail"
                  style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid #D1D5DB' }}
                />
              </div>
            )}

            {/* Statutory Footer */}
            <div style={{ marginTop: 14, fontSize: 10, color: '#6B7280', textAlign: 'center', borderTop: '1px solid #F3F4F6', paddingTop: 8 }}>
              This document serves as the official electronic acknowledgment of dues payment under Republic Act No. 9904 (Magna Carta for Homeowners and Homeowners' Associations). System Generated by NRG PH2 Portal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
