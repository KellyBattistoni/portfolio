/**
 * MobileNav — mobile hamburger trigger + GSAP-timeline side panel.
 *
 * Renders a fixed top-right hamburger button that fades in at the same 70%
 * hero-scroll threshold as PillNav (shared trigger anchor: `heroRef`). Tapping
 * the trigger toggles a right-edge side panel via a paused GSAP timeline
 * (`tlRef.current.reversed()` flip pattern) — no useState drives the
 * animation. The timeline is built once inside `useGSAP`; the only React
 * state, `isOpen`, exists for `aria-expanded` + icon swap (☰ / ×).
 *
 * Timeline structure:
 *   t=0     : panel slides x: 100% → 0%   (0.4s, power3.out)
 *   t=0.25s : nav items fade-up stagger (0.08s per item, 0.35s each, '-=0.15')
 *
 * Toggle handler reads `tl.reversed()`, flips it, and pushes the new boolean
 * into React state so the icon/aria stay in sync with the underlying timeline.
 * On close, the timeline reverses; `setTimeout(150)` deferred scrollIntoView
 * lets the close animation start before the page begins scrolling.
 *
 * Reduced motion: when `prefersReducedMotion` is true, no timeline is built
 * and no scroll-trigger animation fires. The panel toggles open/closed via
 * a `display: flex` / `display: none` style switch (driven by `isOpen` state
 * via a conditional spread on the panel `style`). The hamburger trigger is
 * visible from first paint (no fade-in animation).
 *
 * GSAP imports route through `@/lib/gsap` so plugins stay registered exactly
 * once at module level (see `src/lib/gsap.ts`).
 */

import { useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

const NAV_ITEMS = [
  { key: 'about', href: '#about' },
  { key: 'work', href: '#work' },
  { key: 'stack', href: '#stack' },
  { key: 'contact', href: '#contact' },
] as const

type NavItemKey = (typeof NAV_ITEMS)[number]['key']

export interface MobileNavProps {
  heroRef: RefObject<HTMLElement | null>
}

export function MobileNav({ heroRef }: MobileNavProps) {
  const { t } = useTranslation('common')
  const { prefersReducedMotion } = useDeviceCapabilities()

  // `isOpen` is for aria-expanded + ☰/× icon swap ONLY. It is intentionally
  // NOT included in the useGSAP dependency array — the timeline is built once
  // and only its `reversed()` direction is flipped on toggle.
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      // Reduced-motion: skip all GSAP work. Trigger renders visible from first
      // paint, and the panel open/close is handled below via a display style
      // toggle driven by `isOpen`.
      if (prefersReducedMotion) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!heroRef.current) return

        // Hamburger entrance — same 70% hero-scroll threshold as PillNav.
        gsap.set(triggerRef.current, { autoAlpha: 0 })
        gsap.to(triggerRef.current, {
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heroRef.current,
            start: '70% top',
            once: true,
          },
        })

        // Side-panel timeline — starts paused + off-screen right. The toggle
        // handlers flip `reversed()` to play/reverse without rebuilding.
        gsap.set(panelRef.current, { x: '100%' })
        const tl = gsap
          .timeline({ paused: true })
          .to(panelRef.current, { x: '0%', duration: 0.4, ease: 'power3.out' })
          .from(
            itemRefs.current.filter(Boolean),
            {
              autoAlpha: 0,
              y: 20,
              stagger: 0.08,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.15'
          )
        // Park the timeline at t=0 in reversed direction so the first
        // `tl.reversed(!tl.reversed())` call plays it forward (open).
        tl.reverse(0)
        tlRef.current = tl

        return () => {
          tlRef.current?.kill()
          tlRef.current = null
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        }
      })

      return () => {
        mm.revert()
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  )

  // Toggle handlers are wrapped in contextSafe so any tweens they spawn (and
  // the underlying timeline play state) revert cleanly with the GSAP context
  // on unmount.
  const handleToggle = contextSafe(() => {
    const tl = tlRef.current
    if (tl) {
      // `tl.reversed()` returns the CURRENT direction. Flipping it via
      // `tl.reversed(!tl.reversed())` triggers play forward if currently
      // reversed (closed → opening), or reverse if currently forward
      // (open → closing). `nextOpen` reflects the post-flip state.
      const nextOpen = tl.reversed()
      tl.reversed(!tl.reversed())
      setIsOpen(nextOpen)
    } else {
      // Reduced-motion fallback — instant toggle via display style.
      setIsOpen((prev) => !prev)
    }
  })

  const handleClose = contextSafe(() => {
    const tl = tlRef.current
    if (tl && !tl.reversed()) {
      tl.reverse()
    }
    setIsOpen(false)
  })

  // Nav-link click — close panel first, then scroll. The 150ms defer lets the
  // close animation start before scrollIntoView fires so the user sees the
  // panel collapse, not a snap-and-scroll combo.
  const handleNavClick = contextSafe((href: string) => {
    handleClose()
    setTimeout(() => {
      const target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  })

  return (
    <>
      {/* Language switcher — always visible from page load, independent of hamburger threshold */}
      <div
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 60,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          padding: '0.4rem 0.75rem',
        }}
      >
        <LanguageSwitcher className="flex gap-3" />
      </div>

      <div ref={containerRef}>
        {/* Hamburger — animates in at 70% hero scroll, positioned left of lang pill */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '7.5rem',
            zIndex: 60,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '9999px',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.1rem',
          }}
        >
          {isOpen ? '×' : '☰'}
        </button>

        {/* Backdrop — closes panel on tap; only rendered while panel is open */}
        {isOpen && (
          <div
            onClick={handleClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
            }}
          />
        )}

        {/* Side panel — slides in from right via GSAP timeline (or display
          toggle for reduced-motion users) */}
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '75vw',
            maxWidth: '320px',
            zIndex: 50,
            background: '#0a0a0a',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            padding: '5rem 2rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            // Reduced-motion users get an instant display-toggle open/close.
            // Non-reduced-motion users always have display:flex; the GSAP
            // timeline handles the off-screen positioning via `x`.
            ...(prefersReducedMotion ? { display: isOpen ? 'flex' : 'none' } : {}),
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.key}
              href={item.href}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(item.href)
              }}
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {t(`nav.${item.key satisfies NavItemKey}` as const)}
            </a>
          ))}
          <LanguageSwitcher className="mt-6 flex gap-4" />
        </div>
      </div>
    </>
  )
}
