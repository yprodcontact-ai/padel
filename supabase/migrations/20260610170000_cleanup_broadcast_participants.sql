-- Migration: Clean up admin from broadcast conversations participants
-- Created on: 2026-06-10

DELETE FROM public.conversation_participants cp
USING public.conversations c, public.users u
WHERE cp.conversation_id = c.id
  AND cp.user_id = u.id
  AND c.is_read_only = true
  AND u.is_admin = true;
