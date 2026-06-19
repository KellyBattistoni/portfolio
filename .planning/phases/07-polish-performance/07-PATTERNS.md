# Phase 7: Polish & Performance - Pattern Map

**Mapped:** 2026-06-16
**Files analyzed:** 11 new/modified files
**Analogs found:** 11 / 11 (100% coverage)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/hooks/useMetaTags.ts` | hook | request-response (DOM side-effects) | `src/hooks/useLocalizeDocumentAttributes.ts` | exact |
| `src/locales/en/common.json` | config | static | `src/locales/en/common.json` (existing structure) | exact |
| `src/locales/es/common.json` | config | static | `src/locales/es/common.json` (existing structure) | exact |
| `src/components/plasma/HeroBackdrop.tsx` | component | event-driven (scroll-lifecycle) | `src/components/plasma/HeroBackdrop.tsx` (self-analog) | exact |
| `src/components/hero/Hero.tsx` | component | request-response (animation) | `src/components/hero/Hero.tsx` (self-analog) | exact |
| `index.html` | config | static | `index.html` (self-analog) | exact |
| `src/styles/index.css` | utility | static | `src/styles/index.css` (self-analog) | exact |
| `src/components/sections/Stack.tsx` | component | request-response (style) | `src/components/sections/Stack.tsx` (self-analog) | exact |
| `src/components/sections/About.tsx` | component | request-response (style) | `src/components/sections/About.tsx` (self-analog) | exact |
| `src/components/sections/Contact.tsx` | component | request-response (style) | `src/components/sections/Contact.tsx` (self-analog) | exact |
| `public/og-image.png` | artifact | static | N/A (user-generated) | N/A |

---

## Pattern Assignments

### `src/hooks/useMetaTags.ts` (hook, request-response)

**Analog:** `src/hooks/useLocalizeDocumentAttributes.ts`

**Pattern Summary:** A simple useEffect hook that reacts to language changes and updates DOM attributes. This is the exact pattern to follow for the new `useMetaTags` hook.

**Import pattern** (lines 1-2):
```typescript
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
```

**Hook signature and pattern** (lines 4-24):
```typescript
/**
 * Syncs document.documentElement.lang to i18n.resolvedLanguage on mount
 * and whenever the active language changes.
 */
export function useLocalizeDocumentAttributes(): void {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage
    }
  }, [i18n.resolvedLanguage])
}
```

**For useMetaTags:** Follow this exact structure but update `document.title` and `document.querySelector('meta[name="description"]')` instead of `document.documentElement.lang`. Use dependency array `[i18n.resolvedLanguage, t]` to capture both language AND translated values.

---

### `src/locales/en/common.json` and `src/locales/es/common.json` (config, static)

**Analog:** Existing `src/locales/en/common.json` structure (verified in RESEARCH.md)

**Current structure** (lines 1-18 of en/common.json):
```json
{
  "switcher": {
    "ariaLabel": "Select language",
    "en": "EN",
    "es": "ES"
  },
  "meta": {
    "title": "",
    "description": ""
  },
  "nav": {
    "ariaLabel": "Primary navigation",
    "about": "About",
    "work": "Projects",
    "stack": "Stack",
    "contact": "Contact"
  }
}
```

**Pattern:** The `"meta"` namespace already exists with empty strings. Simply populate `meta.title` and `meta.description` with the values from RESEARCH.md Meta Copy Drafts section. ES file follows identical structure.

**EN values to insert** (from RESEARCH.md § Meta Copy Drafts):
```json
"meta": {
  "title": "Kelly Battistoni — AI Automations Manager & Systems Thinker",
  "description": "AI Automations Manager building end-to-end workflow strategies across Make.com, n8n, Claude, and Supabase for global clients. Systems thinker. Business-first."
}
```

**ES values to insert** (from RESEARCH.md § Meta Copy Drafts):
```json
"meta": {
  "title": "Kelly Battistoni — Gerente de Automatizaciones IA",
  "description": "Gerente de automatizaciones IA con visión de sistemas. Construyo estrategias de automatización de extremo a extremo para clientes globales con Make.com, n8n y Claude."
}
```

---

### `src/components/plasma/HeroBackdrop.tsx` (component, event-driven)

**Analog:** Self-analog — existing file requires ONE addition

**Current export pattern** (lines 13, 77):
```typescript
export function HeroBackdrop({ heroRef }: HeroBackdropProps) {
  // ... component body ...
}
```

**Add at end of file** (line 77, after closing brace):
```typescript
export default HeroBackdrop
```

**Reason:** `React.lazy()` requires a default export. The named export `export function HeroBackdrop` can remain for any other consumers; adding the default export enables the lazy-load pattern in Hero.tsx.

---

### `src/components/hero/Hero.tsx` (component, request-response)

**Analog:** Self-analog — existing file requires TWO modifications

**Current imports** (lines 31-37):
```typescript
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'
import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'
```

**Change 1: Replace eager import with lazy import** (update line 37 and add new lines):
```typescript
// REMOVE: import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'

// ADD these lines after the AnimationErrorBoundary import:
import { lazy, Suspense } from 'react'
import { PlasmaFallback } from '@/components/plasma/PlasmaFallback'

const HeroBackdrop = lazy(() => import('@/components/plasma/HeroBackdrop'))
```

**Change 2: Wrap HeroBackdrop with Suspense** (around line 159-161):
```typescript
// CURRENT (lines 159-161):
<AnimationErrorBoundary>
  <HeroBackdrop heroRef={sectionRef} />
</AnimationErrorBoundary>

// CHANGE TO:
<AnimationErrorBoundary>
  <Suspense fallback={<PlasmaFallback />}>
    <HeroBackdrop heroRef={sectionRef} />
  </Suspense>
</AnimationErrorBoundary>
```

**Reason:** Suspense inside AnimationErrorBoundary ensures that if the async chunk fails to load (network error), the error boundary catches it. PlasmaFallback is already a pure CSS component with no WebGL imports — safe to use as fallback.

---

### `index.html` (config, static)

**Analog:** Self-analog — existing file requires THREE additions

**Current state** (lines 86-102 of RESEARCH.md):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Kelly Battistoni — AI Automations Manager & Systems Thinker" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="..." rel="stylesheet" />
    <title>Kelly Battistoni — Portfolio</title>
  </head>
```

**Addition 1: Open Graph meta tags** (insert after line 7, the existing `<meta name="description">`):
```html
<!-- Open Graph — static, crawler-readable -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://kellybattistoni.github.io/" />
<meta property="og:title" content="Kelly Battistoni — AI Automations Manager & Systems Thinker" />
<meta property="og:description" content="Systems thinker and full-stack AI automations manager building end-to-end automation strategies across Make.com, n8n, Claude, and Supabase." />
<meta property="og:image" content="https://kellybattistoni.github.io/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

**Addition 2: hreflang links** (insert after OG tags):
```html
<!-- hreflang — D-05: both language variants share one URL (SPA) -->
<link rel="alternate" hreflang="en" href="https://kellybattistoni.github.io/" />
<link rel="alternate" hreflang="es" href="https://kellybattistoni.github.io/" />
<link rel="alternate" hreflang="x-default" href="https://kellybattistoni.github.io/" />
```

**Note:** `&display=swap` is already present in the Google Fonts `href` (RESEARCH.md confirmed this) — no change needed to the fonts link.

---

### `src/styles/index.css` (utility, static)

**Analog:** Self-analog — existing file requires ONE addition

**Current end state** (lines 46-50 of read output):
```css
/* Panel starts off-screen before GSAP runs. After mm.revert() GSAP
   removes its inline transform and this class restores the hidden state. */
.mobile-nav-panel {
  transform: translateX(100%);
}
```

**Add after the .mobile-nav-panel rule** (new lines after line 48):
```css
/* D-12: Brand focus ring — visible on #050505 background */
:focus-visible {
  outline: 2px solid #FF4500;
  outline-offset: 2px;
}
```

**Why:** This single rule covers all 46 interactive elements (nav anchors, buttons, links, radio buttons) without per-component changes. `:focus-visible` (not `:focus`) only shows on keyboard navigation, matching D-12 spec and WCAG 2.4.7.

---

### `src/components/sections/Stack.tsx` (component, request-response)

**Analog:** Self-analog — existing file requires ONE contrast fix

**Current color value** (line 54):
```css
.stack-tile {
  ...
  color: rgba(255,255,255,0.4);
  ...
}
```

**Change to:**
```css
color: rgba(255,255,255,0.6);
```

**Also in same component** (line 26):
```css
.band-lbl {
  ...
  color: rgba(255,255,255,0.38);
  ...
}
```

**Change to:**
```css
color: rgba(255,255,255,0.55);
```

**Reason:** WCAG AA requires 4.5:1 contrast on readable text. The minimum white alpha on `#050505` is 0.46 for 4.5:1; using 0.55–0.60 provides comfortable margin. Stack tile names (0.4 → 0.6) and band labels (0.38 → 0.55) both currently fail AA. These changes fix the issue.

---

### `src/components/sections/About.tsx` (component, request-response)

**Analog:** Self-analog — existing file requires THREE contrast fixes

**Search for these inline styles or CSS constants in the component and update:**

**Fix 1: Arc past-node description text**
- Find: `rgba(255,255,255,0.35)` (used in arc node descriptions)
- Change to: `rgba(255,255,255,0.55)`

**Fix 2: Stats labels (Continents/Automations/Years)**
- Find: `rgba(255,255,255,0.30)` (used on stat numbers or labels)
- Change to: `rgba(255,255,255,0.55)`

**Fix 3: Arc past-node role text**
- Current: `rgba(255,255,255,0.6)` (already at 7.39:1, PASSES AA)
- No change needed

**Note:** Do NOT change `opacity: 0.6` on the arc node container wrapper — that opacity applies to the entire node (dot + text). Instead, fix the text color directly. The current opacity is correct for visual hierarchy; the text colors inside the nodes need adjustment.

**Reason:** All three values currently fail AA (< 4.5:1). Raising to 0.55 achieves 6.71:1 contrast while preserving the muted aesthetic.

---

### `src/components/sections/Contact.tsx` (component, request-response)

**Analog:** Self-analog — existing file requires THREE contrast fixes

**Search for these inline styles or CSS in the component and update:**

**Fix 1: Contact method labels (.contact-method-lbl)**
- Find: `color: rgba(255,255,255,0.38);` (line 26)
- Change to: `color: rgba(255,255,255,0.55);`

**Fix 2: CV language button inactive state (.cv-lang-btn)**
- Find: `color: rgba(255,255,255,0.45);` (line 81)
- Change to: `color: rgba(255,255,255,0.55);`

**Fix 3: "Open to" / "Let's talk" supplemental text**
- Find any `rgba(255,255,255,0.38)` used for secondary paragraph text
- Change to: `rgba(255,255,255,0.55);`

**Reason:** All three values currently fail AA (< 4.5:1). Contact method labels (0.38 → 0.55) and CV button inactive state (0.45 → 0.55) need raising. The 0.55 value achieves 6.71:1 contrast and applies consistently across all components.

---

## Shared Patterns

### Pattern 1: useMetaTags Hook Structure

**File to create:** `src/hooks/useMetaTags.ts`

**Apply to:** Wire into `App.tsx` at the top level alongside `useLocalizeDocumentAttributes()`.

**Template** (from RESEARCH.md § Architecture Patterns):
```typescript
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

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
```

**Wire in App.tsx** (add one line after line 16):
```typescript
export default function App() {
  useLocalizeDocumentAttributes()
  useMetaTags()  // ADD THIS LINE
  const { isMobile } = useDeviceCapabilities()
  // ...
}
```

---

### Pattern 2: Global Focus Ring

**File to modify:** `src/styles/index.css`

**Apply to:** Global layer — covers all interactive elements without per-component changes.

**CSS rule** (add to base/utilities section):
```css
:focus-visible {
  outline: 2px solid #FF4500;
  outline-offset: 2px;
}
```

**Coverage:** All 46 interactive elements—Hero CTA, PillNav anchors, LanguageSwitcher buttons, MobileNav hamburger and anchors, Stack tile links, Contact email/LinkedIn/CV links, and CV language radio buttons.

---

### Pattern 3: React.lazy() + Suspense for Code Splitting

**File to modify:** `src/components/hero/Hero.tsx` and `src/components/plasma/HeroBackdrop.tsx`

**Pattern:**
1. Add default export to the target component (HeroBackdrop.tsx)
2. In parent component, replace eager import with lazy import
3. Wrap component with `<Suspense>` boundary inside the error boundary

**Template:**
```typescript
// Step 1: In HeroBackdrop.tsx
export default HeroBackdrop

// Step 2: In Hero.tsx imports
import { lazy, Suspense } from 'react'
const HeroBackdrop = lazy(() => import('@/components/plasma/HeroBackdrop'))

// Step 3: In JSX
<AnimationErrorBoundary>
  <Suspense fallback={<PlasmaFallback />}>
    <HeroBackdrop heroRef={sectionRef} />
  </Suspense>
</AnimationErrorBoundary>
```

---

### Pattern 4: Contrast Fixes (WCAG AA)

**Apply to:** `Stack.tsx`, `About.tsx`, `Contact.tsx`

**Standard fix:** Raise `rgba(255,255,255, α)` values to minimum 0.55 (achieves 6.71:1 on `#050505`).

**Target values to find and replace:**
- `rgba(255,255,255,0.30)` → `rgba(255,255,255,0.55)`
- `rgba(255,255,255,0.35)` → `rgba(255,255,255,0.55)`
- `rgba(255,255,255,0.38)` → `rgba(255,255,255,0.55)`
- `rgba(255,255,255,0.40)` → `rgba(255,255,255,0.60)`
- `rgba(255,255,255,0.45)` → `rgba(255,255,255,0.55)`

**DO NOT change:**
- `rgba(255,255,255,0.60)` and above (already passing AA)
- `opacity` properties on containers (only fix text color directly)

---

## No Analog Found

All files have exact or self-analogs. No files lack reference patterns.

---

## Metadata

**Analog search scope:** 
- Hooks: `src/hooks/`
- Components: `src/components/`
- Styles: `src/styles/`
- Config: `index.html`, `src/locales/`

**Files scanned:** 25+ (all major categories)

**Pattern extraction date:** 2026-06-16

**Confidence:**
- Hook pattern (useMetaTags): HIGH — exact analog exists in useLocalizeDocumentAttributes
- Lazy-load pattern (React.lazy): HIGH — RESEARCH.md provides exact code template
- Focus ring CSS: HIGH — one-line addition to existing index.css
- Contrast fixes: HIGH — all values verified in RESEARCH.md contrast audit
- Meta copy: HIGH — drafts provided in RESEARCH.md Meta Copy Drafts section
- OG tags: HIGH — HTML template provided in RESEARCH.md

---

**Pattern mapping complete. Ready for planning.**
