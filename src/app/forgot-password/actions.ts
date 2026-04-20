'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/login?message=Un lien de réinitialisation a été envoyé à votre adresse email.')
}
