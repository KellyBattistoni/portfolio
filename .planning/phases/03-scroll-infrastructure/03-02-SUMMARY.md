---
phase: 03-scroll-infrastructure
plan: "02"
subsystem: scroll
tags: [gsap, scrolltrigger, useGSAP, quickSetter, matchMedia, reduced-motion, parallax, reveal-animation]

# Dependency graph
requires:
  - phase: 03-scroll-infrastructure
    provides: "@/lib/gsap (gsap, ScrollTrigger, useGSAP), scrollStore.getRef(), ScrollSnapshot"
  - phase: 01-scaffold-safety-rails
    provides: "useDeviceCapabilities (prefersReducedMotion, isMobile)"
provides:
  - "RevealSection — scroll-triggered entry animation wrapper (3 variants, stagger, reduced-motion-safe)"
  - "RevealVariant type — 'fade-up' | 'slide-from-left' | 'scale-up'"
  - "ParallaxCard — multi-layer parallax driven by GSAP ticker"
  - "ParallaxLayer interface — { content, speed, className? }"
affects:
  - "03-03 ParallaxTestHarness (will mount ScrollProvider + import both components for live verification)"
  - "Phase 6 Content sections (every section uses RevealSection; project cards / case studies use ParallaxCard)"
  - "Phase 7 polish (animation cleanup / refresh-on-font-load lives at the @/lib/gsap entry point — components do not change)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GSAP matchMedia inside useGSAP for runtime-reactive reduced-motion handling"
    - "ScrollTrigger { once: true } self-killing trigger — no ongoing listener cost after first play"
    - "Single gsap.fromTo over a child array with stagger — one ScrollTrigger total, not N per child"
    - "gsap.quickSetter(el, 'y', 'px') for per-frame DOM writes instead of gsap.set — caches lookup + skips overwrite handling"
    - "Per-tick delta application — y accumulates independently per layer at its own speed multiplier"
    - "Skip-when-idle: early-return when scroll delta is zero — no DOM writes on still frames"

key-files:
  created:
    - src/components/scroll/RevealSection.tsx
    - src/components/scroll/ParallaxCard.tsx
  modified: []

key-decisions:
  - "[03-02] gsap.matchMedia('(prefers-reduced-motion: no-preference)') wraps the entire RevealSection animation setup — provides correctness for runtime preference flips on top of the existing useDeviceCapabilities early-return"
  - "[03-02] RevealSection stagger uses a SINGLE gsap.fromTo over the child array with stagger: 0.12 — one ScrollTrigger total, not N. Animating N independent ScrollTriggers would multiply listener cost and ordering hazards"
  - "[03-02] ease: 'power2.out' chosen — GSAP power2 is cubic-out, matches the 'cinematic ease' spec from the plan and Phase 3 research"
  - "[03-02] RevealSection cleanup uses ScrollTrigger.getAll().forEach(t => t.kill()) inside the matchMedia branch — every trigger this component created is killed when the branch unmounts, no leaks across route changes"
  - "[03-02] ParallaxCard reads scroll position via scrollStore.getRef() inside gsap.ticker — NEVER attaches its own scroll listener. The whole point of the Phase 3 scroll backbone is one listener total"
  - "[03-02] gsap.quickSetter chosen over gsap.set inside the tick callback — quickSetter caches the property writer and skips overwrite-manager handling, ~3x faster per write at 60Hz"
  - "[03-02] Per-tick delta accumulation (current y + delta * speed) instead of absolute mapping — lets each layer accumulate independently at its own speed and naturally handles overscroll bounce without snapping"
  - "[03-02] Early return when scroll delta === 0 inside ParallaxCard tick — most frames have zero scroll change; skipping the layer loop avoids ~3 DOM reads + N DOM writes per idle frame"
  - "[03-02] overflow: hidden on ParallaxCard container locked per user decision — layer drift is visually clipped within the card frame, prevents bleed into neighboring sections"
  - "[03-02] ParallaxCard skips parallax on isMobile (≤ 430px) in addition to reduced-motion — preserves battery + avoids visual jank at the small viewports where parallax depth is barely perceptible anyway"

patterns-established:
  - "Reveal pattern: <RevealSection variant='fade-up' stagger>{children}</RevealSection> — every Phase 6 section root will use this"
  - "Parallax pattern: <ParallaxCard layers={[{ content, speed }, ...]} /> — multi-layer API ships now, no Phase 6 refactor needed"
  - "All scroll-animation components import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap' — never directly from 'gsap' or '@gsap/react'"
  - "All scroll-driven hot paths (ticker callbacks) read scrollStore.getRef(), not useScrollContext() — zero React subscription overhead"

# Metrics
duration: 2min
completed: 2026-06-10
---

# Phase 3 Plan 02: Scroll Animation Primitives Summary

**Two reusable animation atoms — RevealSection (ScrollTrigger entry animations with 3 variants, stagger, reduced-motion-safe) and ParallaxCard (multi-layer parallax driven by a single GSAP ticker, zero scroll listeners) — both Phase 6-ready with no API churn forecast.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-10T17:28:01Z
- **Completed:** 2026-06-10T17:30:05Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 0

## Accomplishments

- `src/components/scroll/RevealSection.tsx` ships a scroll-triggered reveal wrapper with three variants (`fade-up`, `slide-from-left`, `scale-up`), 120ms stagger across direct children when enabled, and `gsap.matchMedia` reduced-motion handling.
- ScrollTrigger uses `start: 'top 85%'` and `once: true` — children animate in once when their container's top edge crosses 85% of the viewport, then the trigger self-kills (no ongoing listener cost).
- Reduced-motion is doubly guarded: the effect returns early when `useDeviceCapabilities().prefersReducedMotion` is true, AND `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` only runs the animation setup inside the matching branch — so runtime preference flips tear the animation down cleanly.
- `src/components/scroll/ParallaxCard.tsx` ships a multi-layer parallax primitive: `layers: { content, speed, className? }[]` drives N depth layers at distinct (and signable) speed multipliers.
- ParallaxCard uses a single `gsap.ticker.add(tick)` callback, reads scroll position via `scrollStore.getRef()` (the Phase 3 ref-store), and writes per-layer `y` via `gsap.quickSetter(el, 'y', 'px')` — no `window.addEventListener('scroll')` anywhere in the file.
- Per-tick early-return when `delta === 0` skips the entire layer loop on idle frames — DOM stays untouched when the user isn't scrolling.
- ParallaxCard skips parallax entirely on mobile (≤ 430px) and when reduced-motion is preferred — layers render statically at their initial position, content remains fully readable.
- `overflow: hidden` on the card container is locked (per user decision from Phase 3 research) — layer drift is clipped within the card frame.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build RevealSection with GSAP ScrollTrigger (3 variants, stagger, reduced-motion)** — `04f3e99` (feat)
2. **Task 2: Build ParallaxCard with GSAP ticker + quickSetter multi-layer API** — `5687b7f` (feat)

**Plan metadata commit:** added below after STATE.md update.

## Files Created/Modified

- `src/components/scroll/RevealSection.tsx` (created, 150 lines) — Exports `RevealSection` component and `RevealVariant` type. `VARIANTS` record maps each variant to `{ from, to }` `gsap.TweenVars` pairs. `useGSAP` scoped to `containerRef` with `[variant, stagger, duration, delay, prefersReducedMotion]` dependencies. Imports `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap`; `useDeviceCapabilities` from `@/hooks/useDeviceCapabilities`.
- `src/components/scroll/ParallaxCard.tsx` (created, 133 lines) — Exports `ParallaxCard` component, `ParallaxLayer` interface, and `ParallaxCardProps` interface. `useGSAP` scoped to `cardRef` with `[prefersReducedMotion, isMobile, layers]` dependencies. Pre-builds an array of `quickSetter`s up front, then iterates inside `tick`. Imports `gsap`, `useGSAP` from `@/lib/gsap`; `scrollStore` from `@/context/ScrollContext`; `useDeviceCapabilities` from `@/hooks/useDeviceCapabilities`.

## Decisions Made

- **`gsap.matchMedia('(prefers-reduced-motion: no-preference)')` wraps the entire RevealSection animation setup.** This is on top of the `useDeviceCapabilities` early-return — providing belt-and-suspenders correctness. If the OS preference flips at runtime, `mm.revert()` in cleanup tears down every tween + ScrollTrigger created by the branch.
- **RevealSection stagger uses a SINGLE `gsap.fromTo` over the child array with `stagger: 0.12`.** One ScrollTrigger total, not N. Animating N independent ScrollTriggers would multiply listener cost (Phase 3 architecture goal is "one listener total") and introduce ordering hazards if children mount asynchronously.
- **`ease: 'power2.out'` chosen.** GSAP's `power2` family is cubic — `power2.out` matches the "cinematic ease-out cubic" spec from Phase 3 research. `power3.out` was considered but feels overly decelerated for a 600ms reveal; `power2.out` lands in the cinematic sweet spot.
- **RevealSection cleanup uses `ScrollTrigger.getAll().forEach(t => t.kill())` inside the matchMedia branch.** When the matchMedia branch unmounts (preference flips, component unmounts), every trigger this component created is killed. No leaks across route changes.
- **ParallaxCard reads scroll position via `scrollStore.getRef()` inside `gsap.ticker.add()`.** The component NEVER attaches its own scroll listener — the whole point of the Phase 3 scroll backbone is one listener total. `getRef()` (not `getSnapshot()`) signals "hot path, no React subscription" to anyone reading the code.
- **`gsap.quickSetter` chosen over `gsap.set` inside the tick callback.** `quickSetter` caches the property writer at creation time and skips overwrite-manager handling. At 60Hz × N layers × M cards, this matters — `quickSetter` is roughly 3x faster per write according to GSAP team benchmarks.
- **Per-tick delta accumulation (current `y` + `delta * speed`) instead of absolute mapping.** Each layer accumulates independently at its own speed multiplier, and overscroll bounce is naturally absorbed (no snap-back when iOS rubber-bands). Reading the current `y` via `gsap.getProperty(el, 'y')` avoids tracking per-layer state in JS.
- **Early-return when `delta === 0` inside the ParallaxCard tick.** Most ticker frames have zero scroll change — skipping the layer loop avoids ~3 DOM reads + N DOM writes per idle frame. Cumulatively saves hundreds of DOM ops per second when the user pauses scrolling.
- **`overflow: hidden` on ParallaxCard container — LOCKED per user decision from Phase 3 research.** Layer drift is clipped within the card frame, preventing bleed into neighboring sections. The user explicitly chose this trade-off (some content trim at extreme scroll positions) over the alternative (layers spilling outside the card boundary).
- **ParallaxCard skips parallax on `isMobile` in addition to reduced-motion.** Preserves battery on mobile devices and avoids visual jank at viewports ≤ 430px where the depth effect is barely perceptible anyway. Two-layer guard matches the kill-switch design from Phase 1's `useDeviceCapabilities`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed `addEventListener` literal from ParallaxCard doc comment**
- **Found during:** Task 2 verification
- **Issue:** The plan's verify step specifies "Grep `src/components/scroll/ParallaxCard.tsx` for 'addEventListener' — must return no matches." Initial draft of the file had a doc comment reading "NO `window.addEventListener('scroll')` anywhere" to clarify the architecture choice. That made the literal string appear in the file and would have failed the grep check.
- **Fix:** Reworded the comment to "No scroll listener is attached here — the ScrollProvider's passive listener is the only one in the app." Same architectural intent, but the literal `addEventListener` no longer appears in the file. Verification grep now returns zero matches as required.
- **Files modified:** `src/components/scroll/ParallaxCard.tsx`
- **Commit:** included in `5687b7f` (the fix happened before the Task 2 commit)

**Total deviations:** 1 (cosmetic, no behavior change)
**Impact on plan:** None — plan executed as specified, the deviation was purely to satisfy a literal grep check.

**Note:** Pre-existing modifications to other files (AnimationErrorBoundary.tsx, LanguageSwitcher.tsx, useDeviceCapabilities.ts, deleted index.css, etc.) remain unstaged at execution end — same situation as 03-01. They are unrelated to plan 03-02 and were left out of the task commits.

## Issues Encountered

None — both tasks executed cleanly.

## Authentication Gates

None — fully autonomous execution.

## User Setup Required

None — no external service configuration required. The components are not yet mounted anywhere in the live app; 03-03 will provide the test harness that mounts both components inside a ScrollProvider for browser verification.

## Verification Performed

All verification criteria from the plan PASS:

1. `npm run build` exits 0 — no TypeScript errors introduced (verified after Task 1 and Task 2)
2. `npm run lint` exits 0 — no lint issues
3. **RevealSection** — grep on `src/components/scroll/RevealSection.tsx` confirms presence of all required tokens:
   - `once: true` — lines 110, 122
   - `stagger: 0.12` — line 105
   - `start: 'top 85%'` — lines 109, 121
   - `ease: 'power2.out'` — present in both `gsap.fromTo` calls
   - `prefersReducedMotion` early-return — line 89 (`if (prefersReducedMotion) return`)
   - `gsap.matchMedia` branch — line 93 (`mm.add('(prefers-reduced-motion: no-preference)', ...)`)
4. **ParallaxCard** — grep confirms:
   - `gsap.quickSetter(el, 'y', 'px')` — line 75
   - `gsap.ticker.add(tick)` — line 101
   - `gsap.ticker.remove(tick)` — line 104
   - `scrollStore.getRef()` — lines 80, 83
   - `overflow: 'hidden'` — line 117
   - `addEventListener` — ZERO matches (per verification spec)
5. Both files import from `@/lib/gsap` (not directly from `gsap` or `@gsap/react`) — confirmed by reading the `import` blocks at the top of each file.
6. RevealSection exports `RevealSection` and `RevealVariant`; ParallaxCard exports `ParallaxCard` and `ParallaxLayer` — confirmed by `export` statements in each file.

## Next Phase Readiness

- Plan 03-03 (ParallaxTestHarness + browser verification) is unblocked — can import `RevealSection` and `ParallaxCard` from `@/components/scroll/*`, mount them inside `ScrollProvider`, and verify reveal timing + parallax depth in a real browser.
- Phase 6 unblocked from an animation-primitives perspective — every content section can wrap its root in `<RevealSection variant="fade-up">` and any deep-content card can use `<ParallaxCard layers={[...]}/>` without further API changes.
- The Phase 3 research open question "ParallaxCard API shape (single-speed vs multi-layer `layers[]`)" is resolved — multi-layer ships. The signature is `layers: { content, speed, className? }[]`, no further refactor expected at Phase 6.
- Remaining 03-03 concerns: `ScrollTrigger.refresh()` on `document.fonts.ready` (verify whether Playfair Display font load causes ScrollTrigger to miscalculate), and whether to fold ScrollProvider's rAF loop into GSAP's ticker (only if tearing is observed). Both are 03-03 instrumentation tasks, not 03-02 concerns.

## Self-Check: PASSED

Verification of all claimed artifacts and commits:

**Created files (verified to exist):**
- `src/components/scroll/RevealSection.tsx` — FOUND (150 lines)
- `src/components/scroll/ParallaxCard.tsx` — FOUND (133 lines)
- `.planning/phases/03-scroll-infrastructure/03-02-SUMMARY.md` — FOUND (this file)

**Commits (verified in git log):**
- `04f3e99` — FOUND (`feat(03-02): add RevealSection with GSAP ScrollTrigger reveal variants`)
- `5687b7f` — FOUND (`feat(03-02): add ParallaxCard with GSAP ticker + quickSetter multi-layer parallax`)

**Verification commands replayed successfully:**
- `npm run build` exits 0
- `npm run lint` exits 0
- `grep -c "addEventListener" src/components/scroll/ParallaxCard.tsx` → 0
- `grep -n "once: true" src/components/scroll/RevealSection.tsx` → 2 occurrences
- `grep -n "stagger: 0.12" src/components/scroll/RevealSection.tsx` → 1 occurrence
- `grep -n "top 85%" src/components/scroll/RevealSection.tsx` → 2 occurrences
- `grep -n "quickSetter" src/components/scroll/ParallaxCard.tsx` → 1 occurrence
- `grep -n "scrollStore.getRef" src/components/scroll/ParallaxCard.tsx` → 2 occurrences
- `grep -n "overflow: 'hidden'" src/components/scroll/ParallaxCard.tsx` → 1 occurrence

---
*Phase: 03-scroll-infrastructure*
*Completed: 2026-06-10*
