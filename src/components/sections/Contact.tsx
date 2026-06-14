import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RevealSection } from '@/components/scroll/RevealSection'

const LINKEDIN_PLACEHOLDER = 'LINKEDIN_URL'

const linkStyle: React.CSSProperties = {
  color: 'var(--color-brand-accent)',
  textDecoration: 'none',
  borderBottom: '1px solid var(--color-brand-accent)',
  paddingBottom: '0.1em',
}

export function Contact() {
  const { t } = useTranslation('contact')
  const [cvLang, setCvLang] = useState<'en' | 'es'>('en')

  const cvHref =
    cvLang === 'en'
      ? '/Harvard_CV_Kelly_Battistoni_EN.pdf'
      : '/Harvard_CV_Kelly_Battistoni_ES.pdf'

  const linkedinUrl = t('linkedin.url')
  const linkedinIsLive =
    linkedinUrl !== LINKEDIN_PLACEHOLDER && linkedinUrl.length > 0

  return (
    <section
      id="contact"
      aria-label={t('heading')}
      style={{ padding: '6rem 1.5rem', maxWidth: '52rem', margin: '0 auto' }}
    >
      <RevealSection stagger>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginTop: 0,
            marginBottom: '1.5rem',
          }}
        >
          {t('heading')}
        </h2>

        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          {t('invite')}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="mailto:kelly@seomarketing.com" style={linkStyle}>
            {t('email.label')}
          </a>

          {linkedinIsLive ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {t('linkedin.label')}
            </a>
          ) : (
            /* LinkedIn placeholder — renders non-clickable until real URL supplied in Phase 7.
             * Avoids a broken target="_blank" anchor pointing at a non-URL string. */
            <span
              data-linkedin-placeholder="LINKEDIN_URL"
              aria-disabled="true"
              style={{ opacity: 0.35, cursor: 'default' }}
            >
              {t('linkedin.label')}
            </span>
          )}
        </div>

        <div
          role="group"
          aria-labelledby="cv-group-label"
          style={{ marginTop: '3rem' }}
        >
          <p
            id="cv-group-label"
            style={{ marginBottom: '0.75rem', fontSize: '0.875rem', opacity: 0.6 }}
          >
            {t('cv.label')}
          </p>

          <div
            role="radiogroup"
            aria-label={t('cv.label')}
            style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
          >
            {(['en', 'es'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                role="radio"
                aria-checked={cvLang === lang}
                onClick={() => setCvLang(lang)}
                style={{
                  padding: '0.375rem 1rem',
                  border: '1px solid',
                  borderColor:
                    cvLang === lang ? 'var(--color-brand-accent)' : 'rgba(255,255,255,0.2)',
                  background: cvLang === lang ? 'var(--color-brand-accent)' : 'transparent',
                  color: cvLang === lang ? '#050505' : 'inherit',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontWeight: cvLang === lang ? 700 : 400,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {t(`cv.toggle.${lang}`)}
              </button>
            ))}
          </div>

          <a
            href={cvHref}
            download
            style={{
              display: 'inline-block',
              border: '1px solid var(--color-brand-accent)',
              padding: '0.875rem 2.25rem',
              textDecoration: 'none',
              color: 'inherit',
              letterSpacing: '0.05em',
            }}
          >
            {t('cv.download')}
          </a>
        </div>
      </RevealSection>
    </section>
  )
}
