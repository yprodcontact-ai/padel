import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PushManager } from "@/components/notifications/PushManager";
import { RouteTransition } from "@/components/route-transition";
import { SplashScreen } from "@/components/layout/SplashScreen";
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
               <RouteTransition>{children}</RouteTransition>
             </main>
          </div>
          <BottomNav userId={user?.id} />
        </div>
        <SplashScreen />
        <PushManager />
      </body>
    </html>
  );
}
