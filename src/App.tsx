import { useEffect, useRef } from 'react'
import { NoiseOverlay } from '@/components/layout/NoiseOverlay'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { useLocalizeDocumentAttributes } from '@/hooks/useLocalizeDocumentAttributes'
import { ScrollTrigger } from '@/lib/gsap'
import { Hero } from '@/components/hero/Hero'
import { PillNav } from '@/components/nav/PillNav'
import { MobileNav } from '@/components/nav/MobileNav'

export default function App() {
  useLocalizeDocumentAttributes()
  const { isMobile } = useDeviceCapabilities()
  const heroRef = useRef<HTMLElement>(null)

  // Playfair Display loads from Google Fonts asynchronously.
  // Refresh ScrollTrigger after font swap so trigger positions are correct.
  useEffect(() => {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [])

  return (
    <>
      <NoiseOverlay />
      <Hero sectionRef={heroRef} />
      {isMobile ? <MobileNav heroRef={heroRef} /> : <PillNav heroRef={heroRef} />}
    </>
  )
}
