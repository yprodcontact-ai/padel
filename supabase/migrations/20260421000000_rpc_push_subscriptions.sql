BEGIN;

CREATE OR REPLACE FUNCTION get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    endpoint TEXT,
    p256dh TEXT,
    auth TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY 
    SELECT p.id, p.user_id, p.endpoint, p.p256dh, p.auth 
    FROM push_subscriptions p 
    WHERE p.user_id = p_user_id;
END;
$$;

COMMIT;
