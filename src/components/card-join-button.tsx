'use client'

import { useTransition, useState } from 'react'
import { joinParty } from '@/app/parties/[id]/actions'
import { useRouter } from 'next/navigation'

/**
 * CardJoinButton — bouton Rejoindre sur les PartyCards de la liste et du carousel.
 * Design handoff v2 : fond noir / blanc bordé / gris désactivé.
 * Logique métier inchangée.
 */

interface CardJoinButtonProps {
  partyId: string
  hasJoined: boolean
  isPending?: boolean
  isFull: boolean
  isBelowLevel?: boolean
}

export function CardJoinButton({ partyId, hasJoined, isPending: isPendingProp, isFull, isBelowLevel }: CardJoinButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [requestSent, setRequestSent] = useState(false)
  const router = useRouter()

  const base: React.CSSProperties = {
    width: '100%',
    height: 44,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    transition: 'opacity 0.15s ease',
    marginTop: 16,
  }

  /* ── Déjà inscrit → bouton blanc "Inscrit ✓" ── */
  if (hasJoined) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); router.push(`/parties/${partyId}`) }}
        style={{ ...base, backgroundColor: 'var(--card)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Inscrit
      </button>
    )
  }

  /* ── Demande envoyée ── */
  if (isPendingProp || requestSent) {
    return (
      <button type="button" disabled style={{ ...base, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        Demande envoyée
      </button>
    )
  }

  /* ── Complet ── */
  if (isFull) {
    return (
      <button type="button" disabled style={{ ...base, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'not-allowed' }}>
        Complet
      </button>
    )
  }

  /* ── Niveau insuffisant → demander ── */
  if (isBelowLevel) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault()
          startTransition(async () => {
            const res = await joinParty(partyId)
            if (res?.status === 'en_attente') setRequestSent(true)
            else router.push(`/parties/${partyId}`)
          })
        }}
        style={{ ...base, backgroundColor: 'transparent', border: '1.5px solid var(--ink)', color: 'var(--ink)', opacity: isPending ? 0.6 : 1 }}
      >
        Demander à rejoindre
      </button>
    )
  }

  /* ── Rejoindre ── */
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await joinParty(partyId)
          router.push(`/parties/${partyId}`)
        })
      }}
      style={{ ...base, backgroundColor: 'var(--ink)', color: '#fff', opacity: isPending ? 0.6 : 1 }}
    >
      {isPending ? 'Chargement…' : 'Rejoindre'}
    </button>
  )
}
