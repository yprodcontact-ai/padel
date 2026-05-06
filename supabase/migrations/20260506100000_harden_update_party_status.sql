-- Renforcement du RPC system_update_party_status :
--  · vérifie l'authentification du caller
--  · n'autorise que les transitions complete -> confirmee | annulee
--  · n'autorise que le créateur ou un joueur "inscrit" à appeler
BEGIN;

CREATE OR REPLACE FUNCTION system_update_party_status(p_party_id UUID, p_status TEXT)
RETURNS void AS $$
DECLARE
    v_caller UUID := auth.uid();
    v_creator UUID;
    v_status party_statut;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Non authentifié';
    END IF;

    SELECT createur_id, statut INTO v_creator, v_status
    FROM parties WHERE id = p_party_id;

    IF v_creator IS NULL THEN
        RAISE EXCEPTION 'Partie introuvable';
    END IF;

    IF NOT (
        v_creator = v_caller
        OR EXISTS (
            SELECT 1 FROM party_players
            WHERE party_id = p_party_id AND user_id = v_caller AND statut = 'inscrit'
        )
    ) THEN
        RAISE EXCEPTION 'Non autorisé';
    END IF;

    IF v_status <> 'complete' THEN
        RAISE EXCEPTION 'La partie doit être complète pour modifier le statut';
    END IF;

    IF p_status NOT IN ('confirmee', 'annulee') THEN
        RAISE EXCEPTION 'Statut cible invalide';
    END IF;

    UPDATE parties SET statut = p_status::party_statut WHERE id = p_party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
