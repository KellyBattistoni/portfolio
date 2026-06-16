/**
 * PillNav — desktop scroll-triggered fixed navigation.
 *
 * Renders a glass-pill container in the top-right corner with four primary
 * nav items (About / Work / Stack / Contact) followed by the LanguageSwitcher.
 * The pill is invisible on mount and animates in once the page has scrolled
 * past 70% of the hero section's height — measured via a ScrollTrigger that
 * uses the parent `heroRef` as its trigger element.
 *
 * Entrance: slides left-to-right (x: -20 → 0) with `autoAlpha` fade over
 * 0.5s `power2.out`. Fires once and the trigger self-kills (`once: true`).
 *
 * Rising-circle hover: each nav item is composed of a `.nav-circle` span
 * (absolutely positioned, scaled 0 → 1 on hover) and a `.nav-text` span
 * (relative, nudged 4px up on hover). Real DOM nodes — not CSS pseudo-
 * elements — so GSAP can drive both properties on the same target.
 *
 * Reduced motion: when `prefersReducedMotion` is true, the entire useGSAP
 * effect early-returns and the pill renders visible from first paint with
 * no animations attached. The matchMedia guard inside the effect adds a
 * second layer of runtime correctness if the OS preference flips mid-session.
 *
 * GSAP imports route through `@/lib/gsap` so plugins stay registered exactly
 * once at module level (see `src/lib/gsap.ts`).
 */

import { useRef, useState, useEffect, type RefObject } from 'react'
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

export interface PillNavProps {
  heroRef: RefObject<HTMLElement | null>
}

/**
 * Sub-component rendering a single pill nav item with rising-circle hover.
 * The wrapper `<span>` owns the hover target and the relative positioning
 * context for the absolutely-positioned `.nav-circle`. Mouse events forward
 * the wrapper element to the parent-owned (contextSafe) handlers so the
 * GSAP context can revert them on unmount.
 */
function PillNavItem({
  href,
  label,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  href: string
  label: string
  isActive: boolean
  onMouseEnter: (el: HTMLElement) => void
  onMouseLeave: (el: HTMLElement) => void
  onClick: () => void
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        if (wrapRef.current) onMouseLeave(wrapRef.current)
        onClick()
      }}
      style={{ textDecoration: 'none', display: 'inline-block' }}
    >
      <span
        ref={wrapRef}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.4rem 0.75rem',
          cursor: 'pointer',
        }}
        onMouseEnter={() => {
          if (wrapRef.current) onMouseEnter(wrapRef.current)
        }}
        onMouseLeave={() => {
          if (wrapRef.current) onMouseLeave(wrapRef.current)
        }}
      >
        <span
          className="nav-circle"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            transform: 'scale(0)',
            background: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />
        <span
          className="nav-text"
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.75)',
          }}
        >
          {label}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '-3px',
              height: '1px',
              background: '#FF4500',
              transformOrigin: 'left',
              transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 0.3s ease',
              pointerEvents: 'none',
            }}
          />
        </span>
      </span>
    </a>
  )
}

export function PillNav({ heroRef }: PillNavProps) {
  const { t } = useTranslation('common')
  const { prefersReducedMotion } = useDeviceCapabilities()
  const pillRef = useRef<HTMLElement>(null)
  // Nav items collapse to maxWidth:0 on load; the pill shrinks to fit EN/ES only.
  const navItemsRef = useRef<HTMLDivElement>(null)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    const targets = NAV_ITEMS.map((item) => document.querySelector<HTMLElement>(item.href)).filter(
      Boolean
    ) as HTMLElement[]

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = '#' + entry.target.id
          if (entry.isIntersecting) {
            visible.add(id)
            setActiveHref(id)
          } else {
            visible.delete(id)
          }
        })
        if (visible.size === 0) setActiveHref('')
      },
      { threshold: 0.2 }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (href: string) => {
    const section = document.querySelector<HTMLElement>(href)
    if (section) {
      window.scrollTo({ top: section.offsetTop, behavior: 'smooth' })
    }
    window.dispatchEvent(new CustomEvent('section:replay', { detail: href }))
  }

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!heroRef.current) return

        gsap.set(navItemsRef.current, { maxWidth: 0, opacity: 0 })

        // Pill opens first, text fades in once the container has room.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: '40% top',
            once: true,
          },
        })
        tl.to(navItemsRef.current, { maxWidth: 380, duration: 0.2, ease: 'power2.out' })
        tl.to(navItemsRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })

        return () => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        }
      })

      return () => {
        mm.revert()
      }
    },
    { scope: pillRef, dependencies: [prefersReducedMotion] }
  )

  const handleMouseEnter = contextSafe((el: HTMLElement) => {
    const text = el.querySelector('.nav-text')
    const circle = el.querySelector('.nav-circle')
    if (text)
      gsap.to(text, { y: -4, color: 'rgba(255,255,255,1)', duration: 0.2, ease: 'power2.out' })
    if (circle) gsap.to(circle, { scale: 1, duration: 0.25, ease: 'power2.out' })
  })

  const handleMouseLeave = contextSafe((el: HTMLElement) => {
    const text = el.querySelector('.nav-text')
    const circle = el.querySelector('.nav-circle')
    if (text)
      gsap.to(text, { y: 0, color: 'rgba(255,255,255,0.75)', duration: 0.2, ease: 'power2.out' })
    if (circle) gsap.to(circle, { scale: 0, duration: 0.2, ease: 'power2.in' })
  })

  return (
    <nav
      ref={pillRef}
      aria-label={t('nav.ariaLabel')}
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '9999px',
        padding: '0.4rem 1rem',
      }}
    >
      {/* Collapses to 0 on load; expands at 70% scroll — pill grows leftward */}
      <div
        ref={navItemsRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <PillNavItem
            key={item.key}
            href={item.href}
            label={t(`nav.${item.key satisfies NavItemKey}` as const)}
            isActive={activeHref === item.href}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavClick(item.href)}
          />
        ))}
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
  )
}
