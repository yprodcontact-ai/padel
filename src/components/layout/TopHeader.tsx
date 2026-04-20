'use client'

import { useState, useEffect } from 'react'
import { BellIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function TopHeader({ userId }: { userId?: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        // Fetch initial unread count
        const fetchInitial = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('lu', false)
            
            setUnreadCount(count || 0)
        }
        
        fetchInitial()

        // Abonnement Realtime Supabase pour MAJ immédiate du badge
        const channel = supabase.channel(`notifications_header`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                 if (!payload.new.lu) {
                     setUnreadCount(prev => prev + 1)
                 }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                 // Si c'est marqué comme lu
                 if (payload.new.lu) {
                     setUnreadCount(prev => Math.max(0, prev - 1))
                 }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl pt-safe">
             <div className="flex h-14 w-full items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-primary shadow-sm flex items-center justify-center">
                       <span className="font-black text-primary-foreground text-sm">P</span>
                    </div>
                </Link>

                {userId && (
                    <Link href="/notifications" className="relative p-2 rounded-full hover:bg-muted transition-colors active:scale-95">
                        <BellIcon className="w-6 h-6 text-foreground" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 shadow-md border-2 border-background text-white rounded-full flex items-center justify-center text-[9px] font-black pointer-events-none">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                )}
             </div>
        </header>
    )
}
