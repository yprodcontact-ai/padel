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

function PlayerAvatar({ player, size = 40, style }: { player: PlayerInfo; size?: number; style?: React.CSSProperties }) {
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

function AddPlayerCircle({ size = 40, style }: { size?: number, style?: React.CSSProperties }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '1.5px dashed #B5B5BA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93', fontSize: Math.round(size * 0.45), fontWeight: 300, flexShrink: 0, ...style }}>+</div>
  )
}

export function PartyCard({ party }: { party: PartyInfo }) {
  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '22px', border: '1px solid var(--card-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
      <Link href={`/parties/${party.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.7px', lineHeight: 1.1 }}>
              {formatDate(party.date_heure)}
            </h3>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontStyle: 'italic', color: 'var(--muted)' }}>
              {party.club_nom}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
              Niveaux : <strong style={{ fontWeight: 700 }}>{party.niveau_min} à {party.niveau_max}</strong>
            </p>
          </div>
          <div style={{ height: 38, padding: '0 16px', borderRadius: 999, border: '1px solid var(--card-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
            {formatTime(party.date_heure)}
          </div>
        </div>

        {/* Players row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {party.players.slice(0, 4).map((player, idx) => (
              <PlayerAvatar
                key={player.user_id}
                player={player}
                size={40}
                style={{ marginLeft: idx === 0 ? 0 : -10 }}
              />
            ))}
            {Array.from({ length: Math.max(0, 4 - party.players.length) }).map((_, i) => (
              <AddPlayerCircle key={`empty-${i}`} size={40} style={{ marginLeft: party.players.length === 0 && i === 0 ? 0 : -10 }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 6px 0 14px', borderRadius: 999, backgroundColor: 'var(--bg)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Détails</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
            </div>
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
