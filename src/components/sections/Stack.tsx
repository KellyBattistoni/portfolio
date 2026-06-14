import { useTranslation } from 'react-i18next'
import { RevealSection } from '@/components/scroll/RevealSection'
import { STACK, STACK_ORDER } from '@/components/stack/stack-registry'
import { StackIcon } from '@/components/stack/StackIcon'

const STACK_STYLES = `
.stack-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: default;
  transition: transform 0.2s ease;
}
.stack-tile:hover { transform: scale(1.08); }
@media (prefers-reduced-motion: reduce) {
  .stack-tile { transition: none; }
  .stack-tile:hover { transform: none; }
}
`

export function Stack() {
  const { t } = useTranslation('stack')

  return (
    <section
      id="stack"
      aria-label={t('title')}
      style={{
        padding: '6rem 1.5rem',
        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <style>{STACK_STYLES}</style>
      <RevealSection stagger={false}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              marginTop: 0,
              marginBottom: '3rem',
            }}
          >
            {t('title')}
          </h2>

          {STACK_ORDER.map((cat) => (
            <div key={cat} style={{ marginBottom: '2.5rem' }}>
              <h3
                style={{
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                  marginBottom: '1rem',
                }}
              >
                {t(`categories.${cat}`)}
              </h3>
              <ul
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {STACK.filter((s) => s.category === cat).map((entry) => (
                  <li key={entry.id} className="stack-tile">
                    <StackIcon entry={entry} size={36} />
                    <span style={{ fontSize: '0.8rem', textAlign: 'center', opacity: 0.9 }}>
                      {entry.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  )
}
