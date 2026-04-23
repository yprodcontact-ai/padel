import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Notifications | Padel' }

type AppNotification = { id: string; lu: boolean; type: string; payload: { message?: string; party_id?: string }; created_at: string }

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) redirect('/login')

  await supabase.from('notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false)
  const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#E8703A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          Notifications
        </h1>
        <Link href="/notifications/settings" style={{ textDecoration: 'none' }}>
          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 100, border: '1px solid #3A3A3C', background: '#1C1C1E', color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Gérer
          </button>
        </Link>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: 80, opacity: 0.5 }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={1.5} style={{ marginBottom: 16 }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          <p style={{ color: '#8E8E93', margin: 0 }}>Vous n&apos;avez aucune notification.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((notif: AppNotification) => {
            const notifHref = notif.payload?.party_id ? `/parties/${notif.payload.party_id}` : '#'
            const notifTitle = notif.type === 'party_complete' ? 'Partie complète ! 💪'
              : notif.type === 'party_confirmed' ? 'Partie confirmée ✅'
              : notif.type === 'party_cancelled' ? 'Partie annulée ❌'
              : notif.type === 'join_request' ? 'Demande de participation 🙋'
              : notif.type === 'join_accepted' ? 'Demande acceptée ! 🎉'
              : notif.type === 'join_rejected' ? 'Demande refusée'
              : 'Nouvelle notification'
            return (
            <Link key={notif.id} href={notifHref} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#1C1C1E', padding: '14px 16px', borderRadius: 20, display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', overflow: 'hidden', border: !notif.lu ? '1px solid rgba(232,112,58,0.3)' : '1px solid transparent' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#E8703A" strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: !notif.lu ? 700 : 600, color: !notif.lu ? '#E8703A' : '#fff' }}>
                    {notifTitle}
                  </h3>
                  <p style={{ margin: '0 0 6px', fontSize: 13, color: '#8E8E93' }}>{notif.payload?.message || ''}</p>
                  <span style={{ fontSize: 10, color: '#8E8E93', opacity: 0.6, fontWeight: 500 }}>
                    {new Date(notif.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {notifHref !== '#' && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                )}
              </div>
            </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
