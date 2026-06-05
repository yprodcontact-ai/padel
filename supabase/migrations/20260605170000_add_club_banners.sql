-- Migration: Add club banner fields and update policy for admins
-- Created on: 2026-06-05

-- 1. Add banner columns to clubs table if they do not exist
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS banner_destination_url TEXT;

-- 2. Create RLS policy to allow admins to update clubs
DROP POLICY IF EXISTS "Allow admin update" ON public.clubs;

CREATE POLICY "Allow admin update" ON public.clubs
    FOR UPDATE TO authenticated
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
