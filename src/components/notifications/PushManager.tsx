'use client'

import { useEffect, useState } from 'react'
import { BellIcon, XIcon, DownloadIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const [showPrompt, setShowPrompt] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isStandalone: true })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Évite les erreurs SSR
    if (typeof window === 'undefined') {
        return;
    }

    // Force la page d'accueil au lancement de la PWA (utile pour iOS)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandaloneMode && !sessionStorage.getItem('pwa_launched')) {
        sessionStorage.setItem('pwa_launched', '1');
        if (window.location.pathname !== '/') {
            router.replace('/');
            return; // On arrête là pour laisser le redirect se faire
        }
    }

    const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_KEY) return;

    const checkState = () => {
        // Detect Mobile
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Detect Standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        setDeviceInfo({ isMobile: isMobileDevice, isStandalone: isStandaloneMode })

        // Si on est sur mobile et pas standalone, on veut FORCER la popup d'install
        if (isMobileDevice && !isStandaloneMode) {
            setTimeout(() => setShowPrompt(true), 2500)
        }

        if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
            if (Notification.permission === 'granted') {
                registerPushSilent(VAPID_KEY)
            } else if (Notification.permission === 'default' && (!isMobileDevice || isStandaloneMode)) {
                setTimeout(() => setShowPrompt(true), 1500)
            }
        }
    }
    
    checkState()

  }, [router])

  const registerPushSilent = async (vapidKey: string) => {
       try {
           const registration = await navigator.serviceWorker.ready
           let subscription = await registration.pushManager.getSubscription()

           if (!subscription) {
               subscription = await registration.pushManager.subscribe({
                   userVisibleOnly: true,
                   applicationServerKey: urlBase64ToUint8Array(vapidKey)
               })
           }

           // Send to backend
           await fetch('/api/push/subscribe', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ subscription })
           })
       } catch (error) {
           console.error('Erreur inscription Web Push silencieuse:', error)
       }
  }

  const handleRequestPush = async () => {
       const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
       if (!VAPID_KEY) return;
       
       setLoading(true)
       try {
           // LA règle d'or d'Apple : Ceci doit être appelé DIRECTEMENT dans l'onClick
           const permission = await Notification.requestPermission()
           if (permission === 'granted') {
               await registerPushSilent(VAPID_KEY)
           }
           setShowPrompt(false)
       } catch (error) {
           console.error('Erreur demande Web Push:', error)
       } finally {
           setLoading(false)
       }
  }

  if (!showPrompt) return null;

  // Cas spécial : Mobile mais pas installé sur l'écran d'accueil
  if (deviceInfo.isMobile && !deviceInfo.isStandalone) {
      return (
          <div style={{ position: 'fixed', bottom: 100, left: 16, right: 16, backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 50 }}>
             <button onClick={() => setShowPrompt(false)} style={{ position: 'absolute', top: 8, right: 8, padding: 8, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <XIcon style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} />
             </button>
             <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                 <div style={{ background: 'rgba(242,201,145,0.2)', padding: 8, borderRadius: '50%', flexShrink: 0, display: 'flex' }}>
                     <DownloadIcon style={{ width: 24, height: 24, color: 'var(--ink)' }} />
                 </div>
                 <div style={{ flex: 1, paddingRight: 24 }}>
                     <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>Installer l&apos;application</h4>
                     <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Pour recevoir les notifications, ajoutez WizzPadel à votre <b>Écran d&apos;accueil</b> depuis le bouton de Partage.</p>
                 </div>
             </div>
             <Link href="/install" onClick={() => setShowPrompt(false)} style={{ width: '100%', marginTop: 4, background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14, padding: '10px 0', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-sans)', textDecoration: 'none' }}>
                 Comment faire ? 🤔
             </Link>
          </div>
      )
  }

  return (
      <div style={{ position: 'fixed', bottom: 100, left: 16, right: 16, backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 50 }}>
         <button onClick={() => setShowPrompt(false)} style={{ position: 'absolute', top: 8, right: 8, padding: 8, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <XIcon style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} />
         </button>
         <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
             <div style={{ background: 'rgba(242,201,145,0.2)', padding: 8, borderRadius: '50%', flexShrink: 0, display: 'flex' }}>
                 <BellIcon style={{ width: 24, height: 24, color: 'var(--ink)' }} />
             </div>
             <div style={{ flex: 1, paddingRight: 24 }}>
                 <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>Restez informé</h4>
                 <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Soyez alerté dès qu&apos;une de vos parties est complète !</p>
             </div>
         </div>
         <button
            onClick={handleRequestPush}
            disabled={loading}
            style={{ width: '100%', marginTop: 4, background: 'var(--ink)', border: '1px solid var(--ink)', color: 'var(--foreground)', fontWeight: 700, fontSize: 14, padding: '10px 0', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, fontFamily: 'var(--font-sans)', transition: 'opacity 0.2s' }}
         >
             {loading ? 'Activation...' : 'Activer les notifications 🔔'}
         </button>
      </div>
  )
}
