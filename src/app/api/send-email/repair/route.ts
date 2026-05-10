import { NextRequest, NextResponse } from 'next/server';
import { createTransporter, ADMIN_EMAIL, htmlWrapper, detailRow } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      requestId, userName, userEmail,
      deviceType, brand, issueType, issueDescription, preferredDate,
    } = data;

    const transporter = createTransporter();
    const formattedDate = preferredDate
      ? new Date(preferredDate).toLocaleDateString('en-IN', { dateStyle: 'long' })
      : 'Not specified';

    // ── User confirmation email ─────────────────────────────────────────
    const userBody = `
      <h2 style="color:#f4f6ff;font-size:22px;font-weight:700;margin:0 0 8px;">
        ✅ Repair Request Received!
      </h2>
      <p style="color:#8892b0;font-size:14px;margin:0 0 28px;line-height:1.7;">
        Hi <strong style="color:#f4f6ff;">${userName}</strong>, your repair request has been successfully submitted.
        Our team will review it and contact you within <strong style="color:#00d4ff;">24 hours</strong>.
      </p>

      <!-- Request ID badge -->
      <div style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:10px;padding:14px 20px;margin-bottom:28px;display:inline-block;">
        <span style="color:#8892b0;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Request ID</span><br/>
        <span style="color:#00d4ff;font-size:16px;font-weight:700;font-family:monospace;">${requestId}</span>
      </div>

      <h3 style="color:#f4f6ff;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px;color:#8892b0;">
        Request Details
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${detailRow('Device Type', deviceType)}
        ${detailRow('Brand / Model', brand)}
        ${detailRow('Issue Type', issueType)}
        ${detailRow('Preferred Date', formattedDate)}
        ${detailRow('Description', issueDescription.length > 100 ? issueDescription.slice(0, 100) + '...' : issueDescription)}
      </table>

      <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:18px 20px;margin-bottom:28px;">
        <p style="color:#a78bfa;font-size:13px;font-weight:600;margin:0 0 6px;">📱 What happens next?</p>
        <p style="color:#8892b0;font-size:13px;margin:0;line-height:1.6;">
          1. Our technician will review your request<br/>
          2. We'll contact you at <strong style="color:#f4f6ff;">${userEmail}</strong> to confirm the appointment<br/>
          3. Bring your device on the preferred date (or we'll schedule an alternative)
        </p>
      </div>

      <a href="#" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
        Track Your Request →
      </a>
    `;

    // ── Admin notification email ─────────────────────────────────────────
    const adminBody = `
      <h2 style="color:#f4f6ff;font-size:22px;font-weight:700;margin:0 0 8px;">
        🔧 New Repair Request
      </h2>
      <p style="color:#8892b0;font-size:14px;margin:0 0 24px;">
        A new repair request has been submitted. Review the details below.
      </p>

      <div style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);border-radius:10px;padding:14px 20px;margin-bottom:24px;">
        <span style="color:#8892b0;font-size:12px;">Request ID: </span>
        <span style="color:#00d4ff;font-weight:700;font-family:monospace;">${requestId}</span>
      </div>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Customer Info</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${detailRow('Name', userName)}
        ${detailRow('Email', userEmail)}
      </table>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Device & Issue</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${detailRow('Device Type', deviceType)}
        ${detailRow('Brand / Model', brand)}
        ${detailRow('Issue Type', issueType)}
        ${detailRow('Preferred Date', formattedDate)}
      </table>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Full Description</h3>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px;color:#f4f6ff;font-size:13px;line-height:1.7;">
        ${issueDescription || 'No description provided.'}
      </div>
    `;

    await transporter.sendMail({
      from: `"TechServe Hub" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Repair Request Received — ${requestId}`,
      html: htmlWrapper('Repair Request Confirmed', '#00d4ff', userBody),
    });

    await transporter.sendMail({
      from: `"TechServe Hub" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔧 New Repair Request — ${deviceType} by ${userName}`,
      html: htmlWrapper('New Repair Request', '#00d4ff', adminBody),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Repair email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
