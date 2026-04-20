BEGIN;

-- Drop exists carefully or recreate
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Publications in Supabase dictates what rows are pushed to Realtime.
CREATE PUBLICATION supabase_realtime;

-- Add our messaging table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

COMMIT;
