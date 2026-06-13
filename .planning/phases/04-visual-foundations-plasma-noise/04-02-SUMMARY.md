---
phase: 04-visual-foundations-plasma-noise
plan: 02
subsystem: ui
tags: [react, gsap, scroll-trigger, webgl, ogl, plasma, hero-backdrop, dispatcher, accessibility]

# Dependency graph
requires:
  - phase: 01-scaffold-safety-rails
    provides: AnimationErrorBoundary, useDeviceCapabilities, @/lib/gsap module
  - phase: 03-scroll-infrastructure
    provides: ScrollTrigger registered via @/lib/gsap, ScrollTrigger.refresh on fonts.ready
  - phase: 04-visual-foundations-plasma-noise (plan 04-01)
    provides: Plasma leaf component (OGL WebGL2), PlasmaFallback (CSS gradient + optional pulse)
provides:
  - HeroBackdrop dispatcher concentrating ALL plasma decision logic in one component
  - Phase state machine: visible -> fading (250ms CSS opacity) -> unmounted (Plasma actually removed)
  - ScrollTrigger lifecycle that mounts/unmounts Plasma based on hero viewport visibility
  - Test harness in App.tsx (placeholder hero <section>) so Plan 04-03 can verify Phase 4 success criteria in a real browser
affects:
  - 04-03 (browser checkpoint verification — consumes this dispatcher unchanged)
  - 05 (Hero + PillNav — imports <HeroBackdrop heroRef={heroRef}/> and stops thinking about WebGL / fallbacks / scroll thresholds)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dispatcher pattern: useDeviceCapabilities gate ABOVE Plasma — fallback path allocates zero GL context"
    - "Phase state machine for pre-unmount fade: 'visible' -> 'fading' -> 'unmounted' (~250ms CSS opacity transition before React unmounts)"
    - "ScrollTrigger.create with start='top top' / end='bottom top' + onLeave/onEnterBack — single trigger per dispatcher, killed via trigger.kill() (NEVER ScrollTrigger.getAll)"
    - "useGSAP scope=containerRef (own root div) separate from heroRef (the ScrollTrigger target) — scope is for useGSAP's cleanup boundary; trigger is for measurement"
    - "Stable primitive props on <Plasma> (color/speed/direction/scale/opacity/mouseInteractive) — Plasma's WebGL useEffect won't re-init on parent renders"
    - "Test harness section uses isolation: isolate + overflow: hidden to contain the absolute-positioned canvas"

key-files:
  created:
    - src/components/plasma/HeroBackdrop.tsx
    - .planning/phases/04-visual-foundations-plasma-noise/04-02-SUMMARY.md
  modified:
    - src/App.tsx

key-decisions:
  - "[04-02] HeroBackdrop owns the dispatcher pattern — Plasma never reads device capabilities, never knows about scroll; HeroBackdrop alone decides Plasma | Fallback | null"
  - "[04-02] useFallback = prefersReducedMotion || !supportsWebGL2 — isLowEnd intentionally NOT in the gate (low-end devices with WebGL2 still get Plasma at DPR cap; isLowEnd reserved for Phase 7 perf tuning)"
  - "[04-02] FADE_MS = 250 (middle of CONTEXT.md's 200-300ms band) — pre-unmount opacity fade tween length"
  - "[04-02] Phase state machine 'visible' -> 'fading' -> 'unmounted' (NOT a single null swap) — fading gives the eye 250ms of opacity transition before React yanks the canvas mid-frame"
  - "[04-02] Cleanup kills its OWN trigger via trigger.kill() — NEVER ScrollTrigger.getAll().forEach(t.kill()) (that would nuke RevealSection / ParallaxCard triggers living in the Phase 3 harness still in App.tsx)"
  - "[04-02] useGSAP scope=containerRef (own root div), NOT heroRef — scope is for useGSAP's cleanup binding; ScrollTrigger's `trigger` config separately points at heroRef.current"
  - "[04-02] useGSAP dependencies=[heroRef, useFallback] — re-runs when ref populates after first paint (Pitfall 5) AND when OS reduced-motion is toggled mid-session (research Open Question 1, immediate swap, no fade transition)"
  - "[04-02] Unmounted branch keeps the ref-host div mounted (empty children) so containerRef.current stays non-null and the useGSAP scope binding for onEnterBack stays valid for symmetric remount"
  - "[04-02] mouseInteractive={!isMobile} per CONTEXT.md — mouse parallax desktop-only (≤430px gets isMobile=true)"
  - "[04-02] App.tsx test harness is ADDITIVE — placeholder <section ref={heroRef}> inserted between <NoiseOverlay/> and AnimationRootPlaceholder; Phase 1/2/3 demo hero + ParallaxCard harness preserved verbatim"
  - "[04-02] Test harness section uses isolation: isolate + overflow: hidden — new stacking context contains the absolute-positioned canvas; prevents Plasma bleeding into the existing demo hero below"

patterns-established:
  - "Pattern: dispatcher concentrates capability gating + scroll lifecycle, leaf component stays pure"
  - "Pattern: pre-unmount CSS opacity fade (state machine) instead of immediate unmount — avoids canvas yank mid-frame"
  - "Pattern: useGSAP scope separate from ScrollTrigger target — clean cleanup boundary, independent measurement target"
  - "Pattern: cleanup via trigger.kill() (this dispatcher's own trigger only) — preserves other components' triggers"

# Metrics
duration: 3 min
completed: 2026-06-11
---

# Phase 4 Plan 2: HeroBackdrop Dispatcher Summary

**HeroBackdrop dispatcher routes between Plasma WebGL, PlasmaFallback gradient, and null via useDeviceCapabilities gate plus ScrollTrigger-driven phase state machine ('visible' -> 'fading' -> 'unmounted') with 250ms CSS opacity fade before React unmount; test harness wired into App.tsx for Plan 04-03 browser checkpoint.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-10T23:59:44Z
- **Completed:** 2026-06-11T00:02:31Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 edited)

## Accomplishments

- `<HeroBackdrop heroRef={...}/>` shipped — single dispatcher that reads `useDeviceCapabilities`, gates between `<Plasma>` (real WebGL) and `<PlasmaFallback>` (CSS-only) BEFORE any GL context is allocated.
- Phase state machine (`'visible' | 'fading' | 'unmounted'`) drives a 250ms CSS opacity fade BEFORE React unmounts the Plasma component, so the rAF loop actually stops, the WEBGL_lose_context cleanup fires, and the GL context is released (matches CONTEXT.md's "200-300ms opacity fade before unmount" requirement).
- ScrollTrigger configured with `start: 'top top'` / `end: 'bottom top'` + `onLeave` / `onEnterBack` — fires exactly when the hero bottom crosses the viewport top (CONTEXT-locked "100% scrolled past" threshold). Cleanup kills its OWN trigger only, preserving Phase 3's RevealSection / ParallaxCard triggers.
- `mouseInteractive={!isMobile}` plumbed through — desktop gets subtle warp on container-scoped mousemove, mobile (≤430px) gets none. All other Plasma props are stable primitives, so Plasma's WebGL useEffect only re-runs on real mount/unmount (no GL thrash on parent renders).
- Test harness wired into `App.tsx`: placeholder `<section ref={heroRef}>` (100vh, isolation: isolate, overflow: hidden) inserted between `<NoiseOverlay/>` and the existing `AnimationRootPlaceholder`. `<HeroBackdrop>` wrapped in `<AnimationErrorBoundary>`. All Phase 1/2/3 scaffolding (i18n demo `<main>`, Phase 3 RevealSection / ParallaxCard cards, LanguageSwitcher, `ScrollTrigger.refresh` on `fonts.ready`) preserved verbatim — diff is purely additive.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build `<HeroBackdrop>` dispatcher with phase state machine** — `646ac93` (feat)
2. **Task 2: Wire test harness in App.tsx (placeholder hero section + HeroBackdrop)** — `3e33e03` (feat)

**Plan metadata:** (final commit at the end of this summary doc)

## Files Created/Modified

- `src/components/plasma/HeroBackdrop.tsx` (CREATED, 186 lines) — Dispatcher reading `useDeviceCapabilities` + driving ScrollTrigger-based phase state machine. Exports `HeroBackdrop({ heroRef })`. Imports `useGSAP`, `ScrollTrigger` from `@/lib/gsap` (never directly from `'gsap'`).
- `src/App.tsx` (MODIFIED, +64 / -1) — Added `useRef`, `HeroBackdrop` imports; added `heroRef = useRef<HTMLElement>(null)`; inserted placeholder `<section>` test harness with HeroBackdrop wrapped in AnimationErrorBoundary. All other code paths untouched.

## Final HeroBackdrop Component Shape

**Props:**
```ts
interface HeroBackdropProps {
  heroRef: RefObject<HTMLElement | null>
}
```
(The `HTMLElement | null` tolerance matches React 19's `useRef<HTMLElement>(null)` inferred type.)

**State shape:**
- `phase: 'visible' | 'fading' | 'unmounted'` (React state)
- `fadeTimerRef: useRef<number | null>` (window.setTimeout handle, nullable)
- `containerRef: useRef<HTMLDivElement>(null)` (useGSAP scope target)

**Hook calls:**
- `useDeviceCapabilities()` — destructures `prefersReducedMotion`, `isMobile`, `supportsWebGL2` (NOT `isLowEnd` — that's intentionally absent from the gate)
- `useGSAP(callback, { scope: containerRef, dependencies: [heroRef, useFallback] })`

**Render branches:**
1. `useFallback = prefersReducedMotion || !supportsWebGL2` → returns `<div><PlasmaFallback animated={!prefersReducedMotion}/></div>` (zero GL, never unmounts)
2. `phase === 'unmounted'` → returns empty `<div>` (ref-host kept mounted so containerRef stays non-null for onEnterBack)
3. otherwise → returns wrapper `<div>` with opacity transition + `<Plasma color="#FF4500" speed={0.35} direction="forward" scale={1.1} opacity={0.85} mouseInteractive={!isMobile}/>`

## Exact ScrollTrigger Config Used

```ts
ScrollTrigger.create({
  trigger: heroRef.current,
  start: 'top top',     // hero top hits viewport top
  end: 'bottom top',    // hero bottom leaves viewport top (100% past — CONTEXT-locked)
  onLeave: () => {
    setPhase('fading')
    // clear stale timer (defensive), then schedule 'unmounted' transition
    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = window.setTimeout(() => {
      setPhase('unmounted')
      fadeTimerRef.current = null
    }, FADE_MS)  // FADE_MS = 250
  },
  onEnterBack: () => {
    // cancel any pending fade, snap straight back to 'visible'
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
    setPhase('visible')
  },
})
```

No `onEnter` or `onLeaveBack` configured — the dispatcher initial state is `'visible'`, so `onEnter` would be a no-op; `onLeaveBack` doesn't fire because `start: 'top top'` means there's nothing above the trigger to leave back into.

## Test Harness Gating

Confirmed: the test harness section in `App.tsx` contains exactly one `<HeroBackdrop heroRef={heroRef}/>` JSX call, and it is wrapped in `<AnimationErrorBoundary>`. The pattern matches the Phase 5 forward-reference snippet in `04-RESEARCH.md`:

```tsx
<section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', ... }}>
  <AnimationErrorBoundary>
    <HeroBackdrop heroRef={heroRef} />
  </AnimationErrorBoundary>
  <div>{/* placeholder copy */}</div>
</section>
```

When a WebGL / rAF error throws in Plasma, the boundary catches it and renders the brand-gradient fallback shell — the rest of the page (i18n demo, Phase 3 cards, LanguageSwitcher, AnimationRootPlaceholder) keeps working.

## Deviations from the RESEARCH Skeleton

The skeleton in `04-RESEARCH.md` §"Full HeroBackdrop dispatcher skeleton" was followed essentially verbatim. Two minor refinements:

1. **`useRef`-null guard explicitness.** The skeleton uses `if (fadeTimerRef.current)` (truthy check). The shipped code uses `if (fadeTimerRef.current !== null)` everywhere for the timer ref. Reason: `number | null` is the declared type; an explicit `!== null` makes intent obvious (a timer handle of `0` would otherwise be falsy and skip cleanup, even though browsers don't usually issue handle 0 — this is purely defensive readability).
2. **`gsap` import dropped.** The plan noted "you can omit `gsap` from the import if not referenced; only `ScrollTrigger` and `useGSAP` are needed here." Shipped code omits it — `import { ScrollTrigger, useGSAP } from '@/lib/gsap'` only.

No structural deviations. No new patterns invented. No deps added.

## Decisions Made

Already enumerated under `key-decisions` in frontmatter. Highlights:

- **`useFallback = prefersReducedMotion || !supportsWebGL2`** — `isLowEnd` is NOT in the gate per CONTEXT.md. Low-end devices with WebGL2 get the real Plasma at the DPR-capped resolution. `isLowEnd` is reserved for Phase 7 perf tuning.
- **`FADE_MS = 250`** — middle of CONTEXT.md's 200-300ms band.
- **Phase state machine over single null-swap** — pre-unmount fade gives the eye 250ms of opacity transition before React yanks the canvas mid-frame. Required by CONTEXT.md.
- **`scope: containerRef` (NOT `heroRef`) for `useGSAP`** — `scope` is for useGSAP's cleanup boundary; `trigger` is the measurement target. They serve different roles and naming them differently makes the separation explicit.
- **`dependencies: [heroRef, useFallback]`** — re-runs the ScrollTrigger setup when `heroRef.current` fills in after first paint (Pitfall 5) AND when OS reduced-motion is toggled mid-session (research Open Question 1 — immediate swap, no fade transition between modes).
- **Cleanup kills its OWN trigger only** (`trigger.kill()`) — never `ScrollTrigger.getAll().forEach(t.kill())`. Phase 3's RevealSection / ParallaxCard triggers are still in the test harness and would be nuked by the broad sweep.
- **Unmounted branch keeps the ref-host div mounted** — `containerRef.current` must stay non-null for the useGSAP scope-bound cleanup to work, AND for `onEnterBack` to have somewhere to point when remounting.
- **App.tsx changes are purely additive** — no deletions in the existing `<main>`, Phase 3 `<section>`, or scaffolding. `git diff` confirms.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0
**Impact on plan:** None.

## TypeScript Strictness Notes

No strictness issues encountered. The `useFallback` boolean was derived from primitive destructured values (no `unknown` narrowing required). The `RefObject<HTMLElement | null>` prop matches React 19's `useRef<HTMLElement>(null)` inferred return type — no type assertions needed at the caller site in `App.tsx`.

One minor declaration touched: the `direction` prop on `<Plasma>` is locked to the literal `'forward'`, so the static prop value `direction="forward"` types cleanly without any cast.

## Issues Encountered

None. Build (`npm run build` -> `tsc -b && vite build`) and lint (`npm run lint` -> `eslint src/`) both exit 0 after each task commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `<HeroBackdrop>` is wired into a placeholder hero section and renders inside an `<AnimationErrorBoundary>`. Plan 04-03 can run its human-verification checkpoint against `npm run dev` and verify:
  - Plasma canvas renders full-bleed at color #FF4500 with mouse warp
  - Scrolling past the placeholder hero unmounts Plasma (rAF stops, GL context lost, canvas removed)
  - `prefersReducedMotion` / no-WebGL2 → fallback gradient, zero `<canvas>` in the DOM
  - StrictMode dev double-mount → exactly one live WebGL context after settle
  - Scrolling back UP into the hero remounts Plasma cleanly
- Phase 5 imports `<HeroBackdrop heroRef={heroRef}/>` as-is — no API changes anticipated.
- One open question stays for Plan 04-03's browser checkpoint: symmetric fade-IN on remount (currently we snap to opacity:1 instantly; the eye may want a one-frame opacity-0 → 1 tween). This is a polish call, not a blocker — RESEARCH §"Open Questions" #2.

## Self-Check: PASSED

Verified before plan-metadata commit:
- `src/components/plasma/HeroBackdrop.tsx` exists on disk
- `src/App.tsx` exists on disk (modified)
- `.planning/phases/04-visual-foundations-plasma-noise/04-02-SUMMARY.md` exists on disk
- Task 1 commit `646ac93` in git log
- Task 2 commit `3e33e03` in git log

---
*Phase: 04-visual-foundations-plasma-noise*
*Completed: 2026-06-11*
