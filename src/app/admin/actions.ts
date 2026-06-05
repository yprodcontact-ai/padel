'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateClubBanner(
  clubId: string,
  bannerImageUrl: string | null,
  bannerDestinationUrl: string | null
) {
  const supabase = createClient()
  
  // 1. Get logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Non connecté.' }
  }

  // 2. Security Check: Verify user is admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.is_admin) {
    return { success: false, error: 'Non autorisé.' }
  }

  // 3. Update the club banner fields
  const { error: updateError } = await supabase
    .from('clubs')
    .update({
      banner_image_url: bannerImageUrl || null,
      banner_destination_url: bannerDestinationUrl || null
    })
    .eq('id', clubId)

  if (updateError) {
    console.error('Error updating club banner:', updateError)
    return { success: false, error: 'Erreur lors de la mise à jour.' }
  }

  // 4. Revalidate paths to reflect updates immediately
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/clubs')
  revalidatePath(`/clubs/${clubId}`)

  return { success: true }
}
