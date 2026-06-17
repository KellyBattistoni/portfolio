/**
 * Hero — Phase 5 first vertical slice.
 *
 * Full-screen, bilingual hero section. The three text elements (name,
 * tagline, CTA) drift upward and fade out at different rates as the user
 * scrolls, exposing the next section. The HeroBackdrop (Plasma / fallback
 * dispatch) is rendered as the first child and handles its own scroll-tied
 * unmount, so this component never manages the WebGL layer itself.
 *
 * Architectural rules honored:
 *   - All GSAP imports route through '@/lib/gsap' (Phase 1 rule).
 *   - prefersReducedMotion double-guarded:
 *       1. Early-return in useGSAP when the hook flag is set.
 *       2. gsap.matchMedia('(prefers-reduced-motion: no-preference)') wraps
 *          the actual animation so a runtime OS preference flip tears the
 *          animation down (mirrors RevealSection / ParallaxCard).
 *   - sectionRef is forwarded from the caller — PillNav (Plan 05-03) uses
 *     the same ref as its ScrollTrigger trigger, so nav appear-on-scroll
 *     stays in sync with the hero's actual position in the DOM.
 *   - Three independent ScrollTrigger tweens (one per element). End values
 *     diverge intentionally: CTA disappears first (30%), tagline next (35%),
 *     name last (40%) — name is the brand anchor, stays readable longest.
 *   - HeroBackdrop wrapped in AnimationErrorBoundary — Plasma WebGL crashes
 *     never take the hero copy down with them.
 *
 * Per [04-03] decision: explicit zIndex values on container divs are
 * mandatory — without them Chrome's GPU compositor can stack the WebGL
 * canvas above the text layer despite CSS stacking spec.
 */

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'

export interface HeroProps {
  /** Forwarded to the root <section> so PillNav's ScrollTrigger can use it as trigger. */
  sectionRef: React.RefObject<HTMLElement | null>
}

export function Hero({ sectionRef }: HeroProps) {
  const { t } = useTranslation('hero')
  const { prefersReducedMotion } = useDeviceCapabilities()

  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const ctaFillRef = useRef<HTMLSpanElement>(null)
  const ctaTextRef = useRef<HTMLSpanElement>(null)

  const { contextSafe } = useGSAP(
    () => {
      // Reduced-motion: skip animation setup entirely. Content renders in its
      // resting state — no GSAP tweens or ScrollTriggers ever created.
      if (prefersReducedMotion) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const hero = sectionRef.current
        if (!hero) return

        // Name: slowest drift — brand anchor, stays readable longest.
        gsap.to(nameRef.current, {
          y: 40,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
        })

        // Tagline: mid drift.
        gsap.to(taglineRef.current, {
          y: 70,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '35% top', scrub: true },
        })

        // CTA: fastest drift — disappears first as user begins to scroll.
        gsap.to(ctaRef.current, {
          y: 100,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '30% top', scrub: true },
        })

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
    // No `scope` — refs target individual elements inside the section, not
    // the section root. Passing the section as scope here would be incorrect
    // because we'd be scoping selectors that we don't use.
    { dependencies: [prefersReducedMotion] }
  )

  const handleCTAEnter = contextSafe(() => {
    gsap.to(ctaFillRef.current, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
    gsap.to(ctaTextRef.current, { color: '#050505', duration: 0.3, ease: 'power2.out' })
  })

  const handleCTALeave = contextSafe(() => {
    gsap.to(ctaFillRef.current, { scaleX: 0, duration: 0.25, ease: 'power2.in' })
    gsap.to(ctaTextRef.current, { color: 'white', duration: 0.25, ease: 'power2.in' })
  })

  const handleCTAClick = contextSafe((e: React.MouseEvent) => {
    e.preventDefault()
    gsap
      .timeline()
      .to(ctaRef.current, { scale: 0.94, duration: 0.1, ease: 'power2.in' })
      .to(ctaRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' })
    handleCTALeave()
    const section = document.querySelector<HTMLElement>('#work')
    const h2 = section?.querySelector('h2')
    if (h2) {
      window.scrollTo({
        top: Math.max(0, h2.getBoundingClientRect().top + window.scrollY - 73),
        behavior: 'smooth',
      })
    }
    window.dispatchEvent(new CustomEvent('section:replay', { detail: '#work' }))
  })

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        isolation: 'isolate',
        backgroundColor: '#050505',
      }}
      aria-label="Hero"
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 92% 5%, rgba(74,31,204,0.18) 0%, rgba(74,31,204,0.09) 22%, rgba(74,31,204,0.02) 42%, transparent 58%), ' +
            'radial-gradient(ellipse at 85% 95%, rgba(74,31,204,0.14) 0%, rgba(74,31,204,0.07) 22%, rgba(74,31,204,0.02) 42%, transparent 58%)',
        }}
      />
      <AnimationErrorBoundary>
        <HeroBackdrop heroRef={sectionRef} />
      </AnimationErrorBoundary>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '0 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          ref={nameRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {t('heading.title')}
        </h1>
        <p
          ref={taglineRef}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.15rem, 2.3vw, 1.625rem)',
            color: 'rgba(255,255,255,0.88)',
            margin: 0,
            maxWidth: '44ch',
          }}
        >
          {t('heading.tagline')}
        </p>
        <a
          ref={ctaRef}
          href="#work"
          onClick={handleCTAClick}
          onMouseEnter={handleCTAEnter}
          onMouseLeave={handleCTALeave}
          style={{
            display: 'inline-block',
            padding: '0.875rem 2.25rem',
            border: '1px solid #FF4500',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            background: 'transparent',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            ref={ctaFillRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#FF4500',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              pointerEvents: 'none',
            }}
          />
          <span ref={ctaTextRef} style={{ position: 'relative', zIndex: 1 }}>
            {t('cta')}
          </span>
        </a>
      </div>
    </section>
  )
}
