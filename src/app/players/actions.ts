'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function startPrivateChat(targetUserId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { error: 'Non authentifié' }
  const myId = authData.user.id

  if (myId === targetUserId) return { error: 'Action impossible' }

  // 1. Chercher si une conversation privée existe déjà entre ces deux users
  const { data: myConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations!inner(type)')
    .eq('user_id', myId)
    .eq('conversations.type', 'prive')

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map(c => c.conversation_id)
    
    // On croise avec les convs de l'autre
    const { data: targetMatch } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', myConvIds)
      .eq('user_id', targetUserId)
      .limit(1)
      .single()

    if (targetMatch) {
      // Chat trouvé !
      redirect(`/messages/${targetMatch.conversation_id}`)
    }
  }

  // 2. Si aucune conversation trouvée, on en crée une.
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({ type: 'prive' })
    .select('id')
    .single()

  if (convError || !newConv) return { error: 'Erreur lors de la création du chat' }

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConv.id, user_id: myId },
      { conversation_id: newConv.id, user_id: targetUserId }
    ])

  if (partError) return { error: 'Erreur de jonction des participants' }

  redirect(`/messages/${newConv.id}`)
}
