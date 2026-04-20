import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Bienvenue',
}

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">Bienvenue sur Padel !</h1>
        <p className="text-muted-foreground">
          Votre compte est créé et vérifié avec succès. Prêt à organiser vos parties ?
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button className="h-12 w-full text-base">Accéder à l&apos;application</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
