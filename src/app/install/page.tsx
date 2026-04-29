import { BackButton } from '@/components/back-button'
import { Share, MoreHorizontal, MoreVertical, PlusSquare } from 'lucide-react'

export const metadata = { title: 'Installer WizzPadel | Padel' }

export default function InstallPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 130px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ paddingTop: 8, marginBottom: 24 }}>
          <BackButton variant="pill" />
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: 'var(--foreground)' }}>Installer l&apos;application</h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          WizzPadel est une application web progressive. Installez-la sur votre écran d&apos;accueil pour recevoir les notifications et profiter de l&apos;expérience native.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* iOS Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(242,201,145,0.1)', padding: 8, borderRadius: 12, display: 'flex' }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 1.44S9.22 5 7 5a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>Sur iPhone</h2>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safari - Nouvelles versions (iOS 15+)</h3>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Appuyez sur les <b>3 points</b> <MoreHorizontal size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> dans la barre de navigation.</div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Sélectionnez <b>Partager</b> <Share size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />.</div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>3</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Choisissez <b>Sur l&apos;écran d&apos;accueil</b> <PlusSquare size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />.</div>
                </li>
              </ol>

              <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safari - Anciennes versions</h3>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Appuyez sur le bouton <b>Partager</b> <Share size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> en bas de l&apos;écran.</div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Faites défiler et choisissez <b>Sur l&apos;écran d&apos;accueil</b> <PlusSquare size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />.</div>
                </li>
              </ol>
            </div>
          </section>

          {/* Android Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(242,201,145,0.1)', padding: 8, borderRadius: 12, display: 'flex' }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V4M8 20V4M16 20V4M4 8h16M4 16h16" /></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>Sur Android</h2>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Appuyez sur les <b>3 points</b> <MoreVertical size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> en haut à droite.</div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Sélectionnez <b>Installer l&apos;application</b> ou <b>Ajouter à l&apos;écran d&apos;accueil</b>.</div>
                </li>
              </ol>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
