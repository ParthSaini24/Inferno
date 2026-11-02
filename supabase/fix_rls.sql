-- Fix RLS Infinite Recursion on household_members and dependent tables
DROP POLICY IF EXISTS "Members can view household members" ON public.household_members;
DROP POLICY IF EXISTS "Owners can manage household members" ON public.household_members;
DROP POLICY IF EXISTS "Users can view households they belong to" ON public.households;
DROP POLICY IF EXISTS "Users can view own or default categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own or shared household transactions" ON public.transactions;
DROP POLICY IF EXISTS "Household members can view settlements" ON public.settlements;

-- Security Definer helper functions (bypasses recursive RLS checks)
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

-- Non-recursive Policies
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

CREATE POLICY "Users can view households they belong to"
    ON public.households FOR SELECT
    USING (
        created_by = auth.uid() OR public.is_household_member(id)
    );

CREATE POLICY "Users can view own or default categories"
    ON public.categories FOR SELECT
    USING (
        is_default = true OR
        user_id = auth.uid() OR
        (household_id IS NOT NULL AND public.is_household_member(household_id))
    );

CREATE POLICY "Users can view own or shared household transactions"
    ON public.transactions FOR SELECT
    USING (
        user_id = auth.uid() OR
        (is_shared = true AND household_id IS NOT NULL AND public.is_household_member(household_id))
    );

CREATE POLICY "Household members can view settlements"
    ON public.settlements FOR SELECT
    USING (
        from_user = auth.uid() OR
        to_user = auth.uid() OR
        public.is_household_member(household_id)
    );
