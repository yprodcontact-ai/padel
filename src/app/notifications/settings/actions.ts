'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateNotificationSettings(formData: FormData) {
  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    redirect('/login')
  }

  const userId = authData.user.id

  const notify_new_parties = formData.get('notify_new_parties') === 'true'
  const notify_messages = formData.get('notify_messages') === 'true'
  const notify_party_updates = formData.get('notify_party_updates') === 'true'

  const { error: updateError } = await supabase
    .from('users')
    .update({ notify_new_parties, notify_messages, notify_party_updates })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating notification settings:', updateError)
    // Could pass error in URL
  }

  revalidatePath('/notifications')
  revalidatePath('/profile')
  revalidatePath('/notifications/settings')
  
  redirect('/notifications')
}
