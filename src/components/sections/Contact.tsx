import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

const CONTACT_STYLES = `
.contact-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 6rem;
  align-items: start;
}
.contact-method { margin-bottom: 2.5rem; }
.contact-method:last-child { margin-bottom: 0; }
.contact-method-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.contact-method-lbl {
  font-size: 0.72rem;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
}
.contact-method-rule {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
  display: block;
  transform-origin: left center;
}
.contact-email-link {
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 1.8vw, 1.375rem);
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.18);
  padding-bottom: 0.1em;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.contact-email-link:hover {
  color: var(--color-brand-accent);
  border-color: var(--color-brand-accent);
}
.contact-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 2rem;
  border: 1px solid var(--color-brand-accent);
  color: var(--color-brand-accent);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.22s ease, color 0.22s ease;
}
.contact-cta:hover {
  background: var(--color-brand-accent);
  color: #050505;
}
.cv-lang-group {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1rem;
}
.cv-lang-btn {
  position: relative;
  padding: 0;
  font-size: 0.78rem;
  font-family: var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.cv-lang-btn:hover { color: rgba(255,255,255,0.85); }
.cv-lang-btn[aria-checked="true"] { color: rgba(255,255,255,1); }
.cv-lang-btn::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 1px;
  background: #FF4500;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.cv-lang-btn[aria-checked="true"]::after { transform: scaleX(1); }
@media (max-width: 768px) {
  .contact-columns { grid-template-columns: 1fr; gap: 3.5rem 0; }
}
`

export function Contact() {
  const { t } = useTranslation('contact')
  const [cvLang, setCvLang] = useState<'en' | 'es'>('en')
  const sectionRef = useRef<HTMLElement>(null)
  const accentLineRef = useRef<HTMLSpanElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const inviteRef = useRef<HTMLParagraphElement>(null)
  const openToRef = useRef<HTMLParagraphElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const langBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({ en: null, es: null })
  const { prefersReducedMotion, isMobile } = useDeviceCapabilities()
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== '#contact') return
      tlRef.current?.restart()
    }
    window.addEventListener('section:replay', handler)
    return () => window.removeEventListener('section:replay', handler)
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion || isMobile) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (
          !sectionRef.current ||
          !accentLineRef.current ||
          !headingRef.current ||
          !inviteRef.current ||
          !openToRef.current ||
          !rightColRef.current
        )
          return

        const methods = Array.from(
          rightColRef.current.querySelectorAll<HTMLElement>('[data-method]')
        )

        gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(headingRef.current, { opacity: 0, y: 30 })
        gsap.set(inviteRef.current, { opacity: 0, y: 20 })
        gsap.set(openToRef.current, { opacity: 0, y: 16 })

        methods.forEach((m) => {
          const lbl = m.querySelector('.contact-method-lbl')
          const rule = m.querySelector('.contact-method-rule')
          const content = m.querySelector('[data-method-content]')
          if (lbl) gsap.set(lbl, { opacity: 0, x: -8 })
          if (rule) gsap.set(rule, { scaleX: 0 })
          if (content) gsap.set(content, { opacity: 0, y: 10 })
        })

        const tl = gsap.timeline({ paused: true })
        tlRef.current = tl

        tl.to(accentLineRef.current, { scaleX: 1, duration: 0.45, ease: 'power2.out' })
          .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.15')
          .to(inviteRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.25')
          .to(openToRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2')
          .addLabel('methods', '-=0.3')

        methods.forEach((m, i) => {
          const lbl = m.querySelector('.contact-method-lbl')
          const rule = m.querySelector('.contact-method-rule')
          const content = m.querySelector('[data-method-content]')
          const base = i * 0.18

          if (lbl)
            tl.to(lbl, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, `methods+=${base}`)
          if (rule)
            tl.to(rule, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, `methods+=${base + 0.08}`)
          if (content)
            tl.to(
              content,
              { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
              `methods+=${base + 0.22}`
            )
        })

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
    { scope: sectionRef, dependencies: [prefersReducedMotion, isMobile] }
  )

  const handleLangToggle = contextSafe((lang: 'en' | 'es') => {
    if (lang === cvLang) return
    const nextBtn = langBtnRefs.current[lang]
    const prevBtn = langBtnRefs.current[lang === 'en' ? 'es' : 'en']
    if (!prefersReducedMotion) {
      if (nextBtn)
        gsap
          .timeline()
          .to(nextBtn, { scale: 0.88, duration: 0.08, ease: 'power2.in' })
          .to(nextBtn, { scale: 1, duration: 0.5, ease: 'elastic.out(1.3, 0.45)' })
      if (prevBtn) gsap.to(prevBtn, { scale: 1, duration: 0.15, ease: 'power2.out' })
    }
    setCvLang(lang)
  })

  const cvHref =
    cvLang === 'en'
      ? `${import.meta.env.BASE_URL}Kelly_Battistoni_CV_EN.pdf`
      : `${import.meta.env.BASE_URL}Kelly_Battistoni_CV_ES.pdf`

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label={t('heading')}
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{CONTACT_STYLES}</style>

      {/* Rising ember glow from the bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(255,69,0,0.18) 0%, rgba(255,69,0,0.155) 7%, rgba(255,69,0,0.129) 14%, rgba(255,69,0,0.105) 21%, rgba(255,69,0,0.083) 28%, rgba(255,69,0,0.063) 35%, rgba(255,69,0,0.045) 42%, rgba(255,69,0,0.030) 49%, rgba(255,69,0,0.017) 56%, rgba(255,69,0,0.007) 63%, rgba(255,69,0,0.001) 69%, rgba(255,69,0,0) 73%), ' +
            'linear-gradient(to bottom, rgba(74,31,204,0.10) 0%, rgba(74,31,204,0.078) 8%, rgba(74,31,204,0.058) 16%, rgba(74,31,204,0.040) 24%, rgba(74,31,204,0.025) 33%, rgba(74,31,204,0.013) 42%, rgba(74,31,204,0.005) 51%, rgba(74,31,204,0) 58%)',
          pointerEvents: 'none',
        }}
      />
      {/* Grain — dithers the dual gradient, prevents banding */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence baseFrequency="0.75" type="fractalNoise" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.05"/></svg>')}")`,
          backgroundSize: '200px 200px',
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'min(90rem, 88vw)',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="contact-columns">
          {/* Left: copy */}
          <div>
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
                marginTop: 0,
                marginBottom: '1.5rem',
              }}
            >
              {t('heading')}
            </h2>
            <p
              ref={inviteRef}
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.7,
                marginBottom: '1.25rem',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              {t('invite')}
            </p>
            <p
              ref={openToRef}
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: 0,
              }}
            >
              {t('openTo')}
            </p>
          </div>

          {/* Right: contact methods */}
          <div ref={rightColRef}>
            {/* Email */}
            <div className="contact-method" data-method>
              <div className="contact-method-header">
                <span className="contact-method-lbl">{t('email.method')}</span>
                <span className="contact-method-rule" aria-hidden="true" />
              </div>
              <div data-method-content>
                <a href="mailto:kellybattistoniv@gmail.com" className="contact-email-link">
                  {t('email.label')}
                </a>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="contact-method" data-method>
              <div className="contact-method-header">
                <span className="contact-method-lbl">{t('linkedin.method')}</span>
                <span className="contact-method-rule" aria-hidden="true" />
              </div>
              <div data-method-content>
                <a
                  href={t('linkedin.url')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-cta"
                >
                  {t('linkedin.label')}
                </a>
              </div>
            </div>

            {/* CV */}
            <div className="contact-method" data-method>
              <div className="contact-method-header">
                <span className="contact-method-lbl">{t('cv.method')}</span>
                <span className="contact-method-rule" aria-hidden="true" />
              </div>
              <div data-method-content>
                <div role="radiogroup" aria-label={t('cv.method')} className="cv-lang-group">
                  {(['en', 'es'] as const).map((lang) => (
                    <button
                      key={lang}
                      ref={(el) => {
                        langBtnRefs.current[lang] = el
                      }}
                      type="button"
                      role="radio"
                      aria-checked={cvLang === lang}
                      onClick={() => handleLangToggle(lang)}
                      className="cv-lang-btn"
                    >
                      {t(`cv.toggle.${lang}`)}
                    </button>
                  ))}
                </div>
                <a href={cvHref} download className="contact-cta">
                  {t('cv.download')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
