import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PartyActionButtons } from './party-buttons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UsersIcon } from 'lucide-react'

type Player = {
  user_id: string;
  users: {
    prenom: string;
    nom: string;
    photo_url: string;
    niveau: number | string;
  } | null;
}

export default async function PartyDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData.user?.id

  const { data: party, error } = await supabase
    .from('parties')
    .select(`
      *,
      clubs (nom, ville),
      users:createur_id (prenom, nom, niveau, photo_url),
      party_players (
        user_id,
        users (prenom, nom, photo_url, niveau)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !party) {
    notFound()
  }

  const isCreator = currentUserId === party.createur_id
  const isParticipant = party.party_players?.some((p: Player) => p.user_id === currentUserId)
  const playerCount = party.party_players?.length || 0
  const players = party.party_players || []

  const dateMatch = new Date(party.date_heure).toLocaleString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="flex min-h-screen w-full flex-col p-4 bg-muted/20 pb-20">
      <div className="mx-auto w-full max-w-md pt-4">
        
        <Link href="/" className="text-sm text-primary mb-4 block">
          &larr; Retour à l&apos;accueil
        </Link>
        
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {party.type}
              </span>
              <h1 className="text-2xl font-bold mt-3">Match ({party.visibilite})</h1>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Où</p>
              <p className="font-semibold text-lg">{party.clubs?.nom} - {party.clubs?.ville}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Quand</p>
              <p className="font-semibold text-lg capitalize">{dateMatch}</p>
            </div>
            
            <div>
               <p className="text-sm text-muted-foreground">Niveaux acceptés</p>
               <p className="font-semibold text-lg">{party.niveau_min} à {party.niveau_max}</p>
            </div>

            {party.commentaire && (
              <div className="bg-muted p-4 rounded-lg mt-4 text-sm italic">
                &quot;{party.commentaire}&quot;
              </div>
            )}
          </div>
        </div>

        {/* SECTION JOUEURS */}
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
           <h2 className="text-lg font-bold mb-4 flex items-center">
             <UsersIcon className="w-5 h-5 mr-2 text-primary" />
             Joueurs Inscrits ({playerCount}/4)
           </h2>
           
           <div className="flex flex-col space-y-4">
             {players.map((player: Player) => (
                <div key={player.user_id} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                     <AvatarImage src={player.users?.photo_url || ''} />
                     <AvatarFallback>{player.users?.prenom?.charAt(0) || 'P'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{player.users?.prenom} {player.users?.nom?.charAt(0)}.</p>
                    <p className="text-xs text-muted-foreground">Niveau: {player.users?.niveau || 'N/A'}</p>
                  </div>
                  {player.user_id === party.createur_id && (
                    <div className="ml-auto inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                       Orga
                    </div>
                  )}
                </div>
             ))}
             
             {/* Emplacements vides */}
             {Array.from({ length: Math.max(0, 4 - playerCount) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center space-x-3 bg-muted/10 p-3 rounded-lg border border-dashed">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed bg-muted flex items-center justify-center">
                     <UsersIcon className="w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                  <div className="text-muted-foreground text-sm italic">Place disponible</div>
                </div>
             ))}
           </div>
        </div>
        
        {/* BOUTONS D'ACTION (Client Component) */}
        {currentUserId && (
           <PartyActionButtons 
             partyId={party.id}
             isCreator={isCreator}
             isParticipant={isParticipant}
             status={party.statut}
             playerCount={playerCount}
           />
        )}

      </div>
    </div>
  )
}
