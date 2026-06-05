'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AnalyticsTracker() {
  useEffect(() => {
    // Avoid running on server-side
    if (typeof window === 'undefined') return

    const logSession = async () => {
      const supabase = createClient()
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use a date-specific key in sessionStorage so we log once per user session per day
      const todayStr = new Date().toISOString().split('T')[0]
      const loggedKey = `wizzpadel_session_logged_${todayStr}`

      if (sessionStorage.getItem(loggedKey)) return

      // Retrieve or generate a unique session ID for the current browser tab session
      let sessionId = sessionStorage.getItem('wizzpadel_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem('wizzpadel_session_id', sessionId)
      }

      try {
        const { error } = await supabase.from('user_sessions').insert({
          user_id: user.id,
          session_id: sessionId
        })
        
        if (!error) {
          sessionStorage.setItem(loggedKey, 'true')
        } else {
          // If the table doesn't exist yet (e.g. migration not run), fail silently in console
          console.warn('Could not log user session. DB table may not be ready.', error.message)
        }
      } catch (err) {
        console.warn('Analytics session logging failed:', err)
      }
    }

    // Delay slightly to not block initial page render
    const timeoutId = setTimeout(logSession, 2000)
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}
