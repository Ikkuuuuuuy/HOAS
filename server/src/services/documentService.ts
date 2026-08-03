import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const HMAC_SECRET = process.env.QR_HMAC_SECRET || 'fallback-secret';

export function generateQRToken(docId: string, requesterId: string): string {
  const payload = `${docId}:${requesterId}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  return `QR-${docId.slice(0, 8).toUpperCase()}-${hmac.slice(0, 16).toUpperCase()}`;
}

const docTypeLabels: Record<string, string> = {
  barangay_clearance: 'BARANGAY CLEARANCE',
  cert_indigency: 'CERTIFICATE OF INDIGENCY',
  cert_residency: 'CERTIFICATE OF RESIDENCY',
};

export function generateCertificateHTML(doc: any): string {
  const label = docTypeLabels[doc.doc_type] || 'OFFICIAL CERTIFICATE';
  const issuedDate = new Date(doc.issued_at).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${label} - ${doc.requester_name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f0f4f8; display: flex; justify-content: center; padding: 40px 20px; }
  .certificate {
    background: #fff;
    width: 794px;
    min-height: 1123px;
    padding: 60px;
    border: 3px solid #1a5276;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .cert-border {
    border: 1px solid #1a5276;
    position: absolute;
    inset: 12px;
    pointer-events: none;
  }
  .header { text-align: center; margin-bottom: 40px; }
  .republic { font-size: 13px; color: #555; letter-spacing: 2px; text-transform: uppercase; }
  .brgy-name { font-size: 28px; font-weight: 700; color: #1a5276; margin: 8px 0; font-family: 'Crimson Text', serif; }
  .brgy-address { font-size: 13px; color: #666; }
  .divider { border: none; border-top: 2px solid #1a5276; margin: 20px 0; }
  .doc-title {
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    color: #1a5276;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-family: 'Crimson Text', serif;
    margin: 30px 0 40px;
  }
  .body-text { font-size: 15px; line-height: 2; color: #333; text-align: justify; margin-bottom: 20px; }
  .name-highlight { font-weight: 700; font-size: 17px; text-decoration: underline; color: #1a5276; }
  .info-grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 16px; margin: 24px 0; font-size: 14px; }
  .info-label { font-weight: 600; color: #555; }
  .info-value { color: #222; }
  .purpose-box { background: #eaf2fb; border-left: 4px solid #1a5276; padding: 12px 20px; margin: 20px 0; border-radius: 4px; }
  .purpose-label { font-size: 11px; font-weight: 700; color: #1a5276; text-transform: uppercase; letter-spacing: 1px; }
  .purpose-text { font-size: 15px; color: #333; margin-top: 4px; }
  .validity { font-size: 13px; color: #888; font-style: italic; margin-top: 20px; }
  .signature-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; }
  .sig-block { text-align: center; flex: 1; }
  .sig-line { border-top: 1px solid #333; margin: 0 20px 8px; }
  .sig-name { font-weight: 700; font-size: 14px; }
  .sig-title { font-size: 12px; color: #666; }
  .qr-section { position: absolute; bottom: 60px; right: 60px; text-align: center; }
  .qr-box { width: 80px; height: 80px; background: #f5f5f5; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #999; word-break: break-all; padding: 4px; line-height: 1.2; }
  .qr-label { font-size: 9px; color: #999; margin-top: 4px; }
  .or-number { font-size: 12px; color: #888; margin-top: 40px; }
  .seal { width: 90px; height: 90px; border: 3px solid #1a5276; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #1a5276; text-align: center; font-weight: 700; margin: 0 auto 10px; }
  @media print { body { background: white; padding: 0; } .certificate { box-shadow: none; } }
</style>
</head>
<body>
<div class="certificate">
  <div class="cert-border"></div>
  <div class="header">
    <div class="republic">Republic of the Philippines</div>
    <div class="republic">City / Municipality</div>
    <div class="brgy-name">BARANGAY 174</div>
    <div class="brgy-address">Caloocan City, Metro Manila</div>
  </div>
  <hr class="divider">
  <div class="doc-title">${label}</div>

  <p class="body-text">
    TO WHOM IT MAY CONCERN:
  </p>
  <p class="body-text">
    This is to certify that <span class="name-highlight">${doc.requester_name.toUpperCase()}</span>,
    ${doc.civil_status ? `${doc.civil_status}, ` : ''}
    ${doc.birthdate ? `born on ${new Date(doc.birthdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}, ` : ''}
    is a bona fide resident of this barangay with address at:
  </p>

  <div class="info-grid">
    <span class="info-label">Address:</span>
    <span class="info-value">${doc.address || 'On file with the Barangay'}</span>
    <span class="info-label">Document Type:</span>
    <span class="info-value">${label}</span>
    <span class="info-label">Date Issued:</span>
    <span class="info-value">${issuedDate}</span>
    ${doc.fee > 0 ? `<span class="info-label">Official Receipt:</span><span class="info-value">₱${doc.fee}.00 — PAID</span>` : ''}
  </div>

  <div class="purpose-box">
    <div class="purpose-label">Purpose of this Certificate</div>
    <div class="purpose-text">${doc.purpose}</div>
  </div>

  ${doc.doc_type === 'cert_indigency' ? `
  <p class="body-text">
    This further certifies that the above-named person belongs to an <strong>indigent family</strong> whose income is below the poverty threshold as defined by the National Anti-Poverty Commission (NAPC).
  </p>` : ''}

  <p class="body-text">
    This certification is issued upon the request of the above-named person for whatever legal purpose it may serve.
  </p>

  <p class="validity">Valid for ninety (90) days from date of issue unless stated otherwise.</p>

  <div class="or-number">OR No.: HOA-BRGY-${doc.id.slice(0, 8).toUpperCase()} &nbsp;|&nbsp; Doc ID: ${doc.id}</div>

  <div class="signature-section" style="margin-top: 80px;">
    <div class="sig-block">
      <div class="seal">BARANGAY<br>SEAL</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">KAGAWAD MARIA REYES</div>
      <div class="sig-title">Barangay Official</div>
      <div class="sig-title">Barangay 174, Caloocan City</div>
    </div>
  </div>

  <div class="qr-section">
    <div class="qr-box">${doc.qr_token}</div>
    <div class="qr-label">Scan to Verify</div>
  </div>
</div>
</body>
</html>`;
}
