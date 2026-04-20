import { createClient } from '@/lib/supabase/server'
import { PartyCard, PartyInfo } from '@/components/party-card'
import { SearchFilters } from './search-filters'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export const metadata = {
  title: 'Recherche de parties | Padel',
}

export default async function PartiesSearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData.user?.id

  // Extraction of filters from URL
  const searchVille = typeof searchParams.ville === 'string' ? searchParams.ville : ''
  const searchType = typeof searchParams.type === 'string' ? searchParams.type : ''
  const searchNiveau = typeof searchParams.niveau === 'string' ? parseInt(searchParams.niveau) : null
  const searchDispo = searchParams.dispo === 'true'
  
  const now = new Date().toISOString()

  // Base query: Upcoming matched parties
  let query = supabase
    .from('parties')
    .select(`
      id,
      date_heure,
      niveau_min,
      niveau_max,
      type,
      clubs!inner (nom, ville, lat, lng),
      party_players (user_id)
    `)
    .eq('statut', 'publiee')
    .gte('date_heure', now)
    .order('date_heure', { ascending: true })

  // Apply Supabase level filters natively
  if (searchVille) {
      query = query.ilike('clubs.ville', `%${searchVille}%`)
  }
  if (searchType && searchType !== 'tous') {
      query = query.eq('type', searchType)
  }
  if (searchNiveau) {
      query = query.lte('niveau_min', searchNiveau).gte('niveau_max', searchNiveau)
  }

  const { data: parties, error } = await query

  // Client-side Javascript filters mapping for advanced computation like "places disponibles"
  let formattedParties: PartyInfo[] = []
  
  if (parties && !error) {
     formattedParties = parties.map((p: any) => {
        const playerCount = p.party_players?.length || 0
        const hasJoined = p.party_players?.some((player: any) => player.user_id === currentUserId)

        return {
           id: p.id,
           club_nom: p.clubs?.nom || 'Club',
           club_ville: p.clubs?.ville || '',
           date_heure: p.date_heure,
           niveau_min: p.niveau_min,
           niveau_max: p.niveau_max,
           type: p.type,
           player_count: playerCount,
           has_joined: hasJoined || false
        } as PartyInfo
     })

     if (searchDispo) {
         formattedParties = formattedParties.filter(p => p.player_count < 4)
     }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/10 pb-20">
      
      <div className="bg-background border-b px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
         <div className="flex items-center">
            <Link href="/" className="mr-3 p-1 rounded-md hover:bg-muted">
               <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Trouver un match</h1>
         </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* FILTERS COMPONENT */}
        <SearchFilters 
            initialVille={searchVille} 
            initialType={searchType} 
            initialNiveau={searchNiveau}
            initialDispo={searchDispo}
        />

        {/* RESULTS */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Résultats ({formattedParties.length})</h2>
           </div>

           {formattedParties.length > 0 ? (
             <div className="space-y-4">
               {formattedParties.map(party => (
                  <PartyCard key={party.id} party={party} />
               ))}
             </div>
           ) : (
             <div className="text-center py-12 px-4 bg-card rounded-xl border border-dashed text-muted-foreground mt-4">
                <p className="mb-2 text-3xl">🏜️</p>
                <h3 className="font-semibold text-foreground">Aucun match trouvé</h3>
                <p className="text-sm mt-1">Essayez d&apos;élargir vos filtres (ville, niveau, ou décochez les places dispo).</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
