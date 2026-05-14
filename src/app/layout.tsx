import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PushManager } from "@/components/notifications/PushManager";
import { RouteTransition } from "@/components/route-transition";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "WizzPadel",
  description: "L'application ultime de Padel pour organiser, jouer et connecter.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WizzPadel",
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F2F2",
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
    <html lang="fr" className="antialiased" style={{ backgroundColor: '#F2F2F2' }}>
      <body
        style={{ margin: 0, overflow: 'hidden', height: '100vh', backgroundColor: '#F2F2F2' }}
      >
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F2F2F2' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
             <TopHeader />
             <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
               <PullToRefresh>
                 <RouteTransition>{children}</RouteTransition>
               </PullToRefresh>
             </main>
          </div>
          <BottomNav userId={user?.id} />
        </div>
        <SplashScreen />
        <PushManager />
        <div id="portrait-lock" style={{ display: 'none' }}>
           <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
             <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)' }}>
               <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
               <line x1="12" y1="18" x2="12.01" y2="18" />
             </svg>
             <div>
               <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>Mode Portrait Requis</h2>
               <p style={{ margin: 0, fontSize: 16, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Veuillez pivoter votre téléphone pour utiliser l&apos;application.</p>
             </div>
           </div>
        </div>
      </body>
    </html>
  );
}
