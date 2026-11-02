export type PaymentMode = 'upi' | 'cash' | 'card' | 'netbanking';

export type TransactionType = 'expense' | 'income';

export type CategoryIconName =
  | 'Utensils'
  | 'ShoppingCart'
  | 'Home'
  | 'Car'
  | 'Fuel'
  | 'Zap'
  | 'ShoppingBag'
  | 'HeartPulse'
  | 'GraduationCap'
  | 'Tv'
  | 'Sparkles'
  | 'CreditCard'
  | 'TrendingUp'
  | 'Plane'
  | 'MoreHorizontal'
  | 'Wallet'
  | 'Briefcase'
  | 'Gift'
  | 'Building'
  | 'Coffee'
  | 'Smile';

export interface Category {
  id: string;
  user_id?: string | null;
  household_id?: string | null;
  name: string;
  icon: CategoryIconName | string;
  color: string;
  type: TransactionType;
  is_default?: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  household_id?: string | null;
  amount: number;
  type: TransactionType;
  category_id: string;
  payment_mode: PaymentMode;
  merchant: string;
  note?: string;
  tags?: string[];
  date: string; // YYYY-MM-DD
  is_shared: boolean;
  receipt_url?: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  currency: string; // 'INR'
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  household_id?: string | null;
  category_id: string;
  month: string; // YYYY-MM
  amount: number;
  rollover: boolean;
  created_at?: string;
}

export interface RecurringItem {
  id: string;
  user_id: string;
  household_id?: string | null;
  name: string;
  amount: number;
  type: 'rent' | 'subscription' | 'emi' | 'insurance' | 'sip' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  remind_days_before: number;
  active: boolean;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string;
  created_at?: string;
}

export interface Settlement {
  id: string;
  household_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  date: string;
  note?: string;
  created_at?: string;
}

export interface ParsedSmsResult {
  amount: number;
  type: TransactionType;
  merchant: string;
  payment_mode: PaymentMode;
  date: string; // YYYY-MM-DD
  suggested_category_id?: string;
  suggested_category_name?: string;
  confidence: number;
  raw_message: string;
  account_ref?: string;
}

export interface CsvParsedRow {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  payment_mode: PaymentMode;
  suggested_category_id: string;
  merchant: string;
  selected: boolean;
}
