BEGIN;

CREATE OR REPLACE FUNCTION system_complete_party(p_party_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_conversation_id UUID;
    v_creator_id UUID;
    v_participant_id UUID;
BEGIN
    -- Update party status and recover creator ID
    UPDATE parties SET statut = 'complete' WHERE id = p_party_id RETURNING createur_id INTO v_creator_id;

    -- Avoid duplications if triggered twice
    SELECT id INTO v_conversation_id FROM conversations WHERE party_id = p_party_id;

    IF v_conversation_id IS NULL THEN
        -- Create conversation
        INSERT INTO conversations (party_id, type) VALUES (p_party_id, 'groupe') RETURNING id INTO v_conversation_id;
        
        -- Insert participants
        INSERT INTO conversation_participants (conversation_id, user_id)
        SELECT v_conversation_id, user_id FROM party_players WHERE party_id = p_party_id;
        
        -- Insert initial system message
        INSERT INTO messages (conversation_id, sender_id, contenu)
        VALUES (v_conversation_id, p_user_id, 'La partie est complète ! Vous pouvez discuter ici.');

        -- Notifications Creator
        INSERT INTO notifications (user_id, type, payload)
        VALUES (v_creator_id, 'party_complete', '{"message": "Votre partie est complète ! Pensez à réserver le terrain et confirmer."}'::jsonb);

        -- Notifications joined players
        FOR v_participant_id IN SELECT user_id FROM party_players WHERE party_id = p_party_id AND user_id != v_creator_id LOOP
            INSERT INTO notifications (user_id, type, payload)
            VALUES (v_participant_id, 'party_complete', '{"message": "La partie rejointe est maintenant complète !"}'::jsonb);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
