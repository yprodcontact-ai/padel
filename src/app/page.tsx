import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getDistanceFromLatLonInKm } from '@/lib/utils'
import { RefreshOnMount, RefreshButton } from '@/components/RefreshOnMount'

export const dynamic = 'force-dynamic'

/* ─── Types ─── */
type PlayerProfile = {
  prenom: string | null;
  nom: string | null;
  niveau: number | null;
  photo_url: string | null;
}

type FetchedPartyPlayer = {
  user_id: string;
  users: PlayerProfile | null;
}

type FetchedParty = {
  id: string;
  date_heure: string;
  niveau_min: number;
  niveau_max: number;
  type: string;
  club_id?: string;
  clubs: { nom: string; ville: string; lat: number | null; lng: number | null } | null;
  party_players: FetchedPartyPlayer[] | null;
}

type HomePlayerInfo = {
  user_id: string;
  prenom: string;
  nom: string;
  niveau: number;
  photo_url: string | null;
  initials: string;
}

type HomePartyInfo = {
  id: string;
  club_id: string;
  club_nom: string;
  club_ville: string;
  date_heure: string;
  niveau_min: number;
  niveau_max: number;
  type: string;
  players: HomePlayerInfo[];
  player_count: number;
  has_joined: boolean;
  distance_km?: number;
};

/* ─── Reusable sub-components ─── */

function PlayerAvatar({ player, size = 46, style }: { player: HomePlayerInfo; size?: number; style?: React.CSSProperties }) {
  const hasPhoto = !!player.photo_url
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      {hasPhoto ? (
        <div
          className="rounded-full overflow-hidden"
          style={{ width: size, height: size, border: '2.5px solid var(--card)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={player.photo_url!} alt={player.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size, height: size,
            backgroundColor: 'var(--border)',
            border: '2.5px solid var(--card)',
            color: 'var(--foreground)',
            fontSize: Math.round(size * 0.35),
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {player.initials}
        </div>
      )}
      <span
        className="absolute left-1/2 flex items-center justify-center whitespace-nowrap"
        style={{
          bottom: -4,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--foreground)',
          color: 'var(--card)',
          fontSize: 9,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 100,
          border: '1.5px solid var(--card)',
          letterSpacing: '0.02em',
        }}
      >
        niv. {player.niveau}
      </span>
    </div>
  )
}

function AddPlayerCircle({ size = 46, style }: { size?: number, style?: React.CSSProperties }) {
  return (
    <div
      className="rounded-full flex items-center justify-center cursor-pointer"
      style={{ width: size, height: size, border: '1px dashed var(--muted-foreground)', backgroundColor: 'transparent', flexShrink: 0, ...style }}
    >
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke='var(--muted-foreground)' strokeWidth={1.5}>
        <line x1="9" y1="4" x2="9" y2="14" />
        <line x1="4" y1="9" x2="14" y2="9" />
      </svg>
    </div>
  )
}

/* ─── Helpers ─── */
function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear()

  if (isToday) return 'Aujourd\u2019hui'
  if (isTomorrow) return 'Demain'
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function mapPlayer(pp: FetchedPartyPlayer): HomePlayerInfo {
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

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default async function Home() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  let prenom = 'Joueur'
  let userProfile: Record<string, unknown> | null = null

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

  // Récupération des parties avec les VRAIS joueurs (join nested)
  const now = new Date().toISOString()
  const { data: parties } = await (supabase
    .from('parties')
    .select(`
      id,
      date_heure,
      niveau_min,
      niveau_max,
      type,
      club_id,
      clubs (nom, ville, lat, lng),
      party_players (
        user_id,
        users (prenom, nom, niveau, photo_url)
      )
    `)
    .gte('date_heure', now)
    .order('date_heure', { ascending: true })
    .limit(50))

  // MAPPING de toutes les parties
  const userId = authData.user?.id
  const allMapped: HomePartyInfo[] = (parties as unknown as FetchedParty[] || []).map((p) => {
    const hasJoined = p.party_players?.some((player) => player.user_id === userId) || false
    const players = (p.party_players || []).map(mapPlayer)
    let distance_km: number | undefined = undefined

    if (userProfile?.lat && userProfile?.lng && p.clubs?.lat && p.clubs?.lng) {
      distance_km = getDistanceFromLatLonInKm(
        userProfile.lat as number, userProfile.lng as number,
        p.clubs.lat, p.clubs.lng
      )
    }

    return {
      id: p.id,
      club_id: p.club_id || '',
      club_nom: p.clubs?.nom || 'Club inconnu',
      club_ville: p.clubs?.ville || '',
      date_heure: p.date_heure,
      niveau_min: p.niveau_min,
      niveau_max: p.niveau_max,
      type: p.type,
      players,
      player_count: players.length,
      has_joined: hasJoined,
      distance_km,
    }
  })

  // ── Parties rejointes par l'utilisateur : TOUJOURS affichées (pas de filtre distance) ──
  const myNextParty = allMapped.find(p => p.has_joined) || null

  // ── Parties disponibles : Filtre par niveau et club ──
  const userNiveau = typeof userProfile?.niveau === 'number' ? userProfile.niveau : null
  const userClubId = userProfile?.club_id

  const notJoined = allMapped.filter(p => p.id !== myNextParty?.id && p.player_count < 4)

  const availableParties = notJoined.filter(p => {
    if (userNiveau === null || !userClubId) return false;
    const matchLevel = p.niveau_min <= userNiveau && p.niveau_max >= userNiveau;
    const matchClub = p.club_id === userClubId;
    return matchLevel && matchClub;
  }).slice(0, 6)

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 100 }}>
      <RefreshOnMount />

      {/* ═══ HERO HEADER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Avatar */}
          {userProfile?.photo_url ? (
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userProfile.photo_url as string} alt={prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: 'var(--foreground)' }}>
              {prenom.charAt(0)}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>Bonjour</span>
            <span style={{ fontSize: 32, fontWeight: 300, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{prenom}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/messages" style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 22px', borderRadius: 100, backgroundColor: 'var(--card)', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', fontSize: 15, fontWeight: 500, color: 'var(--foreground)', cursor: 'pointer', textDecoration: 'none' }}>
            Chat
          </Link>
          <Link href="/notifications" style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--card)', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)', cursor: 'pointer', textDecoration: 'none' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </Link>
        </div>
      </div>

      {/* ═══ MAIN TITLE ═══ */}
      <div style={{ padding: '0 20px', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--foreground)', fontWeight: 400 }}>
          Votre prochaine<br />
          <span style={{ color: 'var(--muted-foreground)' }}>partie de padel</span>
        </h1>
      </div>

      {/* ═══ VOTRE PROCHAINE PARTIE ═══ */}
      {myNextParty ? (
        <div style={{ padding: '0 16px', marginBottom: 36 }}>
          <Link href={`/parties/${myNextParty.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 500, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                    {formatDate(myNextParty.date_heure)}
                  </h2>
                  <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted-foreground)' }}>
                    {myNextParty.club_nom}
                  </p>
                </div>
                <div style={{ height: 40, padding: '0 16px', borderRadius: 100, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: 'var(--foreground)' }}>
                  {formatTime(myNextParty.date_heure)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34C759' }} />
                <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>Terrain réservé</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex' }}>
                  {myNextParty.players.slice(0, 3).map((player, idx) => (
                    <PlayerAvatar key={player.user_id} player={player} size={50} style={{ marginLeft: idx === 0 ? 0 : -14 }} />
                  ))}
                  {myNextParty.players.length < 4 && <AddPlayerCircle size={50} style={{ marginLeft: myNextParty.players.length > 0 ? -14 : 0 }} />}
                  {myNextParty.players.length >= 4 && (
                    <PlayerAvatar player={myNextParty.players[3]} size={50} style={{ marginLeft: -14 }} />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 6px 0 16px', borderRadius: 100, backgroundColor: 'var(--muted)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Détails</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                  </div>
                </div>
              </div>

            </div>
          </Link>
        </div>
      ) : (
        <div style={{ margin: '0 16px 36px', backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 22px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--muted-foreground)' }}>
            Aucune partie rejointe pour le moment.
          </p>
          <Link href="/parties" style={{ display: 'inline-block', marginTop: 12, fontSize: 14, color: '#f2c991', fontWeight: 500, textDecoration: 'none' }}>
            Explorer les parties &rsaquo;
          </Link>
        </div>
      )}

      {/* ═══ PARTIES DISPONIBLES ═══ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            Parties disponibles
          </h2>
          <RefreshButton />
        </div>

        {availableParties.length > 0 ? (
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingLeft: 16, paddingRight: 32, paddingBottom: 32 }}
          >
            {availableParties.map((p) => (
              <Link key={p.id} href={`/parties/${p.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ minWidth: 280, width: 280, backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 500, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                        {formatDate(p.date_heure)}
                      </h3>
                      <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted-foreground)' }}>
                        {p.club_nom}
                      </p>
                    </div>
                    <div style={{ height: 40, padding: '0 16px', borderRadius: 100, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: 'var(--foreground)' }}>
                      {formatTime(p.date_heure)}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 28px', fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>
                    Niveaux acceptés : <strong style={{ fontWeight: 700 }}>{p.niveau_min} à {p.niveau_max}</strong>
                  </p>

                  <div style={{ flex: 1 }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {p.players.slice(0, 3).map((player, idx) => (
                        <PlayerAvatar key={player.user_id} player={player} size={50} style={{ marginLeft: idx === 0 ? 0 : -14 }} />
                      ))}
                      {p.players.length === 0 && (
                        <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', marginRight: 12 }}>Aucun joueur</span>
                      )}
                      {p.players.length < 4 && <AddPlayerCircle size={50} style={{ marginLeft: p.players.length > 0 ? -14 : 0 }} />}
                    </div>

                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ margin: '0 16px', backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 22px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--muted-foreground)' }}>
              Aucune partie disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
