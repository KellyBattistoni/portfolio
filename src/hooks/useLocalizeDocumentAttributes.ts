import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Syncs document.documentElement.lang to i18n.resolvedLanguage on mount
 * and whenever the active language changes.
 *
 * Why: i18next-browser-languagedetector's `htmlTag` option only READS the
 * pre-existing `<html lang>`; it never writes back. Without this hook the
 * <html> tag stays "en" forever, breaking SEO/AT semantics and failing
 * Phase 2 success criterion 3.
 *
 * Uses i18n.resolvedLanguage (post-fallback canonical code like 'es') instead
 * of i18n.language (which may still carry the region tag like 'es-AR').
 */
export function useLocalizeDocumentAttributes(): void {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage
    }
  }, [i18n.resolvedLanguage])
}
