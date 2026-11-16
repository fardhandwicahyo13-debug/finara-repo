// API client with authentication state management
// NOTE: In Demo mode, this client serves from local mock storage.
// When the backend is connected, set DEMO_MODE = false to fetch from the API.

import type {
  LoginResponse,
  User,
  UserPreference,
  DashboardSnapshot,
  Wallet,
  WalletType,
  TransactionType,
  Transaction,
  LedgerEntry,
  Budget,
  SavingsGoal,
  SavingsContribution,
  Bill,
  NotificationItem,
} from '@/types';

const DEMO_MODE = true; // Set to false when backend is ready

const API_BASE = '/api/v1';

const TOKEN_KEY = 'finara_token';
const USER_KEY = 'finara_user';
const PREFERENCES_KEY = 'finara_preferences';

interface StoredUser {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  country: string;
  city: string;
  address: string | null;
  preferredLanguage: string;
  preferredCurrency: string;
  timeZone: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface StoredPrefs {
  language: string;
  currency: string;
  timeZone: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'system';
  notificationSettings: Record<string, boolean>;
}

function getToken(): string | null {
  if (DEMO_MODE) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (DEMO_MODE) return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function getStoredUser(): StoredUser | null {
  if (DEMO_MODE) return null;
  return localStorage.getItem(USER_KEY)
    ? JSON.parse(localStorage.getItem(USER_KEY)!)
    : null;
}

function setStoredUser(user: StoredUser | null) {
  if (DEMO_MODE) return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function getStoredPrefs(): StoredPrefs | null {
  if (DEMO_MODE) return null;
  return localStorage.getItem(PREFERENCES_KEY)
    ? JSON.parse(localStorage.getItem(PREFERENCES_KEY)!)
    : null;
}

function setStoredPrefs(prefs: StoredPrefs | null) {
  if (DEMO_MODE) return;
  if (prefs) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  else localStorage.removeItem(PREFERENCES_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { headers[k] = v; });
    } else if (typeof options.headers === 'object') {
      Object.assign(headers, options.headers as Record<string, string>);
    }
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (!DEMO_MODE) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Demo-mode mock storage (simulates an authenticated backend session)
const demoUsers = new Map<string, any>();
const demoWallets = new Map<string, any>();
const demoEntries = new Map<string, any>();
const demoBudgets = new Map<string, any>();
const demoGoals = new Map<string, any>();
const demoBills = new Map<string, any>();
const demoNotifications = new Map<string, any>();
let demoUserId = 'user_demo_001';
let demoNextId = 1000;

function getDemoUser(id: string) {
  if (demoUsers.has(id)) return demoUsers.get(id);
  const u: any = {
    id: 'user_demo_001',
    fullName: 'Budi Santoso',
    displayName: 'Budi',
    email: 'budi@example.com',
    phoneNumber: '0812-3456-7890',
    dateOfBirth: '1990-05-15',
    country: 'Indonesia',
    city: 'Jakarta',
    address: 'Jl. Sudirman Kav. 1',
    preferredLanguage: 'id',
    preferredCurrency: 'IDR',
    timeZone: 'Asia/Jakarta',
    avatarUrl: null,
    createdAt: '2024-01-10T00:00:00Z',
  };
  demoUsers.set(id, u);
  return u;
}

function getDemoPrefs(): StoredPrefs {
  return {
    language: 'id',
    currency: 'IDR',
    timeZone: 'Asia/Jakarta',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'id-ID',
    theme: 'system' as 'light' | 'dark' | 'system',
    notificationSettings: { paymentReminders: true, billReminders: true, budgetAlerts: true, accountAlerts: true },
  };
}

function getDemoWalletsForUser(userId: string): any[] {
  const created = demoWallets.size === 0;
  if (created) {
    const wallets = [
      { id: 'wallet_cash', name: 'Cash Wallet', type: 'cash', description: null, currency: 'IDR', balance: 4520000, createdAt: '2024-01-10T00:00:00Z' },
      { id: 'wallet_bank', name: 'BCA Bank', type: 'bank', description: 'Tabungan utama', currency: 'IDR', balance: 23500000, createdAt: '2024-01-12T00:00:00Z' },
      { id: 'wallet_ewallet', name: 'Ovo', type: 'e-wallet', description: null, currency: 'IDR', balance: 750000, createdAt: '2024-03-01T00:00:00Z' },
    ];
    wallets.forEach((w: any) => demoWallets.set(w.id, { ...w, ownerId: userId }));
  }
  return Array.from(demoWallets.values())
    .filter((w: any) => w.ownerId === userId)
    .map((w: any) => ({ ...w, _balanceSource: 'derived' }));
}

function getDemoEntriesForUser(userId: string): any[] {
  const created = demoEntries.size === 0;
  if (created) {
    const entries: any[] = [
      { id: 'e1', walletId: 'wallet_bank', type: 'income', amount: 8500000, category: 'Gaji', description: 'Gaji bulan Maret', date: '2026-03-15', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_gaji_001', createdAt: '2026-03-15T00:00:00Z' },
      { id: 'e2', walletId: 'wallet_bank', type: 'expense', amount: 1500000, category: 'Transportasi', description: 'GPS Jalan Tol', date: '2026-03-16', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_transport_001', createdAt: '2026-03-16T00:00:00Z' },
      { id: 'e3', walletId: 'wallet_bank', type: 'expense', amount: 3500000, category: 'Sembako', description: 'Belanja bulanan', date: '2026-03-18', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_sembako_001', createdAt: '2026-03-18T00:00:00Z' },
      { id: 'e4', walletId: 'wallet_cash', type: 'expense', amount: 200000, category: 'Makan di luar', description: 'Nak diri hari Jumat', date: '2026-03-20', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_makan_001', createdAt: '2026-03-20T00:00:00Z' },
      { id: 'e5', walletId: 'wallet_bank', type: 'expense', amount: 800000, category: 'Listrik', description: 'Tagihan listrik', date: '2026-03-22', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_listrik_001', createdAt: '2026-03-22T00:00:00Z' },
      { id: 'e6', walletId: 'wallet_bank', type: 'expense', amount: 1200000, category: 'Internet', description: 'Paket fiber', date: '2026-03-23', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_internet_001', createdAt: '2026-03-23T00:00:00Z' },
      { id: 'e7', walletId: 'wallet_bank', type: 'expense', amount: 500000, category: 'Belanja', description: 'Toko online', date: '2026-03-25', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_toko_001', createdAt: '2026-03-25T00:00:00Z' },
      { id: 'e8', walletId: 'wallet_ewallet', type: 'income', amount: 2000000, category: 'Freelance', description: 'Proyek web', date: '2026-03-27', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_freelance_001', createdAt: '2026-03-27T00:00:00Z' },
      { id: 'e9', walletId: 'wallet_ewallet', type: 'expense', amount: 350000, category: 'Belanja', description: 'Sawar Fokker', date: '2026-03-28', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_fokker_001', createdAt: '2026-03-28T00:00:00Z' },
      { id: 'e10', walletId: 'wallet_bank', type: 'expense', amount: 450000, category: 'Komunikasi', description: 'Pulse and data', date: '2026-03-29', note: null, sourceWalletId: null, destinationWalletId: null, idempotencyKey: 'idem_kom_001', createdAt: '2026-03-29T00:00:00Z' },
    ];
    entries.forEach((e: any) => demoEntries.set(e.id, e));
  }
  return Array.from(demoEntries.values())
    .filter((e: any) => e.walletId && demoWallets.has(e.walletId) && demoWallets.get(e.walletId).ownerId === userId)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getDemoBudgetsForUser(userId: string): any[] {
  const created = demoBudgets.size === 0;
  if (created) {
    const budgets = [
      { id: 'b1', ownerId: userId, month: '2026-03', category: 'Sembako', limit: 5000000, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
      { id: 'b2', ownerId: userId, month: '2026-03', category: 'Transportasi', limit: 2000000, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
      { id: 'b3', ownerId: userId, month: '2026-03', category: 'Komunikasi', limit: 1000000, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
      { id: 'b4', ownerId: userId, month: '2026-03', category: 'Listrik & Air', limit: 1500000, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
      { id: 'b5', ownerId: userId, month: '2026-03', category: 'Belanja', limit: 3000000, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
    ];
    budgets.forEach((b: any) => demoBudgets.set(b.id, b));
  }
  return Array.from(demoBudgets.values()).filter((b: any) => b.ownerId === userId);
}

function getDemoGoalsForUser(userId: string): any[] {
  const created = demoGoals.size === 0;
  if (created) {
    const goals = [
      { id: 'g1', ownerId: userId, name: 'Tabung Darurat', targetAmount: 10000000, currentAmount: 5200000, targetDate: '2026-12-31', description: 'Tabiat 3-6 bulan pengeluaran', icon: null, status: 'active', createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' },
      { id: 'g2', ownerId: userId, name: 'Voyage Eropa', targetAmount: 25000000, currentAmount: 18000000, targetDate: '2026-08-31', description: 'Tiket + hotel Bangkok', icon: null, status: 'active', createdAt: '2025-11-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
      { id: 'g3', ownerId: userId, name: 'Cashback Kecil', targetAmount: 500000, currentAmount: 50000, targetDate: '2026-06-30', description: 'Simpan bonus flap', icon: null, status: 'active', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
    ];
    goals.forEach((g: any) => demoGoals.set(g.id, g));
  }
  return Array.from(demoGoals.values()).filter((g: any) => g.ownerId === userId);
}

function getDemoBillsForUser(userId: string): any[] {
  const created = demoBills.size === 0;
  if (created) {
    const bills = [
      { id: 'bl1', ownerId: userId, name: 'Listrik PLN', amount: 350000, currency: 'IDR', dueDate: '2026-03-22', frequency: 'monthly', category: 'Listrik & Air', walletId: 'wallet_bank', status: 'paid', paidAt: '2026-03-22T00:00:00Z', createdAt: '2026-01-20T00:00:00Z' },
      { id: 'bl2', ownerId: userId, name: 'Internet', amount: 1200000, currency: 'IDR', dueDate: '2026-03-23', frequency: 'monthly', category: 'Komunikasi', walletId: 'wallet_bank', status: 'paid', paidAt: '2026-03-23T00:00:00Z', createdAt: '2026-01-20T00:00:00Z' },
      { id: 'bl3', ownerId: userId, name: 'Karyawan', amount: 2500000, currency: 'IDR', dueDate: '2026-03-25', frequency: 'monthly', category: 'Sembako', walletId: 'wallet_bank', status: 'upcoming', paidAt: null, createdAt: '2026-02-25T00:00:00Z' },
      { id: 'bl4', ownerId: userId, name: 'BPH PLTU', amount: 650000, currency: 'IDR', dueDate: '2026-04-05', frequency: 'yearly', category: 'Listrik & Air', walletId: 'wallet_bank', status: 'upcoming', paidAt: null, createdAt: '2026-01-10T00:00:00Z' },
    ];
    bills.forEach((b: any) => demoBills.set(b.id, b));
  }
  return Array.from(demoBills.values()).filter((b: any) => b.ownerId === userId);
}

function getDemoNotificationsForUser(userId: string): any[] {
  const created = demoNotifications.size === 0;
  if (created) {
    const notifs = [
      { id: 'n1', ownerId: userId, type: 'transaction', title: 'Transaksi baru', message: 'Gaji Rp8.500.000 masuk ke rekening BCA', readAt: null, createdAt: '2026-03-15T08:30:00Z' },
      { id: 'n2', ownerId: userId, type: 'budget', title: 'Budget terlampaui', message: 'Category Sembako melebihi batas' , readAt: '2026-03-17T00:00:00Z', createdAt: '2026-03-17T09:00:00Z' },
      { id: 'n3', ownerId: userId, type: 'wallet', title: 'Wallet baru', message: 'Cash Wallet berhasil dibuat', readAt: '2026-01-10T00:00:00Z', createdAt: '2026-01-10T00:00:00Z' },
      { id: 'n4', ownerId: userId, type: 'bill', title: 'Tagihan belum dibayar', message: 'Listrik PLN akan jatuh tempo 22 Maret', readAt: '2026-03-20T00:00:00Z', createdAt: '2026-03-20T00:00:00Z' },
    ];
    notifs.forEach((n: any) => demoNotifications.set(n.id, n));
  }
  return Array.from(demoNotifications.values()).filter((n: any) => n.ownerId === userId);
}

function generateId(): string {
  return `demo_${demoNextId++}`;
}

export async function login(credentials: { email: string; password: string; rememberMe: boolean }) {
  if (DEMO_MODE) {
    const user = getDemoUser('user_demo_001');
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    return { user, token: 'demo_token_001', demoMode: true };
  }
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(credentials: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAgreed: boolean;
}) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    const user = getDemoUser(generateId());
    return { user, token: 'demo_token_002', demoMode: true };
  }
  return request<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 200));
    return {};
  }
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser() {
  if (DEMO_MODE) {
    return getDemoUser('user_demo_001');
  }
  return request<User>('/auth/me');
}

export async function fetchUserProfile() {
  if (DEMO_MODE) return getDemoUser('user_demo_001');
  return request<User>('/users/profile');
}

export async function updateUserProfile(data: Partial<User>) {
  if (DEMO_MODE) {
    const u = getDemoUser('user_demo_001');
    Object.assign(u, data);
    await new Promise((r) => setTimeout(r, 400));
    return u;
  }
  return request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function uploadAvatar(file: File) {
  if (DEMO_MODE) {
    const u = getDemoUser('user_demo_001');
    u.avatarUrl = URL.createObjectURL(file);
    await new Promise((r) => setTimeout(r, 500));
    return u;
  }
  const form = new FormData();
  form.append('file', file);
  return request<{ url: string }>('/users/profile/avatar', { method: 'POST', body: form });
}

export async function removeAvatar() {
  if (DEMO_MODE) {
    const u = getDemoUser('user_demo_001');
    u.avatarUrl = null;
    await new Promise((r) => setTimeout(r, 400));
    return u;
  }
  return request<{ url: string | null }>('/users/profile/avatar', { method: 'DELETE' });
}

export async function fetchUserPreferences() {
  if (DEMO_MODE) {
    return {
      id: 'pref_demo_001',
      ownerId: 'user_demo_001',
      language: 'id',
      currency: 'IDR',
      timeZone: 'Asia/Jakarta',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'id-ID',
      theme: 'system',
      notificationSettings: { paymentReminders: true, billReminders: true, budgetAlerts: true, accountAlerts: true },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    };
  }
  return request<UserPreference>('/users/preferences');
}

export async function updateUserPreferences(data: Partial<UserPreference>) {
  if (DEMO_MODE) {
    const p = getDemoPrefs();
    Object.assign(p, data);
    await new Promise((r) => setTimeout(r, 400));
    return p;
  }
  return request<UserPreference>('/users/preferences', { method: 'PUT', body: JSON.stringify(data) });
}

export async function fetchDashboardSnapshot() {
  if (DEMO_MODE) {
    const wallets = getDemoWalletsForUser('user_demo_001');
    const entries = getDemoEntriesForUser('user_demo_001');
    const totalBalance = wallets.reduce((s: number, w: any) => s + w.balance, 0);
    const month = '2026-03';
    const monthEntries = entries.filter((e: any) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === month;
    });
    const income = monthEntries.filter((e: any) => e.type === 'income').reduce((s: number, e: any) => s + e.amount, 0);
    const expense = monthEntries.filter((e: any) => e.type === 'expense').reduce((s: number, e: any) => s + e.amount, 0);

    // Cash flow daily
    const cashFlow = new Map<string, { income: number; expense: number }>();
    monthEntries.forEach((e: any) => {
      const key = e.date;
      const cur = cashFlow.get(key) || { income: 0, expense: 0 };
      if (e.type === 'income') cur.income += e.amount;
      else cur.expense += e.amount;
      cashFlow.set(key, cur);
    });
    const cfPoints = Array.from(cashFlow.entries())
      .map(([date, v]) => ({ date, income: v.income, expense: v.expense }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Spending by category
    const catMap = new Map<string, number>();
    monthEntries.filter((e: any) => e.type === 'expense').forEach((e: any) => {
      catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
    });
    const catTotal = Array.from(catMap.values()).reduce((a: number, b: number) => a + b, 0);
    const categories = Array.from(catMap.entries())
      .map(([name, amount]) => ({ name, amount, percentage: catTotal > 0 ? (amount / catTotal) * 100 : 0 }))
      .sort((a: any, b: any) => b.amount - a.amount);

    // Recent transactions
    const recent = monthEntries.slice(0, 8).map((e: any) => {
      const w = wallets.find((x: any) => x.id === e.walletId);
      return {
        id: e.id,
        description: e.description || e.category,
        category: e.category,
        date: e.date,
        walletName: w?.name || 'Unknown',
        amount: e.amount,
        type: e.type,
      };
    });

    return {
      totalBalance,
      totalIncome: income,
      totalExpenses: expense,
      incomeCount: monthEntries.filter((e: any) => e.type === 'income').length,
      expenseCount: monthEntries.filter((e: any) => e.type === 'expense').length,
      walletCount: wallets.length,
      currency: 'IDR',
      cashFlow: cfPoints,
      spendingByCategory: categories,
      recentTransactions: recent,
    };
  }
  return request<DashboardSnapshot>('/finance/snapshot');
}

export async function fetchWallets() {
  if (DEMO_MODE) return getDemoWalletsForUser('user_demo_001');
  return request<Wallet[]>('/finance/wallets');
}

export async function createWallet(data: { name: string; type: WalletType; description?: string }) {
  if (DEMO_MODE) {
    const wallets = getDemoWalletsForUser('user_demo_001');
    const w: any = { id: generateId(), ownerId: 'user_demo_001', ...data, currency: 'IDR', createdAt: new Date().toISOString() };
    wallets.push(w);
    demoWallets.set(w.id, w);
    await new Promise((r) => setTimeout(r, 500));
    return w;
  }
  return request<Wallet>('/finance/wallets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWallet(id: string, data: Partial<Wallet>) {
  if (DEMO_MODE) {
    const w = demoWallets.get(id);
    if (!w) throw new Error('Wallet not found');
    Object.assign(w, data);
    await new Promise((r) => setTimeout(r, 400));
    return w;
  }
  return request<Wallet>(`/finance/wallets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteWallet(id: string) {
  if (DEMO_MODE) {
    demoWallets.delete(id);
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
  return request<{ success: boolean }>(`/finance/wallets/${id}`, { method: 'DELETE' });
}

export async function fetchTransactions(params: {
  type?: string;
  category?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  if (DEMO_MODE) {
    let entries = getDemoEntriesForUser('user_demo_001');
    if (params.type) entries = entries.filter((e: any) => e.type === params.type);
    if (params.category) entries = entries.filter((e: any) => e.category === params.category);
    if (params.walletId) entries = entries.filter((e: any) => e.walletId === params.walletId);
    if (params.startDate || params.endDate) {
      entries = entries.filter((e: any) => {
        const d = new Date(e.date);
        if (params.startDate && d < new Date(params.startDate)) return false;
        if (params.endDate && d > new Date(params.endDate)) return false;
        return true;
      });
    }
    entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = entries.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const paginated = entries.slice((page - 1) * limit, page * limit);
    return { data: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  return request<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>('/finance/transactions', {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
  });
}

export async function createTransaction(data: {
  type: TransactionType;
  amount: number;
  walletId: string;
  category?: string;
  description?: string;
  date: string;
  note?: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  idempotencyKey?: string;
}) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    const wallets = getDemoWalletsForUser('user_demo_001');
    const wallet = wallets.find((w: any) => w.id === data.walletId);
    if (!wallet) throw new Error('Wallet not found');
    if (data.type === 'expense' && data.amount > wallet.balance) {
      throw new Error('Insufficient balance');
    }
    const e: any = {
      id: generateId(),
      walletId: data.walletId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      note: data.note,
      sourceWalletId: data.sourceWalletId,
      destinationWalletId: data.destinationWalletId,
      idempotencyKey: data.idempotencyKey || generateId(),
      createdAt: new Date().toISOString(),
    };
    // Simulate ledger effect for demo
    if (data.type !== 'transfer') {
      const w = wallets.find((x: any) => x.id === data.walletId);
      if (w) w.balance += data.type === 'income' ? data.amount : -data.amount;
      demoWallets.set(w.id, w);
    }
    demoEntries.set(e.id, e);
    return e;
  }
  return request<LedgerEntry>('/finance/transactions', { method: 'POST', body: JSON.stringify(data) });
}

export async function exportTransactionsCsv(params: {
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  walletId?: string;
}) {
  if (DEMO_MODE) {
    const entries = getDemoEntriesForUser('user_demo_001');
    let lines = ['id,description,category,date,walletId,amount,type,note'];
    entries.forEach((e: any) => {
      lines.push([e.id, e.description, e.category, e.date, e.walletId, e.amount, e.type, e.note]
        .map((v: any) => `"${v?.toString?.() || ''}"`).join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  }
  return request<{ success: boolean }>('/finance/transactions/export', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchBudgets() {
  if (DEMO_MODE) return getDemoBudgetsForUser('user_demo_001');
  return request<Budget[]>('/finance/budgets');
}

export async function createBudget(data: { month: string; category: string; limit: number }) {
  if (DEMO_MODE) {
    const b: any = { id: generateId(), ownerId: 'user_demo_001', ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const arr = getDemoBudgetsForUser('user_demo_001');
    arr.push(b);
    demoBudgets.set(b.id, b);
    await new Promise((r) => setTimeout(r, 500));
    return b;
  }
  return request<Budget>('/finance/budgets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBudget(id: string, data: Partial<Budget>) {
  if (DEMO_MODE) {
    const b = demoBudgets.get(id);
    if (!b) throw new Error('Budget not found');
    Object.assign(b, data, { updatedAt: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, 400));
    return b;
  }
  return request<Budget>(`/finance/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteBudget(id: string) {
  if (DEMO_MODE) {
    demoBudgets.delete(id);
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
  return request<{ success: boolean }>(`/finance/budgets/${id}`, { method: 'DELETE' });
}

export async function fetchSavingsGoals() {
  if (DEMO_MODE) return getDemoGoalsForUser('user_demo_001');
  return request<SavingsGoal[]>('/finance/savings-goals');
}

export async function createSavingsGoal(data: {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  description?: string;
  icon?: string;
}) {
  if (DEMO_MODE) {
    const g: any = { id: generateId(), ownerId: 'user_demo_001', status: 'active', ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const arr = getDemoGoalsForUser('user_demo_001');
    arr.push(g);
    demoGoals.set(g.id, g);
    await new Promise((r) => setTimeout(r, 500));
    return g;
  }
  return request<SavingsGoal>('/finance/savings-goals', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSavingsGoal(id: string, data: Partial<SavingsGoal>) {
  if (DEMO_MODE) {
    const g = demoGoals.get(id);
    if (!g) throw new Error('Goal not found');
    Object.assign(g, data, { updatedAt: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, 400));
    return g;
  }
  return request<SavingsGoal>(`/finance/savings-goals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteSavingsGoal(id: string) {
  if (DEMO_MODE) {
    demoGoals.delete(id);
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
  return request<{ success: boolean }>(`/finance/savings-goals/${id}`, { method: 'DELETE' });
}

export async function addSavingsContribution(goalId: string, amount: number, note?: string) {
  if (DEMO_MODE) {
    const g = demoGoals.get(goalId);
    if (!g) throw new Error('Goal not found');
    const contrib: any = {
      id: generateId(),
      goalId,
      amount,
      note,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    g.currentAmount = (g.currentAmount || 0) + amount;
    g.updatedAt = new Date().toISOString();
    demoGoals.set(goalId, g);
    await new Promise((r) => setTimeout(r, 500));
    return { goal: g, contribution: contrib };
  }
  return request<{ goal: SavingsGoal; contribution: SavingsContribution }>('/finance/savings-goals/:id/contributions', {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
}

export async function fetchBills() {
  if (DEMO_MODE) return getDemoBillsForUser('user_demo_001');
  return request<Bill[]>('/finance/bills');
}

export async function createBill(data: {
  name: string;
  amount: number;
  currency?: string;
  dueDate: string;
  frequency?: string;
  category?: string;
  walletId?: string;
}) {
  if (DEMO_MODE) {
    const b: any = { id: generateId(), ownerId: 'user_demo_001', status: 'upcoming', ...data, createdAt: new Date().toISOString() };
    const arr = getDemoBillsForUser('user_demo_001');
    arr.push(b);
    demoBills.set(b.id, b);
    await new Promise((r) => setTimeout(r, 500));
    return b;
  }
  return request<Bill>('/finance/bills', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBill(id: string, data: Partial<Bill>) {
  if (DEMO_MODE) {
    const b = demoBills.get(id);
    if (!b) throw new Error('Bill not found');
    Object.assign(b, data, { updatedAt: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, 400));
    return b;
  }
  return request<Bill>(`/finance/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteBill(id: string) {
  if (DEMO_MODE) {
    demoBills.delete(id);
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
  return request<{ success: boolean }>(`/finance/bills/${id}`, { method: 'DELETE' });
}

export async function fetchNotifications() {
  if (DEMO_MODE) return getDemoNotificationsForUser('user_demo_001');
  return request<NotificationItem[]>('/notifications');
}

export async function markNotificationRead(id: string) {
  if (DEMO_MODE) {
    const n = demoNotifications.get(id);
    if (n) n.readAt = new Date().toISOString();
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  }
  return request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
}

export async function clearNotifications() {
  if (DEMO_MODE) {
    demoNotifications.clear();
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  }
  return request<{ success: boolean }>('/notifications/clear', { method: 'DELETE' });
}

export async function fetchBillsByStatus(status: string) {
  if (DEMO_MODE) return getDemoBillsForUser('user_demo_001').filter((b: any) => b.status === status);
  return request<Bill[]>(`/finance/bills?status=${status}`);
}
