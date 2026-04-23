"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Parties", href: "/parties", icon: Trophy },
  { name: "Créer", href: "/parties/create", icon: PlusCircle },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profil", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex"
      style={{
        flexDirection: 'column',
        width: 256,
        height: '100vh',
        borderRight: '1px solid #1C1C1E',
        background: '#000',
        padding: '32px 16px',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, padding: '0 8px' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#f2c991',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trophy style={{ width: 16, height: 16, color: '#000' }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', fontFamily: 'var(--font-sans)' }}>
          PadelConnect
        </h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 12px',
                borderRadius: 12,
                transition: 'all 0.2s',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                background: isActive ? '#1C1C1E' : 'transparent',
                color: isActive ? '#fff' : '#71717A',
              }}
            >
              <item.icon style={{ width: 20, height: 20, color: isActive ? '#f2c991' : undefined }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px 8px', borderTop: '1px solid #1C1C1E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1C1C1E' }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>Mon Profil</p>
            <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Joueur Actif</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
