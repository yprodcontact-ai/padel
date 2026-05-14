'use client'

import { useState, useEffect, useRef } from 'react'
import { completeOnboarding, getClubs } from './actions'
import { Slider } from '@/components/ui/slider'

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
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--muted-foreground)',
  marginBottom: 8,
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [level, setLevel] = useState([4.0])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getClubs().then(setClubs)
  }, [])

  const nextStep = () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setStep((s) => Math.min(s + 1, 3))
    }
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const submitForm = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setIsLoading(true)
      const formData = new FormData(formRef.current)
      await completeOnboarding(formData)
      setIsLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--background)', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--foreground)' }}>Complétez votre profil</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--muted-foreground)' }}>Étape {step} sur 3</p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 100,
                background: step >= i ? 'var(--ink)' : 'var(--muted)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 24px' }}>
          <form ref={formRef}>
            {/* ETAPE 1 */}
            <div style={{ display: step === 1 ? 'flex' : 'none', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="prenom" style={labelStyle}>Prénom</label>
                  <input id="prenom" name="prenom" required={step === 1} placeholder="Jean" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="nom" style={labelStyle}>Nom</label>
                  <input id="nom" name="nom" required={step === 1} placeholder="Dupont" style={inputStyle} />
                </div>
              </div>
              <div>
                <label htmlFor="date_naissance" style={labelStyle}>Date de naissance</label>
                <input id="date_naissance" name="date_naissance" type="date" required={step === 1} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sexe</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ v: 'homme', l: 'Homme' }, { v: 'femme', l: 'Femme' }].map((opt) => (
                    <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--foreground)', fontSize: 14 }}>
                      <input type="radio" name="sexe" value={opt.v} defaultChecked={opt.v === 'homme'} style={{ accentColor: 'var(--ink)' }} />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ETAPE 2 */}
            <div style={{ display: step === 2 ? 'flex' : 'none', flexDirection: 'column', gap: 18 }}>
              <div>
                <label htmlFor="ville" style={labelStyle}>Ville principale</label>
                <input id="ville" name="ville" required={step === 2} placeholder="Paris" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Niveau (1.0 à 8.0)</label>
                <input type="hidden" name="niveau" value={level[0]} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>{level[0].toFixed(1)}</span>
                </div>
                <Slider value={level} min={1} max={8} step={0.5} onValueChange={(v) => setLevel(v as number[])} className="py-4" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8 }}>
                  <span>Débutant (1)</span><span>Moyen (4)</span><span>Pro (8)</span>
                </div>
              </div>
              <div>
                <label htmlFor="club_id" style={labelStyle}>Club dans lequel vous jouez (Optionnel)</label>
                <select name="club_id" style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="">Aucun / Je ne joue pas en club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.nom} ({club.ville})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="classement_fft" style={labelStyle}>Classement actuel (Optionnel)</label>
                <input id="classement_fft" name="classement_fft" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Ex: 5000" style={inputStyle} />
              </div>
            </div>

            {/* ETAPE 3 */}
            <div style={{ display: step === 3 ? 'flex' : 'none', flexDirection: 'column', gap: 22 }}>
              <div>
                <label htmlFor="photo" style={labelStyle}>Photo de profil (Optionnel)</label>
                <input id="photo" name="photo" type="file" accept="image/*" style={{ ...inputStyle, padding: '12px 16px', height: 'auto', fontSize: 13, color: 'var(--muted-foreground)' }} />
              </div>
              <div>
                <label style={labelStyle}>Main dominante</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ v: 'droite', l: 'Droite' }, { v: 'gauche', l: 'Gauche' }].map((opt) => (
                    <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--foreground)', fontSize: 14 }}>
                      <input type="radio" name="main" value={opt.v} defaultChecked={opt.v === 'droite'} style={{ accentColor: 'var(--ink)' }} />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Poste préféré</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[{ v: 'droite', l: 'Joueur de Droite' }, { v: 'gauche', l: 'Joueur de Gauche' }, { v: 'indifférent', l: 'Indifférent (Je m\'adapte)' }].map((opt) => (
                    <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--foreground)', fontSize: 14 }}>
                      <input type="radio" name="poste" value={opt.v} defaultChecked={opt.v === 'indifférent'} style={{ accentColor: 'var(--ink)' }} />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #2C2C2E' }}>
              {step > 1 ? (
                <button type="button" onClick={prevStep} style={{ height: 48, padding: '0 24px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: 'var(--foreground)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  Précédent
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} style={{ height: 48, padding: '0 32px', borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  Suivant
                </button>
              ) : (
                <button type="button" onClick={submitForm} disabled={isLoading} style={{ height: 48, padding: '0 32px', borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? 'Enregistrement...' : 'Valider'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
