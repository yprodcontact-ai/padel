import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getDistanceFromLatLonInKm } from '@/lib/utils'
import { RefreshOnMount, RefreshButton } from '@/components/RefreshOnMount'
import { formatDate, formatTime } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

/* ─── Types (inchangés) ─── */
type PlayerProfile = { prenom: string | null; nom: string | null; niveau: number | null; photo_url: string | null }
type FetchedPartyPlayer = { user_id: string; users: PlayerProfile | null }
type FetchedParty = { id: string; date_heure: string; niveau_min: number; niveau_max: number; type: string; club_id?: string; clubs: { nom: string; ville: string; lat: number | null; lng: number | null } | null; party_players: FetchedPartyPlayer[] | null; statut: string }
type HomePlayerInfo = { user_id: string; prenom: string; nom: string; niveau: number; photo_url: string | null; initials: string }
type HomePartyInfo = { id: string; club_id: string; club_nom: string; club_ville: string; date_heure: string; niveau_min: number; niveau_max: number; type: string; players: HomePlayerInfo[]; player_count: number; has_joined: boolean; distance_km?: number; statut: string }

function mapPlayer(pp: FetchedPartyPlayer): HomePlayerInfo {
  const u = pp.users
  const prenom = u?.prenom || 'Joueur'
  const nom = u?.nom || ''
  return { user_id: pp.user_id, prenom, nom, niveau: u?.niveau ?? 5, photo_url: u?.photo_url || null, initials: `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() }
}

/* ─── Sub-components design v2 ─── */
function PlayerAvatar({ player, size = 40, style }: { player: HomePlayerInfo; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, borderRadius: '50%', boxShadow: '0 0 0 2px #fff', ...style }}>
      {player.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.photo_url} alt={player.prenom} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: Math.round(size * 0.36) }}>
          {player.initials}
        </div>
      )}
      <span style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', borderRadius: 999, fontSize: 9, fontWeight: 600, padding: '1px 5px', border: '1.5px solid #fff', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
        {player.niveau}
      </span>
    </div>
  )
}

function EmptySlot({ size = 40, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '1.5px dashed #B5B5BA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93', fontSize: Math.round(size * 0.45), fontWeight: 300, flexShrink: 0, ...style }}>+</div>
  )
}

function PartyCard({ party, variant = 'hero' }: { party: HomePartyInfo; variant?: 'hero' | 'carousel' }) {
  const isCarousel = variant === 'carousel'
  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', minWidth: isCarousel ? 280 : undefined, width: isCarousel ? 280 : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.7px', lineHeight: 1.1 }}>{formatDate(party.date_heure)}</h3>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontStyle: 'italic', color: 'var(--muted)' }}>{party.club_nom}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>Niveaux : <strong style={{ fontWeight: 700 }}>{party.niveau_min} à {party.niveau_max}</strong></p>
        </div>
        <div style={{ height: 38, padding: '0 16px', borderRadius: 999, border: '1px solid var(--card-border)', background: '#fff', display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 500, color: 'var(--ink)', flexShrink: 0 }}>
          {formatTime(party.date_heure)}
        </div>
      </div>
      {!isCarousel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: party.statut === 'confirmee' ? 'var(--accent)' : '#FF9500' }} />
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
            {party.statut === 'confirmee' ? 'Terrain réservé' : 'Terrain à réserver'}
          </span>
        </div>
      )}
      {isCarousel && <div style={{ height: 14 }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {party.players.slice(0, 4).map((player, idx) => (
            <PlayerAvatar key={player.user_id} player={player} size={40} style={{ marginLeft: idx === 0 ? 0 : -10 }} />
          ))}
          {Array.from({ length: Math.max(0, 4 - party.players.length) }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} size={40} style={{ marginLeft: party.players.length === 0 && i === 0 ? 0 : -10 }} />
          ))}
        </div>
        {!isCarousel ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 6px 0 14px', borderRadius: 999, backgroundColor: 'var(--bg)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Détails</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
            </div>
          </div>
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        )}
      </div>
    </div>
  )
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
    const { data: profile } = await supabase.from('users').select('*').eq('id', authData.user.id).single()
    if (profile) { userProfile = profile; if (profile.prenom) prenom = profile.prenom }
  }

  const now = new Date().toISOString()
  const { data: parties } = await (supabase.from('parties').select(`id, date_heure, niveau_min, niveau_max, type, club_id, statut, clubs (nom, ville, lat, lng), party_players ( user_id, users (prenom, nom, niveau, photo_url) )`).gte('date_heure', now).order('date_heure', { ascending: true }).limit(50))

  const userId = authData.user?.id
  const allMapped: HomePartyInfo[] = (parties as unknown as FetchedParty[] || []).map((p) => {
    const hasJoined = p.party_players?.some((player) => player.user_id === userId) || false
    const players = (p.party_players || []).map(mapPlayer)
    let distance_km: number | undefined = undefined
    if (userProfile?.lat && userProfile?.lng && p.clubs?.lat && p.clubs?.lng) {
      distance_km = getDistanceFromLatLonInKm(userProfile.lat as number, userProfile.lng as number, p.clubs.lat, p.clubs.lng)
    }
    return { id: p.id, club_id: p.club_id || '', club_nom: p.clubs?.nom || 'Club inconnu', club_ville: p.clubs?.ville || '', date_heure: p.date_heure, niveau_min: p.niveau_min, niveau_max: p.niveau_max, type: p.type, players, player_count: players.length, has_joined: hasJoined, distance_km, statut: p.statut || 'publiee' }
  })

  const myNextParty = allMapped.find(p => p.has_joined) || null
  const userNiveau = typeof userProfile?.niveau === 'number' ? userProfile.niveau : null
  const userClubId = userProfile?.club_id
  const notJoined = allMapped.filter(p => p.id !== myNextParty?.id && p.player_count < 4)
  const availableParties = notJoined.filter(p => {
    if (userNiveau === null || !userClubId) return false
    return p.niveau_min <= userNiveau && p.niveau_max >= userNiveau && p.club_id === userClubId
  }).slice(0, 6)

  const photoUrl = userProfile?.photo_url as string | null

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <RefreshOnMount />

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '64px 22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px var(--card-border)' }}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 }}>
                {prenom.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Bonjour</span>
            <span style={{ display: 'block', fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>{prenom}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/messages" style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 18px', borderRadius: 999, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}>Chat</Link>
          <Link href="/notifications" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', textDecoration: 'none' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
          </Link>
        </div>
      </div>

      {/* ═══ HERO TITLE ═══ */}
      <div style={{ padding: '0 22px', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.05, letterSpacing: '-1.4px', fontWeight: 600, color: 'var(--ink)' }}>
          Votre prochaine<br />
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>partie de padel</span>
        </h1>
      </div>

      {/* ═══ PROCHAINE PARTIE ═══ */}
      <div style={{ padding: '0 16px', marginBottom: 36 }}>
        {myNextParty ? (
          <Link href={`/parties/${myNextParty.id}`} style={{ display: 'block', textDecoration: 'none' }}>
            <div className="animate-in-stagger" style={{ animationDelay: '0.05s' }}>
              <PartyCard party={myNextParty} variant="hero" />
            </div>
          </Link>
        ) : (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '28px 22px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>Aucune partie rejointe pour le moment.</p>
            <Link href="/parties" style={{ display: 'inline-block', marginTop: 12, fontSize: 14, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Explorer les parties ›</Link>
          </div>
        )}
      </div>

      {/* ═══ PARTIES DISPONIBLES ═══ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Parties disponibles</h2>
          <RefreshButton />
        </div>
        {availableParties.length > 0 ? (
          <div className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingLeft: 16, paddingRight: 32, paddingBottom: 28 }}>
            {availableParties.map((p, idx) => (
              <Link key={p.id} href={`/parties/${p.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div className="animate-in-stagger-horizontal" style={{ animationDelay: `${0.05 + idx * 0.04}s` }}>
                  <PartyCard party={p} variant="carousel" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ margin: '0 16px', backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '28px 22px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>Aucune partie disponible pour le moment.</p>
          </div>
        )}
      </div>
      {/* Spacer pour contourner le bug Safari du padding-bottom */}
      <div style={{ height: 160, flexShrink: 0 }} />
    </div>
  )
}
