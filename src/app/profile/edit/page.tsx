import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'
import { getClubs } from '@/app/onboarding/actions'

export const metadata = { title: 'Modifier le Profil' }

const inputStyle: React.CSSProperties = { width: '100%', height: 50, borderRadius: 14, border: 'none', background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '0 16px', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' as const }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#8E8E93', marginBottom: 8 }

export default async function ProfileEditPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const [{ data: userProfile }, clubs] = await Promise.all([
    supabase.from('users').select('*').eq('id', authData.user.id).single(),
    getClubs()
  ])
  if (!userProfile) redirect('/onboarding')

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>Modifier Profil</h1>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <button type="button" style={{ height: 36, padding: '0 18px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: '#8E8E93', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Annuler</button>
          </Link>
        </div>

        <div style={{ background: '#1C1C1E', borderRadius: 28, padding: '28px 24px' }}>
          <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Section 1 */}
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff', paddingBottom: 10, borderBottom: '1px solid #2C2C2E' }}>Informations Générales</h2>

            <div>
              <label htmlFor="photo" style={labelStyle}>Nouvelle Photo (Optionnel)</label>
              <input id="photo" name="photo" type="file" accept="image/*" style={{ ...inputStyle, padding: '12px 16px', height: 'auto', fontSize: 13, color: '#8E8E93' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label htmlFor="prenom" style={labelStyle}>Prénom</label><input id="prenom" name="prenom" required defaultValue={userProfile.prenom || ''} style={inputStyle} /></div>
              <div><label htmlFor="nom" style={labelStyle}>Nom</label><input id="nom" name="nom" required defaultValue={userProfile.nom || ''} style={inputStyle} /></div>
            </div>

            <div><label htmlFor="date_naissance" style={labelStyle}>Date de naissance</label><input id="date_naissance" name="date_naissance" type="date" required defaultValue={userProfile.date_naissance || ''} style={{ ...inputStyle, colorScheme: 'dark' }} /></div>

            <div>
              <label style={labelStyle}>Sexe</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[{ v: 'homme', l: 'Homme' }, { v: 'femme', l: 'Femme' }, { v: 'autre', l: 'Autre' }].map(o => (
                  <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
                    <input type="radio" name="sexe" value={o.v} defaultChecked={o.v === 'homme' ? userProfile.sexe !== 'femme' && userProfile.sexe !== 'autre' : userProfile.sexe === o.v} style={{ accentColor: '#E8703A' }} />{o.l}
                  </label>
                ))}
              </div>
            </div>

            <div><label htmlFor="ville" style={labelStyle}>Ville principale</label><input id="ville" name="ville" required defaultValue={userProfile.ville || ''} style={inputStyle} /></div>

            {/* Section 2 */}
            <h2 style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: '#fff', paddingBottom: 10, borderBottom: '1px solid #2C2C2E' }}>Informations Padel</h2>

            <div><label htmlFor="niveau" style={labelStyle}>Niveau (1.0 à 8.0)</label><input id="niveau" name="niveau" type="number" step="0.5" min="1" max="8" required defaultValue={userProfile.niveau || 4} style={inputStyle} /></div>

            <div>
              <label htmlFor="club_id" style={labelStyle}>Club principal</label>
              <select name="club_id" defaultValue={userProfile.club_id || 'none'} style={{ ...inputStyle, appearance: 'none' as const }}>
                <option value="none">Aucun</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>)}
              </select>
            </div>

            <div><label htmlFor="licence_fft" style={labelStyle}>Licence FFT (Optionnel)</label><input id="licence_fft" name="licence_fft" defaultValue={userProfile.licence_fft || ''} style={inputStyle} /></div>

            <div>
              <label style={labelStyle}>Main dominante</label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[{ v: 'droite', l: 'Droite' }, { v: 'gauche', l: 'Gauche' }, { v: 'ambidextre', l: 'Ambidextre' }].map(o => (
                  <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
                    <input type="radio" name="main" value={o.v} defaultChecked={o.v === 'droite' ? userProfile.main !== 'gauche' && userProfile.main !== 'ambidextre' : userProfile.main === o.v} style={{ accentColor: '#E8703A' }} />{o.l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Poste préféré</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ v: 'droite', l: 'Droite' }, { v: 'gauche', l: 'Gauche' }, { v: 'indifférent', l: 'Indifférent' }].map(o => (
                  <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
                    <input type="radio" name="poste" value={o.v} defaultChecked={o.v === 'indifférent' ? userProfile.poste !== 'droite' && userProfile.poste !== 'gauche' : userProfile.poste === o.v} style={{ accentColor: '#E8703A' }} />{o.l}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <h2 style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: '#fff', paddingBottom: 10, borderBottom: '1px solid #2C2C2E' }}>Notifications</h2>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" name="notify_new_parties" value="true" defaultChecked={userProfile.notify_new_parties ?? true} style={{ accentColor: '#E8703A', width: 20, height: 20, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#fff', lineHeight: 1.4 }}>M&apos;avertir des nouveaux matchs de mon niveau dans mon club (Match Parfait)</span>
              </label>
            </div>

            <button type="submit" style={{ width: '100%', height: 50, borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', marginTop: 16 }}>
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
