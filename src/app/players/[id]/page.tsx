import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon, MessageCircleIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { startPrivateChat } from '../actions'
import { Button } from '@/components/ui/button'

export const metadata = {
   title: 'Profil Joueur | Padel'
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !player) {
    notFound()
  }

  const isMe = user.id === player.id

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 p-4 pb-24">
      <div className="pt-2">
          <Link href="/" className="mb-6 inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground bg-background px-4 py-2 rounded-full border shadow-sm">
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Retour
          </Link>
      </div>

      <div className="bg-background rounded-[24px] p-6 shadow-sm border flex flex-col items-center text-center max-w-sm mx-auto w-full relative overflow-hidden">
         {/* Effet décoratif gradient arrière plan */}
         <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>

         <Avatar className="w-28 h-28 mb-4 ring-4 ring-background shadow-xl z-10 relative">
            <AvatarImage src={player.photo_url || ''} />
            <AvatarFallback className="text-4xl font-black text-muted-foreground bg-muted">
                {player.prenom?.charAt(0) || 'J'}
            </AvatarFallback>
         </Avatar>

         <h1 className="text-2xl font-black mb-1 z-10">{player.prenom} {player.nom}</h1>
         <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center mb-8 z-10">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            Joueur vérifié
         </p>

         <div className="grid grid-cols-2 gap-4 w-full mb-8 z-10">
            <div className="bg-muted/40 p-4 rounded-2xl border shadow-inner">
               <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 opacity-80">Niveau Padel</span>
               <span className="text-2xl font-black text-primary">{player.niveau || 'N/A'}</span>
            </div>
            <div className="bg-muted/40 p-4 rounded-2xl border shadow-inner">
               <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 opacity-80">Côté Préféré</span>
               <span className="text-lg font-bold capitalize text-foreground/90">{player.poste || 'Mixte'}</span>
            </div>
            <div className="bg-muted/40 p-4 rounded-2xl border shadow-inner">
               <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 opacity-80">Main Forte</span>
               <span className="text-lg font-bold capitalize text-foreground/90">{player.main || 'Non défini'}</span>
            </div>
            <div className="bg-muted/40 p-4 rounded-2xl border shadow-inner">
               <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 opacity-80">Localisation</span>
               <span className="text-sm font-bold capitalize text-foreground/90 truncate max-w-full block">{player.ville || 'Aucune ville'}</span>
            </div>
         </div>

         {!isMe && (
           <form action={async () => {
              'use server'
              await startPrivateChat(player.id)
           }} className="w-full z-10">
              <Button type="submit" size="lg" className="w-full shadow-lg font-bold rounded-2xl h-14 hover:scale-[1.02] transition-transform">
                 <MessageCircleIcon className="mr-2 w-5 h-5" /> Envoyer un message privé
              </Button>
           </form>
         )}
         {isMe && (
           <div className="text-xs font-bold text-muted-foreground w-full z-10 opacity-50 border p-3 rounded-xl border-dashed">
             C&apos;est votre profil public
           </div>
         )}
      </div>
    </div>
  )
}
