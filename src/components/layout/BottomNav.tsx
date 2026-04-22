"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Parties", href: "/games", icon: Trophy },
  { name: "Créer", href: "/create", icon: PlusCircle, isMain: true },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profil", href: "/profile", icon: User },
];

export function BottomNav({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const fetchUnread = async () => {
      // Get all conversations the user is in
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (!participations || participations.length === 0) {
        setUnreadMessages(0);
        return;
      }

      const convIds = participations.map(p => p.conversation_id);

      // Count unread messages across all conversations
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', userId)
        .eq('lu', false);

      setUnreadMessages(count || 0);
    };

    fetchUnread();

    // Listen for new messages
    const channel = supabase.channel('messages_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id !== userId) {
          setUnreadMessages(prev => prev + 1);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        // When messages are marked as read
        if (payload.new.lu && !payload.old.lu && payload.new.sender_id !== userId) {
          setUnreadMessages(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase]);

  // Reset badge when navigating to messages page
  useEffect(() => {
    if (pathname === '/messages' || pathname.startsWith('/messages/')) {
      // Refetch after a small delay to account for markAsRead
      const timeout = setTimeout(async () => {
        if (!userId) return;
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId);

        if (!participations || participations.length === 0) {
          setUnreadMessages(0);
          return;
        }

        const convIds = participations.map(p => p.conversation_id);
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .neq('sender_id', userId)
          .eq('lu', false);

        setUnreadMessages(count || 0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pathname, userId, supabase]);

  return (
    <nav
      className="pb-safe md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#000',
        borderTop: '1px solid #1C1C1E',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.isMain) {
          return (
            <Link key={item.name} href={item.href} style={{ position: 'relative', top: -20 }}>
              <div
                className="active:scale-95 transition-transform"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#E8703A',
                  boxShadow: '0 4px 20px rgba(232, 112, 58, 0.25)',
                }}
              >
                <item.icon style={{ width: 24, height: 24, color: '#000' }} />
              </div>
            </Link>
          );
        }

        const isMessages = item.href === '/messages';

        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              width: 48,
              color: isActive ? '#E8703A' : '#71717A',
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <item.icon
                className={cn("transition-transform", isActive && "scale-110")}
                style={{ width: 24, height: 24 }}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isMessages && unreadMessages > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#EF4444',
                    border: '2px solid #000',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    pointerEvents: 'none',
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
