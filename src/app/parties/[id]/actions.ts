'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { formatDateShort, formatTime } from '@/lib/date-utils'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRole) {
    return null
  }
  
  return createSupabaseAdminClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

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
    return { error: "Vous êtes déjà inscrit à 3 parties à venir. Vous pourrez en rejoindre une autre 5 minutes après le début de l'une d'elles." }
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
      return { error: "Ce joueur est déjà inscrit à 3 parties à venir." }
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

  // Check if it was complete or confirmed BEFORE deleting the player
  // (the RPC requires the caller to still be in party_players for authorization)
  const { data: party } = await supabase.from('parties').select('statut, date_heure').eq('id', partyId).single()
  const wasCompleteOrConfirmed = party && (party.statut === 'complete' || party.statut === 'confirmee')

  if (wasCompleteOrConfirmed) {
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

  // Notify the remaining players if the party was complete or confirmed
  if (wasCompleteOrConfirmed) {
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

export async function excludePlayer(partyId: string, userIdToExclude: string, message?: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const currentUserId = authData.user.id

  // 1. Verify the current user is the party creator
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('createur_id, statut, date_heure')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return { error: 'Partie introuvable' }
  }

  if (party.createur_id !== currentUserId) {
    return { error: 'Non autorisé : vous devez être l\'organisateur de la partie' }
  }

  if (userIdToExclude === currentUserId) {
    return { error: 'Vous ne pouvez pas vous exclure vous-même' }
  }

  // 2. Check if the party was complete or confirmed BEFORE deleting the player
  const wasCompleteOrConfirmed = party.statut === 'complete' || party.statut === 'confirmee'

  if (wasCompleteOrConfirmed) {
    // Revert the party status to 'publiee'
    const { error: rpcError } = await supabase.rpc('system_update_party_status', {
      p_party_id: partyId,
      p_status: 'publiee'
    })
    if (rpcError) {
      console.error('Error reverting party status to publiee upon player exclusion:', rpcError)
    }
  }

  // 3. Delete the player
  const { error: deleteError } = await supabase
    .from('party_players')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', userIdToExclude)

  if (deleteError) {
    console.error('Error excluding player:', deleteError)
    return { error: 'Erreur lors de la suppression du joueur' }
  }

  // 4. Send notification to the excluded player
  const notificationMessage = message 
    ? `Vous avez été retiré de la partie. Message de l'organisateur : "${message}"` 
    : `Vous avez été retiré de la partie par l'organisateur.`

  await supabase.from('notifications').insert([{
    user_id: userIdToExclude,
    type: 'player_excluded',
    payload: {
      message: notificationMessage,
      party_id: partyId,
      organizer_message: message || null
    }
  }])

  // 5. Send push notification to the excluded player
  const { data: excludedUser } = await supabase
    .from('users')
    .select('notify_party_updates')
    .eq('id', userIdToExclude)
    .single()

  if (excludedUser?.notify_party_updates !== false) {
    const { sendPushNotification } = await import('@/lib/push')
    let dateStr = ''
    if (party.date_heure) {
      dateStr = formatDateShort(party.date_heure)
    }
    await sendPushNotification(userIdToExclude, {
      title: 'Retiré d\'une partie ⚠️',
      message: message 
        ? `Exclu de la partie du ${dateStr}. Organisateur : "${message}"` 
        : `Vous avez été retiré de la partie du ${dateStr} par l'organisateur.`,
      url: `/notifications`
    }).catch(() => {})
  }

  // 6. Notify other remaining players if the party was complete or confirmed (like in leaveParty)
  if (wasCompleteOrConfirmed) {
    const { data: remainingPlayers } = await supabase
      .from('party_players')
      .select('user_id, users(notify_party_updates)')
      .eq('party_id', partyId)
      .eq('statut', 'inscrit')

    if (remainingPlayers && remainingPlayers.length > 0) {
      const { sendPushNotification } = await import('@/lib/push')
      let dateStr = ''
      if (party.date_heure) {
        dateStr = formatDateShort(party.date_heure)
      }

      const notifications = remainingPlayers.map(p => ({
        user_id: p.user_id,
        type: 'party_reopened',
        payload: { message: `Un joueur a été retiré de la partie du ${dateStr}. Une place est de nouveau libre !`, party_id: partyId }
      }))
      await supabase.from('notifications').insert(notifications)

      for (const pl of remainingPlayers) {
        if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
          await sendPushNotification(pl.user_id, {
            title: 'Partie rouverte 🔓',
            message: `Un joueur s'est fait exclure de la partie du ${dateStr}. La partie cherche de nouveau un joueur.`,
            url: `/parties/${partyId}`
          }).catch(() => {})
        }
      }
    }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

export async function deleteParty(partyId: string, message?: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // 1. Récupérer la partie pour vérifier la propriété et obtenir les détails
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('createur_id, date_heure')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return { error: 'Partie introuvable' }
  }

  if (party.createur_id !== userId) {
    return { error: 'Non autorisé : vous devez être l\'organisateur de la partie' }
  }

  // 2. Récupérer les autres joueurs inscrits pour les notifier
  const { data: players } = await supabase
    .from('party_players')
    .select('user_id, users(notify_party_updates, prenom, nom)')
    .eq('party_id', partyId)
    .eq('statut', 'inscrit')

  const otherPlayers = players ? players.filter(p => p.user_id !== userId) : []

  // 3. Supprimer de party_players en premier pour éviter les erreurs de contrainte
  const supabaseAdmin = getSupabaseAdmin() || supabase
  await supabaseAdmin.from('party_players').delete().eq('party_id', partyId)

  // 4. Supprimer la partie
  const { error: deleteError } = await supabaseAdmin
    .from('parties')
    .delete()
    .eq('id', partyId)

  if (deleteError) {
    console.error('Error deleting party:', deleteError)
    return { error: 'Erreur lors de la suppression de la partie' }
  }

  // 5. Envoyer les notifications aux autres joueurs
  if (otherPlayers.length > 0) {
    try {
      const { data: creatorProfile } = await supabase
        .from('users')
        .select('prenom, nom')
        .eq('id', userId)
        .single()
      const creatorName = creatorProfile ? `${creatorProfile.prenom} ${creatorProfile.nom}` : 'L\'organisateur'

      const dateStr = party.date_heure ? formatDateShort(party.date_heure) : ''
      const timeStr = party.date_heure ? formatTime(party.date_heure) : ''

      const baseNotificationMessage = `La partie du ${dateStr} à ${timeStr} a été annulée par ${creatorName}.`
      const fullNotificationMessage = message 
        ? `${baseNotificationMessage} Message : "${message}"`
        : baseNotificationMessage

      const notifications = otherPlayers.map(p => ({
        user_id: p.user_id,
        type: 'party_deleted',
        payload: {
          message: fullNotificationMessage,
          party_id: partyId,
          organizer_message: message || null
        }
      }))
      
      await supabase.from('notifications').insert(notifications)

      const { sendPushNotification } = await import('@/lib/push')
      for (const pl of otherPlayers) {
        if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
          await sendPushNotification(pl.user_id, {
            title: 'Partie annulée ❌',
            message: message 
              ? `Match du ${dateStr} annulé : "${message}"` 
              : `La partie du ${dateStr} a été annulée par l'organisateur.`,
            url: `/notifications`
          }).catch(() => {})
        }
      }
    } catch (err) {
      console.error('Error sending delete notifications:', err)
    }
  }

  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

export async function leavePartyAndTransfer(partyId: string, newOrganizerId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // 1. Récupérer la partie pour vérifier la propriété et obtenir les détails
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('createur_id, date_heure, statut')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return { error: 'Partie introuvable' }
  }

  if (party.createur_id !== userId) {
    return { error: 'Non autorisé : vous devez être l\'organisateur de la partie' }
  }

  // 2. Vérifier que le nouveau créateur est bien un joueur inscrit
  const { data: newOrgPlayer, error: nopError } = await supabase
    .from('party_players')
    .select('user_id, users(prenom, nom)')
    .eq('party_id', partyId)
    .eq('user_id', newOrganizerId)
    .eq('statut', 'inscrit')
    .single()

  if (nopError || !newOrgPlayer) {
    return { error: 'Le nouveau créateur choisi n\'est pas un joueur inscrit dans cette partie' }
  }

  const wasCompleteOrConfirmed = party.statut === 'complete' || party.statut === 'confirmee'

  if (wasCompleteOrConfirmed) {
    // Repasse le statut en 'publiee' car le départ de l'organisateur laisse 3 joueurs
    const { error: rpcError } = await supabase.rpc('system_update_party_status', {
      p_party_id: partyId,
      p_status: 'publiee'
    })
    if (rpcError) {
      console.error('Error reverting party status to publiee upon organizer transfer:', rpcError)
    }
  }

  // 3. Mettre à jour le créateur de la partie
  const supabaseAdmin = getSupabaseAdmin() || supabase
  const { error: updateCreatorError } = await supabaseAdmin
    .from('parties')
    .update({ createur_id: newOrganizerId })
    .eq('id', partyId)

  if (updateCreatorError) {
    console.error('Error transferring party ownership:', updateCreatorError)
    return { error: 'Erreur lors du transfert de la partie' }
  }

  // 4. Supprimer l'ancien organisateur de la table party_players
  const { error: deleteError } = await supabaseAdmin
    .from('party_players')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error deleting old organizer player:', deleteError)
    // Tentative de rollback au cas où
    await supabaseAdmin.from('parties').update({ createur_id: userId }).eq('id', partyId)
    return { error: 'Erreur lors du désistement de l\'organisateur' }
  }

  // 5. Envoyer les notifications
  try {
    const { data: oldCreatorProfile } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('id', userId)
      .single()
    const oldCreatorName = oldCreatorProfile ? `${oldCreatorProfile.prenom} ${oldCreatorProfile.nom}` : 'L\'organisateur précédent'
    
    const userObj = newOrgPlayer.users?.[0]
    const newCreatorName = `${userObj?.prenom || ''} ${userObj?.nom || ''}`.trim() || 'Le nouvel organisateur'

    const dateStr = party.date_heure ? formatDateShort(party.date_heure) : ''

    // A. Notifier le nouvel organisateur
    await supabase.from('notifications').insert([{
      user_id: newOrganizerId,
      type: 'organizer_transferred',
      payload: {
        message: `${oldCreatorName} a quitté la partie du ${dateStr} et vous a désigné comme nouvel organisateur ! 👑`,
        party_id: partyId
      }
    }])

    const { data: newOrgUser } = await supabase
      .from('users')
      .select('notify_party_updates')
      .eq('id', newOrganizerId)
      .single()

    const { sendPushNotification } = await import('@/lib/push')
    if (newOrgUser?.notify_party_updates !== false) {
      await sendPushNotification(newOrganizerId, {
        title: 'Vous êtes l\'organisateur ! 👑',
        message: `${oldCreatorName} vous a désigné comme organisateur de la partie du ${dateStr}.`,
        url: `/parties/${partyId}`
      }).catch(() => {})
    }

    // B. Notifier les autres joueurs inscrits
    const { data: remainingPlayers } = await supabase
      .from('party_players')
      .select('user_id, users(notify_party_updates)')
      .eq('party_id', partyId)
      .eq('statut', 'inscrit')
      .neq('user_id', newOrganizerId) // Exclure le nouvel organisateur déjà notifié

    if (remainingPlayers && remainingPlayers.length > 0) {
      const remainingNotifications = remainingPlayers.map(p => ({
        user_id: p.user_id,
        type: 'party_organizer_changed',
        payload: {
          message: `L'organisateur de la partie du ${dateStr} a changé. ${newCreatorName} est le nouvel organisateur.`,
          party_id: partyId
        }
      }))
      
      await supabase.from('notifications').insert(remainingNotifications)

      for (const pl of remainingPlayers) {
        if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
          await sendPushNotification(pl.user_id, {
            title: 'Nouvel organisateur 👑',
            message: `${newCreatorName} est le nouvel organisateur de la partie du ${dateStr}.`,
            url: `/parties/${partyId}`
          }).catch(() => {})
        }
      }
    }

    // C. Notifier de la réouverture si la partie était complète ou confirmée
    if (wasCompleteOrConfirmed) {
      const { data: allRemainingPlayers } = await supabase
        .from('party_players')
        .select('user_id, users(notify_party_updates)')
        .eq('party_id', partyId)
        .eq('statut', 'inscrit')

      if (allRemainingPlayers && allRemainingPlayers.length > 0) {
        const reopenNotifications = allRemainingPlayers.map(p => ({
          user_id: p.user_id,
          type: 'party_reopened',
          payload: { message: `L'organisateur a quitté la partie du ${dateStr}. Une place est de nouveau libre !`, party_id: partyId }
        }))
        await supabase.from('notifications').insert(reopenNotifications)

        for (const pl of allRemainingPlayers) {
          if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
            await sendPushNotification(pl.user_id, {
              title: 'Partie rouverte 🔓',
              message: `${oldCreatorName} a quitté la partie du ${dateStr}. La partie cherche de nouveau un joueur.`,
              url: `/parties/${partyId}`
            }).catch(() => {})
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sending transfer notifications:', err)
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

export async function updatePartyDateTime(partyId: string, newDateTime: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  const userId = authData.user.id

  // 1. Fetch the party to check ownership and get old details
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('createur_id, date_heure, statut')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return { error: 'Partie introuvable' }
  }

  if (party.createur_id !== userId) {
    return { error: 'Non autorisé : vous devez être l\'organisateur de la partie' }
  }

  const oldDateTime = party.date_heure

  // 2. Update the party's date/time
  const { error: updateError } = await supabase
    .from('parties')
    .update({ date_heure: newDateTime })
    .eq('id', partyId)

  if (updateError) {
    console.error('Error updating party date/time:', updateError)
    return { error: 'Erreur lors de la mise à jour de la date/heure' }
  }

  // 3. Get all other registered players (excluding creator) to notify
  const { data: players } = await supabase
    .from('party_players')
    .select('user_id, users(notify_party_updates)')
    .eq('party_id', partyId)
    .eq('statut', 'inscrit')

  const otherPlayers = players ? players.filter(p => p.user_id !== userId) : []

  if (otherPlayers.length > 0) {
    try {
      const oldDateStr = formatDateShort(oldDateTime)
      const oldTimeStr = formatTime(oldDateTime)
      const newDateStr = formatDateShort(newDateTime)
      const newTimeStr = formatTime(newDateTime)

      const baseNotificationMessage = `La partie initialement prévue le ${oldDateStr} à ${oldTimeStr} a été déplacée au ${newDateStr} à ${newTimeStr} par l'organisateur.`

      const notifications = otherPlayers.map(p => ({
        user_id: p.user_id,
        type: 'party_datetime_changed',
        payload: {
          message: baseNotificationMessage,
          party_id: partyId,
          old_datetime: oldDateTime,
          new_datetime: newDateTime
        }
      }))

      await supabase.from('notifications').insert(notifications)

      const { sendPushNotification } = await import('@/lib/push')
      for (const pl of otherPlayers) {
        if ((pl.users as unknown as Record<string, unknown>)?.notify_party_updates !== false) {
          await sendPushNotification(pl.user_id, {
            title: 'Horaire modifié 📅',
            message: `La partie a été déplacée au ${newDateStr} à ${newTimeStr} par l'organisateur.`,
            url: `/parties/${partyId}`
          }).catch(() => {})
        }
      }
    } catch (err) {
      console.error('Error sending date/time update notifications:', err)
    }
  }

  revalidatePath(`/parties/${partyId}`)
  revalidatePath('/parties')
  revalidatePath('/')
  return { success: true }
}

