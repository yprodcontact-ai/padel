'use client'

import { useState, useTransition } from 'react'
import { joinParty, leaveParty, updatePartyStatus } from './actions'

interface PartyButtonsProps {
  partyId: string
  isCreator: boolean
  isParticipant: boolean
  status: string
  playerCount: number
}

export function PartyActionButtons({ partyId, isCreator, isParticipant, status, playerCount }: PartyButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [errorText, setErrorText] = useState<string | null>(null)

  const handleJoin = () => { setErrorText(null); startTransition(async () => { const res = await joinParty(partyId); if (res?.error) setErrorText(res.error) }) }
  const handleLeave = () => { setErrorText(null); startTransition(async () => { const res = await leaveParty(partyId); if (res?.error) setErrorText(res.error) }) }
  const handleStatus = (action: 'confirm' | 'cancel') => { setErrorText(null); startTransition(async () => { const res = await updatePartyStatus(partyId, action); if (res?.error) setErrorText(res.error) }) }

  const btn: React.CSSProperties = { width: '100%', height: 50, borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {errorText && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorText}</p>}
      {isCreator ? (<>
        {status === 'complete' && (<>
          <button onClick={() => handleStatus('confirm')} disabled={isPending} style={{ ...btn, background: '#22C55E', color: '#fff' }}>Terrain réservé ✓</button>
          <button onClick={() => handleStatus('cancel')} disabled={isPending} style={{ ...btn, background: '#EF4444', color: '#fff' }}>Créneau déjà réservé ✗</button>
        </>)}
        {status === 'publiee' && <button disabled style={{ ...btn, background: '#2C2C2E', color: '#8E8E93', cursor: 'default' }}>En attente ({playerCount}/4)</button>}
        {status === 'confirmee' && <button disabled style={{ ...btn, background: '#22C55E', color: '#fff', cursor: 'default' }}>Match Confirmé !</button>}
        {status === 'annulee' && <button disabled style={{ ...btn, background: '#EF4444', color: '#fff', cursor: 'default' }}>Match Annulé</button>}
      </>) : (<>
        {isParticipant ? (
          <button onClick={handleLeave} disabled={isPending || status === 'confirmee' || status === 'annulee'} style={{ ...btn, background: 'transparent', border: '1.5px solid #EF4444', color: '#EF4444' }}>Quitter la partie</button>
        ) : (<>
          {status === 'publiee' && playerCount < 4 ? (
            <button onClick={handleJoin} disabled={isPending} style={{ ...btn, background: '#E8703A', color: '#fff', opacity: isPending ? 0.6 : 1 }}>Rejoindre la partie</button>
          ) : (
            <button disabled style={{ ...btn, background: '#2C2C2E', color: '#8E8E93', cursor: 'default' }}>{status === 'annulee' ? 'Partie annulée' : 'Partie complète'}</button>
          )}
        </>)}
      </>)}
    </div>
  )
}
