import { NoiseOverlay } from '@/components/layout/NoiseOverlay'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

function AnimationRootPlaceholder() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(255, 69, 0, 0.15) 0%, #050505 60%)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default function App() {
  // Kill-switch: all future animation code reads these flags before scheduling rAF / WebGL work.
  const { prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 } =
    useDeviceCapabilities()

  void prefersReducedMotion
  void isMobile
  void isLowEnd
  void supportsWebGL2

  return (
    <>
      {/* Global noise grain overlay — always on top */}
      <NoiseOverlay />

      {/* Animation root — ErrorBoundary catches WebGL / rAF failures */}
      <AnimationErrorBoundary>
        <AnimationRootPlaceholder />
      </AnimationErrorBoundary>

      {/* Page content — sits above animation layer */}
      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            color: 'white',
            padding: '2rem',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
          }}
        >
          Kelly Battistoni
        </h1>
      </main>
    </>
  )
}
