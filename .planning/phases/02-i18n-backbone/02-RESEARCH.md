# Phase 2: i18n Backbone - Research

**Researched:** 2026-06-09
**Domain:** react-i18next v17 + i18next v26 + i18next-browser-languagedetector v8 on React 19 / Vite 8 / TypeScript 6 (strict, `verbatimModuleSyntax: true`)
**Confidence:** HIGH (all versions verified live via npm; setup patterns verified against official i18next + react-i18next docs and Phrase production guide; TypeScript module augmentation pattern verified against official typescript.md)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Translation content
- Copy is still being drafted — JSON files use human-readable placeholder strings (not empty strings, not key names as values) so the system is visually verifiable
- A minimal hero block (name + tagline + CTA label) ships as the Phase 2 demo string — enough to confirm language switching works end-to-end
- CV download link (EN.pdf vs ES.pdf) handled in component logic, not in translation files — keeps i18n files for display strings only

#### Switcher UI
- Temporary placement: top-right of App.tsx via absolute/fixed positioning — relocated to PillNav in Phase 5
- Appearance: underline tabs — `EN` and `ES` as text labels with an animated underline sliding to the active language
- Language-switch transition: quick text fade (content fades out → language swaps → content fades in)
- Component is wrapped in `AnimationErrorBoundary` — consistent with the Phase 1 policy of bounding anything with a transition

#### Key naming
- Structure: shallow nesting where a section has logical sub-groups; flat for simple namespaces (e.g. `{ heading: { title, tagline }, cta: "..." }`)
- Case: camelCase for all key names
- Interpolation: react-i18next default double-curly `{{var}}`
- Missing key fallback: show the key path itself (e.g. `hero:heading.title`) — makes gaps immediately visible during development

#### Namespace scope
- `common`: everything reusable across sections — nav labels, shared button labels, error messages, aria labels, EN/ES switcher labels, and a `meta` key group (`{ meta: { title, description } }`) for page-level strings (populated in Phase 7)
- `hero`, `about`, `stack`, `contact`: section-specific strings; no cross-namespace sharing
- `projects`: sub-key per project — `{ project1: { title, context, outcome, tech }, project2: { ... } }` — easy to add/remove without touching siblings
- `stack`: category headings are translated (`Automation / Automatización`); tool names (Make.com, N8N, Supabase, etc.) are proper nouns and stay in English in both locales

### Claude's Discretion
- Exact placeholder string content in JSON files
- `meta` group populated in Phase 7; only the key structure defined now
- Whether to use `react-i18next`'s `I18nextProvider` or the `initReactI18next` plugin pattern (choose the conventional plugin approach)
- Static import bundling strategy (single i18n init file that imports all 12 JSON files)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 2 stands up the production-blessed i18next + react-i18next + i18next-browser-languagedetector trio with statically bundled JSON namespaces. The setup is well-trodden: ~10 LOC in a single `i18n.ts` init file, `initReactI18next` plugin pattern (no provider needed in tree), one `.d.ts` module augmentation file for typed keys, a small `LanguageSwitcher` component, and a tiny `useLocalizeDocumentAttributes` hook to sync `<html lang>`. There are no exotic decisions to make — the entire stack is consensus-standard and the user's decisions in CONTEXT.md align with it.

The risk surface is narrow but real: (1) the `htmlTag` detection option does **not** write back to `<html lang>` — you must do it manually via the `languageChanged` event or `i18n.resolvedLanguage` in a `useEffect`; (2) `verbatimModuleSyntax: true` in this project forces `import type` for `FallbackProps`-style imports from react-i18next; (3) `i18next-browser-languagedetector` writes its persisted value back into its localStorage cache during detection, which means setting `caches: ['localStorage']` is what makes `kbv-lang` actually save — if you only set `lookupLocalStorage` you'll read but never write; (4) since v25.4 the new selector API is opt-in, but in v26 (current) it remains opt-in by default — using classic string keys `t('namespace:key')` is fine and still officially supported through v26.

**Primary recommendation:** Single `src/lib/i18n/index.ts` that statically imports all 12 JSON files into a `resources` object marked `as const`, calls `i18n.use(LanguageDetector).use(initReactI18next).init(...)` at module load, configures `supportedLngs: ['en', 'es']`, `nonExplicitSupportedLngs: true`, `caches: ['localStorage']`, `lookupLocalStorage: 'kbv-lang'`, and `parseMissingKeyHandler: (key, _, opts) => \`${opts?.ns ?? 'unknown'}:${key}\``. Import this file once from `main.tsx` (side-effect import, before `<App />`). Wire a `useLocalizeDocumentAttributes` hook in `App.tsx` to set `document.documentElement.lang` from `i18n.resolvedLanguage`. No Suspense boundary needed (bundled resources are synchronously available).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `i18next` | `^26.3.1` | Core translation engine (key lookup, interpolation, plural rules, fallback chain) | The reference i18n engine for JS; react-i18next v17 requires `>= 26.2.0` |
| `react-i18next` | `^17.0.8` | React bindings (`useTranslation` hook, `Trans` component, `initReactI18next` plugin) | Official React adapter from the i18next org; peers `i18next >= 26.2.0`, `react >= 16.8.0`, `typescript ^5 \|\| ^6` |
| `i18next-browser-languagedetector` | `^8.2.1` | Browser locale detection + localStorage persistence | Official i18next detection plugin; covers navigator/localStorage/cookie/querystring in one |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none required) | — | — | Bundled resources mean no `i18next-http-backend`, no Suspense boundary, no providers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-i18next` | `react-intl` (FormatJS) | More verbose, ICU MessageFormat-first, less idiomatic for namespace-per-section model the user chose |
| `i18next-browser-languagedetector` | Hand-roll `navigator.language` + `localStorage` | ~30 LOC of edge cases (region matching, multi-source priority, async cache writing) the plugin already handles — explicit anti-pattern given the user wants `kbv-lang` persistence + browser detection |
| Static imports | `i18next-http-backend` + lazy JSON fetch | Adds network round-trip on first paint, requires Suspense boundary, complicates GH Pages deploy. 12 small JSON files bundle to a few KB — no perf justification for split |
| `I18nextProvider` wrapper | `initReactI18next` plugin (CHOSEN) | Plugin pattern is the documented default; provider only needed when you want multiple i18n instances in the tree |

**Installation:**
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

(All three are runtime deps, not devDeps. No `@types/*` packages needed — TS types ship with each package.)

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── i18n/
│       ├── index.ts              # init file: imports JSON, calls i18n.init()
│       └── resources.ts          # (optional split) exports `resources` and `defaultNS` for d.ts re-use
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── hero.json
│   │   ├── about.json
│   │   ├── projects.json
│   │   ├── stack.json
│   │   └── contact.json
│   └── es/
│       ├── common.json
│       ├── hero.json
│       ├── about.json
│       ├── projects.json
│       ├── stack.json
│       └── contact.json
├── components/
│   └── i18n/
│       └── LanguageSwitcher.tsx  # underline-tabs EN/ES component (wrapped in AnimationErrorBoundary by App)
├── hooks/
│   └── useLocalizeDocumentAttributes.ts  # syncs <html lang> from i18n.resolvedLanguage
├── @types/
│   └── i18next.d.ts              # module augmentation: CustomTypeOptions
├── App.tsx                       # imports i18n side-effect (via main.tsx), renders LanguageSwitcher
└── main.tsx                      # `import '@/lib/i18n'` BEFORE `<App />` render
```

Rationale for `@types/i18next.d.ts` location: the official i18next docs explicitly recommend `"creating a @types directory under src or above it and placing all your type declarations there."` This keeps augmentation discoverable and lets TS pick it up via the existing `include: ["src"]` in `tsconfig.app.json`.

### Pattern 1: Init file (the entire i18n setup in one place)
**What:** Single side-effect module that registers plugins, imports JSON, and calls `i18n.init()` synchronously.
**When to use:** Always, for bundled-resources setups. This file is the only place `i18next` is configured.
**Example:**
```typescript
// src/lib/i18n/index.ts
// Pattern source: https://www.i18next.com/overview/typescript (official)
//                  https://phrase.com/blog/posts/localizing-react-apps-with-i18next/ (verified)
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
    nonExplicitSupportedLngs: true, // 'es-AR', 'es-MX' all match 'es'
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kbv-lang',
      caches: ['localStorage'], // MUST include 'localStorage' or kbv-lang never gets written
    },
    parseMissingKeyHandler: (key, _defaultValue, options) =>
      `${options?.ns ?? 'unknown'}:${key}`,
    returnNull: false,
    react: {
      useSuspense: false, // bundled resources are sync-ready; no Suspense needed
    },
  })

export default i18n
```

### Pattern 2: TypeScript module augmentation for type-safe keys
**What:** Declare-merge into the `i18next` module to give `t()` autocomplete + compile-time key validation.
**When to use:** Always with TypeScript. Cost is one tiny `.d.ts` file; benefit is catching renamed/missing keys at compile time.
**Example:**
```typescript
// src/@types/i18next.d.ts
// Pattern source: https://www.i18next.com/overview/typescript (official, verbatim)
import 'i18next'
import type { defaultNS, resources } from '@/lib/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['en']
    returnNull: false
  }
}
```
Note: augmentation lives on the `'i18next'` package, NOT `'react-i18next'`. react-i18next reads i18next's `CustomTypeOptions` transitively.

### Pattern 3: Document-attribute sync hook
**What:** Tiny hook in `App.tsx` (or `main.tsx`) that mirrors `i18n.resolvedLanguage` → `document.documentElement.lang`. The `htmlTag` detector option **only reads** from `<html lang>`; it does not write back.
**When to use:** Always. This satisfies success criterion 3 (`document.documentElement.lang` matches).
**Example:**
```typescript
// src/hooks/useLocalizeDocumentAttributes.ts
// Pattern source: https://phrase.com/blog/posts/localizing-react-apps-with-i18next/
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useLocalizeDocumentAttributes() {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage
    }
  }, [i18n.resolvedLanguage])
}
```
Call this hook once in `App.tsx`. Use `resolvedLanguage` not `language` — the former is the post-fallback value (`'es'` even if detector returned `'es-AR'`); the latter may include the region tag.

### Pattern 4: LanguageSwitcher component (underline tabs)
**What:** Self-contained component using two `<button>` elements in a `<div role="group" aria-label="...">`. The active language is indicated by `aria-pressed` + a sliding underline. The whole component is mounted inside `AnimationErrorBoundary` by App.tsx.
**When to use:** Phase 2 ships it temporarily fixed top-right; Phase 5's `PillNav` imports the same component.
**Example:**
```tsx
// src/components/i18n/LanguageSwitcher.tsx
// Pattern: button-based switcher with aria-pressed (most common for i18next switchers)
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const LANGS = ['en', 'es'] as const
type Lang = (typeof LANGS)[number]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current = (i18n.resolvedLanguage as Lang | undefined) ?? 'en'

  const handleChange = (lng: Lang) => {
    if (lng === current) return
    void i18n.changeLanguage(lng) // returns Promise<TFunction>; we don't await
  }

  return (
    <div
      role="group"
      aria-label={t('switcher.ariaLabel')}
      className="fixed top-6 right-6 z-50 flex gap-4"
    >
      {LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => handleChange(lng)}
          aria-pressed={lng === current}
          className={clsx(
            'relative text-sm font-medium uppercase tracking-wider',
            'text-white/80 hover:text-white transition-colors',
            'after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px',
            'after:bg-[#FF4500] after:transition-transform after:duration-300',
            lng === current ? 'after:scale-x-100' : 'after:scale-x-0'
          )}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```
Notes:
- `i18n.changeLanguage(lng)` returns a `Promise<TFunction>`. We `void` it because we don't need to await — react-i18next listens to `languageChanged` and re-renders subscribed components automatically.
- Use `i18n.resolvedLanguage`, not `i18n.language`, for the active-state comparison.
- `clsx` is already in deps. The user's "quick text fade" requirement on language swap is handled in Phase 5's animation work; Phase 2's switcher only needs the underline transition.

### Pattern 5: Wiring in App.tsx and main.tsx
**main.tsx (CRITICAL: import order):**
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import '@/lib/i18n' // ← side-effect import; MUST come before App so init runs first
import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**App.tsx (add hook + switcher; existing AnimationErrorBoundary wraps switcher):**
```tsx
import { useTranslation } from 'react-i18next'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useLocalizeDocumentAttributes } from '@/hooks/useLocalizeDocumentAttributes'

export default function App() {
  useLocalizeDocumentAttributes()
  const { t } = useTranslation('hero')

  return (
    <>
      {/* ...existing NoiseOverlay + AnimationRootPlaceholder... */}
      <AnimationErrorBoundary>
        <LanguageSwitcher />
      </AnimationErrorBoundary>
      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <h1>{t('heading.title')}</h1>
        <p>{t('heading.tagline')}</p>
        <button type="button">{t('cta')}</button>
      </main>
    </>
  )
}
```

### Anti-Patterns to Avoid
- **Wrapping `<App />` in `<I18nextProvider>`:** Unnecessary with `initReactI18next`. The plugin pattern wires the default instance globally — adding the provider is dead code.
- **Putting `i18n.init()` inside a component body or `useEffect`:** Causes a flash of untranslated content. Init must run at module load (side-effect import in `main.tsx`).
- **Calling `i18n.changeLanguage()` synchronously and reading `i18n.language` on the next line:** The state update is async. Trust react-i18next's `languageChanged` re-render instead.
- **Using `i18n.language` for active-state UI:** It may carry `es-AR`; `i18n.resolvedLanguage` is the post-fallback canonical value (`es`).
- **Setting `htmlTag: document.documentElement` in detection and assuming it writes back:** The `htmlTag` option **only reads** the existing `<html lang>` as a detection source. You must write `<html lang>` yourself.
- **Forgetting `caches: ['localStorage']` while setting `lookupLocalStorage`:** Without `caches`, the detector reads but never writes — `kbv-lang` stays empty forever and persistence (success criterion 3) silently fails.
- **`enableSelector: true` in v26 with this project:** v26 still has it opt-in by default, deprecation planned for v27. Sticking with string keys `t('section:key.path')` is fully supported, less migration churn now, and the type augmentation gives the same autocomplete.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser locale detection | `navigator.language.startsWith('es')` | `i18next-browser-languagedetector` | Plugin handles 9 detection sources, region matching, cache reading/writing, and edge cases like `zh-Hans-CN` vs `zh`. ~10 LOC vs the user's required browser detect + localStorage cache + multi-source priority |
| Pluralization / interpolation | Custom `{{var}}` regex replace | i18next's `interpolation` (default `{{var}}` on, CSP-safe) | Out of scope here but reserved for later phases (no copy needs plurals yet) |
| Type-safe translation keys | Hand-maintained `type Keys = 'hero.title' \| ...` enum | i18next `CustomTypeOptions` module augmentation | Generated from your JSON `as const`; rename-safe; zero maintenance |
| Re-render on language change | Manual context + listener | react-i18next's `useTranslation` (subscribes to `languageChanged` automatically) | Built-in. `bindI18n: 'languageChanged'` is default |
| Region-tag normalization (`es-AR` → `es`) | Manual `.split('-')[0]` | `nonExplicitSupportedLngs: true` + `i18n.resolvedLanguage` | Handles 3-tier locale variants (e.g. `zh-Hans-CN`) the manual approach botches |
| Missing-key detection during dev | `console.warn` on every `t()` | `parseMissingKeyHandler` returning the key path | Single hook, surfaces in the rendered DOM (user's chosen UX), survives prod build (keys never become silent empty strings) |

**Key insight:** Every "small custom" piece in this domain hides a 3-tier locale edge case (language / language-region / language-script-region). Three production-grade plugins + ~5 lines of config beat 80+ LOC of hand-rolled code that will break on Chinese, Portuguese, or Spanish-Latin-America visitors.

## Common Pitfalls

### Pitfall 1: `htmlTag` doesn't write back
**What goes wrong:** Devs set `detection.htmlTag: document.documentElement` and assume `<html lang>` will update on language change. It doesn't.
**Why it happens:** `htmlTag` is a **detection source** (reads the SSR-rendered `<html lang>` on first load). Writing back is not the plugin's job.
**How to avoid:** Use a `useLocalizeDocumentAttributes` hook (see Pattern 3) that sets `document.documentElement.lang = i18n.resolvedLanguage` in a `useEffect`.
**Warning signs:** Success criterion 3 fails: localStorage persists but `<html lang>` stays `"en"` (or whatever Vite's `index.html` ships with).

### Pitfall 2: Forgot `caches: ['localStorage']` — `kbv-lang` never persists
**What goes wrong:** Devs set `lookupLocalStorage: 'kbv-lang'` and stop. The detector READS from `kbv-lang` but writes nowhere. Switching language never persists; reload reverts.
**Why it happens:** The detector has independent read keys (`lookupLocalStorage`) and write targets (`caches` array). Documentation lists them in separate paragraphs.
**How to avoid:** Always pair `lookupLocalStorage: 'kbv-lang'` with `caches: ['localStorage']`. Default `caches` is `['localStorage', 'cookie']` — explicit `['localStorage']` is cleaner since we don't want cookies.
**Warning signs:** DevTools → Application → Local Storage shows no `kbv-lang` key after clicking ES.

### Pitfall 3: Init runs after first render → flash of `hero:heading.title` in the DOM
**What goes wrong:** `<App />` renders before `i18n.init()` completes, `useTranslation` returns missing-key strings, your missing-key handler dumps `hero:heading.title` into the visible UI for one frame.
**Why it happens:** `init()` is technically async (`initAsync: true` default), but with bundled resources it resolves in the same tick. The risk is import order: if `App.tsx` imports `@/lib/i18n` lazily or after a hook subscribes, the race opens.
**How to avoid:** Side-effect import `import '@/lib/i18n'` in `main.tsx` **above** `import App`. With bundled resources `useSuspense: false` is safe — translations resolve synchronously. Document this with a code comment on the import line.
**Warning signs:** A visible flicker on hard reload showing key paths instead of strings.

### Pitfall 4: `verbatimModuleSyntax` + type-only imports from react-i18next
**What goes wrong:** `import { TFunction } from 'react-i18next'` errors with `'TFunction' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`
**Why it happens:** Project's `tsconfig.app.json` has `verbatimModuleSyntax: true`. ESLint's `no-unused-vars` and TS both enforce this.
**How to avoid:** Always `import type { TFunction, FallbackProps } from 'react-i18next'` when importing types. Mixed imports: `import { useTranslation, type TFunction } from 'react-i18next'`.
**Warning signs:** `tsc --noEmit` fails with TS1484 / TS1361.

### Pitfall 5: Calling `i18n.changeLanguage()` without `void` or `await` lints as floating promise
**What goes wrong:** ESLint `@typescript-eslint/no-floating-promises` flags `i18n.changeLanguage('es')`.
**Why it happens:** `changeLanguage` returns `Promise<TFunction>`; ignoring promises is a lint error in strict configs.
**How to avoid:** `void i18n.changeLanguage('es')` — communicates intent (fire-and-forget; react-i18next will re-render on `languageChanged`). Don't `await` inside an event handler unless you need the resolved `t`.
**Warning signs:** Lint output: `Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored.`

### Pitfall 6: `resources` not declared `as const` → augmentation loses literal types
**What goes wrong:** Type augmentation works but `t('hero:heading.title')` returns `string` with no key autocomplete and no rename-safety.
**Why it happens:** Without `as const`, TS widens the JSON `typeof` to generic `{ [k: string]: string }`, defeating CustomTypeOptions.
**How to avoid:** Mark the `resources` constant `as const`. Also mark `defaultNS = 'common' as const`.
**Warning signs:** Hover on `t` shows `(key: string) => string` instead of the union of valid keys.

### Pitfall 7: Putting `LanguageSwitcher` ABOVE `<AnimationErrorBoundary>` in App.tsx
**What goes wrong:** Switcher animation throws → unbounded — bubbles to React root → blanks the page.
**Why it happens:** User decision in CONTEXT.md: anything with a transition is wrapped in `AnimationErrorBoundary`.
**How to avoid:** In `App.tsx`, render `<AnimationErrorBoundary><LanguageSwitcher /></AnimationErrorBoundary>`. The boundary catches the underline animation and any future text-fade.
**Warning signs:** Phase 1 verification doc explicitly notes this policy.

### Pitfall 8: `returnNull: true` (default in v23) breaks types-as-strings
**What goes wrong:** `t('missing')` could return `null` instead of a string, so JSX `{t('x')}` becomes `string | null` — breaks downstream components expecting string.
**Why it happens:** Pre-v24 default was `returnNull: true`. v26 default is `false`, but we set it explicitly in CustomTypeOptions AND init() for both belt and braces.
**How to avoid:** `returnNull: false` in both `i18n.init({...})` and `CustomTypeOptions`. We have user-decided missing-key fallback (key path string) so `null` shouldn't occur anyway.
**Warning signs:** TS errors at JSX usage points: `Type 'string | null' is not assignable to type 'string'.`

## Code Examples

### Common Operation 1: Translating with a namespace
```tsx
// Source: https://react.i18next.com/latest/usetranslation-hook (official)
import { useTranslation } from 'react-i18next'

function Hero() {
  const { t } = useTranslation('hero')
  return (
    <>
      <h1>{t('heading.title')}</h1>
      <p>{t('heading.tagline')}</p>
      <button>{t('cta')}</button>
    </>
  )
}
```

### Common Operation 2: Translating across namespaces in one component
```tsx
// Source: https://react.i18next.com/latest/usetranslation-hook (official)
import { useTranslation } from 'react-i18next'

function HeroCTA() {
  const { t } = useTranslation(['hero', 'common'])
  return (
    <button type="button" aria-label={t('common:cta.viewWorkAria')}>
      {t('hero:cta')}
    </button>
  )
}
```

### Common Operation 3: Listening to language change in a non-React module
```typescript
// Source: https://www.i18next.com/overview/api (official)
import i18n from '@/lib/i18n'

i18n.on('languageChanged', (lng: string) => {
  // analytics, logging, etc.
  console.info('[i18n] language changed to', lng)
})
```

### Common Operation 4: Interpolation with the user's chosen `{{var}}`
```typescript
// JSON
// { "greeting": "Hello {{name}}" }

const { t } = useTranslation('common')
t('greeting', { name: 'Kelly' }) // "Hello Kelly"
```
`escapeValue: false` in `interpolation` config — React already escapes JSX text content; double-escaping mangles characters like `&`.

### Common Operation 5: Placeholder JSON shape (proves the system end-to-end for the Phase 2 demo)
```json
// src/locales/en/hero.json
{
  "heading": {
    "title": "Kelly Battistoni",
    "tagline": "Automation engineer turning ops chaos into reliable workflows."
  },
  "cta": "View selected work"
}
```
```json
// src/locales/es/hero.json
{
  "heading": {
    "title": "Kelly Battistoni",
    "tagline": "Ingeniera de automatización que convierte el caos operativo en flujos confiables."
  },
  "cta": "Ver proyectos seleccionados"
}
```
```json
// src/locales/en/common.json (minimum keys to make the switcher work)
{
  "switcher": {
    "ariaLabel": "Select language"
  },
  "meta": {
    "title": "",
    "description": ""
  }
}
```
```json
// src/locales/es/common.json
{
  "switcher": {
    "ariaLabel": "Selecciona idioma"
  },
  "meta": {
    "title": "",
    "description": ""
  }
}
```
For `about.json`, `stack.json`, `projects.json`, `contact.json` — ship them with a single placeholder key each (e.g. `{ "_placeholder": "TODO Phase 3" }`) so the namespace exists, types are generated, and verification can confirm all 12 files load. Phase 3+ fills these.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `i18next.use(initReactI18next).init({ interpolation: { format: ... } })` | `i18next.services.formatter.add(name, fn)` Formatter API | i18next v26 | The monolithic format function on `interpolation` is removed. We don't use custom formatters in Phase 2, but worth noting for future date/number formatting |
| `initImmediate` option | `initAsync` option | i18next v26 | Pure rename; default still `true`. No action needed |
| String-key `t('hero.title')` only | Selector API `t($ => $.hero.title)` opt-in via `enableSelector: true` | i18next v25.4 (opt-in) → v26 (still opt-in default-off) → v27 (default-on) → v28 (string keys deprecated, planned) | String keys still fully supported through v26. Decision for this project: stick with strings + module augmentation. Migration codemod exists if we revisit |
| Manual TypeScript wrappers (`type TKey = ...`) | `CustomTypeOptions` module augmentation | i18next v23 | Type generation comes from your JSON `as const` — zero hand-maintenance |
| `returnNull: true` (default) | `returnNull: false` (default since v24) | i18next v24 | v26 keeps `false` as default. Set explicitly in both `init()` and `CustomTypeOptions` for clarity |

**Deprecated/outdated:**
- `interpolation.format` monolithic function — removed in v26
- `i18nextLng` as the only convention for the localStorage key — the user's `kbv-lang` is fully supported via `lookupLocalStorage`
- Wrapping the React tree in `<I18nextProvider>` for the default instance — `initReactI18next` plugin pattern is the documented default

## Open Questions

1. **Should the projects/about/stack/contact JSON files ship with placeholder strings or just stub keys for Phase 2?**
   - What we know: User wants "human-readable placeholder strings (not empty strings, not key names as values) so the system is visually verifiable" — but the only place currently rendered is the hero. The other namespaces have no UI yet (sections come in Phase 3+).
   - What's unclear: Does "visually verifiable" extend to namespaces that aren't yet rendered?
   - Recommendation: Phase 2 demo renders only hero strings. For the other 5 namespaces, ship a single `{ "_placeholder": "TODO Phase 3 (EN)" }` / `{ "_placeholder": "TODO Phase 3 (ES)" }` key. This: (a) proves namespace loading, (b) gives `CustomTypeOptions` something to augment, (c) makes Phase 3+ flag any forgotten copy via the missing-key fallback. Confirm with planner.

2. **`AnimationErrorBoundary` wraps the LanguageSwitcher in Phase 2 — but in Phase 5 the switcher moves into `PillNav`. Where does the boundary live there?**
   - What we know: Phase 5 is out of scope for this phase. Phase 1 policy says anything with transition gets bounded.
   - What's unclear: Whether the boundary moves with the switcher or stays at App.tsx.
   - Recommendation: Out of scope for Phase 2; document the boundary placement clearly so Phase 5 inherits the pattern. Phase 2 plan should NOT bake assumptions about Phase 5 nav structure.

3. **Do we need a Suspense boundary anywhere in `App.tsx`?**
   - What we know: Phrase docs confirm bundled resources skip Suspense automatically even with `useSuspense: true`. Setting `useSuspense: false` makes it explicit and avoids any edge.
   - What's unclear: Future phases may add lazy section loading. If sections are code-split, a Suspense boundary at the page level may be wanted then.
   - Recommendation: Phase 2 sets `useSuspense: false`. Reassess in Phase 5/6 when nav + sections wire up.

## Sources

### Primary (HIGH confidence)
- npm registry — `npm view <pkg> version` and `peerDependencies` (verified 2026-06-09): `react-i18next@17.0.8`, `i18next@26.3.1`, `i18next-browser-languagedetector@8.2.1`. Peers: `react-i18next` requires `i18next >= 26.2.0`, `react >= 16.8.0`, `typescript ^5 || ^6` — all satisfied by this project.
- https://www.i18next.com/overview/typescript — module augmentation pattern (`CustomTypeOptions`, `defaultNS`, `resources`, `returnNull: false`), `@types/i18next.d.ts` location recommendation, `enableSelector` status (opt-in default-off in v26, default-on planned v27, string-key deprecation planned v28).
- https://www.i18next.com/overview/configuration-options — verbatim defaults: `supportedLngs: false`, `fallbackLng: 'dev'`, `ns: 'translation'`, `defaultNS: 'translation'`, `keySeparator: '.'`, `nsSeparator: ':'`, `parseMissingKeyHandler: noop`, `returnNull: false`, `returnEmptyString: true`, `nonExplicitSupportedLngs` behavior (variants like `es-AR` qualify when `es` is in `supportedLngs`).
- https://www.i18next.com/overview/api — `i18n.on('languageChanged', (lng) => void)`, `i18n.changeLanguage(lng)` returns Promise, `i18n.language` vs `i18n.resolvedLanguage` semantics.
- https://www.i18next.com/misc/migration-guide — v26 breaking changes: removed `interpolation.format` monolith, `initImmediate` → `initAsync`. No TypeScript breaking changes in v26.
- https://github.com/i18next/i18next-browser-languageDetector — detector option defaults: `order: ['querystring','hash','cookie','localStorage','sessionStorage','navigator','htmlTag','path','subdomain']`, `lookupLocalStorage: 'i18nextLng'`, `caches: ['localStorage','cookie']`, `htmlTag: document.documentElement` (reads from `<html lang>`, does not write).
- https://react.i18next.com/latest/i18next-instance — react options defaults: `useSuspense: true`, `bindI18n: 'languageChanged'`, `transSupportBasicHtmlNodes: true`, `transKeepBasicHtmlNodesFor: ['br','strong','i','p']`.
- https://react.i18next.com/latest/usetranslation-hook — `keyPrefix` option, `ready` flag (only relevant when `useSuspense: false`), namespace array form.
- https://www.typescriptlang.org/tsconfig/moduleResolution.html — `resolveJsonModule` defaults to `true` under `moduleResolution: bundler` (confirms JSON imports work without explicit tsconfig change).

### Secondary (MEDIUM confidence)
- https://phrase.com/blog/posts/localizing-react-apps-with-i18next/ — production pattern for `useLocalizeDocumentAttributes` hook using `i18n.resolvedLanguage`. Cross-verified against i18next API docs which confirm `resolvedLanguage` is the recommended property for "primary used language, for example in a language switcher."
- https://www.locize.com/blog/i18next-typescript-selector-api/ — selector API roadmap. Cross-verified against official `i18next.com/overview/typescript` for the v26-vs-v27 timeline.

### Tertiary (LOW confidence)
- https://www.ducxinh.com/en/techblog/fix-i18next-not-persisting-language-after-page-reload-in-react — one user's report of LanguageDetector caching being unreliable. Treated as anecdotal; the official detector's `caches: ['localStorage']` works correctly in practice. Listed here only because the workaround (manual `localStorage.getItem` + `lng` option) is sometimes proposed online — we are NOT adopting it; we rely on the plugin's documented behavior.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all three packages verified via live npm registry on 2026-06-09; peer deps explicitly checked; the trio is the documented default on i18next's own docs.
- Architecture (init file, module augmentation, namespace structure): HIGH — patterns lifted verbatim from official typescript.md and configuration-options.md; user's CONTEXT.md decisions fit the standard shape with zero friction.
- Switcher component: MEDIUM — `aria-pressed` + button group is the consensus pattern but not formally documented by react-i18next itself (i18next is locale-engine-only). Adobe React Aria's ToggleButton or radio-fieldset alternatives exist; the button approach was chosen for visual flexibility (sliding underline doesn't map cleanly to radios).
- Pitfalls: HIGH for #1, #2, #3, #5, #6, #8 (verified against official docs); HIGH for #4 (`verbatimModuleSyntax`, directly observable in this project's tsconfig); HIGH for #7 (Phase 1 verification doc).
- State of the art: HIGH — migration guide and TypeScript doc explicitly state v26 changes and selector roadmap.

**Research date:** 2026-06-09
**Valid until:** 2026-07-09 (i18next moves at moderate pace; v27 not expected within 30 days based on the v26 migration guide's "tentative plans" wording for selector default flip)
