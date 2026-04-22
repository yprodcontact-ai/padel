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
          <div className="fixed bottom-[90px] left-4 right-4 bg-black border border-zinc-800 p-4 rounded-[16px] shadow-2xl flex flex-col gap-3 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
             <button onClick={() => setShowPrompt(false)} className="absolute top-2 right-2 p-2 hover:bg-muted rounded-full">
                 <XIcon className="w-4 h-4 text-muted-foreground" />
             </button>
             <div className="flex items-start gap-3">
                 <div className="bg-primary/10 p-2 rounded-full shrink-0">
                     <DownloadIcon className="w-6 h-6 text-primary" />
                 </div>
                 <div className="flex-1 pr-6">
                     <h4 className="font-bold text-sm">Application Native</h4>
                     <p className="text-xs text-muted-foreground mt-1">Pour recevoir les notifications et améliorer l&apos;expérience, ajoutez PadelConnect à votre <b>Écran d&apos;accueil</b> depuis le bouton de Partage.</p>
                 </div>
             </div>
          </div>
      )
  }

  return (
      <div className="fixed bottom-[90px] left-4 right-4 bg-zinc-900 border border-zinc-800 p-4 rounded-[16px] shadow-2xl flex flex-col gap-3 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
         <button onClick={() => setShowPrompt(false)} className="absolute top-2 right-2 p-2 hover:bg-zinc-800 rounded-full transition-colors">
             <XIcon className="w-4 h-4 text-zinc-400" />
         </button>
         <div className="flex items-start gap-3">
             <div className="bg-primary p-2 rounded-full shrink-0 animate-pulse">
                 <BellIcon className="w-6 h-6 text-black" />
             </div>
             <div className="flex-1 pr-6">
                 <h4 className="font-bold text-sm text-zinc-100">Restez informé</h4>
                 <p className="text-xs text-zinc-400 mt-1">Soyez alerté au centième de seconde dès lors qu&apos;une de vos parties est complète !</p>
             </div>
         </div>
         <button 
            onClick={handleRequestPush} 
            disabled={loading}
            className="w-full mt-2 bg-primary text-black font-bold py-2.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
         >
             {loading ? 'Activation...' : 'Activer les notifications'}
         </button>
      </div>
  )
}
