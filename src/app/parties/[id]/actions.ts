'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinParty(partyId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { error: 'Non authentifié' }
  }

  const userId = authData.user.id

  // 1. Insert player
  const { error: insertError } = await supabase.from('party_players').insert([
    { party_id: partyId, user_id: userId, statut: 'inscrit' }
  ])

  if (insertError) {
    console.error('Error joining party:', insertError)
    return { error: 'Erreur lors de l\'inscription' }
  }

  // 2. Count players
  const { count, error: countError } = await supabase
    .from('party_players')
    .select('*', { count: 'exact', head: true })
    .eq('party_id', partyId)

  if (!countError && count === 4) {
    // 3. Update status to 'complete'
    await supabase.from('parties').update({ statut: 'complete' }).eq('id', partyId)

    // 3.5 Create Conversation for the match
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({ party_id: partyId, type: 'groupe' })
      .select('id')
      .single()

    if (convData && !convError) {
        const { data: currentPlayers } = await supabase.from('party_players').select('user_id').eq('party_id', partyId)
        if (currentPlayers) {
            const participants = currentPlayers.map(p => ({
                conversation_id: convData.id,
                user_id: p.user_id
            }))
            await supabase.from('conversation_participants').insert(participants)
            
            await supabase.from('messages').insert({
                conversation_id: convData.id,
                sender_id: userId, 
                contenu: 'La partie est complète ! Vous pouvez discuter ici.',
            })
        }
    }

    // 4. Notifications
    const { data: partyData } = await supabase.from('parties').select('createur_id').eq('id', partyId).single()
    
    if (partyData) {
        const { data: players } = await supabase.from('party_players').select('user_id').eq('party_id', partyId)
        
        const notifications: { user_id: string; type: string; payload: Record<string, string> }[] = []
        
        // Notify creator
        notifications.push({
            user_id: partyData.createur_id,
            type: 'party_complete',
            payload: { message: 'Votre partie est complète ! Pensez à réserver le terrain et confirmer.' }
        })

        // Notify other players
        if (players) {
            for (const player of players) {
                if (player.user_id !== partyData.createur_id) {
                    notifications.push({
                        user_id: player.user_id,
                        type: 'party_complete',
                        payload: { message: 'La partie que vous avez rejointe est maintenant complète ! En attente de réservation par le créateur.' }
                    })
                }
            }
        }

        if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications)
        }
    }
  }

  revalidatePath(`/parties/${partyId}`)
  return { success: true }
}

export async function leaveParty(partyId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  const { error: deleteError } = await supabase
    .from('party_players')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error leaving party:', deleteError)
    return { error: 'Erreur lors du désistement' }
  }

  // Check if it was complete and revert to publiee
  const { data: party } = await supabase.from('parties').select('statut').eq('id', partyId).single()
  if (party && party.statut === 'complete') {
      await supabase.from('parties').update({ statut: 'publiee' }).eq('id', partyId)
  }

  revalidatePath(`/parties/${partyId}`)
  return { success: true }
}

export async function updatePartyStatus(partyId: string, action: 'confirm' | 'cancel') {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // Verify ownership
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('createur_id, statut')
    .eq('id', partyId)
    .single()

  if (partyError || !party || party.createur_id !== userId) {
    return { error: 'Non autorisé' }
  }

  const newStatus = action === 'confirm' ? 'confirmee' : 'annulee'

  const { error: updateError } = await supabase
    .from('parties')
    .update({ statut: newStatus })
    .eq('id', partyId)

  if (updateError) {
    return { error: 'Erreur lors de la mise à jour du statut' }
  }

  // Notifications
  const { data: players } = await supabase.from('party_players').select('user_id').eq('party_id', partyId)
  if (players && players.length > 0) {
      const notifications: { user_id: string; type: string; payload: Record<string, string> }[] = []
      
      for (const player of players) {
          if (player.user_id !== userId) {
              notifications.push({
                  user_id: player.user_id,
                  type: action === 'confirm' ? 'party_confirmed' : 'party_cancelled',
                  payload: { 
                      message: action === 'confirm' 
                        ? 'Le terrain a bien été réservé. Préparez-vous à jouer !' 
                        : 'Malheureusement, le créneau était indisponible et la partie a été annulée.' 
                  }
              })
          }
      }

      if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
      }
  }

  revalidatePath(`/parties/${partyId}`)
  return { success: true }
}
