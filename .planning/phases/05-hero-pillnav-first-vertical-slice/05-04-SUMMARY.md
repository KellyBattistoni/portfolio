---
phase: 05-hero-pillnav-first-vertical-slice
plan: "04"
subsystem: ui
tags: [react, gsap, scrolltrigger, mobile-nav, animation, i18n]

# Dependency graph
requires:
  - phase: 05-hero-pillnav-first-vertical-slice
    provides: Hero, PillNav, MobileNav components built in 05-01 through 05-03
provides:
  - Production App.tsx wiring Hero + PillNav + MobileNav with no test harness
  - All 6 Phase 5 browser verification checks passing
  - MobileNav flash bug fixed (GSAP tl.reverse(0) falsy-zero root cause identified and resolved)
  - MobileNav redesigned to unified glass-pill matching PillNav
  - Reduced-motion PlasmaFallback rendering fixed
affects: [06-content-sections, 07-polish-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - tl.seek(0).reversed(true).paused(false) instead of tl.reverse(0) to park GSAP timelines
    - pillBgHidden state + useEffect for sequenced CSS transitions after GSAP animations
    - document.body.style.overflow scroll lock pattern for modal/panel components

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/nav/MobileNav.tsx
    - src/components/plasma/HeroBackdrop.tsx
    - src/styles/index.css
    - index.html

key-decisions:
  - "tl.reverse(0) is broken: GSAP's reverse() impl uses seek(0 || totalDuration()) which resolves to totalDuration() because JS treats 0 as falsy — always use tl.seek(0).reversed(true).paused(false) instead"
  - "MobileNav redesigned to single glass-pill matching PillNav (same styles, same 40% scroll trigger, same expand→fade entrance)"
  - "MobileNav panel uses position:absolute inside overflow:hidden container to clip off-screen panel via CSS — no JS timing dependency"
  - "Panel zIndex:60 required to stack above backdrop zIndex:40 within the same stacking context"
  - "pillBgHidden state driven by isOpen-watching useEffect provides asymmetric timing: hide immediately on open, restore after 800ms on close (400ms panel animation + 400ms pause)"
  - "PlasmaFallback was built (04-01) but never wired into HeroBackdrop — added {useFallback && <PlasmaFallback />} in this plan"
  - "Reduced-motion panel needs transform:none in the conditional style spread to override .mobile-nav-panel { transform: translateX(100%) } CSS class"

patterns-established:
  - "Asymmetric transition timing: use separate state + useEffect with setTimeout for sequenced show/hide rather than fighting CSS transition-delay"
  - "Scroll lock: document.body.style.overflow in useEffect watching isOpen, cleanup restores empty string"

# Metrics
duration: ~3 sessions
completed: 2026-06-13
---

# Plan 05-04: App.tsx Integration + Phase 5 Verification Summary

**Production App.tsx wired with Hero + PillNav + MobileNav; GSAP tl.reverse(0) flash bug root-caused and fixed; MobileNav redesigned to unified glass-pill; all 6 browser checks passing**

## Performance

- **Duration:** ~3 sessions (extensive debugging)
- **Completed:** 2026-06-13
- **Tasks:** 2 (+ significant unplanned bug fixes)
- **Files modified:** 5

## Accomplishments

- App.tsx stripped of all Phase 3/4 test harness code; Hero + PillNav + MobileNav wired cleanly
- Root-caused the persistent MobileNav panel flash: `tl.reverse(0)` calls `seek(0 || totalDuration())` — JS falsy `0` resolves to `totalDuration()`, seeking to the END and playing the close animation on load. Fixed with `tl.seek(0).reversed(true).paused(false)`
- MobileNav redesigned: single glass-pill (matching PillNav exactly — same styles, `40%` scroll trigger, sequential expand→fade entrance), panel backdrop z-index fixed, scroll lock added, pill background fades out on open and fades back in after panel close animation completes
- PlasmaFallback wired into HeroBackdrop (it was built in Phase 4 but never rendered); reduced-motion panel `transform:none` override added
- All 6 Phase 5 browser verification checks confirmed passing by user

## Files Created/Modified

- `src/App.tsx` — stripped all test harnesses, wired Hero + PillNav + MobileNav
- `src/components/nav/MobileNav.tsx` — complete redesign: unified pill, flash fix, z-index, scroll lock, pill bg animation, reduced-motion fixes
- `src/components/plasma/HeroBackdrop.tsx` — added PlasmaFallback render for reduced-motion/no-WebGL2 path
- `src/styles/index.css` — replaced `display:none` with `transform:translateX(100%)` for panel initial state
- `index.html` — removed stale inline `<style>.mobile-nav-panel{display:none}</style>`

## Decisions Made

- `tl.reverse(0)` is a GSAP footgun due to JS falsy `0`. Canonical park pattern is now `tl.seek(0).reversed(true).paused(false)`. Saved to project memory.
- MobileNav pill trigger changed from `70%` to `40%` (matching PillNav) so hamburger appears when name fades — consistent cross-device behavior.
- Pill background uses asymmetric timing: hide immediately on panel open (feels responsive), restore 800ms after close starts (400ms panel animation + 400ms pause) so it fades in cleanly after panel is fully gone.
- Black background below hero when scrolling is expected — Plasma/PlasmaFallback is hero-scoped; Phase 6 content sections fill that space.

## Deviations from Plan

### Unplanned work required

**1. MobileNav panel flash bug — multi-session investigation**
- **Issue:** Panel visible briefly on every page load at 430px. Seven previous approaches failed.
- **Fix:** Research into GSAP source (`gsap-core.js` line 1885) identified `tl.reverse(0)` as root cause. Fixed with `tl.seek(0).reversed(true).paused(false)`.
- **Files modified:** `src/components/nav/MobileNav.tsx`, `src/styles/index.css`, `index.html`

**2. MobileNav full redesign**
- **Issue:** Separate hamburger button + language pill didn't match PillNav's unified glass-pill design.
- **Fix:** Rebuilt MobileNav to single glass-pill with collapsing hamburger wrapper, matching PillNav styles and 40% trigger exactly.

**3. PlasmaFallback not wired**
- **Issue:** `PlasmaFallback` component existed from Phase 4 but was never imported or rendered in HeroBackdrop.
- **Fix:** Added `{useFallback && <PlasmaFallback />}` to HeroBackdrop.

## Issues Encountered

- `tl.reverse(0)` GSAP bug required reading GSAP source to diagnose — not apparent from docs
- `position:absolute` panel inside `overflow:hidden` container requires explicit `zIndex` to stack above `position:fixed` backdrop within the same stacking context

## Next Phase Readiness

- Phase 5 complete. All ROADMAP Phase 5 success criteria verified by user.
- Phase 6: Content sections (About, Work, Stack, Contact) can now be built — `heroRef` is wired, nav links target the correct `href` anchors, scroll-to behavior activates automatically when sections exist.
- Open question still pending: number of NDA-safe case studies (target 3–4) needed before Phase 6 work items.

---
*Phase: 05-hero-pillnav-first-vertical-slice*
*Completed: 2026-06-13*
