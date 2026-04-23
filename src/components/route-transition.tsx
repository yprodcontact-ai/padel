'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * RouteTransition — Provides two native-app-feel effects:
 * 1. A slim orange progress bar at the top during navigation
 * 2. A subtle fade-in animation when a new page mounts
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const prevPathRef = useRef(pathname)

  const animateTransition = useCallback(() => {
    // Don't animate on first mount
    if (prevPathRef.current === pathname) return

    prevPathRef.current = pathname
    setIsTransitioning(true)
    setShowContent(false)

    // Tiny delay then show new content with animation
    requestAnimationFrame(() => {
      setShowContent(true)
      // Hide progress bar after animation
      setTimeout(() => setIsTransitioning(false), 350)
    })
  }, [pathname])

  useEffect(() => {
    animateTransition()
  }, [animateTransition])

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
            background: 'linear-gradient(90deg, #f2c991, #f59e0b, #f2c991)',
            borderRadius: '0 2px 2px 0',
            animation: isTransitioning ? 'progressBar 0.4s ease-out forwards' : 'none',
          }}
        />
      </div>

      {/* Page content with fade animation */}
      <div
        style={{
          animation: showContent ? 'pageEnter 0.28s ease-out forwards' : 'none',
          willChange: 'opacity, transform',
          height: '100%',
          paddingTop: pathname !== '/' ? 15 : 0,
        }}
      >
        {children}
      </div>
    </>
  )
}
