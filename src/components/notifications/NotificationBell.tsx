'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function NotificationBell({ userId }: { userId?: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('lu', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Listen to real-time updates on notifications table for the current user
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return (
    <Link
      href="/notifications"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink)',
        textDecoration: 'none',
        position: 'relative'
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      
      {/* Orange dot for unread notifications */}
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: '#FF9500',
            border: '1.5px solid var(--card)',
            display: 'block'
          }}
        />
      )}
    </Link>
  )
}
