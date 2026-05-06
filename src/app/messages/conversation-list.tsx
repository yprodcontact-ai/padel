'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatTime } from '@/lib/date-utils'
import { setArchivedConversation } from './actions'

export type ChatItem = {
  id: string
  title: string
  type: string
  chatAvatar: string | null
  partyId: string
  lastMessageText: string
  lastMessageTime: string | null
  lastSenderIsMe: boolean
  unreadCount: number
  archived: boolean
}

export function ConversationList({ chats }: { chats: ChatItem[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const visible = chats.filter(c => (tab === 'active' ? !c.archived : c.archived))
  const archivedCount = chats.filter(c => c.archived).length

  const toggleArchive = (id: string, archived: boolean) => {
    setPendingId(id)
    startTransition(async () => {
      await setArchivedConversation(id, archived)
      router.refresh()
      setPendingId(null)
    })
  }

  return (
    <>
      {/* ── Tabs Actives / Archivées ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <TabButton active={tab === 'active'} onClick={() => setTab('active')}>Actives</TabButton>
        <TabButton active={tab === 'archived'} onClick={() => setTab('archived')}>
          Archivées{archivedCount > 0 ? ` (${archivedCount})` : ''}
        </TabButton>
      </div>

      {visible.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 80, opacity: 0.45 }}>
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.4} style={{ marginBottom: 14 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <p style={{ color: 'var(--muted)', margin: '0 0 8px', fontSize: 15 }}>
            {tab === 'active' ? 'Aucune conversation active.' : 'Aucune conversation archivée.'}
          </p>
          {tab === 'active' && (
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Rejoignez des parties pour discuter !</p>
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          {visible.map((chat, idx) => (
            <div
              key={chat.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/messages/${chat.id}`)}
              onKeyDown={e => { if (e.key === 'Enter') router.push(`/messages/${chat.id}`) }}
              className="animate-in-stagger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderTop: idx === 0 ? 'none' : '1px solid var(--divider)',
                animationDelay: `${idx * 0.04}s`,
                cursor: 'pointer',
                opacity: pendingId === chat.id ? 0.5 : 1,
              }}
            >
              {/* Avatar */}
              <div style={{ flexShrink: 0 }}>
                {chat.type === 'prive' && chat.chatAvatar ? (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={chat.chatAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : chat.type === 'groupe' ? (
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
                    {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
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

              {/* Bouton archiver / désarchiver */}
              <button
                type="button"
                aria-label={chat.archived ? 'Désarchiver' : 'Archiver'}
                onClick={e => { e.stopPropagation(); toggleArchive(chat.id, !chat.archived) }}
                disabled={pendingId === chat.id}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid var(--card-border)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                {chat.archived ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 12 16 21 7" /><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /></svg>
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1" /><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8" /><line x1="10" y1="13" x2="14" y2="13" /></svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        border: '1px solid var(--card-border)',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--card)' : 'var(--ink)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}
