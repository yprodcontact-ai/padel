import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateShort, formatTime } from '@/lib/date-utils'
import { RefreshOnMount } from '@/components/RefreshOnMount'
import { ConversationList, type ChatItem } from './conversation-list'

export const metadata = { title: 'Messages — WizzPadel' }

type ConvParticipantRow = { conversation_id: string; archived: boolean | null; conversations: { type: string; party_id: string; parties: { date_heure: string; clubs: { nom: string } | null } | null; messages: { contenu: string; created_at: string; sender_id: string; lu: boolean }[] | null; conversation_participants: { user_id: string; users: { prenom: string, nom: string, photo_url: string } | null }[] | null } | null }

export default async function InboxPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) redirect('/login')

  const { data: participantsRaw, error: queryError } = await supabase
    .from('conversation_participants')
    .select(`conversation_id, archived, conversations ( type, party_id, parties ( date_heure, clubs (nom) ), messages ( contenu, created_at, sender_id, lu ), conversation_participants ( user_id, users ( prenom, nom, photo_url ) ) )`)
    .eq('user_id', user.id)

  const participants = participantsRaw as unknown as ConvParticipantRow[]
  const chatList = (participants || []).map(p => {
    const conv = p.conversations; if (!conv) return null
    let chatTitle = 'Chat'; let chatAvatar = null
    if (conv.type === 'groupe') {
      if (conv.parties?.date_heure) { chatTitle = `Match : ${formatDateShort(conv.parties.date_heure)} - ${formatTime(conv.parties.date_heure)}` } else { chatTitle = 'Match' }
    } else if (conv.type === 'prive') {
      const otherUser = conv.conversation_participants?.find(cp => cp.user_id !== user.id)?.users
      chatTitle = [otherUser?.prenom, otherUser?.nom].filter(Boolean).join(' ') || 'Utilisateur'
      chatAvatar = otherUser?.photo_url || null
    }
    const msgs = conv.messages || []; msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); const lastMessage = msgs[0]
    const unreadCount = msgs.filter(m => !m.lu && m.sender_id !== user.id).length
    return { id: p.conversation_id, title: chatTitle, type: conv.type, chatAvatar, partyId: conv.party_id, lastMessageText: lastMessage?.contenu || 'Aucun message', lastMessageTime: lastMessage ? lastMessage.created_at : null, lastSenderIsMe: lastMessage?.sender_id === user.id, unreadCount, archived: !!p.archived }
  }).filter(Boolean) as ChatItem[]
  chatList.sort((a, b) => { if (!a.lastMessageTime) return 1; if (!b.lastMessageTime) return -1; return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime() })

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '0 16px 20px' }}>
      <RefreshOnMount />

      {/* ── Hero header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '64px 0 24px' }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1.4px', lineHeight: 1.05 }}>Messages</h1>
        {/* Bouton + (future modale nouveau message) */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', cursor: 'pointer' }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </div>
      </div>

      {/* ── Erreur DB ── */}
      {queryError && <div style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', padding: 14, borderRadius: 14, marginBottom: 16, fontSize: 12 }}>Erreur : {JSON.stringify(queryError)}</div>}

      <ConversationList chats={chatList} />

      {/* Spacer explicite pour éviter le bug Safari du padding-bottom ignoré */}
      <div style={{ height: 160, flexShrink: 0 }} />
    </div>
  )
}
