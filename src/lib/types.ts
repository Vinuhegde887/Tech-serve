// ── Auth ────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// ── Repair Requests ─────────────────────────────────────────────────────
export type RepairStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface RepairRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  deviceType: string;
  brand: string;
  issueType: string;
  issueDescription: string;
  preferredDate: string;
  status: RepairStatus;
  adminNotes: string;
  createdAt: string;
}

// ── Print Orders ─────────────────────────────────────────────────────────
export type PrintStatus = 'pending' | 'approved' | 'printing' | 'completed' | 'cancelled';
export type FilamentType = 'PLA' | 'ABS' | 'PETG' | 'TPU';

export interface PrintOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fileName: string;
  fileSize: number;
  filamentType: FilamentType;
  infillPercent: number;
  volumeCm3: number;
  estimatedTimeHrs: number;
  priceInr: number;
  colorChoice: string;
  notes: string;
  status: PrintStatus;
  adminNotes: string;
  createdAt: string;
}
