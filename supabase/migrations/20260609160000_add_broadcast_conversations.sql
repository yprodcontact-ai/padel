-- Migration: Add fields for admin broadcast conversations and HTML messages
-- Created on: 2026-06-09

-- 1. Add title and is_read_only columns to conversations table if they do not exist
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_read_only BOOLEAN DEFAULT FALSE;

-- 2. Add is_html column to messages table if it does not exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_html BOOLEAN DEFAULT FALSE;

-- 3. Update RLS policy on public.messages to prevent writing in read-only conversations for normal users
DROP POLICY IF EXISTS "Envoi de messages" ON public.messages;

CREATE POLICY "Envoi de messages" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            JOIN public.conversations c ON c.id = cp.conversation_id
            WHERE cp.conversation_id = messages.conversation_id 
              AND cp.user_id = auth.uid()
              AND (
                  c.is_read_only = false 
                  OR EXISTS (
                      SELECT 1 FROM public.users u 
                      WHERE u.id = auth.uid() AND u.is_admin = true
                  )
              )
        )
    );
