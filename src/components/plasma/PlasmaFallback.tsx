/**
 * PlasmaFallback — zero-WebGL deep-red-to-black radial gradient.
 *
 * Rendered by HeroBackdrop (plan 04-02) whenever:
 *   • prefersReducedMotion === true, OR
 *   • supportsWebGL2 === false
 *
 * Hard constraint: this file MUST stay free of any WebGL bindings or 3D
 * renderer imports. Only opacity is animated (GPU-composited; everything
 * else triggers layout/paint per frame and defeats the purpose of a
 * "fallback").
 */

interface PlasmaFallbackProps {
  /**
   * If true, applies the `plasma-fallback-pulse` keyframes (~7s ease-in-out
   * opacity-only loop). Caller (HeroBackdrop) MUST pass `false` when
   * `prefersReducedMotion === true`. The keyframes themselves also degrade
   * to a no-op under `@media (prefers-reduced-motion: reduce)` as a
   * belt-and-suspenders safeguard.
   */
  animated?: boolean
}

export function PlasmaFallback({ animated = false }: PlasmaFallbackProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        // Multi-stop deep red -> black, ellipse hot-spot above middle (50% 45%)
        // matches where the eye expects a horizon in a wide-aspect hero.
        background:
          'radial-gradient(ellipse at 50% 45%, ' +
          'rgba(255, 69, 0, 0.55) 0%, ' +
          'rgba(180, 30, 0, 0.35) 25%, ' +
          'rgba(80, 10, 0, 0.2) 55%, ' +
          '#050505 90%)',
        // `undefined` lets React strip the property entirely from the DOM —
        // `'none'` would emit `animation: none` (harmless but noisier in
        // DevTools).
        animation: animated ? 'plasma-fallback-pulse 7s ease-in-out infinite' : undefined,
      }}
    />
  )
}
