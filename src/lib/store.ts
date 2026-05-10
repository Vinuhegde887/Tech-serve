import { User, RepairRequest, PrintOrder } from './types';

// ── Keys ─────────────────────────────────────────────────────────────────
const KEYS = {
  users: 'tsh_users',
  currentUser: 'tsh_current_user',
  repairs: 'tsh_repair_requests',
  prints: 'tsh_print_orders',
};

// ── Helpers ───────────────────────────────────────────────────────────────
const get = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
};

const set = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// ── Seed default admin ────────────────────────────────────────────────────
export const seedDefaultAdmin = () => {
  if (typeof window === 'undefined') return;
  const users = get<User[]>(KEYS.users, []);
  if (!users.find((u) => u.role === 'admin')) {
    const admin: User = {
      id: 'admin-001',
      name: 'Admin',
      email: 'admin@techserve.edu',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    set(KEYS.users, [...users, admin]);
    // Store password separately (demo only)
    localStorage.setItem('tsh_pwd_admin-001', 'Admin@123');
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authStore = {
  login: (email: string, password: string): User | null => {
    const users = get<User[]>(KEYS.users, []);
    const user = users.find((u) => u.email === email);
    if (!user) return null;
    const storedPwd = localStorage.getItem(`tsh_pwd_${user.id}`);
    if (storedPwd !== password) return null;
    set(KEYS.currentUser, user);
    return user;
  },

  register: (name: string, email: string, password: string): User | null => {
    const users = get<User[]>(KEYS.users, []);
    if (users.find((u) => u.email === email)) return null;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    set(KEYS.users, [...users, newUser]);
    localStorage.setItem(`tsh_pwd_${newUser.id}`, password);
    set(KEYS.currentUser, newUser);
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(KEYS.currentUser);
  },

  getCurrentUser: (): User | null => {
    return get<User | null>(KEYS.currentUser, null);
  },

  getAllUsers: (): User[] => get<User[]>(KEYS.users, []),
};

// ── Repair Requests ───────────────────────────────────────────────────────
export const repairStore = {
  getAll: (): RepairRequest[] => get<RepairRequest[]>(KEYS.repairs, []),

  getByUser: (userId: string): RepairRequest[] =>
    repairStore.getAll().filter((r) => r.userId === userId),

  create: (data: Omit<RepairRequest, 'id' | 'status' | 'adminNotes' | 'createdAt'>): RepairRequest => {
    const req: RepairRequest = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };
    const all = repairStore.getAll();
    set(KEYS.repairs, [...all, req]);
    return req;
  },

  update: (id: string, patch: Partial<RepairRequest>) => {
    const all = repairStore.getAll().map((r) => (r.id === id ? { ...r, ...patch } : r));
    set(KEYS.repairs, all);
  },

  delete: (id: string) => {
    set(KEYS.repairs, repairStore.getAll().filter((r) => r.id !== id));
  },
};

// ── Print Orders ──────────────────────────────────────────────────────────
export const printStore = {
  getAll: (): PrintOrder[] => get<PrintOrder[]>(KEYS.prints, []),

  getByUser: (userId: string): PrintOrder[] =>
    printStore.getAll().filter((p) => p.userId === userId),

  create: (data: Omit<PrintOrder, 'id' | 'status' | 'adminNotes' | 'createdAt'>): PrintOrder => {
    const order: PrintOrder = {
      ...data,
      id: `prt-${Date.now()}`,
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };
    const all = printStore.getAll();
    set(KEYS.prints, [...all, order]);
    return order;
  },

  update: (id: string, patch: Partial<PrintOrder>) => {
    const all = printStore.getAll().map((p) => (p.id === id ? { ...p, ...patch } : p));
    set(KEYS.prints, all);
  },

  delete: (id: string) => {
    set(KEYS.prints, printStore.getAll().filter((p) => p.id !== id));
  },
};
