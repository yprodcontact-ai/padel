-- Migration: Add Club Management and Roles
-- Created on: 2026-06-10

-- 1. Create club_managers table
CREATE TABLE IF NOT EXISTS public.club_managers (
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (club_id, user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.club_managers ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for club_managers
CREATE POLICY "Allow authenticated read managers" ON public.club_managers
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow admin manage managers" ON public.club_managers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

-- 4. Recreate clubs UPDATE policy to allow managers and admins to update
DROP POLICY IF EXISTS "Allow admin update" ON public.clubs;

CREATE POLICY "Allow manager update" ON public.clubs
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = true
        ) OR EXISTS (
            SELECT 1 FROM public.club_managers
            WHERE club_managers.user_id = auth.uid() AND club_managers.club_id = id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = true
        ) OR EXISTS (
            SELECT 1 FROM public.club_managers
            WHERE club_managers.user_id = auth.uid() AND club_managers.club_id = id
        )
    );

-- 5. Automatically assign the first user as owner of the default club (Tennis Club Aubenas)
INSERT INTO public.club_managers (club_id, user_id, role)
SELECT 'f6b15e45-d8aa-4628-98e3-cf9e3388c3a1', id, 'owner'
FROM public.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT DO NOTHING;
