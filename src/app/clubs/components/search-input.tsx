'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchTerm) { params.set('q', searchTerm) } else { params.delete('q') }
      router.replace(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, searchParams, pathname, router])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto' }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        placeholder="Rechercher par nom ou ville..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 100,
          border: 'none',
          background: '#2C2C2E',
          color: '#fff',
          fontSize: 14,
          paddingLeft: 44,
          paddingRight: 16,
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
