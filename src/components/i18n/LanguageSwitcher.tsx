import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const LANGS = ['en', 'es'] as const
type Lang = (typeof LANGS)[number]

/**
 * EN/ES language switcher with sliding-underline active state.
 *
 * - Two <button> elements inside a <div role="group">
 * - Active button: `aria-pressed="true"` + visible accent underline
 * - Inactive button: underline scaled to 0 (Tailwind transition)
 * - Calls `i18n.changeLanguage(lng)` on click; void-prefixed to satisfy
 *   no-floating-promises (react-i18next re-renders on languageChanged event)
 *
 * Position-neutral: accepts a `className` prop so callers (PillNav, MobileNav,
 * or any wrapper) own positioning. Default is `flex gap-4` for backward-compat
 * standalone usage; providing a className fully replaces the default.
 *
 * Wrapped by AnimationErrorBoundary in App.tsx (per Phase 1 policy: anything
 * with a transition is bounded).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation('common')
  const current = (i18n.resolvedLanguage as Lang | undefined) ?? 'en'

  const handleChange = (lng: Lang) => {
    if (lng === current) return
    void i18n.changeLanguage(lng)
  }

  return (
    <div
      role="group"
      aria-label={t('switcher.ariaLabel')}
      className={clsx(className ?? 'flex gap-4')}
    >
      {LANGS.map((lng) => {
        const isActive = lng === current
        return (
          <button
            key={lng}
            type="button"
            onClick={() => handleChange(lng)}
            aria-pressed={isActive}
            className={clsx(
              'relative text-sm font-medium uppercase tracking-wider',
              'text-white/80 hover:text-white transition-colors',
              'after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px',
              'after:bg-[#FF4500] after:origin-left after:transition-transform after:duration-300',
              isActive ? 'after:scale-x-100 text-white' : 'after:scale-x-0'
            )}
          >
            {t(`switcher.${lng}` as const)}
          </button>
        )
      })}
    </div>
  )
}
