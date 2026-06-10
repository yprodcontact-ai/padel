import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { setMainClub } from '../actions'
import { BackButton } from '@/components/back-button'
import { ClubTabs } from './components/club-tabs'
import Link from 'next/link'

export const metadata = { title: 'Détail du Club' }

interface DBPartyPlayer {
  user_id: string
  statut: string
  users: {
    prenom: string | null
    nom: string | null
    niveau: number | null
    photo_url: string | null
  } | null
}

interface DBParty {
  id: string
  date_heure: string
  niveau_min: number | string | null
  niveau_max: number | string | null
  type: string
  club_id: string | null
  statut: string
  clubs: {
    nom: string
    ville: string
  } | null
  party_players: DBPartyPlayer[] | null
}

interface DBMember {
  id: string
  prenom: string | null
  nom: string | null
  photo_url: string | null
  niveau: number | string | null
  ville: string | null
}

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const [clubResponse, userResponse] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', params.id).single(),
    supabase.from('users').select('club_id, is_admin, niveau').eq('id', authData.user.id).single(),
  ])
  if (clubResponse.error || !clubResponse.data) notFound()
  const club = clubResponse.data
  const isMainClub = userResponse.data?.club_id === club.id
  const setMainClubWithId = setMainClub.bind(null, club.id)

  // 1. Check if user is a club manager (or super admin)
  let isClubManager = false
  if (userResponse.data?.is_admin === true) {
    isClubManager = true
  } else {
    const managerResponse = await supabase
      .from('club_managers')
      .select('role')
      .eq('club_id', params.id)
      .eq('user_id', authData.user.id)
      .maybeSingle()
    if (managerResponse && managerResponse.data) {
      isClubManager = true
    }
  }

  // 2. Fetch parties scheduled at this club
  const now = new Date().toISOString()
  const partiesResponse = await supabase
    .from('parties')
    .select(`
      id,
      date_heure,
      niveau_min,
      niveau_max,
      type,
      club_id,
      statut,
      clubs (nom, ville),
      party_players (
        user_id,
        statut,
        users (prenom, nom, niveau, photo_url)
      )
    `)
    .eq('club_id', params.id)
    .gte('date_heure', now)
    .order('date_heure', { ascending: true })
    .limit(20)

  // 3. Fetch players who set this club as main
  const membersResponse = await supabase
    .from('users')
    .select('id, prenom, nom, photo_url, niveau, ville')
    .eq('club_id', params.id)
    .order('prenom')

  // 4. Map parties to PartyInfo structure for PartyCard compatibility
  const partiesData = (partiesResponse.data as unknown as DBParty[]) || []
  const mappedParties = partiesData
    .filter((p: DBParty) => p.statut !== 'annulee')
    .map((p: DBParty) => {
      const hasJoined = p.party_players?.some((player: DBPartyPlayer) => player.user_id === authData.user.id) || false
      const players = (p.party_players || [])
        .filter((pp: DBPartyPlayer) => pp.statut === 'inscrit')
        .map((pp: DBPartyPlayer) => {
          const u = pp.users
          const prenom = u?.prenom || 'Joueur'
          const nom = u?.nom || ''
          return {
            user_id: pp.user_id,
            prenom,
            nom,
            niveau: u?.niveau ? Number(u.niveau) : 5,
            photo_url: u?.photo_url || null,
            initials: `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
          }
        })
      const userLevel = userResponse.data?.niveau ? parseFloat(userResponse.data.niveau) : null
      const isBelowLevel = userLevel !== null && p.niveau_min !== null && userLevel < parseFloat(String(p.niveau_min))
      const isPending = p.party_players?.some((player: DBPartyPlayer) => player.user_id === authData.user.id && player.statut === 'en_attente') || false

      return {
        id: p.id,
        club_nom: p.clubs?.nom || 'Club inconnu',
        club_ville: p.clubs?.ville || '',
        date_heure: p.date_heure,
        niveau_min: p.niveau_min ? parseFloat(String(p.niveau_min)) : 1,
        niveau_max: p.niveau_max ? parseFloat(String(p.niveau_max)) : 10,
        type: p.type,
        player_count: players.length,
        has_joined: hasJoined,
        is_pending: isPending,
        is_below_level: isBelowLevel,
        players
      }
    })

  // 5. Map members list
  const membersData = (membersResponse.data as unknown as DBMember[]) || []
  const mappedMembers = membersData.map((m: DBMember) => ({
    id: m.id,
    prenom: m.prenom,
    nom: m.nom,
    photo_url: m.photo_url,
    niveau: m.niveau ? parseFloat(String(m.niveau)) : null,
    ville: m.ville
  }))

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', fontFamily: 'var(--font-sans)', paddingBottom: 130 }}>
      {/* Header Image / Cover */}
      <div style={{ position: 'relative', height: 160, backgroundColor: 'var(--card)', width: '100%' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <BackButton variant="circle" />
        </div>
        {club.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.cover_image_url} alt="Couverture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, oklch(0.60 0.08 140), oklch(0.40 0.10 180))' }} />
        )}
      </div>

      <div style={{ padding: '0 16px', marginTop: -32, position: 'relative', zIndex: 10, maxWidth: 480, margin: '-32px auto 0' }}>
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '26px 24px', border: '1px solid var(--card-border)' }}>
          {/* Main Info Header (Instagram style logo next to title) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
              {/* Small Logo */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--card-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                backgroundColor: 'var(--bg)'
              }}>
                {club.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.photo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 22
                  }}>
                    {club.nom.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Ville */}
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', lineHeight: 1.2 }}>
                  {club.nom}
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
                  {club.ville}
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--ink)', borderRadius: 14, padding: '8px 12px', textAlign: 'center', minWidth: 48, flexShrink: 0 }}>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{club.nb_pistes}</span>
              <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pistes</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, marginBottom: 10 }}>
            {/* Set main club */}
            <div style={{ flex: 1 }}>
              {isMainClub ? (
                <div style={{ width: '100%', height: 48, borderRadius: 100, background: 'rgba(25,166,107,0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                  ✓ Mon club principal
                </div>
              ) : (
                <form action={setMainClubWithId}>
                  <button type="submit" style={{ width: '100%', height: 48, borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                    Définir en principal
                  </button>
                </form>
              )}
            </div>

            {/* Manager Dashboard link */}
            {isClubManager && (
              <Link href={`/clubs/${club.id}/edit`} style={{ textDecoration: 'none' }}>
                <button style={{ height: 48, padding: '0 20px', borderRadius: 100, border: '1px solid var(--stroke-soft)', background: 'transparent', color: 'var(--foreground)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  Gérer
                </button>
              </Link>
            )}
          </div>

          {/* Dynamic Tabs: Infos, Parties, Membres */}
          <ClubTabs
            clubId={club.id}
            description={club.description}
            adresse={club.adresse}
            ville={club.ville}
            telephone={club.telephone}
            email={club.email}
            parties={mappedParties}
            members={mappedMembers}
          />
        </div>
      </div>
    </div>
  )
}
