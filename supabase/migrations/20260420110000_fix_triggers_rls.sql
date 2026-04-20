BEGIN;

-- Permet aux utilisateurs connectés d'insérer des groupes de conversations et notifications sans être bloqués
CREATE POLICY "Insert_conversations" ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert_participants" ON conversation_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert_notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Autoriser les participants réguliers d'une partie (et pas seulement le créateur) à déclencher le statut "complete"
DROP POLICY IF EXISTS "Seul le créateur peut modifier sa partie" ON parties;

CREATE POLICY "Creator or Participant can update party" ON parties FOR UPDATE USING (
    auth.uid() = createur_id OR 
    EXISTS (SELECT 1 FROM party_players WHERE party_id = id AND user_id = auth.uid())
);

COMMIT;
