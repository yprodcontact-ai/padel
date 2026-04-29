# Roadmap d'intégration — Padel App refonte

> Plan d'attaque pour appliquer ce design à 100 % sur ton app existante (Antigravity build).

## Pré-requis

- [ ] Repo de l'app existante accessible (Git ou local)
- [ ] Stack identifiée : React Native + Expo ? Next.js ? Flutter ? — la roadmap suppose **React / React Native** (à adapter sinon)
- [ ] Ce dossier `design_handoff_padel_app/` téléchargé et placé soit dans le repo (dossier `design-reference/` à la racine), soit ouvert à côté pour consultation

---

## Phase 0 — Setup (30 min)

**Objectif** : préparer le terrain sans casser l'app actuelle.

1. Créer une **branche** `feat/redesign-v2`
2. Drop le dossier `design_handoff_padel_app/` à la racine du repo sous le nom **`design-reference/`** (ne sera pas bundlé en prod)
3. Vérifier que `Padel App.html` s'ouvre bien depuis le repo (juste pour avoir la référence visible)
4. Lire `screens/shared.jsx` pour comprendre les composants
5. Lire le `README.md` du handoff pour les tokens

**Prompt Claude Code / Antigravity à donner** :
> *"Lis `design-reference/README.md` puis `design-reference/screens/shared.jsx`. Fais-moi un résumé en 10 lignes du système de design à appliquer."*

---

## Phase 1 — Tokens de design (1h)

**Objectif** : centraliser les valeurs de design dans le codebase.

1. Créer (ou modifier) `src/theme/tokens.ts` avec les colors, radius, spacing, typography listés dans `README.md`
2. Si l'app utilise déjà un système de thème (Tailwind, NativeWind, Restyle, styled-components), **mettre à jour les tokens existants** plutôt que d'en créer en parallèle
3. Définir `accent` comme variable CSS / theme prop pour qu'elle soit modifiable plus tard

**Prompt** :
> *"Crée `src/theme/tokens.ts` avec les couleurs, radius, spacing et typographie définis dans `design-reference/README.md`. Si un système de thème existe déjà, intègre-les proprement dedans."*

---

## Phase 2 — Composants atomiques (2-3h)

**Objectif** : remplacer/ajouter les composants visuels de base.

Ordre recommandé (du plus utilisé au moins utilisé) :

| # | Composant | Fichier source de réf | Notes |
|---|---|---|---|
| 1 | `Card` | `shared.jsx` | Radius 28, border 1 px |
| 2 | `Pill` | `shared.jsx` | Variants : light (défaut) + dark |
| 3 | `Avatar` + badge niveau | `shared.jsx` | À brancher sur les vraies photos |
| 4 | `AvatarStack` | `shared.jsx` | Overlap -10, slots dashed |
| 5 | Set d'icônes | `shared.jsx` | Remplacer par Lucide / Phosphor / set existant |
| 6 | `TabBar` | `shared.jsx` | Bouton « + » central + cercle blanc actif |
| 7 | `LevelStrip` (chips niveau) | `find.jsx`, `match.jsx` | Composant réutilisable 1-8 par 0.5 |
| 8 | `MatchCard` | `home.jsx`, `find.jsx` | 2-3 variantes selon contexte |

**Prompt** :
> *"Pour chaque composant de la table de la Phase 2 du fichier roadmap, recrée-le dans `src/components/` en suivant le code de `design-reference/screens/shared.jsx`. Adapte à React Native si l'app est mobile. Utilise les tokens de la Phase 1."*

---

## Phase 3 — Écrans (4-6h)

**Objectif** : reconstruire les 5 écrans en utilisant les composants de la Phase 2.

**Ordre suggéré** (du plus structurant au plus complexe) :

1. **Accueil** (`home.jsx`) — sert d'ancrage, valide tous les composants atomiques
2. **Profil** (`profile.jsx`) — statique, peu d'interactions
3. **Trouver une partie** (`find.jsx`) — réutilise MatchCard
4. **Notifications** (`notifications.jsx`) — pattern de liste groupée simple
5. **Messages liste** (`messages.jsx::ScreenMessagesList`)
6. **Messages chat** (`messages.jsx::ScreenMessagesChat`) — le plus complexe (header sticky, bulles, input)
7. **Partie détail** (`match.jsx`) — 2 états `open` / `full`

Pour chaque écran :
- Reprendre le layout exact du `.jsx` de référence
- Brancher sur la **logique métier existante** de l'app (data fetching, navigation)
- Garder le **wording français** des prototypes (Yannis aime ce ton)
- Vérifier sur device : status bar, safe area, scroll, clavier

**Prompt par écran** (à répéter pour chacun) :
> *"Recrée l'écran `screens/find.jsx` dans `src/screens/FindMatch.tsx`. Utilise les composants déjà créés en Phase 2. Branche-le sur le hook `useMatches()` ou crée-le s'il n'existe pas. Garde le wording français exact."*

---

## Phase 4 — Navigation & flux (1-2h)

**Objectif** : câbler les transitions entre écrans.

- TabBar : 4 onglets (Home / Find / Messages / Profile) + bouton **+** central qui ouvre une route modale `CreateMatch`
- Card "Détails" / "Rejoindre" → push vers `MatchDetail` avec ID
- Card "Chat de la partie" dans MatchDetail → push vers `MatchChat` avec ID
- Notifications cliquables → push vers MatchDetail correspondant
- Bouton "Modifier mon profil" → route `EditProfile` (à designer plus tard)

**Prompt** :
> *"Câble la navigation selon la Phase 4 de la roadmap. Si on utilise React Navigation, utilise un Stack imbriqué dans un Tab Navigator. Le bouton + de la TabBar ouvre une modale plein écran."*

---

## Phase 5 — Polish & QA (2h)

- [ ] Vérifier sur **iPhone réel** (393×852) : la maquette est calibrée pour ce format
- [ ] Vérifier sur Android (Pixel 6/7) : ajuster typo si trop fine
- [ ] Tester en **mode sombre** : décider si on l'implémente maintenant ou plus tard
- [ ] Tester avec **noms longs** (3+ mots, accents) — texte doit tronquer proprement
- [ ] Tester avec **0/1/N joueurs** dans AvatarStack
- [ ] Tester **clavier ouvert** dans le chat
- [ ] Loading skeletons pour les listes (cards grises animées)
- [ ] Empty states (à designer en Phase 6 si besoin)

---

## Phase 6 — Hors scope (à scoper plus tard)

Ces écrans n'existent **pas** dans le handoff actuel, à designer en suivant le même système :

- **Création de partie** (formulaire : club, date, heure, niveau accepté, durée)
- **Onboarding / login**
- **Édition de profil** (nom, avatar upload, niveau auto-évalué, position préférée)
- **Recherche** dans Messages (UI déjà préparée, comportement à câbler)
- **Détail club** (carte, terrains dispos, contact)
- **Empty states** illustrés
- **Validation de niveau** (logique métier)

---

## Comment travailler avec Claude Code / Antigravity

### Workflow recommandé

1. **Une branche, un écran** : ne pas tout faire en parallèle
2. **Toujours référencer le fichier de design** dans le prompt :
   > *"… en suivant `design-reference/screens/profile.jsx`"*
3. **Vérifier visuellement** dès qu'un écran est porté : ouvrir `Padel App.html` et l'app cible côte à côte
4. Pour les **petits ajustements** : faire screenshot de l'app cible + screenshot de la référence, demander à l'IA de comparer

### Prompt initial à donner à l'IA

> Voici un dossier `design-reference/` avec une refonte UI complète à appliquer à 100 % sur cette app. Lis `design-reference/README.md` et `design-reference/design_roadmap.md` en priorité, puis suis la roadmap phase par phase. Garde la logique métier existante de l'app, ne change que la couche visuelle et la structure d'écran. Demande-moi confirmation avant de commencer chaque nouvelle phase.

### Antigravity vs Claude Code

- **Antigravity directement** : OK si l'app est déjà dans Antigravity. L'agent peut lire le dossier `design-reference/` localement et procéder.
- **Claude Code → Antigravity** : utile si tu veux d'abord factoriser proprement (Phases 1-2) avec Claude Code, commiter, puis laisser Antigravity prendre la main pour les Phases 3-5. Les deux outils travaillent sur le même Git.
- **Direct depuis ce projet** : en téléchargeant ce dossier puis en l'uploadant côté Antigravity (ou en le drag-droppant dans le repo).

---

## Estimation totale

| Phase | Durée |
|---|---|
| 0. Setup | 0h30 |
| 1. Tokens | 1h |
| 2. Composants atomiques | 2-3h |
| 3. Écrans | 4-6h |
| 4. Navigation | 1-2h |
| 5. Polish & QA | 2h |
| **TOTAL** | **~12-15h** |

Réaliste sur 2-3 sessions de travail avec un agent IA, à condition que la stack existante soit propre.
