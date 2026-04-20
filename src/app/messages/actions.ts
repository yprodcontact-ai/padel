'use server'

import { createClient } from '@/lib/supabase/server'

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
