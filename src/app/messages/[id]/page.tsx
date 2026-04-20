import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { ChatInterface } from '@/app/messages/[id]/chat-interface'

export const metadata = {
   title: 'Discussion | Padel'
}

export default async function MessagePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) redirect('/login')

  // Validation de participation
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!participant) redirect('/')

  // Récupération de l'historique des messages lié aux expéditeurs
  const { data: initialMessages } = await supabase
    .from('messages')
    .select(`
       id, 
       contenu, 
       created_at, 
       sender_id,
       users ( prenom, photo_url )
    `)
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  // Récupération du contexte (pour le header : Club ou Partie info)
  const { data: convInfo } = await supabase
    .from('conversations')
    .select('party_id')
    .eq('id', params.id)
    .single()

  let chatTitle = 'Discussion de Groupe'
  let backLink = '/'

  if (convInfo?.party_id) {
     backLink = `/parties/${convInfo.party_id}`
     const { data: partyData } = await supabase
        .from('parties')
        .select('clubs (nom)')
        .eq('id', convInfo.party_id)
        .single()
     
     if (partyData?.clubs) {
         chatTitle = `Match - ${(partyData.clubs as unknown as Record<string, unknown>).nom as string}`
     }
  }

  // Formatage des messages initiaux pour l'UI
  const formattedMessages = (initialMessages || []).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      contenu: m.contenu as string,
      created_at: m.created_at as string,
      sender_id: m.sender_id as string,
      senderData: m.users as { prenom: string, photo_url: string } | null
  }))

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-muted/10 relative">
      
      {/* HEADER */}
      <div className="bg-background border-b px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center shrink-0">
         <Link href={backLink} className="mr-3 p-1 rounded-md hover:bg-muted">
            <ChevronLeftIcon className="w-5 h-5" />
         </Link>
         <div>
            <h1 className="text-lg font-bold">{chatTitle}</h1>
            <p className="text-xs text-muted-foreground flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block animate-pulse"></span>
                En direct
            </p>
         </div>
      </div>

      {/* CHAT INTERFACE (Client realtime) */}
      <ChatInterface 
         conversationId={params.id} 
         initialMessages={formattedMessages} 
         currentUserId={user.id} 
      />

    </div>
  )
}
