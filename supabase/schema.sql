-- PaisaPilot Database Schema with Row Level Security (RLS)

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    currency TEXT DEFAULT 'INR' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. HOUSEHOLDS
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- 3. HOUSEHOLD MEMBERS
CREATE TABLE IF NOT EXISTS public.household_members (
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (household_id, user_id)
);

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Helper functions with SECURITY DEFINER to eliminate RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_household_member(lookup_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.household_members
        WHERE household_id = lookup_household_id
        AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_household_owner(lookup_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.household_members
        WHERE household_id = lookup_household_id
        AND user_id = auth.uid()
        AND role = 'owner'
    );
$$;

-- Household members policies (non-recursive)
CREATE POLICY "Members can view household members"
    ON public.household_members FOR SELECT
    USING (
        user_id = auth.uid() OR public.is_household_member(household_id)
    );

CREATE POLICY "Owners can manage household members"
    ON public.household_members FOR ALL
    USING (
        user_id = auth.uid() OR public.is_household_owner(household_id)
    );

-- Household policies
CREATE POLICY "Users can view households they belong to"
    ON public.households FOR SELECT
    USING (
        created_by = auth.uid() OR public.is_household_member(id)
    );

CREATE POLICY "Users can create households"
    ON public.households FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT CHECK (type IN ('expense', 'income')) DEFAULT 'expense' NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or default categories"
    ON public.categories FOR SELECT
    USING (
        is_default = true OR
        user_id = auth.uid() OR
        (household_id IS NOT NULL AND public.is_household_member(household_id))
    );

CREATE POLICY "Users can insert custom categories"
    ON public.categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (user_id = auth.uid() AND is_default = false);

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type TEXT CHECK (type IN ('expense', 'income')) DEFAULT 'expense' NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    payment_mode TEXT CHECK (payment_mode IN ('upi', 'cash', 'card', 'netbanking')) DEFAULT 'upi' NOT NULL,
    merchant TEXT NOT NULL,
    note TEXT,
    tags TEXT[] DEFAULT '{}',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_shared BOOLEAN DEFAULT false NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or shared household transactions"
    ON public.transactions FOR SELECT
    USING (
        user_id = auth.uid() OR
        (is_shared = true AND household_id IS NOT NULL AND public.is_household_member(household_id))
    );

CREATE POLICY "Users can manage own transactions"
    ON public.transactions FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    rollover BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, category_id, month)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their budgets"
    ON public.budgets FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 7. RECURRING ITEMS (EMIs, Subscriptions, SIPs, Rent)
CREATE TABLE IF NOT EXISTS public.recurring_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type TEXT CHECK (type IN ('rent', 'subscription', 'emi', 'insurance', 'sip', 'other')) NOT NULL,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly' NOT NULL,
    next_due_date DATE NOT NULL,
    remind_days_before INT DEFAULT 3 NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.recurring_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage recurring items"
    ON public.recurring_items FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 8. GOALS
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    saved_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (saved_amount >= 0),
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage savings goals"
    ON public.goals FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 9. SETTLEMENTS (Household splits)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    from_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view settlements"
    ON public.settlements FOR SELECT
    USING (
        from_user = auth.uid() OR
        to_user = auth.uid() OR
        public.is_household_member(household_id)
    );

-- SEED SCRIPT FOR DEFAULT CATEGORIES
INSERT INTO public.categories (name, icon, color, type, is_default) VALUES
('Food & Dining', 'Utensils', '#f97316', 'expense', true),
('Groceries', 'ShoppingCart', '#10b981', 'expense', true),
('Rent', 'Home', '#6366f1', 'expense', true),
('Transport', 'Car', '#06b6d4', 'expense', true),
('Fuel', 'Fuel', '#eab308', 'expense', true),
('Bills & Utilities', 'Zap', '#8b5cf6', 'expense', true),
('Shopping', 'ShoppingBag', '#ec4899', 'expense', true),
('Health & Medical', 'HeartPulse', '#ef4444', 'expense', true),
('Education', 'GraduationCap', '#3b82f6', 'expense', true),
('Entertainment', 'Tv', '#a855f7', 'expense', true),
('Festivals & Puja', 'Sparkles', '#f59e0b', 'expense', true),
('EMI & Loans', 'CreditCard', '#dc2626', 'expense', true),
('Investments & SIP', 'TrendingUp', '#059669', 'expense', true),
('Travel & Holidays', 'Plane', '#14b8a6', 'expense', true),
('Other Expense', 'MoreHorizontal', '#64748b', 'expense', true),
('Salary', 'Wallet', '#10b981', 'income', true),
('Business & Freelance', 'Briefcase', '#3b82f6', 'income', true),
('Investments Returns', 'TrendingUp', '#059669', 'income', true),
('Gifts & Cashbacks', 'Gift', '#f43f5e', 'income', true),
('Rental Income', 'Building', '#8b5cf6', 'income', true)
ON CONFLICT DO NOTHING;

-- STORAGE BUCKET FOR RECEIPTS
-- Run in Supabase storage section:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
