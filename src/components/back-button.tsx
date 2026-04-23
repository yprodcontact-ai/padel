'use client'

import { useRouter } from 'next/navigation'

export function BackButton({ label, variant = 'link' }: { label?: string; variant?: 'link' | 'pill' | 'circle' }) {
  const router = useRouter()

  if (variant === 'circle') {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke='var(--foreground)' strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
    )
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--foreground)',
          backgroundColor: 'var(--card)',
          padding: '8px 16px',
          borderRadius: 100,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        {label || 'Retour'}
      </button>
    )
  }

  // variant === 'link'
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: '#f2c991',
        background: 'none',
        padding: 0,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      {label || 'Retour'}
    </button>
  )
}

export function BackButtonSquare() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'var(--card)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--foreground)' strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
  )
}
