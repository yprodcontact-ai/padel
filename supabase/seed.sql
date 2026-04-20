-- Insertion de 10 clubs de test dans la table "clubs"
-- Ces UUIDs sont générés statiquement pour être consistants.

INSERT INTO public.clubs (id, nom, adresse, ville, lat, lng, telephone, email, nb_pistes, description, verified)
VALUES
('b3fb7db6-0c8a-4468-b78f-6f2942bbcd91', 'Casa Padel', '103 rue Charles Michels', 'Saint-Denis', 48.924, 2.348, '+33 1 84 21 49 00', 'contact@casapadel.fr', 12, 'Le plus grand centre indoor de la région parisienne avec 12 terrains.', true),
('e43c5b89-a21b-4fd5-87bd-85dadd007a44', 'Padel Horizon', '3 Bis Rue de Paris', 'Sucy-en-Brie', 48.775, 2.525, '+33 1 45 90 21 00', 'hello@padelhorizon.fr', 6, 'Club historique avec 6 superbes terrains couverts.', true),
('707cb9b1-eb95-46f4-a039-448e9a2f7c00', '4Padel Montreuil', '163 Rue de la Nouvelle France', 'Montreuil', 48.868, 2.474, '+33 1 48 55 58 58', 'montreuil@4padel.fr', 5, 'Complexe urbain moderne, très facile d''accès.', true),
('1b920b7c-ffb2-4d1a-8bb7-ebc26d0399d8', 'Padel Camp', 'Chemin du Moulin', 'Bordeaux', 44.837, -0.579, '+33 5 56 00 11 22', 'contact@padelcamp-bx.fr', 4, 'Ambiance conviviale en plein cœur du sud ouest.', false),
('649dd025-da25-42cf-9615-585bb7813a37', 'Tennis Club de Lyon', 'Boulevard du 11 Novembre', 'Lyon', 45.750, 4.850, '+33 4 78 50 50 50', 'padel@tclyon.fr', 3, '3 pistes flambant neuves au sein d''un club de tennis renommé.', true),
('f6b15e45-d8aa-4628-98e3-cf9e3388c3a1', 'Padel Arena', 'Zone Industrielle', 'Toulouse', 43.604, 1.444, '+33 5 61 22 33 44', 'contact@padelarena-tlse.fr', 8, '8 pistes panoramiques indoor pour des matchs incroyables.', true),
('2dcd5db7-c3cd-4614-a9df-6d73ca80cf75', 'Racket Park', 'Avenue de la Mer', 'Montpellier', 43.610, 3.876, '+33 4 67 01 02 03', 'hello@racketpark.com', 4, 'Club en périphérie avec parking gratuit.', false),
('1a94a28f-7fbb-49e0-82cc-5b0c79ca2866', 'Lille Padel Club', 'Porte de Douai', 'Lille', 50.629, 3.057, '+33 3 20 40 50 60', 'contact@lillepadel.fr', 6, 'Au cœur du campus et très prisé par les étudiants.', true),
('918d36eb-f7fe-4a0b-ae96-bceee4eec80e', 'Marseille Padel', 'Prado', 'Marseille', 43.296, 5.369, '+33 4 91 10 20 30', 'team@marseillepadel.fr', 5, 'Jouez en extérieur sous le soleil toute l''année !', true),
('8b3aa0cc-d5f0-4fe4-aa3d-d1ef1065f49e', 'Nantes Padel Experience', 'Route de Vannes', 'Nantes', 47.218, -1.553, '+33 2 40 80 90 00', 'hello@nantespadel.com', 7, 'Le temple du Padel dans l''Ouest de la France.', true)
ON CONFLICT (id) DO NOTHING;
