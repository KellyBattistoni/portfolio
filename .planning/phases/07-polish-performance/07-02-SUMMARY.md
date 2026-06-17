---
phase: 07-polish-performance
plan: "02"
subsystem: performance-accessibility
tags: [react-lazy, code-splitting, suspense, focus-visible, wcag, bundle-size]
dependency_graph:
  requires: []
  provides: [lazy-herobackdrop, focus-ring-css]
  affects: [src/components/hero/Hero.tsx, src/components/plasma/HeroBackdrop.tsx, src/styles/index.css]
tech_stack:
  added: []
  patterns: [React.lazy, Suspense, :focus-visible CSS selector]
key_files:
  created: []
  modified:
    - src/components/plasma/HeroBackdrop.tsx
    - src/components/hero/Hero.tsx
    - src/styles/index.css
decisions:
  - "Suspense boundary placed INSIDE AnimationErrorBoundary so async chunk load failures are caught by error boundary (RESEARCH.md Pitfall 2)"
  - "Named export preserved on HeroBackdrop; only a default export line added — React.lazy reads .default from dynamic import"
  - ":focus-visible chosen over :focus — keyboard-only activation, no mouse-click trigger (WCAG 2.4.7 + D-12)"
metrics:
  duration: "~5 min"
  completed: "2026-06-17"
  tasks: 2
  files: 3
---

# Phase 7 Plan 02: Bundle Split + Focus Ring Summary

HeroBackdrop/OGL/Plasma lazy-loaded as a separate async chunk (474KB main, 49KB async), eliminating Vite's >500KB warning; global :focus-visible rule adds #FF4500 focus ring to all 46 interactive elements in one CSS rule.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add default export to HeroBackdrop + wire React.lazy in Hero.tsx | a347497 | src/components/plasma/HeroBackdrop.tsx, src/components/hero/Hero.tsx |
| 2 | Add global :focus-visible rule to index.css | d188650 | src/styles/index.css |

## Acceptance Criteria — Verified

- [x] `src/components/plasma/HeroBackdrop.tsx` contains `export default HeroBackdrop` (line 78)
- [x] `src/components/hero/Hero.tsx` no longer contains `import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'`
- [x] `src/components/hero/Hero.tsx` contains `const HeroBackdrop = lazy(` (line 39)
- [x] `src/components/hero/Hero.tsx` contains `Suspense fallback={<PlasmaFallback />}` (line 162)
- [x] `src/styles/index.css` contains `:focus-visible` selector (line 51)
- [x] `src/styles/index.css` contains `outline: 2px solid #FF4500` (line 52)
- [x] `src/styles/index.css` contains `outline-offset: 2px` (line 53)
- [x] No bare `:focus {` rule in index.css
- [x] `npm run build` exits code 0 (verified twice)
- [x] Build output shows TWO JS chunks (main 474.09KB + async HeroBackdrop 49.26KB)
- [x] Vite >500KB chunk warning absent from build output

## Build Output

```
dist/assets/index-jkuJDZ-c.css         20.89 kB │ gzip:   4.71 kB
dist/assets/HeroBackdrop-DlSUEO4T.js   49.26 kB │ gzip:  15.13 kB
dist/assets/index-BsoetAm6.js         474.09 kB │ gzip: 160.61 kB
```

Bundle reduction: ~510KB → 474KB main chunk (OGL/Plasma now 49KB async).

## Deviations from Plan

None — plan executed exactly as written.

## Threat Coverage

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-07-03 | Suspense inside AnimationErrorBoundary — network failure shows PlasmaFallback, no blank screen |
| T-07-04 | :focus-visible is cosmetic; no auth boundary crossed |
| T-07-SC | No new packages installed |

## Known Stubs

None.

## Self-Check: PASSED

- `src/components/plasma/HeroBackdrop.tsx` — FOUND, default export at line 78
- `src/components/hero/Hero.tsx` — FOUND, lazy import at line 39, Suspense at line 162
- `src/styles/index.css` — FOUND, :focus-visible at line 51
- Commit a347497 — FOUND (Task 1)
- Commit d188650 — FOUND (Task 2)
