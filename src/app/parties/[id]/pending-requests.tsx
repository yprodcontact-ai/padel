'use client'

import { useTransition } from 'react'
import { handleJoinRequest } from './actions'

type PendingPlayer = {
  user_id: string
  prenom: string
  nom: string
  photo_url: string | null
  niveau: number | string | null
}

export function PendingRequests({ partyId, pendingPlayers }: { partyId: string, pendingPlayers: PendingPlayer[] }) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (requesterId: string, action: 'accept' | 'reject') => {
    startTransition(async () => {
      await handleJoinRequest(partyId, requesterId, action)
    })
  }

  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px 22px', marginBottom: 16, border: '1.5px solid rgba(232,112,58,0.3)' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: '#f2c991', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#f2c991" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Demandes en attente ({pendingPlayers.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pendingPlayers.map(player => (
          <div key={player.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--muted)', padding: '12px 14px', borderRadius: 16 }}>
            {player.photo_url ? (
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #3A3A3C', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.photo_url} alt={player.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>
                {player.prenom?.charAt(0) || 'P'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>{player.prenom} {player.nom?.charAt(0)}.</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#f2c991', fontWeight: 600 }}>Niveau: {player.niveau || 'N/A'}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleAction(player.user_id, 'accept')}
                disabled={isPending}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={() => handleAction(player.user_id, 'reject')}
                disabled={isPending}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
