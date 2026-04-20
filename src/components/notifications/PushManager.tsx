'use client'

import { useEffect } from 'react'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushManager() {
  useEffect(() => {
    // Évite les erreurs SSR
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_KEY) return;

    const registerPush = async () => {
       try {
           const permission = await Notification.requestPermission()
           if (permission !== 'granted') return

           const registration = await navigator.serviceWorker.ready
           let subscription = await registration.pushManager.getSubscription()

           if (!subscription) {
               subscription = await registration.pushManager.subscribe({
                   userVisibleOnly: true,
                   applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
               })
           }

           // Send to backend
           await fetch('/api/push/subscribe', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ subscription })
           })

       } catch (error) {
           console.error('Erreur inscription Web Push:', error)
       }
    }

    // Un timeout pour ne pas bloquer le thread principal au chargement
    setTimeout(() => {
        registerPush()
    }, 3000)

  }, [])

  return null
}
