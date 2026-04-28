'use client'

import { useEffect, useState } from 'react'
import { BellIcon, XIcon, DownloadIcon } from 'lucide-react'

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
  const [isIOSInfo, setIsIOSInfo] = useState({ isIos: false, isStandalone: false })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Évite les erreurs SSR
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_KEY) return;

    const checkState = () => {
        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Detect Standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;

        setIsIOSInfo({ isIos: isIosDevice, isStandalone: isStandaloneMode })

        // Vérifie si on a l'API Notification (Safari sur iOS vieux l'a pas, Safari récent l'a si standalone)
        if (!('Notification' in window)) {
            // Sur iOS sans Notification API, c'est mort de toute façon
            if (isIosDevice && !isStandaloneMode) {
               setTimeout(() => setShowPrompt(true), 2500)
            }
            return;
        }

        // Si permission accordée, on rafraichit l'abonnement en silence
        if (Notification.permission === 'granted') {
            registerPushSilent(VAPID_KEY)
        } 
        // Sinon s'il y a un refus permanent, on ne dit rien
        else if (Notification.permission === 'default') {
            // Un bref délai pour ne pas agresser dès la première milliseconde
            setTimeout(() => setShowPrompt(true), 1500)
        }
    }
    
    checkState()

  }, [])

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

  // Cas spécial : iOS mais pas installé sur l'écran d'accueil
  if (isIOSInfo.isIos && !isIOSInfo.isStandalone) {
      return (
          <div style={{ position: 'fixed', bottom: 100, left: 16, right: 16, backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 50 }}>
             <button onClick={() => setShowPrompt(false)} style={{ position: 'absolute', top: 8, right: 8, padding: 8, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <XIcon style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} />
             </button>
             <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                 <div style={{ background: 'rgba(242,201,145,0.2)', padding: 8, borderRadius: '50%', flexShrink: 0, display: 'flex' }}>
                     <DownloadIcon style={{ width: 24, height: 24, color: '#f2c991' }} />
                 </div>
                 <div style={{ flex: 1, paddingRight: 24 }}>
                     <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>Application Native</h4>
                     <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Pour recevoir les notifications, ajoutez WizzPadel à votre <b>Écran d&apos;accueil</b> depuis le bouton de Partage.</p>
                 </div>
             </div>
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
                 <BellIcon style={{ width: 24, height: 24, color: '#f2c991' }} />
             </div>
             <div style={{ flex: 1, paddingRight: 24 }}>
                 <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>Restez informé</h4>
                 <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Soyez alerté dès qu&apos;une de vos parties est complète !</p>
             </div>
         </div>
         <button
            onClick={handleRequestPush}
            disabled={loading}
            style={{ width: '100%', marginTop: 4, background: '#f2c991', border: '1px solid #cf9619', color: 'var(--foreground)', fontWeight: 700, fontSize: 14, padding: '10px 0', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, fontFamily: 'var(--font-sans)', transition: 'opacity 0.2s' }}
         >
             {loading ? 'Activation...' : 'Activer les notifications 🔔'}
         </button>
      </div>
  )
}
