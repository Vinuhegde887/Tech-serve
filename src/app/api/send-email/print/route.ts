import { NextRequest, NextResponse } from 'next/server';
import { createTransporter, ADMIN_EMAIL, htmlWrapper, detailRow } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      orderId, userName, userEmail,
      fileName, filamentType, infillPercent,
      colorChoice, volumeCm3, estimatedTimeHrs, priceInr, notes,
    } = data;

    const transporter = createTransporter();

    // ── User confirmation email ─────────────────────────────────────────
    const userBody = `
      <h2 style="color:#f4f6ff;font-size:22px;font-weight:700;margin:0 0 8px;">
        🎉 3D Print Order Placed!
      </h2>
      <p style="color:#8892b0;font-size:14px;margin:0 0 28px;line-height:1.7;">
        Hi <strong style="color:#f4f6ff;">${userName}</strong>! Your 3D print order has been received.
        We'll review it and start printing once approved. You'll be notified at every stage.
      </p>

      <!-- Order ID badge -->
      <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:14px 20px;margin-bottom:28px;display:inline-block;">
        <span style="color:#8892b0;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Order ID</span><br/>
        <span style="color:#f97316;font-size:16px;font-weight:700;font-family:monospace;">${orderId}</span>
      </div>

      <!-- Price highlight -->
      <div style="background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(250,204,21,0.08));border:1px solid rgba(249,115,22,0.25);border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
        <p style="color:#8892b0;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">Estimated Total</p>
        <p style="color:#f97316;font-size:32px;font-weight:800;margin:0;">₹${priceInr}</p>
        <p style="color:#8892b0;font-size:13px;margin:8px 0 0;">⏱️ Estimated print time: <strong style="color:#f4f6ff;">${estimatedTimeHrs} hours</strong></p>
      </div>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Order Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${detailRow('File Name', fileName)}
        ${detailRow('Filament', filamentType)}
        ${detailRow('Color', colorChoice)}
        ${detailRow('Infill Density', `${infillPercent}%`)}
        ${detailRow('Print Volume', `${volumeCm3} cm³`)}
        ${notes ? detailRow('Special Notes', notes) : ''}
      </table>

      <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:18px 20px;margin-bottom:28px;">
        <p style="color:#22c55e;font-size:13px;font-weight:600;margin:0 0 6px;">📦 Order Status Flow</p>
        <p style="color:#8892b0;font-size:13px;margin:0;line-height:1.7;">
          <strong style="color:#f4f6ff;">Pending</strong> → <strong style="color:#f4f6ff;">Approved</strong> → <strong style="color:#f4f6ff;">Printing</strong> → <strong style="color:#22c55e;">Completed</strong>
        </p>
      </div>

      <a href="#" style="display:inline-block;background:linear-gradient(135deg,#f97316,#facc15);color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">
        Track Your Order →
      </a>
    `;

    // ── Admin notification email ─────────────────────────────────────────
    const adminBody = `
      <h2 style="color:#f4f6ff;font-size:22px;font-weight:700;margin:0 0 8px;">
        🖨️ New 3D Print Order
      </h2>
      <p style="color:#8892b0;font-size:14px;margin:0 0 24px;">
        A new print order has been submitted and is awaiting your approval.
      </p>

      <div style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:14px 20px;margin-bottom:24px;">
        <span style="color:#8892b0;font-size:12px;">Order ID: </span>
        <span style="color:#f97316;font-weight:700;font-family:monospace;">${orderId}</span>
        &nbsp;&nbsp;
        <span style="color:#8892b0;font-size:12px;">Amount: </span>
        <span style="color:#facc15;font-weight:700;">₹${priceInr}</span>
      </div>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Customer Info</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${detailRow('Name', userName)}
        ${detailRow('Email', userEmail)}
      </table>

      <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Print Specifications</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${detailRow('File Name', fileName)}
        ${detailRow('Filament', filamentType)}
        ${detailRow('Color', colorChoice)}
        ${detailRow('Infill Density', `${infillPercent}%`)}
        ${detailRow('Print Volume', `${volumeCm3} cm³`)}
        ${detailRow('Est. Print Time', `${estimatedTimeHrs} hrs`)}
        ${detailRow('Price', `₹${priceInr}`)}
      </table>

      ${notes ? `
        <h3 style="color:#8892b0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 12px;">Special Notes</h3>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px;color:#f4f6ff;font-size:13px;line-height:1.7;">
          ${notes}
        </div>
      ` : ''}
    `;

    await transporter.sendMail({
      from: `"TechServe Hub" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `🎉 3D Print Order Placed — ${orderId}`,
      html: htmlWrapper('Print Order Confirmed', '#f97316', userBody),
    });

    await transporter.sendMail({
      from: `"TechServe Hub" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🖨️ New Print Order — ${fileName} by ${userName}`,
      html: htmlWrapper('New Print Order', '#f97316', adminBody),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Print email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
