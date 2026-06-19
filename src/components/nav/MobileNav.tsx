/**
 * MobileNav — mobile glass-pill nav + GSAP-timeline side panel.
 *
 * Mirrors PillNav's glass-pill container (same styles, same 40% scroll trigger).
 * On load the pill shows EN/ES only; at 40% hero scroll the hamburger wrapper
 * expands left (maxWidth: 0 → 80px, 0.2s) then fades in (opacity: 0 → 1, 0.3s),
 * exactly matching PillNav's nav-items entrance.
 *
 * Tapping the hamburger toggles a right-edge side panel via a paused GSAP
 * timeline (`tl.reversed()` flip pattern). The timeline is built once inside
 * `useGSAP`; `isOpen` state exists for `aria-expanded` + icon swap (☰ / ×) only.
 *
 * Timeline structure:
 *   t=0     : panel slides x: 100% → 0%   (0.4s, power3.out)
 *   t=0.25s : nav items fade-up stagger (0.08s per item, 0.35s each, '-=0.15')
 *
 * Initialisation: tl.seek(0).reversed(true).paused(false) — NOT tl.reverse(0).
 * reverse(0) contains `seek(0 || totalDuration())` which resolves to totalDuration
 * (JS falsy 0), playing the close animation on load. seek(0) bypasses that.
 *
 * Reduced motion: no GSAP runs. Hamburger wrapper is visible from first paint
 * (no maxWidth constraint set). Panel toggles via display:flex / display:none.
 *
 * GSAP imports route through `@/lib/gsap` so plugins stay registered exactly
 * once at module level (see `src/lib/gsap.ts`).
 */

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

const NAV_ITEMS = [
  { key: 'about', href: '#about' },
  { key: 'work', href: '#work' },
  { key: 'stack', href: '#stack' },
  { key: 'contact', href: '#contact' },
] as const

type NavItemKey = (typeof NAV_ITEMS)[number]['key']

export interface MobileNavProps {}

export function MobileNav({}: MobileNavProps) {
  const { t } = useTranslation('common')
  const { prefersReducedMotion } = useDeviceCapabilities()

  const [isOpen, setIsOpen] = useState(false)
  // Drives pill background opacity separately from isOpen so it can be
  // delayed on close (fade in only after the panel finishes sliding out).
  const [pillBgHidden, setPillBgHidden] = useState(false)

  // Lock body scroll while panel is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Pill background: hide immediately on open, restore after close animation.
  useEffect(() => {
    if (isOpen) {
      setPillBgHidden(true)
    } else {
      const timer = setTimeout(() => setPillBgHidden(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const containerRef = useRef<HTMLDivElement>(null)
  const hamburgerWrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hamburger is visible from first paint on mobile — no entrance ScrollTrigger.
        // This avoids the forced reflow that ScrollTrigger.refresh() causes on mount,
        // which was the primary TBT contributor on Lighthouse mobile audits.
        const tl = gsap
          .timeline({ paused: true })
          .to(panelRef.current, { x: 0, duration: 0.4, ease: 'power3.out' })
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
        tl.seek(0).reversed(true).paused(false)
        tlRef.current = tl

        return () => {
          tlRef.current?.kill()
          tlRef.current = null
        }
      })

      return () => {
        mm.revert()
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  )

  const handleToggle = contextSafe(() => {
    const tl = tlRef.current
    if (tl) {
      const nextOpen = tl.reversed()
      tl.reversed(!tl.reversed())
      setIsOpen(nextOpen)
    } else {
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

  const handleNavClick = contextSafe((href: string) => {
    handleClose()
    setTimeout(() => {
      const target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  })

  return (
    <>
      {/* Single glass-pill nav — mirrors PillNav styling exactly.
          Pill is visible from first paint (EN/ES always shown);
          hamburger wrapper expands in at 40% scroll. */}
      <nav
        aria-label={t('nav.ariaLabel')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          background: pillBgHidden ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: pillBgHidden ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          padding: '0.4rem 1rem',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Hamburger + separator — collapses to maxWidth:0 on load (GSAP), expands at 40% scroll.
            Reduced-motion: no GSAP → renders at natural width (hamburger visible from paint). */}
        <div
          ref={hamburgerWrapRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.4rem 0.75rem',
            }}
          >
            {isOpen ? '×' : '☰'}
          </button>
          <span
            aria-hidden="true"
            style={{
              width: '1px',
              height: '1rem',
              background: 'rgba(255,255,255,0.15)',
              margin: '0 0.5rem',
              flexShrink: 0,
            }}
          />
        </div>
        <LanguageSwitcher className="flex gap-3" />
      </nav>

      {/* Full-viewport overlay — overflow:hidden clips the panel at x:100% */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
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

        {/* Side panel — position:absolute inside overflow:hidden container clips it at x:100% */}
        <div
          ref={panelRef}
          className="mobile-nav-panel"
          style={{
            position: 'absolute',
            zIndex: 60,
            top: 0,
            right: 0,
            bottom: 0,
            width: '75vw',
            maxWidth: '320px',
            background: '#0a0a0a',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            padding: '5rem 2rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            pointerEvents: 'auto',
            ...(prefersReducedMotion
              ? {
                  display: isOpen ? 'flex' : 'none',
                  transform: 'none',
                }
              : {}),
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
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {t(`nav.${item.key satisfies NavItemKey}` as const)}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
