import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrophyIcon, CalendarIcon, PlusCircleIcon } from 'lucide-react'
import { getDistanceFromLatLonInKm } from '@/lib/utils'
import { PartyCard, PartyInfo } from '@/components/party-card'

export default async function Home() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  let prenom = 'Joueur'
  let userProfile = null

  if (authData.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
      
    if (profile) {
      userProfile = profile
      if (profile.prenom) prenom = profile.prenom
    }
  }

  // RECHERCHE DES MATCHS
  // On récupère les matchs publiés à venir
  const now = new Date().toISOString()
  const { data: parties } = await supabase
    .from('parties')
    .select(`
      id,
      date_heure,
      niveau_min,
      niveau_max,
      type,
      clubs (nom, ville, lat, lng),
      party_players (user_id)
    `)
    .eq('statut', 'publiee')
    .gte('date_heure', now)
    .order('date_heure', { ascending: true })
    .limit(50)

  // FILTRAGE ET MAPPING
  let nearbyParties: PartyInfo[] = []
  
  if (parties && userProfile) {
     const hasCoords = userProfile.lat && userProfile.lng
     const userVille = userProfile.ville?.toLowerCase()

     const mappedParties = parties.map((p: any) => {
        let distance: number | undefined = undefined
        let include = false

        if (hasCoords && p.clubs?.lat && p.clubs?.lng) {
            distance = getDistanceFromLatLonInKm(userProfile.lat, userProfile.lng, p.clubs.lat, p.clubs.lng)
            if (distance <= 30) include = true
        } else if (userVille && p.clubs?.ville?.toLowerCase() === userVille) {
            include = true
        } else if (!userVille && !hasCoords) {
            // Si l'utilisateur n'a renseigné ni ville ni géoloc, on lui montre tout
            include = true
        }

        const hasJoined = p.party_players?.some((player: any) => player.user_id === authData.user?.id)

        return {
           info: {
             id: p.id,
             club_nom: p.clubs?.nom || 'Club inconnu',
             club_ville: p.clubs?.ville || '',
             date_heure: p.date_heure,
             niveau_min: p.niveau_min,
             niveau_max: p.niveau_max,
             type: p.type,
             player_count: p.party_players?.length || 0,
             has_joined: hasJoined || false,
             distance_km: distance
           } as PartyInfo,
           include,
           distance
        }
     })

     nearbyParties = mappedParties
       .filter(p => p.include)
       .map(p => p.info)
       // Ne montrer que les parties non crées par soi ou ne pas filtrer ? On montre tout
       // On trie par distance si possible (on rajoute le tri)
       .sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999))
       .slice(0, 5) // Les 5 plus proches/imminents
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

      <div className="mt-2 flex gap-3">
         <Link href="/parties/create" className="flex-1">
           <Button className="w-full flex justify-center items-center h-12 shadow-md">
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Organiser
           </Button>
         </Link>
         <Link href="/parties" className="flex-1">
           <Button variant="outline" className="w-full flex justify-center items-center h-12 bg-background shadow-sm border-primary/20 text-primary">
              Rechercher
           </Button>
         </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
            Matchs autour de vous
          </h2>
          <Link href="/parties" className="text-sm font-bold text-primary">
            Voir plus &rsaquo;
          </Link>
        </div>
        
        {nearbyParties.length > 0 ? (
          <div className="space-y-4">
            {nearbyParties.map(party => (
               <PartyCard key={party.id} party={party} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-transparent shadow-none border-primary/20">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl">
                🎾
              </div>
              <h3 className="font-semibold text-foreground">Calme plat !</h3>
              <p className="text-xs text-muted-foreground max-w-[250px]">
                Aucun match trouvé autour de chez vous (<span className="capitalize">{userProfile?.ville || "pas de ville"}</span>).
              </p>
              <Link href="/parties">
                <Button className="mt-2" variant="outline">Explorer partout...</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
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
