'use client'

import { useTransition, useState } from 'react'
import { joinParty } from '@/app/parties/[id]/actions'
import { useRouter } from 'next/navigation'

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

  if (hasJoined) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); router.push(`/parties/${partyId}`) }}
        style={{
          width: '100%',
          height: 42,
          borderRadius: 100,
          border: '1.5px solid #22C55E',
          background: 'transparent',
          color: '#22C55E',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Inscrit
      </button>
    )
  }

  if (isPendingProp || requestSent) {
    return (
      <button
        type="button"
        disabled
        style={{
          width: '100%',
          height: 42,
          borderRadius: 100,
          border: '1.5px solid rgba(232,112,58,0.3)',
          background: 'transparent',
          color: '#f2c991',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Demande envoyée
      </button>
    )
  }

  if (isFull) {
    return (
      <button
        type="button"
        disabled
        style={{
          width: '100%',
          height: 42,
          borderRadius: 100,
          border: 'none',
          background: '#E5E5EA',
          color: 'var(--muted-foreground)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'not-allowed',
        }}
      >
        Complet
      </button>
    )
  }

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
        style={{
          width: '100%',
          height: 42,
          borderRadius: 100,
          border: '1.5px solid #f2c991',
          background: 'transparent',
          color: '#f2c991',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          opacity: isPending ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        Demander à rejoindre
      </button>
    )
  }

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
      style={{
        width: '100%',
        height: 42,
        borderRadius: 100,
        border: '1px solid #cf9619', background: '#f2c991', color: 'var(--foreground)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? 'Chargement...' : 'Rejoindre'}
    </button>
  )
}
