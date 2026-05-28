'use client'

import { BackButton } from '@/components/back-button'
import { InstallPwaGuide } from '@/components/install-pwa-guide'
import { Download } from 'lucide-react'

export default function InstallPage() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '16px 16px 130px',
        fontFamily: 'var(--font-family-sans)',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ paddingTop: 8, marginBottom: 24 }}>
          <BackButton />
        </div>

        {/* Hero section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}
          >
            <Download size={32} style={{ color: '#fff' }} />
          </div>

          <h1
            style={{
              margin: '0 0 10px',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: -0.5,
            }}
          >
            Installer l&apos;application
          </h1>
          <p
            style={{
              margin: '0 0 28px',
              fontSize: 15,
              color: 'var(--muted-foreground)',
              lineHeight: 1.55,
              maxWidth: 360,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            WizzPadel est une application web progressive. Installe-la sur ton
            écran d&apos;accueil pour recevoir les notifications et profiter de
            l&apos;expérience native.
          </p>

          <InstallPwaGuide />
        </div>

        {/* Benefits section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {[
            {
              emoji: '🚀',
              title: 'Accès rapide',
              desc: 'Lance WizzPadel directement depuis ton écran d\u2019accueil, comme une app native.',
            },
            {
              emoji: '🔔',
              title: 'Notifications push',
              desc: 'Sois averti des nouvelles parties, messages et invitations.',
            },
            {
              emoji: '📱',
              title: 'Expérience plein écran',
              desc: 'Profite de l\u2019interface sans barre de navigation du navigateur.',
            },
            {
              emoji: '⚡',
              title: 'Toujours à jour',
              desc: 'L\u2019app se met à jour automatiquement, aucune action requise.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 20,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {item.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: 4,
                    letterSpacing: -0.2,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    lineHeight: 1.45,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer for bottom navbar */}
        <div style={{ height: 120 }} />
      </div>
    </div>
  )
}
