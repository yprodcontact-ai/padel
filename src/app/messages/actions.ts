'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/push'

export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }

  // Vérifier la participation
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', authData.user.id)
    .single()

  if (!participant) return { error: 'Non autorisé' }

  if (!content || content.trim().length === 0) return { error: 'Message vide' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: authData.user.id,
    contenu: content.trim(),
  })

  // Pas de revalidatePath, l'interface client écoute en Realtime Supabase
  if (error) return { error: "Erreur lors de l'envoi du message" }

  // Envoyer la notification web push aux autres membres de la conversation
  const { data: others } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', conversationId).neq('user_id', authData.user.id)

  if (others && others.length > 0) {
    const { data: convData } = await supabase.from('conversations').select('type, parties(clubs(nom))').eq('id', conversationId).single()
    let nomPartie = 'Discussion'
    if (convData?.type === 'groupe') {
      const partyAny = convData?.parties as unknown as Record<string, unknown>;
      const c = Array.isArray(partyAny) ? partyAny[0]?.clubs : partyAny?.clubs;
      const clubName = Array.isArray(c) ? c[0]?.nom : c?.nom;
      if (clubName) {
        nomPartie = `Partie à ${String(clubName)}`
      }
    }

    for (const p of others) {
      await sendPushNotification(p.user_id, {
        title: `Nouveau message - ${nomPartie}`,
        message: content.length > 50 ? content.substring(0, 50) + '...' : content,
        url: `/messages/${conversationId}`
      })
    }
  }

  return { success: true }
}

export async function markConversationAsRead(conversationId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return

  // Update silently out of band
  await supabase.from('messages')
    .update({ lu: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', authData.user.id)
    .eq('lu', false)
}
