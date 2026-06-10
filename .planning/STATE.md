# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-09)

**Core value:** A visitor leaves thinking: "This person doesn't just execute tasks — she sees the full system, adapts faster than anyone, and always thinks ahead on the business."
**Current focus:** Phase 2 — i18n Backbone

## Current Position

Phase: 2 of 8 (i18n Backbone) — In progress
Plan: 1 of 3 in Phase 2 — Complete ✓
Status: Plan 02-01 complete (i18n backbone init shipped) — ready for Plan 02-02
Last activity: 2026-06-10 — Plan 02-01 executed and self-checked

Progress: [█░░░░░░░░░] 16% (4 of ~24 expected plans)

## Phase Status

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Scaffold + Safety Rails | Complete ✓ | 3/3 |
| 2 | i18n Backbone | In progress | 1/3 |
| 3 | Scroll Infrastructure | Pending | TBD |
| 4 | Visual Foundations — Plasma + Noise | Pending | TBD |
| 5 | Hero + PillNav — First Vertical Slice | Pending | TBD |
| 6 | Content Sections | Pending | TBD |
| 7 | Polish & Performance | Pending | TBD |
| 8 | Deployment | Pending | TBD |

## Active Work

Phase 2 in progress. Plan 02-01 (i18n init backbone) complete. Next: Plan 02-02 (translation hooks + first localized component) per `.planning/phases/02-i18n-backbone/02-02-PLAN.md`.

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: ~19 min
- Total execution time: ~75 min

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-scaffold-safety-rails | 01 | ~18 min | 2 | 15 |
| 01-scaffold-safety-rails | 02 | ~25 min | 2 | 7 |
| 01-scaffold-safety-rails | 03 | ~20 min | 1 | 2 |
| 02-i18n-backbone | 01 | ~12 min | 3 | 16 |

## Accumulated Context

### Decisions

- React + Vite over Next.js (no SSR needed; simpler GH Pages deploy)
- Plasma only on hero, unmount on scroll past (not opacity fade) to stop rAF loop
- PillNav hidden during hero, appears on scroll
- EN/ES wired before any section component (no retrofit)
- Root GitHub Pages repo `KellyBattistoni.github.io` (no `/portfolio` subpath)
- [01-01] `ignoreDeprecations: "6.0"` in tsconfig.app.json — silences TS 6.0 deprecation of `baseUrl` while keeping `@/*` paths working
- [01-01] `jiti` devDep installed — required by ESLint v10 to load `eslint.config.ts`
- [01-01] ESLint config in TypeScript (`eslint.config.ts`) not JavaScript — required removing scaffold's `eslint.config.js`
- [01-02] SVG `feTurbulence` data URI used for noise texture — no binary PNG asset, deterministic, commits cleanly
- [01-02] `react-error-boundary` v6 types `error` as `unknown` — `instanceof Error` guard required in both `FallbackProps` and `onError` callback
- [01-02] `AnimationFallback` renders brand-gradient div only — no visible text, indistinguishable from Plasma placeholder
- [01-03] `useState(getInitialCapabilities)` lazy initializer — synchronous first render, no flash of wrong state
- [01-03] `isLowEnd` and `supportsWebGL2` sampled once on mount only — hardware doesn't change at runtime
- [02-01] i18next bundled static JSON resources (no http-backend, no `<I18nextProvider>`) — single config module at `@/lib/i18n`
- [02-01] localStorage key locked as `kbv-lang` — brand-scoped, no collision
- [02-01] `caches: ['localStorage']` paired with `lookupLocalStorage` — without the pair the key is read but never written
- [02-01] `nonExplicitSupportedLngs: true` — `es-AR`/`es-MX`/`es-419` all resolve to `es`
- [02-01] `parseMissingKeyHandler` returns `'ns:key'` — missing keys render as visible path in dev
- [02-01] CustomTypeOptions augments `'i18next'` (NOT `'react-i18next'`) — `t()` lives on i18next core
- [02-01] `as const` mandatory on both `resources` and `defaultNS` — without it typed `t()` collapses to `(key: string) => string`
- [02-01] `useSuspense: false` — resources are sync-bundled, no Suspense boundary needed
- [02-01] `meta.title`/`meta.description` shipped as empty strings — keys defined now, copy in Phase 7
- [02-01] About/projects/stack/contact namespaces ship `_placeholder` stub — keeps namespace registered + ts-augmented until Phase 3 fills

### Resolved Blockers

- TypeScript chosen (TS, not JSX-only) — confirmed via scaffold choice in 01-01
- Both CV PDFs confirmed present in repo root — will copy to `public/` in Phase 6

### Remaining Open Questions

- framer-motion vs motion package name (verify at install in Phase 3)
- Number of NDA-safe case studies ready (target 3–4 deep) — needed before Phase 6
- Primary CTA framing: clients vs jobs — needed before Phase 5
- Plasma GLSL shader source — port from inspo or author fresh — needed before Phase 4

## Session Continuity

Last session: 2026-06-10
Stopped at: Plan 02-01 complete — i18n backbone (3 packages + 12 JSON files + init module + types + main wiring) shipped, build/typecheck/lint all clean.
Resume: continue Phase 2 with Plan 02-02 (`.planning/phases/02-i18n-backbone/02-02-PLAN.md`)
