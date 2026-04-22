'use client'

import { useState, useEffect } from 'react'
import { BellIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TopHeader({ userId }: { userId?: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        if (!userId) return

        const fetchInitial = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('lu', false)
            
            setUnreadCount(count || 0)
        }
        
        fetchInitial()

        const channel = supabase.channel(`notifications_header`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
                 if (!payload.new.lu) setUnreadCount(prev => prev + 1)
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
                 if (payload.new.lu) setUnreadCount(prev => Math.max(0, prev - 1))
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [userId, supabase])

    /* ─── Homepage: clay texture header with built-in curve ─── */
    if (pathname === '/') {
        return (
            <header
                style={{
                    position: 'relative',
                    width: '100%',
                    zIndex: 40,
                    background: '#000',
                }}
            >
                {/* The PNG image IS the header — it contains the texture + the curve shape */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/fond-header-app-padel.png"
                    alt=""
                    aria-hidden="true"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                />

                {/* Content overlay — positioned on top of the image */}
                <div
                    style={{
                        position: 'absolute',
                        top: 52,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                        zIndex: 10,
                    }}
                    className="pt-safe"
                >
                    {/* Avatar */}
                    <Link href="/profile" style={{ flexShrink: 0 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid rgba(255,255,255,0.2)',
                            }}
                        >
                            <img
                                src="https://i.pravatar.cc/150?img=11"
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </Link>

                    {/* Title */}
                    <span
                        style={{
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        Accueil
                    </span>

                    {/* Bell */}
                    <Link
                        href="/notifications"
                        className="active:scale-95 transition-transform"
                        style={{
                            position: 'relative',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#1C1C1E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <BellIcon style={{ width: 20, height: 20, color: '#fff' }} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -1, right: -1,
                                    width: 18, height: 18,
                                    borderRadius: '50%',
                                    background: '#EF4444',
                                    border: '2px solid #1C1C1E',
                                    color: '#fff',
                                    fontSize: 9, fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>
        )
    }

    /* ─── Default header for all other pages ─── */
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
