'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markConversationAsRead } from '../actions'
import { formatTime } from '@/lib/date-utils'

export type Message = { id: string; contenu: string; created_at: string; sender_id: string; senderData?: { prenom: string, photo_url: string } | null }

export function ChatInterface({ conversationId, initialMessages, currentUserId }: { conversationId: string, initialMessages: Message[], currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
    useEffect(() => { scrollToBottom() }, [messages])
    useEffect(() => { markConversationAsRead(conversationId) }, [conversationId])

    useEffect(() => {
        const channel = supabase.channel(`room:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async (payload) => {
                const newMsg = payload.new as Message
                const { data: userObj } = await supabase.from('users').select('prenom, photo_url').eq('id', newMsg.sender_id).single()
                setMessages(prev => { if (prev.find(m => m.id === newMsg.id)) return prev; return [...prev, { ...newMsg, senderData: userObj }] })
                if (newMsg.sender_id !== currentUserId) markConversationAsRead(conversationId)
            }).subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [conversationId, supabase, currentUserId])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); if (!newMessage.trim() || isSending) return
        setIsSending(true); const msg = newMessage; setNewMessage('')
        await sendMessage(conversationId, msg); setIsSending(false)
    }

    return (
        <>
        <div style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: '16px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 0,
        }}>
            {messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 14, padding: '40px 0' }}>Soyez le premier à discuter !</p>
            ) : (
                messages.map((m, i) => {
                    const isMe = m.sender_id === currentUserId
                    const time = formatTime(m.created_at)
                    return (
                        <div key={m.id || i} style={{ display: 'flex', width: '100%', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                {!isMe && <span style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 4, marginLeft: 4, fontWeight: 600 }}>{m.senderData?.prenom || 'Joueur'}</span>}
                                <div style={{
                                    padding: '10px 16px',
                                    borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    fontSize: 14,
                                    background: isMe ? 'var(--ink)' : 'var(--card)',
                                    color: isMe ? '#fff' : 'var(--foreground)',
                                    lineHeight: 1.4,
                                }}>
                                    {m.contenu}
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4, padding: '0 4px', opacity: 0.7 }}>{time}</span>
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="pb-safe" style={{ flexShrink: 0, backgroundColor: 'var(--card)', borderTop: '1px solid #2C2C2E', padding: '12px 16px', paddingBottom: 120 }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    style={{ flex: 1, height: 44, borderRadius: 100, border: 'none', backgroundColor: '#F4F4F5', color: 'var(--foreground)', fontSize: 14, padding: '0 20px', outline: 'none', fontFamily: 'var(--font-sans)' }}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--ink)', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: (!newMessage.trim() || isSending) ? 0.4 : 1 }}
                >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
            </form>
        </div>
        </>
    )
}
