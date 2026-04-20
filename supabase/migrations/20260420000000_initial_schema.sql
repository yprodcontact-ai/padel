-- Activer l'extension UUID pour la génération d'UID si elle ne l'est pas déjà
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS (Types de données personnalisés)
-- ==========================================
CREATE TYPE user_sexe AS ENUM ('homme', 'femme', 'autre');
CREATE TYPE user_main AS ENUM ('droite', 'gauche', 'ambidextre');
CREATE TYPE user_poste AS ENUM ('droite', 'gauche', 'indifférent');
CREATE TYPE party_type AS ENUM ('loisir', 'match', 'entrainement');
CREATE TYPE party_visibilite AS ENUM ('publique', 'amis');
CREATE TYPE party_statut AS ENUM ('publiee', 'complete', 'confirmee', 'annulee');
CREATE TYPE party_player_statut AS ENUM ('inscrit', 'liste_attente');
CREATE TYPE conversation_type AS ENUM ('groupe', 'prive');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Table "clubs"
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    adresse TEXT,
    ville TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    telephone TEXT,
    email TEXT,
    nb_pistes INTEGER DEFAULT 0,
    description TEXT,
    photo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table "users" (Profils utilisateurs liés à Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nom TEXT,
    prenom TEXT,
    sexe user_sexe,
    date_naissance DATE,
    niveau NUMERIC(3, 1) CHECK (niveau >= 1 AND niveau <= 10), -- e.g. 5.5
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    ville TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    photo_url TEXT,
    main user_main,
    poste user_poste,
    bio TEXT,
    licence_fft TEXT,
    fiabilite_score NUMERIC(3, 1) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table "parties"
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    createur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
    niveau_min NUMERIC(3, 1) CHECK (niveau_min >= 1 AND niveau_min <= 10),
    niveau_max NUMERIC(3, 1) CHECK (niveau_max >= 1 AND niveau_max <= 10),
    type party_type DEFAULT 'loisir',
    visibilite party_visibilite DEFAULT 'publique',
    statut party_statut DEFAULT 'publiee',
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (niveau_min <= niveau_max) -- Validation du niveau
);

-- Table "party_players"
CREATE TABLE party_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    statut party_player_statut DEFAULT 'inscrit',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(party_id, user_id) -- Un joueur ne peut rejoindre une même partie qu'une fois
);

-- Table "conversations"
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID REFERENCES parties(id) ON DELETE CASCADE, -- Optionnel, si la conv est liée à un match
    type conversation_type NOT NULL DEFAULT 'prive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table "conversation_participants"
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (conversation_id, user_id)
);

-- Table "messages"
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table "notifications"
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::JSONB,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. INDEX POUR OPTIMISATION DES REQUÊTES
-- ==========================================
-- Utilisateurs
CREATE INDEX idx_users_ville ON users (ville);
CREATE INDEX idx_users_niveau ON users (niveau);

-- Clubs
CREATE INDEX idx_clubs_ville ON clubs (ville);

-- Parties
CREATE INDEX idx_parties_date_heure ON parties (date_heure);
CREATE INDEX idx_parties_statut ON parties (statut);
CREATE INDEX idx_parties_visibilite ON parties (visibilite);
CREATE INDEX idx_parties_niveau ON parties (niveau_min, niveau_max);
CREATE INDEX idx_parties_club ON parties (club_id);

-- Messages
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_lu ON notifications (user_id, lu);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- --> Utilisateurs
-- Lecture : Tout utilisateur connecté peut voir les autres profils
CREATE POLICY "Les profils sont visibles par les utilisateurs authentifiés" 
ON users FOR SELECT USING (auth.role() = 'authenticated');
-- Modification : On ne peut modifier que son propre profil
CREATE POLICY "Un utilisateur peut modifier son propre profil" 
ON users FOR UPDATE USING (auth.uid() = id);

-- --> Clubs
-- Lecture : Tout le monde (même non authentifié) peut voir les clubs
CREATE POLICY "Les clubs sont publics" 
ON clubs FOR SELECT USING (true);
-- Modification/Création : Restreint aux admins ou avec du code serveur (optionnel)

-- --> Parties (Matchs)
-- Lecture : On peut voir les parties 'publiques' ou celles dont on est le créateur
CREATE POLICY "Les utilisateurs authentifiés voient les parties publiques" 
ON parties FOR SELECT USING (
    (auth.role() = 'authenticated' AND visibilite = 'publique') OR 
    auth.uid() = createur_id
);
-- Insertion : N'importe qui d'authentifié peut créer une partie
CREATE POLICY "Création de partie authentifiée" 
ON parties FOR INSERT WITH CHECK (auth.uid() = createur_id);
-- Modification : Seulement le créateur de la partie
CREATE POLICY "Seul le créateur peut modifier sa partie" 
ON parties FOR UPDATE USING (auth.uid() = createur_id);
-- Suppression : Seulement le créateur
CREATE POLICY "Seul le créateur peut supprimer sa partie" 
ON parties FOR DELETE USING (auth.uid() = createur_id);

-- --> Joueurs de partie (Party_players)
-- Lecture : Tout utilisateur authentifié peut voir qui est dans une partie
CREATE POLICY "Lecture des participants d'une partie" 
ON party_players FOR SELECT USING (auth.role() = 'authenticated');
-- Insertion : Un utilisateur s'inscrit lui-même ou est ajouté par le créateur du match
CREATE POLICY "Inscription à une partie" 
ON party_players FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM parties WHERE id = party_players.party_id AND createur_id = auth.uid())
);
-- Modification/Suppression : Peut se retirer lui-même ou le créateur le retire
CREATE POLICY "Désinscription ou gestion des joueurs" 
ON party_players FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM parties WHERE id = party_players.party_id AND createur_id = auth.uid())
);
CREATE POLICY "Modification statut joueur" 
ON party_players FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM parties WHERE id = party_players.party_id AND createur_id = auth.uid())
);

-- --> Conversations & Participants
-- Lecture Conversations : Uniquement les participants
CREATE POLICY "Seuls les participants voient la conversation" 
ON conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
-- Lecture Participants : Restreint à la vue d'ensemble (tous les utilsateurs peuvent voir) ou sécurisé
CREATE POLICY "Voir les participants si on fait soi-même partie de la conversation" 
ON conversation_participants FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())
);

-- --> Messages
-- Lecture : Celui qui fait partie de la conversation peut lire
CREATE POLICY "Lecture messages pour participants" 
ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
-- Envoi (Insertion) : Le sender doit être authentifié et dans la conversation
CREATE POLICY "Envoi de messages" 
ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- --> Notifications
-- Lecture / Update / Delete : N'interagit qu'avec ses PROPRES notifications
CREATE POLICY "Gérer ses notifications" 
ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Modifier ses notifications (lu/non lu)" 
ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Supprimer ses notifications" 
ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. TRIGGERS (Optionnels mais recommandés)
-- ==========================================

-- Trigger: Création auto d'un "user" public quand qqun s'inscrit dans auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
