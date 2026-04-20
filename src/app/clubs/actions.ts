'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function setMainClub(clubId: string) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('users')
    .update({ club_id: clubId })
    .eq('id', authData.user.id)

  if (error) {
    console.error('Error updating main club:', error)
    // We redirect to avoid return type mismatch in Server Actions used straight in <form action>
    redirect('/clubs?error=Erreur')
  }

  // Revalidate routes that might display the user's club
  revalidatePath('/clubs')
  revalidatePath('/profile')
  revalidatePath(`/clubs/${clubId}`)
  
  redirect('/profile')
}
