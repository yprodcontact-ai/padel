'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    redirect('/login')
  }

  const userId = authData.user.id

  let photoUrl = null

  // Process File Upload
  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop()
    const filePath = `${userId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, photoFile)

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)
      photoUrl = publicUrlData.publicUrl
    }
  }

  // Extract other fields
  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  const date_naissance = formData.get('date_naissance') as string
  const sexe = formData.get('sexe') as 'homme' | 'femme' | 'autre'
  const ville = formData.get('ville') as string
  const niveau = parseFloat(formData.get('niveau') as string)
  const club_id = formData.get('club_id') as string // UUID optionnel
  const classement_fft_str = formData.get('classement_fft') as string
  const classement_fft = classement_fft_str ? parseInt(classement_fft_str, 10) : null
  const main = formData.get('main') as 'droite' | 'gauche' | 'ambidextre'
  const poste = formData.get('poste') as 'droite' | 'gauche' | 'indifférent'

  const { error: updateError } = await supabase
    .from('users')
    .update({
      nom,
      prenom,
      date_naissance: date_naissance || null,
      sexe,
      ville,
      niveau,
      club_id: club_id ? club_id : null,
      classement_fft,
      main,
      poste,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    redirect('/onboarding?error=Erreur lors de la sauvegarde du profil')
  }

  // Redirection vers l'accueil quand complété
  redirect('/')
}

export async function getClubs() {
  const supabase = createClient()
  const { data, error } = await supabase.from('clubs').select('id, nom, ville').order('nom')
  if (error) {
    console.error('Error fetching clubs', error)
    return []
  }
  return data
}
