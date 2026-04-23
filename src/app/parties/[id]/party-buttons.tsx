'use client'

import { useState, useTransition } from 'react'
import { joinParty, leaveParty, updatePartyStatus } from './actions'

interface PartyButtonsProps {
  partyId: string
  isCreator: boolean
  isParticipant: boolean
  isPending: boolean
  isBelowLevel: boolean
  status: string
  playerCount: number
}

export function PartyActionButtons({ partyId, isCreator, isParticipant, isPending, isBelowLevel, status, playerCount }: PartyButtonsProps) {
  const [isPendingTransition, startTransition] = useTransition()
  const [errorText, setErrorText] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)

  const handleJoin = () => { setErrorText(null); startTransition(async () => { const res = await joinParty(partyId); if (res?.error) setErrorText(res.error); if (res?.status === 'en_attente') setRequestSent(true) }) }
  const handleLeave = () => { setErrorText(null); startTransition(async () => { const res = await leaveParty(partyId); if (res?.error) setErrorText(res.error) }) }
  const handleStatus = (action: 'confirm' | 'cancel') => { setErrorText(null); startTransition(async () => { const res = await updatePartyStatus(partyId, action); if (res?.error) setErrorText(res.error) }) }

  const btn: React.CSSProperties = { width: '100%', height: 50, borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
      {errorText && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorText}</p>}

      {isParticipant && status === 'complete' && (<>
        <button onClick={() => handleStatus('confirm')} disabled={isPendingTransition} style={{ ...btn, background: '#22C55E', color: 'var(--foreground)' }}>Terrain réservé ✓</button>
        <button onClick={() => handleStatus('cancel')} disabled={isPendingTransition} style={{ ...btn, background: '#EF4444', color: 'var(--foreground)' }}>Créneau déjà réservé ✗</button>
      </>)}

      {isParticipant && status === 'confirmee' && (
        <button disabled style={{ ...btn, background: '#22C55E', color: 'var(--foreground)', cursor: 'default' }}>Match Confirmé !</button>
      )}

      {isParticipant && status === 'annulee' && (
        <button disabled style={{ ...btn, background: '#EF4444', color: 'var(--foreground)', cursor: 'default' }}>Match Annulé</button>
      )}

      {isCreator && status === 'publiee' && (
        <button disabled style={{ ...btn, backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', cursor: 'default' }}>En attente ({playerCount}/4)</button>
      )}

      {isParticipant && !isCreator && status === 'publiee' && (
        <button onClick={handleLeave} disabled={isPendingTransition} style={{ ...btn, background: 'transparent', border: '1.5px solid #EF4444', color: '#EF4444' }}>Quitter la partie</button>
      )}

      {!isParticipant && (<>
        {isPending || requestSent ? (
          <button disabled style={{ ...btn, backgroundColor: 'var(--muted)', color: '#f2c991', cursor: 'default', border: '1.5px solid rgba(232,112,58,0.3)' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Demande envoyée
          </button>
        ) : (<>
          {status === 'publiee' && playerCount < 4 ? (
            isBelowLevel ? (
              <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btn, background: 'transparent', border: '1.5px solid #f2c991', color: '#f2c991', opacity: isPendingTransition ? 0.6 : 1 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Demander à rejoindre
              </button>
            ) : (
              <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btn, background: '#f2c991', border: '1px solid #cf9619', color: 'var(--foreground)', opacity: isPendingTransition ? 0.6 : 1 }}>Rejoindre la partie</button>
            )
          ) : (
            <button disabled style={{ ...btn, backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', cursor: 'default' }}>{status === 'annulee' ? 'Partie annulée' : 'Partie complète'}</button>
          )}
        </>)}
      </>)}
    </div>
  )
}
