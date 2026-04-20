import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircleIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const metadata = {
   title: 'Mes Messages | Padel'
}

type ChatItem = {
    id: string;
    title: string;
    type: string;
    chatAvatar: string | null;
    partyId: string;
    lastMessageText: string;
    lastMessageTime: Date | null;
    lastSenderIsMe: boolean;
    unreadCount: number;
};

type ConvParticipantRow = {
  conversation_id: string;
  conversations: {
    type: string;
    party_id: string;
    parties: {
      clubs: { nom: string } | null;
    } | null;
    messages: {
      contenu: string;
      created_at: string;
      sender_id: string;
      lu: boolean;
    }[] | null;
    conversation_participants: {
      user_id: string;
      users: { prenom: string, photo_url: string } | null;
    }[] | null;
  } | null;
}

export default async function InboxPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) redirect('/login')

  const { data: participantsRaw, error: queryError } = await supabase
    .from('conversation_participants')
    .select(`
        conversation_id,
        conversations (
            type,
            party_id,
            parties ( clubs (nom) ),
            messages (
                contenu, created_at, sender_id, lu
            ),
            conversation_participants (
                user_id,
                users ( prenom, photo_url )
            )
        )
    `)
    .eq('user_id', user.id)

  if (queryError) {
      console.error("Inbox Supabase Error:", queryError)
  }

  const participants = participantsRaw as unknown as ConvParticipantRow[]

  const chatList = (participants || []).map(p => {
     const conv = p.conversations
     if (!conv) return null

     const party = conv.parties
     
     let chatTitle = 'Chat'
     let chatAvatar = null

     if (conv.type === 'groupe') {
        const clubName = party?.clubs && typeof party.clubs === 'object' ? (party.clubs as Record<string, unknown>).nom as string : 'Match Privé'
        chatTitle = `Match - ${clubName}`
     } else if (conv.type === 'prive') {
        const otherUser = conv.conversation_participants?.find(cp => cp.user_id !== user.id)?.users
        chatTitle = otherUser?.prenom || 'Utilisateur'
        chatAvatar = otherUser?.photo_url || null
     }

     const msgs = conv.messages || []
     msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     const lastMessage = msgs[0]
     
     const unreadCount = msgs.filter(m => !m.lu && m.sender_id !== user.id).length

     return {
         id: p.conversation_id,
         title: chatTitle,
         type: conv.type,
         chatAvatar: chatAvatar,
         partyId: conv.party_id,
         lastMessageText: lastMessage?.contenu || 'Aucun message',
         lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : null,
         lastSenderIsMe: lastMessage?.sender_id === user.id,
         unreadCount
     }
  }).filter(Boolean) as ChatItem[]

  chatList.sort((a, b) => {
     if (!a.lastMessageTime) return 1
     if (!b.lastMessageTime) return -1
     return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
  })

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 p-4 pb-24">
      <h1 className="text-3xl font-black mb-6 pt-4">Messages</h1>

      {queryError && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-4 text-xs font-mono">
              Erreur DB: {JSON.stringify(queryError)}
          </div>
      )}

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
                      {chat.unreadCount > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                      {!chat.unreadCount && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80"></div>}
                      
                      <div className="shrink-0 ml-1">
                         {chat.type === 'prive' ? (
                             <Avatar className="w-12 h-12 shadow-sm border border-muted">
                                <AvatarImage src={chat.chatAvatar || ''} />
                                <AvatarFallback className="bg-muted text-muted-foreground font-bold text-lg">
                                    {chat.title.charAt(0)}
                                </AvatarFallback>
                             </Avatar>
                         ) : (
                             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageCircleIcon className="w-5 h-5 text-primary" />
                             </div>
                         )}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                         <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`truncate pr-3 text-sm ${chat.unreadCount > 0 ? 'font-black' : 'font-bold'}`}>
                                {chat.title}
                            </h3>
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                               {chat.lastMessageTime ? chat.lastMessageTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                         </div>
                         <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                            {chat.lastSenderIsMe && <span className="font-semibold opacity-70">Vous : </span>}
                            {chat.lastMessageText}
                         </p>
                      </div>

                      {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                              {chat.unreadCount}
                          </div>
                      )}
                   </div>
                </Link>
             ))}
          </div>
      )}
    </div>
  )
}
