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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // La redirection après le clic sur l'email se configure via redirectTo si nécessaire, 
    // ou on gère ça dans le route handler /auth/confirm
  })

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Si Supabase a pu connecter l'utilisateur immédiatement (ex: pas de vérif d'email obligatoire)
  if (data?.session) {
    redirect('/onboarding')
  }

  // Sinon, (vérification par email activée par défaut), l'informer sur l'écran d'accueil
  redirect('/login?message=Veuillez vérifier votre email pour confirmer votre inscription.')
}
