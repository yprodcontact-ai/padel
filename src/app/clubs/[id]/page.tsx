import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { setMainClub } from '../actions'
import { BackButton } from '@/components/back-button'

export const metadata = { title: 'Détail du Club' }

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const [clubResponse, userResponse] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', params.id).single(),
    supabase.from('users').select('club_id').eq('id', authData.user.id).single(),
  ])
  if (clubResponse.error || !clubResponse.data) notFound()
  const club = clubResponse.data
  const isMainClub = userResponse.data?.club_id === club.id
  const setMainClubWithId = setMainClub.bind(null, club.id)

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', fontFamily: 'var(--font-sans)', paddingBottom: 130 }}>
      {/* Header Image */}
      <div style={{ position: 'relative', height: 200, backgroundColor: 'var(--card)', width: '100%' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <BackButton variant="circle" />
        </div>
        {club.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.photo_url} alt={club.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke='var(--muted)' strokeWidth={1}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px', marginTop: -32, position: 'relative', zIndex: 10, maxWidth: 480, margin: '-32px auto 0' }}>
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '26px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {club.nom}
              {club.verified && <svg width={20} height={20} viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" strokeWidth={0}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </h1>
            <div style={{ background: '#f2c991', borderRadius: 14, padding: '10px 14px', textAlign: 'center', minWidth: 52 }}>
              <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>{club.nb_pistes}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>Pistes</span>
            </div>
          </div>

          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
            {club.description || 'Aucune description disponible pour ce club.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid #2C2C2E', paddingTop: 16 }}>
            {club.adresse && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span style={{ fontSize: 14, color: 'var(--foreground)' }}>{club.adresse}, {club.ville}</span>
              </div>
            )}
            {club.telephone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72" /></svg>
                <a href={`tel:${club.telephone.replace(/\s+/g, '')}`} style={{ fontSize: 14, color: '#f2c991', textDecoration: 'none' }}>{club.telephone}</a>
              </div>
            )}
            {club.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <a href={`mailto:${club.email}`} style={{ fontSize: 14, color: '#f2c991', textDecoration: 'none' }}>{club.email}</a>
              </div>
            )}
          </div>

          <div style={{ marginTop: 28 }}>
            {isMainClub ? (
              <div style={{ width: '100%', height: 50, borderRadius: 100, background: 'rgba(34,197,94,0.15)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                ✓ C&apos;est votre club principal
              </div>
            ) : (
              <form action={setMainClubWithId}>
                <button type="submit" style={{ width: '100%', height: 50, borderRadius: 100, border: '1px solid #cf9619', background: '#f2c991', color: 'var(--foreground)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  Définir comme mon club principal
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
