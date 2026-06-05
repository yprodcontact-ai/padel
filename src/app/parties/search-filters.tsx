'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { getClubs } from '@/app/onboarding/actions'

interface FiltersProps {
  initialClub: string;
  initialHideComplete: boolean;
  initialOnlyMyLevel: boolean;
}

export function SearchFilters({
  initialClub,
  initialHideComplete,
  initialOnlyMyLevel
}: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [club, setClub] = useState(initialClub || 'tous')
  const [hideComplete, setHideComplete] = useState(initialHideComplete)
  const [onlyMyLevel, setOnlyMyLevel] = useState(initialOnlyMyLevel)

  useEffect(() => {
    getClubs().then(setClubs)
  }, [])

  useEffect(() => {
    setClub(initialClub || 'tous')
    setHideComplete(initialHideComplete)
    setOnlyMyLevel(initialOnlyMyLevel)
  }, [initialClub, initialHideComplete, initialOnlyMyLevel])

  const updateUrl = (c: string, hc: boolean, oml: boolean) => {
    const params = new URLSearchParams()
    if (c && c !== 'tous') {
      params.set('club', c)
    } else {
      params.set('club', 'tous')
    }
    if (hc) {
      params.set('hideComplete', 'true')
    }
    if (oml) {
      params.set('onlyMyLevel', 'true')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleClubChange = (newClub: string) => {
    setClub(newClub)
    updateUrl(newClub, hideComplete, onlyMyLevel)
  }

  const handleHideCompleteChange = (newHideComplete: boolean) => {
    setHideComplete(newHideComplete)
    updateUrl(club, newHideComplete, onlyMyLevel)
  }

  const handleOnlyMyLevelChange = (newOnlyMyLevel: boolean) => {
    setOnlyMyLevel(newOnlyMyLevel)
    updateUrl(club, hideComplete, newOnlyMyLevel)
  }

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: 'var(--radius-card)',
      padding: '20px 18px',
      border: '1px solid var(--card-border)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'opacity 0.2s ease',
      opacity: isPending ? 0.7 : 1
    }}>
      {/* Club Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Club de padel
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <select
            value={club}
            onChange={(e) => handleClubChange(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 'var(--radius-tile)',
              border: '1px solid var(--stroke-soft)',
              backgroundColor: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: 14,
              fontWeight: 500,
              paddingLeft: 16,
              paddingRight: 40,
              outline: 'none',
              fontFamily: 'var(--font-family-sans)',
              boxSizing: 'border-box',
              appearance: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="tous">Tous les clubs</option>
            {clubs.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>
            ))}
          </select>
          {/* Custom dropdown chevron */}
          <div style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Checkboxes / Switches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        {/* Only My Level */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${onlyMyLevel ? 'var(--ink)' : 'var(--stroke-soft)'}`,
            backgroundColor: onlyMyLevel ? 'var(--ink)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}>
            {onlyMyLevel && (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={onlyMyLevel}
            onChange={(e) => handleOnlyMyLevelChange(e.target.checked)}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
            Parties de mon niveau uniquement
          </span>
        </label>

        {/* Hide Complete */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${hideComplete ? 'var(--ink)' : 'var(--stroke-soft)'}`,
            backgroundColor: hideComplete ? 'var(--ink)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}>
            {hideComplete && (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={hideComplete}
            onChange={(e) => handleHideCompleteChange(e.target.checked)}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
            Masquer les parties complètes
          </span>
        </label>
      </div>
    </div>
  )
}

