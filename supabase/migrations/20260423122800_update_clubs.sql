-- Suppression de tous les anciens clubs de test sauf Padel Arena (f6b15e45-d8aa-4628-98e3-cf9e3388c3a1)
DELETE FROM public.clubs
WHERE id != 'f6b15e45-d8aa-4628-98e3-cf9e3388c3a1';

-- Mise à jour du club conservé pour le renommer en "Tennis Club Aubenas"
UPDATE public.clubs
SET nom = 'Tennis Club Aubenas',
    adresse = 'Quartier Roqua',
    ville = 'Aubenas',
    lat = 44.616,
    lng = 4.398,
    telephone = '+33 4 75 35 15 25',
    email = 'contact@tennisclubaubenas.fr',
    nb_pistes = 2,
    description = 'Club de tennis et de padel chaleureux à Aubenas.',
    verified = true
WHERE id = 'f6b15e45-d8aa-4628-98e3-cf9e3388c3a1';
