-- Insertion du club principal
-- Cet UUID est généré statiquement pour être consistant.

INSERT INTO public.clubs (id, nom, adresse, ville, lat, lng, telephone, email, nb_pistes, description, verified)
VALUES
('f6b15e45-d8aa-4628-98e3-cf9e3388c3a1', 'Tennis Club Aubenas', 'Quartier Roqua', 'Aubenas', 44.616, 4.398, '+33 4 75 35 15 25', 'contact@tennisclubaubenas.fr', 2, 'Club de tennis et de padel chaleureux à Aubenas.', true)
ON CONFLICT (id) DO UPDATE SET
  nom = EXCLUDED.nom,
  adresse = EXCLUDED.adresse,
  ville = EXCLUDED.ville,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  telephone = EXCLUDED.telephone,
  email = EXCLUDED.email,
  nb_pistes = EXCLUDED.nb_pistes,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified;
