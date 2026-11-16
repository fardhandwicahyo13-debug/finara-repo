// Domain types for Finara

export type TransactionType = 'income' | 'expense' | 'transfer';
export type WalletType = 'cash' | 'bank' | 'e-wallet' | 'other';
export type SortDirection = 'asc' | 'desc';

export interface User {
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

export interface Wallet {
  id: string;
  ownerId: string;
  name: string;
  type: WalletType;
  description: string | null;
  currency: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  category: string | null;
  description: string | null;
  date: string;
  note: string | null;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  idempotencyKey: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  walletId: string;
  category?: string | null;
  description?: string | null;
  date: string;
  note?: string | null;
  sourceWalletId?: string | null;
  destinationWalletId?: string | null;
  idempotencyKey?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  ownerId: string;
  month: string;
  category: string;
  limit: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  ownerId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string | null;
  icon: string | null;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  ownerId: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string;
  frequency: string;
  category: string | null;
  walletId: string | null;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'paid';
  paidAt: string | null;
  createdAt: string;
}

export interface BillPayment {
  id: string;
  billId: string;
  amount: number;
  walletId: string | null;
  note: string | null;
  paidAt: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  ownerId: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface UserPreference {
  id: string;
  ownerId: string;
  language: string;
  currency: string;
  timeZone: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'system';
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  paymentReminders: boolean;
  billReminders: boolean;
  budgetAlerts: boolean;
  accountAlerts: boolean;
}

// Dashboard snapshot
export interface DashboardSnapshot {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  walletCount: number;
  currency: string;
  cashFlow: CashFlowPoint[];
  spendingByCategory: SpendingCategory[];
  recentTransactions: DashboardTransaction[];
}

export interface CashFlowPoint {
  date: string;
  income: number;
  expense: number;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface DashboardTransaction {
  id: string;
  description: string;
  category: string;
  date: string;
  walletName: string;
  amount: number;
  type: TransactionType;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAgreed: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  demoMode: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}
