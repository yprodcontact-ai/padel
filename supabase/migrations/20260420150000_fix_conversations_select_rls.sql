BEGIN;

-- La protection RLS sur `conversation_participants` avec un "EXISTS" sur elle-même crée une boucle de récursion infinie ou une condition bloquante en SQL (Supabase bloque alors secrètement l'affichage).
DROP POLICY IF EXISTS "Voir les participants si on fait soi-même partie de la conversation" ON conversation_participants;
CREATE POLICY "Les participants peuvent tous être vus" ON conversation_participants FOR SELECT USING (auth.role() = 'authenticated');

-- On allège également la lecture de la table conversation pour éviter tout "EXISTS" bugué à l'intérieur
DROP POLICY IF EXISTS "Seuls les participants voient la conversation" ON conversations;
CREATE POLICY "Lecture conversations publiques" ON conversations FOR SELECT USING (auth.role() = 'authenticated');

COMMIT;
