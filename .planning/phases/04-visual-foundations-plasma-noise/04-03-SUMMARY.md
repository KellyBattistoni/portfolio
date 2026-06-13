---
phase: 04-visual-foundations-plasma-noise
plan: 03
subsystem: ui
tags: [browser-verification, webgl, plasma, fallback, scroll-trigger, strictmode]

# Dependency graph
requires:
  - phase: 04-visual-foundations-plasma-noise (plans 04-01, 04-02)
    provides: Plasma, PlasmaFallback, HeroBackdrop
provides:
  - All 6 Phase 4 ROADMAP success criteria verified in a real browser
  - Phase 4 officially closed

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AnimationRootPlaceholder (position:fixed) as universal gradient backdrop — avoids scroll-seam between scrolling in-section gradient and fixed one beneath"
    - "HeroBackdrop renders nothing in fallback mode — global fixed gradient handles all sections continuously"

key-files:
  modified:
    - src/components/plasma/HeroBackdrop.tsx
    - src/components/plasma/Plasma.tsx
    - src/components/plasma/PlasmaFallback.tsx
    - src/App.tsx
    - src/styles/index.css

key-decisions:
  - "[04-03] ScrollTrigger.create() + onUpdate is the correct scroll-scrub path — gsap.to() with scrollTrigger.scrub did NOT connect to scroll position in practice"
  - "[04-03] containerRef (HeroBackdrop's own root div) as ScrollTrigger trigger, NOT heroRef (parent-owned) — heroRef.current is null when HeroBackdrop's useEffect runs in React 19 StrictMode"
  - "[04-03] useEffect (NOT useGSAP/useLayoutEffect) for ScrollTrigger on parent-boundary elements — useLayoutEffect fires before parent ref attaches"
  - "[04-03] MOUSE_COMPRESS tuned 0.1 → 0.04, LERP 0.06 → 0.03 — tighter, more meditative mouse warp at hero scale"
  - "[04-03] CSS mask-image on Plasma wrapper (black 55% → transparent 100%) — eliminates hard bottom edge chop between hero and next section"
  - "[04-03] PlasmaFallback gradient: solid rgb() stops (NOT rgba) — rgba alpha channel causes visible concentric banding rings; solid rgb interpolation eliminates it entirely"
  - "[04-03] Pulse animation removed from PlasmaFallback — any opacity animation on a gradient amplifies banding regardless of stop type"
  - "[04-03] HeroBackdrop renders nothing in fallback mode — AnimationRootPlaceholder (position:fixed) provides the continuous gradient backdrop for all sections; in-section PlasmaFallback scrolls away creating a seam with the fixed layer"
  - "[04-03] AnimationRootPlaceholder gradient updated to exact solid-rgb 9-stop match as PlasmaFallback — all sections share one consistent ambient backdrop"
  - "[04-03] Projects section background:#050505 removed — was painting over the fixed gradient; sections with no explicit background let AnimationRootPlaceholder show through"

# Metrics
duration: 2 sessions (2026-06-12)
completed: 2026-06-12
---

# Phase 4 Plan 3: Browser Verification Checkpoint Summary

**All 6 Phase 4 ROADMAP success criteria verified in a real browser. Phase 4 complete.**

## All 6 Checks — PASS

| Check | Criterion | Result |
|-------|-----------|--------|
| 1 | Plasma renders full-bleed #FF4500 with mouse warp | PASS |
| 2 | Scroll past hero unmounts Plasma (rAF stops, GL freed) | PASS |
| 3 | Scroll back up remounts Plasma cleanly | PASS |
| 4 | prefers-reduced-motion → zero canvas, static gradient | PASS |
| 5 | no-WebGL2 stub → zero canvas, static gradient (pulse intentionally removed) | PASS |
| 6 | StrictMode: exactly 1 live canvas after settle, stable across 5 reloads | PASS |

## Bugs Fixed This Checkpoint

### heroRef null in useEffect (Check 2 root cause)
External ref owned by parent App was null when HeroBackdrop's effect ran in React 19 StrictMode. Fixed by replacing `heroRef` with `containerRef` (HeroBackdrop's own root div, guaranteed non-null). `heroRef` prop removed entirely from HeroBackdrop.

### gsap.to() scrub not connecting to scroll
`gsap.to(el, { scrollTrigger: { scrub: true } })` did not respond to scroll. Replaced with `ScrollTrigger.create()` + `onUpdate: (self) => plasmaRef.current.style.opacity = String(1 - self.progress)`.

### Hard bottom edge at hero boundary
`mask-image: linear-gradient(to bottom, black 55%, transparent 100%)` on the Plasma wrapper gives a smooth fade instead of a hard clip.

### Gradient banding rings in PlasmaFallback
`rgba()` stops cause visible concentric banding via alpha-channel interpolation. Fixed: all stops converted to solid `rgb()` values (9 stops, `rgb(90,18,2)` → `rgb(5,5,5)`). No alpha anywhere.

### Pulse animation amplifying banding
Opacity animation on any gradient amplifies alpha differences into visible rings. Pulse keyframes removed from PlasmaFallback and index.css entirely.

### Scroll seam between hero and main section (reduced-motion)
PlasmaFallback (position:absolute, scrolls with page) and AnimationRootPlaceholder (position:fixed) share the same gradient but different reference frames — they drift apart while scrolling. Fixed: HeroBackdrop renders nothing in fallback mode. Only the fixed AnimationRootPlaceholder remains, continuous across all sections.

### Projects section completely black
Section had `background: '#050505'` painting over the fixed gradient. Removed.

## Final Architecture

**HeroBackdrop (no props):**
- Fallback path (`prefersReducedMotion || !supportsWebGL2`): renders nothing
- WebGL path: Plasma canvas with scroll-scrubbed opacity + unmount lifecycle

**AnimationRootPlaceholder (App.tsx):**
- `position: fixed, inset: 0, zIndex: 0`
- 9-stop solid-rgb gradient matching PlasmaFallback exactly
- Universal backdrop for all sections — no per-section gradient needed

## Deviations from Plan

- Check 5 pass criteria updated: plan expected pulse animation; pulse was intentionally removed. Static gradient is correct.
- HeroBackdrop no longer renders PlasmaFallback in fallback mode: global fixed gradient covers all cases without seam.

---
*Phase: 04-visual-foundations-plasma-noise*
*Completed: 2026-06-12*
