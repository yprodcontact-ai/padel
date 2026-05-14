'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { getClubs } from '@/app/onboarding/actions'

interface FiltersProps {
  initialClub: string;
  initialType: string;
  initialNiveau: string;
  initialDispo: boolean;
}

export function SearchFilters({ initialClub, initialType, initialNiveau, initialDispo }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [club, setClub] = useState(initialClub || 'tous')
  const [type, setType] = useState(initialType || 'tous')
  const [niveau, setNiveau] = useState<string>(initialNiveau || 'tous')
  const [dispo, setDispo] = useState(initialDispo)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getClubs().then(setClubs)
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (club && club !== 'tous') params.set('club', club)
    else params.set('club', 'tous')
    
    if (type && type !== 'tous') params.set('type', type)
    else params.set('type', 'tous')
    
    if (niveau && niveau !== 'tous') params.set('niveau', niveau)
    else params.set('niveau', 'tous')
    
    if (dispo) params.set('dispo', 'true')
    
    startTransition(() => {
       router.push(`${pathname}?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    setClub('tous')
    setType('tous')
    setNiveau('tous')
    setDispo(false)
    startTransition(() => {
       router.push(`${pathname}?club=tous&niveau=tous&type=tous`)
    })
  }

  const activeFiltersCount = (club !== 'tous' && club !== '' ? 1 : 0) + (niveau !== 'tous' ? 1 : 0) + (dispo ? 1 : 0)

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 46,
    borderRadius: 14,
    border: 'none',
    backgroundColor: '#F4F4F5',
    color: 'var(--foreground)',
    fontSize: 14,
    padding: '0 14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
  }

  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 22, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <select
            value={club}
            onChange={(e) => setClub(e.target.value)}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 14,
              border: 'none',
              backgroundColor: '#F4F4F5',
              color: 'var(--foreground)',
              fontSize: 14,
              paddingLeft: 40,
              paddingRight: 14,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
              appearance: 'none'
            }}
          >
            <option value="tous">Tous les clubs</option>
            {clubs.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            height: 44,
            padding: '0 16px',
            borderRadius: 14,
            border: 'none',
            background: activeFiltersCount > 0 ? 'var(--ink)' : 'var(--muted)',
            color: activeFiltersCount > 0 ? '#fff' : 'var(--foreground)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          {activeFiltersCount > 0 && (
            <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#FF9500', color: '#000', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFiltersCount}
            </span>
          )}
          Filtres
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2C2C2E', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type masqué pour le moment */}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mon Niveau</label>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} style={selectStyle}>
              <option value="tous">Peu importe</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n.toString()}>Niveau {n}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 14, backgroundColor: '#F4F4F5' }}>
            <input type="checkbox" checked={dispo} onChange={(e) => setDispo(e.target.checked)} style={{ accentColor: 'var(--ink)', width: 18, height: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>Places disponibles uniquement</span>
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={resetFilters} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
              Réinitialiser
            </button>
            <button type="button" onClick={applyFilters} disabled={isPending} style={{ flex: 1, height: 44, borderRadius: 100, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Recherche...' : 'Appliquer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

