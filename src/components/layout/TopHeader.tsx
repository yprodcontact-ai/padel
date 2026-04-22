'use client'

import { useState, useEffect } from 'react'
import { BellIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TopHeader({ userId }: { userId?: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
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

    // Immediately reset badge when visiting notifications page (server marks them as read)
    useEffect(() => {
        if (pathname === '/notifications') {
            setUnreadCount(0)
        }
    }, [pathname])

    // Fetch user photo
    useEffect(() => {
        if (!userId) return
        supabase.from('users').select('photo_url').eq('id', userId).single().then(({ data }) => {
            if (data?.photo_url) setPhotoUrl(data.photo_url)
        })
    }, [userId, supabase])

    /* ─── Hide on auth/onboarding pages ─── */
    const hiddenPaths = ['/login', '/register', '/forgot-password', '/onboarding']
    if (hiddenPaths.includes(pathname)) return null

    /* ─── Page title mapping ─── */
    const getPageTitle = () => {
        if (pathname === '/') return 'Accueil'
        if (pathname === '/parties') return 'Parties'
        if (pathname.startsWith('/parties/create')) return 'Créer'
        if (pathname.startsWith('/parties/')) return 'Détail'
        if (pathname === '/messages') return 'Messages'
        if (pathname.startsWith('/messages/')) return 'Discussion'
        if (pathname === '/profile') return 'Profil'
        if (pathname.startsWith('/profile/')) return 'Profil'
        if (pathname === '/clubs') return 'Clubs'
        if (pathname.startsWith('/clubs/')) return 'Club'
        if (pathname === '/notifications') return 'Notifications'
        if (pathname.startsWith('/players/')) return 'Joueur'
        return 'PadelConnect'
    }

    /* ─── Premium clay texture header — all app pages ─── */
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
                    top: 55,
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
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={photoUrl}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#8E8E93' }}>P</div>
                        )}
                    </div>
                </Link>

                {/* Title */}
                <span
                    style={{
                        color: '#fff',
                        fontSize: 19,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    {getPageTitle()}
                </span>

                {/* Bell */}
                <Link
                    href="/notifications"
                    className="active:scale-95 transition-transform"
                    style={{
                        position: 'relative',
                        width: 50,
                        height: 50,
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
