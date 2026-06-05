-- Migration: Add Admin flags and Sessions logging for Dashboard
-- Created on: 2026-06-05

-- 1. Add is_admin column to users table if it does not exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Make the first created user an admin automatically (for testing purposes)
-- In a production environment, this would be updated manually or via seed script
UPDATE public.users 
SET is_admin = true 
WHERE id IN (
    SELECT id FROM public.users 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- 3. Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- 5. Enable Row Level Security (RLS) on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can insert their own sessions
CREATE POLICY "Allow authenticated inserts" ON public.user_sessions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- RLS: Administrators can read all sessions
CREATE POLICY "Allow admin select" ON public.user_sessions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

-- 6. Create RPC get_admin_dashboard_stats with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    -- Security check: Verify the requester (auth.uid()) is an admin
    SELECT is_admin INTO v_is_admin FROM public.users WHERE id = auth.uid();
    
    IF v_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Non autorisé : vous devez être administrateur.';
    END IF;

    -- Compile stats into a single JSONB object
    SELECT jsonb_build_object(
        'summary', jsonb_build_object(
            'total_users', (SELECT count(*) FROM public.users),
            'total_parties', (SELECT count(*) FROM public.parties),
            'total_clubs', (SELECT count(*) FROM public.clubs),
            'completion_rate', (
                SELECT COALESCE(ROUND((COUNT(CASE WHEN statut IN ('complete', 'confirmee') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 1), 0) 
                FROM public.parties
            )
        ),
        'parties_stats', jsonb_build_object(
            'today', (SELECT count(*) FROM public.parties WHERE created_at >= NOW() - INTERVAL '24 hours'),
            'this_week', (SELECT count(*) FROM public.parties WHERE created_at >= NOW() - INTERVAL '7 days'),
            'this_month', (SELECT count(*) FROM public.parties WHERE created_at >= NOW() - INTERVAL '30 days')
        ),
        'sessions_stats', jsonb_build_object(
            'today', (
                SELECT jsonb_build_object(
                    'sessions', count(distinct session_id),
                    'users', count(distinct user_id)
                ) FROM public.user_sessions WHERE created_at >= NOW() - INTERVAL '24 hours'
            ),
            'this_week', (
                SELECT jsonb_build_object(
                    'sessions', count(distinct session_id),
                    'users', count(distinct user_id)
                ) FROM public.user_sessions WHERE created_at >= NOW() - INTERVAL '7 days'
            ),
            'this_month', (
                SELECT jsonb_build_object(
                    'sessions', count(distinct session_id),
                    'users', count(distinct user_id)
                ) FROM public.user_sessions WHERE created_at >= NOW() - INTERVAL '30 days'
            )
        ),
        'parties_by_status', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT statut as status, count(*) as count 
                FROM public.parties 
                GROUP BY statut
            ) t
        ),
        'parties_by_type', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT type, count(*) as count 
                FROM public.parties 
                GROUP BY type
            ) t
        ),
        'top_clubs', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT c.nom as name, c.ville as city, count(p.id) as count 
                FROM public.parties p 
                JOIN public.clubs c ON p.club_id = c.id 
                GROUP BY c.id, c.nom, c.ville 
                ORDER BY count DESC 
                LIMIT 5
            ) t
        ),
        'top_players', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT u.nom, u.prenom, u.email, count(pp.id) as count 
                FROM public.party_players pp 
                JOIN public.users u ON pp.user_id = u.id 
                GROUP BY u.id, u.nom, u.prenom, u.email 
                ORDER BY count DESC 
                LIMIT 5
            ) t
        ),
        'parties_trend', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT d.date::date as date, COALESCE(count(p.id), 0) as count
                FROM (
                    SELECT generate_series(
                        (NOW() - INTERVAL '29 days')::date,
                        NOW()::date,
                        '1 day'::interval
                    )::date as date
                ) d
                LEFT JOIN public.parties p ON p.created_at::date = d.date
                GROUP BY d.date
                ORDER BY d.date
            ) t
        ),
        'sessions_trend', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT d.date::date as date, 
                       count(distinct us.session_id) as sessions, 
                       count(distinct us.user_id) as users
                FROM (
                    SELECT generate_series(
                        (NOW() - INTERVAL '29 days')::date,
                        NOW()::date,
                        '1 day'::interval
                    )::date as date
                ) d
                LEFT JOIN public.user_sessions us ON us.created_at::date = d.date
                GROUP BY d.date
                ORDER BY d.date
            ) t
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
