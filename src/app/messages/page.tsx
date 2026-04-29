import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, formatTime } from '@/lib/date-utils'
import { RefreshOnMount } from '@/components/RefreshOnMount'

export const metadata = { title: 'Messages — WizzPadel' }

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
    if (conv.type === 'groupe') {
      if (conv.parties?.date_heure) { chatTitle = `Match : ${formatDateShort(conv.parties.date_heure)} - ${formatTime(conv.parties.date_heure)}` } else { chatTitle = 'Match' }
    } else if (conv.type === 'prive') {
      const otherUser = conv.conversation_participants?.find(cp => cp.user_id !== user.id)?.users
      chatTitle = otherUser?.prenom || 'Utilisateur'; chatAvatar = otherUser?.photo_url || null
    }
    const msgs = conv.messages || []; msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); const lastMessage = msgs[0]
    const unreadCount = msgs.filter(m => !m.lu && m.sender_id !== user.id).length
    return { id: p.conversation_id, title: chatTitle, type: conv.type, chatAvatar, partyId: conv.party_id, lastMessageText: lastMessage?.contenu || 'Aucun message', lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : null, lastSenderIsMe: lastMessage?.sender_id === user.id, unreadCount }
  }).filter(Boolean) as ChatItem[]
  chatList.sort((a, b) => { if (!a.lastMessageTime) return 1; if (!b.lastMessageTime) return -1; return b.lastMessageTime.getTime() - a.lastMessageTime.getTime() })

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '0 16px 130px' }}>
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

      {/* ── Liste ── */}
      {chatList.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 80, opacity: 0.45 }}>
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.4} style={{ marginBottom: 14 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <p style={{ color: 'var(--muted)', margin: '0 0 8px', fontSize: 15 }}>Aucune conversation active.</p>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Rejoignez des parties pour discuter !</p>
        </div>
      ) : (
        /* Card padding 0 contenant les rows */
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          {chatList.map((chat, idx) => (
            <Link key={chat.id} href={`/messages/${chat.id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="animate-in-stagger" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)', animationDelay: `${idx * 0.04}s` }}>

                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  {chat.type === 'prive' && chat.chatAvatar ? (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={chat.chatAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : chat.type === 'groupe' ? (
                    /* Double avatar overlap pour les groupes */
                    <div style={{ position: 'relative', width: 48, height: 36 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.62 0.14 200), oklch(0.42 0.13 230))', border: '2px solid var(--card)' }} />
                      <div style={{ position: 'absolute', left: 14, top: 4, width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.62 0.14 280), oklch(0.42 0.13 310))', border: '2px solid var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                  )}
                </div>

                {/* Texte */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: chat.unreadCount > 0 ? 600 : 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 10 }}>
                      {chat.title}
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>
                      {chat.lastMessageTime ? formatTime(chat.lastMessageTime.toISOString()) : ''}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: chat.unreadCount > 0 ? 'var(--ink-2)' : 'var(--muted)', fontWeight: chat.unreadCount > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastSenderIsMe && <span style={{ fontWeight: 500, opacity: 0.6 }}>Vous : </span>}
                    {chat.lastMessageText}
                  </p>
                </div>

                {/* Badge non-lus */}
                {chat.unreadCount > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FF9500', color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
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
