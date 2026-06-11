/**
 * HeroBackdrop — Phase 4 dispatcher.
 *
 * THE single point of decision: "should the hero render the real Plasma
 * (WebGL), the CSS-only fallback gradient, or nothing at all?"
 *
 * Responsibilities:
 *   • Read useDeviceCapabilities ONCE — gate Plasma vs PlasmaFallback before
 *     any GL context allocation happens.
 *   • Own the hero-bottom-leaves-viewport ScrollTrigger and drive a phase
 *     state machine: 'visible' -> 'fading' (250ms CSS opacity tween) ->
 *     'unmounted' (Plasma actually unmounts, rAF loop stops, GL context
 *     released).
 *   • On scroll-back (onEnterBack), cancel any pending fade timer and snap
 *     back to 'visible' — remounts Plasma cleanly.
 *
 * EXPLICITLY NOT this component's job:
 *   • WebGL setup / cleanup — that lives inside Plasma.
 *   • Hero copy, PillNav, CTA — Phase 5.
 *   • Error boundary — caller (App.tsx test harness, future Hero) wraps it.
 *
 * Architectural rules honored:
 *   • All GSAP imports come from '@/lib/gsap' (Phase 1 rule).
 *   • Cleanup kills its OWN ScrollTrigger (trigger.kill()), NEVER
 *     ScrollTrigger.getAll() — that would nuke RevealSection / ParallaxCard.
 *   • Stable primitive props on <Plasma> — no inline objects or computed
 *     values, so Plasma's useEffect only re-runs on real mount/unmount.
 *   • Fallback path never allocates a GL context (verifiable via
 *     document.querySelectorAll('canvas').length).
 */

import { useRef, useState, type RefObject } from 'react'

import { ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

import { Plasma } from './Plasma'
import { PlasmaFallback } from './PlasmaFallback'

interface HeroBackdropProps {
  /**
   * Ref to the hero <section> (or any HTMLElement) that defines the
   * ScrollTrigger boundary. The trigger fires `onLeave` when the hero's
   * bottom edge crosses the viewport top (CONTEXT.md: "100% scrolled past").
   *
   * Typed as `HTMLElement | null` to match React 19's inferred return type
   * for `useRef<HTMLElement>(null)`.
   */
  heroRef: RefObject<HTMLElement | null>
}

/**
 * Pre-unmount fade duration in ms. CONTEXT.md: "200–300ms opacity fade before
 * React unmounts the component." 250ms lands in the middle of that band.
 */
const FADE_MS = 250

export function HeroBackdrop({ heroRef }: HeroBackdropProps) {
  const { prefersReducedMotion, isMobile, supportsWebGL2 } = useDeviceCapabilities()

  // The fallback gate is intentionally narrow: only prefersReducedMotion OR
  // missing WebGL2. Low-end devices (`isLowEnd`) that DO have WebGL2 still
  // get the real Plasma at the DPR cap — `isLowEnd` is reserved for finer
  // Phase 7 perf tuning, not the gate here.
  const useFallback = prefersReducedMotion || !supportsWebGL2

  const [phase, setPhase] = useState<'visible' | 'fading' | 'unmounted'>('visible')
  const fadeTimerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Fallback path never unmounts on scroll — CSS gradient is free.
      if (useFallback) return

      // Hero ref hasn't attached yet (first paint timing). Dependency on
      // `heroRef` causes useGSAP to re-run when it populates.
      if (!heroRef.current) return

      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        // CONTEXT-locked thresholds:
        //   start 'top top'      — hero top reaches viewport top
        //   end   'bottom top'   — hero bottom leaves viewport top (100% past)
        start: 'top top',
        end: 'bottom top',
        onLeave: () => {
          setPhase('fading')

          // Defensive: clear any stale fade timer before scheduling a new
          // one. Prevents a leaked timer if the user thrash-scrolls past,
          // back, and past again within FADE_MS.
          if (fadeTimerRef.current !== null) {
            window.clearTimeout(fadeTimerRef.current)
          }
          fadeTimerRef.current = window.setTimeout(() => {
            setPhase('unmounted')
            fadeTimerRef.current = null
          }, FADE_MS)
        },
        onEnterBack: () => {
          // User scrolled back UP into the hero — cancel any pending fade
          // (we may still be between 'fading' and 'unmounted') and snap
          // straight to 'visible'. Plasma either stays mounted (if we never
          // hit unmounted) or remounts (if we did).
          if (fadeTimerRef.current !== null) {
            window.clearTimeout(fadeTimerRef.current)
            fadeTimerRef.current = null
          }
          setPhase('visible')
        },
      })

      return () => {
        if (fadeTimerRef.current !== null) {
          window.clearTimeout(fadeTimerRef.current)
          fadeTimerRef.current = null
        }
        // Kill ONLY our trigger — never ScrollTrigger.getAll(), which would
        // also kill RevealSection / ParallaxCard triggers living in the
        // Phase 3 test harness still in App.tsx.
        trigger.kill()
      }
    },
    // scope is containerRef (our own root div), NOT heroRef — useGSAP uses
    // scope for its OWN cleanup boundary; the ScrollTrigger's trigger config
    // points at heroRef separately.
    //
    // Dependencies:
    //   - heroRef: re-run when the ref object identity itself changes
    //     (effectively once, but defensive against Phase 5 wiring patterns)
    //   - useFallback: if OS reduced-motion is toggled mid-session, the
    //     ScrollTrigger is torn down and re-created (or, in the fallback
    //     case, never created).
    { scope: containerRef, dependencies: [heroRef, useFallback] }
  )

  // --- Fallback path: zero GL, zero ScrollTrigger, never unmounts. ---
  if (useFallback) {
    return (
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <PlasmaFallback animated={!prefersReducedMotion} />
      </div>
    )
  }

  // --- Unmounted state: keep the ref-host div mounted so containerRef
  //     stays non-null and the useGSAP scope binding for onEnterBack still
  //     has somewhere to point. Empty children = real GL context released. ---
  if (phase === 'unmounted') {
    return (
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />
    )
  }

  // --- Visible or fading: render Plasma inside the opacity-fading wrapper. ---
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
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
