import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Mon Profil' }

function getAge(dateString: string | null) {
  if (!dateString) return null
  const today = new Date(); const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const { data: userProfile, error } = await supabase.from('users').select(`*, clubs:club_id ( nom, ville )`).eq('id', authData.user.id).single()
  if (error || !userProfile) redirect('/onboarding')
  const age = getAge(userProfile.date_naissance)
  const initials = `${userProfile.prenom?.[0] || ''}${userProfile.nom?.[0] || ''}`.toUpperCase()

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Profil</h1>
          <Link href="/profile/edit" style={{ textDecoration: 'none' }}>
            <button type="button" style={{ height: 36, padding: '0 18px', borderRadius: 100, border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Modifier</button>
          </Link>
        </div>

        {/* Profile Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Gradient decoration */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to bottom, rgba(232,112,58,0.15), transparent)' }} />

          {/* Avatar */}
          {userProfile.photo_url ? (
            <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--card)', position: 'relative', zIndex: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userProfile.photo_url} alt={userProfile.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: 'var(--muted)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'var(--muted-foreground)', border: '3px solid var(--card)', position: 'relative', zIndex: 1 }}>
              {initials}
            </div>
          )}

          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--foreground)', position: 'relative', zIndex: 1 }}>
            {userProfile.prenom} {userProfile.nom}
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {userProfile.ville || 'Ville non renseignée'}
          </p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Niveau', value: userProfile.niveau || '-' },
              { label: 'Fiabilité', value: `${userProfile.fiabilite_score || '10'}/10` },
              { label: 'Âge', value: age ? `${age} ans` : '-' },
            ].map((stat) => (
              <div key={stat.label} style={{ backgroundColor: 'var(--muted)', borderRadius: 16, padding: '14px 8px' }}>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f2c991' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {[
              { icon: '🏆', label: 'Club principal', value: userProfile.clubs?.nom ? `${userProfile.clubs.nom} (${userProfile.clubs.ville})` : 'Aucun club' },
              { icon: '🎾', label: 'Préférences', value: `Main: ${userProfile.main || '?'} • Poste: ${userProfile.poste || '?'}` },
              { icon: '#', label: 'Licence FFT', value: userProfile.licence_fft || 'Non renseigné' },
              { icon: '⭐', label: 'Classement FFT', value: userProfile.classement_fft || 'Non renseigné' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{item.label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
