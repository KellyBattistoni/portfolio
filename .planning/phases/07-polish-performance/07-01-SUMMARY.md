---
phase: 07-polish-performance
plan: "01"
subsystem: seo-meta
tags: [meta-tags, og-tags, hreflang, i18n, seo]
dependency_graph:
  requires: []
  provides:
    - useMetaTags hook (dynamic document.title + meta description per language)
    - Static OG tags in index.html (crawler-readable)
    - hreflang links in index.html (Googlebot)
    - public/og-card-preview.html (OG image screenshot template)
  affects:
    - src/App.tsx (new hook call)
    - index.html (OG + hreflang additions)
tech_stack:
  added: []
  patterns:
    - useEffect on i18n.resolvedLanguage for DOM mutation (mirrors useLocalizeDocumentAttributes)
    - Static OG meta tags in index.html for crawler readability
key_files:
  created:
    - src/hooks/useMetaTags.ts
    - public/og-card-preview.html
  modified:
    - src/locales/en/common.json
    - src/locales/es/common.json
    - src/App.tsx
    - index.html
decisions:
  - "Direct DOM mutation via useEffect (no react-helmet-async) per D-01"
  - "Static OG + hreflang in index.html — social crawlers cannot execute JS per D-03/D-04/D-05"
  - "useMetaTags follows exact same pattern as useLocalizeDocumentAttributes — dependency array [i18n.resolvedLanguage, t]"
  - "EN meta title 59 chars / description 156 chars; ES meta title 49 chars / description 167 chars (user may trim at checkpoint)"
metrics:
  duration: "~15 min"
  completed: "2026-06-17T05:50:10Z"
  tasks_completed: 3
  tasks_total: 4
  files_created: 2
  files_modified: 4
---

# Phase 7 Plan 01: SEO Meta Tags + OG Card Summary

Dynamic language-aware meta tags wired via useMetaTags hook; static OG tags and hreflang added to index.html; OG card preview HTML artifact created — plan paused at human checkpoint for meta copy review and og-image.png screenshot.

## What Was Built

### Task 1: Lighthouse Baseline Audit

**Status:** Build confirmed clean. Lighthouse scores to be recorded by user during Task 4 checkpoint.

**npm run build output:**
- `dist/assets/index-DUyfTuF5.js`: **522.00 KB** (gzip: **175.02 KB**) — single chunk
- `dist/assets/index-Dthhu2H7.css`: 39.34 KB (gzip: 7.65 KB)
- `dist/index.html`: 0.96 KB (gzip: 0.52 KB)
- Build exit code: **0** — no TypeScript or bundler errors
- Vite warning: "Some chunks are larger than 500 kB after minification" (addressed in Plan 07-02 via React.lazy Plasma split)

### Baseline Scores

| Category | Score | Notes |
|----------|-------|-------|
| Performance | TBD | To be recorded by user at Task 4 checkpoint via Chrome DevTools Lighthouse (mobile preset, http://localhost:4173) |
| Accessibility | TBD | — |
| Best Practices | TBD | — |
| SEO | TBD | — |
| LCP | TBD | — |

*Note: Lighthouse requires a browser-operated audit. Scores will be recorded at the human verification checkpoint in Task 4. Bundle baseline (522KB pre-split) is documented above for before/after comparison in Plan 07-04.*

### Task 2: useMetaTags Hook + Locale Strings

- `src/hooks/useMetaTags.ts` created — mirrors `useLocalizeDocumentAttributes` pattern exactly
- Updates `document.title` and `meta[name="description"]` inside a `useEffect` with dependency array `[i18n.resolvedLanguage, t]`
- `useTranslation('common')` used — no extra namespace dependency
- EN locale: `meta.title` = "Kelly Battistoni — AI Automations Manager & Systems Thinker" (59 chars), `meta.description` = 156 chars
- ES locale: `meta.title` = "Kelly Battistoni — Gerente de Automatizaciones IA" (49 chars), `meta.description` = 167 chars (user may trim at checkpoint)
- `useMetaTags()` added to `App.tsx` on line 17, immediately after `useLocalizeDocumentAttributes()`
- TypeScript clean (`tsc -b --noEmit` exit 0)

### Task 3: OG Meta Tags + hreflang + OG Card Preview

**index.html additions:**
- 8 Open Graph meta tags: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `twitter:card`
- 3 hreflang link elements: `en`, `es`, `x-default` — all pointing to `https://kellybattistoni.github.io/`
- Google Fonts href unchanged — `&display=swap` still present (D-08 pre-condition confirmed)

**public/og-card-preview.html:**
- Standalone self-contained HTML — no src/ or node_modules/ references
- Card sized exactly 1200×630px with `#050505` background
- `#FF4500` accent rule at top-left (80px from edges, 80px wide, 1px tall)
- "Kelly Battistoni" in Playfair Display 700 72px white at (80px, 120px)
- "AI Automations Manager" in Inter 400 28px rgba(255,255,255,0.65) at (80px, 285px)
- "AI Strategy · Process Design · Full-Stack Automation" in Inter 300 18px rgba(255,255,255,0.38) at (80px, 345px)
- "kellybattistoni.github.io" in Inter 300 14px rgba(255,255,255,0.30) at bottom-right with 40px margin
- Google Fonts CDN link embedded for correct rendering when opened in browser
- Note banner with screenshot instructions for user

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | (no files changed — build audit only) | npm run build confirmed exit 0; 522KB bundle documented |
| Task 2 | `68b6843` | feat(07-01): wire useMetaTags hook and populate EN/ES meta strings |
| Task 3 | `ae1624e` | feat(07-01): add OG meta tags + hreflang to index.html; create OG card preview artifact |

## Deviations from Plan

None — plan executed exactly as written.

Task 1 handled per executor note: build confirmed clean, Lighthouse browser audit deferred to user at Task 4 checkpoint (as documented in the task instructions).

## Known Stubs

- `public/og-image.png` — does not exist yet. This file must be created by the user at the Task 4 checkpoint by: opening `public/og-card-preview.html` in Chrome, setting DevTools device dimensions to 1200×630, and taking a screenshot saved as `public/og-image.png`. This is a required artifact before Plan 07-02 can complete.

## Threat Flags

No new threat surface introduced beyond the plan's threat model. OG tags reference a static GitHub Pages URL (no dynamic injection surface). Meta content comes from trusted locale JSON files.

## Task 4: Human Verification Checkpoint

**Status:** BLOCKED — awaiting user action.

The plan requires the user to:
1. Run `npm run dev` and verify `document.title` and `meta[name="description"]` update on EN/ES toggle
2. Review and optionally refine meta copy in locale JSON files
3. REQUIRED: Screenshot `public/og-card-preview.html` at 1200×630px and save as `public/og-image.png`
4. Run Lighthouse mobile audit at `http://localhost:4173` and record baseline scores

## Self-Check: PASSED

- `src/hooks/useMetaTags.ts` exists and exports `useMetaTags`
- `public/og-card-preview.html` exists
- Commit `68b6843` exists in git log
- Commit `ae1624e` exists in git log
- TypeScript clean (tsc -b --noEmit exit 0)
- index.html contains 8 OG tags and 3 hreflang elements
