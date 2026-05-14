'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const THRESHOLD = 80 // px to pull before triggering refresh
const MAX_PULL = 120 // max visual pull distance

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)
  const router = useRouter()

  const getScrollParent = useCallback((): HTMLElement | null => {
    return containerRef.current?.closest('main') as HTMLElement | null
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollParent = getScrollParent()
    if (!scrollParent || isRefreshing) return

    // Only start pull if scrolled to top
    if (scrollParent.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [isRefreshing, getScrollParent])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return

    const scrollParent = getScrollParent()
    if (!scrollParent || scrollParent.scrollTop > 0) {
      isPulling.current = false
      setPullDistance(0)
      return
    }

    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY.current

    if (diff > 0) {
      // Apply resistance curve for natural feel
      const distance = Math.min(MAX_PULL, diff * 0.45)
      setPullDistance(distance)
      e.preventDefault()
    } else {
      isPulling.current = false
      setPullDistance(0)
    }
  }, [isRefreshing, getScrollParent])

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(THRESHOLD * 0.6) // Hold at smaller distance during refresh

      // Trigger refresh
      router.refresh()
      
      // Wait a bit for the refresh to visually complete
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 800)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, isRefreshing, router])

  useEffect(() => {
    const container = containerRef.current
    const scrollParent = container?.closest('main')
    if (!scrollParent) return

    scrollParent.addEventListener('touchstart', handleTouchStart, { passive: true })
    scrollParent.addEventListener('touchmove', handleTouchMove, { passive: false })
    scrollParent.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      scrollParent.removeEventListener('touchstart', handleTouchStart)
      scrollParent.removeEventListener('touchmove', handleTouchMove)
      scrollParent.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(1, pullDistance / THRESHOLD)

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: pullDistance,
          overflow: 'hidden',
          transition: isPulling.current ? 'none' : 'height 0.3s cubic-bezier(0.2, 0, 0, 1)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2.5px solid var(--card-border)',
            borderTopColor: progress >= 1 || isRefreshing ? 'var(--ink)' : 'var(--card-border)',
            animation: isRefreshing ? 'pullSpinner 0.6s linear infinite' : 'none',
            transform: isRefreshing ? 'none' : `rotate(${progress * 270}deg)`,
            transition: isPulling.current ? 'none' : 'transform 0.2s ease',
            opacity: Math.max(0, progress * 1.5 - 0.2),
          }}
        />
      </div>

      {/* Content pushed down */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes pullSpinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
