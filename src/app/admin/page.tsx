import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if the user is an admin
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    redirect("/");
  }

  // Fetch all stats using our optimized SECURE RPC
  const { data: stats, error: statsError } = await supabase.rpc("get_admin_dashboard_stats");

  if (statsError) {
    console.error("Error fetching admin stats:", statsError);
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: 'var(--font-family-sans)' }}>
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 32, border: '1px solid var(--card-border)', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)' }}>Erreur de chargement</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
            Impossible de charger les statistiques d&apos;administration. Veuillez vérifier que la migration de base de données a été exécutée.
          </p>
          <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', border: '1px solid var(--card-border)', fontFamily: 'monospace', fontSize: 12, color: 'var(--ink-2)', textAlign: 'left', overflowX: 'auto', marginBottom: 20 }}>
            {statsError.message}
          </div>
          <a href="/profile" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Retour au profil
          </a>
        </div>
      </div>
    );
  }

  type AdminClub = {
    id: string;
    nom: string;
    ville: string;
    banner_image_url: string | null;
    banner_destination_url: string | null;
  };

  // Fetch all clubs for banner management (with migration protection)
  let clubs: AdminClub[] = [];
  let migrationRequired = false;

  const { data: clubsData, error: clubsError } = await supabase
    .from("clubs")
    .select("id, nom, ville, banner_image_url, banner_destination_url")
    .order("nom");

  if (clubsError) {
    console.error("Error fetching clubs with banner fields:", clubsError);
    // Try to fetch without banner fields to confirm migration is the issue
    const { data: fallbackClubs, error: fallbackError } = await supabase
      .from("clubs")
      .select("id, nom, ville")
      .order("nom");

    if (!fallbackError && fallbackClubs) {
      clubs = fallbackClubs.map((c) => ({
        ...c,
        banner_image_url: null,
        banner_destination_url: null,
      }));
      migrationRequired = true;
    }
  } else if (clubsData) {
    clubs = clubsData;
  }

  return <DashboardClient initialStats={stats} clubs={clubs} migrationRequired={migrationRequired} />;
}
