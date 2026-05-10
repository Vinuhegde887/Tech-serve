// ── Client-side helpers to POST to our API routes ─────────────────────────
// Called from service pages after a request is created in localStorage.

export interface RepairEmailData {
  requestId: string;
  userName: string;
  userEmail: string;
  deviceType: string;
  brand: string;
  issueType: string;
  issueDescription: string;
  preferredDate: string;
}

export interface PrintEmailData {
  orderId: string;
  userName: string;
  userEmail: string;
  fileName: string;
  filamentType: string;
  infillPercent: number;
  colorChoice: string;
  volumeCm3: number;
  estimatedTimeHrs: number;
  priceInr: number;
  notes: string;
}

export async function sendRepairEmail(data: RepairEmailData): Promise<void> {
  try {
    await fetch('/api/send-email/repair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    // Non-blocking — don't crash the page if email fails
    console.warn('Email notification failed:', err);
  }
}

export async function sendPrintEmail(data: PrintEmailData): Promise<void> {
  try {
    await fetch('/api/send-email/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Email notification failed:', err);
  }
}
