-- Migration: Fix RLS policies to allow admins to send messages in read-only broadcast conversations
-- and update conversations (e.g. for setting the logo URL)
-- Created on: 2026-06-11

-- 1. Recreate the "Envoi de messages" policy on public.messages
DROP POLICY IF EXISTS "Envoi de messages" ON public.messages;

CREATE POLICY "Envoi de messages" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        (
            -- Cas 1 : L'utilisateur fait partie de la conversation et celle-ci n'est pas en lecture seule
            EXISTS (
                SELECT 1 FROM public.conversation_participants cp
                JOIN public.conversations c ON c.id = cp.conversation_id
                WHERE cp.conversation_id = messages.conversation_id 
                  AND cp.user_id = auth.uid()
                  AND c.is_read_only = false
            )
            -- Cas 2 : L'utilisateur est un administrateur (il peut envoyer des messages y compris dans les canaux de diffusion)
            OR EXISTS (
                SELECT 1 FROM public.users u 
                WHERE u.id = auth.uid() AND u.is_admin = true
            )
        )
    );

-- 2. Add an UPDATE policy for public.conversations to allow admins to modify conversation attributes (like logo_url)
DROP POLICY IF EXISTS "Allow admin update conversations" ON public.conversations;

CREATE POLICY "Allow admin update conversations" ON public.conversations
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.is_admin = true
        )
    );
