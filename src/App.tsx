import { useTranslation } from 'react-i18next'
import { NoiseOverlay } from '@/components/layout/NoiseOverlay'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { useLocalizeDocumentAttributes } from '@/hooks/useLocalizeDocumentAttributes'

function AnimationRootPlaceholder() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 69, 0, 0.15) 0%, #050505 60%)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
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

  // Demo hero strings — proves i18n round-trips. Replaced by the real Hero component in Phase 5.
  const { t } = useTranslation('hero')

  return (
    <>
      {/* Global noise grain overlay — always on top */}
      <NoiseOverlay />

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
    </>
  )
}
