'use client'

import { useRef, useCallback, useEffect, useState } from 'react'

interface SliderProps {
  value: number[]
  min?: number
  max?: number
  step?: number
  onValueChange: (value: number[]) => void
  className?: string
}

function Slider({ value, min = 0, max = 100, step = 1, onValueChange, className }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + percent * (max - min)
      // Snap to step
      const snapped = Math.round(raw / step) * step
      // Clamp to min/max
      return Math.max(min, Math.min(max, parseFloat(snapped.toFixed(10))))
    },
    [min, max, step]
  )

  const handlePointerDown = useCallback(
    (index: number) => (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      setDraggingIndex(index)
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIndex === null) return
      const newVal = getValueFromPosition(e.clientX)
      const newRange = [...value]
      newRange[draggingIndex] = newVal
      // Ensure min thumb doesn't exceed max thumb and vice-versa
      if (draggingIndex === 0 && newRange[0] > newRange[1]) {
        newRange[0] = newRange[1]
      }
      if (draggingIndex === 1 && newRange[1] < newRange[0]) {
        newRange[1] = newRange[0]
      }
      onValueChange(newRange)
    },
    [draggingIndex, value, getValueFromPosition, onValueChange]
  )

  const handlePointerUp = useCallback(() => {
    setDraggingIndex(null)
  }, [])

  // Also handle track click to jump the nearest thumb
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const clickVal = getValueFromPosition(e.clientX)
      const newRange = [...value]
      // Determine which thumb is closest
      const dist0 = Math.abs(clickVal - newRange[0])
      const dist1 = Math.abs(clickVal - newRange[1])
      const idx = dist0 <= dist1 ? 0 : 1
      newRange[idx] = clickVal
      // Clamp
      if (idx === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1]
      if (idx === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0]
      onValueChange(newRange)
    },
    [value, getValueFromPosition, onValueChange]
  )

  // Touch event handling for mobile
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const preventScroll = (e: TouchEvent) => {
      if (draggingIndex !== null) e.preventDefault()
    }
    track.addEventListener('touchmove', preventScroll, { passive: false })
    return () => track.removeEventListener('touchmove', preventScroll)
  }, [draggingIndex])

  const leftPercent = getPercent(value[0])
  const rightPercent = getPercent(value[1])

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', userSelect: 'none', touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Track background */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          position: 'relative',
          width: '100%',
          height: 6,
          borderRadius: 100,
          backgroundColor: 'var(--border)',
          cursor: 'pointer',
        }}
      >
        {/* Active range */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
            borderRadius: 100,
            background: 'var(--ink)',
          }}
        />
      </div>

      {/* Thumb 0 (min) */}
      <div
        onPointerDown={handlePointerDown(0)}
        style={{
          position: 'absolute',
          top: '50%',
          left: `${leftPercent}%`,
          transform: 'translate(-50%, -50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'var(--foreground)',
          boxShadow: draggingIndex === 0
            ? '0 0 0 6px rgba(232,112,58,0.25), 0 2px 6px rgba(0,0,0,0.3)'
            : '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'grab',
          zIndex: draggingIndex === 0 ? 3 : 2,
          transition: draggingIndex === 0 ? 'none' : 'box-shadow 0.15s',
          border: '2px solid var(--ink)',
        }}
      />

      {/* Thumb 1 (max) */}
      <div
        onPointerDown={handlePointerDown(1)}
        style={{
          position: 'absolute',
          top: '50%',
          left: `${rightPercent}%`,
          transform: 'translate(-50%, -50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'var(--foreground)',
          boxShadow: draggingIndex === 1
            ? '0 0 0 6px rgba(232,112,58,0.25), 0 2px 6px rgba(0,0,0,0.3)'
            : '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'grab',
          zIndex: draggingIndex === 1 ? 3 : 2,
          transition: draggingIndex === 1 ? 'none' : 'box-shadow 0.15s',
          border: '2px solid var(--ink)',
        }}
      />

      {/* Level markers */}
      <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 10, pointerEvents: 'none' }}>
        {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
          const val = min + i * step
          const pct = getPercent(val)
          const isWhole = val === Math.floor(val)
          if (!isWhole) return null
          return (
            <div
              key={val}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 0,
                width: 2,
                height: 10,
                borderRadius: 1,
                background: val >= value[0] && val <= value[1] ? 'rgba(232,112,58,0.4)' : 'rgba(255,255,255,0.1)',
                transform: 'translateX(-50%)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export { Slider }
