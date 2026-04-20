'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return redirect('/register?error=Les mots de passe ne correspondent pas')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    // La redirection après le clic sur l'email se configure via redirectTo si nécessaire, 
    // ou on gère ça dans le route handler /auth/confirm
  })

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Rediriger vers l'écran de login avec un message de succès
  redirect('/login?message=Veuillez vérifier votre email pour confirmer votre inscription.')
}
