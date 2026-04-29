"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MessageCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────
   Design handoff v2 — TabBar
   Barre noire pill (radius 999) en bas.
   4 onglets + bouton « + » central creux.
   Indicateur actif = cercle blanc 44px.
   Logique métier (unread badge) inchangée.
───────────────────────────────────────── */

const LEFT_ITEMS = [
  { name: "Accueil",  href: "/",       icon: HomeCustomIcon },
  { name: "Parties",  href: "/parties", icon: Search },
];

const RIGHT_ITEMS = [
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profil",   href: "/profile",  icon: User },
];

export function BottomNav({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const supabase = createClient();

  /* ── Logique métier : badge messages non-lus ── */
  useEffect(() => {
    if (!userId) return;

    const fetchUnread = async () => {
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (!participations || participations.length === 0) {
        setUnreadMessages(0);
        return;
      }

      const convIds = participations.map((p) => p.conversation_id);

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .neq("sender_id", userId)
        .eq("lu", false);

      setUnreadMessages(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel("messages_badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.sender_id !== userId) {
            setUnreadMessages((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          if (
            payload.new.lu &&
            !payload.old.lu &&
            payload.new.sender_id !== userId
          ) {
            setUnreadMessages((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  /* ── Reset badge quand on est sur /messages ── */
  useEffect(() => {
    if (pathname === "/messages" || pathname.startsWith("/messages/")) {
      const timeout = setTimeout(async () => {
        if (!userId) return;
        const { data: participations } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", userId);

        if (!participations || participations.length === 0) {
          setUnreadMessages(0);
          return;
        }

        const convIds = participations.map((p) => p.conversation_id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", convIds)
          .neq("sender_id", userId)
          .eq("lu", false);

        setUnreadMessages(count || 0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pathname, userId, supabase]);

  /* ── Masquer sur les pages auth / onboarding ── */
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/onboarding"];
  if (!userId || hiddenPaths.includes(pathname)) return null;

  return (
    <div
      className="pb-safe md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 14px 26px",
        pointerEvents: "none",
      }}
    >
      {/* ── Barre noire pill ── */}
      <nav
        aria-label="Navigation principale"
        style={{
          position: "relative",
          height: 64,
          borderRadius: 999,
          background: "#000",
          display: "flex",
          alignItems: "center",
          padding: 6,
          pointerEvents: "auto",
        }}
      >
        {/* Onglets gauche */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          {LEFT_ITEMS.map((item) => (
            <NavTab
              key={item.name}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {/* Bouton + central creux */}
        <Link
          href="/parties/create"
          aria-label="Créer une partie"
          className="bottom-nav-plus"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            margin: "0 4px",
            textDecoration: "none",
          }}
        >
          <PlusIcon color="#fff" size={22} />
        </Link>

        {/* Onglets droite */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          {RIGHT_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/messages" && pathname.startsWith("/messages"));
            const isMessages = item.href === "/messages";
            return (
              <NavTab
                key={item.name}
                item={item}
                isActive={isActive}
                unreadBadge={isMessages ? unreadMessages : 0}
              />
            );
          })}
        </div>
      </nav>

      <style>{`
        .bottom-nav-plus:active {
          transform: scale(0.90) !important;
          opacity: 0.8;
        }
        .bottom-nav-plus:hover {
          border-color: rgba(255,255,255,0.6) !important;
        }
      `}</style>
    </div>
  );
}

/* ── NavTab : icône dans un cercle blanc si actif ── */
function NavTab({
  item,
  isActive,
  unreadBadge = 0,
}: {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  unreadBadge?: number;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} style={{ textDecoration: "none", flex: 1, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isActive ? "#fff" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "background 0.2s ease",
        }}
      >
        <Icon
          style={{
            width: 22,
            height: 22,
            color: isActive ? "#000" : "rgba(255,255,255,0.65)",
            strokeWidth: isActive ? 2.2 : 1.75,
            transition: "color 0.2s ease",
          }}
        />

        {/* Badge messages non-lus */}
        {unreadBadge > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: "50%",
              background: "#FF9500",
              border: "none",
              color: "#000",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              pointerEvents: "none",
            }}
          >
            {unreadBadge > 9 ? "9+" : unreadBadge}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Icônes inline ── */

function HomeCustomIcon({
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  const color = (style?.color as string) ?? "#fff";
  const sw = 1.8;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={22}
      height={22}
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
    </svg>
  );
}

function PlusIcon({ color = "#fff", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
