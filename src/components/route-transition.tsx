'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * RouteTransition — Provides two native-app-feel effects:
 * 1. A slim orange progress bar at the top during navigation
 * 2. A subtle fade-in animation when a new page mounts
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Only animate the progress bar, do not delay or unmount the content!
    setIsTransitioning(true)
    const t = setTimeout(() => setIsTransitioning(false), 350)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <>
      {/* Top progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--ink), #f59e0b, var(--ink))',
            borderRadius: '0 2px 2px 0',
            animation: isTransitioning ? 'progressBar 0.4s ease-out forwards' : 'none',
          }}
        />
      </div>

      {/* 
        Page content with fade animation.
        Using key={pathname} forces React to mount a fresh DOM node on navigation, 
        which instantly triggers the native CSS animation without JS latency.
        This removes the "ignoble" flash on mobile.
      */}
      <div
        key={pathname}
        style={{
          animation: 'pageEnter 0.6s cubic-bezier(0.1, 1, 0, 1) forwards',
          willChange: 'opacity, transform',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          paddingTop: pathname !== '/' ? 15 : 0,
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </>
  )
}
