# Phase 5: Hero + PillNav — First Vertical Slice - Research

**Researched:** 2026-06-12
**Domain:** React + GSAP + i18n — Hero section, scroll-parallax, scroll-triggered fixed nav, mobile side-panel
**Confidence:** HIGH (all core patterns verified against official GSAP docs and existing codebase)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Hero layout & copy
- Full name "Kelly Battistoni" in large Playfair Display display type — one typographic statement
- Centered layout: name, tagline, CTA stacked vertically in the middle of the viewport
- Tagline: **"I automate what holds people back."** — statement-first, no role label
- Nothing between tagline and CTA (clean three-element stack: name → tagline → button)
- Single primary CTA: **"See my work"** — scrolls to Projects section
- CTA button style: Claude's discretion (pick what reads best over the dark animated Plasma backdrop)

#### Hero scroll behavior
- Parallax at different speeds: each element (name, tagline, CTA) shifts on scroll at its own rate
- Content starts disappearing at 30–40% of hero height scrolled (midway trigger)
- No scroll-indicator hint (no chevron, no "SCROLL" label)
- Plasma fade/unmount behavior already wired from Phase 4 (04-02 HeroBackdrop dispatcher) — do not re-implement

#### PillNav design & entrance
- Items: About / Work / Stack / Contact + language toggle (EN/ES baked into the pill row)
- Position: top-right, fixed — anchored to the right side of the header
- Entrance: fades in from opacity 0 while sliding left-to-right (appears after 70% hero height scrolled)
- Hover effect: text nudges upward (y transform) and a circle background simultaneously appears beneath the item ("rising circle")

#### Mobile nav experience
- Trigger (☰ icon): appears after 70% hero height scrolled — same timing as desktop PillNav
- Menu style: side panel that slides in from the right, partial width
- Side panel contains: nav links (About / Work / Stack / Contact) + language switcher (EN/ES)
- Nav links in panel: large text, staggered entrance (items animate in one by one)
- Closing: tapping the backdrop OR an × button inside the panel
- Tapping a nav link: panel closes and page scrolls to section simultaneously
- The ☰ icon becomes × when the panel is open

### Claude's Discretion
- CTA button visual style (ghost vs solid fill — pick whichever reads best over dark Plasma)
- Exact parallax speed values for each hero element
- Exact pixel width of mobile side panel
- Background color/blur for the PillNav pill container
- GSAP timeline specifics for panel open/close (easing, duration)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 5 assembles three separate concerns into one working vertical slice: (1) the Hero section — replacing the Phase 4 placeholder with real copy, real parallax, and real i18n; (2) the PillNav — a scroll-triggered fixed nav that is invisible during the hero and animates in after 70% scroll; (3) the mobile side panel — a GSAP timeline-driven drawer with staggered links. All animation infrastructure (GSAP, scrollStore, HeroBackdrop dispatcher, useDeviceCapabilities) is already wired. Phase 5 builds components on top of that infrastructure rather than modifying it.

The dominant technical challenge is the PillNav entrance: a ScrollTrigger with `once: true` must fire after 70% of the hero height has scrolled past the viewport top. Because the hero is `100vh`, "70% of hero height" translates to `start: "70% top"` on the hero section trigger, or equivalently a pixel offset computed from `heroRef.current.offsetHeight * 0.7`. The safest ScrollTrigger syntax is `start: "top top+=70%"` (trigger's top at 70% down the viewport, which equals 70% of 100vh = 70vh). The actual trigger element is the hero `<section>` whose ref (`heroRef`) is already in App.tsx from the Phase 4 harness.

The parallax for individual hero content elements follows the same `scrub + y fromTo` pattern already proven in `ParallaxCard`. Each text element gets its own `ScrollTrigger` (or timeline position) with `scrub: true`, `start: "top top"`, `end: "bottom top"`, and different `y` target values per element (name: y +40, tagline: y +70, CTA: y +100 recommended starting values). Fade-out is layered on top via `autoAlpha: 0` starting at 30–40% hero height.

The LanguageSwitcher component already exists with the correct internals. Its fixed positioning is hardcoded (`className="fixed top-6 right-6 z-50 flex gap-4"`). Phase 5 must strip that positioning out and render LanguageSwitcher as a layout-neutral child inside the PillNav pill container. The comment in LanguageSwitcher source explicitly anticipates this: *"Phase 5 imports this same component into PillNav — DO NOT couple positioning to a parent here."* The class attribute must be replaced with a prop that allows inline or composable positioning.

**Primary recommendation:** Build Hero and PillNav as two sibling components rendered from App.tsx, sharing the same `heroRef`. Use `ScrollTrigger.create()` (not `gsap.to()` shorthand) for all threshold-based visibility triggers so cleanup is explicit. Wrap all event-driven animations (panel open/close, hover) with `contextSafe()` from `useGSAP`.

---

## Standard Stack

All packages are already installed. No new dependencies are needed.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | ^3.15.0 | All animations — parallax, entrance, panel timeline | Single animation engine; ScrollTrigger, useGSAP all included |
| @gsap/react | ^2.1.2 | `useGSAP` hook — cleanup + contextSafe | Replaces useEffect for GSAP; handles React 18 strict mode |
| tailwindcss | ^4.3.0 | Utility classes for layout, sizing, blur | Already configured with brand tokens in `@theme` block |
| react-i18next | ^17.0.8 | `useTranslation` for hero copy + nav labels | Already wired in i18n/index.ts |
| clsx | ^2.1.1 | Conditional class composition | Already used in LanguageSwitcher |

### No New Installs Required
All required libraries for Phase 5 are already present in `package.json`. The plan must not introduce new packages.

---

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── hero/
│   │   └── Hero.tsx              # Hero section — replaces Phase 4 placeholder
│   ├── nav/
│   │   ├── PillNav.tsx           # Desktop pill nav — scroll-triggered entrance
│   │   └── MobileNav.tsx         # Mobile hamburger + side panel
│   └── i18n/
│       └── LanguageSwitcher.tsx  # EXISTING — add className prop to neutralize fixed position
└── locales/
    ├── en/
    │   ├── hero.json             # UPDATE: tagline + CTA strings
    │   └── common.json           # ADD: nav.about, nav.work, nav.stack, nav.contact
    └── es/
        ├── hero.json             # UPDATE: tagline + CTA strings
        └── common.json           # ADD: nav translations
```

### Pattern 1: Hero Scroll-Parallax with Content Fade-Out

Each hero content element (name, tagline, CTA) gets its own `ScrollTrigger` with `scrub: true`. The trigger is the hero `<section>` root. Fade-out starts at 30–40% of hero height: set `start: "top top"` and `end: "40% top"` on the hero section. Different `y` end values produce the different parallax speeds.

```typescript
// Source: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
// Pattern from ParallaxCard.tsx (same codebase — proven)
useGSAP(
  () => {
    if (prefersReducedMotion) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = heroRef.current
      if (!hero) return

      // Parallax + fade-out for the name element
      gsap.to(nameRef.current, {
        y: 40,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })

      // Tagline: faster vertical drift
      gsap.to(taglineRef.current, {
        y: 70,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '35% top',
          scrub: true,
        },
      })

      // CTA: fastest drift
      gsap.to(ctaRef.current, {
        y: 100,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      })

      return () => ScrollTrigger.getAll().forEach((t) => t.kill())
    })
    return () => mm.revert()
  },
  { scope: heroRef, dependencies: [prefersReducedMotion] }
)
```

**Important:** `autoAlpha` animates both `opacity` and CSS `visibility` simultaneously. GSAP sets `visibility: hidden` when opacity reaches 0, which removes the element from pointer events. This is correct behavior for hero content that must not intercept clicks after it fades.

### Pattern 2: PillNav Entrance — One-Shot ScrollTrigger

PillNav entrance fires once after 70% of the hero has scrolled past the viewport top. Use `once: true` so the trigger self-kills after firing (no ongoing listener). The `start` value `"70% top"` means: when the hero's 70% mark reaches the viewport top.

```typescript
// Source: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
// once: true = self-kills after first fire; equivalent to toggleActions: "play none none none"
useGSAP(
  () => {
    if (prefersReducedMotion) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(pillNavRef.current, {
        autoAlpha: 0,
        x: -24,           // slides in from left (left-to-right appearance)
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: heroRef.current,  // hero section — passed via prop or context
          start: '70% top',          // when hero 70% mark hits viewport top
          once: true,
        },
      })
      return () => ScrollTrigger.getAll().forEach((t) => t.kill())
    })
    return () => mm.revert()
  },
  { scope: pillNavRef, dependencies: [prefersReducedMotion] }
)
```

**Note on "slides left-to-right":** GSAP's `x: -24` in a `from` tween means the element starts 24px to the left of its resting position and moves right to 0. This matches the "fades in while sliding left-to-right" decision.

### Pattern 3: Mobile Panel Timeline with contextSafe Toggle

The panel open/close timeline must be reversible on click. Store the timeline in a `useRef` so it persists across renders. Access `contextSafe` from `useGSAP` to make the click handler cleanup-safe.

```typescript
// Source: https://gsap.com/resources/react-basics/
// Source: https://gsap.com/docs/v3/GSAP/gsap.timeline()
const tlRef = useRef<gsap.core.Timeline | null>(null)
const containerRef = useRef<HTMLDivElement>(null)

const { contextSafe } = useGSAP(
  () => {
    if (prefersReducedMotion) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Build paused timeline — never auto-plays
      tlRef.current = gsap.timeline({ paused: true })
        .to(panelRef.current, {
          x: 0,
          duration: 0.4,
          ease: 'power3.out',
        })
        .from(
          navItemRefs.current,
          {
            autoAlpha: 0,
            y: 20,
            stagger: 0.08,
            duration: 0.35,
            ease: 'power2.out',
          },
          '-=0.15'   // overlap: items start animating 0.15s before panel finishes
        )
      return () => { tlRef.current?.kill(); tlRef.current = null }
    })
    return () => mm.revert()
  },
  { scope: containerRef, dependencies: [prefersReducedMotion] }
)

// Toggle: play forward on open, reverse on close
const handleToggle = contextSafe(() => {
  if (!tlRef.current) return
  tlRef.current.reversed(!tlRef.current.reversed())
})
```

**Key insight:** `tl.reversed(!tl.reversed())` is the standard GSAP pattern for bidirectional toggle. When the panel opens, the timeline plays forward. When it closes (click ×, backdrop, or nav link), the timeline plays in reverse — panel slides back right, items fade back down. This single timeline handles both directions.

### Pattern 4: Rising Circle Hover Effect

The "rising circle" effect (text nudges up, circle appears beneath) is best implemented with CSS for the circle and GSAP for the y nudge on hover. GSAP cannot animate `::before`/`::after` pseudo-elements directly. Use a real DOM element (`<span>` or `<div>`) absolutely positioned behind the text, scaled from 0 to 1 with `transform-origin: center bottom`.

```typescript
// CSS (Tailwind v4 inline or @apply) for the circle background:
// position: absolute, border-radius: 50%, transform: scale(0)
// transition: transform 0.25s ease-out

// GSAP for y nudge on mouseenter/mouseleave (contextSafe):
const handleMouseEnter = contextSafe((el: HTMLElement) => {
  gsap.to(el.querySelector('.nav-text'), { y: -4, duration: 0.2, ease: 'power2.out' })
  gsap.to(el.querySelector('.nav-circle'), { scale: 1, duration: 0.25, ease: 'power2.out' })
})
const handleMouseLeave = contextSafe((el: HTMLElement) => {
  gsap.to(el.querySelector('.nav-text'), { y: 0, duration: 0.2, ease: 'power2.out' })
  gsap.to(el.querySelector('.nav-circle'), { scale: 0, duration: 0.2, ease: 'power2.in' })
})
```

Alternatively: use pure CSS `transition` for the circle scale and Tailwind `group-hover:` for the y nudge, if GSAP overhead on a hover is undesirable. Either approach is valid; GSAP gives finer control over simultaneous timing.

### Pattern 5: LanguageSwitcher Extraction from Fixed Position

The current LanguageSwitcher has `className="fixed top-6 right-6 z-50 flex gap-4"` hardcoded in its JSX. Phase 5 must:
1. Add a `className?: string` prop to LanguageSwitcher
2. Replace the hardcoded positioning classes with the prop (defaulting to empty string or to the current classes for backward compat if the standalone switcher is removed)
3. Remove the standalone `<LanguageSwitcher />` from App.tsx
4. Render `<LanguageSwitcher className="flex gap-3" />` inside PillNav

The comment in `LanguageSwitcher.tsx` already states: *"Phase 5 strips classes when moving into PillNav (no className prop now)."* This means the prop needs to be added.

### Recommended PillNav Visual Spec (Claude's Discretion)

Based on the dark Plasma background and brand tokens:
- **Pill container background:** `bg-black/40 backdrop-blur-md` — semi-transparent with blur; consistent with the design language
- **Border:** `border border-white/10` — subtle separator
- **Padding:** `px-4 py-2 rounded-full`
- **CTA button:** Ghost style — `border border-[#FF4500] text-white px-6 py-3 rounded-sm` — the solid accent color border reads clearly over the dark backdrop without competing with the Plasma glow

### Anti-Patterns to Avoid

- **Separate scroll listener for PillNav visibility:** Do not subscribe to `scrollStore` via `useSyncExternalStore` just to toggle a CSS class. `ScrollTrigger.create()` with `once: true` handles this with zero ongoing overhead.
- **Animating CSS `::before` / `::after` with GSAP:** GSAP cannot target pseudo-elements. Use a real DOM element for the rising circle background.
- **Creating ScrollTriggers inside `useEffect` instead of `useGSAP`:** The existing codebase uses `useGSAP` for all GSAP work. The sole exception is `useEffect` for WebGL/rAF/ResizeObserver lifecycle (Phase 4 rule). ScrollTriggers belong in `useGSAP`.
- **Using `useState` to track `isOpen` and re-running `useGSAP` on state change:** This causes the timeline to be recreated on every open/close. Use `tlRef.current.reversed(!tl.reversed())` instead — the timeline persists, only direction changes.
- **Missing `ScrollTrigger.refresh()` after font load:** Already implemented in App.tsx's `useEffect(() => { document.fonts.ready.then(() => ScrollTrigger.refresh()) })`. The Hero component must NOT add a duplicate refresh — the App.tsx one is sufficient.
- **Forgetting `gsap.matchMedia` / `prefersReducedMotion` guard:** All animation `useGSAP` blocks must follow the `if (prefersReducedMotion) return` + `mm.add('(prefers-reduced-motion: no-preference)', ...)` double-guard pattern established in RevealSection and ParallaxCard.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll threshold detection for PillNav | `window.addEventListener('scroll', ...)` with manual threshold comparison | `ScrollTrigger.create({ once: true, start: '70% top' })` | One rAF-coalesced path; auto-cleanup; no stale closure risk |
| Panel open/close animation state | `useState(isOpen)` toggling CSS classes | `gsap.timeline({ paused: true })` + `.reversed()` toggle | Timeline owns its own state; smooth interruption handling; reverse plays clean |
| Stagger for nav items | manual `delay` prop per item | `gsap.from(items, { stagger: 0.08 })` | Single tween; GSAP handles interrupted stagger correctly |
| Backdrop overlay interaction | `onScroll` in React | GSAP `ScrollTrigger` + `onUpdate` | Already-proven pattern; avoids duplicate scroll listener |
| Font-change reflow recovery | Manual `ResizeObserver` | `document.fonts.ready.then(() => ScrollTrigger.refresh())` | Already in App.tsx; free behavior |

**Key insight:** GSAP timelines are the correct state machine for animation sequences. React state (useState/useReducer) is for data that drives rendering — not for animation playhead position. The `tlRef.current.reversed()` pattern keeps animation state inside GSAP where cleanup is automatic.

---

## Common Pitfalls

### Pitfall 1: ScrollTrigger Measures Before Font Loads
**What goes wrong:** PillNav trigger fires at wrong scroll position. Hero content appears/disappears earlier or later than intended.
**Why it happens:** Playfair Display is loaded from Google Fonts. Until it loads, the browser uses the fallback font (Georgia). Different metrics mean different element heights. ScrollTrigger measures on mount and caches positions.
**How to avoid:** `ScrollTrigger.refresh()` is already called in App.tsx after `document.fonts.ready`. Do not add a second call. Do ensure the Hero component mounts before fonts settle (it will — it renders synchronously).
**Warning signs:** PillNav appears at the wrong scroll depth; hero content visible/hidden at wrong time.

### Pitfall 2: Timeline Created in `useGSAP` but Toggled via `useState`
**What goes wrong:** Every time `isOpen` state changes, React re-renders, `useGSAP` fires with `[isOpen]` as a dependency, the old timeline is killed and a new one is created. The panel animation resets each open/close.
**Why it happens:** Treating animation state as React state.
**How to avoid:** Store timeline in `useRef`. Toggle direction with `tl.reversed(!tl.reversed())`. Only pass `[prefersReducedMotion]` as `useGSAP` dependency (not `isOpen`).
**Warning signs:** Panel animation jumps to start position on second open.

### Pitfall 3: PillNav `heroRef` Dependency
**What goes wrong:** PillNav needs to know the hero's height and position to set its `ScrollTrigger` trigger. If PillNav renders as a sibling of Hero in App.tsx and receives `heroRef` via prop, the ref is guaranteed to be populated when `useGSAP` fires (React mounts in tree order, effects fire bottom-up).
**Why it happens:** Assuming the ref might be null.
**How to avoid:** Pass `heroRef` from App.tsx as a prop to PillNav. In `useGSAP`, guard with `if (!heroRef.current) return`. The effect fires after mount so the ref will be set.
**Warning signs:** PillNav ScrollTrigger has no trigger element; fires immediately on mount.

### Pitfall 4: LanguageSwitcher Fixed Position Leaking into PillNav
**What goes wrong:** LanguageSwitcher renders with `fixed top-6 right-6 z-50` regardless of parent context, floating outside the pill container.
**Why it happens:** The positioning is hardcoded as a class string in the component, not inherited from parent layout.
**How to avoid:** Add `className?: string` prop. When rendered inside PillNav, pass `className="flex gap-3"` (no position). Remove the standalone `<LanguageSwitcher />` from App.tsx at the same time.
**Warning signs:** Language switcher appears twice or floats in wrong position after Phase 5.

### Pitfall 5: Mobile Panel Backdrop Click Not Closing
**What goes wrong:** Tapping outside the panel on mobile does nothing.
**Why it happens:** A transparent backdrop overlay must be rendered behind the panel (but above the page content) and wired to the close handler. Forgetting to render it or giving it pointer-events: none.
**How to avoid:** Render a full-screen `<div>` with `position: fixed; inset: 0; z-index: 40; pointer-events: auto` as part of the open state (conditionally rendered or toggled via `display`). Wire `onClick={handleClose}` on it.
**Warning signs:** Panel can only be closed via the × button.

### Pitfall 6: Hero `<section>` Ref Re-Used Conflict
**What goes wrong:** The Phase 4 placeholder hero `<section>` has `heroRef` attached to it in App.tsx. Phase 5 replaces this section with the `<Hero>` component. The ref must be forwarded into `<Hero>` and re-attached to the new section element, or `<Hero>` must accept `ref` via `forwardRef`.
**Why it happens:** The Phase 4 harness wired the ref at the App level. Phase 5 must pass it through cleanly.
**How to avoid:** Use `React.forwardRef` on Hero so it accepts a forwarded ref, OR pass `heroRef` as a regular prop named `sectionRef`. The second option avoids `forwardRef` complexity. `HeroBackdrop` also uses its own `containerRef` internally — that is unrelated to heroRef.
**Warning signs:** `heroRef.current` is null in PillNav's `useGSAP`; PillNav never appears.

---

## Code Examples

### Example 1: Hero Component Skeleton

```typescript
// src/components/hero/Hero.tsx
// All GSAP imports come from '@/lib/gsap' — Phase 1 rule
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useTranslation } from 'react-i18next'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'

interface HeroProps {
  /** Forwarded to the root <section> so HeroBackdrop's ScrollTrigger can target it. */
  sectionRef: React.RefObject<HTMLElement>
}

export function Hero({ sectionRef }: HeroProps) {
  const { t } = useTranslation('hero')
  const { prefersReducedMotion } = useDeviceCapabilities()
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const hero = sectionRef.current
        if (!hero) return

        // Name: slowest drift — stays readable longest
        gsap.to(nameRef.current, {
          y: 40, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
        })
        // Tagline: mid drift
        gsap.to(taglineRef.current, {
          y: 70, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '35% top', scrub: true },
        })
        // CTA: fastest drift
        gsap.to(ctaRef.current, {
          y: 100, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '30% top', scrub: true },
        })

        return () => ScrollTrigger.getAll().forEach((t) => t.kill())
      })
      return () => mm.revert()
    },
    { dependencies: [prefersReducedMotion] }
  )

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflow: 'hidden', isolation: 'isolate' }}
      aria-label="Hero"
    >
      <AnimationErrorBoundary>
        <HeroBackdrop />
      </AnimationErrorBoundary>
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', padding: '0 2rem',
          textAlign: 'center',
        }}
      >
        <h1 ref={nameRef} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 700, color: 'white', margin: 0 }}>
          {t('heading.title')}
        </h1>
        <p ref={taglineRef} style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: '44ch' }}>
          {t('heading.tagline')}
        </p>
        <a
          ref={ctaRef}
          href="#work"
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
          }}
        >
          {t('cta')}
        </a>
      </div>
    </section>
  )
}
```

### Example 2: PillNav ScrollTrigger Entrance

```typescript
// src/components/nav/PillNav.tsx
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

interface PillNavProps {
  heroRef: React.RefObject<HTMLElement>
}

const NAV_ITEMS = [
  { key: 'about', href: '#about' },
  { key: 'work',  href: '#work' },
  { key: 'stack', href: '#stack' },
  { key: 'contact', href: '#contact' },
] as const

export function PillNav({ heroRef }: PillNavProps) {
  const { t } = useTranslation('common')
  const { prefersReducedMotion } = useDeviceCapabilities()
  const pillRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!heroRef.current) return
        // Start invisible, slide in from left
        gsap.set(pillRef.current, { autoAlpha: 0, x: -20 })
        gsap.to(pillRef.current, {
          autoAlpha: 1, x: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heroRef.current,
            start: '70% top',   // hero 70% mark hits viewport top
            once: true,
          },
        })
        return () => ScrollTrigger.getAll().forEach((t) => t.kill())
      })
      return () => mm.revert()
    },
    { scope: pillRef, dependencies: [prefersReducedMotion] }
  )

  return (
    <nav
      ref={pillRef}
      style={{
        position: 'fixed', top: '1.5rem', right: '1.5rem',
        zIndex: 50,
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '9999px',
        padding: '0.5rem 1rem',
      }}
      aria-label={t('nav.ariaLabel')}
    >
      {NAV_ITEMS.map((item) => (
        <PillNavItem key={item.key} href={item.href} label={t(`nav.${item.key}` as const)} />
      ))}
      <span style={{ width: '1px', height: '1rem', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }} aria-hidden="true" />
      <LanguageSwitcher className="flex gap-3" />
    </nav>
  )
}
```

### Example 3: Mobile Panel Timeline Toggle

```typescript
// src/components/nav/MobileNav.tsx
// Source: https://gsap.com/resources/react-basics/ — contextSafe + timeline in ref pattern
import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

export function MobileNav({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  const { prefersReducedMotion } = useDeviceCapabilities()
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  // Track open state for aria-expanded and icon toggle
  const [isOpen, setIsOpen] = useState(false)

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Panel starts off-screen right
        gsap.set(panelRef.current, { x: '100%' })

        tlRef.current = gsap.timeline({ paused: true })
          .to(panelRef.current, { x: '0%', duration: 0.4, ease: 'power3.out' })
          .from(
            itemRefs.current.filter(Boolean),
            { autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.35, ease: 'power2.out' },
            '-=0.15'
          )
        // Start reversed (closed state)
        tlRef.current.reverse(0)

        return () => { tlRef.current?.kill(); tlRef.current = null }
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  )

  const handleToggle = contextSafe(() => {
    const tl = tlRef.current
    if (!tl) return
    const opening = tl.reversed()
    tl.reversed(!tl.reversed())
    setIsOpen(opening)
  })

  const handleClose = contextSafe(() => {
    if (!tlRef.current || tlRef.current.reversed()) return
    tlRef.current.reverse()
    setIsOpen(false)
  })

  return (
    <div ref={containerRef}>
      {/* Hamburger trigger — same 70% timing as PillNav; managed separately */}
      <button onClick={handleToggle} aria-expanded={isOpen} aria-label="Open menu">
        {isOpen ? '×' : '☰'}
      </button>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
        />
      )}
      {/* Panel */}
      <div ref={panelRef} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '75vw', maxWidth: '320px', zIndex: 50, background: '#0a0a0a', padding: '4rem 2rem' }}>
        {/* nav items wired to itemRefs */}
      </div>
    </div>
  )
}
```

---

## i18n Changes Required

### Translation Keys to Add/Update

**`src/locales/en/hero.json`** — update existing keys:
```json
{
  "heading": {
    "title": "Kelly Battistoni",
    "tagline": "I automate what holds people back."
  },
  "cta": "See my work"
}
```

**`src/locales/es/hero.json`** — update tagline and CTA:
```json
{
  "heading": {
    "title": "Kelly Battistoni",
    "tagline": "Automatizo lo que le frena a la gente."
  },
  "cta": "Ver mi trabajo"
}
```

**`src/locales/en/common.json`** — add nav keys:
```json
{
  "switcher": { ... },
  "nav": {
    "ariaLabel": "Primary navigation",
    "about": "About",
    "work": "Work",
    "stack": "Stack",
    "contact": "Contact"
  }
}
```

**`src/locales/es/common.json`** — add nav keys:
```json
{
  "switcher": { ... },
  "nav": {
    "ariaLabel": "Navegación principal",
    "about": "Sobre mí",
    "work": "Trabajo",
    "stack": "Stack",
    "contact": "Contacto"
  }
}
```

**Note:** The `@types/i18next.d.ts` type augmentation must be updated to reflect new keys, otherwise TypeScript will complain on `t('nav.about')`.

---

## App.tsx Changes Required

Phase 5 replaces the Phase 4 placeholder hero section and the standalone LanguageSwitcher with the real components. Specific changes:

1. **Remove** the placeholder `<section ref={heroRef}>` block (with the "Phase 4 — Plasma test harness" text)
2. **Remove** the standalone `<AnimationErrorBoundary><LanguageSwitcher /></AnimationErrorBoundary>` block
3. **Remove** the `DemoCardBody` component and `AnimationRootPlaceholder` (Phase 4 test harness — gone in Phase 5)
4. **Remove** the `RevealSection` / `ParallaxCard` demo section (Phase 3 test harness — gone in Phase 5)
5. **Add** `<Hero sectionRef={heroRef} />` in place of the placeholder
6. **Add** `<PillNav heroRef={heroRef} />` (desktop, hidden on mobile)
7. **Add** `<MobileNav heroRef={heroRef} />` (mobile, hidden on desktop ≤430px)
8. **Keep** `AnimationRootPlaceholder` OR remove it — the Hero section now provides the actual backdrop; if this gradient is still needed as a global background, keep it; if HeroBackdrop covers the entire viewport, it can be removed. **Decision: remove** — the Plasma backdrop covers `position: absolute; inset: 0` within the hero section; below the hero the background is `--color-brand-bg: #050505` from the body style in `index.css`.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Scroll listener + manual threshold | `ScrollTrigger.create({ once: true })` | No duplicate listeners; self-cleaning |
| `useState(isOpen)` driving GSAP | `tlRef` + `reversed()` toggle | Timeline persists; animation can be interrupted cleanly |
| `autoAlpha` in both React state and GSAP | GSAP owns visibility via `autoAlpha` only | Single source of truth for visible/hidden state |
| `gsap.matchMedia` in `useEffect` | `gsap.matchMedia` inside `useGSAP` | Automatic cleanup via `useGSAP` context |

---

## Open Questions

1. **`@types/i18next.d.ts` type augmentation**
   - What we know: The file exists at `src/@types/i18next.d.ts` and presumably extends i18next with the current resource shape.
   - What's unclear: Whether the nav keys can be typed without manually enumerating every key, or whether a `typeof resources` approach is already in use.
   - Recommendation: Read the file before writing the plan task. If `typeof resources` is used, adding keys to the JSON is sufficient and TypeScript picks them up automatically.

2. **Responsive breakpoint for PillNav vs MobileNav**
   - What we know: `useDeviceCapabilities` uses `MOBILE_BREAKPOINT_PX = 430` for `isMobile`. CSS media queries in Tailwind v4 don't automatically sync with this JS constant.
   - What's unclear: Whether to use `isMobile` to conditionally render PillNav vs MobileNav in JSX, or use CSS `@media (max-width: 430px)` to show/hide.
   - Recommendation: Use `isMobile` from `useDeviceCapabilities` for the JSX `{isMobile ? <MobileNav .../> : <PillNav .../>}` branch. This keeps the React boundary consistent with the existing capability detection hook.

3. **`AnimationRootPlaceholder` removal timing**
   - What we know: It renders a fixed `radial-gradient` background at `zIndex: 0`. Once the Hero section has real content, this gradient may conflict or be invisible.
   - What's unclear: Whether any other phase depends on this global gradient for sections below the hero.
   - Recommendation: Remove `AnimationRootPlaceholder` in Phase 5. The hero section provides its own backdrop. The `body` background is `#050505` for everything else, which is correct.

---

## Sources

### Primary (HIGH confidence)
- `src/components/plasma/HeroBackdrop.tsx` — HeroBackdrop ScrollTrigger pattern; `containerRef` vs `plasmaRef` distinction
- `src/components/scroll/ParallaxCard.tsx` — scrub + y fromTo pattern; `layerRefs` array pattern
- `src/components/scroll/RevealSection.tsx` — `gsap.matchMedia` + `prefersReducedMotion` double-guard pattern; `useGSAP` with `scope`
- `src/components/i18n/LanguageSwitcher.tsx` — current fixed positioning; Phase 5 migration comment
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — `once`, `start/end` string syntax, `scrub`, callbacks
- [GSAP React Patterns](https://gsap.com/resources/React/) — `useGSAP`, `contextSafe`, strict mode, cleanup
- [GSAP React Useful Patterns](https://gsap.com/resources/react-basics/) — timeline in ref, `reversed()` toggle
- [GSAP quickSetter Docs](https://gsap.com/docs/v3/GSAP/gsap.quickSetter/) — confirmed correct syntax
- [Tailwind backdrop-blur docs](https://tailwindcss.com/docs/backdrop-filter-blur) — v4 class names verified

### Secondary (MEDIUM confidence)
- [GSAP Timeline Docs](https://gsap.com/docs/v3/GSAP/gsap.timeline()) — `paused: true`, `.play()`, `.reverse()` via WebFetch
- WebSearch: GSAP contextSafe toggle pattern — corroborated by official React patterns page

### Tertiary (LOW confidence)
- Recommended y parallax values (40/70/100px) — derived from ParallaxCard's existing `speed * 100` formula; not from official docs. Treat as starting point for calibration.
- Spanish tagline translation ("Automatizo lo que le frena a la gente.") — human-language judgment, not technical. Must be reviewed by Kelly.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json; no new installs
- Architecture: HIGH — all patterns derived from existing codebase and official GSAP docs
- GSAP ScrollTrigger patterns: HIGH — verified against official docs
- i18n changes: HIGH — existing structure verified in source files
- Parallax speed values: LOW — reasonable starting point, requires visual calibration
- Spanish copy: LOW — requires native review

**Research date:** 2026-06-12
**Valid until:** 2026-07-12 (GSAP is stable; Tailwind v4 is shipping actively — recheck backdrop-blur syntax if > 30 days)
