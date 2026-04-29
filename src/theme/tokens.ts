/**
 * Design tokens — WizzPadel refonte v2
 * Source : design-reference/README.md
 *
 * Ces valeurs font référence. Toujours les utiliser via les CSS variables
 * déclarées dans globals.css et le tailwind.config.ts.
 */

export const colors = {
  /** Fond global de l'écran */
  bg: '#F2F2F2',
  /** Fond des cards, pills */
  card: '#FFFFFF',
  /** Bordure 1 px des cards */
  cardBorder: '#ECECEE',
  /** Texte principal, navbar, CTAs primaires */
  ink: '#000000',
  /** Texte secondaire (paragraphes denses) */
  ink2: '#3C3C43',
  /** Texte tertiaire, sous-titres, placeholders */
  muted: '#8E8E93',
  /** Séparateurs en puce */
  muted2: '#C7C7CC',
  /** Lignes entre items de liste */
  divider: '#F2F2F2',
  /** Bordures de chips niveau inactifs */
  strokeSoft: '#D8D8DC',
  /**
   * Indicateurs : terrain réservé, points unread, statuts.
   * Modifiable via CSS variable --accent.
   */
  accent: '#19A66B',
} as const;

export const radius = {
  /** Cards blanches */
  card: 28,
  /** Pills, chips, boutons arrondis */
  pill: 999,
  /** Tiles icônes de club */
  tile: 14,
  /** Chips niveau (petits) */
  chip: 6,
} as const;

export const spacing = {
  /** Padding horizontal des écrans */
  screenX: 22,
  /** Padding top (sous status bar) */
  screenTop: 64,
  /** Padding bottom (au-dessus navbar) */
  screenBottom: 130,
  /** Gap vertical entre cards */
  gap: 14,
} as const;

export const typography = {
  /** Grand titre d'écran (ligne 1) */
  hero: { size: 36, weight: 600, letterSpacing: -1.4, lineHeight: 1.05 },
  /** Grand titre gris (ligne 2 hero) */
  heroSoft: { size: 36, weight: 400, letterSpacing: -1.4, lineHeight: 1.05 },
  /** Grands chiffres (date d'une partie) */
  big: { size: 40, weight: 600, letterSpacing: -1.6, lineHeight: 1 },
  /** Titre de card */
  cardTitle: { size: 26, weight: 500, letterSpacing: -0.7 },
  /** Titre de section */
  section: { size: 18, weight: 500, letterSpacing: -0.4 },
  /** Corps de texte */
  body: { size: 15, weight: 400, letterSpacing: -0.3, lineHeight: 1.4 },
  /** Sous-titre italique (lieux, dates) */
  subItalic: { size: 15, weight: 400, italic: true },
  /** Label uppercase */
  label: { size: 13, weight: 500, letterSpacing: 0.2, transform: 'uppercase' as const },
  /** Caption */
  caption: { size: 12, weight: 400 },
} as const;

export const elevation = {
  /** Cards : aucune ombre, juste border */
  card: 'none',
  /** CTA flottant */
  cta: '0 12px 30px rgba(0,0,0,0.12)',
  /** Tab bar : aucune ombre */
  tabBar: 'none',
} as const;

/** Famille typographique unique — SF Pro / système iOS en priorité */
export const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";
