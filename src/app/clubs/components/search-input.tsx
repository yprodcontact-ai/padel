'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

export function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      // router.replace prevents pushing a new history state on every keystroke
      router.replace(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, searchParams, pathname, router])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Rechercher par nom ou ville..."
        className="pl-10 h-12 w-full bg-background rounded-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
