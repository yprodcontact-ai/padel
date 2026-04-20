'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { joinParty, leaveParty, updatePartyStatus } from './actions'
import { CheckIcon, XIcon, LogInIcon, LogOutIcon } from 'lucide-react'

// Props shape
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

  const handleJoin = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await joinParty(partyId)
      if (res?.error) setErrorText(res.error)
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

  return (
    <div className="flex flex-col gap-3 w-full mt-6">
      {errorText && <p className="text-destructive text-sm text-center">{errorText}</p>}

      {isCreator ? (
        <>
          {status === 'complete' && (
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleStatus('confirm')} 
                disabled={isPending} 
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
              >
                <CheckIcon className="mr-2" /> Terrain réservé ✓
              </Button>
              <Button 
                onClick={() => handleStatus('cancel')} 
                disabled={isPending} 
                variant="destructive" 
                className="w-full h-12 text-base font-bold"
              >
                <XIcon className="mr-2" /> Créneau déjà réservé ✗
              </Button>
            </div>
          )}
          
          {status === 'publiee' && (
            <Button variant="secondary" className="w-full h-12" disabled>
              En attente de joueurs ({playerCount}/4)
            </Button>
          )}

          {status === 'confirmee' && (
            <Button className="w-full h-12 bg-green-600 text-white opacity-100" disabled>
               Match Confirmé !
            </Button>
          )}

          {status === 'annulee' && (
            <Button variant="destructive" className="w-full h-12 opacity-100" disabled>
               Match Annulé
            </Button>
          )}
        </>
      ) : (
        <>
          {isParticipant ? (
             <Button 
                onClick={handleLeave} 
                disabled={isPending || status === 'confirmee' || status === 'annulee'} 
                variant="outline"
                className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10"
              >
                <LogOutIcon className="mr-2 w-4 h-4" /> Quitter la partie
             </Button>
          ) : (
             <>
               {status === 'publiee' && playerCount < 4 ? (
                  <Button 
                    onClick={handleJoin} 
                    disabled={isPending} 
                    className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
                  >
                    <LogInIcon className="mr-2" /> Rejoindre la partie
                  </Button>
               ) : (
                  <Button variant="secondary" className="w-full h-12 text-base" disabled>
                     {status === 'annulee' ? 'Partie annulée' : 'Partie complète'}
                  </Button>
               )}
             </>
          )}
        </>
      )}
    </div>
  )
}
