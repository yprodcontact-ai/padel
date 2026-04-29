import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'

export const metadata = { title: 'Mon Profil — WizzPadel' }

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
  const niveau = userProfile.niveau ?? 0
  const starsTotal = 8

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '0 16px 20px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '64px 0 24px' }}>
          <Link href="/notifications" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', textDecoration: 'none' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
          </Link>
          <Link href="/profile/edit" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}>Modifier</Link>
        </div>

        {/* ── Identité centrée ── */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          {userProfile.photo_url ? (
            <div style={{ width: 104, height: 104, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', boxShadow: '0 0 0 3px #fff, 0 0 0 4px var(--card-border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userProfile.photo_url} alt={userProfile.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 104, height: 104, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 auto 14px', boxShadow: '0 0 0 3px #fff, 0 0 0 4px var(--card-border)' }}>
              {initials}
            </div>
          )}
          <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.8px' }}>
            {userProfile.prenom} {userProfile.nom}
          </h1>
          <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted)' }}>
            {userProfile.ville || 'Ville non renseignée'}
          </p>
        </div>

        {/* ── 2 cards côte à côte : Niveau + Position ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Card Niveau */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '18px 16px', border: '1px solid var(--card-border)' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Niveau</p>
            <p style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1 }}>
              {niveau} <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400 }}>/ {starsTotal}</span>
            </p>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: starsTotal }).map((_, i) => (
                <svg key={i} width={13} height={13} viewBox="0 0 24 24" fill={i < niveau ? 'var(--ink)' : 'none'} stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="round">
                  <path d="M12 3l2.6 5.8L21 9.5l-4.5 4.4L17.8 21 12 17.8 6.2 21l1.3-7.1L3 9.5l6.4-.7L12 3z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Card Position */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '18px 16px', border: '1px solid var(--card-border)' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Position</p>
            <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              {userProfile.poste || '—'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Main : {userProfile.main || '—'}</p>
          </div>
        </div>

        {/* ── Card Bio / Infos ── */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', marginBottom: 14, overflow: 'hidden' }}>
          {[
            { label: 'Club principal', value: userProfile.clubs?.nom ? `${userProfile.clubs.nom}${userProfile.clubs.ville ? ` · ${userProfile.clubs.ville}` : ''}` : 'Aucun club' },
            { label: 'Fiabilité', value: `${userProfile.fiabilite_score || 10} / 10` },
            { label: 'Âge', value: age ? `${age} ans` : '—' },
            { label: 'Licence FFT', value: userProfile.licence_fft || 'Non renseigné' },
            { label: 'Classement FFT', value: userProfile.classement_fft || 'Non renseigné' },
          ].map((item, idx) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>{item.label}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'right', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* ── CTA Modifier profil ── */}
        <Link href="/profile/edit" style={{ display: 'block', textDecoration: 'none', marginBottom: 14 }}>
          <div style={{ width: '100%', height: 52, borderRadius: 'var(--radius-card)', backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>
            Modifier mon profil
          </div>
        </Link>

        {/* ── Déconnexion ── */}
        <form action={logout} style={{ width: '100%' }}>
          <button type="submit" style={{ width: '100%', height: 48, borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--muted)', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Déconnexion
          </button>
        </form>

        {/* Spacer explicite pour éviter le bug Safari du padding-bottom ignoré */}
        <div style={{ height: 120, flexShrink: 0 }} />

      </div>
    </div>
  )
}
