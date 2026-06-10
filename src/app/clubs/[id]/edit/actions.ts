'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateClub(formData: FormData) {
  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    redirect('/login')
  }

  const userId = authData.user.id
  const clubId = formData.get('club_id') as string

  if (!clubId) {
    redirect('/clubs')
  }

  // 1. Authorization check: must be admin or manager of the club
  const [userProfile, managerCheck] = await Promise.all([
    supabase.from('users').select('is_admin').eq('id', userId).single(),
    supabase.from('club_managers').select('role').eq('club_id', clubId).eq('user_id', userId).maybeSingle()
  ])

  const isAuthorized = userProfile.data?.is_admin === true || !!managerCheck.data

  if (!isAuthorized) {
    redirect(`/clubs/${clubId}`)
  }

  let photoUrl = null
  let coverUrl = null

  // 2. Process Club Logo Upload
  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop()
    const filePath = `club-logo-${clubId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, photoFile)

    if (uploadError) {
      console.error('Error uploading club logo:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)
      photoUrl = publicUrlData.publicUrl
    }
  }

  // 3. Process Club Cover Upload
  const coverFile = formData.get('cover') as File | null
  if (coverFile && coverFile.size > 0) {
    const fileExt = coverFile.name.split('.').pop()
    const filePath = `club-cover-${clubId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, coverFile)

    if (uploadError) {
      console.error('Error uploading club cover:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)
      coverUrl = publicUrlData.publicUrl
    }
  }

  // 4. Assemble updates
  const nom = formData.get('nom') as string
  const description = formData.get('description') as string
  const adresse = formData.get('adresse') as string
  const ville = formData.get('ville') as string
  const telephone = formData.get('telephone') as string
  const email = formData.get('email') as string
  const nb_pistes_str = formData.get('nb_pistes') as string
  const nb_pistes = nb_pistes_str ? parseInt(nb_pistes_str, 10) : 0

  const updates: Record<string, string | number | null> = {
    nom,
    description,
    adresse,
    ville,
    telephone,
    email,
    nb_pistes,
    ...(photoUrl ? { photo_url: photoUrl } : {}),
    ...(coverUrl ? { cover_image_url: coverUrl } : {}),
  }

  // 5. Update club in DB
  const { error: updateError } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', clubId)

  if (updateError) {
    console.error('Error updating club details:', updateError)
    redirect(`/clubs/${clubId}/edit?error=Erreur lors de la sauvegarde`)
  }

  // 6. Revalidate cache and redirect
  revalidatePath(`/clubs/${clubId}`)
  revalidatePath('/clubs')
  revalidatePath('/')
  
  redirect(`/clubs/${clubId}`)
}
