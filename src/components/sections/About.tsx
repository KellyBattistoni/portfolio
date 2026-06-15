import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { PlasmaFallback } from '@/components/plasma/PlasmaFallback'

const ARC_NODES = [
  { key: 'node1', isCurrent: false },
  { key: 'node2', isCurrent: false },
  { key: 'node3', isCurrent: true },
] as const

export function About() {
  const { t } = useTranslation('about')
  const { prefersReducedMotion } = useDeviceCapabilities()

  const sectionRef = useRef<HTMLElement>(null)
  const accentLineRef = useRef<HTMLSpanElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const para1Ref = useRef<HTMLParagraphElement>(null)
  const para2Ref = useRef<HTMLParagraphElement>(null)
  const para3Ref = useRef<HTMLParagraphElement>(null)
  const arcLineRef = useRef<HTMLDivElement>(null)
  const arcNodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  const statsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!sectionRef.current || !statsRef.current) return

        const nodes = arcNodeRefs.current.filter(Boolean) as HTMLDivElement[]
        if (nodes.length < 3) return

        const dots = dotRefs.current.filter(Boolean) as HTMLDivElement[]
        const statItems = Array.from(statsRef.current.children) as HTMLElement[]

        // Glow constants — consistent shadow structure so GSAP can interpolate
        const GLOW = '0 0 0 6px rgba(255,69,0,0.22), 0 0 22px 8px rgba(255,69,0,0.38)'
        const NO_GLOW = '0 0 0 0px rgba(255,69,0,0), 0 0 0px 0px rgba(255,69,0,0)'
        const SOFT_GLOW = '0 0 0 4px rgba(255,69,0,0.15), 0 0 20px 6px rgba(255,69,0,0.25)'

        // --- initial states ---
        gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(headingRef.current, { opacity: 0, y: 30 })
        gsap.set([para1Ref.current, para2Ref.current, para3Ref.current], { opacity: 0, y: 20 })
        gsap.set(arcLineRef.current, { scaleY: 0, transformOrigin: 'top center' })
        gsap.set(nodes, { opacity: 0, y: 18 })
        gsap.set(dots, { boxShadow: NO_GLOW })
        gsap.set(statItems, { opacity: 0, y: 16 })

        // Timing contract (all offsets from 'start' label):
        //   P1: 0 → 0.75   P2: 0.50 → 1.25   P3: 1.00 → 1.75
        //   T1: 0 → 0.70   T2: 0.30 → 1.00   T3: 0.60 → 1.25  (T3 end = P2 end ✓)
        //   S1 starts at 1.00 (= P3 start ✓)
        //   Dot expands strictly sequential: T1 @ 0, T2 @ 0.35, T3 @ 0.70

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            once: true,
          },
        })

        tl
          // Accent line + heading — heading overlaps, 'start' fires while heading is mid-way in
          .to(accentLineRef.current, { scaleX: 1, duration: 0.4, ease: 'power2.out' })
          .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.15')
          .addLabel('start', '-=0.45')

          // Left column ──────────────────────────────────────────
          .to(para1Ref.current, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 'start')
          .to(para2Ref.current, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 'start+=0.5')
          .to(para3Ref.current, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 'start+=1.0')

          // Right column — nodes fade in ─────────────────────────
          .to(nodes[0], { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 'start')
          .to(nodes[1], { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 'start+=0.3')
          .to(nodes[2], { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 'start+=0.6')
          // Line draws for the full T1→T3 window (1.25s)
          .to(arcLineRef.current, { scaleY: 1, duration: 1.25, ease: 'power1.inOut' }, 'start')

          // Dot expand/glow — sequential: each expand starts when previous ends ─
          // T1: expand → settle (back to normal — past moment)
          .to(dots[0], { scale: 2.0, boxShadow: GLOW, duration: 0.35, ease: 'power2.out' }, 'start')
          .to(dots[0], { scale: 1, boxShadow: NO_GLOW, duration: 0.55, ease: 'power2.inOut' }, 'start+=0.35')
          // T2: expand → settle
          .to(dots[1], { scale: 2.0, boxShadow: GLOW, duration: 0.35, ease: 'power2.out' }, 'start+=0.35')
          .to(dots[1], { scale: 1, boxShadow: NO_GLOW, duration: 0.55, ease: 'power2.inOut' }, 'start+=0.7')
          // T3 (Now): expand → spring back but keeps its glow
          .to(dots[2], { scale: 1.7, boxShadow: GLOW, duration: 0.35, ease: 'power2.out' }, 'start+=0.7')
          .to(dots[2], { scale: 1, boxShadow: SOFT_GLOW, duration: 0.6, ease: 'elastic.out(1,0.4)' }, 'start+=1.05')

          // Stats: S1 starts exactly when P3 starts (start+1.0)
          .to(statItems, { opacity: 1, y: 0, duration: 0.55, stagger: 0.14, ease: 'power2.out' }, 'start+=1.0')

        return () => {
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      })
      return () => mm.revert()
    },
    { dependencies: [prefersReducedMotion] }
  )

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label={t('title')}
      style={{
        position: 'relative',
        padding: '3rem 1.5rem 6rem',
        backgroundColor: 'var(--color-brand-bg)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.28,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
        }}
      >
        <PlasmaFallback />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '72rem', margin: '0 auto' }}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 md:items-center">
          {/* Left: prose */}
          <div>
            <span
              ref={accentLineRef}
              aria-hidden="true"
              style={{
                display: 'block',
                height: '1px',
                width: '3rem',
                background: 'var(--color-brand-accent)',
                marginBottom: '1.5rem',
              }}
            />
            <h2
              ref={headingRef}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                marginTop: 0,
                marginBottom: '1.5rem',
              }}
            >
              {t('title')}
            </h2>
            <p ref={para1Ref} style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {t('paragraph1')}
            </p>
            <p ref={para2Ref} style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {t('paragraph2')}
            </p>
            <p ref={para3Ref} style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: 0 }}>
              {t('paragraph3')}
            </p>
          </div>

          {/* Right: career arc + stats below */}
          <div className="md:self-center">
            <div style={{ position: 'relative' }}>
              {/* Connecting line — scoped to arc wrapper, no bleed into stats */}
              <div
                ref={arcLineRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '5px',
                  top: '0.75rem',
                  bottom: '0.75rem',
                  width: '1px',
                  background:
                    'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.18) 85%, transparent)',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {ARC_NODES.map((node, i) => (
                  <div
                    key={node.key}
                    ref={(el) => { arcNodeRefs.current[i] = el }}
                    style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                  >
                    <div
                      style={{
                        width: '12px',
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: '0.55rem',
                      }}
                    >
                      <div
                        ref={(el) => { dotRefs.current[i] = el }}
                        style={{
                          width: node.isCurrent ? '12px' : '8px',
                          height: node.isCurrent ? '12px' : '8px',
                          borderRadius: '50%',
                          background: 'var(--color-brand-accent)',
                          opacity: node.isCurrent ? 1 : 0.6,
                          boxShadow: node.isCurrent
                            ? '0 0 0 4px rgba(255,69,0,0.15), 0 0 20px 6px rgba(255,69,0,0.25)'
                            : 'none',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                          lineHeight: 1,
                          color: node.isCurrent
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.45)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {t(`arc.${node.key}.year`)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          letterSpacing: '0.03em',
                          color: node.isCurrent
                            ? 'rgba(255,255,255,0.85)'
                            : 'rgba(255,255,255,0.6)',
                          marginBottom: '0.375rem',
                        }}
                      >
                        {t(`arc.${node.key}.role`)}
                      </div>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          lineHeight: 1.55,
                          color: node.isCurrent
                            ? 'rgba(255,255,255,0.45)'
                            : 'rgba(255,255,255,0.35)',
                          margin: 0,
                        }}
                      >
                        {t(`arc.${node.key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats — below arc, border-top creates visual separation */}
            <div
              ref={statsRef}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {(['continents', 'automations', 'years'] as const).map((key) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                      lineHeight: 1,
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {t(`stats.${key}.value`)}
                    <span style={{ color: 'var(--color-brand-accent)' }}>
                      {t(`stats.${key}.suffix`)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: '0.5rem',
                    }}
                  >
                    {t(`stats.${key}.label`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
