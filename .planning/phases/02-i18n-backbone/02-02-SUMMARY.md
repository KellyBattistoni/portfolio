---
phase: 02-i18n-backbone
plan: "02"
subsystem: i18n
tags: [react-i18next, language-switcher, hook, tailwind, aria, accessibility, document-lang]

# Dependency graph
requires:
  - phase: 02-i18n-backbone
    plan: "01"
    provides: "i18n singleton with EN/ES bundled resources, common.switcher keys, hero namespace"
  - phase: 01-scaffold-safety-rails
    plan: "02"
    provides: "AnimationErrorBoundary component"
  - phase: 01-scaffold-safety-rails
    plan: "01"
    provides: "Tailwind v4 + clsx + @/* path aliases"
provides:
  - "LanguageSwitcher component (underline-tabs EN/ES, aria-pressed semantics, sliding accent underline)"
  - "useLocalizeDocumentAttributes hook syncing <html lang> with i18n.resolvedLanguage"
  - "App.tsx wired with hook + switcher (wrapped in its own AnimationErrorBoundary) + demo hero strings via useTranslation('hero')"
  - "End-to-end proof: toggling EN/ES re-renders title/tagline/CTA, persists kbv-lang, updates <html lang>"
affects: [05-hero-pillnav, 06-content-sections]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hook decoupled from i18n singleton — uses useTranslation()-returned i18n instance"
    - "LanguageSwitcher reads i18n.resolvedLanguage (post-fallback canonical) — handles es-AR → es"
    - "void prefix on i18n.changeLanguage to silence no-floating-promises"
    - "Tailwind after:scale-x with origin-left for sliding-underline transition (no JS animation)"
    - "Separate AnimationErrorBoundary instance per animation surface — isolated crash domains"

key-files:
  created:
    - "src/hooks/useLocalizeDocumentAttributes.ts"
    - "src/components/i18n/LanguageSwitcher.tsx"
  modified:
    - "src/App.tsx"

key-decisions:
  - "[02-02] Hook uses useTranslation() not direct import of @/lib/i18n — keeps hook composable and React-context-aware"
  - "[02-02] LanguageSwitcher reads i18n.resolvedLanguage everywhere (active comparison + handleChange guard) — never raw i18n.language"
  - "[02-02] handleChange short-circuits if lng === current — avoids redundant changeLanguage calls"
  - "[02-02] Switcher hard-codes fixed top-right positioning — Phase 5 strips these classes when moving into PillNav (no className prop now)"
  - "[02-02] Accent color #FF4500 inline (after:bg-[#FF4500]) — explicit per CONTEXT.md, not yet hooked to CSS variable token"
  - "[02-02] LanguageSwitcher wrapped in its OWN AnimationErrorBoundary in App.tsx — separate from the animation root boundary, so a switcher crash cannot blank the plasma layer"
  - "[02-02] Demo hero uses inline styles (no Tailwind) — intentional throwaway code; Phase 5 replaces this whole <main> with the real Hero component"

# Metrics
duration: ~3 min
started: 2026-06-10T05:11:30Z
completed: 2026-06-10T05:13:52Z
---

# Phase 2 Plan 02: Translation Hooks + LanguageSwitcher Summary

**LanguageSwitcher (EN/ES underline tabs with aria-pressed) and useLocalizeDocumentAttributes hook wired into App.tsx — first observable end-to-end proof that the i18n backbone re-renders strings, persists language, and syncs `<html lang>`.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-10T05:11:30Z
- **Completed:** 2026-06-10T05:13:52Z
- **Tasks:** 3
- **Files modified:** 3 (2 created + 1 modified)

## Accomplishments

- Created `src/hooks/useLocalizeDocumentAttributes.ts` — a one-purpose hook that writes `i18n.resolvedLanguage` into `document.documentElement.lang` on mount and on every language change
- Created `src/components/i18n/LanguageSwitcher.tsx` — two underline-tab buttons inside a `role="group"` wrapper, `aria-pressed` active state, sliding-underline via Tailwind `after:scale-x` transitions, `void i18n.changeLanguage` to satisfy no-floating-promises
- Modified `src/App.tsx` — called the hook at the top of `App()`, mounted `<LanguageSwitcher />` inside its OWN `<AnimationErrorBoundary>` (separate instance from the animation root), and replaced the hard-coded `<h1>Kelly Battistoni</h1>` with three `t()` calls (`heading.title`, `heading.tagline`, `cta`) from the `'hero'` namespace
- Build, typecheck, and lint all clean — production bundle: 252.92 kB / 80.27 kB gzip (up from 246.61/77.93 in Plan 02-01, +6 kB JS for the new component + hook + clsx + extra t() callsites)

## Task Commits

Each task was committed atomically:

1. **Task 1: useLocalizeDocumentAttributes hook** — `bed4ba2` (feat)
2. **Task 2: LanguageSwitcher component** — `fbb9e10` (feat)
3. **Task 3: Wire App.tsx with hook + switcher + hero strings** — `12d3333` (feat)

## Files Created/Modified

### Created (2)

- `src/hooks/useLocalizeDocumentAttributes.ts` (24 lines) — `useEffect` keyed on `i18n.resolvedLanguage`; writes to `document.documentElement.lang`. No SSR guard (Vite CSR-only build, `document` always defined). Return type explicitly `void`.
- `src/components/i18n/LanguageSwitcher.tsx` (59 lines) — `useTranslation('common')` for `switcher.ariaLabel`/`switcher.en`/`switcher.es`. Two `<button type="button">` inside `<div role="group">`. Active state via `aria-pressed={isActive}` + `after:scale-x-100`; inactive via `after:scale-x-0`. Underline color `#FF4500` (Phase 1 brand accent). Positioning hard-coded `fixed top-6 right-6 z-50`.

### Modified (1)

- `src/App.tsx` — Added 3 imports (`useTranslation` from `react-i18next`, `LanguageSwitcher`, `useLocalizeDocumentAttributes`). Called `useLocalizeDocumentAttributes()` as first line of `App()` body. Added second `<AnimationErrorBoundary>` wrapping `<LanguageSwitcher />`. Replaced hard-coded h1 text with `t('heading.title')`, added `<p>{t('heading.tagline')}</p>`, added `<button>{t('cta')}</button>` (demo only, no onClick).

## Decisions Made

Followed the plan's RESEARCH.md decisions exactly. No deviation.

- **`void i18n.changeLanguage` confirmed** — grep finds 1 match in `LanguageSwitcher.tsx`. ESLint clean — no `no-floating-promises` error.
- **`i18n.resolvedLanguage` used in BOTH hook and switcher** — grep finds 5 matches in `useLocalizeDocumentAttributes.ts` (description + 2 in effect + dep array text) and 1 match in `LanguageSwitcher.tsx` (active-state read). Zero matches for raw `i18n.language` in either file.
- **`<AnimationErrorBoundary>` wraps `<LanguageSwitcher>` separately from the animation root** — `App.tsx` contains 5 `AnimationErrorBoundary` references (1 import, 2 opening tags, 2 closing tags). The two boundary instances are independent: a switcher animation crash cannot take down the plasma root, and vice versa.
- **Hook decoupled from singleton** — `useLocalizeDocumentAttributes` calls `useTranslation()` (no namespace argument needed; we only need the `i18n` instance), not a direct `import i18n from '@/lib/i18n'`. This matches the same pattern used in `LanguageSwitcher`, keeps the hook composable, and respects React-context boundaries.
- **`handleChange` early-returns when `lng === current`** — avoids redundant `i18n.changeLanguage` calls (which would still fire the `languageChanged` event and trigger an unnecessary re-render of every `useTranslation` subscriber).
- **`useTranslation('common')` in the switcher** — picks up `switcher.ariaLabel`, `switcher.en`, `switcher.es` from `common.json` (defined in Plan 02-01). Both EN and ES `common.json` ship `switcher.en: "EN"` and `switcher.es: "ES"` because language code labels do not need translation; only the wrapper `ariaLabel` differs.

## Deviations from Plan

None — plan executed exactly as written.

All 3 tasks ran without triggering any deviation rule (no bugs found, no missing critical functionality, no blocking issues, no architectural changes needed). The plan's source code blocks were copy-paste-correct.

### Demo hero styling

Used the inline styles exactly as specified in the plan, with no adjustments. The `<h1>` padding was changed from `'2rem'` (current production) to `'2rem 2rem 0'` per the plan, so the new tagline `<p>` sits flush below it. The CTA button has `margin: '2rem'` to provide breathing room. No deviation from the planned shape.

## Issues Encountered

None.

Pre-existing uncommitted changes from Phase 1 cleanup (`src/components/error/AnimationErrorBoundary.tsx` and `src/hooks/useDeviceCapabilities.ts` — CRLF/Prettier reformats; `src/index.css` deletion) were left untouched. Staged only the three files this plan modifies.

## Verification Results

### Per-task

- Task 1 — `npx tsc -b --noEmit` exits 0; `npm run lint` exits 0; grep finds `i18n.resolvedLanguage` (5 matches) and `documentElement.lang` (2 matches) in the hook.
- Task 2 — `npx tsc -b --noEmit` exits 0; `npm run lint` exits 0; grep finds `void i18n.changeLanguage` (1), `aria-pressed` (2), `i18n.resolvedLanguage` (1) in the switcher.
- Task 3 — `npx tsc -b --noEmit` exits 0; `npm run lint` exits 0; `npm run build` exits 0 (252.92 kB JS / 80.27 kB gzip, 64 modules); grep confirms hook import + call (2), `AnimationErrorBoundary` references (5), `LanguageSwitcher` import + JSX (2), all three `t()` calls (`heading.title`, `heading.tagline`, `cta`), `useTranslation('hero')` (1).

### Overall

- `npm run build` exits 0 — bundle: 252.92 kB JS / 80.27 kB gzip; CSS 35.82 kB / 7.05 kB gzip
- `npx tsc -b --noEmit` exits 0 — no output
- `npm run lint` exits 0 — no output (no floating promises, no rules-of-hooks errors, no `react-hooks/exhaustive-deps` warning since the effect deps are correctly listed)

### Manual browser sanity check

Not performed during this autonomous execution — Plan 02-03 is the human-verify checkpoint plan. Build + lint + typecheck all green is sufficient gate to ship Plan 02-02. The dev-server verification is owned by 02-03.

## User Setup Required

None — no external service or browser configuration required. The i18n backbone is fully bundled. The dev server can be started with `npm run dev` and the switcher will be operational immediately.

## Next Plan Readiness

- Plan 02-03 (verification + cleanup) can run the manual browser checks called out in Plan 02-02 Task 3 (English/Spanish auto-detect, click-to-switch, `kbv-lang` localStorage write, `<html lang>` update).
- Phase 5 (Hero + PillNav) can import `LanguageSwitcher` directly into PillNav once the nav component exists — the only required change is removing the `fixed top-6 right-6 z-50` Tailwind classes. The internal behavior (aria-pressed, sliding underline, `void i18n.changeLanguage`) needs zero changes.
- The demo `<main>` in `App.tsx` is throwaway — Phase 5 replaces it wholesale with the real Hero component. No refactoring needed in the meantime.

## Self-Check: PASSED

Verified all claimed files exist and all commits are in git history:

- FOUND: src/hooks/useLocalizeDocumentAttributes.ts
- FOUND: src/components/i18n/LanguageSwitcher.tsx
- FOUND: src/App.tsx (modified)
- FOUND: commit bed4ba2 (Task 1)
- FOUND: commit fbb9e10 (Task 2)
- FOUND: commit 12d3333 (Task 3)

---

*Phase: 02-i18n-backbone*
*Completed: 2026-06-10*
