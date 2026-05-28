-- Suppression de l'ancienne politique restrictive
DROP POLICY IF EXISTS "Seul le créateur peut modifier sa partie" ON parties;

-- Création de la nouvelle politique avec WITH CHECK (true)
-- Cela permet au créateur actuel (USING) de modifier n'importe quel champ de la partie,
-- y compris de transférer la responsabilité de la partie (createur_id) à un autre joueur.
-- Une fois le transfert effectué, il ne sera plus le créateur et ne pourra plus la modifier.
CREATE POLICY "Seul le créateur peut modifier sa partie" 
ON parties FOR UPDATE 
USING (auth.uid() = createur_id) 
WITH CHECK (true);
