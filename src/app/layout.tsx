import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PushManager } from "@/components/notifications/PushManager";
import { RouteTransition } from "@/components/route-transition";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PadelConnect",
  description: "L'application ultime de Padel pour organiser, jouer et connecter.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PadelConnect",
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user ?? null;
  return (
    <html lang="fr" className={cn("font-sans antialiased dark", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: '#000', color: '#fff', margin: 0, overflow: 'hidden', height: '100vh' }}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
             <TopHeader userId={user?.id} />
             <main className="flex-1 overflow-y-auto overflow-x-hidden">
               <RouteTransition>{children}</RouteTransition>
             </main>
          </div>
          <BottomNav userId={user?.id} />
        </div>
        <PushManager />
      </body>
    </html>
  );
}
