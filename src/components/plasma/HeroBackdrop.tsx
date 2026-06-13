/**
 * HeroBackdrop — Phase 4 dispatcher.
 *
 * Dispatch:
 *   • No-WebGL2 / reduced-motion → renders nothing. The global fixed
 *     AnimationRootPlaceholder gradient (App.tsx) is the backdrop for every
 *     section, so no extra element is needed — and avoids a scroll-seam
 *     between a scrolling in-section gradient and the fixed one beneath it.
 *   • WebGL capable → Plasma canvas. Fades out as the hero scrolls off the
 *     top (scroll-scrubbed opacity via onUpdate), then unmounts completely
 *     when the hero leaves the viewport (stops rAF + frees GL context).
 *
 * Architectural rules honored:
 *   • All GSAP imports come from '@/lib/gsap' (Phase 1 rule).
 *   • ScrollTrigger targets containerRef (this component's own root div,
 *     guaranteed non-null). onUpdate only writes to plasmaRef so the
 *     gradient layer is never touched by GSAP.
 *   • Cleanup kills its OWN ScrollTrigger only (trigger.kill()).
 *   • Stable primitive props on <Plasma> — no inline objects or computed
 *     values, so Plasma's useEffect only re-runs on real mount/unmount.
 */

import { useEffect, useRef, useState } from 'react'

import { ScrollTrigger } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

import { Plasma } from './Plasma'

export function HeroBackdrop() {
  const { prefersReducedMotion, isMobile, supportsWebGL2 } = useDeviceCapabilities()
  const useFallback = prefersReducedMotion || !supportsWebGL2

  // 'visible'   — Plasma mounted and visible (opacity controlled by scroll scrub)
  // 'unmounted' — hero fully past viewport, Plasma unmounted to stop rAF + free GL
  const [phase, setPhase] = useState<'visible' | 'unmounted'>('visible')

  // containerRef: outer wrapper — scroll trigger boundary, houses both layers.
  // plasmaRef:    inner Plasma wrapper — only this layer is opacity-scrubbed.
  const containerRef = useRef<HTMLDivElement>(null)
  const plasmaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (useFallback) return
    if (!containerRef.current) return

    const el = containerRef.current

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        if (plasmaRef.current) {
          plasmaRef.current.style.opacity = String(1 - self.progress)
        }
      },
      onLeave: () => setPhase('unmounted'),
      onEnterBack: () => setPhase('visible'),
    })

    return () => {
      if (plasmaRef.current) plasmaRef.current.style.opacity = ''
      trigger.kill()
    }
  }, [useFallback])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {!useFallback && phase !== 'unmounted' && (
        <div
          ref={plasmaRef}
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          }}
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
      )}
    </div>
  )
}
