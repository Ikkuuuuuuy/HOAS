import React, { useState } from 'react';

export interface PendingPaymentData {
  id: string;
  payorName: string;
  propertyAddress: string;
  amount: string;
  amountNumber: number;
  billingPeriod: string;
  refNo: string;
  senderPhone: string;
  dateStr: string;
  screenshotUrl: string;
}

interface Props {
  data: PendingPaymentData;
  onApprove: (data: PendingPaymentData) => void;
  onReject: (data: PendingPaymentData) => void;
  onClose: () => void;
}

export default function AdminPaymentVerificationModal({
  data,
  onApprove,
  onReject,
  onClose,
}: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApprove(data);
      setIsProcessing(false);
    }, 400);
  };

  const handleReject = () => {
    if (window.confirm('Are you sure you want to reject this payment proof? The bill will return to unpaid.')) {
      onReject(data);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box"
        style={{
          maxWidth: 620,
          width: '95%',
          borderRadius: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          padding: '24px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.2s ease',
          overflowY: 'auto',
          maxHeight: '92vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0, 92, 238, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005CEE', fontSize: 18, fontWeight: 900 }}>
              🛡️
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                HOA Treasury Payment Verification
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Review proof of payment submitted by resident before marking as Paid
              </div>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Resident Summary Box */}
        <div
          style={{
            background: 'var(--bg-elevated, var(--bg-hover))',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                Homeowner
              </div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 15, marginTop: 2 }}>
                {data.payorName}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 1 }}>
                {data.propertyAddress}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                Submitted Amount
              </div>
              <div style={{ fontWeight: 900, color: '#10B981', fontSize: 20, marginTop: 2 }}>
                {data.amount}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {data.billingPeriod} Dues
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>GCash Ref: </span>
              <strong style={{ color: '#005CEE', fontFamily: 'monospace', fontSize: 13 }}>{data.refNo}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Sender Phone: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{data.senderPhone}</strong>
            </div>
          </div>
        </div>

        {/* Uploaded Screenshot Proof */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label font-bold" style={{ margin: 0, fontSize: 12.5, color: 'var(--text-primary)' }}>
              Attached GCash Payment Screenshot
            </label>
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              style={{
                background: 'none',
                border: 'none',
                color: '#005CEE',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isZoomed ? 'Normal View' : 'Zoom In / Full View'}
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 12,
              background: '#0F172A',
              padding: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              maxHeight: isZoomed ? '500px' : '260px',
              overflowY: 'auto',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setIsZoomed(!isZoomed)}
            title="Click to toggle zoom"
          >
            {data.screenshotUrl ? (
              <img
                src={data.screenshotUrl}
                alt="Payment proof screenshot"
                style={{
                  maxWidth: '100%',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  display: 'inline-block',
                }}
              />
            ) : (
              <div style={{ color: '#94A3B8', padding: '40px 0', fontSize: 13 }}>
                No screenshot uploaded
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
            Click on screenshot to toggle zoom. Verify reference number &amp; amount match before approving.
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={handleReject}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 9999,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ Reject Proof
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ borderRadius: 9999, padding: '9px 18px', fontSize: 13, fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApprove}
              style={{
                background: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                padding: '9px 24px',
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>✓</span> {isProcessing ? 'Issuing Official Receipt...' : 'Approve & Mark as Paid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
