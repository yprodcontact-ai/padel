# Handoff — Padel App (refonte design)

## Overview

Application mobile de padel permettant aux joueurs de **créer et rejoindre des parties**, **discuter** entre eux, gérer leur **profil joueur** et recevoir des **notifications**. Ce dossier contient la nouvelle direction visuelle (minimal, noir/blanc, photographique) à appliquer à 100 % sur l'application existante (build initial Antigravity).

## ⚠️ À propos des fichiers de ce bundle

Les fichiers `.html` et `.jsx` de ce bundle sont des **références de design** — des prototypes HTML/React qui montrent l'apparence et le comportement attendus.

**Ce ne sont PAS des composants à copier-coller en production.** L'objectif est de **recréer ces écrans dans la stack de l'app existante** (probablement React Native, Expo, ou Next.js selon la plateforme cible), en réutilisant les composants déjà en place et en respectant les conventions du codebase.

Si des composants visuels existent déjà dans l'app (boutons, cards, inputs), il faut les **modifier pour matcher le design** plutôt que d'introduire de nouveaux composants en parallèle.

## Fidélité

**High-fidelity (hifi)** — Le design est pixel-perfect : couleurs, typographies, espacements, rayons de coin et hiérarchie sont définitifs. À reproduire fidèlement.

---

## Système visuel

### Palette

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#F2F2F2` | Fond global de l'écran |
| `--card` | `#FFFFFF` | Fond des cards, pills |
| `--card-border` | `#ECECEE` | Bordure 1 px des cards |
| `--ink` | `#000000` | Texte principal, navbar, CTAs primaires |
| `--ink-2` | `#3C3C43` | Texte secondaire (paragraphes denses) |
| `--muted` | `#8E8E93` | Texte tertiaire, sous-titres, placeholders |
| `--muted-2` | `#C7C7CC` | Séparateurs en puce |
| `--divider` | `#F2F2F2` | Lignes entre items de liste |
| `--stroke-soft` | `#D8D8DC` | Bordures de chips niveau inactifs |
| `--accent` | `#19A66B` | Indicateurs (terrain réservé, points unread, statuts). **Modifiable via Tweak.** |

Pas d'autres couleurs. La couleur d'accent est volontairement minimaliste — uniquement pour les signaux.

### Typographie

- **Famille unique** : `-apple-system, system-ui, sans-serif` (San Francisco sur iOS, Roboto/Inter en fallback)
- **Aucune Google Font importée** — la typo système suffit et garantit le rendu natif iOS

| Rôle | Taille | Poids | Letter-spacing | Style |
|---|---|---|---|---|
| Hero (titre d'écran) | 36 | 600 | -1.4 | line-height 1.05 |
| Hero soft (2e ligne grise) | 36 | 400 | -1.4 | color `--muted` |
| Big (date d'une partie) | 40 | 600 | -1.6 | line-height 1 |
| Card title | 24-28 | 500 | -0.6 à -0.8 | |
| Section title | 18 | 500 | -0.4 | |
| Body | 15-16 | 400-500 | -0.3 | line-height 1.35-1.45 |
| Sub italic | 15 | 400 italic | — | color `--muted` (lieux, dates) |
| Label uppercase | 13 | 500 | 0.2 | color `--muted`, `text-transform: uppercase` |
| Caption | 12-13 | 400-500 | — | color `--muted` |

### Géométrie

- **Card radius** : `28px`
- **Pill / chip radius** : `999px`
- **Tile radius** (icones de club, niveau-cells) : `6px` à `14px`
- **Bouton CTA flottant** : radius `28px`, padding `16px 22px`
- **Avatar** : cercle avec ring blanc 2px (overlap), badge niveau noir centré en bas
- **Slot vide** : cercle dashed `1.5px #B5B5BA`

### Espacements

- Padding écran : `22px` horizontal, `64px` top (sous status bar), `130-140px` bottom (au-dessus navbar)
- Gap vertical entre cards : `14px`
- Padding interne card : `22px` (par défaut), `18px` (compact), `0` (liste)
- Gap entre items de liste : séparateur `1px` `--divider`

### Élévation

- Cards : aucune ombre, juste `border: 1px solid var(--card-border)`
- CTA flottant : `0 12px 30px rgba(0,0,0,0.12)`
- Tab bar : aucune ombre

---

## Composants partagés

Tous définis dans `screens/shared.jsx`. À porter en composants natifs de l'app cible.

| Composant | Description |
|---|---|
| `<Avatar>` | Cercle dégradé avec initiales + badge niveau optionnel + ring blanc optionnel. Remplacer par vraies photos joueurs en prod. |
| `<AvatarStack>` | 1-3 avatars qui se chevauchent (`marginLeft: -10`) + N slots vides en pointillé. |
| `<Pill>` | Pastille blanche bordée (heure, "Chat", "Détails") ou noire (CTA secondaire). |
| `<Card>` | Card blanche radius 28, border 1 px gris. |
| `<TabBar>` | Barre noire bottom 64 px, 4 icônes + bouton « + » central creux (cercle avec border `rgba(255,255,255,0.35)`). Indicateur actif = cercle blanc plein 44 px autour de l'icône. |

### Icônes

8 icônes line-style 24×24 stroke-width 1.8 dessinées en SVG inline : Home, Search, Chat, User, Bell, Plus, Pin, Star, Settings, Send, ChevronLeft/Right, Arrow (avec rotations tr/r/l), Check.

À remplacer par un set cohérent dans l'app cible (Lucide, Phosphor, ou les icônes existantes).

---

## Écrans

Tous au format **iPhone 393×852 logique**. Tab bar fixe en bas (sauf chat qui a son propre header sticky).

### 01 · Accueil (`screens/home.jsx`)

**But** : page d'atterrissage. Affiche la prochaine partie + un carousel horizontal des parties disponibles.

**Layout** :
- Header : avatar + "Bonjour Yannis" + pill "Chat" + bouton notifications
- Hero : "Votre prochaine / partie de padel" (deux lignes, la 2e en gris)
- **Card prochaine partie** : "Aujourd'hui" + sous-titre club italique + pill heure droite ; statut "Terrain réservé" avec dot accent ; AvatarStack + bouton "Détails" avec flèche TR
- Section "Parties disponibles" : carousel horizontal de cards (peek du suivant à droite)

### 02 · Trouver une partie (`screens/find.jsx`)

**But** : chercher une partie à rejoindre selon son niveau et sa zone.

**Layout** :
- Hero "Trouver / une partie" + bouton search rond
- **Filtre niveau** : strip horizontal de chips de 1 à 8 par paliers de 0,5 (15 chips). Chip noir = niveau du joueur, chips blancs avec border noire = plage acceptable, autres en gris.
- **Filtre zone** : card avec pin + "Aubenas · 25 km" + chevron
- Header section : "7 parties trouvées" + "Trier ↓"
- Liste verticale de **FindCards** : jour + heure + club + niveaux + distance + AvatarStack + bouton noir "Rejoindre"

### 03a · Messages — liste (`screens/messages.jsx::ScreenMessagesList`)

**But** : index des conversations.

**Layout** :
- Hero "Messages" + bouton "+"
- Search pill grise avec icône
- Card padding 0 contenant les rows :
  - Type "match" : double-avatar overlap (32 px) + titre partie + sous-titre `club · last message`
  - Type "DM" : avatar 48 + nom + last message
  - Badge unread noir (compteur) à droite si > 0

### 03b · Messages — discussion (`screens/messages.jsx::ScreenMessagesChat`)

**But** : chat de groupe pour une partie.

**Layout** :
- Header sticky : back chevron + double-avatar + titre + sous-titre "club · 4 joueurs" + bouton flèche TR
- Bandeau noir épinglé : "Terrain 3 réservé · 1h30 · 3/4"
- Bulles :
  - Mine : alignées droite, fond noir, texte blanc, radius 22 avec coin BR à 6
  - Other : alignées gauche, fond blanc bordé, avatar 28 px à gauche, nom au-dessus si nouveau speaker
- Input bar : pill grise "Message…" + bouton send rond noir

### 04 · Notifications (`screens/notifications.jsx`)

**But** : flux des événements importants.

**Types couverts** : `joined` (joueur rejoint), `reminder` (rappel 1h avant match), `cancelled` (match annulé). Pas d'autres types.

**Layout** :
- Hero "Notifications" + lien "Tout lire"
- Groupes (`Aujourd'hui`, `Cette semaine`, `Plus ancien`) avec label uppercase
- Card padding 0 par groupe :
  - Visuel rond 44 px à gauche : avatar (joined) / cercle noir + cloche (reminder) / cercle blanc bordé + ✕ (cancelled)
  - Texte : ligne nom+verbe + sous-ligne italique grise (lieu/heure)
  - Heure relative à droite
  - Dot accent à gauche absolu si non lu

### 05 · Profil (`screens/profile.jsx`)

**But** : profil de l'utilisateur connecté (Yannis), mode édition.

**Layout** :
- Top bar : settings rond gauche + lien "Modifier" droit
- Bloc identité centré : avatar 104 + nom 32 px + ville italique
- 2 cards côte à côte :
  - **Niveau** : "5 /8" gros + 8 étoiles (5 pleines, 3 vides)
  - **Position** : "Gauche" + "Coup droit dominant"
- Card **Bio** : label uppercase + paragraphe
- Section "Clubs favoris" : 3 rows (tile noir + pin blanc + nom + sub `dist · terrains · X parties`)
- Bouton CTA noir pleine largeur : "Modifier mon profil"

### 06 · Partie — détail (`screens/match.jsx`)

**But** : page d'une partie unique. **2 états** :
- `open` : 1 place restante, CTA noir "Rejoindre"
- `full` : complet, CTA blanc "Quitter"

**⚠️ Pas d'équipe A/B, pas de gauche/droite dans la liste joueurs, pas de score ni de résultat.**

**Layout** :
- Back chevron rond + lien "Partager"
- Hero : jour 40 px + pill heure + sous-titre date italique
- Card club : tile noir + pin + club + `terrain · durée · ville` + flèche TR
- **Card niveau accepté** : label + plage "4 à 6" en gros + grille 1-8 par 0,5 (chips actifs noirs / inactifs gris). 15 chips au total.
- Section "Joueurs N/4" : card padding 0 avec rows (avatar + nom + niveau). Slot vide = cercle dashed + label "Place libre".
- Card "Chat de la partie" cliquable avec compteur unread
- **CTA flottant en bas** : pill grand format avec titre + sous-titre + bouton rond accent

---

## Données factices

Le pseudo-jeu de données est en français, ancré sur **Aubenas / Ardèche** (Yannis vit là-bas). Clubs cités : *Tennis Club Aubenas*, *Aubenas Padel Center*, *Padel Privas*. À remplacer par les vraies données utilisateur en prod.

Joueurs types dans `screens/shared.jsx` (constante `PLAYERS`) — niveaux 4 à 6 majoritairement, avec des dégradés HSL distincts pour différencier visuellement les avatars.

---

## Interactions & comportement

Le prototype actuel est **principalement statique** — la navigation entre écrans n'est pas câblée. À implémenter en prod :

- **Navigation tab bar** : Home / Find / Messages / Profile (4 onglets) + bouton « + » central qui ouvre la création de partie (modale ou full-screen route)
- **Cards de partie** → ouvre `Partie (single)` correspondante
- **Card "Chat de la partie"** dans Partie → ouvre la discussion correspondante
- **Filtre niveau dans Find** : drag/tap sur les chips pour ajuster la plage acceptable
- **CTA Rejoindre/Quitter** : POST API + transition d'état entre `open` ↔ `full`
- **Bouton « + » navbar** : modale création de partie (à designer dans une prochaine itération)

### États non couverts par le design (à clarifier ensuite)

- Création de partie (formulaire + sélection club/heure/niveau)
- Login / onboarding
- Validation de niveau (auto-évaluation ou vérification)
- Recherche dans Messages (champ déjà présent mais non actif)
- Modale de saisie nouveau message
- Empty states (0 partie disponible, 0 message, 0 notif)
- États d'erreur réseau, loading skeletons

---

## Niveaux : règle de référence

Échelle officielle dans cette refonte : **1 → 8 par paliers de 0,5** (donc 15 valeurs : 1, 1.5, 2, 2.5, ..., 7.5, 8).

Affichage : label entier (ex. `5`) ou décimal une décimale (ex. `5.5`). Police plus petite pour les décimaux dans les chips étroites.

---

## Tokens à exporter dans le codebase

```ts
// theme.ts (ou équivalent)
export const colors = {
  bg: '#F2F2F2',
  card: '#FFFFFF',
  cardBorder: '#ECECEE',
  ink: '#000000',
  ink2: '#3C3C43',
  muted: '#8E8E93',
  muted2: '#C7C7CC',
  divider: '#F2F2F2',
  strokeSoft: '#D8D8DC',
  accent: '#19A66B',
};

export const radius = { card: 28, pill: 999, tile: 14, chip: 6 };
export const spacing = { screenX: 22, screenTop: 64, screenBottom: 130, gap: 14 };
export const typography = {
  hero:    { size: 36, weight: 600, ls: -1.4, lh: 1.05 },
  big:     { size: 40, weight: 600, ls: -1.6, lh: 1 },
  cardTitle: { size: 26, weight: 500, ls: -0.7 },
  section: { size: 18, weight: 500, ls: -0.4 },
  body:    { size: 15, weight: 400, ls: -0.3, lh: 1.4 },
  label:   { size: 13, weight: 500, ls: 0.2, transform: 'uppercase' },
  caption: { size: 12, weight: 400 },
};
```

---

## Fichiers du bundle

```
design_handoff_padel_app/
├── README.md                    ← ce fichier
├── Padel App.html               ← entrée du prototype, charge tous les écrans
├── design-canvas.jsx            ← starter pan/zoom (présentation seulement, à ignorer en prod)
├── ios-frame.jsx                ← cadre iPhone (présentation seulement, à ignorer en prod)
├── tweaks-panel.jsx             ← panneau Tweak couleur d'accent (présentation seulement)
├── reference/
│   └── maquette-home-v2.jpg     ← maquette d'origine fournie par Yannis
└── screens/
    ├── shared.jsx               ← composants + tokens + données factices ⭐ À LIRE EN 1ER
    ├── home.jsx                 ← 01 Accueil
    ├── find.jsx                 ← 02 Trouver une partie
    ├── messages.jsx             ← 03a liste + 03b discussion
    ├── notifications.jsx        ← 04 Notifications
    ├── profile.jsx              ← 05 Profil
    └── match.jsx                ← 06 Partie (states: 'open' | 'full')
```

Pour visualiser le prototype : ouvrir `Padel App.html` dans un navigateur (sert tous les fichiers `.jsx` via Babel standalone).
