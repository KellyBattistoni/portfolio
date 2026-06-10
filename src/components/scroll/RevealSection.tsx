/**
 * RevealSection — scroll-triggered entry animation wrapper.
 *
 * Reveals children once when the container's top edge crosses 85% down the
 * viewport. Plays a single time per page load (`once: true`) — the
 * ScrollTrigger self-kills after firing so there is no ongoing listener cost.
 *
 * Variants:
 *   - fade-up         : opacity 0 → 1, y 30 → 0  (default)
 *   - slide-from-left : opacity 0 → 1, x -50 → 0
 *   - scale-up        : opacity 0 → 1, scale 0.92 → 1
 *
 * Stagger:
 *   When `stagger` is true (default) and the container has multiple direct
 *   children, each child animates 120ms after the previous one via a single
 *   `gsap.fromTo` over the child array — one ScrollTrigger total, not N.
 *
 * Reduced motion:
 *   When `prefersReducedMotion` is true the effect returns early — children
 *   render as-is with no `from` state applied, so nothing snaps or fades. The
 *   `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` guard inside
 *   the effect adds a second layer of correctness for environments where the
 *   OS preference flips at runtime (matchMedia tears the animation down).
 *
 * GSAP imports route through `@/lib/gsap` so plugins stay registered exactly
 * once at module level (see `src/lib/gsap.ts`).
 */

import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

export type RevealVariant = 'fade-up' | 'slide-from-left' | 'scale-up'

/**
 * Tween-vars pair per variant. `from` is the pre-reveal state, `to` is the
 * resting state animated into when the trigger fires.
 */
const VARIANTS: Record<
  RevealVariant,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  'fade-up': {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
  },
  'slide-from-left': {
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
  },
  'scale-up': {
    from: { opacity: 0, scale: 0.92 },
    to: { opacity: 1, scale: 1 },
  },
}

export interface RevealSectionProps {
  children: ReactNode
  /** Animation flavor. Defaults to `'fade-up'`. */
  variant?: RevealVariant
  /**
   * When true (default), each direct child animates 120ms after the previous.
   * When false, the container itself is animated as a single element.
   */
  stagger?: boolean
  /** Tween duration in seconds. Defaults to 0.6 (within the 500–700ms spec). */
  duration?: number
  /** Optional delay in seconds applied before the tween starts. */
  delay?: number
  /** Forwarded to the wrapper `<div>`. */
  className?: string
}

export function RevealSection({
  children,
  variant = 'fade-up',
  stagger = true,
  duration = 0.6,
  delay,
  className,
}: RevealSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { prefersReducedMotion } = useDeviceCapabilities()

  useGSAP(
    () => {
      // Reduced-motion: skip the animation entirely. Children render in their
      // final state (no `from` ever applied, no ScrollTrigger created).
      if (prefersReducedMotion) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const container = containerRef.current
        if (!container) return

        const { from, to } = VARIANTS[variant]
        const childEls = Array.from(container.children) as Element[]

        if (stagger && childEls.length > 1) {
          gsap.fromTo(childEls, from, {
            ...to,
            duration,
            ease: 'power2.out',
            stagger: 0.12,
            delay: delay ?? 0,
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              once: true,
            },
          })
        } else {
          gsap.fromTo(container, from, {
            ...to,
            duration,
            ease: 'power2.out',
            delay: delay ?? 0,
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              once: true,
            },
          })
        }

        // Cleanup for this matchMedia branch — kill every ScrollTrigger this
        // component created so navigating away or flipping the OS preference
        // does not leak triggers.
        return () => {
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      })

      return () => {
        mm.revert()
      }
    },
    {
      scope: containerRef,
      dependencies: [variant, stagger, duration, delay, prefersReducedMotion],
    }
  )

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
