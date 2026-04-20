import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/favicon.ico') || 
                        pathname.startsWith('/sw.js') || 
                        pathname.startsWith('/workbox-') ||
                        pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|webmanifest)$/i);

  if (isPublicAsset) {
    return supabaseResponse;
  }

  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/forgot-password') ||
                     pathname.startsWith('/auth/confirm');

  if (!user && !isAuthPage) {
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // Si l'utilisateur est déjà connecté et essaie d'accéder à /login ou /register
    const url = request.nextUrl.clone()
    // S'il va sur register, on peut le rediriger sur /onboarding, sinon vers /
    url.pathname = pathname.startsWith('/register') ? '/onboarding' : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
