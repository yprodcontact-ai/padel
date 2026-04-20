-- Insertion du bucket 'avatars' (si non existant via insert select)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Autoriser la lecture publique des avatars
CREATE POLICY "Avatar public access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Autoriser un utilisateur à uploader son avatar
-- La condition auth.uid() s'assure qu'ils sont connectés
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Autoriser un utilisateur à mettre à jour son propre avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Autoriser un utilisateur à supprimer son propre avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );
