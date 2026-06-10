import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enHero from '@/locales/en/hero.json'
import enAbout from '@/locales/en/about.json'
import enProjects from '@/locales/en/projects.json'
import enStack from '@/locales/en/stack.json'
import enContact from '@/locales/en/contact.json'
import esCommon from '@/locales/es/common.json'
import esHero from '@/locales/es/hero.json'
import esAbout from '@/locales/es/about.json'
import esProjects from '@/locales/es/projects.json'
import esStack from '@/locales/es/stack.json'
import esContact from '@/locales/es/contact.json'

export const defaultNS = 'common' as const

export const resources = {
  en: {
    common: enCommon,
    hero: enHero,
    about: enAbout,
    projects: enProjects,
    stack: enStack,
    contact: enContact,
  },
  es: {
    common: esCommon,
    hero: esHero,
    about: esAbout,
    projects: esProjects,
    stack: esStack,
    contact: esContact,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS,
    ns: ['common', 'hero', 'about', 'projects', 'stack', 'contact'],
    supportedLngs: ['en', 'es'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kbv-lang',
      caches: ['localStorage'],
    },
    parseMissingKeyHandler: (key, _defaultValue, options) => `${options?.ns ?? 'unknown'}:${key}`,
    returnNull: false,
    react: {
      useSuspense: false,
    },
  })

export default i18n
