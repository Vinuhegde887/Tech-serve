import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD!;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hegdevinayak127@gmail.com';

export function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

// ── Shared HTML wrapper ────────────────────────────────────────────────────
export function htmlWrapper(title: string, accentColor: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#08090f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:2px;border-radius:16px 16px 0 0;">
            </td>
          </tr>
          <tr>
            <td style="background:#0f1118;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
              <!-- Logo Bar -->
              <div style="background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.1));padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#00d4ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#00d4ff;">
                  ⚡ TechServe Hub
                </div>
                <div style="color:#8892b0;font-size:13px;margin-top:4px;">Student Technology Services</div>
              </div>
              <!-- Body -->
              <div style="padding:36px;">
                ${body}
              </div>
              <!-- Footer -->
              <div style="padding:24px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="color:#4a5568;font-size:12px;margin:0;">TechServe Hub · College Technology Services</p>
                <p style="color:#4a5568;font-size:12px;margin:6px 0 0;">This is an automated email. Please do not reply to this address.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Reusable detail row ────────────────────────────────────────────────────
export function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <span style="color:#8892b0;font-size:13px;min-width:140px;display:inline-block;">${label}</span>
        <span style="color:#f4f6ff;font-size:13px;font-weight:500;">${value || '—'}</span>
      </td>
    </tr>
  `;
}
