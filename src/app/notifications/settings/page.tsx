import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateNotificationSettings } from './actions'

export const metadata = { title: 'Paramètres des notifications | Padel' }

export default async function NotificationSettingsPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: userProfile } = await supabase
    .from('users')
    .select('notify_new_parties, notify_messages, notify_party_updates')
    .eq('id', authData.user.id)
    .single()

  if (!userProfile) redirect('/onboarding')

  const {
    notify_new_parties = true,
    notify_messages = true,
    notify_party_updates = true
  } = userProfile

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 130px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Préférences</h1>
          <Link href="/notifications" style={{ textDecoration: 'none' }}>
            <button type="button" style={{ height: 36, padding: '0 18px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Retour</button>
          </Link>
        </div>

        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 24px' }}>
          <form action={updateNotificationSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--foreground)', paddingBottom: 10, borderBottom: '1px solid #2C2C2E' }}>
                Styles de Notifications
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Match Parfait */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" name="notify_new_parties" value="true" defaultChecked={notify_new_parties} style={{ accentColor: 'var(--ink)', width: 22, height: 22, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Match Parfait</span>
                    <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>M&apos;avertir quand un match de mon niveau est créé dans mon club.</span>
                  </div>
                </label>

                {/* Messages */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" name="notify_messages" value="true" defaultChecked={notify_messages} style={{ accentColor: 'var(--ink)', width: 22, height: 22, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Messages</span>
                    <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Me prévenir quand je reçois un nouveau message dans le chat d&apos;une partie.</span>
                  </div>
                </label>

                {/* Activité des parties */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" name="notify_party_updates" value="true" defaultChecked={notify_party_updates} style={{ accentColor: 'var(--ink)', width: 22, height: 22, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Activité de mes parties</span>
                    <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Alertes pour les demandes de participation, les confirmations ou annulations.</span>
                  </div>
                </label>

              </div>
            </div>

            <button type="submit" style={{ width: '100%', height: 50, borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', marginTop: 8 }}>
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
