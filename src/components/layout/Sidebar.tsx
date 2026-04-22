"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Parties", href: "/games", icon: Trophy },
  { name: "Créer", href: "/create", icon: PlusCircle },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profil", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r bg-zinc-950 px-4 py-8 sticky top-0 left-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-full bg-[#E8703A] flex items-center justify-center">
          <Trophy className="w-4 h-4 text-zinc-950" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">PadelConnect</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#E8703A]" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div>
            <p className="text-sm font-medium text-white">Mon Profil</p>
            <p className="text-xs text-zinc-400">Joueur Actif</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
