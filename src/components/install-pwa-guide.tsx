'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import {
  Share,
  SquarePlus,
  ToggleRight,
  Check,
  EllipsisVertical,
  Menu,
  Download,
  Compass,
  Globe,
  Smartphone,
  Star,
  X,
  ArrowRight,
} from 'lucide-react'

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

type StepIcon =
  | 'share'
  | 'plus'
  | 'toggle'
  | 'check'
  | 'dots'
  | 'menu'
  | 'install'
  | 'banner'
  | 'compass'
  | 'chrome'

interface Step {
  readonly icon?: StepIcon
  readonly text: string
}

interface NoteInfo {
  readonly kind: 'info'
  readonly title: string
  readonly text: string
}

interface NoteWarn {
  readonly kind: 'warn'
  readonly title: string
  readonly text: string
  readonly switchTo?: string
}

type Note = NoteInfo | NoteWarn

interface BrowserEntry {
  readonly name: string
  readonly recommended?: true
  readonly steps: readonly Step[]
  readonly note: Note
}

interface OsEntry {
  readonly label: string
  readonly browsers: Record<string, BrowserEntry>
}

type OsKey = 'ios' | 'android'

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const GUIDE: Record<OsKey, OsEntry> = {
  ios: {
    label: 'iPhone',
    browsers: {
      safari: {
        name: 'Safari',
        recommended: true,
        steps: [
          { text: 'Ouvre le site dans Safari.' },
          {
            icon: 'share',
            text: 'Touche le bouton Partager, tout en bas au centre de l\u2019écran (ou via le bouton \u22EF, puis Partager).',
          },
          {
            icon: 'plus',
            text: 'Fais défiler la liste vers le bas, puis touche « Sur l\u2019écran d\u2019accueil ».',
          },
          {
            icon: 'toggle',
            text: 'Sous iOS 26, vérifie que « Ouvrir comme web app » est bien activé (interrupteur vert).',
          },
          {
            icon: 'check',
            text: 'Touche « Ajouter » en haut à droite. L\u2019icône apparaît sur ton écran d\u2019accueil.',
          },
        ],
        note: {
          kind: 'info',
          title: 'Selon ta version d\u2019iOS',
          text: 'iOS 16.4 et + : les notifications push fonctionnent une fois l\u2019app ajoutée. iOS 26 : l\u2019app s\u2019ouvre en plein écran par défaut. Astuce : si « Sur l\u2019écran d\u2019accueil » n\u2019apparaît pas, touche « Modifier les actions » pour l\u2019activer.',
        },
      },
      chrome: {
        name: 'Chrome',
        steps: [
          { text: 'Ouvre le site dans Chrome.' },
          {
            icon: 'share',
            text: 'Touche le bouton Partager dans la barre d\u2019adresse en haut (ou via le menu \u22EF).',
          },
          { icon: 'plus', text: 'Touche « Sur l\u2019écran d\u2019accueil ».' },
          { icon: 'check', text: 'Confirme avec « Ajouter ».' },
        ],
        note: {
          kind: 'warn',
          title: 'Nécessite iOS 17 ou plus récent',
          text: 'Sur les iPhone plus anciens, seul Safari permet d\u2019installer l\u2019app. Si ça ne marche pas, repasse par Safari.',
        },
      },
      edge: {
        name: 'Edge',
        steps: [
          { text: 'Ouvre le site dans Edge.' },
          { icon: 'dots', text: 'Touche le menu (les trois points, en bas).' },
          { icon: 'plus', text: 'Touche « Sur l\u2019écran d\u2019accueil ».' },
          { icon: 'check', text: 'Confirme avec « Ajouter ».' },
        ],
        note: {
          kind: 'warn',
          title: 'Nécessite iOS 17 ou plus récent',
          text: 'Avant iOS 17, seul Safari pouvait installer une app. Passe par Safari sur un iPhone plus ancien.',
        },
      },
      firefox: {
        name: 'Firefox',
        steps: [
          {
            text: 'Firefox sur iPhone ne permet pas d\u2019installer une vraie app sur l\u2019écran d\u2019accueil.',
          },
          {
            icon: 'compass',
            text: 'Ouvre plutôt le site dans Safari (recommandé), puis suis les étapes Safari.',
          },
        ],
        note: {
          kind: 'warn',
          title: 'Firefox non compatible',
          text: 'Utilise Safari, ou Chrome/Edge sous iOS 17+, pour une installation correcte.',
          switchTo: 'safari',
        },
      },
    },
  },
  android: {
    label: 'Android',
    browsers: {
      chrome: {
        name: 'Chrome',
        recommended: true,
        steps: [
          { icon: 'chrome', text: 'Ouvre le site dans Chrome.' },
          {
            icon: 'banner',
            text: 'Une barre « Installer l\u2019application » peut apparaître en bas : touche-la. Sinon, continue.',
          },
          {
            icon: 'dots',
            text: 'Touche le menu (trois points, en haut à droite).',
          },
          {
            icon: 'install',
            text: 'Touche « Installer l\u2019application » (vraie app) ou « Ajouter à l\u2019écran d\u2019accueil ».',
          },
          { icon: 'check', text: 'Confirme avec « Installer ».' },
        ],
        note: {
          kind: 'info',
          title: '« Installer » ou « Ajouter » ?',
          text: '« Installer l\u2019application » crée une vraie app (écran de démarrage, présente dans le tiroir d\u2019apps). « Ajouter à l\u2019écran d\u2019accueil » crée un simple raccourci. Vise « Installer ». Sous Android 8+, une fenêtre du système confirme l\u2019ajout.',
        },
      },
      samsung: {
        name: 'Samsung Internet',
        steps: [
          { text: 'Ouvre le site dans Samsung Internet.' },
          {
            icon: 'install',
            text: 'Touche l\u2019icône d\u2019installation (flèche / +) qui apparaît dans la barre d\u2019adresse en haut.',
          },
          {
            icon: 'menu',
            text: 'Ou : ouvre le menu (\u2630 en bas à droite) \u2192 « Ajouter la page à » \u2192 « Écran d\u2019accueil ».',
          },
          { icon: 'check', text: 'Confirme l\u2019installation.' },
        ],
        note: {
          kind: 'info',
          title: 'Particularité Samsung',
          text: 'Depuis la version 27, l\u2019installation passe toujours par le menu du navigateur (plus de bannière automatique). Si l\u2019icône d\u2019install n\u2019apparaît pas, utilise le menu.',
        },
      },
      firefox: {
        name: 'Firefox',
        steps: [
          { text: 'Ouvre le site dans Firefox.' },
          { icon: 'dots', text: 'Touche le menu (trois points).' },
          {
            icon: 'install',
            text: 'Touche « Installer » ou « Ajouter à l\u2019écran d\u2019accueil » (le libellé varie selon la version).',
          },
          { icon: 'check', text: 'Confirme.' },
        ],
        note: {
          kind: 'info',
          title: 'Selon la version',
          text: 'Tu verras « Installer » (vraie PWA) ou une icône maison avec un +. Les deux fonctionnent.',
        },
      },
      other: {
        name: 'Edge / Brave / Opera',
        steps: [
          { text: 'Ouvre le site dans ton navigateur.' },
          { icon: 'dots', text: 'Touche le menu (trois points).' },
          {
            icon: 'install',
            text: 'Touche « Ajouter à l\u2019écran d\u2019accueil » / « Installer l\u2019application ».',
          },
          { icon: 'check', text: 'Confirme.' },
        ],
        note: {
          kind: 'info',
          title: 'Basés sur Chrome',
          text: 'Le comportement est quasi identique à Chrome : tu obtiens une vraie app installée.',
        },
      },
    },
  },
} as const

/* ═══════════════════════════════════════════
   Icon mapping
   ═══════════════════════════════════════════ */

const ICON_MAP: Record<StepIcon, React.ElementType> = {
  share: Share,
  plus: SquarePlus,
  toggle: ToggleRight,
  check: Check,
  dots: EllipsisVertical,
  menu: Menu,
  install: Download,
  banner: Download,
  compass: Compass,
  chrome: Globe,
}

/* ═══════════════════════════════════════════
   UA Detection (client only)
   ═══════════════════════════════════════════ */

interface DetectionResult {
  os: OsKey
  browser: string
  detected: boolean
}

function detectOsAndBrowser(): DetectionResult {
  const ua = navigator.userAgent

  // iOS detection
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (isIos) {
    if (/CriOS/.test(ua)) return { os: 'ios', browser: 'chrome', detected: true }
    if (/EdgiOS/.test(ua)) return { os: 'ios', browser: 'edge', detected: true }
    if (/FxiOS/.test(ua)) return { os: 'ios', browser: 'firefox', detected: true }
    return { os: 'ios', browser: 'safari', detected: true }
  }

  // Android detection
  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return { os: 'android', browser: 'samsung', detected: true }
    if (/EdgA/.test(ua)) return { os: 'android', browser: 'other', detected: true }
    if (/OPR|Opera/.test(ua)) return { os: 'android', browser: 'other', detected: true }
    if (/Firefox/.test(ua)) return { os: 'android', browser: 'firefox', detected: true }
    return { os: 'android', browser: 'chrome', detected: true }
  }

  // Desktop fallback
  return { os: 'ios', browser: 'safari', detected: false }
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

interface InstallPwaGuideProps {
  trigger?: ReactNode
}

export function InstallPwaGuide({ trigger }: InstallPwaGuideProps) {
  // SSR-safe defaults
  const [os, setOs] = useState<OsKey>('ios')
  const [browser, setBrowser] = useState<string>('safari')
  const [detected, setDetected] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const result = detectOsAndBrowser()
    setOs(result.os)
    setBrowser(result.browser)
    setDetected(result.detected)
  }, [])

  const osEntry = GUIDE[os]
  const browserKeys = Object.keys(osEntry.browsers)
  const activeBrowserKey = browserKeys.includes(browser) ? browser : browserKeys[0]
  const activeBrowser = osEntry.browsers[activeBrowserKey]

  const handleOsChange = (newOs: OsKey) => {
    setOs(newOs)
    // Always reset to the recommended (default) browser for each OS
    const defaultBrowser = newOs === 'ios' ? 'safari' : 'chrome'
    setBrowser(defaultBrowser)
  }

  const handleSwitchBrowser = (targetBrowser: string) => {
    if (Object.keys(osEntry.browsers).includes(targetBrowser)) {
      setBrowser(targetBrowser)
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger ?? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--ink)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-family-sans)',
              letterSpacing: -0.3,
            }}
          >
            <Download size={18} />
            Installer l&apos;app
          </div>
        )}
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Backdrop
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
        <Drawer.Popup
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 101,
            background: 'var(--bg)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px 0 0',
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: 'var(--muted-2)',
              }}
            />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px 8px',
            }}
          >
            <div>
              <Drawer.Title
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-family-sans)',
                  letterSpacing: -0.5,
                }}
              >
                Installer l&apos;app
              </Drawer.Title>
              <Drawer.Description
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-family-sans)',
                  lineHeight: 1.4,
                }}
              >
                {detected
                  ? `Détecté : ${os === 'ios' ? 'iOS' : 'Android'} · ${activeBrowser.name} — tu peux changer.`
                  : 'Choisis ton téléphone et ton navigateur ci-dessus.'}
              </Drawer.Description>
            </div>
            <Drawer.Close
              style={{
                all: 'unset',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={16} style={{ color: 'var(--muted)' }} />
            </Drawer.Close>
          </div>

          {/* Scrollable content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 20px 34px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* OS segmented control */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 14,
              }}
            >
              {(Object.keys(GUIDE) as OsKey[]).map((osKey) => {
                const isActive = os === osKey
                return (
                  <button
                    key={osKey}
                    type="button"
                    onClick={() => handleOsChange(osKey)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-tile)',
                      border: isActive
                        ? '2px solid var(--ink)'
                        : '1px solid var(--card-border)',
                      background: isActive ? 'var(--ink)' : 'var(--card)',
                      color: isActive ? '#fff' : 'var(--ink)',
                      fontSize: 15,
                      fontWeight: 600,
                      fontFamily: 'var(--font-family-sans)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      letterSpacing: -0.2,
                    }}
                  >
                    <Smartphone
                      size={18}
                      style={{ color: isActive ? '#fff' : 'var(--ink)' }}
                    />
                    {GUIDE[osKey].label}
                    {osKey === 'ios' ? ' (iOS)' : ''}
                  </button>
                )
              })}
            </div>

            {/* Browser pills */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                marginBottom: 20,
                paddingBottom: 2,
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {browserKeys.map((bKey) => {
                const bEntry = osEntry.browsers[bKey]
                const isActive = activeBrowserKey === bKey
                return (
                  <button
                    key={bKey}
                    type="button"
                    onClick={() => setBrowser(bKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: isActive
                        ? '1.5px solid var(--ink)'
                        : '1px solid var(--card-border)',
                      background: isActive ? 'var(--ink)' : 'var(--card)',
                      color: isActive ? '#fff' : 'var(--ink)',
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: 'var(--font-family-sans)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      letterSpacing: -0.2,
                    }}
                  >
                    {bEntry.recommended && (
                      <Star
                        size={14}
                        fill={isActive ? '#FFD60A' : '#FFD60A'}
                        style={{
                          color: isActive ? '#FFD60A' : '#FFD60A',
                        }}
                      />
                    )}
                    {bEntry.name}
                  </button>
                )
              })}
            </div>

            {/* Steps */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 20,
                padding: '20px 18px',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {activeBrowser.steps.map((step, i) => {
                  const IconComponent = step.icon
                    ? ICON_MAP[step.icon]
                    : null
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      {/* Step number */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'var(--ink)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: 'var(--font-family-sans)',
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Step text + icon */}
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--ink-2)',
                          lineHeight: 1.55,
                          fontFamily: 'var(--font-family-sans)',
                          paddingTop: 3,
                        }}
                      >
                        {IconComponent && (
                          <IconComponent
                            size={16}
                            style={{
                              display: 'inline',
                              verticalAlign: 'text-bottom',
                              marginRight: 4,
                              color: 'var(--ink)',
                            }}
                          />
                        )}
                        {step.text}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note callout */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 16,
                border:
                  activeBrowser.note.kind === 'warn'
                    ? '1px solid #FFD60A'
                    : '1px solid var(--accent)',
                background:
                  activeBrowser.note.kind === 'warn'
                    ? 'rgba(255,214,10,0.08)'
                    : 'rgba(25,166,107,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-family-sans)',
                  }}
                >
                  {activeBrowser.note.kind === 'warn' ? '⚠️' : 'ℹ️'}{' '}
                  {activeBrowser.note.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-family-sans)',
                }}
              >
                {activeBrowser.note.text}
              </div>

              {/* Switch-to button (e.g. iOS Firefox → Safari) */}
              {'switchTo' in activeBrowser.note &&
                activeBrowser.note.switchTo && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSwitchBrowser(
                        (activeBrowser.note as NoteWarn).switchTo!
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 12,
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: 'var(--ink)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-sans)',
                      letterSpacing: -0.2,
                    }}
                  >
                    Voir les étapes Safari
                    <ArrowRight size={16} />
                  </button>
                )}
            </div>
          </div>
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
