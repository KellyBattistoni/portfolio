import { lazy, Suspense, useEffect, useRef } from 'react'
import { NoiseOverlay } from '@/components/layout/NoiseOverlay'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { useLocalizeDocumentAttributes } from '@/hooks/useLocalizeDocumentAttributes'
import { useMetaTags } from '@/hooks/useMetaTags'
import { ScrollTrigger } from '@/lib/gsap'
import { Hero } from '@/components/hero/Hero'
import { PillNav } from '@/components/nav/PillNav'
import { MobileNav } from '@/components/nav/MobileNav'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'

const About = lazy(() =>
  import('@/components/sections/About').then(({ About }) => ({ default: About }))
)
const Projects = lazy(() =>
  import('@/components/sections/Projects').then(({ Projects }) => ({ default: Projects }))
)
const Stack = lazy(() =>
  import('@/components/sections/Stack').then(({ Stack }) => ({ default: Stack }))
)
const Contact = lazy(() =>
  import('@/components/sections/Contact').then(({ Contact }) => ({ default: Contact }))
)

export default function App() {
  useLocalizeDocumentAttributes()
  useMetaTags()
  const { isMobile } = useDeviceCapabilities()
  const heroRef = useRef<HTMLElement>(null)

  // Playfair Display loads from Google Fonts asynchronously.
  // Refresh ScrollTrigger after font swap so trigger positions are correct.
  useEffect(() => {
    if (isMobile) return
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [isMobile])

  return (
    <>
      <NoiseOverlay />
      <Hero sectionRef={heroRef} />
      {isMobile ? <MobileNav /> : <PillNav heroRef={heroRef} />}
      <Suspense fallback={null}>
        <AnimationErrorBoundary>
          <About />
        </AnimationErrorBoundary>
      </Suspense>
      <Suspense fallback={null}>
        <AnimationErrorBoundary>
          <Projects />
        </AnimationErrorBoundary>
      </Suspense>
      <Suspense fallback={null}>
        <AnimationErrorBoundary>
          <Stack />
        </AnimationErrorBoundary>
      </Suspense>
      <Suspense fallback={null}>
        <AnimationErrorBoundary>
          <Contact />
        </AnimationErrorBoundary>
      </Suspense>
      <footer
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
        }}
      >
        © {new Date().getFullYear()} Kelly Battistoni. All rights reserved.
      </footer>
    </>
  )
}
