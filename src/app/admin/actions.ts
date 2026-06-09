'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/push'

export async function updateClubBanner(
  clubId: string,
  bannerImageUrl: string | null,
  bannerDestinationUrl: string | null,
  searchBannerImageUrl?: string | null,
  searchBannerDestinationUrl?: string | null
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
  const updateData: Record<string, string | null> = {
    banner_image_url: bannerImageUrl || null,
    banner_destination_url: bannerDestinationUrl || null,
  }

  if (searchBannerImageUrl !== undefined) {
    updateData.search_banner_image_url = searchBannerImageUrl || null
  }
  if (searchBannerDestinationUrl !== undefined) {
    updateData.search_banner_destination_url = searchBannerDestinationUrl || null
  }

  const { error: updateError } = await supabase
    .from('clubs')
    .update(updateData)
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

export async function sendBroadcastMessage(
  targetType: 'all' | 'club',
  clubId: string | null,
  senderName: string,
  messageContent: string
) {
  const supabase = createClient()
  
  // 1. Authenticate user
  const { data: authData, error: authErr } = await supabase.auth.getUser()
  if (authErr || !authData?.user) {
    return { success: false, error: 'Non connecté.' }
  }

  // 2. Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile || !profile.is_admin) {
    return { success: false, error: 'Non autorisé.' }
  }

  if (!senderName.trim()) {
    return { success: false, error: "Le nom de l'expéditeur est obligatoire." }
  }
  if (!messageContent.trim()) {
    return { success: false, error: 'Le message ne peut pas être vide.' }
  }

  // 3. Query target users (filter out the admin themselves so they don't broadcast to themselves)
  let targetQuery = supabase.from('users').select('id, prenom, notify_messages').neq('id', authData.user.id)
  if (targetType === 'club' && clubId) {
    targetQuery = targetQuery.eq('club_id', clubId)
  }
  
  const { data: targetUsers, error: fetchError } = await targetQuery
  if (fetchError || !targetUsers) {
    console.error('Error fetching target users for broadcast:', fetchError)
    return { success: false, error: 'Erreur lors de la récupération des destinataires.' }
  }

  if (targetUsers.length === 0) {
    return { success: false, error: 'Aucun utilisateur correspondant trouvé.' }
  }

  let successCount = 0
  for (const recipient of targetUsers) {
    let conversationId: string | null = null

    // Attempt to reuse an existing broadcast conversation with the same title for this user
    const { data: existingConvs } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations!inner (title, is_read_only)')
      .eq('user_id', recipient.id)
      .eq('conversations.title', senderName)
      .eq('conversations.is_read_only', true)

    // filter to find if there is a match in our selection
    const match = existingConvs?.find(c => {
      const conv = c.conversations as unknown as { title: string, is_read_only: boolean }
      return conv && conv.title === senderName && conv.is_read_only === true
    })

    if (match) {
      conversationId = match.conversation_id
    } else {
      // Create a new conversation
      const { data: newConv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          type: 'prive',
          is_read_only: true,
          title: senderName
        })
        .select('id')
        .single()

      if (convErr || !newConv) {
        console.error('Error creating conversation:', convErr)
        continue
      }
      conversationId = newConv.id

      // Insert participants: admin and recipient
      const { error: partErr } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: authData.user.id },
          { conversation_id: conversationId, user_id: recipient.id }
        ])

      if (partErr) {
        console.error('Error creating participants:', partErr)
        continue
      }
    }

    // Insert the message as HTML
    const { error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: authData.user.id,
        contenu: messageContent,
        is_html: true
      })

    if (msgErr) {
      console.error('Error sending message:', msgErr)
      continue
    }

    // Send push notification asynchronously
    const notify = recipient.notify_messages !== false
    if (notify) {
      sendPushNotification(recipient.id, {
        title: senderName,
        message: 'Nouveau message collectif...',
        url: `/messages/${conversationId}`
      }).catch(err => console.error('Error sending push notification:', err))
    }

    successCount++
  }

  // Revalidate messages list so the sender/recipient can see it updated
  revalidatePath('/messages')

  return { success: true, count: successCount }
}
