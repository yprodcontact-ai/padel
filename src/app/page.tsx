import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getDistanceFromLatLonInKm } from '@/lib/utils'

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
          style={{ width: size, height: size, border: '2.5px solid #fff' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={player.photo_url!} alt={player.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size, height: size,
            background: '#3A3A3C',
            border: '2.5px solid #fff',
            color: '#fff',
            fontSize: Math.round(size * 0.3),
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-sans)',
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
          background: '#1C1C1E',
          color: '#fff',
          fontSize: 9,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 100,
          border: '1.5px solid #fff',
          fontFamily: 'var(--font-sans)',
        }}
      >
        niv. {player.niveau}
      </span>
    </div>
  )
}

function AddPlayerCircle({ size = 46 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center cursor-pointer"
      style={{ width: size, height: size, border: '1.5px dashed #A1A1AA', background: '#fff', flexShrink: 0 }}
    >
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="#A1A1AA" strokeWidth={1.5}>
        <line x1="9" y1="3" x2="9" y2="15" />
        <line x1="3" y1="9" x2="15" y2="9" />
      </svg>
    </div>
  )
}

function DarkBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center"
      style={{ background: '#1C1C1E', color: '#fff', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 100, fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}
    >
      {children}
    </span>
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

  // ── Parties disponibles : filtre souple par distance/ville, fallback sur tout ──
  const hasCoords = !!(userProfile?.lat && userProfile?.lng)
  const userVille = (userProfile?.ville as string)?.toLowerCase()

  const notJoined = allMapped.filter(p => p.id !== myNextParty?.id)

  let availableParties: HomePartyInfo[]

  if (hasCoords) {
    // Essayer d'abord les parties proches (≤ 50 km)
    const nearby = notJoined.filter(p => p.distance_km !== undefined && p.distance_km <= 50)
    availableParties = nearby.length > 0
      ? nearby.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999)).slice(0, 6)
      : notJoined.slice(0, 6) // Fallback: montrer toutes les parties
  } else if (userVille) {
    const sameCity = notJoined.filter(p => p.club_ville.toLowerCase() === userVille)
    availableParties = sameCity.length > 0 ? sameCity.slice(0, 6) : notJoined.slice(0, 6)
  } else {
    // Pas de localisation → montrer tout
    availableParties = notJoined.slice(0, 6)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: 100, fontFamily: 'var(--font-sans)' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ padding: '33px 20px 0' }}>
        <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, color: '#fff' }}>
          <span style={{ fontWeight: 300 }}>Hello </span>
          <span style={{ fontWeight: 700 }}>{prenom}</span>
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: '#8E8E93', fontStyle: 'italic', fontWeight: 300 }}>
          Prêt à jouer au padel aujourd&apos;hui ?
        </p>
      </div>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div style={{ display: 'flex', gap: 10, padding: '24px 20px 0' }}>
        <Link href="/parties/create" style={{ flex: 1, textDecoration: 'none' }}>
          <button type="button" style={{ width: '100%', height: 50, borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 300, lineHeight: 1 }}>+</span>
            Créer une partie
          </button>
        </Link>
        <Link href="/parties" style={{ flex: 1, textDecoration: 'none' }}>
          <button type="button" style={{ width: '100%', height: 50, borderRadius: 100, border: 'none', background: '#2C2C2E', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20" /><path d="M4 4v7a4 4 0 004 4h12" /></svg>
            Rejoindre une partie
          </button>
        </Link>
      </div>

      {/* ═══ VOTRE PROCHAINE PARTIE ═══ */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            Votre prochaine partie
          </h2>
          <Link href="/parties" style={{ fontSize: 14, color: '#8E8E93', textDecoration: 'none', fontWeight: 400 }}>
            Voir plus &rsaquo;
          </Link>
        </div>

        {myNextParty ? (
          <div style={{ margin: '0 16px', background: '#fff', borderRadius: 28, padding: '22px 22px 20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 19, fontWeight: 600, color: '#000', fontFamily: 'var(--font-sans)' }}>
                    {formatDate(myNextParty.date_heure)}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-sans)' }}>
                    {formatTime(myNextParty.date_heure)}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <DarkBadge>{myNextParty.club_nom}</DarkBadge>
                </div>
              </div>

              {/* 2×2 avatar grid from REAL players */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: -2 }}>
                {myNextParty.players.slice(0, 3).map((player) => (
                  <PlayerAvatar key={player.user_id} player={player} size={46} />
                ))}
                {myNextParty.players.length < 4 && <AddPlayerCircle size={46} />}
                {myNextParty.players.length >= 4 && (
                  <PlayerAvatar player={myNextParty.players[3]} size={46} />
                )}
              </div>
            </div>

            {/* Bottom: confirm + cancel */}
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -22, left: 4, width: 64, height: 36, opacity: 0.18 }}>
                  <svg viewBox="0 0 100 60" fill="none" stroke="#000" strokeWidth={1} width="100%" height="100%">
                    <rect x="0" y="0" width="100" height="60" />
                    <line x1="50" y1="0" x2="50" y2="60" />
                    <line x1="0" y1="30" x2="100" y2="30" />
                  </svg>
                </div>
                <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 100, border: '1px solid #D4D4D8', background: '#fff', color: '#000', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
                  Confirmer la réservation
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', marginRight: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #D4D4D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Annuler</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ margin: '0 16px', background: '#1C1C1E', borderRadius: 28, padding: '28px 22px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, color: '#8E8E93', fontFamily: 'var(--font-sans)' }}>
              Aucune partie rejointe pour le moment.
            </p>
            <Link href="/parties" style={{ display: 'inline-block', marginTop: 12, fontSize: 14, color: '#E8703A', fontWeight: 500, textDecoration: 'none' }}>
              Explorer les parties &rsaquo;
            </Link>
          </div>
        )}
      </div>

      {/* ═══ PARTIES DISPONIBLES ═══ */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            Parties disponibles
          </h2>
          <Link href="/parties" style={{ fontSize: 14, color: '#8E8E93', textDecoration: 'none', fontWeight: 400, fontStyle: 'italic' }}>
            Toutes les parties &rsaquo;
          </Link>
        </div>

        {availableParties.length > 0 ? (
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingLeft: 16, paddingRight: 32, paddingBottom: 8 }}
          >
            {availableParties.map((p) => (
              <Link key={p.id} href={`/parties/${p.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ minWidth: 260, width: 260, background: '#fff', borderRadius: 28, padding: '22px 22px 22px', display: 'flex', flexDirection: 'column' }}>
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 19, fontWeight: 600, color: '#000', fontFamily: 'var(--font-sans)' }}>
                      {formatDate(p.date_heure)}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-sans)' }}>
                      {formatTime(p.date_heure)}
                    </span>
                  </div>

                  {/* Club */}
                  <div style={{ marginBottom: 16 }}>
                    <DarkBadge>{p.club_nom}</DarkBadge>
                  </div>

                  {/* Niveaux */}
                  <p style={{ margin: 0, fontSize: 14, color: '#000', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                    Niveaux acceptés : <strong>{p.niveau_min} à {p.niveau_max}</strong>
                  </p>

                  <div style={{ flex: 1, minHeight: 28 }} />

                  {/* Real players + add circle */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                      {p.players.slice(0, 3).map((player, idx) => (
                        <PlayerAvatar
                          key={player.user_id}
                          player={player}
                          size={46}
                          style={{ marginLeft: idx === 0 ? 0 : -12 }}
                        />
                      ))}
                      {p.players.length === 0 && (
                        <span style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic', paddingBottom: 8 }}>Aucun joueur</span>
                      )}
                    </div>
                    {p.player_count < 4 && <AddPlayerCircle size={44} />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ margin: '0 16px', background: '#1C1C1E', borderRadius: 28, padding: '28px 22px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, color: '#8E8E93' }}>
              Aucune partie disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
