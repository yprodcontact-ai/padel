import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, formatTime } from '@/lib/date-utils'

export const metadata = { title: 'Mes Messages | Padel' }

type ChatItem = { id: string; title: string; type: string; chatAvatar: string | null; partyId: string; lastMessageText: string; lastMessageTime: Date | null; lastSenderIsMe: boolean; unreadCount: number }
type ConvParticipantRow = { conversation_id: string; conversations: { type: string; party_id: string; parties: { date_heure: string; clubs: { nom: string } | null } | null; messages: { contenu: string; created_at: string; sender_id: string; lu: boolean }[] | null; conversation_participants: { user_id: string; users: { prenom: string, photo_url: string } | null }[] | null } | null }

export default async function InboxPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) redirect('/login')

  const { data: participantsRaw, error: queryError } = await supabase
    .from('conversation_participants')
    .select(`conversation_id, conversations ( type, party_id, parties ( date_heure, clubs (nom) ), messages ( contenu, created_at, sender_id, lu ), conversation_participants ( user_id, users ( prenom, photo_url ) ) )`)
    .eq('user_id', user.id)

  const participants = participantsRaw as unknown as ConvParticipantRow[]
  const chatList = (participants || []).map(p => {
    const conv = p.conversations; if (!conv) return null
    let chatTitle = 'Chat'; let chatAvatar = null
    if (conv.type === 'groupe') { if (conv.parties?.date_heure) { const dateStr = formatDateShort(conv.parties.date_heure); const timeStr = formatTime(conv.parties.date_heure); chatTitle = `Match : ${dateStr} - ${timeStr}` } else { chatTitle = 'Match' } }
    else if (conv.type === 'prive') { const otherUser = conv.conversation_participants?.find(cp => cp.user_id !== user.id)?.users; chatTitle = otherUser?.prenom || 'Utilisateur'; chatAvatar = otherUser?.photo_url || null }
    const msgs = conv.messages || []; msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); const lastMessage = msgs[0]
    const unreadCount = msgs.filter(m => !m.lu && m.sender_id !== user.id).length
    return { id: p.conversation_id, title: chatTitle, type: conv.type, chatAvatar, partyId: conv.party_id, lastMessageText: lastMessage?.contenu || 'Aucun message', lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : null, lastSenderIsMe: lastMessage?.sender_id === user.id, unreadCount }
  }).filter(Boolean) as ChatItem[]
  chatList.sort((a, b) => { if (!a.lastMessageTime) return 1; if (!b.lastMessageTime) return -1; return b.lastMessageTime.getTime() - a.lastMessageTime.getTime() })

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ margin: '16px 0 24px', fontSize: 30, fontWeight: 800, color: 'var(--foreground)' }}>Messages</h1>

      {queryError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 12, fontFamily: 'monospace' }}>Erreur DB: {JSON.stringify(queryError)}</div>}

      {chatList.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: 80, opacity: 0.5 }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>Vous n&apos;avez aucune conversation active.</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, margin: '8px 0 0' }}>Rejoignez des parties pour discuter !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chatList.map(chat => (
            <Link key={chat.id} href={`/messages/${chat.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'var(--card)', padding: '14px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
                {chat.unreadCount > 0 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#EF4444', borderRadius: '0 4px 4px 0' }} />}

                <div style={{ flexShrink: 0 }}>
                  {chat.type === 'prive' && chat.chatAvatar ? (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid #2C2C2E' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={chat.chatAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f2c991" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: chat.unreadCount > 0 ? 800 : 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{chat.title}</h3>
                    <span style={{ fontSize: 10, color: 'var(--muted-foreground)', flexShrink: 0, fontWeight: 500 }}>
                      {chat.lastMessageTime ? formatTime(chat.lastMessageTime.toISOString()) : ''}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: chat.unreadCount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: chat.unreadCount > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastSenderIsMe && <span style={{ fontWeight: 600, opacity: 0.7 }}>Vous : </span>}
                    {chat.lastMessageText}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: 'var(--foreground)', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
