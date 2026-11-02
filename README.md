# PaisaPilot (पैसा पायलट) 🇮🇳
> Smart money manager for Indian households. Tying together daily spending, shared household money, and savings goals reflecting how money moves in India: UPI, cash, cards, EMIs, chit funds, and festival spending.

---

## 🚀 Live Dev Server
The app is active and running locally at:
```bash
http://localhost:5173/
```

---

## 🛠️ Complete Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom fintech tokens, calm teal/emerald palettes, and dark/light modes
- **State Management & Routing**: React Context + React Query patterns, React Router 7
- **Data Visualization**: Recharts (Payment mode distribution, category spend trends, and velocity meters)
- **Validation**: Zod schema validation for all transactions, budgets, goals, and CSV imports
- **Toasts**: Sonner with undo support
- **Data Import**: PapaParse with automated Indian merchant keyword matching
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) on all 9 tables, Edge Function with Gemini AI integration, and instant offline/demo mode fallback.

---

## 📱 Phase 1 & Phase 2 Complete Feature Matrix

### 1. Daily Spends & Fast Transaction Logging (Phase 1)
- **Sub-5-second Fast Entry**: Floating "+" button, large numeric keypad, quick amount pills (+100, +200, +500, +2000).
- **Indian Payment Modes**: Native support and visual badges for `UPI` (default active), `Cash`, `Card`, and `NetBanking`.
- **Intelligent Merchant Suggestions**: Autocomplete chips for *Swiggy*, *Blinkit*, *Zomato*, *Indian Oil*, *D-Mart*, *Airtel*, etc.
- **Shared Household Toggle**: One-tap toggle to mark an expense as split across household members.
- **Receipts**: File upload to Supabase Storage with in-browser image preview.

### 2. Smart SMS & UPI Message Parser (Phase 1)
- Paste box with 1-click sample bank SMS chips (*HDFC*, *SBI*, *ICICI*, *Axis*, *Paytm*, *Google Pay*, *PhonePe*).
- Instant client regex parser with 0ms latency + Supabase Edge Function with Gemini AI option.
- Live preview card and **"Review & Save"** prefill flow.

### 3. Bank Statement CSV Import (Phase 1)
- PapaParse CSV reader compatible with HDFC, SBI, ICICI, Axis, and generic bank statements.
- Intelligent column mapping for *Date*, *Narration*, *Debit*, and *Credit*.
- Interactive preview table with automated Indian merchant keyword categorizer.

### 4. Category Budgets & Rollover Envelopes (Phase 2)
- Monthly category envelopes dynamically calculated from live transactions.
- **Unused Balance Rollover**: Leftover budget at the end of the month rolls over to boost next month's envelope (crucial for Diwali festival shopping, medical buffers, and seasonal groceries).
- Over-budget visual warnings (amber/rose alerts) and remaining balance trackers.
- Add, Edit, and Delete budget envelopes.

### 5. Household Ledger & Fair Share Splits (Phase 2)
- Shared household money tracking for families, couples, and roommates.
- Member ledger tracking each person's total paid vs fair share.
- Net settlement balance calculation: automatically computes who owes whom (e.g., *"Rohan owes you ₹4,200"*).
- **"Record Settlement"**: Record payments via UPI or Cash with note and settlement history tracking.
- Add or remove household members with custom share percentages.

### 6. Savings Goals & Indian Chit Funds / Kameti Tracker (Phase 2)
- **Savings Goals**: Milestone progress bars, category tags (*Festival*, *Emergency*, *Gold*, *Travel*, *Gadget*), and target dates.
- **One-Tap "Add Money"**: Instant contribution modal with celebration feedback.
- **Signature Indian Chit Fund (Kameti) Tracker**:
  - Track monthly installments, total pool value, duration, and installment progress (e.g. Month 8 of 20).
  - Track auction dividends earned and net monthly savings.
  - One-tap **"Pay Installment"** action (automatically logs transaction and advances month).
  - **"Claim Auction Payout"** action (deposits payout into ledger).

### 7. EMIs, SIPs & Recurring Bills Calendar (Phase 2)
- Fixed monthly commitment tracker for Home Loans, Car EMIs, Mutual Fund SIPs, House Rent, and Subscriptions.
- Due date indicators with urgency badges (*"Due in 3 days"*, *"Due Today"*).
- One-tap **"Mark as Paid"** action that automatically writes a real transaction to the ledger and advances the due date by one month!

### 8. Financial Insights & Health Analytics (Phase 2)
- Daily average burn rate (`₹/day`).
- Recharts visualizations: Category distribution bar charts and UPI/Cash/Card flow pie charts.
- Smart financial recommendations customized for Indian household budgets.

---

## 🗄️ Database Schema & RLS Setup
Located in [`supabase/schema.sql`](file:///c:/Users/Parth%20Saini/OneDrive/Desktop/Inferno/supabase/schema.sql):
- `profiles`
- `households`
- `household_members`
- `categories` (seeded with 19 standard Indian expense & income categories)
- `transactions`
- `budgets`
- `recurring_items`
- `goals`
- `settlements`
- Storage bucket: `receipts`
- Edge Function: [`supabase/functions/parse-sms/index.ts`](file:///c:/Users/Parth%20Saini/OneDrive/Desktop/Inferno/supabase/functions/parse-sms/index.ts)
