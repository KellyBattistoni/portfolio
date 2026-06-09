---
phase: 01-scaffold-safety-rails
plan: "03"
subsystem: infra
tags: [react-hooks, device-capabilities, accessibility, webgl, media-query]

requires:
  - phase: 01-scaffold-safety-rails/01-01
    provides: Vite+React+TS scaffold, @/ alias, strict TypeScript

provides:
  - useDeviceCapabilities() hook — animation kill-switch
  - DeviceCapabilities type interface
  - Reactive prefersReducedMotion (OS toggle without reload)
  - Reactive isMobile (viewport resize with 16ms debounce)
  - isLowEnd detection (hardwareConcurrency + deviceMemory Chromium-only)
  - supportsWebGL2 probe (offscreen canvas, once on mount)

affects: [phase-03, phase-04, phase-05, phase-06 — all animation-using phases must import this hook]

tech-stack:
  added: []
  patterns:
    - MediaQueryList addEventListener for reactive OS preference changes
    - Debounced resize listener (16ms = 1 rAF frame) for viewport changes
    - SSR guard pattern: typeof window !== 'undefined' on all browser API access
    - navigator.deviceMemory undefined-guard for Firefox/Safari

key-files:
  created:
    - src/hooks/useDeviceCapabilities.ts
  modified:
    - src/App.tsx

key-decisions:
  - "Initial state computed synchronously via useState(getInitialCapabilities) — no flash of wrong state on first render"
  - "isLowEnd and supportsWebGL2 sampled once on mount only — hardware does not change at runtime"
  - "Resize debounce at 16ms (one rAF frame) — coalesces burst resize events without perceptible lag"
  - "deviceMemory guarded with typeof check — undefined on Firefox and Safari"

patterns-established:
  - "All future animation code must call useDeviceCapabilities() and respect all four flags"
  - "SSR guards on all window/navigator access — pattern for future hooks"
  - "Reactive media queries via addEventListener('change') not polling"

duration: 20min
completed: 2026-06-09
---

# Plan 01-03: useDeviceCapabilities Hook Summary

**Reactive animation kill-switch hook returning { prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 } — INFRA-02 safety rail fully established**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-06-09
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- `useDeviceCapabilities()` hook with all four capability axes
- `prefersReducedMotion` reactive via `MediaQueryList` `change` event — updates on OS toggle without page reload (WCAG 2.3.3 compliant)
- `isMobile` reactive via `resize` listener with 16ms debounce
- `isLowEnd` uses `hardwareConcurrency <= 4` primary, `deviceMemory < 4` secondary with Firefox/Safari undefined guard
- `supportsWebGL2` probes offscreen canvas once on mount, discards it
- All `window`/`navigator` access guarded for SSR safety
- `DeviceCapabilities` interface exported for typed consumers

## Task Commits

1. **Task 1: useDeviceCapabilities hook** - `88d9fcd` (feat)

## Files Created/Modified
- `src/hooks/useDeviceCapabilities.ts` — The hook + `DeviceCapabilities` interface
- `src/App.tsx` — Import + void-cast usage for TS smoke-test

## Decisions Made
- `useState(getInitialCapabilities)` (lazy initializer, not `useState(false)`) — avoids flash of wrong capability state on first paint
- `isLowEnd` does NOT update reactively — hardware cannot change at runtime, reading once on mount is correct
- `supportsWebGL2` does NOT update reactively — GL context availability is fixed at page load

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
- Bash permissions were denied for the subagent; file was created and verification was run by orchestrator. Both tsc and build passed.

## Next Phase Readiness
- Hook available at `@/hooks/useDeviceCapabilities` — ready for Phases 3, 4, 5, 6
- Plasma (Phase 4) checks `supportsWebGL2` + `prefersReducedMotion`; scroll (Phase 3) checks `prefersReducedMotion`; mobile layout (Phase 5) checks `isMobile`

---
*Phase: 01-scaffold-safety-rails*
*Completed: 2026-06-09*
