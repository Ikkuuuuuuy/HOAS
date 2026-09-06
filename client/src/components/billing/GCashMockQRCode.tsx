import React from 'react';

interface Props {
  amount: number;
}

export default function GCashMockQRCode({ amount }: Props) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: 'linear-gradient(145deg, #005CEE 0%, #0076FE 100%)',
        padding: '20px',
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0, 92, 238, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005CEE', fontWeight: 900, fontSize: 14 }}>
            G
          </div>
          <span style={{ fontWeight: 800, letterSpacing: '-0.2px', fontSize: 16 }}>GCash QR</span>
        </div>
        <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.04em' }}>
          OFFICIAL MERCHANT
        </span>
      </div>

      {/* QR Box Container */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '16px',
          borderRadius: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* SVG QR Code Pattern */}
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="180" height="180" viewBox="0 0 100 100" fill="#005CEE">
            {/* Top-Left Finder */}
            <rect x="5" y="5" width="28" height="28" rx="4" fill="#005CEE" />
            <rect x="10" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="14" y="14" width="10" height="10" rx="1" fill="#005CEE" />

            {/* Top-Right Finder */}
            <rect x="67" y="5" width="28" height="28" rx="4" fill="#005CEE" />
            <rect x="72" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="76" y="14" width="10" height="10" rx="1" fill="#005CEE" />

            {/* Bottom-Left Finder */}
            <rect x="5" y="67" width="28" height="28" rx="4" fill="#005CEE" />
            <rect x="10" y="72" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="14" y="76" width="10" height="10" rx="1" fill="#005CEE" />

            {/* Alignment / Timing Patterns */}
            <rect x="36" y="8" width="6" height="6" fill="#005CEE" />
            <rect x="46" y="8" width="6" height="6" fill="#005CEE" />
            <rect x="56" y="8" width="6" height="6" fill="#005CEE" />

            <rect x="36" y="20" width="8" height="6" fill="#005CEE" />
            <rect x="48" y="20" width="6" height="6" fill="#005CEE" />
            <rect x="58" y="20" width="6" height="6" fill="#005CEE" />

            <rect x="8" y="38" width="6" height="6" fill="#005CEE" />
            <rect x="8" y="48" width="6" height="6" fill="#005CEE" />
            <rect x="8" y="58" width="6" height="6" fill="#005CEE" />

            <rect x="20" y="38" width="6" height="8" fill="#005CEE" />
            <rect x="20" y="52" width="8" height="6" fill="#005CEE" />

            {/* Matrix Data Density */}
            <rect x="38" y="38" width="8" height="8" fill="#005CEE" />
            <rect x="54" y="38" width="8" height="8" fill="#005CEE" />
            <rect x="70" y="38" width="6" height="6" fill="#005CEE" />
            <rect x="82" y="38" width="10" height="6" fill="#005CEE" />

            <rect x="38" y="54" width="8" height="6" fill="#005CEE" />
            <rect x="54" y="54" width="6" height="8" fill="#005CEE" />
            <rect x="68" y="50" width="8" height="8" fill="#005CEE" />
            <rect x="84" y="52" width="8" height="8" fill="#005CEE" />

            <rect x="38" y="70" width="10" height="8" fill="#005CEE" />
            <rect x="54" y="70" width="8" height="6" fill="#005CEE" />
            <rect x="68" y="66" width="14" height="6" fill="#005CEE" />
            <rect x="70" y="78" width="8" height="14" fill="#005CEE" />
            <rect x="84" y="76" width="8" height="16" fill="#005CEE" />
            <rect x="42" y="84" width="18" height="8" fill="#005CEE" />
          </svg>

          {/* Centered GCash Emblem */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#005CEE',
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            G
          </div>
        </div>

        {/* Merchant & Account Info */}
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>
            NORTHRIDGE GROVE PH2 HOA
          </div>
          <div style={{ fontSize: 12, color: '#005CEE', fontWeight: 800, marginTop: 1, fontFamily: 'monospace' }}>
            0917-552-8821
          </div>
        </div>
      </div>

      {/* Target Amount */}
      <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 10, width: '100%' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>
          Exact Amount to Send
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>
          Php {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Scan Instructions */}
      <div style={{ marginTop: 12, fontSize: 11.5, lineHeight: 1.4, opacity: 0.95, textAlign: 'left', width: '100%', paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
          <span>1.</span>
          <span>Open your <strong>GCash App</strong> and tap <strong>Scan QR</strong> (or Send to 0917-552-8821).</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
          <span>2.</span>
          <span>Enter exact payment of <strong>Php {amount.toLocaleString()}</strong>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span>3.</span>
          <span>Save/take a <strong>Screenshot</strong> of the successful transaction to upload below.</span>
        </div>
      </div>
    </div>
  );
}
