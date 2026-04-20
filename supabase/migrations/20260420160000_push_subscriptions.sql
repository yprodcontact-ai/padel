BEGIN;

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère ses propres push_subscriptions" ON push_subscriptions 
FOR ALL USING (auth.uid() = user_id);

-- En cas d'insert ou update (upsert)
CREATE POLICY "Insert push_subscriptions" ON push_subscriptions 
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

COMMIT;
