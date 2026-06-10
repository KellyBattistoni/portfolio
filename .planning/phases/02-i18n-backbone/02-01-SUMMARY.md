---
phase: 02-i18n-backbone
plan: "01"
subsystem: i18n
tags: [i18next, react-i18next, language-detector, localStorage, typescript, json-resources]

# Dependency graph
requires:
  - phase: 01-scaffold-safety-rails
    provides: "Vite + React 19 + TS config with @/* path aliases, src/main.tsx entrypoint"
provides:
  - "i18n singleton at @/lib/i18n with EN+ES bundled resources, no network fetch"
  - "12 namespace JSON files (common, hero, about, projects, stack, contact x 2 locales)"
  - "kbv-lang localStorage cache pair (lookupLocalStorage + caches: ['localStorage'])"
  - "nonExplicitSupportedLngs — es-AR / es-MX / es-419 all resolve to es"
  - "CustomTypeOptions module augmentation on 'i18next' for typed t() keys"
  - "parseMissingKeyHandler that renders ns:key path so misses are visible in dev"
  - "main.tsx side-effect import — i18n.init() runs before any component subscribes"
affects: [05-hero-pillnav, 06-content-sections, 07-polish-performance, language-switcher]

# Tech tracking
tech-stack:
  added:
    - "i18next@26.3.1 (runtime dep)"
    - "react-i18next@17.0.8 (runtime dep)"
    - "i18next-browser-languagedetector@8.2.1 (runtime dep)"
  patterns:
    - "Static bundled resources via JSON imports — no http-backend, no <I18nextProvider>"
    - "Single i18n config module at @/lib/i18n/index.ts (source of truth)"
    - "Module augmentation on 'i18next' (not 'react-i18next') for typed keys"
    - "as const on resources + defaultNS for proper key inference"
    - "void prefix on chained .init() to silence no-floating-promises"

key-files:
  created:
    - "src/lib/i18n/index.ts"
    - "src/@types/i18next.d.ts"
    - "src/locales/en/{common,hero,about,projects,stack,contact}.json"
    - "src/locales/es/{common,hero,about,projects,stack,contact}.json"
  modified:
    - "src/main.tsx (added side-effect import of @/lib/i18n above App)"
    - "package.json (added 3 runtime deps)"

key-decisions:
  - "[02-01] localStorage key locked as 'kbv-lang' — brand-scoped, no collision with other apps"
  - "[02-01] detection order: localStorage first, navigator second — user override always wins"
  - "[02-01] caches: ['localStorage'] paired with lookupLocalStorage — without it the key is read but never written"
  - "[02-01] nonExplicitSupportedLngs: true — es-AR/es-MX/es-419 resolve to es"
  - "[02-01] parseMissingKeyHandler returns 'ns:key' string — misses render as visible path, not blank or English fallback"
  - "[02-01] returnNull: false — null keys never reach JSX (React 19 still tolerates them, but typed t() now narrows to string)"
  - "[02-01] useSuspense: false — bundled resources are sync-ready, no Suspense boundary needed"
  - "[02-01] meta.title/description shipped as empty strings — keys defined now (no missing-key noise), copy populated in Phase 7"

patterns-established:
  - "Locale JSON layout: src/locales/{en,es}/{namespace}.json, camelCase keys, shallow nesting"
  - "Namespace files for unused sections ship a single _placeholder string — keeps namespace registered + ts-augmented"
  - "Side-effect import for init in main.tsx, ABOVE App import — prevents flash-of-missing-key"
  - "Future translation reads use useTranslation('namespace') + t('group.key'), never raw i18n.t with full ns:key string"

# Metrics
duration: ~12 min
started: 2026-06-10T04:57:00Z
completed: 2026-06-10T05:08:50Z
---

# Phase 2 Plan 01: i18n Backbone Init Summary

**i18next singleton with bundled EN/ES JSON resources, kbv-lang localStorage persistence, typed t() via CustomTypeOptions augmentation, wired ABOVE App import in main.tsx.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-10T04:57:00Z
- **Completed:** 2026-06-10T05:08:50Z
- **Tasks:** 3
- **Files modified:** 16 (14 created + 2 modified)

## Accomplishments

- Installed `i18next@26.3.1`, `react-i18next@17.0.8`, `i18next-browser-languagedetector@8.2.1` as runtime deps with zero peer warnings
- Created all 12 namespace JSON files (common/hero/about/projects/stack/contact x EN+ES) — Hero + common ship real content, the other 4 ship `_placeholder` stubs for Phase 3+
- Built `src/lib/i18n/index.ts` — the single i18n config source — with LanguageDetector + initReactI18next plugin chain, bundled resources, kbv-lang cache pair, `nonExplicitSupportedLngs`, visible missing-key handler, and `useSuspense: false`
- Declared `src/@types/i18next.d.ts` augmenting `'i18next'` (not `'react-i18next'`) — `t()` now has typed key suggestions
- Wired `import '@/lib/i18n'` as a side-effect in `src/main.tsx` on a line ABOVE the App import — guarantees `i18n.init()` completes before any subscriber mounts

## Task Commits

Each task was committed atomically:

1. **Task 1: Install i18n runtime dependencies** — `6afe88b` (chore)
2. **Task 2: Create 12 namespace JSON files** — `5cece8f` (feat)
3. **Task 3: i18n init module + types augmentation + main.tsx wiring** — `824d28c` (feat)

## Files Created/Modified

### Created (14)
- `src/lib/i18n/index.ts` — i18next config singleton; the source of truth for plugin chain, resources, detection, missing-key handling
- `src/@types/i18next.d.ts` — `declare module 'i18next' { interface CustomTypeOptions }` for typed `t()` keys
- `src/locales/en/common.json` (147 B) — switcher labels (ariaLabel/en/es), meta.title/description stubs
- `src/locales/en/hero.json` (167 B) — heading.title, heading.tagline, cta
- `src/locales/en/about.json` (63 B) — `_placeholder` stub
- `src/locales/en/projects.json` (106 B) — `_placeholder` with hint for Phase 3 structure
- `src/locales/en/stack.json` (63 B) — `_placeholder` stub
- `src/locales/en/contact.json` (65 B) — `_placeholder` stub
- `src/locales/es/common.json` (149 B) — Spanish equivalents
- `src/locales/es/hero.json` (196 B) — Spanish hero strings
- `src/locales/es/about.json` (71 B) — `_placeholder` stub (Spanish wording)
- `src/locales/es/projects.json` (106 B) — `_placeholder` with hint
- `src/locales/es/stack.json` (71 B) — `_placeholder` stub
- `src/locales/es/contact.json` (73 B) — `_placeholder` stub

### Modified (2)
- `src/main.tsx` — added `import '@/lib/i18n'` between styles import and App import (line 4 of 5)
- `package.json` — added 3 runtime deps under `dependencies` (i18next, react-i18next, i18next-browser-languagedetector)

## Decisions Made

Followed the plan's RESEARCH.md decisions exactly. No deviation. Key locked configuration:

- **`as const` confirmed on both `resources` and `defaultNS`** — grep finds 2 matches in `src/lib/i18n/index.ts`. Without this, `CustomTypeOptions['resources']` narrows to `{}` and `t()` becomes `(key: string) => string`.
- **`caches: ['localStorage']` + `lookupLocalStorage: 'kbv-lang'` pair confirmed** — both present in the `detection` block. The pair is mandatory: `lookupLocalStorage` alone only READS, the `caches` array enables WRITE-back so `i18n.changeLanguage('es')` persists.
- **Module augmentation targets `'i18next'`, NOT `'react-i18next'`** — `t()` lives on i18next core; augmenting react-i18next does nothing for type narrowing.
- **`void` prefix on chained `.init()`** — silences ESLint `no-floating-promises` since init returns a Promise that we don't await.
- **`useSuspense: false`** — resources are sync-bundled, no async load, no need for a Suspense boundary.
- **`returnNull: false` in CustomTypeOptions matches the runtime config** — typed `t()` narrows to `string`, never `string | null`.

## Deviations from Plan

None — plan executed exactly as written.

All 3 tasks ran without triggering any deviation rule (no bugs found, no missing critical functionality, no blocking issues, no architectural changes needed). The plan's RESEARCH.md was thorough enough that no auto-fixes were required.

## Issues Encountered

None. Pre-existing uncommitted changes in `src/App.tsx`, `src/components/error/AnimationErrorBoundary.tsx`, `src/hooks/useDeviceCapabilities.ts`, and `src/index.css` were observed at start of execution — these are CRLF/Prettier reformats and a styles relocation from Phase 1 cleanup, unrelated to this plan. Left them alone (staged files individually, not `git add .`).

## Verification Results

- `npm run build` (tsc -b + vite build) — exits 0, bundle: 246.61 kB / 77.93 kB gzip
- `npx tsc -b --noEmit` — exits 0, no output
- `npm run lint` (eslint src/) — exits 0, no output
- `npm ls i18next react-i18next i18next-browser-languagedetector` — all three at expected versions, no peer warnings
- `node -e "JSON.parse(...)"` on all 12 files — all parse OK
- `grep "@/lib/i18n" src/main.tsx` — line 4; App on line 5 → order correct
- `grep "as const" src/lib/i18n/index.ts` — 2 matches (resources + defaultNS)
- `grep "caches: \['localStorage'\]" src/lib/i18n/index.ts` — 1 match
- `grep "lookupLocalStorage: 'kbv-lang'" src/lib/i18n/index.ts` — 1 match
- `grep "CustomTypeOptions" src/@types/i18next.d.ts` — 1 match

## User Setup Required

None — no external service configuration required. All resources are bundled at build time.

## Next Plan Readiness

- Plan 02-02 can `import { useTranslation } from 'react-i18next'`, call `useTranslation('hero')`, and read typed keys via `t('heading.title')` immediately.
- The language switcher (Plan 02-03) can call `i18n.changeLanguage('es')` — persistence to `localStorage.kbv-lang` is already configured.
- Phase 3 sections can fill `about/projects/stack/contact.json` by replacing `_placeholder` keys without any further i18n config changes.

## Self-Check: PASSED

Verified all claimed files exist and all commits are in git history:

- FOUND: src/lib/i18n/index.ts
- FOUND: src/@types/i18next.d.ts
- FOUND: src/locales/en/common.json, hero.json, about.json, projects.json, stack.json, contact.json
- FOUND: src/locales/es/common.json, hero.json, about.json, projects.json, stack.json, contact.json
- FOUND: src/main.tsx (modified)
- FOUND: package.json (modified)
- FOUND: commit 6afe88b (Task 1)
- FOUND: commit 5cece8f (Task 2)
- FOUND: commit 824d28c (Task 3)

---

*Phase: 02-i18n-backbone*
*Completed: 2026-06-10*
