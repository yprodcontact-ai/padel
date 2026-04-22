import Link from 'next/link'
import { CardJoinButton } from './card-join-button'

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

export function PartyCard({ party }: { party: PartyInfo }) {
  return (
    <Link href={`/parties/${party.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: '#fff', borderRadius: 28, padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Date + Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 600, color: '#000', fontFamily: 'var(--font-sans)' }}>
                {formatDate(party.date_heure)}
              </span>
              <span style={{ fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-sans)' }}>
                {formatTime(party.date_heure)}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#1C1C1E', color: '#fff', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 100, fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}>
                {party.club_nom}
              </span>
            </div>
        </div>
          {/* type badge masqué pour le moment */}
        </div>

        {/* Info row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: '#000', fontFamily: 'var(--font-sans)' }}>
          <span>Niveaux : <strong>{party.niveau_min} à {party.niveau_max}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={party.player_count >= 4 ? '#EF4444' : '#000'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <strong style={{ color: party.player_count >= 4 ? '#EF4444' : '#000' }}>{party.player_count}/4</strong>
          </span>
        </div>

        {/* Button */}
        <CardJoinButton
          partyId={party.id}
          hasJoined={party.has_joined}
          isPending={party.is_pending}
          isFull={party.player_count >= 4}
          isBelowLevel={party.is_below_level}
        />
      </div>
    </Link>
  )
}
