import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircleIcon } from 'lucide-react'

export const metadata = {
   title: 'Mes Messages | Padel'
}

type ChatItem = {
    id: string;
    title: string;
    partyId: string;
    lastMessageText: string;
    lastMessageTime: Date | null;
    lastSenderIsMe: boolean;
};

type ConvParticipantRow = {
  conversation_id: string;
  conversations: {
    party_id: string;
    parties: {
      clubs: { nom: string } | null;
    } | null;
    messages: {
      contenu: string;
      created_at: string;
      sender_id: string;
    }[] | null;
  } | null;
}

export default async function InboxPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) redirect('/login')

  // Récupérer la liste des conversations où l'utilisateur participe
  const { data: participantsRaw } = await supabase
    .from('conversation_participants')
    .select(`
        conversation_id,
        conversations (
            party_id,
            parties ( clubs (nom) ),
            messages (
                contenu, created_at, sender_id
            )
        )
    `)
    .eq('user_id', user.id)

  const participants = participantsRaw as unknown as ConvParticipantRow[]

  // Formater les données pour l'interface
  const chatList = (participants || []).map(p => {
     const conv = p.conversations
     if (!conv) return null

     const party = conv.parties
     // Typage parfois capricieux sur Supabase JS si la DB modélise des One-to-Many
     // Le cast Record permet d'esquiver les soucis
     const clubName = party?.clubs && typeof party.clubs === 'object' ? (party.clubs as Record<string, unknown>).nom as string : 'Match'
     
     // Trier de manière safe pour obtenir le dernier message inséré
     const msgs = conv.messages || []
     msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     const lastMessage = msgs[0]

     return {
         id: p.conversation_id,
         title: `Match - ${clubName}`,
         partyId: conv.party_id,
         lastMessageText: lastMessage?.contenu || 'Aucun message',
         lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : null,
         lastSenderIsMe: lastMessage?.sender_id === user.id
     }
  }).filter(Boolean) as ChatItem[]

  // Tri global des conversations (les plus récentes en haut)
  chatList.sort((a, b) => {
     if (!a.lastMessageTime) return 1
     if (!b.lastMessageTime) return -1
     return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
  })

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 p-4 pb-24">
      <h1 className="text-3xl font-black mb-6 pt-4">Messages</h1>

      {chatList.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50 mt-20">
             <MessageCircleIcon className="w-16 h-16 mb-4" />
             <p>Vous n&apos;avez aucune conversation active.</p>
             <p className="text-sm mt-2">Rejoignez des parties pour discuter !</p>
          </div>
      ) : (
          <div className="flex flex-col gap-3">
             {chatList.map(chat => (
                <Link key={chat.id} href={`/messages/${chat.id}`}>
                   <div className="bg-background border p-4 rounded-[16px] flex items-center gap-4 hover:bg-muted/50 transition-colors shadow-sm relative overflow-hidden">
                      {/* Gradient décoratif */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80"></div>
                      
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ml-1">
                         <MessageCircleIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                         <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold truncate pr-3 text-sm">{chat.title}</h3>
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                               {chat.lastMessageTime ? chat.lastMessageTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                         </div>
                         <p className="text-xs text-muted-foreground truncate">
                            {chat.lastSenderIsMe && <span className="font-semibold text-foreground/70">Vous : </span>}
                            {chat.lastMessageText}
                         </p>
                      </div>
                   </div>
                </Link>
             ))}
          </div>
      )}
    </div>
  )
}
