import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Syncs document.title and meta[name="description"] to the active i18n language.
 *
 * Why: SPA with no SSR — the only way to update <title> and <meta description>
 * in response to language changes is via direct DOM mutation. No react-helmet-async.
 *
 * Mirrors the exact pattern of useLocalizeDocumentAttributes (same dependency array,
 * same guard pattern) — per D-01 in 07-RESEARCH.md.
 *
 * Meta copy lives in src/locales/{en,es}/common.json under the `meta` key,
 * so this hook is decoupled from the copy and never needs changing when strings
 * are updated.
 */
export function useMetaTags(): void {
  const { t, i18n } = useTranslation('common')

  useEffect(() => {
    const title = t('meta.title')
    const description = t('meta.description')

    if (title) {
      document.title = title
    }
    if (description) {
      const el = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (el) el.setAttribute('content', description)
    }
  }, [i18n.resolvedLanguage, t])
}
