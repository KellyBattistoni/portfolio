---
phase: 03-scroll-infrastructure
plan: "01"
subsystem: scroll
tags: [gsap, scrolltrigger, react-context, external-store, raf, useSyncExternalStore]

# Dependency graph
requires:
  - phase: 01-scaffold-safety-rails
    provides: AnimationErrorBoundary, useDeviceCapabilities, @/* path alias
provides:
  - Single GSAP registration point at src/lib/gsap.ts (gsap, ScrollTrigger, useGSAP)
  - ScrollProvider mounting a single passive scroll listener with rAF coalescing
  - scrollStore pub/sub external store (subscribe, getSnapshot, getRef)
  - useScrollContext() guarded consumer hook
  - ScrollSnapshot TypeScript interface for consumer typing
affects:
  - 03-02 RevealSection (will import gsap/ScrollTrigger/useGSAP from @/lib/gsap)
  - 03-03 ParallaxCard + test harness (will read scrollStore.getRef() via GSAP ticker)
  - Phase 4 Plasma unmount (uses useSyncExternalStore + scrollStore for coarse threshold)
  - Phase 5 PillNav visibility (uses useSyncExternalStore + scrollStore for coarse threshold)
  - Phase 6 Content sections (all reveal/parallax animations go through this backbone)

# Tech tracking
tech-stack:
  added:
    - gsap@^3.15.0 (dependency)
    - "@gsap/react@^2.1.2 (dependency)"
  patterns:
    - Centralized GSAP plugin registration at module level
    - Ref-based external store + subscriber set for high-frequency state
    - rAF cancel-and-reschedule coalescing for burst scroll events
    - useSyncExternalStore-compatible snapshot with reference-equality contract

key-files:
  created:
    - src/lib/gsap.ts
    - src/context/ScrollContext.tsx
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "[03-01] Register ScrollTrigger AND useGSAP in one gsap.registerPlugin() call — registering useGSAP prevents tree-shaking from dropping the hook in production builds"
  - "[03-01] Module-level mutable variables (let scrollY, let scrollProgress) instead of useState — scroll values never enter React reconciliation"
  - "[03-01] Single snapshot object reallocated per rAF tick — satisfies useSyncExternalStore reference-equality contract while staying cheap"
  - "[03-01] getSnapshot() and getRef() are identical today but kept as distinct APIs — getRef() signals 'GSAP ticker hot path, no React subscription' to readers"
  - "[03-01] Initialize scrollY/scrollProgress on ScrollProvider mount (not just at first scroll event) — consumers mounting before first scroll see correct values"
  - "[03-01] Clamp scrollProgress to [0, 1] inside computeProgress() — overscroll bounce can push window.scrollY past max on iOS / trackpad"
  - "[03-01] useScrollContext() throws with file path hint ('Wrap your app root with <ScrollProvider> in src/main.tsx or App.tsx') — surfaces misconfiguration loudly"

patterns-established:
  - "GSAP centralization: all components import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap' — never directly from 'gsap'"
  - "Scroll consumption: GSAP-driven components use scrollStore.getRef() inside gsap.ticker; React-rendering components use useSyncExternalStore(scrollStore.subscribe, ...)"
  - "rAF coalescing: cancel pending frame before scheduling new one — guarantees callback reads latest scroll position, never stale"
  - "Passive listeners: window.addEventListener('scroll', handler, { passive: true }) — unlocks browser scroll-path optimization"

# Metrics
duration: 2min
completed: 2026-06-10
---

# Phase 3 Plan 01: Scroll Foundation Summary

**GSAP 3.15 registered once at module level plus a ScrollProvider that exposes scroll position via a ref-based pub/sub store — zero React state on the scroll path.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-10T17:22:14Z
- **Completed:** 2026-06-10T17:24:26Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 2

## Accomplishments

- GSAP 3.15.0 and @gsap/react 2.1.2 installed as runtime dependencies
- `src/lib/gsap.ts` is the single GSAP import point for the codebase — ScrollTrigger and useGSAP both registered in one call at module level
- `src/context/ScrollContext.tsx` ships a ref-based external store (`scrollStore`) with `subscribe()` / `getSnapshot()` / `getRef()` — zero React state on the scroll hot path
- `ScrollProvider` mounts a single passive scroll listener, coalesces burst events via cancel-and-reschedule rAF, and cleans up listener + pending rAF on unmount
- `useScrollContext()` throws a descriptive error when used outside the provider, surfacing misconfiguration loudly during development

## Task Commits

Each task was committed atomically:

1. **Task 1: Install GSAP and create centralized registration module** — `5e562f4` (feat)
2. **Task 2: Create ScrollContext with ref-based external store and rAF coalescing** — `ade6220` (feat)

**Plan metadata commit:** added below after STATE.md update.

## Files Created/Modified

- `src/lib/gsap.ts` (created) — Single GSAP entry point; `gsap.registerPlugin(ScrollTrigger, useGSAP)` at module level; re-exports `{ gsap, ScrollTrigger, useGSAP }`
- `src/context/ScrollContext.tsx` (created) — `ScrollProvider`, `useScrollContext`, `scrollStore`, `ScrollSnapshot` interface; module-level `scrollY` / `scrollProgress` updated via rAF-coalesced passive scroll listener
- `package.json` (modified) — Added `gsap ^3.15.0` and `@gsap/react ^2.1.2` to `dependencies`
- `package-lock.json` (modified) — Lockfile updated for new deps (2 packages added, 0 vulnerabilities)

## Decisions Made

- **Register `useGSAP` alongside `ScrollTrigger` in the same `gsap.registerPlugin()` call.** Per GSAP team guidance — registering the hook prevents production tree-shaking from dropping it. One call, two plugins, done once at module scope.
- **Module-level `let scrollY` / `let scrollProgress` instead of `useState`.** At 60fps with N context consumers, useState-based scroll storage produces ~N × 60 React reconciliation cycles per second. The ref-store pattern removes scroll from React's render path entirely.
- **Snapshot object reallocated per rAF tick (`snapshot = { y, progress }`).** `useSyncExternalStore` requires reference equality to detect "nothing changed" — mutating in place would defeat React's bailout. Allocating a fresh object once per frame is cheap and correctness-preserving.
- **`getSnapshot()` and `getRef()` are intentionally identical.** Both return the current snapshot object. They are kept as distinct APIs so consumer intent is explicit: `getSnapshot()` is what `useSyncExternalStore` calls; `getRef()` signals "I'm in the GSAP ticker hot path, I am not a React subscriber".
- **Initialize scroll values on `ScrollProvider` mount, before the first scroll event.** Consumers mounting at scrollY=300 (e.g., after navigation) get the correct value immediately instead of seeing 0 until the user scrolls.
- **Clamp `scrollProgress` to `[0, 1]` inside `computeProgress`.** iOS / trackpad overscroll can push `window.scrollY` past max and below zero — clamping prevents downstream animations from receiving impossible progress values.
- **`useScrollContext()` throws with a file-path hint.** "Wrap your app root with <ScrollProvider> in src/main.tsx or App.tsx" — turns a class of silent stale-zero bugs into a loud, actionable error.

## Deviations from Plan

None — plan executed exactly as written.

**Note:** Pre-existing modifications to other files (AnimationErrorBoundary.tsx, LanguageSwitcher.tsx, useDeviceCapabilities.ts, i18n/index.ts, deleted index.css, etc.) were present in the working tree at execution start. These are unrelated to plan 03-01 and were deliberately left unstaged so the task commits only contain plan-01 work.

**Total deviations:** 0
**Impact on plan:** None — plan executed as specified.

## Issues Encountered

None.

## Authentication Gates

None — fully autonomous execution.

## User Setup Required

None — no external service configuration required.

## Verification Performed

All verification criteria from the plan PASS:

1. `npm run build` exits 0 — no TypeScript errors introduced (verified twice: after Task 1, after Task 2)
2. `src/lib/gsap.ts` calls `gsap.registerPlugin(ScrollTrigger, useGSAP)` at module top level
3. `src/context/ScrollContext.tsx` has zero `useState` calls (only word match is inside a documentation comment explaining why useState is intentionally avoided)
4. `window.addEventListener('scroll', onScroll, { passive: true })` present at line 166
5. `cancelAnimationFrame(rafRef.current)` called in the `useEffect` cleanup at line 171
6. `npm run lint` exits 0 — no lint issues

## Next Phase Readiness

- Plan 03-02 (RevealSection) is unblocked — can import `gsap`, `ScrollTrigger`, and `useGSAP` from `@/lib/gsap` and respect `prefersReducedMotion` via the existing `useDeviceCapabilities` hook
- Plan 03-03 (ParallaxCard) is unblocked — can read `scrollStore.getRef()` inside `gsap.ticker.add()` for zero-React-state parallax displacement
- `ScrollProvider` is not yet mounted in `App.tsx` — that wiring is intentionally deferred to plan 03-03's test harness step, which will be the first consumer that actually needs the provider in the tree
- Three open questions from research remain valid: ParallaxCard API shape (multi-layer vs single-speed), `ScrollTrigger.refresh()` on font load, and whether to consolidate ScrollProvider's rAF into GSAP's ticker — all are 03-02 / 03-03 concerns, not 03-01

## Self-Check: PASSED

Verification of all claimed artifacts and commits:

**Created files (verified to exist):**
- `src/lib/gsap.ts` — FOUND
- `src/context/ScrollContext.tsx` — FOUND
- `.planning/phases/03-scroll-infrastructure/03-01-SUMMARY.md` — FOUND (this file)

**Commits (verified in git log):**
- `5e562f4` — FOUND (`feat(03-01): install GSAP and create centralized registration module`)
- `ade6220` — FOUND (`feat(03-01): add ScrollContext with ref-based external store and rAF coalescing`)

**Verification commands replayed successfully:**
- `npm run build` exits 0
- `npm run lint` exits 0
- `grep -n "registerPlugin" src/lib/gsap.ts` → line 22
- `grep -n "passive: true" src/context/ScrollContext.tsx` → line 166
- `grep -n "cancelAnimationFrame" src/context/ScrollContext.tsx` → lines 151, 171
- `grep -c "useState" src/context/ScrollContext.tsx` → 1 (comment-only, no React useState call)

---
*Phase: 03-scroll-infrastructure*
*Completed: 2026-06-10*
