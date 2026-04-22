"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Parties", href: "/games", icon: Trophy },
  { name: "Créer", href: "/create", icon: PlusCircle, isMain: true },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profil", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

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
            }}
          >
            <item.icon
              className={cn("transition-transform", isActive && "scale-110")}
              style={{ width: 24, height: 24 }}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
