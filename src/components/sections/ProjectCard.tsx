import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ParallaxCard } from '@/components/scroll/ParallaxCard'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

interface ProjectCardProps {
  projectId: 'project1' | 'project2' | 'project3' | 'project4'
  parallaxSpeed: number
  index: number
}

export function ProjectCard({ projectId, parallaxSpeed, index }: ProjectCardProps) {
  const { t } = useTranslation('projects')
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const { prefersReducedMotion } = useDeviceCapabilities()
  const tech = t(`cards.${projectId}.tech`, { returnObjects: true }) as string[]

  const isAccent = index % 2 === 0
  const cardBg = isAccent ? 'var(--color-brand-accent)' : 'var(--color-brand-card, #111)'
  const cardText = isAccent ? '#050505' : 'inherit'
  const cardBorder = isAccent ? undefined : '1px solid rgba(255,255,255,0.1)'

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={isAccent ? 'project-card-accent' : 'project-card-dark'}
        style={{
          height: '260px',
          background: cardBg,
          border: cardBorder,
          borderRadius: expanded ? '24px 24px 0 0' : 24,
          overflow: 'hidden',
          color: cardText,
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
                    justifyContent: 'flex-start',
                    gap: '0.625rem',
                  }}
                >
                  {/* Title + badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.375rem',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {t(`cards.${projectId}.title`)}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        border: `1px solid ${isAccent ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)'}`,
                        padding: '0.2rem 0.625rem',
                        borderRadius: 999,
                        flexShrink: 0,
                        marginTop: '0.25rem',
                      }}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>
                    {t(`cards.${projectId}.context`)}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: isAccent ? 'rgba(0,0,0,0.85)' : 'var(--color-brand-accent)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {t(`cards.${projectId}.outcome`)}
                  </p>

                  {/* Tags + expand cue on same row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ul
                      aria-label={t('labels.tech')}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.375rem',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {tech.map((tag) => (
                        <li
                          key={tag}
                          style={{
                            padding: '0.2rem 0.5rem',
                            border: `1px solid ${isAccent ? 'rgba(0,0,0,0.3)' : 'var(--color-brand-accent)'}`,
                            borderRadius: 999,
                            fontSize: '0.7rem',
                            opacity: 0.85,
                          }}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        opacity: 0.5,
                        fontSize: '0.75rem',
                        flexShrink: 0,
                      }}
                    >
                      <span>{expanded ? t('labels.collapse') : t('labels.expand')}</span>
                      <span
                        style={{
                          transform: expanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s ease',
                          display: 'inline-block',
                        }}
                      >
                        ↓
                      </span>
                    </div>
                  </div>
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
          transition: prefersReducedMotion ? 'none' : 'max-height 0.4s ease, opacity 0.3s ease',
          background: cardBg,
          color: cardText,
          borderLeft: cardBorder,
          borderRight: cardBorder,
          borderBottom: cardBorder,
          borderRadius: '0 0 24px 24px',
          marginTop: '-1px',
          padding: expanded ? '1.5rem 2rem 2rem' : '0 2rem',
        }}
      >
        <h4
          style={{
            marginTop: 0,
            color: isAccent ? 'rgba(0,0,0,0.6)' : 'var(--color-brand-accent)',
          }}
        >
          {t('labels.problem')}
        </h4>
        <p>{t(`cards.${projectId}.problem`)}</p>
        <h4 style={{ color: isAccent ? 'rgba(0,0,0,0.6)' : 'var(--color-brand-accent)' }}>
          {t('labels.solution')}
        </h4>
        <p>{t(`cards.${projectId}.solution`)}</p>
        <h4 style={{ color: isAccent ? 'rgba(0,0,0,0.6)' : 'var(--color-brand-accent)' }}>
          {t('labels.result')}
        </h4>
        <p style={{ marginBottom: 0 }}>{t(`cards.${projectId}.result`)}</p>
      </div>
    </div>
  )
}
