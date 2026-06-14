import { useTranslation } from 'react-i18next'
import { RevealSection } from '@/components/scroll/RevealSection'

export function About() {
  const { t } = useTranslation('about')
  return (
    <section
      id="about"
      aria-label={t('title')}
      style={{ padding: '6rem 1.5rem', maxWidth: '52rem', margin: '0 auto' }}
    >
      <RevealSection stagger>
        <span
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
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginTop: 0,
            marginBottom: '2rem',
          }}
        >
          {t('title')}
        </h2>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {t('paragraph1')}
        </p>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {t('paragraph2')}
        </p>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: 0 }}>
          {t('paragraph3')}
        </p>
      </RevealSection>
    </section>
  )
}
