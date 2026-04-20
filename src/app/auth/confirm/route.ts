import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as string | null
  const next = searchParams.get('next') ?? '/onboarding'

  if (token_hash && type) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })
    
    if (!error) {
      // Rediriger l'utilisateur vers son onboarding ou la page suivante
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // En cas d'erreur de vérification, on redirige vers le login avec l'erreur
  return NextResponse.redirect(new URL('/login?error=Lien de vérification invalide ou expiré', request.url))
}
