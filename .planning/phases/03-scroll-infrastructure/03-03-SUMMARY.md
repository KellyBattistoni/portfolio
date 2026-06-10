---
phase: 03-scroll-infrastructure
plan: "03"
subsystem: scroll
tags: [gsap, ScrollTrigger, ScrollProvider, ParallaxCard, RevealSection, test-harness, font-load, human-verified]

# Dependency graph
requires:
  - phase: 03-scroll-infrastructure
    plan: "01"
    provides: "ScrollProvider, scrollStore.getRef(), ScrollContext"
  - phase: 03-scroll-infrastructure
    plan: "02"
    provides: "RevealSection (3 variants, stagger), ParallaxCard (multi-layer ticker)"
provides:
  - "ScrollProvider wired into app root (src/main.tsx)"
  - "ScrollTrigger.refresh() on document.fonts.ready (src/App.tsx) — prevents Playfair Display load from miscalculating trigger positions"
  - "Brand-styled 3-card test harness in App.tsx — RevealSection + ParallaxCard proved end-to-end in a real browser"
affects:
  - "Phase 4+ (ScrollProvider in root means all future components can useScrollContext() immediately)"
  - "Phase 5 Hero (ScrollTrigger.refresh() font-load hook proven; pattern reusable)"
  - "Phase 6 Projects section (card layout and parallax depth calibrated — speeds 0.15 / 0.25 / 0.35 confirmed visually)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "document.fonts.ready.then(() => ScrollTrigger.refresh()) in App.tsx — font-load-safe trigger offsets"
    - "ScrollProvider wraps StrictMode root in main.tsx — single provider for entire app"
    - "Brand-styled test harness with inline styles — throwaway harness, no Tailwind, Phase 5 replaces <main>"

key-files:
  created:
    - .planning/phases/03-scroll-infrastructure/03-03-SUMMARY.md
  modified:
    - src/main.tsx
    - src/App.tsx

key-decisions:
  - "[03-03] ScrollProvider wraps <App /> inside <StrictMode> in main.tsx — all Phase 4+ components get scroll context without prop-drilling"
  - "[03-03] document.fonts.ready.then(() => ScrollTrigger.refresh()) placed in a useEffect at the App root — fires once after mount, guarantees Playfair Display metrics are available before any ScrollTrigger measures positions"
  - "[03-03] Test harness uses inline styles only — intentional throwaway; Phase 5 replaces the entire <main> block with the real Hero component, no cleanup needed"
  - "[03-03] Parallax speeds 0.15 / 0.25 / 0.35 visually confirmed — depth calibration adequate for Phase 6; no retuning needed"

# Metrics
duration: ~2 sessions (tasks 1-2 in prior session, checkpoint verification in current session)
completed: 2026-06-10
---

# Phase 3 Plan 03: ParallaxCard Test Harness + Browser Verification Summary

**ScrollProvider wired to app root, ScrollTrigger font-load refresh added, brand-styled 3-card test harness built with RevealSection + ParallaxCard — all 6 Phase 3 success criteria verified by human in a real browser.**

## Performance

- **Duration:** ~2 sessions
- **Completed:** 2026-06-10
- **Tasks:** 3 (2 auto + 1 human checkpoint)
- **Files created:** 0 new source files
- **Files modified:** 2 (src/main.tsx, src/App.tsx)

## Accomplishments

- `src/main.tsx` updated: `<ScrollProvider>` wraps `<App />` inside `<StrictMode>` — every component in the tree can now call `useScrollContext()` without a missing-provider error.
- `src/App.tsx` updated: `useEffect` calls `document.fonts.ready.then(() => ScrollTrigger.refresh())` — resolves the known Playfair Display async-load issue where ScrollTrigger would compute wrong trigger offsets against the fallback font's layout metrics.
- Brand-styled 3-card demo section added below existing hero: RevealSection heading ("Projects") + staggered 3-card row, each card a `ParallaxCard` with 2 layers (background gradient + text body) at speeds 0.15 / 0.25 / 0.35.
- **Human verification PASSED** — all 6 checks confirmed in Chrome:
  1. Exactly 1 scroll listener on `window`, `passive: true`
  2. Reveal animation: heading + cards stagger in smoothly on scroll
  3. Parallax depth: distinct drift speeds across 3 cards, background and text layers move independently
  4. Reduced motion: cards appear instantly, no animation, no parallax
  5. Mobile: cards static at 390px width (parallax disabled)
  6. Console clean: no GSAP warnings, React errors, or null pointer errors

## Task Commits

1. **Task 1: Wire ScrollProvider in main.tsx + ScrollTrigger.refresh() on fonts.ready** — `8153fe9`
2. **Task 2: Brand-styled ParallaxCard + RevealSection test harness** — `47d47ff`
3. **Fix: ParallaxCard clipping and RevealSection stagger** — `d913a50`
4. **Cleanup: Prettier formatting + remove stale scaffold src/index.css** — `f9600c9`
5. **Task 3: Human checkpoint — APPROVED** — confirmed via this session

## Decisions Made

- **ScrollProvider wraps entire app root** — placed in main.tsx (not App.tsx) so it is above all providers and StrictMode double-mount stress-tests the rAF loop safely.
- **`document.fonts.ready` hook confirmed necessary** — Playfair Display loads asynchronously from Google Fonts; without the refresh, ScrollTrigger measures layout against the system fallback font, which has different line metrics and causes trigger offsets to be off by tens of pixels.
- **Parallax speeds confirmed at 0.15 / 0.25 / 0.35** — visual calibration during human verification showed these produce a convincing depth gradient without the fastest card (0.35) feeling detached from the page. These speeds are locked as the Phase 6 baseline.

## Deviations from Plan

None — plan executed as specified.

## Issues Encountered

None during this plan. (Prior session applied one fix commit `d913a50` for ParallaxCard clipping and RevealSection stagger — resolved before this verification session.)

## Verification Performed

Human browser verification — all 6 checks passed:
- 1 passive scroll listener confirmed via `getEventListeners(window).scroll`
- Reveal animation, parallax depth, reduced-motion, mobile, and console all confirmed visually

## Self-Check: PASSED

**Modified files (verified in git log):**
- `src/main.tsx` — MODIFIED (`8153fe9`)
- `src/App.tsx` — MODIFIED (`47d47ff`, `d913a50`, `f9600c9`)

**Human checkpoint:** APPROVED by user 2026-06-10

---
*Phase: 03-scroll-infrastructure*
*Completed: 2026-06-10*
