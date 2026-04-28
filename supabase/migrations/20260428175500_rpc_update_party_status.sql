BEGIN;

CREATE OR REPLACE FUNCTION system_update_party_status(p_party_id UUID, p_status TEXT)
RETURNS void AS $$
BEGIN
    UPDATE parties SET statut = p_status WHERE id = p_party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
