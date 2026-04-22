import { createClient } from '@/lib/supabase/server'
import { PartyCard, PartyInfo } from '@/components/party-card'
import { SearchFilters } from '@/app/parties/search-filters'
import { BackButtonSquare } from '@/components/back-button'

export const dynamic = 'force-dynamic'

type FetchedParty = {
  id: string;
  date_heure: string;
  niveau_min: number;
  niveau_max: number;
  type: string;
  clubs: { nom: string; ville: string; lat: number | null; lng: number | null } | null;
  party_players: { user_id: string }[] | null;
}

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
     formattedParties = (parties as unknown as FetchedParty[]).map((p) => {
        const playerCount = p.party_players?.length || 0
        const hasJoined = p.party_players?.some((player) => player.user_id === currentUserId)

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

     formattedParties = formattedParties.filter(p => p.player_count < 4)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: 100, fontFamily: 'var(--font-sans)' }}>
      
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#000', borderBottom: '1px solid #1C1C1E', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButtonSquare />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>Trouver un match</h1>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        
        {/* FILTERS COMPONENT */}
        <SearchFilters 
            initialVille={searchVille} 
            initialType={searchType} 
            initialNiveau={searchNiveau}
            initialDispo={searchDispo}
        />

        {/* RESULTS */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>Résultats ({formattedParties.length})</h2>
          </div>

          {formattedParties.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formattedParties.map(party => (
                 <PartyCard key={party.id} party={party} />
              ))}
            </div>
          ) : (
            <div style={{ background: '#1C1C1E', borderRadius: 28, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 32, marginBottom: 12 }}>🏜️</p>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Aucun match trouvé</h3>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8E8E93' }}>Essayez d&apos;élargir vos filtres (ville, niveau, ou décochez les places dispo).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
