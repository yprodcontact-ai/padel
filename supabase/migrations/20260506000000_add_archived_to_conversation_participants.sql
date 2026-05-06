-- Per-user archive flag on conversation_participants
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conv_participants_user_archived ON conversation_participants (user_id, archived);

-- Permettre à un utilisateur de modifier sa propre ligne (pour archiver/désarchiver)
DROP POLICY IF EXISTS "Update_own_participation" ON conversation_participants;
CREATE POLICY "Update_own_participation" ON conversation_participants
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
