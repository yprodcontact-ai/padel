'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createParty(formData: FormData) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  const club_id = formData.get('club_id') as string // required
  const date_heure = formData.get('date_heure') as string // required
  const niveau_min = parseFloat(formData.get('niveau_min') as string)
  const niveau_max = parseFloat(formData.get('niveau_max') as string)
  const type = formData.get('type') as 'loisir' | 'match' | 'entrainement'
  const visibilite = formData.get('visibilite') as 'publique' | 'amis'
  const commentaire = formData.get('commentaire') as string

  const { data, error } = await supabase.from('parties').insert([
    {
      createur_id: authData.user.id,
      club_id: club_id === 'none' ? null : club_id,
      date_heure,
      niveau_min,
      niveau_max,
      type: type || 'loisir',
      visibilite: visibilite || 'publique',
      commentaire: commentaire || null,
      statut: 'publiee'
    }
  ]).select().single()

  if (error || !data) {
    console.error('Error creating party', error)
    // Could redirect to an error page or return an error object
    redirect('/parties/create?error=Erreur lors de la création')
  }

  revalidatePath('/parties')
  revalidatePath('/')
  
  // Navigate to the newly created match!
  redirect(`/parties/${data.id}`)
}
