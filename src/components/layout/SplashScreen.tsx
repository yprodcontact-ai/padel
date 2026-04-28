'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [show, setShow] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Ne s'affiche qu'au lancement initial sur le navigateur client
    const hasShown = sessionStorage.getItem('splash_shown')
    
    // Détection Standalone (PWA) optionnelle. 
    // Pour une expérience native complète, on l'affiche même dans Safari/Chrome mobile si on veut, 
    // mais ici on peut restreindre au PWA standalone si souhaité.
    // L'utilisateur a demandé le splash "lors du lancement de l'app" donc PWA.
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (hasShown || !isStandaloneMode) {
      setShow(false)
      return
    }

    // C'est le premier lancement en mode PWA, on affiche le splash !
    sessionStorage.setItem('splash_shown', '1')
    
    const timeout = setTimeout(() => {
      setIsFading(true)
      setTimeout(() => setShow(false), 500) // Durée du fade out
    }, 1500) // Durée d'affichage du splash
    
    return () => clearTimeout(timeout)
  }, [])

  if (!show) return null

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#f59e0b', // La couleur orange
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: isFading ? 'none' : 'auto'
      }}
    >
      <div 
        style={{
          width: 140,
          height: 140,
          borderRadius: 32,
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'splashPulse 1.5s ease-in-out infinite alternate'
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/icons/icon-512x512.png" 
          alt="WizzPadel" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <style>{`
        @keyframes splashPulse {
          0% { transform: scale(0.95); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
