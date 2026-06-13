# Phase 4: Visual Foundations — Plasma + Noise - Research

**Researched:** 2026-06-10
**Domain:** OGL 1.0.11 WebGL2 shader background in a React 19 + Vite SPA with GSAP ScrollTrigger, ScrollProvider-driven mount/unmount, and `prefers-reduced-motion` / no-WebGL2 fallback
**Confidence:** HIGH on stack/primitives, HIGH on cleanup pattern, MEDIUM on mount-decision wiring (multiple valid approaches, recommended one is opinionated)

## Mouse Interaction Debug Analysis

**Added:** 2026-06-12
**Status:** Diagnosis of the 04-03 checkpoint regression — mouse warp behaves like "panning a photo" and (depending on axis) inverts cursor direction.
**Confidence:** HIGH — traced through inspo source, current source, and shader math with explicit numbers below.

### TL;DR

The shader is correct. The current `handleMouseMove` is wrong in three independent ways:

1. **Coordinate-space mismatch (DPR bug).** `uMouse` is written in **CSS pixels** while the shader's `center = iResolution.xy * 0.5` is in **drawing-buffer pixels** (CSS × DPR). On a Retina display (DPR = 2) the inspo's own demo only *appeared* to work because the demo container's CSS half-width happens to be a small number relative to the shader's `0.0002` coefficient — at viewport scale (1920×1080) this dimensional inconsistency produces ~400-pixel warps and cross-axis "crosstalk" (a horizontal mouse move bleeds into a vertical warp because `uMouse.y` and `center.y` are off by a factor of DPR).
2. **The `0.04` compression is applied around the wrong center.** The current code compresses around `cx = rect.width / 2` (CSS half), but the shader then subtracts `center = drawingBufferWidth / 2` (CSS half × DPR). On a non-Retina monitor (DPR = 1) the compression *does* work as intended; on Retina the compression delta is effectively cancelled by the DPR offset and the warp returns to near-full strength.
3. **The warp direction is the inspo's "feature", not a bug — but it is unintuitive at full-viewport scale.** The shader adds `mouseOffset * length(C - center)` to `C`, then reads the pattern at the shifted `C`. Sampling further to the right of where the fragment lives means the pattern visually moves to the **left** — i.e. **away** from the cursor. On the inspo's small 896×504 demo this reads as a gentle parallax. On a 1920×1080 hero it reads as the page being "shoved" away from the cursor — exactly the "moving a photo" sensation the user described. The current Y-flip *partially* addresses this for the Y axis but **does not address X**, which is why the user reports the fix still feels wrong.

The correct fix is to (a) work entirely in drawing-buffer pixels, (b) negate the delta so the pattern is pulled **toward** the cursor instead of pushed away, and (c) keep a compression factor (≈ 0.10–0.15) to stay subtle on a full-viewport hero. The lerp is fine and should stay.

### Q1 — What does the inspo pass as `uMouse`?

**Pixel coordinates, in CSS pixels, in the container's local frame, with y growing downward.** Not normalized, not flipped.

`inspo.txt` lines 621–629:

```ts
const handleMouseMove = (e: MouseEvent) => {
  if (!mouseInteractive || !containerRef.current) return;
  const rect = containerRef.current.getBoundingClientRect();
  mousePos.current.x = e.clientX - rect.left;   // [0, rect.width]   (CSS px)
  mousePos.current.y = e.clientY - rect.top;    // [0, rect.height]  (CSS px, top = 0)
  const mouseUniform = program.uniforms.uMouse.value as Float32Array;
  mouseUniform[0] = mousePos.current.x;
  mouseUniform[1] = mousePos.current.y;
};
```

**Critical dimensional inconsistency in the inspo:**
- `uMouse` is in **CSS pixels** (raw `clientX/Y` minus the rect offset).
- `iResolution` is in **drawing-buffer pixels** (`gl.drawingBufferWidth/Height`, which on DPR = 2 is double `rect.width/Height`).
- The shader compares them as if they were in the same space: `mouseOffset = (uMouse - center) * 0.0002`.

On the inspo's 896×504 demo at DPR = 2, `iResolution = (1792, 1008)` and `center = (896, 504)`. A mouse at the right edge gives `uMouse = (896, 252)`, so `(uMouse - center) = (0, -252)` — small enough that the `0.0002` coefficient × the `length(C - center)` factor (≈ 1028 at the corner) produces a corner displacement of ≈ 52 drawing-buffer pixels (≈ 26 CSS px). That is the "subtle nudge" the inspo's author tuned by eye.

**On a 1920×1080 hero at DPR = 2**, `iResolution = (3840, 2160)` and `center = (1920, 1080)`. Same right-edge mouse gives `uMouse = (1920, 540)`, so `(uMouse - center) = (0, -540)`. Displacement at the corner scales accordingly — **see Q4 for the actual numbers** — and it is no longer "subtle."

### Q2 — Is there any smoothing/lerp in the inspo?

**No.** The inspo writes the mouse position directly into the `uMouse` uniform Float32Array on every mousemove event. There is no rAF-side interpolation, no easing, no lerp. The smoothness in the demo comes from (a) the small displacement magnitudes at demo scale and (b) mousemove being naturally sample-rate-limited.

The lerp in the current implementation (`mouseCurrent += (mouseTarget - mouseCurrent) * 0.06`) is a **correct addition** for the full-viewport use case — without it, large viewport-scale jumps from one mousemove event to the next would feel jittery. **Keep the lerp.** It is not the source of the bug.

### Q3 — Is the listener on the container or the document?

**Inspo: container** (`containerRef.current.addEventListener('mousemove', handleMouseMove)`).

**Current implementation: document, with a bounds check.**

This change was reasonable on paper — a full-bleed canvas living behind a noise overlay (`<NoiseOverlay zIndex: 50, pointer-events: none>`) might not receive pointer events directly because GPU-composited layers above it can intercept them. But in practice the container in our Plasma component has `pointer-events: none` (it's `aria-hidden`), so neither approach would receive events naturally — both rely on bubbling. The `document` listener with a bounds check is **safer** for a hero that gets text content, PillNav, and a language switcher overlaid on top of it (Phase 5). Keep the document-level listener.

**One subtle bug in the current bounds check, however:** when the user moves the cursor *out* of the hero, `mouseTarget` keeps its last value, and the lerp keeps approaching that off-center value. The pattern never recovers to the neutral center. Either re-center `mouseTarget` to `(cx, cy)` on mouseleave, or *always* update `mouseTarget` and clamp it. For a hero that the user scrolls past quickly this is minor, but it's worth fixing while we're here.

### Q4 — What does the shader do with `uMouse`? Step through with numbers.

Shader, lines 34–39 of `Plasma.shaders.ts`:

```glsl
vec2 center = iResolution.xy * 0.5;
C = (C - center) / uScale + center;
vec2 mouseOffset = (uMouse - center) * 0.0002;
C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
```

`C` starts as `gl_FragCoord.xy` — the **drawing-buffer pixel** position of the current fragment, with **y = 0 at the bottom** (GL convention).

**Step 1 — scale around center:** `(C - center) / uScale + center`. With `uScale = 1.1`, this slightly zooms the pattern. Irrelevant to the mouse bug.

**Step 2 — compute the mouse offset vector.** This is a single 2-vector, the *same* for every fragment in the frame. It is the direction from the canvas center to the mouse cursor (in shader coords), scaled by `0.0002`.

**Step 3 — apply the warp.** `C += mouseOffset * length(C - center)`. The displacement magnitude is `|mouseOffset| × length(C - center)` — **zero at center, maximum at corners**, in the direction of `mouseOffset`. Then the shader reads the rest of the pattern at `C + displacement`. Reading a position *to the right of* a fragment makes the pattern there appear *to the left* of its old position — i.e. the pattern **moves opposite to** the mouse direction.

**Trace — inspo demo, 896×504 CSS, DPR = 2 (drawing buffer 1792×1008), mouse at right edge mid-height CSS (896, 252):**

- `iResolution = (1792, 1008)`, `center = (896, 504)`
- `uMouse = (896, 252)`  ← **CSS pixels**
- `(uMouse - center) = (0, -252)`
- `mouseOffset = (0, -0.0504)`
- Top-right corner fragment: `gl_FragCoord = (1792, 1008)`, `C - center = (896, 504)`, `length ≈ 1028`
- Displacement at top-right corner: `(0, -0.0504 × 1028) ≈ (0, -52)` drawing-buffer px (≈ -26 CSS px)
- Visual reading: pattern at the corner shifts **downward in GL** = **upward in CSS** (toward the top of the canvas) — the pattern moves **away from** where the mouse is (mid-height) and toward the top.

Subtle, mostly invisible — the inspo "works."

**Trace — current implementation, 1920×1080 CSS, DPR = 2 (drawing buffer 3840×2160), mouse at right edge mid-height CSS (1920, 540):**

Current `handleMouseMove`:

```ts
const cx = rect.width  / 2  // = 960    (CSS px)
const cy = rect.height / 2  // = 540    (CSS px)
const rawX =  (e.clientX - rect.left) - cx                   // = 1920 - 960          = 960
const rawY = -((e.clientY - rect.top)  - cy)                 // = -(540 - 540)        = 0
mouseTarget[0] = cx + rawX * 0.04                             // = 960  + 38.4         = 998.4
mouseTarget[1] = cy + rawY * 0.04                             // = 540  + 0            = 540
```

After lerp settles: `uMouse ≈ (998.4, 540)`. **CSS pixels.**

Shader: `center = drawing-buffer / 2 = (1920, 1080)`.

- `(uMouse - center) = (998.4 - 1920, 540 - 1080) = (-921.6, -540)`
- `mouseOffset = (-0.184, -0.108)`
- Right-edge mid-height fragment: `gl_FragCoord = (3840, 1080)`, `C - center = (1920, 0)`, `length = 1920`
- Displacement: `(-0.184 × 1920, -0.108 × 1920) = (-353, -207)` drawing-buffer px
- **Notice the Y component is -207 even though the mouse only moved horizontally.** That's the DPR-mismatch crosstalk: `uMouse.y` (540, CSS) vs. `center.y` (1080, drawing-buffer) produces a non-zero Y-delta from a purely-horizontal cursor.

**Sanity check — current implementation, mouse at CENTER CSS (960, 540):**

- `rawX = 0, rawY = 0` ⇒ `mouseTarget = (960, 540)`
- `(uMouse - center) = (960 - 1920, 540 - 1080) = (-960, -540)`
- `mouseOffset = (-0.192, -0.108)`
- Right-edge mid-height fragment displacement: `(-0.192 × 1920, -0.108 × 1920) = (-369, -207)` drawing-buffer px

**The pattern is warped even with the cursor sitting still at the canvas center.** That is the smoking gun — the "neutral" mouse state is not neutral. Visually this manifests as: the pattern is permanently pulled toward the lower-left of the canvas, and the cursor only nudges that pull. Exactly the "moving around a photo" sensation.

### Q5 — What is the "correct" displacement?

For a full-viewport hero we want **maximum corner displacement on the order of 30–60 drawing-buffer pixels** when the mouse is at an extreme corner. That is "noticeable parallax" without being "panning." For comparison, the inspo demo's max corner displacement was ≈ 52 drawing-buffer px.

Working backwards through the shader: the corner has `length(C - center) ≈ 2203` on a 1920×1080 / DPR-2 hero. To get a 50-px corner displacement we need `|mouseOffset| ≤ 0.0227`. With the shader's `0.0002` coefficient, that means `|uMouse - center| ≤ 113` drawing-buffer pixels. Half-canvas is 1920. So we need to **compress the natural delta down to ≈ 6 %** — close to the user's intuition with the `0.04` (4 %) number, but applied in the **right coordinate space**.

Compression around 0.10–0.15 gives a comfortably visible-but-subtle warp; 0.05–0.08 gives a "barely there" parallax. Final number is **Claude's discretion** to tune by eye.

### Q6 — What is wrong with the current fix?

| Aspect | Status | Why |
|---|---|---|
| Y-flip (`rawY = -(clientY - rect.top - cy)`) | **Half-right, half-wrong** | The flip changes the *sign of the Y delta*, but the shader still computes `uMouse - center` against a *drawing-buffer* center while `uMouse` is in *CSS* space — so the result has the wrong magnitude AND a residual offset that depends on DPR (see Q4 sanity check). On DPR = 1 the flip alone would be enough to make the pattern follow the cursor on the Y axis (but it would still push *away* on the X axis — the user would feel inverted-X-but-correct-Y, a strange split). |
| `0.04` compression | **Right idea, wrong space** | Compression is applied around CSS `cx, cy`, but the shader subtracts drawing-buffer center. On DPR = 2 the compression delta is effectively swamped by the DPR-induced offset. On DPR = 1 it works correctly. |
| `0.06` lerp | **Correct, keep it** | Smooths viewport-scale mouse jumps. Without it, large mousemove deltas feel sharp on a big hero. |
| Re-centering on resize (`setSize` initialises `mouseTarget` / `mouseCurrent`) | **Correct, keep it** | Good defensive default. |
| Bounds check on document listener | **Correct in spirit, has a minor leak** | When the cursor exits the hero, `mouseTarget` keeps its last off-center value. Re-center it on exit (`else { mouseTarget[0] = cx_db; mouseTarget[1] = cy_db; }`) to let the lerp return to neutral. |
| Warp direction (away from cursor) | **Wrong for our design intent** | Inspo's "feature" is fine on a demo but feels like the page being shoved on a full-viewport hero. Negate the offset so the pattern is pulled *toward* the cursor. |

### Q7 — The minimal correct fix

Two changes inside `useEffect` in `Plasma.tsx`:

1. Replace the `handleMouseMove` body with the version below, which works entirely in **drawing-buffer pixels**, negates the delta to pull toward the cursor, applies compression in the correct space, and includes a Y-flip (`gl_FragCoord.y = 0` is at the bottom, `clientY = 0` is at the top — without the flip, the Y warp goes the wrong way after the negation).
2. Re-centre `mouseTarget` to the drawing-buffer center inside `setSize` so the resize default lives in the same space as the runtime updates.

```ts
// Compression factor: how much of the natural mouse-to-center delta to
// pass to the shader. The shader was tuned for a ~900x500 demo where the
// half-canvas is ~450 drawing-buffer px; on a 1920x1080 hero at DPR=2 the
// half-canvas is 1920 drawing-buffer px (~4x larger), so we need to cut the
// delta to roughly 1/4 of the natural value to match the inspo's feel.
// 0.10 = "subtle but visible parallax"; tune by eye in 0.05..0.15.
const MOUSE_COMPRESS = 0.10
const LERP = 0.06

// --- setSize: keep the iResolution write, then re-centre targets in the
// SAME coordinate space the shader uses (drawing-buffer px). ---
const setSize = () => {
  const rect = container.getBoundingClientRect()
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  renderer.setSize(w, h)
  const res = program.uniforms.iResolution.value as Float32Array
  res[0] = gl.drawingBufferWidth
  res[1] = gl.drawingBufferHeight
  // Neutral mouse = canvas center, in drawing-buffer pixels (same as
  // `center` in the shader). This makes (uMouse - center) === 0 at rest.
  const cxDB = gl.drawingBufferWidth  * 0.5
  const cyDB = gl.drawingBufferHeight * 0.5
  mouseTarget[0]  = cxDB
  mouseTarget[1]  = cyDB
  mouseCurrent[0] = cxDB
  mouseCurrent[1] = cyDB
}

// --- handleMouseMove: all math in drawing-buffer pixels ---
let handleMouseMove: ((e: MouseEvent) => void) | null = null
if (mouseInteractive) {
  handleMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    const cxDB = gl.drawingBufferWidth  * 0.5
    const cyDB = gl.drawingBufferHeight * 0.5

    // Out-of-bounds: drift back to neutral instead of holding the last value.
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) {
      mouseTarget[0] = cxDB
      mouseTarget[1] = cyDB
      return
    }

    // Get DPR from the renderer (already capped at 2 in the constructor),
    // not from window.devicePixelRatio (could differ on zoom changes).
    const dpr = renderer.dpr

    // Delta from canvas center, in CSS px, with Y flipped:
    //   gl_FragCoord.y = 0 is at the bottom of the canvas;
    //   clientY        = 0 is at the top.
    // After the flip, "mouse above center" -> positive Y delta in GL space.
    const cssDx =  (e.clientX - rect.left) - rect.width  * 0.5
    const cssDy = -((e.clientY - rect.top) - rect.height * 0.5)

    // Convert to drawing-buffer space (the space `center` lives in),
    // compress to stay subtle on a full-viewport hero, and NEGATE so
    // the shader's "warp pushes pattern away" becomes "warp pulls pattern
    // toward the cursor".
    mouseTarget[0] = cxDB - cssDx * dpr * MOUSE_COMPRESS
    mouseTarget[1] = cyDB - cssDy * dpr * MOUSE_COMPRESS
  }
  document.addEventListener('mousemove', handleMouseMove, { passive: true })
}
```

The rAF lerp block stays unchanged — `LERP = 0.06`, lerp `mouseCurrent` toward `mouseTarget`, write to `uMouse`.

**Why this is correct, in one line per Q:**
- Q1 mismatch: `cxDB / cyDB` and the `dpr` multiplier put the JS in the same space as the shader's `center`.
- Q4 crosstalk: with the spaces aligned, a purely-horizontal cursor produces a purely-horizontal `(uMouse - center)` and a purely-horizontal warp. No more bleeding into Y.
- Q5 magnitude: `MOUSE_COMPRESS = 0.10` caps the corner displacement at ≈ 88 drawing-buffer px (= `1920 × 0.10 × 0.0002 × 2203`). With the user's preferred sensitivity it can be lowered further; 0.05 gives ≈ 44 px (matches the inspo demo's feel).
- Q6 direction: the leading minus in `cxDB - cssDx * dpr * MOUSE_COMPRESS` flips the offset direction in the shader, so the pattern follows the cursor instead of fleeing it.

### What the user should see after the fix

- **Mouse at canvas center**: pattern is perfectly steady. No drift, no lean. (Sanity check — this was *not* true under the current code.)
- **Mouse hard right, mid-height**: the right edge of the pattern is gently pulled to the right (≈ 50–90 px of warp at the corner, falling smoothly to zero at the center). The left half of the canvas is almost unaffected.
- **Mouse hard left, mid-height**: mirror of the above. Left edge pulled left.
- **Mouse top-center**: top of the pattern is pulled upward.
- **Mouse bottom-center**: bottom is pulled downward.
- **Diagonal moves**: the warp direction tracks the cursor diagonally (cursor in top-right corner pulls the top-right of the pattern toward the cursor; far edge moves the most).
- **Cursor leaves the hero**: pattern drifts back to neutral over ~10 frames (the LERP at 0.06).
- **No "photo-pan" feel**: the warp is bounded and feels like a soft magnetic pull on the pattern's structure, not a translation of the whole image.
- **No axis inversion**: pattern moves with the cursor on both X and Y.

### Knobs to tune live, if the fix still feels off

| Symptom | Adjust | Direction |
|---|---|---|
| Still feels too strong | `MOUSE_COMPRESS` | Lower (try 0.05, then 0.03) |
| Feels laggy | `LERP` | Raise (try 0.10, then 0.15) |
| Feels too snappy | `LERP` | Lower (try 0.04) |
| Centre is not truly steady | Verify `dpr` in the formula matches `renderer.dpr` exactly (NOT `window.devicePixelRatio`) | — |
| X works but Y is inverted | Sign of `cssDy` flip — remove the leading `-` in `cssDy` | — |
| Pattern moves *away* from cursor again | Leading minus in the `mouseTarget` formulas was removed | Restore it |

### Sources for this section

- `inspo.txt` lines 467–690 — the reference `Plasma` component. Direct read.
- `Plasma.shaders.ts` lines 34–39 — the warp math. Direct read.
- `Plasma.tsx` lines 124–168 — the current (broken) handler. Direct read.
- WebGL `gl_FragCoord` semantics (y = 0 at bottom) — Khronos GLSL ES 3.00 spec §7.1.4, well established, not version-sensitive.
- OGL `Renderer.dpr` field — already in use in this component (`renderer = new Renderer({ ..., dpr: ... })`); `renderer.dpr` reflects the value passed in.

---


<user_constraints>
## User Constraints (from CONTEXT.md)

These are LOCKED and the planner MUST honor them exactly. Do not propose alternatives in tasks.

### Locked Decisions

**Shader source & visual style**
- Port the OGL shader from `inspo.txt` verbatim (same GLSL, same OGL primitives: `Renderer`, `Program`, `Mesh`, `Triangle`)
- Tweak parameters, do not rewrite the shader
- Color: `#FF4500` (locked by ROADMAP)
- Speed: slow and meditative — target ~0.3–0.4 (inspo used 0.6; this is intentionally slower)
- Direction: `'forward'` always — no pingpong or reverse
- Scale: ~1.1 (close to inspo)
- Opacity: ~0.8–0.9 — rich and saturated, close to full bleed
- Full shader source is in `inspo.txt` (`/src/Component.tsx` section) — port that GLSL verbatim, adjust uniforms via props
- inspo OGL setup: `webgl: 2`, `alpha: true`, `antialias: false` — keep these
- inspo already has `sanitize()` to guard against NaN/Inf in the shader output — keep it
- inspo cleanup: `cancelAnimationFrame(raf)`, `ro.disconnect()`, removes canvas from DOM — extend this to also call `gl.getExtension('WEBGL_lose_context')?.loseContext()` for React 18 StrictMode safety

**Mouse interaction**
- `mouseInteractive: true` on desktop, `false` on mobile (≤ 430px, uses `isMobile` from `useDeviceCapabilities`)
- Mouse tracking scope: hero canvas only (not global window) — `mousemove` listener on the container div
- Reactivity level: keep inspo's coefficient (~0.0002) — subtle nudge, not a dramatic warp

**Scroll unmount**
- Unmount threshold: when the hero bottom fully leaves the viewport (100% scrolled past) — not aggressive early cut
- Pre-unmount transition: short CSS opacity fade (~200–300ms) before React unmounts the component
- Scroll-back remount: yes — if user scrolls back into hero view, Plasma remounts and restarts
- Uses ScrollProvider/GSAP ScrollTrigger infrastructure from Phase 3

**Reduced-motion / no-WebGL2 fallback**
- Trigger: `prefersReducedMotion` OR `!supportsWebGL2` — no GL context created in either case
- Visual: multi-stop deep red-to-black radial gradient (`#FF4500` → deep red → `#050505`) — atmospheric, not generic
- Motion on fallback:
  - `prefersReducedMotion: true` → fully static, zero animation
  - Low-end / no-WebGL2 (but reduced-motion is false) → very slow CSS opacity pulse (6–8s, opacity only)
- Size: covers the hero section height (not necessarily 100vh) — matches whatever the hero section renders

### Claude's Discretion

- Exact CSS gradient stop percentages and positions
- Exact CSS animation keyframes for the low-end pulse
- ResizeObserver wiring for the canvas (already in inspo)
- DPR capping (`Math.min(devicePixelRatio, 2)` — already in inspo)
- WEBGL_lose_context cleanup for React 18 StrictMode double-mount handling

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. Hero copy, PillNav, bilingual text, and the actual `<HeroSection>` composition are explicitly Phase 5's responsibility. The Phase 4 deliverable is the standalone `<Plasma>` component plus the mount-decision wiring needed to feed it; Phase 5 drops it behind real hero content.

</user_constraints>

## Summary

This phase ports a verified-working OGL Plasma shader from `inspo.txt` into a standalone `<Plasma>` React component with three correctness layers stacked on top of the inspo reference: **(1)** React 19 StrictMode-safe WebGL cleanup using `WEBGL_lose_context.loseContext()` plus canvas dimension zeroing; **(2)** a `useDeviceCapabilities`-gated fallback path that creates **zero** GL context when `prefersReducedMotion` or `!supportsWebGL2`; **(3)** a scroll-driven mount/unmount controller that subscribes to the existing `scrollStore` (Phase 3) and switches between `<Plasma>` and `null` with a short CSS opacity fade in between, so the rAF loop actually stops when the hero leaves the viewport (not just opacity:0 paint stalling the GPU).

The inspo shader and OGL setup are already production-grade — the work here is **not** rewriting the shader; it is wrapping it in the correct React lifecycle, fallback gate, and ScrollTrigger-driven mount decision. OGL 1.0.11 is the current published version (verified against `oframe/ogl` master `package.json`), matching the pin in `inspo.txt`. All GSAP work must continue to import from `@/lib/gsap` (Phase 1 rule).

**Primary recommendation:** Build three components — `<Plasma>` (pure OGL, no scroll/device logic), `<PlasmaFallback>` (CSS-only gradient + optional slow pulse), and `<HeroBackdrop>` (the dispatcher that reads `useDeviceCapabilities` + a hero-visibility boolean derived from `scrollStore` and decides which of the two to render). Phase 5 consumes `<HeroBackdrop>`, not `<Plasma>` directly.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ogl` | `^1.0.11` | Minimal WebGL2 renderer for the Plasma fragment shader | ~29kb min+gzip, no plugin ecosystem (intentional). Exact lib used in inspo. Verified current via `oframe/ogl` master `package.json` (2026-06-10 fetch). License: Unlicense (public domain — safe to vendor). |
| `react` | `19.2.7` (already installed) | UI runtime in StrictMode | Already in `package.json`. StrictMode double-invokes effects in dev — this drives every cleanup decision below. |
| `gsap` | `3.15.0` + `@gsap/react` `2.1.2` (already installed) | ScrollTrigger for the hero-visibility threshold that gates Plasma mount | Plugins are registered once in `@/lib/gsap`. NEVER import from `'gsap'` directly. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-error-boundary` | `^6.1.2` (already installed) | Wraps `<Plasma>` so a shader compile / GL error cannot kill the whole page | Always — Phase 1 already ships `<AnimationErrorBoundary>`, reuse it. |
| `react` `useSyncExternalStore` (built-in) | n/a | Pair with `scrollStore` (Phase 3) to derive the `heroVisible` boolean and trigger Plasma mount/unmount | Inside `<HeroBackdrop>` only. Snapshot must return a stable reference when unchanged — see Pitfall 4 below. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OGL | three.js + @react-three/fiber | three.js is ~10× heavier (~600 kB vs OGL's ~29 kB) for a single full-screen fragment shader. R3F only pays off when you have multiple React-driven 3D objects. **Out of scope — locked to OGL.** |
| Self-managed `requestAnimationFrame` loop inside `useGSAP` | Plain `useEffect` for the WebGL lifecycle | `useGSAP()` only cleans up GSAP-created resources (animations, ScrollTriggers, Draggables, SplitText) — it does NOT clean up WebGL contexts, rAF IDs you allocate, or ResizeObservers ([GSAP React docs](https://gsap.com/resources/React/)). The Plasma rAF loop and GL cleanup must live in a `useEffect`. Use `useGSAP` only for the ScrollTrigger that drives the mount decision, in a separate component (`<HeroBackdrop>`). |
| ScrollTrigger `toggleActions: "play pause resume reset"` to "pause" Plasma | Conditional rendering driven by a boolean | Pausing rAF does not free the GL context; the browser's 16-context cap still ticks. Requirement #2 explicitly requires *unmount* (rAF ID logs ceasing AND context being lost). |
| `IntersectionObserver` on the hero element | ScrollTrigger callbacks | IntersectionObserver works and is lighter, but the project's scroll source-of-truth is already `scrollStore` + ScrollTrigger (Phase 3 architecture). Adding a parallel observer fragments the scroll state. Stay on ScrollTrigger for consistency. |

### Installation

```bash
npm install ogl@^1.0.11
```

That's it. No types package needed — OGL ships its own `types/index.d.ts` (verified in master `package.json`: `"types": "./types/index.d.ts"`).

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── plasma/
│   │   ├── Plasma.tsx              # Pure OGL component. Mounts canvas, runs shader, cleans up GL.
│   │   ├── Plasma.shaders.ts       # vertex + fragment GLSL strings (extracted from Plasma.tsx for readability)
│   │   ├── PlasmaFallback.tsx      # CSS-only radial gradient + optional opacity pulse
│   │   └── HeroBackdrop.tsx        # Dispatcher: useDeviceCapabilities + scrollStore → <Plasma> | <PlasmaFallback> | null
│   ├── error/
│   │   └── AnimationErrorBoundary.tsx   # already exists — wrap <HeroBackdrop> in it
│   ├── layout/
│   │   └── NoiseOverlay.tsx        # already exists — independent of this phase
│   └── scroll/
│       └── (Phase 3 components — unchanged)
├── context/
│   └── ScrollContext.tsx           # already exists — consumed by HeroBackdrop, do not modify
├── hooks/
│   └── useDeviceCapabilities.ts    # already exists — consumed by HeroBackdrop, do not modify
└── lib/
    └── gsap.ts                     # already exists — GSAP imports for HeroBackdrop
```

**Why split into three components, not one:**

1. `<Plasma>` is testable in isolation (you can stick `<Plasma color="#FF4500" />` anywhere with a fixed height and it works).
2. `<PlasmaFallback>` has zero React/GSAP dependencies — it survives every accessibility test trivially.
3. `<HeroBackdrop>` concentrates ALL the decision logic in one place. When Phase 5 wires the hero, it imports `<HeroBackdrop>`, passes the hero's ref (used as the ScrollTrigger trigger), and stops thinking about WebGL.

### Pattern 1: WebGL Lifecycle inside `useEffect` (NOT `useGSAP`)

**What:** Allocate the OGL `Renderer`, `Program`, `Mesh`, rAF loop, ResizeObserver, and mouse listener inside a single `useEffect`. Return a cleanup that reverses every allocation in opposite order.

**When to use:** Inside `<Plasma>`. Always. This is the only correct cleanup location for non-GSAP resources.

**Source:** [GSAP React docs](https://gsap.com/resources/React/) — `useGSAP` is explicitly scoped to GSAP-created resources only.

**Example (port from `inspo.txt` `/src/Component.tsx` lines 580–684, with the StrictMode hardening from `.planning/research/PITFALLS.md` §1.1):**

```tsx
// src/components/plasma/Plasma.tsx
import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import { vertex, fragment } from './Plasma.shaders'

interface PlasmaProps {
  color?: string                                // hex, default '#FF4500'
  speed?: number                                // default 0.35 (slow + meditative)
  direction?: 'forward'                         // locked — no 'reverse' / 'pingpong'
  scale?: number                                // default 1.1
  opacity?: number                              // default 0.85
  mouseInteractive?: boolean                    // default true; false on isMobile
}

export function Plasma({
  color = '#FF4500',
  speed = 0.35,
  direction = 'forward',
  scale = 1.1,
  opacity = 0.85,
  mouseInteractive = true,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // --- inspo-port: identical Renderer setup ---
    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(hexToRgb(color)) },
        uUseCustomColor: { value: 1.0 },
        uSpeed: { value: speed * 0.4 },             // inspo divides by 0.4 to map [0..1] to slow range
        uDirection: { value: 1.0 },                  // locked 'forward'
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    // --- ResizeObserver — inspo pattern ---
    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h)
      const res = program.uniforms.iResolution.value as Float32Array
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
    }
    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    // --- Mouse listener — container-scoped, NOT window-scoped ---
    let handleMouseMove: ((e: MouseEvent) => void) | null = null
    if (mouseInteractive) {
      handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const u = program.uniforms.uMouse.value as Float32Array
        u[0] = e.clientX - rect.left
        u[1] = e.clientY - rect.top
      }
      container.addEventListener('mousemove', handleMouseMove)
    }

    // --- rAF loop ---
    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      ;(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // --- CRITICAL StrictMode-hard cleanup (this is what inspo lacks) ---
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (handleMouseMove) container.removeEventListener('mousemove', handleMouseMove)

      // 1. Lose the GL context FIRST so the GPU buffers are released
      //    even if the DOM removal below throws.
      const loseExt = gl.getExtension('WEBGL_lose_context')
      loseExt?.loseContext()

      // 2. Force iOS Safari to release texture memory by zeroing the
      //    canvas backing store. PITFALLS §1.1 — Mobile Safari tab crash on
      //    repeat mount/unmount cycles is the symptom this fixes.
      canvas.width = 0
      canvas.height = 0

      // 3. Detach from DOM.
      try {
        if (canvas.parentNode === container) container.removeChild(canvas)
      } catch (err) {
        console.warn('[Plasma] cleanup: canvas removal failed:', err)
      }
    }
  }, [color, speed, direction, scale, opacity, mouseInteractive])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  )
}
```

### Pattern 2: Fallback Component (zero GL, zero rAF, zero deps)

**What:** A CSS-only radial gradient covering its parent. Optionally wraps a `@keyframes` opacity pulse when `prefersReducedMotion: false` but the GL path is disabled (no WebGL2 / low-end).

**When to use:** Whenever `prefersReducedMotion === true` OR `supportsWebGL2 === false`. The `<HeroBackdrop>` dispatcher decides; this component is dumb.

**Example:**

```tsx
// src/components/plasma/PlasmaFallback.tsx
interface PlasmaFallbackProps {
  /** Animate a slow opacity pulse. Caller sets false when prefersReducedMotion. */
  animated?: boolean
}

export function PlasmaFallback({ animated = false }: PlasmaFallbackProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        // Multi-stop deep red → black, atmospheric (per CONTEXT.md)
        background:
          'radial-gradient(ellipse at 50% 45%, ' +
          'rgba(255, 69, 0, 0.55) 0%, ' +
          'rgba(180, 30, 0, 0.35) 25%, ' +
          'rgba(80, 10, 0, 0.2) 55%, ' +
          '#050505 90%)',
        animation: animated ? 'plasma-fallback-pulse 7s ease-in-out infinite' : undefined,
      }}
    />
  )
}

// Keyframes — define once in src/styles/index.css or co-located:
// @keyframes plasma-fallback-pulse {
//   0%, 100% { opacity: 0.85; }
//   50%      { opacity: 1; }
// }
```

**Why opacity-only pulse:** PITFALLS §1.2 — anything that triggers layout/paint on every frame defeats the purpose of the fallback. Opacity is GPU-composited, ~free.

### Pattern 3: Hero-Visibility Boolean from ScrollContext

**What:** A custom hook that subscribes to `scrollStore` and returns a boolean: "is the hero element fully past the viewport bottom?". Used by `<HeroBackdrop>` to decide mount/unmount.

**When to use:** Inside `<HeroBackdrop>` only. The boolean threshold pattern is critical — returning the raw `scrollY` to React state would re-render on every scroll frame.

**Source:** [React docs — useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) — selectors must derive the boolean inside `getSnapshot` and cache the result.

There are two valid implementations. The recommended one is the **ScrollTrigger callback** approach because the rest of the codebase is already ScrollTrigger-based:

**Recommended — ScrollTrigger-driven boolean state:**

```tsx
// Inside <HeroBackdrop>
import { useState, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

export function HeroBackdrop({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  const [heroPastViewport, setHeroPastViewport] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!heroRef.current) return
      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        // start "top top"  — hero top reaches viewport top
        // end   "bottom top" — hero bottom leaves viewport top (100% past)
        start: 'top top',
        end: 'bottom top',
        onLeave:     () => setHeroPastViewport(true),   // scrolled past
        onEnterBack: () => setHeroPastViewport(false),  // scrolled back into hero
      })
      return () => trigger.kill()
    },
    { scope: containerRef, dependencies: [heroRef] }
  )

  // ...renders <Plasma> when !heroPastViewport, else <PlasmaFallback> or null
}
```

**Alternative — subscribe to `scrollStore` directly:**

```tsx
// Only use this if you decide to derive from scrollY rather than from
// the hero's ScrollTrigger. Requires the hero height to be known/measured.
import { useSyncExternalStore } from 'react'
import { scrollStore } from '@/context/ScrollContext'

function useHeroPastViewport(heroBottomPx: number): boolean {
  return useSyncExternalStore(
    scrollStore.subscribe,
    () => scrollStore.getSnapshot().y > heroBottomPx,
  )
}
```

**Recommendation:** Use the ScrollTrigger pattern. Reasons:
- Phase 3 has zero scrollStore consumers yet — ScrollTrigger is the more proven path
- ScrollTrigger handles the "hero element resizes due to font load / image load" case automatically via `ScrollTrigger.refresh()` already called in `App.tsx` line 150–154
- Reading `heroBottomPx` requires measurement that races against font/image load — fragile

### Pattern 4: Pre-Unmount Fade Transition

**What:** Don't switch from `<Plasma>` to `null` in a single React render — that yanks the canvas mid-frame and looks abrupt. Use a two-step state: `visible` → `fading` → `unmounted`.

**When to use:** Always in `<HeroBackdrop>`. CONTEXT.md mandates a 200–300ms opacity fade before unmount.

**Example:**

```tsx
function HeroBackdrop({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'unmounted'>('visible')
  const fadeTimer = useRef<number | null>(null)

  // Inside the ScrollTrigger callbacks:
  //   onLeave:     setPhase('fading'); after 250ms → setPhase('unmounted')
  //   onEnterBack: clear fadeTimer if set; setPhase('visible') immediately

  // Render:
  if (phase === 'unmounted') return null
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 250ms ease-out',
        pointerEvents: 'none',
      }}
    >
      <Plasma color="#FF4500" /* ... */ />
    </div>
  )
}
```

**Why pre-unmount fade (not opacity-only):** Requirement #2 — the rAF loop must actually stop. Opacity-only would keep the GPU loop running invisibly behind a `mix-blend-mode: overlay` noise overlay (`<NoiseOverlay zIndex: 50>`) — the noise would no longer be tinted, looking flat. Plus: phones still burn battery. The fade is purely cosmetic in front of the eventual `null`.

### Pattern 5: Component-Level Memoization to Avoid Re-Init

**What:** The `useEffect` inside `<Plasma>` has 6 dependencies (`color`, `speed`, `direction`, `scale`, `opacity`, `mouseInteractive`). If any change, the whole WebGL context is torn down and rebuilt. Make sure callers pass stable values.

**When to use:** Phase 5's `<HeroBackdrop>` must not pass inline objects/functions or computed values that re-create every render.

**Example — caller side:**

```tsx
// ✅ stable primitives
<Plasma color="#FF4500" speed={0.35} mouseInteractive={!isMobile} />

// ❌ would tear down and rebuild GL on every render
<Plasma color={getColor()} speed={0.35} mouseInteractive={!isMobile} />
```

### Anti-Patterns to Avoid

- **Wrapping `<Plasma>`'s GL allocation in `useGSAP`:** `useGSAP` cleanup is scoped to GSAP resources only — WebGL contexts, ResizeObservers, and rAF IDs you allocate yourself are NOT cleaned up. Source: [GSAP React docs](https://gsap.com/resources/React/).

- **Pausing the rAF loop instead of unmounting:** "Pause" without freeing the GL context still counts against the browser's ~16-context cap and still consumes mobile battery. Requirement #2 explicitly demands the context be lost. PITFALLS §1.1 covers this.

- **Calling `ScrollTrigger.getAll().forEach(t => t.kill())` in this phase's cleanup:** That kills *every* ScrollTrigger on the page (RevealSection, ParallaxCard, …). Use `trigger.kill()` on the specific ScrollTrigger created by this component, or rely on `useGSAP`'s scope-bound cleanup (the recommended path).

- **Reading `scrollY` into React state every frame:** Will re-render `<HeroBackdrop>` 60×/sec. The whole point of the boolean threshold (`heroPastViewport: true | false`) is to flip React state at most twice per scroll-through.

- **Rendering `<Plasma>` and applying `opacity: 0` to its container instead of unmounting:** Same GPU cost. Defeats the purpose. See above.

- **Importing `gsap` or `ScrollTrigger` directly from `'gsap'`:** Phase 1 rule. All GSAP imports come from `@/lib/gsap`.

- **Calling `gl.getExtension('WEBGL_lose_context')` and reading the result before checking for null:** Not all browsers expose the extension. Always `loseExt?.loseContext()`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebGL renderer + shader program + draw loop | A direct `gl.createShader` / `gl.compileShader` / `gl.linkProgram` pipeline | `ogl` `Renderer` + `Program` + `Mesh` + `Triangle` | OGL handles WebGL1 fallback (`if (webgl === 2) ... else canvas.getContext('webgl', …)`), extension querying, geometry buffer binding, and resize-aware viewport math. Verified directly in `src/core/Renderer.js` master. Rewriting is a multi-day yak shave for zero gain. |
| Detection of "is the hero past the viewport" | A `window.addEventListener('scroll')` + element measurement + boundingClientRect math | `ScrollTrigger.create({ trigger, start, end, onLeave, onEnterBack })` | ScrollTrigger handles refresh on layout shift (Phase 3 already wires `ScrollTrigger.refresh()` after `document.fonts.ready`), throttles measurement, supports `markers: true` for debugging. Hand-rolling re-introduces the bugs Phase 3 already solved. |
| `prefers-reduced-motion` / WebGL2 detection | Inline `window.matchMedia(...)` in `<Plasma>` | `useDeviceCapabilities()` from `@/hooks/useDeviceCapabilities` | Already exists; already reactive on OS preference flip. Re-detecting in `<Plasma>` would duplicate logic AND would re-evaluate after mount, defeating the "no GL context ever" goal. |
| Pre-unmount fade timing | A `setTimeout` + 6 lines of state machine logic | The pattern in [Pattern 4](#pattern-4-pre-unmount-fade-transition) above — explicit phase state with a `useRef` timer | Don't reach for `framer-motion` / `motion`'s `AnimatePresence` here — it's not in dependencies, would add 30+ kB, and the fade is just opacity. 10 lines of CSS transition is the right tool. |
| Canvas backing-store cleanup on iOS Safari | Skipping the `canvas.width = 0; canvas.height = 0` step "because the spec doesn't require it" | Always zero the canvas dimensions in cleanup | PITFALLS §1.1 documents real iOS Safari tab crashes from repeated mount/unmount. The zeroing trick is the documented fix and is essentially free. |

**Key insight:** The Plasma shader is already ported (`inspo.txt`). The work in Phase 4 is **lifecycle plumbing**, not WebGL programming. Almost every "don't hand-roll" item above corresponds to a piece of existing infrastructure (OGL, `useDeviceCapabilities`, `scrollStore`, `useGSAP`, ScrollTrigger) that the planner should compose, not replace.

## Common Pitfalls

### Pitfall 1: WebGL Context Leak on React 18/19 StrictMode

**What goes wrong:** React 19 in development double-invokes effects: mount → cleanup → mount. If the cleanup doesn't release the GL context, the first context is orphaned. Browsers cap at ~16 contexts; the 17th silently fails (black canvas, no error). After ~6 HMR reloads you can hit the cap.

**Why it happens:** Removing the canvas element from the DOM does NOT release the WebGL context — the context is owned by the underlying canvas backing store, not its parent. Without `WEBGL_lose_context.loseContext()`, the GPU memory stays allocated.

**How to avoid:** In the `useEffect` cleanup, call `gl.getExtension('WEBGL_lose_context')?.loseContext()` BEFORE removing the canvas from the DOM. Then zero the canvas dimensions for iOS Safari. Then remove the canvas. Code pattern is in [Pattern 1 above](#pattern-1-webgl-lifecycle-inside-useeffect-not-usegsap).

**Warning signs:**
- Black/blank Plasma area after several HMR reloads in dev
- Console: `WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost`
- DevTools Memory panel showing retained `WebGLTexture` / `WebGLBuffer` objects
- iOS Safari tab crash after navigating in/out of the hero ~3 times
- Verification: log a counter inside the rAF loop. After StrictMode settles, exactly ONE counter should advance. If two advance, two contexts are running.

**Source:** [PITFALLS §1.1](../../research/PITFALLS.md), [MDN WEBGL_lose_context](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext), [react-three-fiber issue #3093](https://github.com/pmndrs/react-three-fiber/issues/3093).

**Confidence:** HIGH — corroborated by Phase 1 research, MDN, and react-three-fiber's leak issue.

### Pitfall 2: Fallback Path Still Creates a GL Context

**What goes wrong:** A naïve `<Plasma>` reads `useDeviceCapabilities()` inside itself and early-returns if `prefersReducedMotion`. But because effects run AFTER render, the `Renderer` constructor still ran on the first render cycle (or not, depending on where the check sits). Worse, putting the check *inside* the effect would still allocate the canvas-creation cost on every mount.

**Why it happens:** Conditional logic that lives below the component boundary cannot prevent the component from mounting in the first place. The guard must be *above* `<Plasma>`.

**How to avoid:** `<HeroBackdrop>` checks `useDeviceCapabilities()` and only renders `<Plasma>` if the GL path is allowed. The `<Plasma>` component itself assumes it can run; the dispatcher gates it. Verification: in DevTools, simulate `prefers-reduced-motion: reduce`, reload, and confirm `document.querySelectorAll('canvas').length === 0`.

**Source:** Direct read of the codebase architecture — `<HeroBackdrop>` is the proposed gate.

**Confidence:** HIGH — pure React lifecycle reasoning, no library-version dependency.

### Pitfall 3: DPR Burns Mobile Battery

**What goes wrong:** iPhone Pro has `devicePixelRatio = 3`. Rendering a fragment-shader-heavy plasma at 3× resolution is 9× the pixel work. The phone overheats in 30s and throttles.

**Why it happens:** Default-passing `dpr: window.devicePixelRatio` to OGL with no cap.

**How to avoid:** Always `dpr: Math.min(window.devicePixelRatio || 1, 2)` (inspo already does this). On `isMobile === true`, CONTEXT.md disables mouse interactivity — consider also dropping DPR to 1 or 1.5 there, but this is **Claude's Discretion** and may be over-correcting since the mobile fallback already kicks in if `supportsWebGL2 === false`.

**Warning signs:** Phone gets warm; frame rate halves after a minute (thermal throttling).

**Source:** [PITFALLS §1.2](../../research/PITFALLS.md). Confirmed in inspo cleanup pattern.

**Confidence:** HIGH.

### Pitfall 4: `useSyncExternalStore` Snapshot Reference Churn

**What goes wrong:** If `<HeroBackdrop>` opts for the `scrollStore`-subscription path (alternative pattern), and the `getSnapshot` function returns a NEW object each call, React warns "The result of getSnapshot should be cached" and may re-render every frame.

**Why it happens:** `useSyncExternalStore` uses `Object.is` to detect change. New object reference = always different = always re-render.

**How to avoid:** Either return a primitive (the boolean directly), or return the cached `snapshot` object that `ScrollContext` already maintains in-place. The current `ScrollContext.tsx` (line 56, 154) ALREADY does this correctly — it reassigns `snapshot = { y, progress }` only when scroll updates, and `getSnapshot()` returns the same reference between updates. So subscribers can do `scrollStore.getSnapshot().y > heroBottomPx` inline.

**Source:** [React useSyncExternalStore docs](https://react.dev/reference/react/useSyncExternalStore), confirmed via WebFetch 2026-06-10.

**Confidence:** HIGH on the rule; current `ScrollContext.tsx` already obeys it.

### Pitfall 5: ScrollTrigger Created Before the Hero Element Mounts

**What goes wrong:** `<HeroBackdrop>` is given `heroRef` as a prop. If `heroRef.current` is null when `useGSAP` runs (e.g. the parent passes a ref it hasn't attached yet), `ScrollTrigger.create({ trigger: null })` silently no-ops and Plasma never unmounts.

**Why it happens:** React refs are populated AFTER children mount. If `<HeroBackdrop>` mounts before the hero element it's supposed to track, the ref is still `null` in `useEffect`/`useGSAP`.

**How to avoid:** Either (a) Phase 5 renders `<HeroBackdrop>` *inside* the hero element so the trigger can be the hero's own DOM node measured from inside its subtree, or (b) `<HeroBackdrop>` accepts `heroRef` but the `useGSAP` dependency array includes `heroRef.current` so it re-runs when the ref fills in. Option (a) is cleaner and is the recommendation for Phase 5.

**Warning signs:** Plasma never unmounts when scrolling. `ScrollTrigger.getAll()` shows the trigger has `trigger: null`.

**Source:** General React ref semantics + ScrollTrigger docs.

**Confidence:** HIGH.

### Pitfall 6: Playfair Display Font-Load Layout Shift Mis-Measures the Hero

**What goes wrong:** `App.tsx` lines 150–154 already call `ScrollTrigger.refresh()` after `document.fonts.ready`. If the hero contains Playfair text and the ScrollTrigger boundaries are measured BEFORE the font swaps in, the `bottom top` end position is computed against the wrong hero height. Plasma either unmounts too early or too late.

**Why it happens:** Playfair has different vertical metrics than the fallback font. Layout shifts when it loads.

**How to avoid:** Trust the existing `App.tsx` refresh call. Verify in Phase 5 that the hero is mounted before that refresh fires (it will be — `App.tsx` is the root). No new code needed in Phase 4 — but the Phase 4 planner should call this out so Phase 5's hero implementer knows not to remove the refresh.

**Source:** Direct read of `App.tsx` lines 144–154 in this codebase.

**Confidence:** HIGH.

### Pitfall 7: Mouse Coordinates Drift After Container Resize

**What goes wrong:** `handleMouseMove` computes `clientX - rect.left` once per event. If the container resizes (sidebar toggles, viewport rotates), `rect` is recomputed each event, which is correct — but the `uMouse` uniform was last set with stale coords until the next mouse move event fires. Static mouse position + resize = uniform drift.

**Why it happens:** Mouse event drives uniform updates, not resize.

**How to avoid:** In the ResizeObserver callback, also reset `uMouse` to the centered position `[width/2, height/2]` (or 0,0). This is a small polish item — inspo doesn't do it and the visual impact is minor. Mention but do not block on it.

**Source:** Direct read of inspo `Plasma` component lines 635–645.

**Confidence:** MEDIUM — polish item, may not matter at the target scale of the effect.

## Code Examples

Verified patterns from official sources and direct inspo port:

### Full Plasma fragment shader (PORT VERBATIM from `inspo.txt`)

```glsl
// Source: inspo.txt /src/Component.tsx lines 509–567
#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;
  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}
```

### Vertex shader (PORT VERBATIM)

```glsl
// Source: inspo.txt /src/Component.tsx lines 498–507
#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

### `hexToRgb` utility (PORT VERBATIM)

```ts
// Source: inspo.txt /src/Component.tsx lines 492–496
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 0.5, 0.2]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}
```

### Full `<HeroBackdrop>` dispatcher skeleton

```tsx
// src/components/plasma/HeroBackdrop.tsx
import { useRef, useState, useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { Plasma } from './Plasma'
import { PlasmaFallback } from './PlasmaFallback'

interface HeroBackdropProps {
  heroRef: RefObject<HTMLElement>
}

const FADE_MS = 250

export function HeroBackdrop({ heroRef }: HeroBackdropProps) {
  const { prefersReducedMotion, isMobile, supportsWebGL2 } = useDeviceCapabilities()
  const useFallback = prefersReducedMotion || !supportsWebGL2

  const [phase, setPhase] = useState<'visible' | 'fading' | 'unmounted'>('visible')
  const fadeTimerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (useFallback) return  // fallback never unmounts — it's CSS, free to keep
      if (!heroRef.current) return

      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        onLeave: () => {
          setPhase('fading')
          if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current)
          fadeTimerRef.current = window.setTimeout(() => {
            setPhase('unmounted')
            fadeTimerRef.current = null
          }, FADE_MS)
        },
        onEnterBack: () => {
          if (fadeTimerRef.current) {
            window.clearTimeout(fadeTimerRef.current)
            fadeTimerRef.current = null
          }
          setPhase('visible')
        },
      })

      return () => {
        if (fadeTimerRef.current) {
          window.clearTimeout(fadeTimerRef.current)
          fadeTimerRef.current = null
        }
        trigger.kill()
      }
    },
    { scope: containerRef, dependencies: [heroRef, useFallback] }
  )

  // Fallback path — never creates GL context, never unmounts on scroll
  if (useFallback) {
    return (
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <PlasmaFallback animated={!prefersReducedMotion} />
      </div>
    )
  }

  if (phase === 'unmounted') {
    return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />
    // ↑ keep the ref host mounted so the ScrollTrigger trigger stays valid for onEnterBack
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Plasma
        color="#FF4500"
        speed={0.35}
        direction="forward"
        scale={1.1}
        opacity={0.85}
        mouseInteractive={!isMobile}
      />
    </div>
  )
}
```

**Note for planner:** the skeleton above leaves a small subtlety — `containerRef` is rendered as the ScrollTrigger scope, NOT the `heroRef` trigger. The ScrollTrigger's `trigger` config is `heroRef.current`. This separation matters for Phase 5 — `<HeroBackdrop>` should be a sibling/child of the hero section that visually backs, but the scroll measurement target is the hero itself.

### Wiring in Phase 5 (forward reference, not Phase 4 code)

```tsx
// Phase 5 will write this — included for context only.
function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  return (
    <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimationErrorBoundary>
        <HeroBackdrop heroRef={heroRef} />
      </AnimationErrorBoundary>
      {/* hero text, PillNav, language switcher — Phase 5 work */}
    </section>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-rolled `gl.createShader` + `gl.compileShader` pipeline | OGL `Renderer` + `Program` + `Mesh` + `Triangle` | OGL has been ~stable since v0.5 (2019); v1.0 in 2024 | Cuts plasma-effect boilerplate from ~150 LOC to ~30. |
| `requestAnimationFrame` paused with a `paused` flag | Full component unmount on visibility threshold | Phase 4 design choice, documented in CONTEXT.md | Frees GPU memory, kills the rAF loop entirely, prevents iOS Safari mid-session tab crash. |
| `IntersectionObserver` boolean → React state | ScrollTrigger `onLeave`/`onEnterBack` callbacks → React state | Phase 3 already adopted ScrollTrigger as the scroll source-of-truth | Single source of truth for scroll behaviors; consistent debugging (`markers: true`); auto-refresh on font load. |
| Inline shader strings in component file | Extract to `Plasma.shaders.ts` | This phase | Easier syntax highlighting in IDEs, easier to mock for unit tests if Phase 7 adds them. |
| `<Plasma>` reads `prefers-reduced-motion` itself | `<HeroBackdrop>` gates `<Plasma>` from outside | This phase | The fallback path NEVER allocates a GL context. Verifiable via `document.querySelectorAll('canvas')`. |

**Deprecated/outdated:**

- WebGL1 fallback paths in OGL: OGL still supports it (`if (webgl === 2) ... else canvas.getContext('webgl', …)`), but the user-facing fallback is the CSS gradient. We do not need to support WebGL1 here — the `supportsWebGL2` capability check sends WebGL1-only devices to the fallback automatically.
- Inspo's `pingpong` and `reverse` direction modes: still in the inspo source, but CONTEXT.md locks direction to `'forward'`. Strip the pingpong branch from the rAF loop when porting — dead code in a hot loop is still mental overhead.

## Open Questions

1. **Should `<HeroBackdrop>` re-mount or just reset when `useFallback` flips at runtime?**
   - What we know: `useDeviceCapabilities` is reactive on `prefersReducedMotion` — OS preference flip mid-session will flip `useFallback`.
   - What's unclear: should the user see Plasma fade out and the gradient fade in, or just an immediate swap?
   - Recommendation: immediate swap is fine — the user just changed their OS setting, they expect the page to respond instantly. The `useGSAP` dependency array includes `useFallback`, so the ScrollTrigger torn down + re-created handles this automatically. No special transition needed.

2. **What does "scroll-back remount" look like the very first time the user scrolls back UP into the hero from the unmounted state?**
   - What we know: `onEnterBack` fires when scrolling back past the `bottom top` end position. We set `phase = 'visible'`, which mounts `<Plasma>` again.
   - What's unclear: there will be a brief moment where the canvas is allocating and the first frame is computing — does that need a fade-IN as well as the fade-OUT?
   - Recommendation: add a symmetric `opacity 0 → 1` transition by using the same `phase === 'fading'` opacity logic but flipping it on mount-in via a `useEffect`. Verify in user testing; if it feels abrupt, add a one-frame `opacity: 0` on mount and tween to 1. This is a polish call, not a blocker.

3. **Does `mouseInteractive: !isMobile` need a viewport-size hysteresis to avoid thrash at the 430px boundary?**
   - What we know: `useDeviceCapabilities` already debounces resize to ~16ms.
   - What's unclear: rotating a tablet at exactly 430px wide will flip `isMobile` repeatedly. Each flip re-runs the `<Plasma>` useEffect, tearing down and rebuilding the GL context.
   - Recommendation: monitor in Phase 4 verification. The 16ms debounce should be enough. If GL thrash appears, raise the debounce or add a small hysteresis band (e.g. `isMobile: true` triggers ≤ 430, `isMobile: false` triggers ≥ 460). Out of scope for Phase 4 plans unless verification shows the bug.

4. **Should Phase 4 expose dev-mode toggles (e.g. `?debug=plasma` query param) for QA?**
   - What we know: Verification in Phase 4 needs to confirm exactly one GL context after StrictMode settle, rAF stops on unmount, etc.
   - What's unclear: do these need to be runtime-toggleable, or is browser DevTools sufficient?
   - Recommendation: DevTools is sufficient. Verification tasks should document specific DevTools steps (Memory panel: filter `WebGL`, count contexts). Skip the URL param.

## Sources

### Primary (HIGH confidence)

- **`inspo.txt`** — the verified-working OGL Plasma component, lines 467–690. Acts as the reference port. License: implied from inspo "Plasma Showcase" — assume free use for personal portfolio per inspo's stated framing.
- **`oframe/ogl` master at GitHub** — `package.json` (version `1.0.11`) and `src/core/Renderer.js` (constructor signature). Fetched 2026-06-10. URLs: https://github.com/oframe/ogl, https://raw.githubusercontent.com/oframe/ogl/master/package.json, https://raw.githubusercontent.com/oframe/ogl/master/src/core/Renderer.js
- **React `useSyncExternalStore` docs** — snapshot caching rule (`Object.is`). https://react.dev/reference/react/useSyncExternalStore
- **GSAP React docs** — `useGSAP` scope clarification (GSAP-only, NOT WebGL). https://gsap.com/resources/React/
- **GSAP ScrollTrigger docs** — `onEnter` / `onLeave` / `onEnterBack` / `onLeaveBack` semantics; cleanup requirement. https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- **MDN `WEBGL_lose_context.loseContext()`** — official cleanup mechanism. https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext
- **Existing codebase**:
  - `src/context/ScrollContext.tsx` — verifies the snapshot-reference-stability contract is already met
  - `src/hooks/useDeviceCapabilities.ts` — shape of the returned capabilities object
  - `src/lib/gsap.ts` — confirms registration order, the `@/lib/gsap` import rule
  - `src/components/scroll/RevealSection.tsx`, `ParallaxCard.tsx` — established patterns for `useGSAP` + `useDeviceCapabilities`
  - `src/components/error/AnimationErrorBoundary.tsx` — fallback shell to wrap `<HeroBackdrop>` with
  - `src/App.tsx` lines 150–154 — proves `ScrollTrigger.refresh()` runs after font load
  - `.planning/research/PITFALLS.md` §1.1–§1.3 — Phase 1 pre-research already covered most of the OGL pitfalls

### Secondary (MEDIUM confidence)

- **React 19 StrictMode + WebGL discussion** — `react.dev/StrictMode` reference; corroborated by multiple community sources. https://react.dev/reference/react/StrictMode
- **r3f leak issues** — used only to confirm the leak symptom is real and well-documented in the React-WebGL ecosystem. https://github.com/pmndrs/react-three-fiber/issues/3093

### Tertiary (LOW confidence — flagged for validation)

- **`use-sync-external-store/shim/with-selector`** as a recommended selector helper: real package, used by Zustand/Redux. Not needed in Phase 4 because the boolean threshold can be expressed cleaner with the ScrollTrigger callback pattern. Mentioned for completeness, not as a recommendation.
- **MEDIUM-flagged subjective tuning numbers** (speed 0.35 vs 0.4, FADE_MS=250 vs 300, pulse duration 7s): all within the CONTEXT.md-locked ranges. Specific numbers should be tuned by eye during Phase 4 verification and may be adjusted in the plan without re-research.

### Tools attempted but unavailable

- **Context7 MCP** — listed in the agent tool spec but the corresponding `mcp__context7__*` tools are not exposed in this session. Sources for OGL were obtained directly from the GitHub raw `package.json` and `Renderer.js` (HIGH confidence — that IS the official source). GSAP and React sources were obtained via WebFetch against official docs (HIGH-MEDIUM confidence — official docs but not Context7-verified).

## Metadata

**Confidence breakdown:**
- **Standard stack** (OGL 1.0.11 with the exact constructor args): HIGH — verified directly against `oframe/ogl` master source on 2026-06-10. Matches inspo pin.
- **Architecture** (3-component split + `useEffect` for WebGL + `useGSAP` for ScrollTrigger): HIGH — directly follows GSAP-team-documented `useGSAP` scoping and React's effect lifecycle rules. Existing codebase patterns (`ParallaxCard`, `RevealSection`) confirm the approach.
- **Pitfalls** (StrictMode leak, DPR burn, snapshot churn, ScrollTrigger ref timing): HIGH — corroborated by PITFALLS.md, MDN, GSAP docs, and React docs. No LOW-confidence pitfalls listed.
- **Pre-unmount fade approach** (CSS transition over `framer-motion` `AnimatePresence`): MEDIUM — opinionated call. Documented as a recommendation, not a mandate. The planner can swap if there's reason.
- **`HeroBackdrop` dispatcher pattern** vs alternatives (inline gating, render-prop wrapper, etc.): MEDIUM — the recommended pattern is the cleanest fit for the existing codebase, but other shapes would also work.

**Research date:** 2026-06-10
**Valid until:** ~2026-07-10 (30 days). OGL is stable. React 19 + GSAP 3.15 + ScrollTrigger semantics are unlikely to shift within that window. Re-verify if `ogl@^1.1` ships before phase execution.
