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
  upi_id?: string; // e.g. 'parth@okaxis'
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'member';
  share_percent: number; // e.g. 50%
  upi_id?: string; // e.g. 'rohan@okhdfcbank'
  created_at: string;
}

export type AccountType = 'bank' | 'cash' | 'wallet' | 'credit_card';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  bank_name?: string;
  account_number_last4?: string;
  balance: number; // current balance, or current outstanding on credit card
  credit_limit?: number; // for credit card
  billing_cycle_date?: number; // 1-31
  payment_due_date?: number; // 1-31
  color?: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface AccountTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  note?: string;
  created_at?: string;
}

export interface GoldAsset {
  id: string;
  user_id: string;
  name: string;
  type: 'physical' | 'digital' | 'sgb';
  weight_grams: number;
  purchase_price_per_gram: number;
  purchase_date: string;
  notes?: string;
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
  next_due_date: string; // YYYY-MM-DD
  remind_days_before: number;
  active: boolean;
  category_id?: string;
  payment_mode?: PaymentMode;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string;
  category?: 'festival' | 'emergency' | 'gold' | 'travel' | 'education' | 'gadget' | 'general';
  created_at?: string;
}

export interface ChitFund {
  id: string;
  user_id: string;
  household_id?: string | null;
  name: string; // e.g., "Shree Ganesh Monthly Chit" or "Society Kameti 1 Lakh"
  monthly_contribution: number; // e.g. 5000
  total_months: number; // e.g. 20
  current_month: number; // e.g. 8
  total_chit_amount: number; // e.g. 100000
  dividend_earned: number; // e.g. 3500
  taken_in_month?: number | null; // e.g. Month 12 when auctioned/claimed
  payout_received?: number | null; // e.g. 88000
  status: 'active' | 'claimed' | 'completed';
  next_due_date: string;
  created_at?: string;
}

export interface Settlement {
  id: string;
  household_id: string;
  from_user: string;
  to_user: string;
  from_name: string;
  to_name: string;
  amount: number;
  date: string;
  note?: string;
  payment_mode?: PaymentMode;
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
