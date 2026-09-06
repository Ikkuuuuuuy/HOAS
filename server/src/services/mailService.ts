import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const GMAIL_USER = process.env.SMTP_GMAIL_USER || process.env.GMAIL_USER || '';
const GMAIL_PASS = process.env.SMTP_GMAIL_PASS || process.env.GMAIL_PASS || '';

let transporter: any = null;

if (GMAIL_USER && GMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });
    console.log(`[MailService] Gmail SMTP configured for ${GMAIL_USER}`);
  } catch (err) {
    console.error('[MailService] Failed to initialize Gmail SMTP transporter:', err);
  }
} else {
  console.log('[MailService] No Gmail credentials found in .env (SMTP_GMAIL_USER / SMTP_GMAIL_PASS). Running in simulation/logger mode.');
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendMailOptions): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
  console.log(`\n📧 [EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  if (text) console.log(`Content: ${text.slice(0, 100)}...`);

  if (!transporter) {
    console.log(`[MailService] Simulated dispatch successful (Set SMTP_GMAIL_USER & SMTP_GMAIL_PASS to dispatch via real Gmail SMTP).\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NRG PH2 HOA & Barangay Portal" <${GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[MailService] Successfully sent email to ${to}. MessageId: ${info.messageId}\n`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[MailService] Error sending email to ${to}:`, error.message);
    return { success: false, simulated: true };
  }
}

// Pre-built notification templates
export async function sendRegistrationPendingEmail(email: string, fullName: string, address: string) {
  return sendEmail({
    to: email,
    subject: 'Application Received - NRG PH2 HOA Portal',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f766e;">NRG PH2 Homeowners Association</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for registering on the NRG PH2 HOA & Barangay Cloud Portal for <strong>${address}</strong>.</p>
        <p>Your application and submitted Government ID are currently under review by the HOA Board of Directors. You will receive an email once your account has been verified and activated.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Northridge Grove Phase 2 HOA, Brgy. Tungkong Mangga, CSJDM, Bulacan.</p>
      </div>
    `,
    text: `Dear ${fullName},\nYour registration for ${address} is under review. You will be notified once activated.`,
  });
}

export async function sendRegistrationApprovedEmail(email: string, fullName: string) {
  return sendEmail({
    to: email,
    subject: 'Account Approved! Welcome to NRG PH2 HOA Portal',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #166534;">NRG PH2 Homeowners Association</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Great news! Your Homeowner Account has been <strong>approved and activated</strong> by the HOA Administration.</p>
        <p>You can now log in to access:</p>
        <ul>
          <li>Monthly Dues & Statement of Account</li>
          <li>Barangay & HOA Document Requests</li>
          <li>Court Reservations</li>
          <li>Subdivision Security Visitor Passes</li>
        </ul>
        <a href="http://localhost:5173/login" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Login to Portal</a>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Northridge Grove Phase 2 HOA, Brgy. Tungkong Mangga, CSJDM, Bulacan.</p>
      </div>
    `,
    text: `Dear ${fullName},\nYour account has been approved and activated! You may now log in to the portal.`,
  });
}

export async function sendDocumentStatusEmail(email: string, fullName: string, docType: string, status: string, remarks?: string) {
  return sendEmail({
    to: email,
    subject: `Document Request Update: ${docType} is ${status.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f766e;">NRG PH2 HOA & Barangay Portal</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Your request for <strong>${docType}</strong> has been updated to: <span style="font-weight: bold; color: ${status === 'approved' ? '#166534' : '#b91c1c'}">${status.toUpperCase()}</span>.</p>
        ${remarks ? `<p><strong>Remarks from Admin:</strong> ${remarks}</p>` : ''}
        <p>Please check your portal dashboard for tracking and digital copies.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Northridge Grove Phase 2 HOA, Brgy. Tungkong Mangga.</p>
      </div>
    `,
    text: `Dear ${fullName},\nYour document request for ${docType} has been updated to ${status}.`,
  });
}

export async function sendPaymentReceiptEmail(email: string, fullName: string, amount: number, refNo: string, channel: string) {
  return sendEmail({
    to: email,
    subject: `Payment Received: Php ${amount.toLocaleString()} (Ref: ${refNo})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f766e;">NRG PH2 HOA Dues Payment Receipt</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>We have recorded your payment submission:</p>
        <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Php ${amount.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Reference No:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${refNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Channel:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${channel.toUpperCase()}</td></tr>
        </table>
        <p>Your payment will be credited to your monthly ledger once validated by treasury.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Northridge Grove Phase 2 HOA, Brgy. Tungkong Mangga.</p>
      </div>
    `,
    text: `Dear ${fullName},\nPayment of Php ${amount.toLocaleString()} received with Ref: ${refNo}.`,
  });
}

