# PaisaPilot (पैसा पायलट) 🇮🇳
> Smart money manager for Indian households. Tying together daily spending, shared household money, and savings goals reflecting how money moves in India: UPI, cash, cards, EMIs, chit funds, and festival spending.

---

## 🚀 Live Dev Server
The app is running locally at:
```bash
http://localhost:5173/
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom fintech tokens, calm teal/emerald palettes, and dark/light modes
- **State Management & Routing**: React Context + React Query patterns, React Router 7
- **Data Visualization**: Recharts (Payment mode distribution and category spend trends)
- **Validation**: Zod schema validation for all transactions and imports
- **Toasts**: Sonner with undo support
- **Data Import**: PapaParse with automated Indian merchant keyword matching
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) on all 9 tables, Edge Function with Gemini AI integration, and instant offline/demo mode fallback.

---

## 📱 Phase 1 Features Implemented

### 1. Authentication & Onboarding
- Email/password and Google sign-in integration.
- Instant 1-click **"Demo Mode"** to test drive all features immediately without setup friction.
- Onboarding modal capturing user name and household name, with preview of seeded Indian categories.

### 2. Dashboard (Home)
- **November 2026 Household Finances**:
  - Net Remaining Cashflow (e.g., `₹68,880`), Month's Total Spent, and Total Income with Indian digit grouping (`₹1,25,000` style).
  - Monthly Cashflow Budget Utilization meter.
  - Payment mode breakdown chart (reflecting real Indian behavior where **UPI** is dominant alongside Cash and Cards).
  - Top category spend distributions (Rent, Groceries, Food & Utilities).
  - Recent 5 transactions with payment mode badges, category icons, and receipt view indicators.

### 3. Add Transaction (Sub-5s Fast Logging)
- Big numeric input with `₹` symbol and quick amount buttons (+100, +200, +500, +2000).
- Expense vs Income toggle.
- Category chips with vivid colors and icons.
- Indian payment modes: `UPI` (default), `Cash`, `Card`, `NetBanking`.
- Merchant autocomplete suggestions (Swiggy, Blinkit, Zomato, Indian Oil, etc.).
- Split with Household toggle.
- Receipt upload to Supabase Storage with local image preview.

### 4. Smart SMS / UPI Message Paste
- Paste box with 1-click sample bank SMS chips:
  - *HDFC Bank - Swiggy (UPI ₹450)*
  - *SBI - Blinkit Groceries (₹849)*
  - *ICICI - Tata Power Electricity Bill (₹2,450)*
  - *Axis Bank - Indian Oil Fuel Card (₹2,100)*
  - *SBI - Monthly Salary Credit (₹95,000)*
- High-precision regex engine with zero latency, plus Supabase Edge Function with Gemini AI option.
- Live recognized preview card with 1-click **"Review & Save"** prefill into transaction entry.

### 5. Transactions Page
- Date-grouped transaction stream ("Today", "Yesterday", "31 Oct 2026") with daily subtotals.
- Real-time search across merchants, notes, tags, and amounts.
- Filter pills: All, Expense, Income, UPI only, Cash only, Card only, Netbanking only.
- Category and Tag dropdown filters.
- Edit transaction modal.
- Delete transaction with **Undo notification toast**.

### 6. Bank Statement CSV Import
- Upload or drag-and-drop bank statement CSV files.
- Sample HDFC Bank Statement CSV test button.
- Column mapping selector (Date, Narration, Withdrawal/Debit, Deposit/Credit).
- Preview table with intelligent auto-categorization matching Indian merchant keywords (Swiggy -> Food & Dining, Blinkit -> Groceries, Tata Power -> Bills & Utilities, Indian Oil -> Fuel, Infosys -> Salary).
- Bulk import confirmation.

### 7. Phase 2 Previews Ready
- **Budgets Tab**: Category envelopes, rollover models, and festival budget reserves.
- **Household Tab**: Shared household ledger, owner/member roles, and settlement tracking ("Rohan owes you ₹4,200").
- **More Tab**: Supabase backend status, CSV export, light/dark mode, and savings goals preview.

---

## 🗄️ Database Schema & RLS Setup (Supabase)
The complete production SQL migration is located in:
[`supabase/schema.sql`](file:///c:/Users/Parth%20Saini/OneDrive/Desktop/Inferno/supabase/schema.sql)

Tables created with Row Level Security:
1. `profiles`: `id`, `full_name`, `avatar_url`, `currency`, `created_at`
2. `households`: `id`, `name`, `created_by`, `created_at`
3. `household_members`: `household_id`, `user_id`, `role`
4. `categories`: `id`, `user_id`, `household_id`, `name`, `icon`, `color`, `type`, `is_default`
5. `transactions`: `id`, `user_id`, `household_id`, `amount`, `type`, `category_id`, `payment_mode`, `merchant`, `note`, `tags`, `date`, `is_shared`, `receipt_url`, `created_at`
6. `budgets`: `id`, `user_id`, `household_id`, `category_id`, `month`, `amount`, `rollover`
7. `recurring_items`: `id`, `user_id`, `household_id`, `name`, `amount`, `type`, `frequency`, `next_due_date`, `remind_days_before`, `active`
8. `goals`: `id`, `user_id`, `name`, `target_amount`, `saved_amount`, `target_date`
9. `settlements`: `id`, `household_id`, `from_user`, `to_user`, `amount`, `date`, `note`

Edge Function:
- [`supabase/functions/parse-sms/index.ts`](file:///c:/Users/Parth%20Saini/OneDrive/Desktop/Inferno/supabase/functions/parse-sms/index.ts)
