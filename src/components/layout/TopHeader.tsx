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
                    flexShrink: 0,
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
        <header
            className="pt-safe"
            style={{
                position: 'relative',
                zIndex: 40,
                width: '100%',
                background: '#000',
                borderBottom: '1px solid #1C1C1E',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    height: 56,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                }}
            >
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: '#E8703A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontWeight: 900, color: '#000', fontSize: 14, fontFamily: 'var(--font-sans)' }}>P</span>
                    </div>
                </Link>

                {userId && (
                    <Link
                        href="/notifications"
                        className="active:scale-95 transition-transform"
                        style={{
                            position: 'relative',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#1C1C1E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <BellIcon style={{ width: 20, height: 20, color: '#fff' }} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -1, right: -1,
                                    width: 16, height: 16,
                                    borderRadius: '50%',
                                    background: '#EF4444',
                                    border: '2px solid #000',
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
                )}
            </div>
        </header>
    )
}
