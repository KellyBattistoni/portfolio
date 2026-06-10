# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-09)

**Core value:** A visitor leaves thinking: "This person doesn't just execute tasks — she sees the full system, adapts faster than anyone, and always thinks ahead on the business."
**Current focus:** Phase 3 — Scroll Infrastructure

## Current Position

Phase: 3 of 8 (Scroll Infrastructure) — In progress
Plan: 1 of 3 in Phase 3 — complete; next: 03-02 RevealSection
Status: Plan 03-01 complete — GSAP installed, ScrollProvider + scrollStore shipped, build + lint green
Last activity: 2026-06-10 — Plan 03-01 executed and committed (5e562f4, ade6220)

Progress: [███░░░░░░░] 29% (7 of ~24 expected plans)

## Phase Status

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Scaffold + Safety Rails | Complete ✓ | 3/3 |
| 2 | i18n Backbone | Complete ✓ | 3/3 |
| 3 | Scroll Infrastructure | In progress | 1/3 |
| 4 | Visual Foundations — Plasma + Noise | Pending | TBD |
| 5 | Hero + PillNav — First Vertical Slice | Pending | TBD |
| 6 | Content Sections | Pending | TBD |
| 7 | Polish & Performance | Pending | TBD |
| 8 | Deployment | Pending | TBD |

## Active Work

Phase 3 in progress. Plan 03-01 (Scroll Foundation) complete: GSAP 3.15 + @gsap/react 2.1 installed and centrally registered at `src/lib/gsap.ts`; `ScrollProvider` ships a ref-based external store (`scrollStore`) with rAF-coalesced passive scroll listener — zero React state on the scroll path. Build + lint green. Next: 03-02 RevealSection (GSAP ScrollTrigger reveal wrapper).

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: ~12 min
- Total execution time: ~85 min

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-scaffold-safety-rails | 01 | ~18 min | 2 | 15 |
| 01-scaffold-safety-rails | 02 | ~25 min | 2 | 7 |
| 01-scaffold-safety-rails | 03 | ~20 min | 1 | 2 |
| 02-i18n-backbone | 01 | ~12 min | 3 | 16 |
| 02-i18n-backbone | 02 | ~3 min | 3 | 3 |
| 02-i18n-backbone | 03 | ~5 min | 2 | 3 |
| 03-scroll-infrastructure | 01 | 2 min | 2 | 4 |

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
- [02-02] Hook uses useTranslation() not direct import of @/lib/i18n — keeps hook composable and React-context-aware
- [02-02] LanguageSwitcher reads i18n.resolvedLanguage in active comparison + handleChange guard — never raw i18n.language
- [02-02] handleChange short-circuits if lng === current — avoids redundant changeLanguage calls / re-renders
- [02-02] Switcher hard-codes fixed top-right positioning — Phase 5 strips classes when moving into PillNav (no className prop now)
- [02-02] Accent color #FF4500 inline (after:bg-[#FF4500]) — explicit per CONTEXT.md, not yet hooked to CSS variable token
- [02-02] LanguageSwitcher wrapped in its OWN AnimationErrorBoundary in App.tsx — isolated crash domain from animation root
- [02-02] Demo hero uses inline styles intentionally — throwaway code, Phase 5 replaces the whole <main> with the real Hero component
- [02-03] Phase 2 closure gated by human browser verification (not just automated checks) — i18n correctness lives in the visible UX
- [02-03] User typed "approved" confirming all 4 ROADMAP Phase 2 success criteria PASS — phase marked Complete
- [03-01] Register `ScrollTrigger` AND `useGSAP` in one `gsap.registerPlugin()` call at module level — registering the hook prevents production tree-shaking from dropping it
- [03-01] All GSAP imports across codebase come from `@/lib/gsap` (never `'gsap'` directly) — single registration point, prevents double-registration when code-splitting
- [03-01] Module-level mutable `let scrollY` / `let scrollProgress` instead of `useState` — at 60fps with N consumers, useState-based scroll storage produces ~N × 60 reconciliation cycles per second
- [03-01] `scrollStore` exposes `subscribe()` / `getSnapshot()` / `getRef()` — pub/sub external store consumable by both `useSyncExternalStore` and GSAP ticker hot paths
- [03-01] Snapshot object reallocated per rAF tick — satisfies `useSyncExternalStore` reference-equality contract while staying cheap
- [03-01] `getSnapshot()` and `getRef()` identical today but kept as distinct APIs — `getRef()` signals "GSAP ticker hot path, no React subscription" to readers
- [03-01] rAF coalescing via cancel-and-reschedule (not first-wins) — guarantees the rAF callback always reads the latest scroll position, never stale from earlier in the burst
- [03-01] `window.addEventListener('scroll', onScroll, { passive: true })` — unlocks browser scroll-path optimization, no `preventDefault` ever called
- [03-01] Scroll values initialized on `ScrollProvider` mount (not just at first scroll event) — consumers mounting at non-zero scroll see correct values immediately
- [03-01] `scrollProgress` clamped to `[0, 1]` inside `computeProgress()` — iOS / trackpad overscroll can push `window.scrollY` past max or below 0
- [03-01] `useScrollContext()` throws with file-path hint ("Wrap your app root with <ScrollProvider> in src/main.tsx or App.tsx") — surfaces misconfiguration loudly
- [03-01] `ScrollProvider` not yet mounted in App.tsx — deferred to 03-03 test harness, the first consumer that actually needs the provider in the tree

### Resolved Blockers

- TypeScript chosen (TS, not JSX-only) — confirmed via scaffold choice in 01-01
- Both CV PDFs confirmed present in repo root — will copy to `public/` in Phase 6

### Remaining Open Questions

- ~~framer-motion vs motion package name (verify at install in Phase 3)~~ — resolved 03-01: project uses GSAP 3.15 + @gsap/react 2.1, not framer-motion
- ParallaxCard API shape (single-speed vs multi-layer `layers[]`) — 03-03 decision
- `ScrollTrigger.refresh()` on `document.fonts.ready` — verify in 03-02 / 03-03 whether Playfair Display font load causes ScrollTrigger to miscalculate positions
- Whether to fold ScrollProvider's rAF loop into GSAP's ticker (single-loop architecture) — only if 03-03 observes tearing
- Number of NDA-safe case studies ready (target 3–4 deep) — needed before Phase 6
- Primary CTA framing: clients vs jobs — needed before Phase 5
- Plasma GLSL shader source — port from inspo or author fresh — needed before Phase 4

## Session Continuity

Last session: 2026-06-10
Stopped at: Plan 03-01 complete — GSAP 3.15 + @gsap/react 2.1 installed; `src/lib/gsap.ts` registers ScrollTrigger + useGSAP at module level; `src/context/ScrollContext.tsx` ships ScrollProvider + scrollStore (ref-based external store, rAF-coalesced passive listener, zero React state on scroll path). Build + lint green. Commits: 5e562f4 (Task 1), ade6220 (Task 2).
Resume: execute Plan 03-02 (RevealSection — GSAP ScrollTrigger reveal wrapper with fade-up / slide-from-left / scale-up variants, `start: "top 85%"`, `once: true`, 120ms stagger, `gsap.matchMedia()` for reduced-motion).
