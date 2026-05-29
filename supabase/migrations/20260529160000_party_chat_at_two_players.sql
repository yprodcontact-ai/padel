-- Migration to create the party chat when at least 2 players are registered,
-- and sync players (add/remove) to the conversation.

BEGIN;

-- 1. Create a function to handle sync between party_players and conversation_participants
CREATE OR REPLACE FUNCTION public.handle_party_players_chat_sync()
RETURNS TRIGGER AS $$
DECLARE
    v_conversation_id UUID;
    v_player_count INTEGER;
    v_creator_id UUID;
BEGIN
    -- 1. Count current 'inscrit' players for this party
    SELECT COUNT(*) INTO v_player_count
    FROM public.party_players
    WHERE party_id = COALESCE(NEW.party_id, OLD.party_id) AND statut = 'inscrit';

    -- Get conversation ID if it exists
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE party_id = COALESCE(NEW.party_id, OLD.party_id);

    -- 2. If we have at least 2 players, ensure conversation exists
    IF v_player_count >= 2 THEN
        IF v_conversation_id IS NULL THEN
            -- Get creator ID to use as sender for the system message
            SELECT createur_id INTO v_creator_id
            FROM public.parties
            WHERE id = COALESCE(NEW.party_id, OLD.party_id);

            -- Create the conversation
            INSERT INTO public.conversations (party_id, type)
            VALUES (COALESCE(NEW.party_id, OLD.party_id), 'groupe')
            RETURNING id INTO v_conversation_id;

            -- Insert all current 'inscrit' players as participants
            INSERT INTO public.conversation_participants (conversation_id, user_id)
            SELECT v_conversation_id, user_id
            FROM public.party_players
            WHERE party_id = COALESCE(NEW.party_id, OLD.party_id) AND statut = 'inscrit'
            ON CONFLICT DO NOTHING;

            -- Insert initial system message
            INSERT INTO public.messages (conversation_id, sender_id, contenu)
            VALUES (v_conversation_id, COALESCE(v_creator_id, COALESCE(NEW.user_id, OLD.user_id)), 'Le chat de la partie est ouvert ! Vous pouvez discuter ici.');
        END IF;
    END IF;

    -- 3. Sync individual participant on INSERT/UPDATE/DELETE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.statut = 'inscrit' THEN
            -- If conversation exists, ensure player is a participant
            IF v_conversation_id IS NOT NULL THEN
                INSERT INTO public.conversation_participants (conversation_id, user_id)
                VALUES (v_conversation_id, NEW.user_id)
                ON CONFLICT (conversation_id, user_id) DO UPDATE SET archived = false;
            END IF;
        ELSE
            -- If status is changed from 'inscrit' to something else, remove player from participants
            IF v_conversation_id IS NOT NULL THEN
                DELETE FROM public.conversation_participants
                WHERE conversation_id = v_conversation_id AND user_id = NEW.user_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove player from participants
        IF v_conversation_id IS NOT NULL THEN
            DELETE FROM public.conversation_participants
            WHERE conversation_id = v_conversation_id AND user_id = OLD.user_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_party_players_chat_sync ON public.party_players;
CREATE TRIGGER on_party_players_chat_sync
    AFTER INSERT OR UPDATE OR DELETE ON public.party_players
    FOR EACH ROW EXECUTE FUNCTION public.handle_party_players_chat_sync();


-- 2. Update system_complete_party to support pre-existing conversations
CREATE OR REPLACE FUNCTION system_complete_party(p_party_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_conversation_id UUID;
    v_creator_id UUID;
    v_participant_id UUID;
    v_date_heure TIMESTAMPTZ;
    v_date_str TEXT;
    v_time_str TEXT;
    v_notif_message TEXT;
BEGIN
    -- Update party status and recover creator ID + date
    UPDATE parties SET statut = 'complete' WHERE id = p_party_id RETURNING createur_id, date_heure INTO v_creator_id, v_date_heure;

    -- Format date and time
    v_date_str := TO_CHAR(v_date_heure, 'DD/MM');
    v_time_str := TO_CHAR(v_date_heure, 'HH24:MI');
    v_notif_message := 'Votre partie du ' || v_date_str || ' à ' || v_time_str || ' est complète ! Réservez le terrain dès maintenant.';

    -- Get conversation ID
    SELECT id INTO v_conversation_id FROM conversations WHERE party_id = p_party_id;

    IF v_conversation_id IS NULL THEN
        -- Create conversation (fallback if trigger didn't run or wasn't active)
        INSERT INTO conversations (party_id, type) VALUES (p_party_id, 'groupe') RETURNING id INTO v_conversation_id;
        
        -- Insert participants
        INSERT INTO conversation_participants (conversation_id, user_id)
        SELECT v_conversation_id, user_id FROM party_players WHERE party_id = p_party_id AND statut = 'inscrit';
        
        -- Insert initial system message
        INSERT INTO messages (conversation_id, sender_id, contenu)
        VALUES (v_conversation_id, p_user_id, 'La partie est complète ! Vous pouvez discuter ici.');
    ELSE
        -- Insert system message to announce completeness (ensure not duplicated)
        IF NOT EXISTS (
            SELECT 1 FROM messages 
            WHERE conversation_id = v_conversation_id 
              AND contenu = 'La partie est complète ! Vous pouvez discuter ici.'
        ) THEN
            INSERT INTO messages (conversation_id, sender_id, contenu)
            VALUES (v_conversation_id, p_user_id, 'La partie est complète ! Vous pouvez discuter ici.');
        END IF;
    END IF;

    -- Notifications Creator
    INSERT INTO notifications (user_id, type, payload)
    VALUES (v_creator_id, 'party_complete', jsonb_build_object('message', v_notif_message, 'party_id', p_party_id::text));

    -- Notifications joined players
    FOR v_participant_id IN SELECT user_id FROM party_players WHERE party_id = p_party_id AND user_id != v_creator_id AND statut = 'inscrit' LOOP
        INSERT INTO notifications (user_id, type, payload)
        VALUES (v_participant_id, 'party_complete', jsonb_build_object('message', v_notif_message, 'party_id', p_party_id::text));
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
