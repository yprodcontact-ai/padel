'use client'

import { useRouter } from 'next/navigation'

/**
 * BackButton — design handoff v2
 * Cercle blanc 40px, border card-border, chevron gauche noir.
 * Logique router.back() inchangée.
 */
export function BackButton({ label }: { label?: string; variant?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: label ? undefined : 40,
        height: 40,
        borderRadius: label ? 999 : '50%',
        padding: label ? '0 14px' : 0,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        cursor: 'pointer',
        justifyContent: 'center',
        boxShadow: 'none',
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{label}</span>}
    </button>
  )
}

/** Alias conservé pour compatibilité */
export function BackButtonSquare() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}
