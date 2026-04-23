'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { createParty, searchClubPlayers, getUserClubId } from './actions'
import { getClubs } from '@/app/onboarding/actions'
import Link from 'next/link'

const inputStyle: React.CSSProperties = { width: '100%', height: 50, borderRadius: 14, border: 'none', background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '0 16px', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' as const }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#8E8E93', marginBottom: 8 }

type SearchPlayer = { id: string; prenom: string; nom: string; photo_url: string | null; niveau: number | null }

const TOTAL_STEPS = 5

export default function CreatePartyPage() {
  const [step, setStep] = useState(1)
  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [levelRange, setLevelRange] = useState([3.5, 6.5])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Player invite state
  const [playerQuery, setPlayerQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([])
  const [invitedPlayers, setInvitedPlayers] = useState<SearchPlayer[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    getClubs().then(setClubs)
    getUserClubId().then((id) => {
      if (id) {
        setSelectedClubId(id)
      }
    })
  }, [])

  const nextStep = () => {
    if (step === 1) {
      const select = formRef.current?.querySelector('select[name="club_id"]') as HTMLSelectElement | null
      if (select) setSelectedClubId(select.value)
    }
    if (formRef.current && formRef.current.reportValidity()) setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const submitForm = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      if (!selectedDate || !selectedTime) return
      setIsLoading(true)
      const fd = new FormData(formRef.current)
      fd.set('date_heure', `${selectedDate}T${selectedTime}`)
      fd.append('niveau_min', levelRange[0].toString())
      fd.append('niveau_max', levelRange[1].toString())
      if (invitedPlayers.length > 0) {
        fd.append('invited_players', JSON.stringify(invitedPlayers.map(p => p.id)))
      }
      await createParty(fd)
      setIsLoading(false)
    }
  }

  // Generate time slots from 07:00 to 23:00 in 30-min increments
  const timeSlots: string[] = []
  for (let h = 7; h <= 23; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`)
    if (h < 23) timeSlots.push(`${h.toString().padStart(2, '0')}:30`)
  }

  // Debounced player search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchPlayers = useCallback((query: string) => {
    setPlayerQuery(query)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!query || query.length < 2 || !selectedClubId) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchClubPlayers(selectedClubId, query)
      // Filter out already invited players
      const filtered = results.filter((r: SearchPlayer) => !invitedPlayers.some(ip => ip.id === r.id))
      setSearchResults(filtered)
      setIsSearching(false)
    }, 300)
  }, [selectedClubId, invitedPlayers])

  const addPlayer = (player: SearchPlayer) => {
    if (invitedPlayers.length >= 2) return
    setInvitedPlayers(prev => [...prev, player])
    setSearchResults(prev => prev.filter(p => p.id !== player.id))
    setPlayerQuery('')
  }

  const removePlayer = (playerId: string) => {
    setInvitedPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>Organiser un match</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8E8E93' }}>Étape {step} sur {TOTAL_STEPS}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => <div key={i} style={{ flex: 1, height: 5, borderRadius: 100, background: step >= i ? '#E8703A' : '#2C2C2E', transition: 'background 0.3s' }} />)}
        </div>
        <div style={{ background: '#1C1C1E', borderRadius: 28, padding: '28px 24px' }}>
          <form ref={formRef} style={{ display: 'flex', flexDirection: 'column', minHeight: 280 }}>
            <div style={{ flex: 1 }}>
              {/* Step 1: Club */}
              <div style={{ display: step === 1 ? 'block' : 'none' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center' }}>Où voulez-vous jouer ?</h2>
                <label style={labelStyle}>Sélectionnez le club</label>
                <select name="club_id" required={step === 1} value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)} style={{ ...inputStyle, appearance: 'none' as const, height: 54 }}>
                  <option value="" disabled>Choisir un club</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>)}
                </select>
              </div>

              {/* Step 2: Invite players */}
              <div style={{ display: step === 2 ? 'block' : 'none' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center' }}>Inviter des joueurs</h2>
                <p style={{ margin: '0 0 20px', fontSize: 12, color: '#8E8E93', textAlign: 'center' }}>Optionnel · Ajoutez jusqu&apos;à 2 joueurs de votre club</p>

                {/* Invited players */}
                {invitedPlayers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {invitedPlayers.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, background: '#2C2C2E', border: '1.5px solid rgba(232,112,58,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#8E8E93' }}>
                              {p.prenom?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.prenom} {p.nom}</span>
                            {p.niveau && <span style={{ fontSize: 11, color: '#E8703A', fontWeight: 600 }}>Niv. {p.niveau}</span>}
                          </div>
                        </div>
                        <button type="button" onClick={() => removePlayer(p.id)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search input */}
                {invitedPlayers.length < 2 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Rechercher un joueur..."
                        value={playerQuery}
                        onChange={(e) => handleSearchPlayers(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 40 }}
                      />
                      {isSearching && (
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid #3A3A3C', borderTopColor: '#E8703A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      )}
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                        {searchResults.map(player => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => addPlayer(player)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: '#2C2C2E', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          >
                            {player.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={player.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#8E8E93' }}>
                                {player.prenom?.charAt(0)}
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff' }}>{player.prenom} {player.nom}</span>
                              {player.niveau && <span style={{ fontSize: 11, color: '#8E8E93' }}>Niveau {player.niveau}</span>}
                            </div>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#E8703A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {playerQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                      <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 13, color: '#8E8E93' }}>Aucun joueur trouvé dans ce club</p>
                    )}
                  </div>
                )}

                {invitedPlayers.length >= 2 && (
                  <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#8E8E93', padding: '8px 0' }}>Maximum 2 joueurs invités atteint</p>
                )}
              </div>

              {/* Step 3: Date + Heure */}
              <div style={{ display: step === 3 ? 'block' : 'none' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center' }}>Quand ?</h2>
                <input type="hidden" name="date_heure" value={selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : ''} />
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required={step === 3}
                  style={{ ...inputStyle, height: 54, colorScheme: 'dark', marginBottom: 20 }}
                />
                <label style={labelStyle}>Créneau horaire</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        height: 42,
                        borderRadius: 12,
                        border: selectedTime === slot ? '2px solid #E8703A' : '1.5px solid #3A3A3C',
                        background: selectedTime === slot ? 'rgba(232,112,58,0.15)' : '#2C2C2E',
                        color: selectedTime === slot ? '#E8703A' : '#fff',
                        fontSize: 14,
                        fontWeight: selectedTime === slot ? 700 : 500,
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Niveau */}
              <div style={{ display: step === 4 ? 'block' : 'none' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center' }}>Quel niveau ?</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: 16 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#E8703A' }}>{levelRange[0].toFixed(1)}</span>
                  <span style={{ fontSize: 14, color: '#8E8E93' }}>à</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#E8703A' }}>{levelRange[1].toFixed(1)}</span>
                </div>
                <Slider value={levelRange} min={1} max={8} step={0.5} onValueChange={(v) => setLevelRange(v as number[])} className="py-4" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginTop: 8 }}>
                  <span>Débutant (1)</span><span>Moyen (4)</span><span>Pro (8)</span>
                </div>
              </div>

              {/* Step 5: Visibilité + Commentaire */}
              <div style={{ display: step === 5 ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
                <input type="hidden" name="type" value="loisir" />
                <input type="hidden" name="visibilite" value="publique" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center' }}>Derniers détails</h2>
                <div>
                  <label style={labelStyle}>Commentaire (Optionnel)</label>
                  <textarea name="commentaire" placeholder="Ex: J'amène les balles neuves !" style={{ ...inputStyle, height: 120, padding: '14px 16px', resize: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #2C2C2E' }}>
              {step > 1 ? (
                <button type="button" onClick={prevStep} style={{ height: 48, padding: '0 24px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Retour</button>
              ) : (
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <button type="button" style={{ height: 48, padding: '0 24px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: '#8E8E93', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Annuler</button>
                </Link>
              )}
              {step < TOTAL_STEPS ? (
                <button type="button" onClick={nextStep} style={{ height: 48, padding: '0 32px', borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>Continuer</button>
              ) : (
                <button type="button" onClick={submitForm} disabled={isLoading} style={{ height: 48, padding: '0 28px', borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? 'Publication...' : 'Valider ✨'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }`}</style>
    </div>
  )
}
