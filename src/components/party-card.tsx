import Link from 'next/link'
import { CardJoinButton } from './card-join-button'

export type PlayerInfo = {
  user_id: string;
  prenom: string;
  nom: string;
  niveau: number;
  photo_url: string | null;
  initials: string;
}

export type PartyInfo = {
  id: string;
  club_nom: string;
  club_ville: string;
  date_heure: string;
  niveau_min: number;
  niveau_max: number;
  type: string;
  player_count: number;
  has_joined: boolean;
  is_pending?: boolean;
  is_below_level?: boolean;
  distance_km?: number;
  players: PlayerInfo[];
}

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

/* ─── Sub-components matching homepage design ─── */

function PlayerAvatar({ player, size = 42, style }: { player: PlayerInfo; size?: number; style?: React.CSSProperties }) {
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

function AddPlayerCircle({ size = 42 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, border: '1.5px dashed #A1A1AA', background: '#fff', flexShrink: 0 }}
    >
      <svg width={16} height={16} viewBox="0 0 18 18" fill="none" stroke="#A1A1AA" strokeWidth={1.5}>
        <line x1="9" y1="3" x2="9" y2="15" />
        <line x1="3" y1="9" x2="15" y2="9" />
      </svg>
    </div>
  )
}

export function PartyCard({ party }: { party: PartyInfo }) {
  return (
    <div style={{ background: '#fff', borderRadius: 28, padding: '22px 22px 20px', display: 'flex', flexDirection: 'column' }}>
      {/* Row 1: Date/Time + Club link */}
      <Link href={`/parties/${party.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 19, fontWeight: 600, color: '#000', fontFamily: 'var(--font-sans)' }}>
            {formatDate(party.date_heure)}
          </span>
          <span style={{ fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-sans)' }}>
            {formatTime(party.date_heure)}
          </span>
        </div>

        {/* Club badge */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', background: '#1C1C1E', color: '#fff', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 100, fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}>
            {party.club_nom}
          </span>
        </div>

        {/* Niveaux */}
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#000', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
          Niveaux acceptés : <strong>{party.niveau_min} à {party.niveau_max}</strong>
        </p>

        {/* Players row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex' }}>
            {party.players.slice(0, 3).map((player, idx) => (
              <PlayerAvatar
                key={player.user_id}
                player={player}
                size={42}
                style={{ marginLeft: idx === 0 ? 0 : -10 }}
              />
            ))}
            {party.players.length === 0 && (
              <span style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic', paddingBottom: 8 }}>Aucun joueur</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {party.player_count < 4 && <AddPlayerCircle size={42} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: party.player_count >= 4 ? '#EF4444' : '#8E8E93', fontFamily: 'var(--font-sans)' }}>
              {party.player_count}/4
            </span>
          </div>
        </div>
      </Link>

      {/* Join button */}
      <CardJoinButton
        partyId={party.id}
        hasJoined={party.has_joined}
        isPending={party.is_pending}
        isFull={party.player_count >= 4}
        isBelowLevel={party.is_below_level}
      />
    </div>
  )
}
