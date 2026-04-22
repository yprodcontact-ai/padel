'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

interface FiltersProps {
  initialVille: string;
  initialType: string;
  initialNiveau: number | null;
  initialDispo: boolean;
}

export function SearchFilters({ initialVille, initialType, initialNiveau, initialDispo }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [ville, setVille] = useState(initialVille)
  const [type, setType] = useState(initialType || 'tous')
  const [niveau, setNiveau] = useState<string>(initialNiveau ? initialNiveau.toString() : 'tous')
  const [dispo, setDispo] = useState(initialDispo)
  const [expanded, setExpanded] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (ville) params.set('ville', ville)
    if (type && type !== 'tous') params.set('type', type)
    if (niveau && niveau !== 'tous') params.set('niveau', niveau)
    if (dispo) params.set('dispo', 'true')
    startTransition(() => {
       router.push(`${pathname}?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    setVille('')
    setType('tous')
    setNiveau('tous')
    setDispo(false)
    startTransition(() => {
       router.push(pathname)
    })
  }

  const activeFiltersCount = (ville ? 1 : 0) + (niveau !== 'tous' ? 1 : 0) + (dispo ? 1 : 0)

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 46,
    borderRadius: 14,
    border: 'none',
    background: '#2C2C2E',
    color: '#fff',
    fontSize: 14,
    padding: '0 14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
  }

  return (
    <div style={{ background: '#1C1C1E', borderRadius: 22, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Ville (ex: Paris)"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 14,
              border: 'none',
              background: '#2C2C2E',
              color: '#fff',
              fontSize: 14,
              paddingLeft: 40,
              paddingRight: 14,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            height: 44,
            padding: '0 16px',
            borderRadius: 14,
            border: 'none',
            background: activeFiltersCount > 0 ? '#E8703A' : '#2C2C2E',
            color: '#fff',
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
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', color: '#E8703A', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mon Niveau</label>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} style={selectStyle}>
              <option value="tous">Peu importe</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n.toString()}>Niveau {n}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 14, background: '#2C2C2E' }}>
            <input type="checkbox" checked={dispo} onChange={(e) => setDispo(e.target.checked)} style={{ accentColor: '#E8703A', width: 18, height: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Places disponibles uniquement</span>
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={resetFilters} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: '1px solid #3A3A3C', background: 'transparent', color: '#8E8E93', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
              Réinitialiser
            </button>
            <button type="button" onClick={applyFilters} disabled={isPending} style={{ flex: 1, height: 44, borderRadius: 100, border: 'none', background: '#E8703A', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Recherche...' : 'Appliquer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
