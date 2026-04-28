import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SearchInput } from './components/search-input'

export const metadata = { title: 'Trouver un Club' }

export default async function ClubsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || ''
  const supabase = createClient()
  let request = supabase.from('clubs').select('*').order('nom')
  if (query) request = request.or(`nom.ilike.%${query}%,ville.ilike.%${query}%`)
  const { data: clubs, error } = await request

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--card)', padding: '24px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, color: 'var(--foreground)', textAlign: 'center' }}>Trouver un Club</h1>
        <SearchInput />
      </div>

      <div style={{ padding: '16px 16px 130px', maxWidth: 480, margin: '0 auto' }}>
        {error && <p style={{ color: '#EF4444', fontSize: 14 }}>Erreur lors de la récupération des clubs.</p>}
        {clubs && clubs.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginTop: 40 }}>Aucun club ne correspond à votre recherche.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clubs && clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 22, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {club.nom}
                    {club.verified && <svg width={16} height={16} viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" strokeWidth={0}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </h3>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {club.ville}
                  </p>
                </div>
                <div style={{ background: '#f2c991', borderRadius: 14, padding: '10px 14px', textAlign: 'center', minWidth: 52 }}>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>{club.nb_pistes}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pistes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
