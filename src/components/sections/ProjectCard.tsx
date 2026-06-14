import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ParallaxCard } from '@/components/scroll/ParallaxCard'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

interface ProjectCardProps {
  projectId: 'project1' | 'project2' | 'project3' | 'project4'
  parallaxSpeed: number
}

export function ProjectCard({ projectId, parallaxSpeed }: ProjectCardProps) {
  const { t } = useTranslation('projects')
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const { prefersReducedMotion } = useDeviceCapabilities()
  const tech = t(`cards.${projectId}.tech`, { returnObjects: true }) as string[]

  return (
    <div style={{ position: 'relative' }}>
      {/*
       * Card face wrapper — explicit 260px height so ParallaxCard's height:100%
       * resolves. ParallaxCard accepts no style prop so visual styling lives here.
       * Border-radius adjusts when panel expands so face + panel form one shape.
       */}
      <div
        style={{
          height: '260px',
          background: 'var(--color-brand-card, #111)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: expanded ? '12px 12px 0 0' : 12,
          overflow: 'hidden',
        }}
      >
        <ParallaxCard
          layers={[
            {
              speed: parallaxSpeed,
              content: (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  aria-label={`${t(`cards.${projectId}.title`)} — ${expanded ? t('labels.collapse') : t('labels.expand')}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    padding: '2rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>
                    {t(`cards.${projectId}.title`)}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.7 }}>
                    {t(`cards.${projectId}.context`)}
                  </p>
                  <p style={{ margin: 0, color: 'var(--color-brand-accent)' }}>
                    {t(`cards.${projectId}.outcome`)}
                  </p>
                  <ul
                    aria-label={t('labels.tech')}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {tech.map((tag) => (
                      <li
                        key={tag}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: '1px solid var(--color-brand-accent)',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          opacity: 0.85,
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* Details panel — normal-flow sibling OUTSIDE ParallaxCard, expands freely */}
      <div
        id={detailsId}
        aria-hidden={!expanded}
        style={{
          maxHeight: expanded ? '600px' : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: prefersReducedMotion
            ? 'none'
            : 'max-height 0.4s ease, opacity 0.3s ease',
          background: 'var(--color-brand-card, #111)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0 0 12px 12px',
          marginTop: '-1px',
          padding: expanded ? '1.5rem 2rem 2rem' : '0 2rem',
        }}
      >
        <h4 style={{ marginTop: 0, color: 'var(--color-brand-accent)' }}>
          {t('labels.problem')}
        </h4>
        <p>{t(`cards.${projectId}.problem`)}</p>
        <h4 style={{ color: 'var(--color-brand-accent)' }}>{t('labels.solution')}</h4>
        <p>{t(`cards.${projectId}.solution`)}</p>
        <h4 style={{ color: 'var(--color-brand-accent)' }}>{t('labels.result')}</h4>
        <p style={{ marginBottom: 0 }}>{t(`cards.${projectId}.result`)}</p>
      </div>
    </div>
  )
}
