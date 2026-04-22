'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function searchClubPlayers(clubId: string, query: string) {
  if (!query || query.length < 2) return []
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, prenom, nom, photo_url, niveau')
    .eq('club_id', clubId)
    .neq('id', authData.user.id)
    .or(`prenom.ilike.%${query}%,nom.ilike.%${query}%`)
    .limit(10)

  if (error) { console.error('Error searching players:', error); return [] }
  return data || []
}

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

  // Insert creator as first player
  const playersToInsert: { party_id: string; user_id: string; statut: string }[] = [
    { party_id: data.id, user_id: authData.user.id, statut: 'inscrit' }
  ]

  // Add invited players (max 2)
  const invitedPlayersRaw = formData.get('invited_players') as string
  if (invitedPlayersRaw) {
    try {
      const invitedIds: string[] = JSON.parse(invitedPlayersRaw)
      for (const id of invitedIds.slice(0, 2)) {
        if (id !== authData.user.id) {
          playersToInsert.push({ party_id: data.id, user_id: id, statut: 'inscrit' })
        }
      }
    } catch { /* ignore parse errors */ }
  }

  const { error: playerError } = await supabase.from('party_players').insert(playersToInsert)

  if (playerError) {
    console.error('Error adding players to party_players', playerError)
  }

  revalidatePath('/parties')
  revalidatePath('/')
  
  // Navigate to the newly created match!
  redirect(`/parties/${data.id}`)
}
