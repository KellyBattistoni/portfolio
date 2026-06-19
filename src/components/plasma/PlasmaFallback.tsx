/**
 * PlasmaFallback — zero-WebGL deep-red-to-black radial gradient.
 *
 * Rendered by HeroBackdrop whenever:
 *   • prefersReducedMotion === true, OR
 *   • supportsWebGL2 === false
 *
 * Hard constraint: this file MUST stay free of any WebGL bindings or 3D
 * renderer imports. Static — no animation (opacity animation caused visible
 * banding artifacts regardless of gradient implementation).
 */

export function PlasmaFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at 85% 10%, rgba(74,31,204,0.45) 0%, rgba(74,31,204,0.24) 22%, rgba(74,31,204,0.08) 45%, transparent 68%), ' +
          'radial-gradient(ellipse at 10% 85%, rgba(74,31,204,0.35) 0%, rgba(74,31,204,0.18) 22%, rgba(74,31,204,0.05) 45%, transparent 65%), ' +
          'radial-gradient(ellipse at 50% 38%, ' +
          'rgb(90, 18, 2) 0%, ' +
          'rgb(74, 15, 2) 12%, ' +
          'rgb(58, 12, 2) 23%, ' +
          'rgb(44, 10, 2) 34%, ' +
          'rgb(31, 8, 2) 46%, ' +
          'rgb(20, 7, 3) 57%, ' +
          'rgb(12, 6, 3) 68%, ' +
          'rgb(8, 5, 4) 78%, ' +
          'rgb(5, 5, 5) 90%)',
      }}
    />
  )
}
