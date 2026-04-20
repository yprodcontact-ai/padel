'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { joinParty } from '@/app/parties/[id]/actions'
import { useRouter } from 'next/navigation'
import { CheckIcon } from 'lucide-react'

export function CardJoinButton({ partyId, hasJoined, isFull }: { partyId: string, hasJoined: boolean, isFull: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (hasJoined) {
    return (
      <Button variant="outline" className="w-full text-green-600 border-green-600" onClick={(e) => { e.preventDefault(); router.push(`/parties/${partyId}`) }}>
        <CheckIcon className="w-4 h-4 mr-2" /> Inscrit
      </Button>
    )
  }

  if (isFull) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Complet
      </Button>
    )
  }

  return (
    <Button 
      className="w-full" 
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await joinParty(partyId)
          router.push(`/parties/${partyId}`)
        })
      }}
    >
      {isPending ? 'Chargement...' : 'Rejoindre'}
    </Button>
  )
}
