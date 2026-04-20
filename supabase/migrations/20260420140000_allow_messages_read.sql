BEGIN;

-- Initialisation de la RLS d'UPDATE pour les messages afin de pouvoir éditer la colonne "lu" : true
CREATE POLICY "Marquer les messages lus" ON messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

COMMIT;
