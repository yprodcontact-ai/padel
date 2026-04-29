import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDatetime } from '@/lib/date-utils'
import { RefreshOnMount } from '@/components/RefreshOnMount'

export const metadata = { title: 'Notifications — WizzPadel' }

type AppNotification = {
  id: string
  lu: boolean
  type: string
  payload: { message?: string; party_id?: string }
  created_at: string
}

function notifIcon(type: string) {
  if (type === 'party_cancelled') {
    return (
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--card-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </div>
    )
  }
  if (type === 'join_request' || type === 'party_complete') {
    return (
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
      </div>
    )
  }
  // Défaut : cercle gris avec initiales
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
    </div>
  )
}

function notifTitle(type: string) {
  const map: Record<string, string> = {
    party_complete:   'Partie complète 💪',
    party_confirmed:  'Partie confirmée ✅',
    party_cancelled:  'Partie annulée',
    join_request:     'Demande de participation',
    join_accepted:    'Demande acceptée 🎉',
    join_rejected:    'Demande refusée',
  }
  return map[type] ?? 'Nouvelle notification'
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

/** Groupement des notifs par période */
function groupNotifs(notifs: AppNotification[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
  const groups: { label: string; items: AppNotification[] }[] = [
    { label: "Aujourd'hui", items: [] },
    { label: 'Cette semaine', items: [] },
    { label: 'Plus ancien', items: [] },
  ]
  notifs.forEach(n => {
    const d = new Date(n.created_at)
    if (d >= today) groups[0].items.push(n)
    else if (d >= weekAgo) groups[1].items.push(n)
    else groups[2].items.push(n)
  })
  return groups.filter(g => g.items.length > 0)
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) redirect('/login')

  // Marquer toutes comme lues
  await supabase.from('notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false)
  const { data: notifications } = await supabase
    .from('notifications').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(50)

  const groups = groupNotifs((notifications || []) as AppNotification[])

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '0 16px 130px' }}>
      <RefreshOnMount />

      {/* ── Hero header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '64px 0 24px' }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1.4px', lineHeight: 1.05 }}>Notifications</h1>
        <Link href="/notifications" style={{ fontSize: 15, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>Gérer</Link>
      </div>

      {/* ── Contenu ── */}
      {!notifications || notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: 80, opacity: 0.45 }}>
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.4} style={{ marginBottom: 14 }}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: 15 }}>Aucune notification.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {groups.map(group => (
            <div key={group.label}>
              {/* Label de groupe uppercase */}
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                {group.label}
              </p>

              {/* Card avec padding 0 */}
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                {group.items.map((notif, idx) => {
                  const href = notif.payload?.party_id ? `/parties/${notif.payload.party_id}` : '#'
                  return (
                    <Link key={notif.id} href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)', position: 'relative' }}>
                        {/* Dot non-lu */}
                        {!notif.lu && (
                          <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF9500' }} />
                        )}
                        {/* Icône */}
                        <div style={{ flexShrink: 0 }}>{notifIcon(notif.type)}</div>
                        {/* Texte */}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: !notif.lu ? 600 : 500, color: 'var(--ink)' }}>{notifTitle(notif.type)}</p>
                          <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic', color: 'var(--muted)' }}>{notif.payload?.message || formatDatetime(notif.created_at)}</p>
                        </div>
                        {/* Heure relative */}
                        <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{relativeTime(notif.created_at)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
