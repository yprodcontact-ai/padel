import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateClub } from './actions'

export const metadata = { title: 'Gérer le Club' }

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  borderRadius: 14,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)',
  color: 'var(--foreground)',
  fontSize: 15,
  padding: '0 16px',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box' as const,
  WebkitAppearance: 'none'
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 100,
  borderRadius: 14,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)',
  color: 'var(--foreground)',
  fontSize: 15,
  padding: '12px 16px',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box' as const,
  resize: 'vertical'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--muted-foreground)',
  marginBottom: 8
}

export default async function ClubEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const [clubResponse, userResponse] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', params.id).single(),
    supabase.from('users').select('is_admin').eq('id', authData.user.id).single(),
  ])

  if (clubResponse.error || !clubResponse.data) {
    redirect('/clubs')
  }

  const club = clubResponse.data

  // Authorization Check
  let isAuthorized = false
  if (userResponse.data?.is_admin === true) {
    isAuthorized = true
  } else {
    const managerResponse = await supabase
      .from('club_managers')
      .select('role')
      .eq('club_id', params.id)
      .eq('user_id', authData.user.id)
      .maybeSingle()
    if (managerResponse && managerResponse.data) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    redirect(`/clubs/${params.id}`)
  }

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 20px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Gérer le Club</h1>
          <Link href={`/clubs/${club.id}`} style={{ textDecoration: 'none' }}>
            <button type="button" style={{ height: 36, padding: '0 18px', borderRadius: 100, border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
              Annuler
            </button>
          </Link>
        </div>

        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 24px', border: '1px solid var(--card-border)' }}>
          <form action={updateClub} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hidden Input for Club ID */}
            <input type="hidden" name="club_id" value={club.id} />

            {/* Section 1 : Informations de base */}
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--foreground)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              Informations du Club
            </h2>

            <div>
              <label htmlFor="nom" style={labelStyle}>Nom du club</label>
              <input id="nom" name="nom" required defaultValue={club.nom || ''} style={inputStyle} />
            </div>

            <div>
              <label htmlFor="description" style={labelStyle}>Description</label>
              <textarea id="description" name="description" defaultValue={club.description || ''} style={textareaStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="adresse" style={labelStyle}>Adresse</label>
                <input id="adresse" name="adresse" defaultValue={club.adresse || ''} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="ville" style={labelStyle}>Ville</label>
                <input id="ville" name="ville" required defaultValue={club.ville || ''} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="telephone" style={labelStyle}>Téléphone</label>
                <input id="telephone" name="telephone" defaultValue={club.telephone || ''} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="email" style={labelStyle}>E-mail de contact</label>
                <input id="email" name="email" type="email" defaultValue={club.email || ''} style={inputStyle} />
              </div>
            </div>

            <div>
              <label htmlFor="nb_pistes" style={labelStyle}>Nombre de pistes de Padel</label>
              <input id="nb_pistes" name="nb_pistes" type="number" min="0" required defaultValue={club.nb_pistes ?? 0} style={inputStyle} />
            </div>

            {/* Section 2 : Médias */}
            <h2 style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: 'var(--foreground)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              Médias & Visuels
            </h2>

            <div>
              <label htmlFor="photo" style={labelStyle}>Logo / Photo du Club (Optionnel)</label>
              <input id="photo" name="photo" type="file" accept="image/*" style={{ ...inputStyle, padding: '12px 16px', height: 'auto', fontSize: 13, color: 'var(--muted-foreground)' }} />
            </div>

            <div>
              <label htmlFor="cover" style={labelStyle}>Photo de Couverture du Club (Optionnel)</label>
              <input id="cover" name="cover" type="file" accept="image/*" style={{ ...inputStyle, padding: '12px 16px', height: 'auto', fontSize: 13, color: 'var(--muted-foreground)' }} />
            </div>

            <button type="submit" style={{ width: '100%', height: 50, borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', marginTop: 16 }}>
              Enregistrer les modifications
            </button>
          </form>
        </div>

        {/* Spacer explicite pour Safari */}
        <div style={{ height: 120, flexShrink: 0 }} />
      </div>
    </div>
  )
}
