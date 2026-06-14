import { useTranslation } from 'react-i18next'
import { ProjectCard } from './ProjectCard'

const PROJECTS = ['project1', 'project2', 'project3', 'project4'] as const

const PROJECTS_STYLE = `
.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 2rem; max-width: 80rem; margin: 0 auto; grid-auto-rows: min-content; }
.projects-card-stagger { margin-top: 6rem; }
.project-card-accent { transition: box-shadow 0.4s ease; }
.project-card-accent:hover { box-shadow: 0 20px 50px rgba(255,69,0,0.3); }
.project-card-dark { transition: border-color 0.3s ease; }
.project-card-dark:hover { border-color: rgba(255,69,0,0.5) !important; }
@media (max-width: 768px) {
  .projects-grid { grid-template-columns: 1fr; }
  .projects-card-stagger { margin-top: 0; }
}
`

export function Projects() {
  const { t } = useTranslation('projects')

  return (
    <section
      id="work"
      aria-label={t('title')}
      style={{ padding: '6rem 1.5rem', position: 'relative' }}
    >
      <style>{PROJECTS_STYLE}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto 4rem' }}>
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
              margin: 0,
            }}
          >
            {t('title')}
          </h2>
        </div>

        <div className="projects-grid">
          {PROJECTS.map((projectId, i) => (
            <div key={projectId} className={i % 2 === 1 ? 'projects-card-stagger' : undefined}>
              <ProjectCard projectId={projectId} index={i} parallaxSpeed={0.1 + i * 0.05} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
