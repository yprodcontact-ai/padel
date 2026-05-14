'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { formatDateShort, formatTime } from '@/lib/date-utils'

export async function joinParty(partyId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { error: 'Non authentifié' }
  }

  const userId = authData.user.id

  const { checkUserActiveParty } = await import('@/lib/party-utils')
  const isActive = await checkUserActiveParty(userId)
  if (isActive) {
    return { error: "Vous êtes déjà inscrit à 2 parties à venir. Vous pourrez en rejoindre une autre 5 minutes après le début de l'une d'elles." }
  }

  // Fetch party level requirements
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('niveau_min, niveau_max, createur_id, date_heure')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return { error: 'Partie introuvable' }
  }

  // Fetch the user's level
  const { data: userProfile } = await supabase
    .from('users')
    .select('niveau, prenom, nom')
    .eq('id', userId)
    .single()

  const userLevel = userProfile?.niveau ? parseFloat(userProfile.niveau) : null

  // Determine join status based on level
  let joinStatus: 'inscrit' | 'en_attente' = 'inscrit'

  if (userLevel !== null && party.niveau_min !== null) {
    if (userLevel < party.niveau_min) {
      // Level below range → pending request
      joinStatus = 'en_attente'
    }
    // If level is within range or above, direct join
  }

  // 1. Insert player with appropriate status
  const { error: insertError } = await supabase.from('party_players').insert([
    { party_id: partyId, user_id: userId, statut: joinStatus }
  ])

  if (insertError) {
    console.error('Error joining party:', insertError)
    return { error: 'Erreur lors de l\'inscription' }
  }

  // If pending request, notify the creator
  if (joinStatus === 'en_attente') {
    const playerName = userProfile ? `${userProfile.prenom} ${userProfile.nom}` : 'Un joueur'
    
    // Create notification for creator
    await supabase.from('notifications').insert([{
      user_id: party.createur_id,
      type: 'join_request',
      payload: {
        message: `${playerName} (Niv. ${userLevel ?? '?'}) souhaite rejoindre votre partie`,
        party_id: partyId,
        requester_id: userId,
      }
    }])

    // Push notification
    const { data: cUser } = await supabase.from('users').select('notify_party_updates').eq('id', party.createur_id).single()
    if (cUser?.notify_party_updates !== false) {
      const { sendPushNotification } = await import('@/lib/push')
      await sendPushNotification(party.createur_id, {
        title: 'Demande de participation 🙋',
        message: `${playerName} (Niv. ${userLevel ?? '?'}) souhaite rejoindre votre partie`,
        url: `/parties/${partyId}`
      })
    }

    revalidatePath(`/parties/${partyId}`)
    return { success: true, status: 'en_attente' }
  }

  // 2. If directly joined, count players to check for completion
  const { count, error: countError } = await supabase
    .from('party_players')
    .select('*', { count: 'exact', head: true })
    .eq('party_id', partyId)
    .eq('statut', 'inscrit')

  if (!countError && count === 4) {
    // SECURITY DEFINER RPC Call pour contourner tous les RLS d'un coup de manière atomique.
    const { error: rpcError } = await supabase.rpc('system_complete_party', {
        p_party_id: partyId,
        p_user_id: userId
    })

    if (rpcError) {
        console.error("Error executing system_complete_party RPC:", rpcError)
    } else {
        const { data: players } = await supabase.from('party_players').select('user_id, users(notify_party_updates)').eq('party_id', partyId).eq('statut', 'inscrit')
        if (players) {
            const { sendPushNotification } = await import('@/lib/push')
            let dateStr = ''
            let timeStr = ''
                if (party?.date_heure) {
                    dateStr = formatDateShort(party.date_heure)
                    timeStr = formatTime(party.date_heure)
                }
            for (const pl of players) {
                if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
                    await sendPushNotification(pl.user_id, {
                        title: 'Partie complète ! 💪',
                        message: `Votre partie du ${dateStr} à ${timeStr} est complète ! Réservez le terrain dès maintenant.`,
                        url: `/parties/${partyId}`
                    })
                }
            }
        }
    }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true, status: 'inscrit' }
}

export async function handleJoinRequest(partyId: string, requesterId: string, action: 'accept' | 'reject') {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  // Verify the current user is the party creator
  const { data: party } = await supabase
    .from('parties')
    .select('createur_id, date_heure')
    .eq('id', partyId)
    .single()

  if (!party || party.createur_id !== authData.user.id) {
    return { error: 'Non autorisé' }
  }

  if (action === 'accept') {
    const { checkUserActiveParty } = await import('@/lib/party-utils')
    const isActive = await checkUserActiveParty(requesterId)
    if (isActive) {
      return { error: "Ce joueur est déjà inscrit à 2 parties à venir." }
    }

    // Update player status to 'inscrit'
    const { error: updateError } = await supabase
      .from('party_players')
      .update({ statut: 'inscrit' })
      .eq('party_id', partyId)
      .eq('user_id', requesterId)

    if (updateError) {
      console.error('Error accepting join request:', updateError)
      return { error: 'Erreur lors de l\'acceptation' }
    }

    // Notify the requester
    await supabase.from('notifications').insert([{
      user_id: requesterId,
      type: 'join_accepted',
      payload: { message: 'Votre demande a été acceptée ! Vous êtes inscrit à la partie 🎉', party_id: partyId }
    }])

    const { data: rUser } = await supabase.from('users').select('notify_party_updates').eq('id', requesterId).single()
    const { sendPushNotification } = await import('@/lib/push')
    if (rUser?.notify_party_updates !== false) {
      await sendPushNotification(requesterId, {
        title: 'Demande acceptée ! 🎉',
        message: 'Votre demande a été acceptée. Vous êtes inscrit à la partie !',
        url: `/parties/${partyId}`
      })
    }

    // Check if party is now complete
    const { count } = await supabase
      .from('party_players')
      .select('*', { count: 'exact', head: true })
      .eq('party_id', partyId)
      .eq('statut', 'inscrit')

    if (count === 4) {
      const { error: rpcError } = await supabase.rpc('system_complete_party', {
        p_party_id: partyId,
        p_user_id: authData.user.id
      })

      if (rpcError) {
        console.error("Error executing system_complete_party RPC:", rpcError)
      } else {
        const { data: players } = await supabase.from('party_players').select('user_id, users(notify_party_updates)').eq('party_id', partyId).eq('statut', 'inscrit')
        if (players) {
          let dateStr = ''
          let timeStr = ''
          if (party?.date_heure) {
            dateStr = formatDateShort(party.date_heure)
            timeStr = formatTime(party.date_heure)
          }
          for (const pl of players) {
            if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
              await sendPushNotification(pl.user_id, {
                title: 'Partie complète ! 💪',
                message: `Votre partie du ${dateStr} à ${timeStr} est complète ! Réservez le terrain dès maintenant.`,
                url: `/parties/${partyId}`
              })
            }
          }
        }
      }
    }
  } else {
    // Reject: delete the player entry
    const { error: deleteError } = await supabase
      .from('party_players')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', requesterId)

    if (deleteError) {
      console.error('Error rejecting join request:', deleteError)
      return { error: 'Erreur lors du refus' }
    }

    // Notify the requester
    await supabase.from('notifications').insert([{
      user_id: requesterId,
      type: 'join_rejected',
      payload: { message: 'Votre demande de participation a été refusée.', party_id: partyId }
    }])

    const { data: rUser } = await supabase.from('users').select('notify_party_updates').eq('id', requesterId).single()
    const { sendPushNotification } = await import('@/lib/push')
    if (rUser?.notify_party_updates !== false) {
      await sendPushNotification(requesterId, {
        title: 'Demande refusée',
        message: 'Votre demande de participation a été refusée par l\'organisateur.',
        url: `/parties/${partyId}`
      })
    }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

export async function leaveParty(partyId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // Check if it was complete BEFORE deleting the player
  // (the RPC requires the caller to still be in party_players for authorization)
  const { data: party } = await supabase.from('parties').select('statut, date_heure').eq('id', partyId).single()
  const wasComplete = party && party.statut === 'complete'

  if (wasComplete) {
      // Use the SECURITY DEFINER RPC to bypass RLS — must be called while user is still a player
      const { error: rpcError } = await supabase.rpc('system_update_party_status', {
        p_party_id: partyId,
        p_status: 'publiee'
      })
      if (rpcError) {
        console.error('Error reverting party status to publiee:', rpcError)
      }
  }

  // Now delete the player
  const { error: deleteError } = await supabase
    .from('party_players')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error leaving party:', deleteError)
    return { error: 'Erreur lors du désistement' }
  }

  // Notify the remaining players if the party was complete
  if (wasComplete) {
      const { data: remainingPlayers } = await supabase.from('party_players').select('user_id, users(notify_party_updates)').eq('party_id', partyId).eq('statut', 'inscrit')
      if (remainingPlayers && remainingPlayers.length > 0) {
          const { sendPushNotification } = await import('@/lib/push')
          let dateStr = ''
          if (party.date_heure) {
             dateStr = formatDateShort(party.date_heure)
          }

          const notifications = remainingPlayers.map(p => ({
            user_id: p.user_id,
            type: 'party_reopened',
            payload: { message: `Un joueur a quitté la partie du ${dateStr}. Une place est de nouveau libre !`, party_id: partyId }
          }))
          await supabase.from('notifications').insert(notifications)

          for (const pl of remainingPlayers) {
              if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
                  await sendPushNotification(pl.user_id, {
                      title: 'Partie rouverte 🔓',
                      message: `Un joueur s'est désisté pour la partie du ${dateStr}. La partie cherche de nouveau un joueur.`,
                      url: `/parties/${partyId}`
                  })
              }
          }
      }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

export async function updatePartyStatus(partyId: string, action: 'confirm' | 'cancel') {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // Verify ownership or participation
  const [{ data: party, error: partyError }, { data: player }] = await Promise.all([
    supabase.from('parties').select('createur_id, statut').eq('id', partyId).single(),
    supabase.from('party_players').select('statut').eq('party_id', partyId).eq('user_id', userId).single()
  ])

  const isAuthorized = party?.createur_id === userId || player?.statut === 'inscrit'

  if (partyError || !party || !isAuthorized) {
    return { error: 'Non autorisé' }
  }

  // Le statut ne peut être changé que depuis 'complete' (sinon le RPC est rejeté).
  if (party.statut !== 'complete') {
    return { error: 'La partie doit être complète pour confirmer ou annuler la réservation.' }
  }

  const newStatus = action === 'confirm' ? 'confirmee' : 'annulee'

  const { error: updateError } = await supabase.rpc('system_update_party_status', {
    p_party_id: partyId,
    p_status: newStatus
  })

  if (updateError) {
    console.error('Error executing system_update_party_status RPC:', updateError)
    return { error: `Erreur lors de la mise à jour du statut : ${updateError.message}` }
  }

  // Notifications
  const { data: players } = await supabase.from('party_players').select('user_id, users(notify_party_updates)').eq('party_id', partyId)
  if (players && players.length > 0) {
      const notifications: { user_id: string; type: string; payload: Record<string, string> }[] = []
      const { sendPushNotification } = await import('@/lib/push')
      
      for (const player of players) {
          if (player.user_id !== userId) {
              const isConfirm = action === 'confirm'
              notifications.push({
                  user_id: player.user_id,
                  type: isConfirm ? 'party_confirmed' : 'party_cancelled',
                  payload: { 
                      message: isConfirm 
                        ? 'Le terrain a bien été réservé. Préparez-vous à jouer !' 
                        : 'Malheureusement, le créneau était indisponible et la partie a été annulée.',
                      party_id: partyId
                  }
              })

              // Push Notification
              if ((player.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
                  await sendPushNotification(player.user_id, {
                      title: isConfirm ? 'Terrain réservé ! 🎾' : 'Partie annulée ❌',
                      message: isConfirm 
                        ? 'Le terrain a été réservé. Préparez-vous à jouer !' 
                        : 'Le créneau était indisponible, la partie a été annulée.',
                      url: `/parties/${partyId}`
                  }).catch(() => {})
              }
          }
      }

      if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
      }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}
