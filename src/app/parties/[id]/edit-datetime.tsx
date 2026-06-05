'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartyDateTime } from './actions'
import { formatDate, formatTime, formatDatetime } from '@/lib/date-utils'

interface EditPartyDateTimeProps {
  partyId: string
  currentDateTime: string
  isCreator: boolean
}

export function EditPartyDateTime({ partyId, currentDateTime, isCreator }: EditPartyDateTimeProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  // Parse current datetime for HTML date/time inputs
  const getInitialDateTime = () => {
    const d = new Date(currentDateTime)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`
    }
  }

  const initial = getInitialDateTime()
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)

  const handleSave = () => {
    if (!date || !time) {
      setErrorText('Veuillez remplir la date et l\'heure.')
      return
    }

    setErrorText(null)
    startTransition(async () => {
      // Reconstruct datetime string (assumes local user timezone on construct)
      const newDateTimeString = new Date(`${date}T${time}`).toISOString()
      const res = await updatePartyDateTime(partyId, newDateTimeString)
      
      if (res?.error) {
        setErrorText(res.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  const dateStr = formatDate(currentDateTime)
  const timeStr = formatTime(currentDateTime)
  const dateFullStr = formatDatetime(currentDateTime)

  if (isEditing) {
    return (
      <div style={{ marginBottom: 16, backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', padding: 16 }}>
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Modifier la date et l&apos;heure</p>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Heure</label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {errorText && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 10px' }}>{errorText}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={handleSave} 
            disabled={isPending}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: 'var(--ink)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: isPending ? 0.7 : 1
            }}
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button 
            onClick={() => {
              setIsEditing(false)
              setErrorText(null)
            }} 
            disabled={isPending}
            style={{
              padding: '0 16px',
              height: 36,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'transparent',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              opacity: isPending ? 0.7 : 1
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1.6px', lineHeight: 1 }}>
          {dateStr}
        </h1>
        <div style={{ height: 38, padding: '0 16px', borderRadius: 999, border: '1px solid var(--card-border)', background: 'var(--card)', display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 500, color: 'var(--ink)', flexShrink: 0 }}>
          {timeStr}
        </div>
        {isCreator && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--card)',
              color: 'var(--ink)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Modifier
          </button>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted)' }}>{dateFullStr}</p>
    </div>
  )
}
