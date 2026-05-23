# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Project Overview

Portfolio statique pour **Ethan GESLIN** — BTS SIO option SISR, promotion 2025–2027. Aucun build system, aucun package manager. Le site s'ouvre directement via `index.html` dans un navigateur ou via n'importe quel serveur de fichiers statiques.

**Hébergement :** GitHub Pages depuis le dépôt `Kowayz/PORTFOLIO-SISR`.

---

## Architecture du Projet

```
PORTFOLIO SISR/
├── index.html            ← Structure complète — 8 sections
├── style.css             ← Thème "Gaming/Portfolio" dark — tokens dans :root
├── script.js             ← Vanilla JS — scroll, nav, reveals, typewriter, formulaire, PDF viewer
├── hero.js               ← ES module — animation canvas hero (particles + text grid)
├── assets/
│   ├── css/
│   │   └── doc-viewer.css   ← Styles du lecteur PDF modal
│   └── js/
│       └── doc-viewer.js    ← Logique du lecteur PDF (PDF.js)
├── Activités AP/            ← PDFs des fiches AP (C1, C7, C11, C14, C17, tableau synthèse)
├── .claude/
│   └── skills/              ← Skills IA (design, SEO, deploy, etc.)
├── .gitignore
└── CLAUDE.md
```

### Sections du Portfolio (dans l'ordre)

| # | Section | ID HTML | Description |
|---|---------|---------|-------------|
| 01 | Hero | `#hero` | Canvas animé (particles "ETHAN GESLIN"), typewriter, CTAs |
| 02 | À propos | `#about` | Carte profil sticky, bento grid bio/traits/timeline |
| 03 | Compétences | `#skills` | Skill groups avec barres de progression animées |
| 04 | Activités Professionnelles | `#ap` | Cartes AP (C1, C7, C11, C14, C17) avec lecteur PDF intégré |
| 05 | Projets | `#projects` | Projets techniques (cartes avec tags) |
| 06 | Stage | `#stage` | Expérience de stage |
| 07 | Veille Technologique | `#veille` | Articles et sources de veille |
| 08 | Contact | `#contact` | Formulaire de contact |

---

## Design System — Règles Absolues

> [!IMPORTANT]
> **Avant toute modification visuelle, design ou frontend (HTML/CSS/JS), tu DOIS lire et appliquer les instructions des skills suivantes :**
> - `.claude/skills/frontend-design/SKILL.md` — Design distinctif, production-grade, anti-"AI slop"
> - `.claude/skills/web-design-guidelines/SKILL.md` — Audit UX/accessibilité Vercel
> - `.claude/skills/seo-aeo-best-practices/SKILL.md` — SEO, Open Graph, JSON-LD, EEAT
>
> **Ne jamais ignorer ces skills.** Elles définissent le standard de qualité du projet.

### Identité Visuelle

- **Direction esthétique :** Gaming / Portfolio dark, tonalité "industrial futuristic"
- **Palette :** Violet (#7c3aed) × Orange (#f97316) × Rose (#f43f5e) × Teal (#14b8a6)
- **Typographie :** `Syne` (display/titres), `Manrope` (body/texte), `Fira Code` (mono/code)
- **Backgrounds :** Noir profond (#07060e), surfaces sombres (#0c0b1d, #111028)
- **Effets :** Glassmorphism (backdrop-filter blur), gradients, orbes lumineux, glow, scan-border animé
- **Motion :** `--ease: cubic-bezier(0.4, 0, 0.2, 1)`, transitions 250ms, révélations 700ms

### Tokens CSS (`:root`)

Tous les tokens de design vivent dans `:root { … }` en haut de `style.css`. **Toujours** utiliser les variables CSS existantes :

| Token | Usage |
|-------|-------|
| `--bg`, `--surface`, `--card` | Fonds |
| `--primary`, `--primary-dim`, `--primary-glow` | Violet (UI principale) |
| `--secondary`, `--secondary-dim` | Orange (énergie, warmth) |
| `--rose`, `--teal`, `--success` | Accents |
| `--text`, `--text-muted`, `--text-faint` | Textes |
| `--grad-primary`, `--grad-hero` | Gradients |
| `--radius`, `--radius-lg`, `--radius-xl` | Border-radius |
| `--ease`, `--t`, `--t-slow` | Transitions |
| `--font-display`, `--font-body`, `--font-mono` | Polices |
| `--nav-h` | Hauteur navbar (68px) |

### Règles de Style Strictes

1. **Jamais de couleurs en dur** — Utiliser `var(--token)` pour toute couleur.
2. **Jamais de polices génériques** — Utiliser `var(--font-display)`, `var(--font-body)` ou `var(--font-mono)`.
3. **Cohérence des hover/focus** — Respecter le pattern existant : glow, border accent, background dim.
4. **Mobile-first responsive** — Les media queries existent en bas de `style.css`.
5. **Accessibilité** — Classe `.sr-only` pour le contenu accessible uniquement aux lecteurs d'écran.

---

## hero.js — Architecture Two-Canvas

`hero.js` utilise un split de performance :

- **`bgCanvas`** (inséré dans le DOM avant `heroCanvas`) — dessine la grille de texte statique **une seule fois** par resize. ~16 000 cellules.
- **`heroCanvas`** (`#heroCanvas` dans le HTML) — effacé à chaque frame, rend seulement ~600 cellules actives (spotlight/ripple/disturbance) + les particles animées "ETHAN GESLIN".

Le fichier importe `prepareWithSegments` / `layoutWithLines` depuis `@chenglou/pretext` via `https://esm.sh/@chenglou/pretext@0.0.4` — aucune installation locale requise.

### Points de customisation hero.js

| Élément | Emplacement |
|---------|-------------|
| Mots-clés du fond scrollant | `ROW_SOURCES` array à `hero.js:94` |
| Nom en particles | `LINES = ['ETHAN', 'GESLIN']` à `hero.js:284` |

---

## Patterns d'Animation

### Reveal-on-scroll

Classes `.reveal` / `.visible` : les éléments démarrent invisibles (`opacity: 0; translateY(32px)`), `script.js` ajoute `.visible` via `IntersectionObserver` quand ils entrent dans le viewport.

### Barres de compétences

Largeurs définies via attribut `data-level` et animées au scroll par `IntersectionObserver` dans `script.js`.

### Typewriter (Hero)

Cycle de phrases dans `script.js` (lignes ~119-138). Phrases actuelles :
- "Administrateur Systèmes & Réseaux"
- "Passionné de cybersécurité"
- "Intégrateur d'infrastructures"
- "Disponible en alternance"

### Compteurs animés (À propos)

Éléments `.about__stat-num[data-count]` — animation de comptage avec easing cubique.

---

## Lecteur PDF Intégré

Le portfolio intègre un lecteur PDF modal (PDF.js) pour afficher les fiches AP directement dans le site. Les cartes AP avec attribut `data-pdf` ouvrent le modal au clic.

**CDN :** PDF.js 3.11.174 via cdnjs (chargé lazy au premier clic).

**Fichiers :**
- `script.js` lignes ~240-416 : logique du modal (zoom, navigation, accent couleur)
- `assets/css/doc-viewer.css` : styles du modal
- `assets/js/doc-viewer.js` : module du doc viewer

**Accent couleur :** Le modal hérite de la couleur de la carte AP cliquée (violet/orange/rose/teal) via des CSS custom properties `--modal-accent-*`.

---

## Personnalisation

| Quoi | Où |
|------|----|
| Contenu personnel (nom, école, entreprise, liens GitHub, fiches AP) | `index.html` directement |
| Couleurs / espacement / typographie | Variables CSS dans `:root { … }` de `style.css` |
| Mots-clés du fond hero | `ROW_SOURCES` dans `hero.js` |
| Nom en particles | `LINES` dans `hero.js` |
| Phrases du typewriter | Array `phrases` dans `script.js` |
| Fiches AP (PDFs) | Dossier `Activités AP/` + attributs `data-pdf` dans `index.html` |

---

## Skills IA — Utilisation Obligatoire

Le dossier `.claude/skills/` contient des définitions de compétences pour l'IA. Ce sont des configurations d'outils, **pas** du contenu du portfolio.

| Skill | Dossier | Quand l'utiliser |
|-------|---------|-----------------|
| **Frontend Design** | `.claude/skills/frontend-design/` | Toute création/modification de composant, page, ou style CSS |
| **Web Design Guidelines** | `.claude/skills/web-design-guidelines/` | Audit UI/UX, review accessibilité, vérification bonnes pratiques |
| **SEO & AEO** | `.claude/skills/seo-aeo-best-practices/` | Metadata, Open Graph, JSON-LD, sitemaps, optimisation contenu |
| **Vercel Deploy** | `.claude/skills/vercel-deploy-claimable/` | Déploiement sur Vercel (preview ou production) |

> [!CAUTION]
> **Règle impérative :** Pour TOUTE modification touchant au design, au visuel, au CSS, ou au frontend HTML/JS, tu **dois** :
> 1. Lire le SKILL.md de `frontend-design` **avant** de coder
> 2. Appliquer les guidelines de `web-design-guidelines`
> 3. Vérifier la conformité SEO via `seo-aeo-best-practices`
>
> Un résultat générique ou "AI slop" est **inacceptable**. Le portfolio doit rester premium, distinctif et mémorable.

---

## Conventions de Code

- **Pas de framework** — Vanilla HTML/CSS/JS uniquement
- **Pas de build** — Pas de npm, webpack, vite, etc.
- **ES Modules** — `hero.js` est chargé via `<script type="module">`
- **`'use strict'`** — Activé dans `script.js`
- **BEM-like** — Nommage CSS : `.block__element--modifier` (ex: `.ap-card__header`, `.btn--primary`)
- **Commentaires** — Sections délimitées par `/* ---- SECTION ---- */` dans le CSS et `// ── SECTION ──` dans le JS
- **Responsive** — Media queries en bas de `style.css`, breakpoints principaux : 900px, 768px, 600px
