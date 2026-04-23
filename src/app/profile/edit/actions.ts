'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
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

  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  const date_naissance = formData.get('date_naissance') as string
  const sexe = formData.get('sexe') as 'homme' | 'femme' | 'autre'
  const ville = formData.get('ville') as string
  const licence_fft = formData.get('licence_fft') as string
  const classement_fft_str = formData.get('classement_fft') as string
  const classement_fft = classement_fft_str ? parseInt(classement_fft_str, 10) : null
  const niveau = parseFloat(formData.get('niveau') as string)
  const club_id = formData.get('club_id') as string
  const main = formData.get('main') as 'droite' | 'gauche' | 'ambidextre'
  const poste = formData.get('poste') as 'droite' | 'gauche' | 'indifférent'
  const notify_new_parties = formData.get('notify_new_parties') === 'true'

  const updates = {
    nom,
    prenom,
    date_naissance: date_naissance || null,
    sexe,
    ville,
    licence_fft,
    classement_fft,
    niveau,
    club_id: (club_id && club_id !== "none") ? club_id : null,
    main,
    poste,
    notify_new_parties,
    ...(photoUrl ? { photo_url: photoUrl } : {}),
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    redirect('/profile/edit?error=Erreur lors de la sauvegarde du profil')
  }

  revalidatePath('/profile')
  redirect('/profile')
}
