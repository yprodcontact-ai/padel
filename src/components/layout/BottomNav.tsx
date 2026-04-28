"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LEFT_ITEMS = [
  { name: "Accueil", href: "/", icon: HomeCustomIcon },
  { name: "Parties", href: "/parties", icon: Trophy },
];

const RIGHT_ITEMS = [
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

  const hiddenPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/onboarding",
  ];
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
        padding: "0 16px 20px",
        background: "linear-gradient(to top, white 55%, transparent)",
        pointerEvents: "none",
      }}
    >
      <nav
        aria-label="Navigation principale"
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(10px) saturate(180%)",
          WebkitBackdropFilter: "blur(10px) saturate(180%)",
          borderRadius: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 8px",
          }}
        >
          {/* Left tabs */}
          <div
            style={{ display: "flex", flex: 1, justifyContent: "center", gap: 8 }}
          >
            {LEFT_ITEMS.map((item, i) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
                offset={i === 0 ? -3 : 4}
              />
            ))}
          </div>

          {/* FAB spacer */}
          <div style={{ width: 80, flexShrink: 0 }} aria-hidden="true" />

          {/* Right tabs */}
          <div
            style={{ display: "flex", flex: 1, justifyContent: "center", gap: 8 }}
          >
            {RIGHT_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/messages" &&
                  pathname.startsWith("/messages"));
              const isMessages = item.href === "/messages";
              return (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  unreadBadge={isMessages ? unreadMessages : 0}
                  offset={item.name === "Profil" ? 3 : item.name === "Messages" ? -4 : 0}
                />
              );
            })}
          </div>
        </div>

        {/* Floating Action Button */}
        <Link
          href="/parties/create"
          aria-label="Créer une partie"
          className="bottom-nav-fab"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: -22,
            width: 86,
            height: 86,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fcd34d, #f59e0b, #d97706)",
            border: "4px solid white",
            boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.40)",
              pointerEvents: "none",
            }}
          />
          <Plus
            className="bottom-nav-fab-icon"
            style={{
              width: 32,
              height: 32,
              color: "white",
              transition: "transform 0.3s ease",
            }}
            strokeWidth={2.5}
          />
        </Link>
      </nav>

      <style>{`
        .bottom-nav-fab:hover {
          transform: translateX(-50%) translateY(-2px) !important;
          box-shadow: 0 12px 32px rgba(245,158,11,0.45) !important;
        }
        .bottom-nav-fab:active {
          transform: translateX(-50%) scale(0.90) !important;
        }
        .bottom-nav-fab:hover .bottom-nav-fab-icon {
          transform: rotate(90deg);
        }
      `}</style>
    </div>
  );
}

function NavItem({
  item,
  isActive,
  unreadBadge = 0,
  offset = 0,
}: {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  unreadBadge?: number;
  offset?: number;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} style={{ textDecoration: "none", marginLeft: offset }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: "8px 6px",
        }}
      >
        {/* Icon */}
        <div style={{ position: "relative" }}>
          <Icon
            className={cn(
              "transition-all duration-300",
              isActive && "scale-110"
            )}
            style={{
              width: 26,
              height: 26,
              color: isActive ? "#f59e0b" : "#a8a29e",
            }}
            strokeWidth={isActive ? 2.25 : 1.75}
          />

          {/* Unread badge */}
          {unreadBadge > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                minWidth: 16,
                height: 16,
                borderRadius: "50%",
                background: "#FF3B30",
                border: "2px solid white",
                color: "#fff",
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

        {/* Label */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: isActive ? "#d97706" : "#a8a29e",
            opacity: isActive ? 1 : 0.8,
            transition: "all 0.3s ease",
          }}
        >
          {item.name}
        </span>

        {/* Active dot */}
        <span
          style={{
            position: "absolute",
            bottom: -2,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#f59e0b",
            opacity: isActive ? 1 : 0,
            transform: isActive ? "scale(1)" : "scale(0)",
            transition: "all 0.3s ease",
          }}
        />
      </div>
    </Link>
  );
}

function HomeCustomIcon({
  className,
  style,
  strokeWidth,
}: {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Roof */}
      <polyline points="3,11 12,2.5 21,11" />
      {/* Left wall + bottom-left rounded corner + left floor segment */}
      <path d="M4.5 10.5 L4.5 20 Q4.5 21.5 6 21.5 L9.5 21.5" />
      {/* Arched door (semicircle opening) */}
      <path d="M9.5 21.5 A2.5,2.5 0 0,1 14.5,21.5" />
      {/* Right floor segment + bottom-right rounded corner + right wall */}
      <path d="M14.5 21.5 L18 21.5 Q19.5 21.5 19.5 20 L19.5 10.5" />
    </svg>
  );
}
