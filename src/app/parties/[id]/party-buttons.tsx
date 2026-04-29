'use client'

import { useState, useTransition } from 'react'
import { joinParty, leaveParty, updatePartyStatus } from './actions'

/**
 * PartyActionButtons — CTA flottant design handoff v2
 *
 * États couverts (logique métier inchangée) :
 *   - open  : 1+ place, bouton noir "Rejoindre"
 *   - full  : complet, bouton blanc bordé "Quitter"
 *   - below : niveau trop bas, bouton bordé "Demander à rejoindre"
 *   - pending/sent : état d'attente
 *   - creator : bouton de statut
 */

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

  const handleJoin = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await joinParty(partyId)
      if (res?.error) setErrorText(res.error)
      if (res?.status === 'en_attente') setRequestSent(true)
    })
  }
  const handleLeave = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await leaveParty(partyId)
      if (res?.error) setErrorText(res.error)
    })
  }
  const handleStatus = (action: 'confirm' | 'cancel') => {
    setErrorText(null)
    startTransition(async () => {
      const res = await updatePartyStatus(partyId, action)
      if (res?.error) setErrorText(res.error)
    })
  }

  /* ── Styles de base ── */
  const btnBase: React.CSSProperties = {
    width: '100%',
    height: 52,
    borderRadius: 'var(--radius-card)',   // 28px
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.15s ease',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {errorText && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorText}</p>}

      {/* ── Créateur en attente de complétion ── */}
      {isCreator && status === 'publiee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
          En attente ({playerCount}/4)
        </button>
      )}

      {/* ── Actions créateur : confirmer terrain / annuler ── */}
      {isParticipant && status === 'complete' && (
        <>
          <button onClick={() => handleStatus('confirm')} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--accent)', color: '#fff', opacity: isPendingTransition ? 0.6 : 1 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Confirmer le terrain
          </button>
          <button onClick={() => handleStatus('cancel')} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'transparent', border: '1px solid var(--card-border)', color: 'var(--muted)', opacity: isPendingTransition ? 0.6 : 1 }}>
            Créneau non disponible
          </button>
        </>
      )}

      {/* ── Match confirmé (participant) ── */}
      {isParticipant && status === 'confirmee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--accent)', color: '#fff', cursor: 'default' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Match confirmé
        </button>
      )}

      {/* ── Match annulé ── */}
      {isParticipant && status === 'annulee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
          Match annulé
        </button>
      )}

      {/* ── Participant non-créateur → Quitter (état open, style "full" = fond blanc bordé) ── */}
      {isParticipant && !isCreator && status === 'publiee' && (
        <button onClick={handleLeave} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--ink)', opacity: isPendingTransition ? 0.6 : 1 }}>
          Quitter la partie
        </button>
      )}

      {/* ── Non-inscrit ── */}
      {!isParticipant && (
        <>
          {/* En attente de validation */}
          {(isPending || requestSent) && (
            <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Demande envoyée
            </button>
          )}

          {/* Rejoindre (open) ou Complet */}
          {!isPending && !requestSent && (
            <>
              {status === 'publiee' && playerCount < 4 ? (
                isBelowLevel ? (
                  /* Niveau insuffisant → demande */
                  <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'transparent', border: '1.5px solid var(--ink)', color: 'var(--ink)', opacity: isPendingTransition ? 0.6 : 1 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    Demander à rejoindre
                  </button>
                ) : (
                  /* Rejoindre direct — bouton noir (état open) */
                  <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--ink)', color: '#fff', opacity: isPendingTransition ? 0.6 : 1 }}>
                    {isPendingTransition ? 'Chargement…' : 'Rejoindre la partie'}
                  </button>
                )
              ) : (
                /* Complet ou annulée */
                <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
                  {status === 'annulee' ? 'Partie annulée' : 'Partie complète'}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
