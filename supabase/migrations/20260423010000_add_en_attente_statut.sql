-- Add 'en_attente' value to the party_player_statut enum for pending join requests
ALTER TYPE party_player_statut ADD VALUE IF NOT EXISTS 'en_attente';
