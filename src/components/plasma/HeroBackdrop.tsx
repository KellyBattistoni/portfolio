import { useEffect, useRef, useState } from 'react'

import { ScrollTrigger } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

import { Plasma } from './Plasma'
import { PlasmaFallback } from './PlasmaFallback'

export interface HeroBackdropProps {
  heroRef: React.RefObject<HTMLElement | null>
}

export function HeroBackdrop({ heroRef }: HeroBackdropProps) {
  const { prefersReducedMotion, isMobile, supportsWebGL2 } = useDeviceCapabilities()
  const useFallback = prefersReducedMotion || !supportsWebGL2

  // 'visible'   — Plasma mounted, opacity scrubbed by scroll
  // 'unmounted' — hero fully past viewport, Plasma unmounted to stop rAF + free GL
  const [phase, setPhase] = useState<'visible' | 'unmounted'>('visible')

  // plasmaRef: the div whose opacity is scrubbed on scroll
  const plasmaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (useFallback) return
    // heroRef is the parent <section> — always set by commit time when useEffect fires
    if (!heroRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: heroRef.current,
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
  }, [useFallback, heroRef])

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {useFallback && <PlasmaFallback />}
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
