import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { NoiseOverlay } from '@/components/layout/NoiseOverlay'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { useLocalizeDocumentAttributes } from '@/hooks/useLocalizeDocumentAttributes'
import { ScrollTrigger } from '@/lib/gsap'
import { RevealSection } from '@/components/scroll/RevealSection'
import { ParallaxCard } from '@/components/scroll/ParallaxCard'

function AnimationRootPlaceholder() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 50% 38%, ' +
          'rgb(90, 18, 2) 0%, ' +
          'rgb(74, 15, 2) 12%, ' +
          'rgb(58, 12, 2) 23%, ' +
          'rgb(44, 10, 2) 34%, ' +
          'rgb(31, 8, 2) 46%, ' +
          'rgb(20, 7, 3) 57%, ' +
          'rgb(12, 6, 3) 68%, ' +
          'rgb(8, 5, 4) 78%, ' +
          'rgb(5, 5, 5) 90%)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Throwaway test-harness card body used by the Phase 3 ParallaxCard demo.
 * Approximates the Phase 6 project card layout (category eyebrow / title /
 * blurb / tag chips) so parallax depth can be calibrated against the real
 * shape before Phase 6 ships. Inline styles intentional — this whole demo
 * block disappears in Phase 5/6.
 */
function DemoCardBody({
  category,
  title,
  blurb,
  tags,
}: {
  category: string
  title: string
  blurb: string
  tags: string[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        height: '100%',
        padding: '2rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: '#FF4500',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {category}
      </p>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          color: 'white',
          fontSize: '1.5rem',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {blurb}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: 'auto',
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Card sizing wrapper — ParallaxCard renders its own root div with
 * position: relative + overflow: hidden, so we wrap each card in this sizing
 * shell. Height 320px, minWidth 280px, flex 1 1 280px, borderRadius 8px.
 */
const DEMO_CARD_WRAPPER_STYLE = {
  height: 320,
  borderRadius: 8,
  minWidth: 280,
  flex: '1 1 280px',
  overflow: 'hidden' as const,
}

export default function App() {
  // Sync <html lang> with i18n.resolvedLanguage (htmlTag detector only reads, not writes)
  useLocalizeDocumentAttributes()

  // Kill-switch: all future animation code reads these flags before scheduling rAF / WebGL work.
  const { prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 } = useDeviceCapabilities()

  void prefersReducedMotion
  void isMobile
  void isLowEnd
  void supportsWebGL2

  // Phase 4 test harness — placeholder hero section ref. HeroBackdrop's
  // ScrollTrigger uses this as the `trigger` config so the dispatcher's
  // onLeave / onEnterBack fire when this section's bottom edge crosses the
  // viewport top. Phase 5 replaces this ref with the real <Hero> root ref.
  const heroRef = useRef<HTMLElement>(null)

  // Demo hero strings — proves i18n round-trips. Replaced by the real Hero component in Phase 5.
  const { t } = useTranslation('hero')

  // Playfair Display loads asynchronously from Google Fonts. If ScrollTrigger
  // measures element positions before the font is ready, it may compute wrong
  // trigger offsets — the fallback font has different metrics than Playfair,
  // so layout height shifts when the real font swaps in. Calling
  // ScrollTrigger.refresh() after document.fonts.ready forces a recalculation
  // once the final layout is settled.
  useEffect(() => {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [])

  return (
    <>
      {/* Global noise grain overlay — always on top */}
      <NoiseOverlay />

      {/*
        Phase 4 test harness — placeholder hero section so HeroBackdrop has a
        real DOM target for its ScrollTrigger. The placeholder text is
        intentionally minimal (Phase 5 replaces this whole section with the
        real <Hero> component including PillNav, i18n copy, and CTA).

        Layout choices:
          - minHeight: '100vh'  — gives ScrollTrigger something to scroll past
          - position: 'relative' — required so the absolute-positioned Plasma
            canvas inside HeroBackdrop is positioned against this section.
          - isolation: 'isolate' — creates a new stacking context so Plasma
            stays contained to this section instead of bleeding into the
            existing demo hero below.
          - overflow: 'hidden'  — guards against the WebGL canvas momentarily
            exceeding the section box during ResizeObserver settling.
      */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
        aria-label="Plasma test harness"
      >
        <AnimationErrorBoundary>
          <HeroBackdrop />
        </AnimationErrorBoundary>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '6rem 2rem',
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            pointerEvents: 'none',
          }}
        >
          Phase 4 — Plasma test harness
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              opacity: 0.85,
              maxWidth: '60ch',
              marginTop: '1rem',
            }}
          >
            Scroll past this section to verify Plasma unmounts. Scroll back up to verify it
            remounts. Move the mouse to verify subtle warp.
          </p>
        </div>
      </section>

      {/* Animation root — ErrorBoundary catches WebGL / rAF failures */}
      <AnimationErrorBoundary>
        <AnimationRootPlaceholder />
      </AnimationErrorBoundary>

      {/* Language switcher — bounded because the sliding-underline transition lives inside it */}
      <AnimationErrorBoundary>
        <LanguageSwitcher />
      </AnimationErrorBoundary>

      {/* Demo page content — proves i18n round-trip; replaced by real Hero in Phase 5 */}
      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            color: 'white',
            padding: '2rem 2rem 0',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
          }}
        >
          {t('heading.title')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'white',
            padding: '0 2rem',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            opacity: 0.8,
            maxWidth: '60ch',
          }}
        >
          {t('heading.tagline')}
        </p>
        <button
          type="button"
          style={{
            margin: '2rem',
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            color: 'white',
            border: '1px solid #FF4500',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {t('cta')}
        </button>
      </main>

      {/*
        Phase 3 scroll-infrastructure test harness — proves ScrollProvider,
        RevealSection, and ParallaxCard wire up end-to-end against the real
        brand styling. Replaced by the real Phase 6 Projects section. The
        existing demo hero above is intentionally left untouched (Phase 5
        replaces the whole <main>, not Phase 3).
      */}
      <section
        style={{
          padding: '6rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <RevealSection variant="fade-up">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              color: 'white',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              margin: 0,
            }}
          >
            Projects
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'rgba(255,255,255,0.6)',
              margin: '0.5rem 0 0 0',
            }}
          >
            Selected work — scroll to reveal parallax depth
          </p>
        </RevealSection>

        <RevealSection
          variant="fade-up"
          stagger
          style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}
        >
          {/* Card 1 — subtle parallax (speed 0.15 bg / 0.05 text) */}
          <div style={DEMO_CARD_WRAPPER_STYLE}>
            <ParallaxCard
              layers={[
                {
                  speed: 0.15,
                  content: (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                      }}
                    />
                  ),
                },
                {
                  speed: 0.05,
                  content: (
                    <DemoCardBody
                      category="SEO / Automation"
                      title="Search Pipeline"
                      blurb="Automated content audit reducing manual review by 80%."
                      tags={['Python', 'N8N', 'Airtable']}
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* Card 2 — moderate parallax (speed 0.25 bg / 0.10 text) */}
          <div style={DEMO_CARD_WRAPPER_STYLE}>
            <ParallaxCard
              layers={[
                {
                  speed: 0.25,
                  content: (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1c1010 0%, #0f0808 100%)',
                      }}
                    />
                  ),
                },
                {
                  speed: 0.1,
                  content: (
                    <DemoCardBody
                      category="AI / Integrations"
                      title="AI Brief Engine"
                      blurb="Claude MCP pipeline generating brand-aligned briefs at scale."
                      tags={['Claude', 'Make.com', 'Supabase']}
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* Card 3 — cinematic parallax (speed 0.35 bg / 0.15 text) */}
          <div style={DEMO_CARD_WRAPPER_STYLE}>
            <ParallaxCard
              layers={[
                {
                  speed: 0.35,
                  content: (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #181510 0%, #0e0c08 100%)',
                      }}
                    />
                  ),
                },
                {
                  speed: 0.15,
                  content: (
                    <DemoCardBody
                      category="Data / Infrastructure"
                      title="Analytics Stack"
                      blurb="Self-hosted reporting replacing agency tooling, cutting costs 60%."
                      tags={['Docker', 'Railway', 'Google Cloud']}
                    />
                  ),
                },
              ]}
            />
          </div>
        </RevealSection>
      </section>

      {/* Spacer — forces additional scroll distance so parallax depth is observable. */}
      <div style={{ height: '40vh' }} aria-hidden="true" />
    </>
  )
}
