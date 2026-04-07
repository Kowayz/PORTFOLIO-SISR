# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio for **Ethan GESLIN** — BTS SIO option SISR, promotion 2025–2027. No build system, no package manager. Open `index.html` directly in a browser or serve with any static file server.

## File Architecture

| File | Role |
|---|---|
| `index.html` | Full page structure — 8 sections (Hero, À propos, Compétences, AP, Projets, Stage, Veille, Contact) |
| `style.css` | "Industrial Terminal" dark theme — all design tokens live in `:root` |
| `script.js` | Vanilla JS interactions: scroll progress, nav burger, Intersection Observer reveals, skill bars, contact form |
| `hero.js` | ES module — canvas hero animation (loaded via `<script type="module">`) |
| `assets/` | Place CV PDF here as `cv-ethan-geslin.pdf` |

## hero.js — Two-Canvas Architecture

`hero.js` uses a performance split:

- **`bgCanvas`** (inserted into DOM before `heroCanvas`) — draws the static text grid **once** per resize, never cleared per frame. Holds ~16 000 cells.
- **`heroCanvas`** (`#heroCanvas` in HTML) — cleared every frame, renders only ~600 active cells (spotlight/ripple/disturbance zones) plus the animated "ETHAN GESLIN" particles.

The file imports `prepareWithSegments` / `layoutWithLines` from `@chenglou/pretext` via `https://esm.sh/@chenglou/pretext@0.0.4` — no local install required.

## Customization Cheat Sheet

- **Personal content** (name, school, company, GitHub links, AP activities): edit `index.html` directly.
- **Colors / spacing / typography**: edit CSS custom properties at the top of `style.css` inside `:root { … }`.
- **Hero background keywords** (the scrolling tech-term grid): `ROW_SOURCES` array in `hero.js:94`.
- **Hero name particles**: `LINES = ['ETHAN', 'GESLIN']` in `hero.js:284`.

## CSS Animation Pattern

Reveal-on-scroll uses the `.reveal` / `.visible` class pair: elements start invisible, `script.js` adds `.visible` via `IntersectionObserver` when they enter the viewport. Skill bar widths are set via inline `style` or `data-*` attributes and animated the same way.

## Skills Folder

The `skills/` directory contains **Claude Code skill definitions** (SKILL.md files for frontend-design, vercel-deploy, SEO, ui-ux-pro-max, etc.). These are tool configurations, not portfolio content — do not confuse them with the SISR skill categories in `index.html`.
