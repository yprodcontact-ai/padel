'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SendIcon } from 'lucide-react'

export type Message = {
    id: string;
    contenu: string;
    created_at: string;
    sender_id: string;
    senderData?: { prenom: string, photo_url: string } | null;
}

export function ChatInterface({ 
    conversationId, 
    initialMessages, 
    currentUserId 
}: { 
    conversationId: string, 
    initialMessages: Message[], 
    currentUserId: string 
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Auto-scroll au chargement et à la réception
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Subscription Realtime
    useEffect(() => {
        const channel = supabase.channel(`room:${conversationId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, async (payload) => {
                const newMsg = payload.new as Message
                
                // Fetch de l'expéditeur minimal (la souscription native ne donne pas de relation ORM)
                const { data: userObj } = await supabase.from('users').select('prenom, photo_url').eq('id', newMsg.sender_id).single()
                
                setMessages(prev => {
                    // Eviter les duplicatas (si on reçoit notre propre message inséré coté client si on met en place de l'optimiste plus tard)
                    if (prev.find(m => m.id === newMsg.id)) return prev
                    return [...prev, { ...newMsg, senderData: userObj }]
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return
        
        setIsSending(true)
        const msgToSend = newMessage
        setNewMessage('')
        
        // On attend que la DB traite pour éviter de casser la séquence. Le Realtime s'assure de l'afficher.
        await sendMessage(conversationId, msgToSend)
        setIsSending(false)
    }

    return (
        <>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scroll-smooth">
            {messages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-10">Soyez le premier à discuter !</p>
            ) : (
                messages.map((m, i) => {
                    const isMe = m.sender_id === currentUserId
                    const time = new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    
                    return (
                        <div key={m.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                   <span className="text-[10px] text-muted-foreground mb-1 ml-1 font-semibold">
                                      {m.senderData?.prenom || 'Nouveau Joueur'}
                                   </span>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-[4px]' : 'bg-background border border-muted rounded-bl-[4px]'}`}>
                                    {m.contenu}
                                </div>
                                <span className="text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground mt-1 px-1 transition-opacity opacity-70">
                                    {time}
                                </span>
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* INPUT FIXED BOTTOM */}
        <div className="absolute bottom-0 w-full bg-background border-t p-3 pb-6">
            <form onSubmit={handleSend} className="flex gap-2 items-end">
                <Input 
                   value={newMessage}
                   onChange={e => setNewMessage(e.target.value)}
                   placeholder="Écrivez votre message..." 
                   className="rounded-full bg-muted/50 border-none shadow-inner h-11"
                />
                <Button 
                   type="submit" 
                   size="icon" 
                   className="rounded-full shrink-0 h-11 w-11 shadow-md hover:scale-105 transition-transform" 
                   disabled={!newMessage.trim() || isSending}
                >
                   <SendIcon className="w-5 h-5 -ml-0.5" />
                </Button>
            </form>
        </div>
        </>
    )
}
