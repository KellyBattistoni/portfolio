# Phase 4: Visual Foundations — Plasma + Noise - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Plasma WebGL hero background with correct lifecycle, fallback, and unmount behavior. The output is a standalone `<Plasma>` component that Phase 5 drops behind the real hero content. Hero copy, PillNav, and bilingual text are Phase 5's responsibility.

</domain>

<decisions>
## Implementation Decisions

### Shader source & visual style
- Port the OGL shader from `inspo.txt` verbatim (same GLSL, same OGL primitives: `Renderer`, `Program`, `Mesh`, `Triangle`)
- Tweak parameters, do not rewrite the shader
- Color: `#FF4500` (locked by ROADMAP)
- Speed: slow and meditative — target ~0.3–0.4 (inspo used 0.6; this is intentionally slower)
- Direction: `'forward'` always — no pingpong or reverse
- Scale: ~1.1 (close to inspo)
- Opacity: ~0.8–0.9 — rich and saturated, close to full bleed

### Mouse interaction
- `mouseInteractive: true` on desktop, `false` on mobile (≤ 430px, uses `isMobile` from `useDeviceCapabilities`)
- Mouse tracking scope: hero canvas only (not global window) — `mousemove` listener on the container div
- Reactivity level: keep inspo's coefficient (~0.0002) — subtle nudge, not a dramatic warp

### Scroll unmount
- Unmount threshold: when the hero bottom fully leaves the viewport (100% scrolled past) — not aggressive early cut
- Pre-unmount transition: short CSS opacity fade (~200–300ms) before React unmounts the component
- Scroll-back remount: yes — if user scrolls back into hero view, Plasma remounts and restarts

### Reduced-motion / no-WebGL2 fallback
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

</decisions>

<specifics>
## Specific Ideas

- Full shader source is in `inspo.txt` (`/src/Component.tsx` section) — port that GLSL verbatim, adjust uniforms via props
- inspo OGL setup: `webgl: 2`, `alpha: true`, `antialias: false` — keep these
- inspo already has `sanitize()` to guard against NaN/Inf in the shader output — keep it
- inspo cleanup: `cancelAnimationFrame(raf)`, `ro.disconnect()`, removes canvas from DOM — extend this to also call `gl.getExtension('WEBGL_lose_context')?.loseContext()` for React 18 StrictMode safety

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-visual-foundations-plasma-noise*
*Context gathered: 2026-06-10*
