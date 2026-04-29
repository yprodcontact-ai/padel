import { createClient } from '@/lib/supabase/server'
import { PartyCard, PartyInfo, PlayerInfo } from '@/components/party-card'
import { SearchFilters } from '@/app/parties/search-filters'

export const dynamic = 'force-dynamic'

type FetchedPartyPlayer = {
  user_id: string;
  statut: string;
  users: { prenom: string | null; nom: string | null; niveau: number | null; photo_url: string | null } | null;
}

type FetchedParty = {
  id: string;
  date_heure: string;
  niveau_min: number;
  niveau_max: number;
  type: string;
  clubs: { nom: string; ville: string; lat: number | null; lng: number | null } | null;
  party_players: FetchedPartyPlayer[] | null;
}

export const metadata = {
  title: 'Recherche de parties | Padel',
}

function mapPlayer(pp: FetchedPartyPlayer): PlayerInfo {
  const u = pp.users
  const prenom = u?.prenom || 'Joueur'
  const nom = u?.nom || ''
  return {
    user_id: pp.user_id,
    prenom,
    nom,
    niveau: u?.niveau ?? 5,
    photo_url: u?.photo_url || null,
    initials: `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase(),
  }
}

export default async function PartiesSearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData.user?.id

  // Fetch user's level and club for defaults and below-level detection
  let userLevel: number | null = null
  let userClubId: string | null = null
  if (currentUserId) {
    const { data: userProfile } = await supabase.from('users').select('niveau, club_id').eq('id', currentUserId).single()
    userLevel = userProfile?.niveau ? parseFloat(userProfile.niveau) : null
    userClubId = userProfile?.club_id || null
  }

  // If no filters are provided AT ALL in searchParams, we apply defaults
  const isDefaultMode = Object.keys(searchParams).length === 0;

  // Extraction of filters from URL
  const searchClub = isDefaultMode ? userClubId : (typeof searchParams.club === 'string' ? searchParams.club : '')
  const searchType = typeof searchParams.type === 'string' ? searchParams.type : ''
  const searchNiveauStr = typeof searchParams.niveau === 'string' ? searchParams.niveau : (isDefaultMode && userLevel ? userLevel.toString() : 'tous')
  const searchNiveau = searchNiveauStr !== 'tous' && searchNiveauStr !== '' ? parseFloat(searchNiveauStr) : null
  const searchDispo = searchParams.dispo === 'true'
  
  const now = new Date().toISOString()

  // Base query: Upcoming matched parties with player details
  let query = supabase
    .from('parties')
    .select(`
      id,
      date_heure,
      niveau_min,
      niveau_max,
      type,
      club_id,
      clubs!inner (nom, ville, lat, lng),
      party_players (
        user_id,
        statut,
        users (prenom, nom, niveau, photo_url)
      )
    `)
    .eq('statut', 'publiee')
    .gte('date_heure', now)
    .order('date_heure', { ascending: true })

  // Apply filters natively
  if (searchClub && searchClub !== 'tous') {
      query = query.eq('club_id', searchClub)
  }
  if (searchType && searchType !== 'tous') {
      query = query.eq('type', searchType)
  }
  if (searchNiveau !== null) {
      query = query.lte('niveau_min', searchNiveau).gte('niveau_max', searchNiveau)
  }

  const { data: parties, error } = await query

  // Client-side Javascript filters mapping for advanced computation like "places disponibles"
  let formattedParties: PartyInfo[] = []
  
  if (parties && !error) {
     formattedParties = (parties as unknown as FetchedParty[]).map((p) => {
        const confirmedPlayers = p.party_players?.filter(pl => pl.statut === 'inscrit') || []
        const playerCount = confirmedPlayers.length
        const hasJoined = confirmedPlayers.some((player) => player.user_id === currentUserId)
        const isPendingRequest = p.party_players?.some(pl => pl.user_id === currentUserId && pl.statut === 'en_attente') || false
        const isBelowLevel = userLevel !== null && p.niveau_min !== null && userLevel < p.niveau_min
        const players = confirmedPlayers.map(mapPlayer)

        return {
           id: p.id,
           club_nom: p.clubs?.nom || 'Club',
           club_ville: p.clubs?.ville || '',
           date_heure: p.date_heure,
           niveau_min: p.niveau_min,
           niveau_max: p.niveau_max,
           type: p.type,
           player_count: playerCount,
           has_joined: hasJoined || false,
           is_pending: isPendingRequest,
           is_below_level: isBelowLevel,
           players,
        } as PartyInfo
     })

     formattedParties = formattedParties.filter(p => p.player_count < 4)
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: 130 }}>

      {/* ── Hero header ── */}
      <div style={{ padding: '64px 22px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1.4px', lineHeight: 1.05 }}>
          Trouver<br />
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>une partie</span>
        </h1>
        {/* Bouton search rond */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.8}><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" strokeLinecap="round" /></svg>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Filtres ── */}
        <SearchFilters
          initialClub={searchClub || ''}
          initialType={searchType}
          initialNiveau={searchNiveauStr || 'tous'}
          initialDispo={searchDispo}
        />

        {/* ── Résultats ── */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
              {formattedParties.length} partie{formattedParties.length !== 1 ? 's' : ''} trouvée{formattedParties.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {formattedParties.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formattedParties.map((party, idx) => (
                <div key={party.id} className="animate-in-stagger" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <PartyCard party={party} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '40px 22px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <p style={{ margin: '0 0 8px', fontSize: 28 }}>🏜️</p>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Aucune partie trouvée</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>Élargissez vos filtres (niveau, club) pour voir plus de résultats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
