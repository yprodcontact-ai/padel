import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrophyIcon, CalendarIcon } from 'lucide-react'

export default async function Home() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  let prenom = 'Joueur'

  if (authData.user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('prenom')
      .eq('id', authData.user.id)
      .single()
      
    if (userProfile?.prenom) {
      prenom = userProfile.prenom
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col p-4 bg-muted/20 pb-20">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-1">
          Salut {prenom} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Prêt à jouer au padel aujourd&apos;hui ?
        </p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
          Prochains Matchs
        </h2>
        <Card className="border-dashed border-2 bg-transparent shadow-none border-primary/20">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl">
              🎾
            </div>
            <h3 className="font-semibold text-foreground">Aucune partie prévue</h3>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              Vous n&apos;avez pas encore rejoint de partie. Trouvez un match dès maintenant !
            </p>
            <Button className="mt-2" variant="outline" disabled>Rechercher...</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2 text-primary" />
          Clubs à découvrir
        </h2>
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 className="font-bold">Affiliez-vous</h3>
              <p className="text-sm opacity-90 max-w-[200px]">
                Trouvez le club de padel le plus proche de chez vous !
              </p>
            </div>
            <Link href="/clubs">
              <Button variant="secondary" className="font-bold">Voir</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
