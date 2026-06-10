/**
 * ParallaxCard — multi-layer depth displacement driven by GSAP ticker.
 *
 * API:
 *   <ParallaxCard
 *     layers={[
 *       { content: <img …/>, speed: 0.2 },        // background drifts
 *       { content: <Title/>, speed: 0 },          // mid stays put
 *       { content: <Glow/>,  speed: -0.15 },      // foreground counter-drift
 *     ]}
 *   />
 *
 * Architecture decisions:
 *   - Reads scroll position from `scrollStore.getRef()` inside a single
 *     `gsap.ticker.add(tick)` callback. No scroll listener is attached here —
 *     the ScrollProvider's passive listener is the only one in the app.
 *   - Uses `gsap.quickSetter(el, 'y', 'px')` per layer instead of `gsap.set` —
 *     quickSetter caches the lookup, skips overwrite handling, and writes ~3x
 *     faster than `gsap.set` per frame.
 *   - Per-layer `y` is accumulated by `delta * speed` each tick. Reading the
 *     current `y` via `gsap.getProperty(el, 'y')` avoids tracking it in JS.
 *   - Card container has `overflow: hidden` (LOCKED per user decision) so
 *     layer movement is visually clipped within the card frame.
 *   - Layers are absolutely positioned (`inset: 0`) inside a relative card,
 *     so depth stack is purely DOM-order driven.
 *
 * Skip conditions:
 *   - `prefersReducedMotion` — accessibility kill switch
 *   - `isMobile` — preserves battery and avoids visual jank at < 430px
 *
 * Imports go through `@/lib/gsap` so plugins register exactly once.
 */

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { scrollStore } from '@/context/ScrollContext'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

export interface ParallaxLayer {
  /** Rendered inside this layer's absolutely-positioned wrapper. */
  content: ReactNode
  /**
   * Parallax speed multiplier:
   *   0     — static (no displacement)
   *   0.2   — drifts 20px down per 100px of scroll
   *  -0.2   — counter-parallax: drifts 20px up per 100px of scroll
   * Typical range: [-0.5, 0.5]. Larger magnitudes feel cartoony.
   */
  speed: number
  /** Forwarded to this layer's wrapper `<div>`. */
  className?: string
}

export interface ParallaxCardProps {
  layers: ParallaxLayer[]
  /** Forwarded to the card container `<div>`. */
  className?: string
}

export function ParallaxCard({ layers, className }: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const { prefersReducedMotion, isMobile } = useDeviceCapabilities()

  useGSAP(
    () => {
      // Skip on mobile and when reduced motion is requested — layers render
      // statically at their initial position, content remains fully readable.
      if (prefersReducedMotion || isMobile) return

      // Pre-build per-layer quickSetters. Each setter caches the target el
      // and the property writer — far cheaper than gsap.set inside the tick.
      const setters = layers.map((_, i) => {
        const el = layerRefs.current[i]
        return el ? gsap.quickSetter(el, 'y', 'px') : null
      })

      // Track the last scroll position so each tick applies only the delta —
      // per-layer y accumulates independently at its own speed multiplier.
      let lastScrollY = scrollStore.getRef().y

      const tick = () => {
        const currentY = scrollStore.getRef().y
        const delta = currentY - lastScrollY

        // No scroll motion this frame — bail early, no DOM writes.
        if (delta === 0) return

        layers.forEach((layer, i) => {
          const setter = setters[i]
          if (!setter) return
          const el = layerRefs.current[i]
          if (!el) return
          const current = gsap.getProperty(el, 'y') as number
          setter(current + delta * layer.speed)
        })

        lastScrollY = currentY
      }

      gsap.ticker.add(tick)

      return () => {
        gsap.ticker.remove(tick)
      }
    },
    {
      scope: cardRef,
      dependencies: [prefersReducedMotion, isMobile, layers],
    }
  )

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {layers.map((layer, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el
          }}
          className={layer.className}
          style={{ position: 'absolute', inset: 0 }}
        >
          {layer.content}
        </div>
      ))}
    </div>
  )
}
