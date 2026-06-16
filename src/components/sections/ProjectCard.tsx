import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'

interface ProjectCardProps {
  projectId: 'project1' | 'project2' | 'project3' | 'project4' | 'project5' | 'project6'
  index: number
}

export function ProjectCard({ projectId, index }: ProjectCardProps) {
  const { t } = useTranslation('projects')
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const { prefersReducedMotion } = useDeviceCapabilities()
  const tech = t(`cards.${projectId}.tech`, { returnObjects: true }) as string[]

  const isAccent = index % 2 === 0
  const cardBg = isAccent
    ? 'linear-gradient(135deg, rgba(255,69,0,0.09) 0%, transparent 55%), #111'
    : 'linear-gradient(315deg, rgba(255,69,0,0.09) 0%, transparent 55%), #111'
  const cardBorder = '1px solid rgba(255,69,0,0.3)'

  return (
    <div
      className={isAccent ? 'project-card-wrapper-accent' : 'project-card-wrapper-dark'}
      style={{
        position: 'relative',
        background: cardBg,
        border: cardBorder,
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        aria-label={`${t(`cards.${projectId}.title`)} — ${expanded ? t('labels.collapse') : t('labels.expand')}`}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          padding: expanded ? '2rem 2rem 1rem' : '2rem',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
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
              border: '1px solid rgba(255,255,255,0.2)',
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
            color: 'var(--color-brand-accent)',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {t(`cards.${projectId}.outcome`)}
        </p>

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
                  border: '1px solid var(--color-brand-accent)',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  opacity: 0.85,
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
          {!expanded && (
            <div
              className="card-cue"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              <span>{t('labels.expand')}</span>
              <span>↓</span>
            </div>
          )}
        </div>
      </button>

      <div
        className="project-details-panel"
        id={detailsId}
        aria-hidden={!expanded}
        style={{
          maxHeight: expanded ? '800px' : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: prefersReducedMotion ? 'none' : 'max-height 0.45s ease, opacity 0.3s ease',
          background: 'transparent',
          padding: expanded ? '0 2rem 1.5rem' : '0 2rem',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-brand-accent)' }}>
          {t('labels.problem')}
        </h4>
        <p style={{ margin: '0 0 1.5rem' }}>{t(`cards.${projectId}.problem`)}</p>

        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-brand-accent)' }}>
          {t('labels.solution')}
        </h4>
        <p style={{ margin: '0 0 1.5rem' }}>{t(`cards.${projectId}.solution`)}</p>

        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-brand-accent)' }}>
          {t('labels.result')}
        </h4>
        <p style={{ margin: 0 }}>{t(`cards.${projectId}.result`)}</p>

        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="card-cue"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '1.25rem',
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: 0,
          }}
        >
          <span>{t('labels.collapse')}</span>
          <span>↑</span>
        </button>
      </div>
    </div>
  )
}
