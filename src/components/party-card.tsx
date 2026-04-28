import Link from 'next/link'
import { CardJoinButton } from './card-join-button'
import { formatDate, formatTime } from '@/lib/date-utils'

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


/* ─── Sub-components matching homepage design ─── */

function PlayerAvatar({ player, size = 46, style }: { player: PlayerInfo; size?: number; style?: React.CSSProperties }) {
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

export function PartyCard({ party }: { party: PartyInfo }) {
  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
      <Link href={`/parties/${party.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 500, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
              {formatDate(party.date_heure)}
            </h3>
            <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted-foreground)' }}>
              {party.club_nom}
            </p>
          </div>
          <div style={{ height: 40, padding: '0 16px', borderRadius: 100, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: 'var(--foreground)' }}>
            {formatTime(party.date_heure)}
          </div>
        </div>

        <p style={{ margin: '0 0 28px', fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>
          Niveaux acceptés : <strong style={{ fontWeight: 700 }}>{party.niveau_min} à {party.niveau_max}</strong>
        </p>

        {/* Players row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {party.players.slice(0, 3).map((player, idx) => (
              <PlayerAvatar
                key={player.user_id}
                player={player}
                size={50}
                style={{ marginLeft: idx === 0 ? 0 : -14 }}
              />
            ))}
            {party.players.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', marginRight: 12 }}>Aucun joueur</span>
            )}
            {party.players.length < 4 && <AddPlayerCircle size={50} style={{ marginLeft: party.players.length > 0 ? -14 : 0 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: party.player_count >= 4 ? '#FF3B30' : 'var(--muted-foreground)' }}>
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
