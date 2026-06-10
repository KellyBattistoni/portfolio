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
 *   - Uses ScrollTrigger scrub to tie each layer's y position to the card's
 *     viewport progress (top-of-card enters bottom → bottom-of-card exits top).
 *     At the midpoint the layer is at y=0; it travels from -yRange to +yRange
 *     over the full scroll arc. This bounds displacement so content never clips
 *     regardless of where the card sits on the page.
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
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
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

      // ScrollTrigger scrub: each layer animates from -yRange to +yRange as the
      // card scrolls from entering the bottom of the viewport to exiting the top.
      // At the midpoint (card center at viewport center) y=0. This bounds the
      // displacement so content never gets clipped regardless of page position.
      layers.forEach((layer, i) => {
        const el = layerRefs.current[i]
        if (!el || layer.speed === 0) return

        const yRange = layer.speed * 100  // speed=0.15 → ±15px, speed=0.35 → ±35px

        gsap.fromTo(
          el,
          { y: -yRange },
          {
            y: yRange,
            ease: 'none',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
      })

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    },
    {
      scope: cardRef,
      dependencies: [prefersReducedMotion, isMobile],
    }
  )

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', height: '100%' }}
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
