import { useTranslation } from 'react-i18next'
import { ProjectCard } from './ProjectCard'

const PROJECTS = ['project1', 'project2', 'project3', 'project4'] as const

const PROJECTS_STYLE = `
.projects-grid { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 2rem; row-gap: 3rem; grid-auto-rows: min-content; max-width: 80rem; margin: 0 auto; }
.projects-card-even { grid-column: 1 / 8; }
.projects-card-odd  { grid-column: 6 / 13; }
@media (max-width: 768px) {
  .projects-card-even, .projects-card-odd { grid-column: 1 / -1; }
}
`

export function Projects() {
  const { t } = useTranslation('projects')

  return (
    <section
      id="work"
      aria-label={t('title')}
      style={{ padding: '6rem 1.5rem' }}
    >
      <style>{PROJECTS_STYLE}</style>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          maxWidth: '80rem',
          margin: '0 auto 4rem',
        }}
      >
        {t('title')}
      </h2>

      <div className="projects-grid">
        {PROJECTS.map((projectId, i) => (
          <div key={projectId} className={i % 2 === 0 ? 'projects-card-even' : 'projects-card-odd'}>
            <ProjectCard
              projectId={projectId}
              parallaxSpeed={0.1 + i * 0.05}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
