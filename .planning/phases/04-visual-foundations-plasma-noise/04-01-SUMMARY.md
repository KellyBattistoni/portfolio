---
phase: 04-visual-foundations-plasma-noise
plan: 01
subsystem: ui
tags: [ogl, webgl2, plasma, shader, react19, fallback, css-keyframes]

# Dependency graph
requires:
  - phase: 01-scaffold-safety-rails
    provides: AnimationErrorBoundary, brand tokens (--color-brand-bg #050505, --color-brand-accent #FF4500) in src/styles/index.css
  - phase: 03-scroll-infrastructure
    provides: scroll source-of-truth conventions (consumed later by HeroBackdrop in plan 04-02, not by this plan's leaf components)
provides:
  - "<Plasma> — pure OGL WebGL2 component with StrictMode-hard cleanup (cancelAnimationFrame -> ResizeObserver.disconnect -> removeEventListener -> WEBGL_lose_context.loseContext -> canvas.width/height = 0 -> DOM detach)"
  - "<PlasmaFallback> — zero-WebGL CSS-only multi-stop radial gradient (deep red -> #050505) with optional opacity-only pulse"
  - "@keyframes plasma-fallback-pulse in src/styles/index.css with prefers-reduced-motion override"
  - "ogl@^1.0.11 dependency pinned (ships own types/index.d.ts — no @types/ogl)"
  - "vertex + fragment GLSL extracted verbatim from inspo.txt into Plasma.shaders.ts"
affects: [04-visual-foundations-plasma-noise plan 04-02, 04-visual-foundations-plasma-noise plan 04-03, 05-hero-pillnav]

# Tech tracking
tech-stack:
  added: [ogl@1.0.11]
  patterns:
    - "WebGL lifecycle inside useEffect (NOT useGSAP) — GSAP-react useGSAP only frees GSAP resources, not GL contexts / rAF IDs / ResizeObservers"
    - "Cleanup-order discipline for WebGL: stop loop -> stop observers -> remove listeners -> loseContext -> zero canvas dims -> DOM detach"
    - "DPR capped at min(devicePixelRatio, 2) to dodge thermal throttling on iPhone Pro (DPR 3)"
    - "Float32Array uniforms written in place, never reallocated inside rAF loop"
    - "Container-scoped mousemove (NOT window) for hero-bound interaction"
    - "Locked literal prop types (direction: 'forward') to strip dead branches from hot rAF loop"
    - "Belt-and-suspenders CSS: prefers-reduced-motion @media override at keyframes level even though dispatcher already gates `animated`"

key-files:
  created:
    - src/components/plasma/Plasma.shaders.ts
    - src/components/plasma/Plasma.tsx
    - src/components/plasma/PlasmaFallback.tsx
  modified:
    - src/styles/index.css
    - package.json
    - package-lock.json

key-decisions:
  - "Shaders extracted to Plasma.shaders.ts (separate file) — ~60 LOC of GLSL would crowd Plasma.tsx; separation makes IDE syntax highlighting easier and decouples shader edits from React lifecycle edits"
  - "direction prop locked to literal `'forward'` — pingpong/reverse code from inspo deleted as dead-code-in-hot-loop"
  - "uSpeed wired as `speed * 0.4` (inspo trick) — preserves the [0..1] slider feel users expect while keeping the actual shader speed in the slow/meditative range"
  - "PlasmaFallback gradient stops chosen: 0% / 25% / 55% / 90% (ellipse hot-spot at 50% 45%) — sits the orange core slightly above middle, matches where the eye expects a horizon in a wide-aspect hero"
  - "Pulse keyframes: opacity 0.85 -> 1 -> 0.85 over 7s ease-in-out — 7s sits in the middle of the CONTEXT.md 6-8s range; range chosen to stay clearly subliminal"
  - "Doc-comment in PlasmaFallback.tsx rewritten to avoid the literal strings 'canvas' / 'ogl' — the phase verification grep is case-sensitive and the spec demands 0 matches; meaning preserved via 'WebGL bindings or 3D renderer imports' phrasing"
  - "No @types/ogl installed — ogl@1.0.11 ships its own types at ./types/index.d.ts (verified via node_modules/ogl/package.json)"

patterns-established:
  - "Leaf-component discipline: Plasma.tsx has zero awareness of device capabilities, scroll state, or mount decisions — the HeroBackdrop dispatcher (plan 04-02) owns ALL of that"
  - "WebGL cleanup ritual: any future GL component MUST follow the 6-step cleanup order documented in Plasma.tsx"

# Metrics
duration: 4 min
completed: 2026-06-10
---

# Phase 4 Plan 01: Plasma Leaf Components Summary

**Pure-OGL `<Plasma>` with React-19 StrictMode-hard cleanup + zero-WebGL `<PlasmaFallback>` radial-gradient backdrop with opacity-pulse keyframes.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-10T23:50:42Z
- **Completed:** 2026-06-10T23:54:22Z
- **Tasks:** 3
- **Files created:** 3 (`Plasma.shaders.ts`, `Plasma.tsx`, `PlasmaFallback.tsx`)
- **Files modified:** 3 (`src/styles/index.css`, `package.json`, `package-lock.json`)

## Accomplishments

- Installed `ogl@1.0.11` (current published version, matches inspo pin, Unlicense — safe to ship). No `@types/ogl` needed — package ships own `types/index.d.ts`.
- Ported the Plasma `vertex` + `fragment` GLSL **character-for-character** from `inspo.txt /src/Component.tsx` into `Plasma.shaders.ts`. The `sanitize()` NaN/Inf guard, the inspo `mainImage` for-loop body, and the uniform list are all byte-identical to the source.
- Built `<Plasma>` as a pure leaf component: WebGL2 `Renderer` (alpha, no MSAA, DPR ≤ 2), `Program` with 10 uniforms (Float32Array written in place — never reallocated inside the rAF loop), `Triangle` geometry, `Mesh`. ResizeObserver wires the canvas to its container; mousemove is container-scoped (not window). Direction is locked to the literal type `'forward'` — all pingpong/reverse branches stripped from the inspo port.
- StrictMode-hard cleanup implemented in the documented 6-step order: `cancelAnimationFrame` → `ResizeObserver.disconnect` → `removeEventListener('mousemove')` → `WEBGL_lose_context.loseContext()` → `canvas.width = 0; canvas.height = 0` → `removeChild` (try/catch). Without steps 4 and 5, React 19's dev double-mount leaks one GL context per HMR cycle and crashes iOS Safari tabs after repeated mount/unmount.
- Built `<PlasmaFallback>` with zero WebGL footprint — a CSS-only multi-stop deep-red-to-black radial gradient (ellipse at 50% 45%, stops at 0% / 25% / 55% / 90%) with optional opacity-only pulse via the `animated` prop. Verified: `grep "canvas\|ogl" src/components/plasma/PlasmaFallback.tsx` returns 0 matches.
- Added `@keyframes plasma-fallback-pulse` (opacity 0.85 → 1 → 0.85 over 7s ease-in-out infinite) to `src/styles/index.css` with a belt-and-suspenders `@media (prefers-reduced-motion: reduce)` override that flattens the pulse to static even if a future caller forgets to gate `animated`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install ogl + extract shaders to Plasma.shaders.ts** — `5ccd198` (chore)
2. **Task 2: Build the pure `<Plasma>` OGL component with StrictMode-hard cleanup** — `4247075` (feat)
3. **Task 3: Build `<PlasmaFallback>` + add @keyframes plasma-fallback-pulse** — `cea5202` (feat)

Plan metadata commit follows separately.

## Files Created/Modified

- `src/components/plasma/Plasma.shaders.ts` — Exports `vertex` and `fragment` as plain template-literal strings. ~60 lines of GLSL, including the `sanitize()` NaN/Inf guard.
- `src/components/plasma/Plasma.tsx` — `<Plasma>` function component + `PlasmaProps` interface + `hexToRgb` helper. Single `useEffect` owns the entire GL lifecycle; cleanup is in the documented 6-step order.
- `src/components/plasma/PlasmaFallback.tsx` — `<PlasmaFallback>` function component + `PlasmaFallbackProps` interface (single optional `animated` boolean). Zero WebGL, zero `ogl` import.
- `src/styles/index.css` — Appended `@keyframes plasma-fallback-pulse` block + `prefers-reduced-motion` override block.
- `package.json` — Added `"ogl": "^1.0.11"` to `dependencies`.
- `package-lock.json` — Regenerated with the ogl entry.

## Decisions Made

See `key-decisions` in frontmatter for the canonical list. Highlights:

- **Locked `direction: 'forward'` literal type** — pingpong and reverse code paths from the inspo port were dead code in a hot rAF loop; deleting them shrinks the loop body and removes mental overhead. Future callers cannot accidentally re-enable them without widening the type back.
- **`uSpeed: speed * 0.4` inspo trick preserved** — maps the user-friendly `speed` prop [0..1] into the actual shader's slow/meditative range. `speed = 0.35` (the default) becomes a shader `uSpeed` of `0.14`.
- **PlasmaFallback gradient stops at 0% / 25% / 55% / 90%** — chosen by eye; the steep early falloff (0% → 25%) holds the hot orange core compact, the long tail (55% → 90%) bleeds atmospherically into `#050505`. Ellipse rather than circle matches wide-aspect hero proportions.
- **Pulse duration 7s** — the middle of the CONTEXT.md 6-8s range. Picks a value that is clearly slow but not so slow it reads as static.
- **Belt-and-suspenders CSS reduced-motion override** — the HeroBackdrop dispatcher (plan 04-02) will gate `animated` based on `prefersReducedMotion`, but the CSS itself also flattens the pulse under `@media (prefers-reduced-motion: reduce)` so a future regression in the dispatcher cannot resurface motion for the affected users.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Doc-comment string literals tripped Task 3 verify grep**

- **Found during:** Task 3 (PlasmaFallback creation)
- **Issue:** The initial JSDoc on `PlasmaFallback.tsx` contained literal strings `"canvas"` and `"ogl"` inside a hard-constraints block (e.g. `• NO <canvas> element.`, `• NO \`ogl\` import.`, and the verification command itself written out). The plan's Task 3 verify and phase verification §4 both demand `grep -c "canvas\|ogl" src/components/plasma/PlasmaFallback.tsx` return 0. The initial file returned 3 (all in comments). Runtime code was already canvas-free and ogl-free, so this was a documentation-vs-verification-tooling mismatch, not a real defect.
- **Fix:** Rewrote the JSDoc to describe the constraint without using those literal lowercase strings ("WebGL bindings or 3D renderer imports") while preserving the documented intent.
- **Files modified:** `src/components/plasma/PlasmaFallback.tsx`
- **Verification:** `grep -c "canvas\|ogl" src/components/plasma/PlasmaFallback.tsx` now returns 0; case-sensitive `grep "canvas|ogl|webgl"` also returns 0. Build + lint still pass.
- **Committed in:** `cea5202` (Task 3 commit — discovered before commit, so folded in)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Zero scope creep. Documentation phrasing tightened to satisfy the verification grep without losing meaning. The runtime contract (zero WebGL footprint) was met from the start.

## Issues Encountered

- `node -e "console.log(require('ogl/package.json').version)"` (the verify command literally suggested by the plan) failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` because ogl's `exports` map does not expose `./package.json` to the CommonJS loader. Worked around by reading `node_modules/ogl/package.json` directly via `fs.readFileSync`. Confirmed version `1.0.11`. Not a code defect — npm package authors increasingly close `package.json` to consumers.
- `npm run build` rebuilt only the Vite-reachable graph (74 modules). `Plasma.tsx` and `PlasmaFallback.tsx` are currently dead code (no importer until plan 04-02 lands `<HeroBackdrop>`). TypeScript still validated them via `tsc -b` — both passed strict mode with zero `any` errors beyond the documented `iTime` uniform cast.

## TypeScript / OGL Types Notes

- OGL ships `types/index.d.ts`. Imports resolve cleanly: `import { Mesh, Program, Renderer, Triangle } from 'ogl'`.
- `program.uniforms.iTime` is typed loosely; the `(program.uniforms.iTime as { value: number }).value = ...` cast in the rAF loop is the documented inspo pattern and is the only cast in the file. `program.uniforms.iResolution.value` and `program.uniforms.uMouse.value` are cast to `Float32Array` where they are written into in place.
- The unused `direction` prop is acknowledged via `void direction` so it can stay in the `useEffect` dependency array without triggering the `no-unused-vars` rule. This is the documented escape hatch for "prop included for dep-array completeness but not directly consumed."

## User Setup Required

None — no external service configuration required. ogl is a pure JS dependency; no API keys, no env vars, no dashboard setup.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `src/components/plasma/Plasma.shaders.ts`
- FOUND: `src/components/plasma/Plasma.tsx`
- FOUND: `src/components/plasma/PlasmaFallback.tsx`
- FOUND: `src/styles/index.css` (modified, contains `plasma-fallback-pulse`)
- FOUND: `package.json` (contains `"ogl": "^1.0.11"`)

Verified commits exist:

- FOUND: `5ccd198` (Task 1 — chore: install ogl + shaders)
- FOUND: `4247075` (Task 2 — feat: Plasma component)
- FOUND: `cea5202` (Task 3 — feat: PlasmaFallback + keyframes)

Verified verification grep results:

- `grep -c "uMouseInteractive" src/components/plasma/Plasma.shaders.ts` ≥ 1: PASS (5 hits)
- `grep "sanitize" src/components/plasma/Plasma.shaders.ts`: PASS
- `grep -c "WEBGL_lose_context" src/components/plasma/Plasma.tsx` ≥ 1: PASS (2 hits)
- `grep -c "canvas.width = 0" src/components/plasma/Plasma.tsx` ≥ 1: PASS (2 hits)
- `grep "useGSAP\|useDeviceCapabilities" src/components/plasma/Plasma.tsx`: PASS (0 hits)
- `grep "Math.min(window.devicePixelRatio" src/components/plasma/Plasma.tsx` ≥ 1: PASS (1 hit)
- `grep "container.addEventListener('mousemove'" src/components/plasma/Plasma.tsx` ≥ 1: PASS (1 hit)
- `grep "window.addEventListener('mousemove'" src/components/plasma/Plasma.tsx`: PASS (0 hits)
- `grep -c "canvas\|ogl" src/components/plasma/PlasmaFallback.tsx` returns 0: PASS
- `grep "plasma-fallback-pulse" src/styles/index.css` ≥ 2: PASS (2 hits — base + reduced-motion override)
- `grep "PlasmaFallback" src/components/plasma/PlasmaFallback.tsx`: PASS

## Next Phase Readiness

- Both leaf components are ready for plan 04-02 (`<HeroBackdrop>` dispatcher) to consume:
  - `import { Plasma } from '@/components/plasma/Plasma'`
  - `import { PlasmaFallback } from '@/components/plasma/PlasmaFallback'`
- Nothing is wired into the running app yet — `App.tsx` is unchanged. That's plan 04-02's job. A browser visit today shows no visible change, which is correct.
- No blockers. ogl is pinned, types resolve, both components build clean and lint clean.

---

_Phase: 04-visual-foundations-plasma-noise_
_Completed: 2026-06-10_
