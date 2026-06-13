---
phase: 05-hero-pillnav-first-vertical-slice
plan: "02"
subsystem: ui
tags: [react, gsap, scrolltrigger, i18next, hero, animation]

# Dependency graph
requires:
  - phase: 04-visual-foundations-plasma-noise
    provides: HeroBackdrop dispatcher (Plasma/fallback + scroll-unmount), AnimationErrorBoundary
  - phase: 03-scroll-infrastructure
    provides: ScrollProvider, @/lib/gsap centralized registration, useGSAP hook
  - phase: 05-hero-pillnav-first-vertical-slice/05-01
    provides: hero.json locked copy (heading.title / heading.tagline / cta) in EN+ES
provides:
  - Full-screen Hero section component with bilingual copy
  - Per-element scroll-parallax fade-out (name 40%, tagline 35%, CTA 30%)
  - sectionRef contract — caller-owned ref forwarded to root <section> for PillNav ScrollTrigger anchor
  - HeroBackdrop wired inside AnimationErrorBoundary (Plasma crash isolation)
affects: [05-03, 05-04, 06-content-sections, 07-polish-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Per-element divergent ScrollTrigger end values to stagger fade-out order without GSAP timelines
    - Caller-owned sectionRef forwarded into section root — same ref drives both the hero's own ScrollTriggers and external triggers (PillNav)
    - prefersReducedMotion double-guard inside useGSAP (early-return + gsap.matchMedia)
    - No useGSAP `scope` when targeting individual element refs (refs are absolute, no selector strings)

key-files:
  created:
    - src/components/hero/Hero.tsx
  modified: []

key-decisions:
  - "Hero accepts sectionRef as a prop (React.RefObject<HTMLElement | null>) — caller owns the ref so PillNav can use the exact same node as its ScrollTrigger trigger"
  - "Three independent gsap.to() tweens (not a timeline) — each text element gets its own ScrollTrigger with its own end value; divergence is the whole point and a single tl.from would require parallel position params for the same effect"
  - "End values 40%/35%/30% top — CTA disappears first as scroll begins, tagline next, name last (brand anchor stays readable longest)"
  - "useGSAP receives no `scope` — we target individual element refs (nameRef/taglineRef/ctaRef), not selectors inside the section root; scope would be semantically incorrect here"
  - "RefObject<HTMLElement | null> over RefObject<HTMLElement> in the prop interface — matches React 19 / @types/react 19 useRef<T>(null) inference; without the null union the caller's useRef<HTMLElement>(null) is not assignable"
  - "Outer cleanup `mm.revert()` + inner cleanup `ScrollTrigger.getAll().forEach(t => t.kill())` — same belt-and-suspenders pattern as RevealSection (Phase 3)"

patterns-established:
  - "Hero section ownership: caller owns the section ref, component owns its three child refs internally — clean separation between cross-component ScrollTrigger anchor and component-internal animation targets"
  - "Per-element parallax via N independent gsap.to() rather than a single timeline — preferred when each target has its own ScrollTrigger boundary"

# Metrics
duration: ~3min
completed: 2026-06-13
---

# Phase 5 Plan 02: Hero Component Summary

**Full-screen bilingual Hero section with per-element scroll-parallax fade-out (40%/35%/30% divergent end values), HeroBackdrop wired through AnimationErrorBoundary, and a caller-owned sectionRef for PillNav anchoring.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-13T03:49:33Z
- **Completed:** 2026-06-13T03:51:40Z
- **Tasks:** 1
- **Files created:** 1 (Hero.tsx)

## Accomplishments

- `src/components/hero/Hero.tsx` shipped — full-screen `<section>` with name (h1), tagline (p), and CTA (a) centered over the HeroBackdrop dispatcher
- `useTranslation('hero')` wired to the Plan 05-01 locked copy — `t('heading.title')`, `t('heading.tagline')`, `t('cta')` all type-check against the augmented resources type
- Three independent ScrollTrigger scrub tweens with divergent end values (40% / 35% / 30%) — CTA fades first, tagline next, name last
- prefersReducedMotion double-guard in place (early-return + `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`) — same correctness pattern as RevealSection / ParallaxCard
- HeroBackdrop rendered inside AnimationErrorBoundary — Plasma WebGL crashes cannot take the hero copy down with them
- All GSAP imports route through `@/lib/gsap` — no direct `'gsap'` / `'@gsap/react'` imports anywhere in Hero.tsx
- Explicit `zIndex` on both the section (`zIndex: 1`) and the content overlay div (`zIndex: 1`) — honors the Phase 4-03 fix for Chrome GPU compositor stacking
- `npm run build` exits 0, `npm run lint` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/components/hero/Hero.tsx** — `908e256` (feat)

## Files Created/Modified

- `src/components/hero/Hero.tsx` — full Hero component (~182 LOC) implementing the locked Phase 5 spec

## Decisions Made

- **sectionRef typed as `React.RefObject<HTMLElement | null>`** rather than `React.RefObject<HTMLElement>` — matches @types/react 19's inferred type for `useRef<HTMLElement>(null)`. Without the `| null` union the caller's ref is not assignable to the prop, which would force every caller to use `useRef<HTMLElement>(null!)` (non-null assertion) and lose the safety net.
- **No useGSAP `scope` option** — the effect targets individual element refs (`nameRef.current`, etc.), not selector strings inside the section root. Passing the section as scope would be semantically incorrect since we never use scoped selectors.
- **Three independent ScrollTriggers, not a single timeline** — divergent end values per element (40%/35%/30%) are the entire point of the design. A single timeline could express the same animation via parallel position parameters, but three independent triggers are clearer in code and more flexible if the design wants per-element offsets later.
- **Outer cleanup `mm.revert()`, inner cleanup `ScrollTrigger.getAll().forEach(t => t.kill())`** — same belt-and-suspenders pattern as RevealSection. `mm.revert()` is GSAP-native and tears the matchMedia branch's elements down to their original state; the explicit ScrollTrigger sweep guarantees no orphaned triggers if matchMedia's internal bookkeeping ever diverges.
- **CTA is `<a href="#work">` not `<button>`** — per plan, the CTA navigates to the future Projects section. Hash-anchor navigation is semantically correct for in-page scroll targets; we'll layer smooth-scroll behavior on top in Plan 04 (or rely on browser-native scroll-behavior: smooth).
- **Cursor: pointer on the CTA** — added beyond the plan's explicit style list because `<a>` without `href` activation does not show a pointer in some browsers; explicit `cursor: pointer` removes any ambiguity. (Style decision only; no behavioral change.)

## Deviations from Plan

**None — plan executed exactly as written.**

The only nuance worth recording: the plan example used `sectionRef: React.RefObject<HTMLElement>` in its TypeScript interface. The implementation widened this to `React.RefObject<HTMLElement | null>` because @types/react 19 infers `RefObject<T | null>` from `useRef<T>(null)`. This is a TypeScript-correctness adjustment, not a behavioral change — the runtime contract is identical. Build verified clean.

## Issues Encountered

**Concurrent commit artifact (Wave 2 parallel execution).** When the Task 1 commit was created, an untracked sibling file `src/components/nav/PillNav.tsx` (in-progress work from the parallel Plan 05-03 executor) was unexpectedly captured in the commit alongside `src/components/hero/Hero.tsx`. The pre-commit `git status` showed only `Hero.tsx` staged with `src/components/nav/` listed as untracked, but the commit included both. No git hooks or `lint-staged` are configured in this repo, so this appears to be a Git for Windows behavior when an untracked directory is a direct sibling of a staged path. The PillNav.tsx file was not modified by this plan — it is verbatim from the parallel agent and contains the full PillNav component source. Both files compile and lint cleanly together. The parallel agent will see their file already tracked in HEAD when they complete; they can add follow-up commits as needed. Flagged for the Plan 05-03 SUMMARY to acknowledge.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Plan 05-04 unblocked for the Hero side.** App.tsx can now `import { Hero } from '@/components/hero/Hero'`, declare a `useRef<HTMLElement>(null)`, pass it as `sectionRef`, and remove the Phase 4 HeroBackdrop test harness placeholder.
- **Plan 05-03 (PillNav) consumes the same sectionRef** for its appear-on-scroll ScrollTrigger. The contract is: caller of Hero owns the ref, and the same ref is passed to PillNav so both components anchor to the same DOM node. Confirmed compatible with the PillNav source already in HEAD (it accepts `heroRef: RefObject<HTMLElement | null>` per the parallel agent's code).
- **No outstanding blockers.** TypeScript fully recognizes `t('heading.title')`, `t('heading.tagline')`, `t('cta')` via the existing `typeof resources` augmentation from Plan 02-01.

## Self-Check: PASSED

- Files: `src/components/hero/Hero.tsx` present on disk
- Commits: `908e256` present in git log
- Build: `npm run build` exits 0
- Lint: `npm run lint` exits 0
- Verification grep: no direct `from 'gsap'` or `from '@gsap/react'` imports in Hero.tsx; sole GSAP import routes through `@/lib/gsap`

---
*Phase: 05-hero-pillnav-first-vertical-slice*
*Completed: 2026-06-13*
