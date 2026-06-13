---
phase: 05-hero-pillnav-first-vertical-slice
plan: "01"
subsystem: i18n
tags: [i18next, react-i18next, locales, typing]

# Dependency graph
requires:
  - phase: 02-i18n-backbone
    provides: i18next config, typed t() via typeof resources, LanguageSwitcher v1 (fixed-positioned)
provides:
  - Phase 5 hero copy in EN+ES (locked tagline + CTA)
  - Primary navigation labels (about, work, stack, contact + ariaLabel) in EN+ES
  - Position-neutral LanguageSwitcher accepting an optional className prop
  - TypeScript inference for t('nav.*') via typeof resources (no manual d.ts edits)
affects: [05-02, 05-03, 05-04, 06-content-sections]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Locale JSONs as the source of truth — adding keys auto-types t() via typeof resources
    - className-as-prop for shared UI primitives — caller owns positioning, child owns internals

key-files:
  created: []
  modified:
    - src/locales/en/hero.json
    - src/locales/es/hero.json
    - src/locales/en/common.json
    - src/locales/es/common.json
    - src/components/i18n/LanguageSwitcher.tsx

key-decisions:
  - "Locked hero tagline EN: 'I automate what holds people back.' / ES: 'Automatizo lo que le frena a la gente.'"
  - "Locked primary CTA EN: 'See my work' / ES: 'Ver mi trabajo'"
  - "Nav labels EN: About/Work/Stack/Contact, ES: Sobre mí/Trabajo/Stack/Contacto (Stack untranslated as brand term)"
  - "LanguageSwitcher default className stays 'flex gap-4' for standalone, but caller-provided className fully replaces (no Tailwind conflict)"
  - "No manual @types/i18next.d.ts edits — typeof resources + as const on locale imports auto-types nav.* keys"

patterns-established:
  - "Position-neutral components via optional className prop with default fallback"
  - "Lock copy decisions in the locale JSON as the contract — consumers in later plans never duplicate strings"

# Metrics
duration: ~2min
completed: 2026-06-13
---

# Phase 5 Plan 01: i18n Updates + LanguageSwitcher Refactor Summary

**Phase 5 copy locked into locale JSONs (hero tagline, CTA, nav labels in EN/ES) and LanguageSwitcher made position-neutral via a className prop — clean foundation for the Wave 2 Hero and Nav plans.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-13T03:43:39Z
- **Completed:** 2026-06-13T03:45:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Phase 5 EN/ES hero copy committed to `hero.json` (locked tagline + CTA strings)
- Primary nav labels added to `common.json` for both locales under a `nav` block (ariaLabel, about, work, stack, contact)
- `LanguageSwitcher` refactored to accept an optional `className` prop; hardcoded `fixed top-6 right-6 z-50` removed — switcher can now be composed inside PillNav and MobileNav without leaking positioning
- TypeScript inference picks up the new `nav.*` keys automatically via `typeof resources` — zero d.ts edits required
- `npm run build` and `npm run lint` both green after each task

## Task Commits

Each task was committed atomically:

1. **Task 1: Update locale JSONs with Phase 5 strings** — `f8f014a` (feat)
2. **Task 2: Add className prop to LanguageSwitcher — remove hardcoded fixed position** — `4853c2f` (refactor)

## Files Created/Modified

- `src/locales/en/hero.json` — replaced tagline + CTA with Phase 5 locked copy
- `src/locales/es/hero.json` — replaced tagline + CTA with Phase 5 locked copy
- `src/locales/en/common.json` — added `nav` block (ariaLabel/about/work/stack/contact)
- `src/locales/es/common.json` — added `nav` block (ariaLabel/about/work/stack/contact)
- `src/components/i18n/LanguageSwitcher.tsx` — added optional `className?: string` prop; root div uses `clsx(className ?? 'flex gap-4')`; updated doc-comment to describe position-neutral contract

## Decisions Made

- **Default className stays `flex gap-4`** rather than empty string — backward-compatible with the standalone `<LanguageSwitcher />` usage still present in `App.tsx` (which Plan 04 will remove)
- **Caller-provided className fully replaces the default** (using `??` not concatenation) — avoids Tailwind class conflicts when PillNav/MobileNav want a different layout
- **No @types/i18next.d.ts changes** — the existing `resources: (typeof resources)['en']` augmentation flows through `as const` on the JSON imports, so new keys auto-type

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build and lint both passed cleanly after each task. CRLF/LF warnings from Git on Windows are expected and benign on this repo.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Wave 2 (Plans 02 + 03) unblocked.** The Hero plan can now consume `t('cta')` and `t('heading.tagline')` from the locked locale JSONs. The PillNav + MobileNav plan can compose `<LanguageSwitcher className="..." />` and consume `t('common:nav.*')` for nav labels.
- **No outstanding blockers.** TypeScript fully recognizes the new keys (`t('nav.about')`, `t('cta')`) — verified via successful `tsc -b`.
- Plan 04 (mount + cleanup) will later remove the standalone `<LanguageSwitcher />` from `App.tsx` and replace it with composition inside PillNav/MobileNav.

## Self-Check: PASSED

- Files: all 5 modified files present on disk
- Commits: both `f8f014a` and `4853c2f` present in git log

---
*Phase: 05-hero-pillnav-first-vertical-slice*
*Completed: 2026-06-13*
