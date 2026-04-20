import { Card, CardContent } from "@/components/ui/card"
import { UsersIcon, MapPinIcon, CalendarIcon, ActivityIcon } from 'lucide-react'
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
  distance_km?: number;
}

export function PartyCard({ party }: { party: PartyInfo }) {
  const dateMatch = new Date(party.date_heure).toLocaleString('fr-FR', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  
  return (
    <Link href={`/parties/${party.id}`} className="block">
      <Card className="hover:border-primary/50 transition-colors shadow-sm">
        <CardContent className="p-4 flex flex-col space-y-3">
          <div className="flex justify-between items-start">
             <div>
               <p className="font-bold text-lg text-foreground truncate max-w-[200px]">{party.club_nom}</p>
               <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                  <MapPinIcon className="w-3 h-3 mr-1" /> 
                  {party.club_ville}
                  {party.distance_km !== undefined && ` (${party.distance_km} km)`}
               </p>
             </div>
             <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase">
               {party.type}
             </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
             <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="w-4 h-4 mr-1.5 text-primary/70" />
                <span className="capitalize">{dateMatch}</span>
             </div>
          </div>
          
          <div className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded-md">
             <div className="flex items-center">
                <ActivityIcon className="w-4 h-4 mr-1.5 text-muted-foreground" />
                <span>Niv. {party.niveau_min} - {party.niveau_max}</span>
             </div>
             <div className="flex items-center font-medium">
                <UsersIcon className="w-4 h-4 mr-1.5 text-muted-foreground" />
                <span className={party.player_count >= 4 ? "text-destructive font-bold" : ""}>{party.player_count}/4</span>
             </div>
          </div>
          
          <div className="pt-1">
             <CardJoinButton partyId={party.id} hasJoined={party.has_joined} isFull={party.player_count >= 4} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
