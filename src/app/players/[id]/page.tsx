import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { startPrivateChat } from '../actions'
import { BackButton } from '@/components/back-button'

export const metadata = { title: 'Profil Joueur | Padel' }

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) redirect('/login')

  const { data: player, error } = await supabase.from('users').select('*').eq('id', params.id).single()
  if (error || !player) notFound()
  const isMe = user.id === player.id

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ paddingTop: 8 }}>
        <BackButton variant="pill" />
      </div>

      <div style={{ background: '#1C1C1E', borderRadius: 28, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 400, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to bottom, rgba(232,112,58,0.15), transparent)' }} />

        {player.photo_url ? (
          <div style={{ width: 112, height: 112, borderRadius: '50%', overflow: 'hidden', marginBottom: 16, border: '3px solid #fff', position: 'relative', zIndex: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={player.photo_url} alt={player.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 112, height: 112, borderRadius: '50%', background: '#2C2C2E', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: '#8E8E93', border: '3px solid #fff', position: 'relative', zIndex: 1 }}>
            {player.prenom?.charAt(0) || 'J'}
          </div>
        )}

        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#fff', zIndex: 1, position: 'relative' }}>{player.prenom} {player.nom}</h1>
        <p style={{ margin: '0 0 28px', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6, zIndex: 1, position: 'relative' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
          Joueur vérifié
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 28, zIndex: 1, position: 'relative' }}>
          {[
            { label: 'Niveau Padel', value: player.niveau || 'N/A', isAccent: true },
            { label: 'Côté Préféré', value: player.poste || 'Mixte' },
            { label: 'Main Forte', value: player.main || 'Non défini' },
            { label: 'Localisation', value: player.ville || 'Aucune ville' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#2C2C2E', padding: '16px 12px', borderRadius: 18 }}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{stat.label}</span>
              <span style={{ fontSize: stat.isAccent ? 22 : 15, fontWeight: 700, color: stat.isAccent ? '#E8703A' : '#fff', textTransform: 'capitalize' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {!isMe && (
          <form action={async () => { 'use server'; await startPrivateChat(player.id) }} style={{ width: '100%', zIndex: 1, position: 'relative' }}>
            <button type="submit" style={{ width: '100%', height: 52, borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              Envoyer un message privé
            </button>
          </form>
        )}
        {isMe && (
          <div style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1.5px dashed #3A3A3C', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#8E8E93', zIndex: 1, position: 'relative' }}>
            C&apos;est votre profil public
          </div>
        )}
      </div>
    </div>
  )
}
