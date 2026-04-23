'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshOnMount() {
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, [router])

  return null
}

export function RefreshButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.refresh()} 
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, color: 'var(--muted-foreground)' }}
      aria-label="Actualiser la page"
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.13-5.88L21 8"/>
      </svg>
    </button>
  )
}
