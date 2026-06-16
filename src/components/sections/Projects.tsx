import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { ProjectCard } from './ProjectCard'

const PROJECTS_STYLE = `
.projects-columns { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 2rem; max-width: min(90rem, 88vw); margin: 0 auto; align-items: start; }
.projects-col { display: flex; flex-direction: column; gap: 2rem; }
.projects-col-right { margin-top: 6rem; }
.card-cue { opacity: 0.5; transition: opacity 0.2s ease, color 0.2s ease; }
.card-cue:hover { opacity: 1; color: white; }
.project-card-wrapper-accent { transition: filter 0.3s ease, border-color 0.3s ease; }
.project-card-wrapper-accent:hover { filter: drop-shadow(0 8px 32px rgba(255,69,0,0.28)); border-color: rgba(255,69,0,0.6) !important; }
.project-card-wrapper-dark { transition: filter 0.3s ease, border-color 0.3s ease; }
.project-card-wrapper-dark:hover { filter: drop-shadow(0 8px 32px rgba(255,69,0,0.22)); border-color: rgba(255,69,0,0.5) !important; }
@media (max-width: 768px) {
  .projects-columns { grid-template-columns: 1fr; }
  .projects-col-right { margin-top: 0; }
}
`

export function Projects() {
  const { t } = useTranslation('projects')
  const sectionRef = useRef<HTMLElement>(null)
  const accentLineRef = useRef<HTMLSpanElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const { prefersReducedMotion } = useDeviceCapabilities()
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== '#work') return
      tlRef.current?.restart()
    }
    window.addEventListener('section:replay', handler)
    return () => window.removeEventListener('section:replay', handler)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!sectionRef.current || !accentLineRef.current || !headingRef.current) return
        if (!leftColRef.current || !rightColRef.current) return

        const leftCards = Array.from(leftColRef.current.children) as HTMLElement[]
        const rightCards = Array.from(rightColRef.current.children) as HTMLElement[]

        gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(headingRef.current, { opacity: 0, y: 30 })
        gsap.set(leftCards, { opacity: 0, y: 44 })
        gsap.set(rightCards, { opacity: 0, y: 44 })

        const tl = gsap.timeline({ paused: true })
        tlRef.current = tl

        tl.to(accentLineRef.current, { scaleX: 1, duration: 0.45, ease: 'power2.out' })
          .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.15')
          .addLabel('cols', '-=0.4')
          .to(
            leftCards,
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.13 },
            'cols'
          )
          .to(
            rightCards,
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.13 },
            'cols+=0.15'
          )

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
          animation: tl,
        })

        return () => {
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      })
      return () => mm.revert()
    },
    { dependencies: [prefersReducedMotion] }
  )

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label={t('title')}
      style={{ minHeight: '100vh', padding: '6rem 1.5rem', position: 'relative' }}
    >
      <style>{PROJECTS_STYLE}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 'min(90rem, 88vw)', margin: '0 auto 4rem' }}>
          <span
            ref={accentLineRef}
            aria-hidden="true"
            style={{
              display: 'block',
              height: '1px',
              width: '3rem',
              background: 'var(--color-brand-accent)',
              marginBottom: '1.5rem',
            }}
          />
          <h2
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              margin: 0,
            }}
          >
            {t('title')}
          </h2>
        </div>

        {/* Two independent flex columns so expanding a card in one column
            doesn't shift cards in the other column */}
        <div className="projects-columns">
          <div ref={leftColRef} className="projects-col">
            <ProjectCard projectId="project1" index={0} />
            <ProjectCard projectId="project3" index={2} />
            <ProjectCard projectId="project5" index={4} />
          </div>
          <div ref={rightColRef} className="projects-col projects-col-right">
            <ProjectCard projectId="project2" index={1} />
            <ProjectCard projectId="project4" index={3} />
            <ProjectCard projectId="project6" index={5} />
          </div>
        </div>
      </div>
    </section>
  )
}
