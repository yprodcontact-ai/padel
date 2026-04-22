'use client'

import { useTransition } from 'react'
import { joinParty } from '@/app/parties/[id]/actions'
import { useRouter } from 'next/navigation'

export function CardJoinButton({ partyId, hasJoined, isFull }: { partyId: string, hasJoined: boolean, isFull: boolean }) {
  const [isPending, startTransition] = useTransition()
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
          color: '#8E8E93',
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
        border: 'none',
        background: '#E8703A',
        color: '#fff',
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
