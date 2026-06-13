---
phase: 05-hero-pillnav-first-vertical-slice
plan: "03"
subsystem: navigation
tags: [pillnav, mobilenav, gsap, scrolltrigger, timeline, i18n]

# Dependency graph
requires:
  - phase: 05-01
    provides: position-neutral LanguageSwitcher (className prop) + common.nav.* locale keys
  - phase: 03-01
    provides: @/lib/gsap module-level plugin registration (gsap, ScrollTrigger, useGSAP)
  - phase: 03-02
    provides: useDeviceCapabilities() hook (prefersReducedMotion source of truth)
provides:
  - PillNav component — desktop scroll-triggered fixed pill nav with rising-circle hover
  - MobileNav component — mobile hamburger trigger + GSAP-timeline side panel
  - Both components consume `heroRef` (RefObject<HTMLElement | null>) as ScrollTrigger anchor
affects: [05-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Timeline-direction toggle (tlRef.current.reversed(!tlRef.current.reversed())) instead of useState-as-useGSAP-dependency anti-pattern
    - Rising-circle hover via real DOM (.nav-circle + .nav-text) — not CSS pseudo-elements — so GSAP can drive both targets independently
    - contextSafe wraps every handler that fires outside the React render cycle (mouseenter/mouseleave/click) so GSAP context can revert them on unmount
    - Reduced-motion fallback for animated panels — display:flex/none toggle driven by isOpen state via conditional spread on the style prop

key-files:
  created:
    - src/components/nav/PillNav.tsx
    - src/components/nav/MobileNav.tsx
  modified: []

key-decisions:
  - "PillNav entrance: x:-20 -> 0 + autoAlpha 0 -> 1 over 0.5s power2.out at scrollTrigger 70% hero top, once:true (self-killing trigger)"
  - "gsap.set hiding the pill placed INSIDE the no-preference matchMedia branch — reduced-motion users see the nav visible from first paint, no animation flicker"
  - "Rising-circle hover: nav-circle scale 0->1 (0.25s power2.out enter / 0.2s power2.in leave); nav-text y:0 -> -4 (0.2s power2.out both directions)"
  - "MobileNav timeline built once inside useGSAP and parked reversed at t=0 — toggling only flips tl.reversed(!tl.reversed()), isOpen state is for ARIA + icon swap only"
  - "Panel timeline composition: .to(panel, x:0%) then .from(items, autoAlpha:0 y:20 stagger:0.08) with '-=0.15' overlap so items start rising before the panel finishes sliding"
  - "Nav-link click defers scrollIntoView by 150ms after handleClose so the panel close animation starts before the page begins scrolling"
  - "Reduced-motion MobileNav: skip timeline entirely; panel opens/closes via display:flex/none from isOpen, trigger renders visible from paint"
  - "Panel width 75vw / maxWidth 320px — comfortable for <=430px viewports without monopolizing the screen on slightly larger phones"

patterns-established:
  - "Two-component navigation layer (desktop + mobile) sharing trigger timing, nav-item data, and LanguageSwitcher composition — built in one plan to prevent duplication drift"
  - "When useGSAP needs reduced-motion fallback behavior that requires React state (panel open/close), keep the GSAP timeline + state independent: timeline drives animation, state drives ARIA + reduced-motion display toggle"

# Metrics
duration: ~4min
completed: 2026-06-13
---

# Phase 5 Plan 03: PillNav + MobileNav Summary

**Both navigation components built to spec: desktop PillNav with rising-circle hover and scroll-triggered entrance, mobile MobileNav with paused GSAP timeline driving the side panel — both consuming heroRef as the shared 70% scroll anchor, both composing the position-neutral LanguageSwitcher from Plan 05-01.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-13T03:49:50Z
- **Completed:** 2026-06-13T03:53:21Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- `src/components/nav/PillNav.tsx` (220 lines) — desktop pill nav with four nav items (About / Work / Stack / Contact), rising-circle hover (real DOM `.nav-circle` + `.nav-text` spans), scroll-triggered entrance (slide left-to-right at 70% hero scroll), composed `<LanguageSwitcher className="flex gap-3" />`
- `src/components/nav/MobileNav.tsx` (262 lines) — hamburger trigger (☰/×) + side panel sliding from the right via GSAP timeline, nav items stagger 0.08s, backdrop overlay and × icon both call `handleClose`, nav-link click closes panel then defers `scrollIntoView` by 150ms, composed `<LanguageSwitcher className="mt-6 flex gap-4" />` inside panel
- Timeline-direction toggle pattern (`tlRef.current.reversed(!tlRef.current.reversed())`) avoids the useState-as-useGSAP-dependency anti-pattern — timeline is built once and only its direction flips
- `contextSafe` wraps every handler that fires outside React's render cycle (`handleMouseEnter`, `handleMouseLeave`, `handleToggle`, `handleClose`, `handleNavClick`) so GSAP can revert them on unmount
- Reduced-motion handled cleanly in both components: PillNav early-returns and renders visible immediately; MobileNav skips the timeline and uses `display:flex/none` style toggle driven by `isOpen`
- All GSAP imports route through `@/lib/gsap` — no direct `'gsap'` or `'@gsap/react'` imports in either file
- `npm run build` and `npm run lint` both exit 0 after each task

## Task Commits

Each task was committed (with a deviation noted below for Task 1):

1. **Task 1: Create src/components/nav/PillNav.tsx** — `908e256` (feat, bundled with Plan 05-02 Hero commit — see Deviations)
2. **Task 2: Create src/components/nav/MobileNav.tsx** — `a1e7b99` (feat)

## Files Created/Modified

- `src/components/nav/PillNav.tsx` — new, 220 lines, exports `PillNav` with `PillNavProps { heroRef: RefObject<HTMLElement | null> }`
- `src/components/nav/MobileNav.tsx` — new, 262 lines, exports `MobileNav` with `MobileNavProps { heroRef: RefObject<HTMLElement | null> }`

## Decisions Made

- **`RefObject<HTMLElement | null>` for `heroRef` prop type** — React 19 RefObject is non-nullable at the type level, but `useRef<HTMLElement>(null)` produces `RefObject<HTMLElement | null>`; matching the call-site type explicitly avoids "Type 'RefObject<HTMLElement>' is not assignable" friction when App.tsx (Plan 05-04) passes the ref down
- **`item.key satisfies NavItemKey` in `t()` calls** — narrows the literal type at the call site so `t('nav.about')` / `t('nav.work')` / etc. all type-check against the existing `typeof resources` augmentation without manual d.ts edits
- **`gsap.set(pillRef.current, { autoAlpha: 0, x: -20 })` placed INSIDE the no-preference matchMedia callback** (per plan note) — reduced-motion users never get the hidden state applied, so the nav is visible on first paint with zero animation
- **Timeline parked at `tl.reverse(0)` after construction** — initial `tl.reversed() === true`, so the first `tl.reversed(!tl.reversed())` call plays it forward (open). Cleaner than tracking a separate "isFirstToggle" flag
- **`nextOpen = tl.reversed()` captured BEFORE the flip** — reads the pre-flip direction, which equals the post-flip ARIA state (current reversed=true means we're about to play forward = opening = next isOpen will be true)
- **Reduced-motion MobileNav uses `display:flex/none` instead of `visibility`** — `visibility:hidden` would still reserve layout, but the panel is `position:fixed` so it wouldn't matter. `display:none` is the most explicit "this element is functionally absent" signal for assistive tech
- **Panel `display: flex` always-on for non-reduced-motion users** — GSAP timeline handles off-screen positioning via `x:100%`; toggling display would conflict with the timeline's transform tweens

## Deviations from Plan

### Parallel Wave Cross-Commit (Rule 3 — blocking artifact)

**1. [Rule 3 - Blocking] Task 1's PillNav.tsx was bundled into the Plan 05-02 commit (`908e256`)**

- **Found during:** End of Task 1 (after `npm run build` passed, before commit)
- **Issue:** Plan 05-03 was executed in Wave 2 in parallel with Plan 05-02 (Hero). The parallel agent executing 05-02 committed both `src/components/hero/Hero.tsx` and `src/components/nav/PillNav.tsx` together because both files were on disk at the time of staging. The 05-02 commit `feat(05-02): create Hero component with bilingual scroll-parallax fade-out` lists `src/components/nav/PillNav.tsx | 220 ++++` in its stat output.
- **Resolution:** PillNav.tsx content is correct and matches the Task 1 spec verbatim (verified via `git show 908e256:src/components/nav/PillNav.tsx`). Build and lint pass with the file in its committed form. Rather than re-write the same file just to produce a new commit, I'm acknowledging `908e256` as the effective Task 1 commit hash and proceeding to Task 2. Task 2 (`a1e7b99`) commits MobileNav.tsx cleanly under the correct `feat(05-03):` scope.
- **Future prevention:** Parallel-wave plans that create files in adjacent directories should either (a) gate their commits on a shared lock, or (b) wait for the other plan's commit before staging. The orchestrator could add a "post-task-pre-commit" git check that aborts if untracked files outside the plan's `files_modified` set appear in the staging step.
- **Files affected:** `src/components/nav/PillNav.tsx` (committed under 05-02 scope, content correct)
- **Commit:** `908e256` (Plan 05-02 commit that absorbed the Task 1 file)

### Auto-fixed Issues

None — neither component required deviation from the plan once written. The plan's `<action>` blocks gave near-final code; only minor typing tweaks (`RefObject<HTMLElement | null>` instead of `RefObject<HTMLElement>`, `satisfies NavItemKey` on the i18n key narrowing) were needed for the React 19 + strict TypeScript build to pass.

## Issues Encountered

- **Parallel-wave cross-commit** (above) — handled as documented; no rework required.
- **CRLF/LF Git warnings** on Windows during `git add` — expected and benign on this repo (matches every prior plan's experience).

## User Setup Required

None. PillNav and MobileNav are not yet mounted in `App.tsx` — that is Plan 05-04's responsibility. No environment variables, secrets, or external service configuration needed.

## Next Phase Readiness

- **Plan 05-04 (mount + cleanup) unblocked.** Both nav components compile clean and export their public API:
  - `PillNav({ heroRef }: { heroRef: RefObject<HTMLElement | null> })`
  - `MobileNav({ heroRef }: { heroRef: RefObject<HTMLElement | null> })`
- **Hero component from 05-02 also unblocked** — its `forwardRef` exposes `heroRef` (per the 05-02 commit message) which Plan 05-04 will pass into both nav components.
- **No outstanding blockers.** TypeScript fully recognizes `t('nav.about' | 'nav.work' | 'nav.stack' | 'nav.contact')` via the existing `typeof resources` augmentation; verified via `tsc -b` exit 0.
- **Standalone `<LanguageSwitcher />` in App.tsx still in place** — scheduled for removal in 05-04 once PillNav and MobileNav mount and own the switcher composition.

## Self-Check: PASSED

- Files: `src/components/nav/PillNav.tsx` (220 lines) and `src/components/nav/MobileNav.tsx` (262 lines) both present on disk
- Commits: `908e256` (contains PillNav.tsx, verified via `git log -- src/components/nav/PillNav.tsx`) and `a1e7b99` (Task 2 MobileNav commit) both present in `git log`
- Build: `npm run build` exits 0 with both files in place
- Lint: `npm run lint` exits 0 with both files in place
- Imports: 0 direct `'gsap'` / `'@gsap/react'` imports in either file (verified via grep)
- Verification block from plan: all 9 items pass

---
*Phase: 05-hero-pillnav-first-vertical-slice*
*Completed: 2026-06-13*
