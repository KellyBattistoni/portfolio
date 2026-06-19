import { useEffect, useRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { STACK, STACK_ORDER } from '@/components/stack/stack-registry'
import { StackIcon } from '@/components/stack/StackIcon'

const STACK_STYLES = `
.bands-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem 5rem;
}
.band-full { grid-column: 1 / -1; }
.band-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.band-lbl {
  font-size: 0.72rem;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
}
.band-rule {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
  display: block;
  transform-origin: left center;
}
.band-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.stack-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.875rem;
  min-width: 84px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255,255,255,0.6);
  border: 1px solid transparent;
  transition: transform 0.22s ease, color 0.22s ease, background 0.22s ease, border-color 0.22s ease;
}
.stack-tile:hover {
  transform: scale(1.12);
  color: var(--brand-color);
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.07);
}
@media (max-width: 768px) {
  .bands-grid { grid-template-columns: 1fr; }
  .band-full { grid-column: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .stack-tile { transition: color 0.22s ease; }
  .stack-tile:hover { transform: none; }
}
`

export function Stack() {
  const { t } = useTranslation('stack')
  const sectionRef = useRef<HTMLElement>(null)
  const accentLineRef = useRef<HTMLSpanElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bandsRef = useRef<HTMLDivElement>(null)
  const { prefersReducedMotion, isMobile } = useDeviceCapabilities()
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== '#stack') return
      tlRef.current?.restart()
    }
    window.addEventListener('section:replay', handler)
    return () => window.removeEventListener('section:replay', handler)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion || isMobile) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!sectionRef.current || !headingRef.current || !bandsRef.current) return

        const bands = Array.from(bandsRef.current.querySelectorAll<HTMLElement>('[data-band]'))

        gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(headingRef.current, { opacity: 0, y: 30 })

        bands.forEach((band) => {
          const lbl = band.querySelector('.band-lbl')
          const rule = band.querySelector('.band-rule')
          const tiles = Array.from(band.querySelectorAll('li'))
          if (lbl) gsap.set(lbl, { opacity: 0, x: -10 })
          if (rule) gsap.set(rule, { scaleX: 0 })
          gsap.set(tiles, { opacity: 0, y: 12 })
        })

        const tl = gsap.timeline({ paused: true })
        tlRef.current = tl

        tl.to(accentLineRef.current, { scaleX: 1, duration: 0.45, ease: 'power2.out' })
          .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.15')
          .addLabel('bands', '-=0.4')

        bands.forEach((band, i) => {
          const lbl = band.querySelector('.band-lbl')
          const rule = band.querySelector('.band-rule')
          const tiles = Array.from(band.querySelectorAll('li'))
          const base = i * 0.2

          if (lbl)
            tl.to(lbl, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, `bands+=${base}`)
          if (rule)
            tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.out' }, `bands+=${base + 0.08}`)
          tl.to(
            tiles,
            { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out', stagger: 0.032 },
            `bands+=${base + 0.24}`
          )
        })

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
          animation: tl,
        })

        return () => {
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      })
      return () => mm.revert()
    },
    { dependencies: [prefersReducedMotion, isMobile] }
  )

  return (
    <section
      ref={sectionRef}
      id="stack"
      aria-label={t('title')}
      style={{ position: 'relative', minHeight: '100vh', padding: '6rem 1.5rem' }}
    >
      <style>{STACK_STYLES}</style>

      {/* Dual-color atmosphere: orange upper-left + indigo right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 88% 80%, rgba(255,69,0,0.18) 0%, rgba(255,69,0,0.10) 22%, rgba(255,69,0,0.03) 44%, rgba(255,69,0,0) 60%), ' +
            'radial-gradient(ellipse at 8% 25%, rgba(74,31,204,0.26) 0%, rgba(74,31,204,0.16) 20%, rgba(74,31,204,0.06) 38%, rgba(74,31,204,0) 56%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 65%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 65%, transparent 100%)',
        }}
      />

      {/* Dot-matrix texture — technical, circuit-board feel */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 65%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 65%, transparent 100%)',
        }}
      />

      <div
        style={{ position: 'relative', zIndex: 1, maxWidth: 'min(90rem, 88vw)', margin: '0 auto' }}
      >
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
            marginBottom: '4rem',
          }}
        >
          {t('title')}
        </h2>

        <div ref={bandsRef} className="bands-grid">
          {STACK_ORDER.map((cat) => (
            <div key={cat} className={`stack-band${cat === 'data' ? ' band-full' : ''}`} data-band>
              <div className="band-header">
                <span className="band-lbl">{t(`categories.${cat}`)}</span>
                <span className="band-rule" aria-hidden="true" />
              </div>
              <ul className="band-icons">
                {STACK.filter((s) => s.category === cat).map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stack-tile"
                      aria-label={`${entry.name} — official website`}
                      style={{ '--brand-color': entry.brandColor } as CSSProperties}
                    >
                      <StackIcon entry={entry} size={40} />
                      <span style={{ fontSize: '0.7rem', textAlign: 'center' }}>{entry.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
