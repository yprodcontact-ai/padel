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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 md:hidden pb-safe">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.isMain) {
          return (
            <Link key={item.name} href={item.href} className="relative -top-5">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E8703A] shadow-lg shadow-[#E8703A]/20 active:scale-95 transition-transform">
                <item.icon className="w-6 h-6 text-zinc-950" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-12",
              isActive ? "text-[#E8703A]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
