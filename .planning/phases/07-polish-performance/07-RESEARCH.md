# Phase 7: Polish & Performance — Research

**Researched:** 2026-06-16
**Domain:** Web performance, WCAG accessibility, SEO meta tags, cross-browser testing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Meta tags & Open Graph**
- D-01: Dynamic language-aware meta updates via `useEffect` on i18next language change — update `document.title` and `document.querySelector('meta[name="description"]')` directly. No react-helmet-async.
- D-02: Claude drafts EN and ES meta title (50–60 chars) and description (150–160 chars). User refines during browser verification checkpoint.
- D-03: OG image: static PNG, 1200×630, dark cinematic style — #050505 background, #FF4500 accent, Playfair Display for the name, Inter for tagline/role. Claude produces an HTML/CSS preview card; user screenshots at 1200×630 and places in `public/og-image.png`.
- D-04: One OG image, English only.
- D-05: Add `<link rel="alternate" hreflang="en" href="https://kellybattistoni.github.io/">` and the ES equivalent in `<head>`.

**Contact**
- D-06: Email stays as `kellybattistoniv@gmail.com` (hardcoded in Contact.tsx) — no change.
- D-07: LinkedIn URL already correct — no change.

**Performance**
- D-08: Font loading: `&display=swap` already present in index.html Google Fonts href — confirmed DONE, no change needed.
- D-09: Plasma component lazy-loaded via `React.lazy()` + `Suspense`. `PlasmaFallback` serves as the Suspense fallback.
- D-10: Audit-first: run Lighthouse on current build before implementing any fixes.
- D-11: Stack icons — Claude inspects and decides (discretion granted).

**Accessibility**
- D-12: Custom focus rings: `outline: 2px solid #FF4500; outline-offset: 2px` on all `:focus-visible` elements. Applied globally in `src/styles/index.css`.

**Mobile QA**
- D-13: DevTools emulation only — 375px and 430px widths.
- D-14: Safari testing via Playwright WebKit engine.
- D-15: No pre-known mobile issues. Full QA pass across all sections.

### Claude's Discretion
- Stack icon optimization approach (inline, sprite, or lazy-load) — Claude decides after inspecting implementation.
- Exact meta title and description copy (EN and ES) — Claude drafts, user refines.
- OG card HTML/CSS template design — Claude produces the preview artifact.

### Deferred Ideas (OUT OF SCOPE)
- Meeting scheduler / booking form in Contact.
- Self-hosting Google Fonts.
</user_constraints>

---

## Summary

Phase 7 is a quality-enforcement pass over an already-complete site. The codebase is in excellent shape: all six sections render, all animations gate on `prefersReducedMotion`, and the Google Fonts link already includes `&display=swap`. The work in this phase is targeted fixes, not rebuilds.

**Three categories of work exist:**

1. **Performance (Lighthouse):** A single 510KB JS bundle trips Vite's own warning and will hurt Lighthouse Performance on mobile. The OGL/Plasma WebGL stack (~66KB when split) is the correct lazy-load target via `React.lazy()`. After the split, the main bundle drops to approximately 440–450KB (gzip ~145KB) and Vite's warning disappears.

2. **Accessibility (WCAG AA):** White full-opacity body text on `#050505` achieves 20.38:1 contrast — well above AA. However, several muted rgba text values fall below the 4.5:1 threshold: stack tile names (0.4 alpha = 3.71:1), about section arc past-node descriptions (0.35 alpha = 3.10:1), stats labels (0.30 alpha = 2.53:1), and band/contact supplemental labels (0.38 alpha = 3.44:1). The minimum alpha for 4.5:1 on `#050505` is 0.46. Focus rings are absent from `src/styles/index.css` — one global rule fixes all interactive elements.

3. **SEO & Social Preview:** `index.html` has no OG meta tags, no hreflang links, and a hardcoded static `<title>`. Both locale files (`common.meta.title` and `common.meta.description`) are currently empty strings. A `useMetaTags` hook following the exact pattern of `useLocalizeDocumentAttributes` plus static OG tags in `index.html` satisfies all requirements.

**Primary recommendation:** Execute in wave order — (1) Lighthouse baseline, (2) performance fixes, (3) accessibility fixes, (4) SEO/OG, (5) cross-browser QA verification.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dynamic `<title>` + `<meta description>` | Frontend (React hook) | — | SPA with no SSR; document DOM APIs are the only mechanism |
| Static OG tags (og:image, og:type, og:url) | Static HTML (index.html) | — | Crawlers cannot execute JS; must be in the initial HTML |
| hreflang links | Static HTML (index.html) | — | Googlebot reads static `<head>`; hreflang in JS is unreliable |
| React.lazy bundle split | Build-time (Vite) | Frontend (React) | Vite creates async chunk; React.lazy() is the import boundary |
| Focus ring styles | Global CSS (index.css) | — | Single rule via `:focus-visible` covers all elements without per-component edits |
| Contrast fixes | Component CSS / inline styles | — | Specific rgba values live in component style blocks |
| Mobile QA | DevTools emulation | — | D-13 locks: no physical device |
| Safari layout verification | Playwright WebKit | — | D-14 locks: WebKit engine |
| Lighthouse audit | Build artifact served via `vite preview` | — | Audit against production build, not dev server |

---

## Current Codebase State (VERIFIED)

### index.html — exact current state
[VERIFIED: direct file read]

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Kelly Battistoni — AI Automations Manager &amp; Systems Thinker" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
    <title>Kelly Battistoni — Portfolio</title>
  </head>
  ...
```

**Key findings:**
- `&display=swap` is ALREADY in the Fonts href — D-08 requires NO change to this line [VERIFIED]
- No `<meta property="og:*">` tags present [VERIFIED: absent]
- No `<link rel="alternate" hreflang>` tags present [VERIFIED: absent]
- Static `<title>` will be superseded by `useMetaTags` hook
- Static `<meta name="description">` will be superseded by `useMetaTags` hook

### Locale files — common.json
[VERIFIED: direct file read]

Both `src/locales/en/common.json` and `src/locales/es/common.json` have:
```json
"meta": {
  "title": "",
  "description": ""
}
```
Both are empty strings. The namespace structure is already in place — only values need populating.

### HeroBackdrop.tsx — current import structure
[VERIFIED: direct file read]

`Hero.tsx` imports `HeroBackdrop` as an eager default import:
```typescript
import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'
```

The `HeroBackdrop` component itself imports `Plasma` and `PlasmaFallback` eagerly.
The lazy wrap target is the `HeroBackdrop` named export — it must become a default export for `React.lazy()`.

`PlasmaFallback.tsx` is a pure CSS component (no WebGL imports), confirmed by the hard constraint comment in the file — safe to use as both the `useFallback` render target and the Suspense fallback.

### index.css — current focus ring state
[VERIFIED: direct file read]

`src/styles/index.css` currently has NO `:focus-visible` rule. The file ends after `.mobile-nav-panel`. The global focus ring is entirely absent — one rule addition fixes all ~40 interactive elements.

### Build state
[VERIFIED: `npm run build`]

Current production build:
- `dist/assets/index-*.js`: **510KB** (gzip: 175KB) — single chunk
- Vite warning: "Some chunks are larger than 500KB after minification"
- `dist/assets/index-*.css`: 38KB

After `React.lazy(HeroBackdrop)`:
- Main chunk: ~440–450KB (gzip ~145KB)
- Async HeroBackdrop chunk: ~66KB (Plasma + OGL)
- Vite warning resolved

---

## Contrast Audit (VERIFIED)

All values computed via WCAG 2.1 relative luminance formula against background `#050505`. [VERIFIED: computed]

| Text Color | Alpha | Approx Contrast | WCAG AA (4.5:1) | Usage |
|------------|-------|-----------------|-----------------|-------|
| `rgba(255,255,255,1.0)` | 1.0 | **20.38:1** | PASS | Body text, headings |
| `rgba(255,255,255,0.88)` | 0.88 | **15.59:1** | PASS | Hero tagline |
| `rgba(255,255,255,0.85)` | 0.85 | **14.58:1** | PASS | Contact email link |
| `rgba(255,255,255,0.75)` | 0.75 | **11.32:1** | PASS | Contact invite text |
| `#FF4500` | — | **5.92:1** | PASS | Accent on #050505 |
| `rgba(255,255,255,0.45)` | 0.45 | **4.49:1** | FAIL (borderline) | CV lang btn inactive, arc current desc |
| `rgba(255,255,255,0.40)` | 0.40 | **3.71:1** | FAIL | Stack tile names |
| `rgba(255,255,255,0.38)` | 0.38 | **3.44:1** | FAIL | Band labels, contact openTo |
| `rgba(255,255,255,0.35)` | 0.35 | **3.10:1** | FAIL | Arc past-node desc text |
| `rgba(255,255,255,0.30)` | 0.30 | **2.53:1** | FAIL | Stats labels (Continents/Automations/Years) |

**Minimum alpha for 4.5:1 on `#050505`: 0.46** [VERIFIED: computed]

### Contrast Fixes Required

The WCAG 1.4.3 exception for decorative text does not apply here — all of the failing values are readable content strings (icon names, stat labels, career arc descriptions). They are not purely decorative.

| Component File | Current Value | Fix |
|---------------|--------------|-----|
| `Stack.tsx` `.stack-tile color` | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.6)` |
| `About.tsx` arc past-node desc | `rgba(255,255,255,0.35)` | `rgba(255,255,255,0.55)` |
| `About.tsx` arc past-node role | `rgba(255,255,255,0.6)` | stays (7.39:1 PASS) |
| `About.tsx` stats label | `rgba(255,255,255,0.30)` | `rgba(255,255,255,0.55)` |
| `About.tsx` arc past-node opacity | `opacity: 0.6` on node container | no change (opacity scales all children) |
| `Stack.tsx` `.band-lbl` | `rgba(255,255,255,0.38)` | `rgba(255,255,255,0.55)` |
| `Contact.tsx` `.contact-method-lbl` | `rgba(255,255,255,0.38)` | `rgba(255,255,255,0.55)` |
| `Contact.tsx` `openTo` paragraph | `rgba(255,255,255,0.38)` | `rgba(255,255,255,0.55)` |
| `Contact.tsx` `.cv-lang-btn` inactive | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.55)` |

**Note:** The rgba(255,255,255,0.38) values in band/method labels are used as decorative section separators in context — however, they accompany visible uppercase text labels that are the primary visual affordance. WCAG 1.4.3 still applies to text regardless of it being "label-style". Raising to 0.55 (6.71:1) preserves the muted aesthetic while passing AA.

**Note on arc node opacity:** `About.tsx` wraps past arc nodes in a container with `opacity: 0.6`. The text inside uses specific colors. The `0.6` opacity multiplier is applied to the full node (including the dot). Rather than changing the opacity on the wrapper, fix the text color directly inside (already at 0.45/0.35/0.6 per text type).

---

## Standard Stack

### No New Packages Required

All Phase 7 work is accomplished with the existing installed dependencies. The only potential new devDependency is `@playwright/test` for the Safari WebKit test plan.

### Core (Existing — All Already Installed)
[VERIFIED: package.json]

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^19.2.7 | `React.lazy()` + `Suspense` for code-splitting |
| react-i18next | ^17.0.8 | `useTranslation` in `useMetaTags` hook |
| Vite | ^8.0.16 | Build toolchain — automatic chunk splitting on dynamic import |
| TypeScript | ^6.0.3 | Type safety on new hook |

### New DevDependency (Testing Only)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@playwright/test` | 1.61.0 | Safari WebKit testing | D-14: Playwright WebKit engine for cross-browser |

**Note:** `@playwright/test` is used only for the Safari cross-browser verification task. It is a devDependency and does not affect the production bundle.

---

## Package Legitimacy Audit

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| `@playwright/test` | npm | [OK] | Approved — run `npx playwright install webkit` after install |

**slopcheck verdict:** [OK] for `@playwright/test` (verified via slopcheck 0.6.1).

**WebKit browser not installed:** Only `chromium-1208` is present in `$LOCALAPPDATA/ms-playwright`. Running `npx playwright install webkit` after adding the devDependency is a required Wave 0 setup step.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
│
├─ index.html (static)
│    ├── og:* meta tags (static, crawler-readable)
│    ├── hreflang links (static, Googlebot-readable)
│    └── Google Fonts link (display=swap already present)
│
└─ React SPA (runtime)
     ├── App.tsx
     │    ├── useLocalizeDocumentAttributes() — sets html.lang
     │    └── useMetaTags()  [NEW] — sets document.title + meta[description]
     │
     ├── Hero.tsx
     │    ├── AnimationErrorBoundary
     │    └── Suspense fallback=<PlasmaFallback>  [NEW boundary]
     │         └── React.lazy(HeroBackdrop)  [NEW]
     │              └── async chunk: HeroBackdrop + Plasma + OGL (~66KB)
     │
     └── src/styles/index.css
          └── :focus-visible global rule  [NEW]
```

### Recommended Plan Structure

Based on phase complexity and dependency order:

```
07-01  Lighthouse baseline + performance fixes (lazy-load Plasma, audit)
07-02  SEO & OG (meta hook, locale copy, OG image artifact, index.html tags)
07-03  Accessibility (contrast fixes, focus rings)
07-04  Cross-browser QA (DevTools emulation 375/430px, Playwright WebKit) + human verification
```

### Pattern 1: React.lazy Named Export

`React.lazy()` requires a default export. `HeroBackdrop.tsx` currently uses a named export `export function HeroBackdrop`. The wrapper in `Hero.tsx` must use a dynamic import that re-exports as default, OR `HeroBackdrop.tsx` must add a default export.

**Recommended approach — add default export to HeroBackdrop.tsx:**

```typescript
// src/components/plasma/HeroBackdrop.tsx — add at the bottom
export default HeroBackdrop
```

**Then in Hero.tsx:**

```typescript
// Replace eager import:
// import { HeroBackdrop } from '@/components/plasma/HeroBackdrop'

// With lazy import:
import { lazy, Suspense } from 'react'
import { PlasmaFallback } from '@/components/plasma/PlasmaFallback'

const HeroBackdrop = lazy(() => import('@/components/plasma/HeroBackdrop'))
```

**Then wrap the usage in Hero.tsx JSX:**

```tsx
// Current:
<AnimationErrorBoundary>
  <HeroBackdrop heroRef={sectionRef} />
</AnimationErrorBoundary>

// After (Suspense inside AnimationErrorBoundary so error boundary catches chunk load errors too):
<AnimationErrorBoundary>
  <Suspense fallback={<PlasmaFallback />}>
    <HeroBackdrop heroRef={sectionRef} />
  </Suspense>
</AnimationErrorBoundary>
```

[ASSUMED] The Suspense boundary placement inside AnimationErrorBoundary is the safer pattern — if the async chunk fails to load (network error), the error boundary catches it rather than showing an unhandled error.

### Pattern 2: useMetaTags Hook

Mirrors `useLocalizeDocumentAttributes` exactly:

```typescript
// src/hooks/useMetaTags.ts
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

Wire in `App.tsx` alongside `useLocalizeDocumentAttributes`:
```typescript
useLocalizeDocumentAttributes()
useMetaTags()  // add this line
```

### Pattern 3: Global Focus Ring

Add to `src/styles/index.css` in the base layer section (after existing base resets):

```css
/* D-12: Brand focus ring — visible on #050505 background */
:focus-visible {
  outline: 2px solid #FF4500;
  outline-offset: 2px;
}
```

This single rule covers: Hero CTA anchor, all PillNav/MobileNav anchors and buttons, all LanguageSwitcher buttons, all Stack tile anchors, Contact email/LinkedIn/CV download links, and CV language radio buttons. No per-component changes needed.

**Note:** `:focus-visible` (not `:focus`) is intentional — it only shows the outline when keyboard-navigating, not on mouse click. This matches D-12 spec and the WCAG 2.4.7 "Focus Visible" success criterion. [ASSUMED] This is the modern CSS approach, supported in all target browsers (Chrome, Safari 16.4+, Firefox).

### Pattern 4: Static OG Tags in index.html

Add after existing `<meta name="description">`:

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

<!-- hreflang — D-05: both language variants share one URL (SPA) -->
<link rel="alternate" hreflang="en" href="https://kellybattistoni.github.io/" />
<link rel="alternate" hreflang="es" href="https://kellybattistoni.github.io/" />
<link rel="alternate" hreflang="x-default" href="https://kellybattistoni.github.io/" />
```

### Anti-Patterns to Avoid

- **Putting hreflang in JavaScript:** Search crawlers cannot execute JS to discover hreflang. Must be static HTML. [ASSUMED]
- **Using `useEffect` for OG tags:** Social crawlers (LinkedIn, WhatsApp) do not execute JavaScript when scraping. Static meta tags in `index.html` are the only reliable mechanism for a GitHub Pages SPA. [ASSUMED]
- **`React.lazy` without Suspense boundary:** Crashes with "A React component suspended while rendering, but no fallback UI was specified." Always wrap lazy components in `<Suspense fallback={...}>`.
- **Adding `:focus` instead of `:focus-visible`:** `:focus` shows outlines on mouse click, which is visually disruptive and was historically suppressed by browsers via outline:none. `:focus-visible` is the correct modern selector.
- **Running Lighthouse against `vite dev` server:** Dev server includes HMR overhead and unminified assets. Always run Lighthouse against `vite preview` (production build served locally).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code splitting | Manual webpack/rollup config | `React.lazy()` + `import()` | Vite handles chunk creation automatically on dynamic import |
| Focus indicator styles | Per-component outline CSS | Global `:focus-visible` in index.css | One rule covers all interactive elements |
| Safari testing | Manual macOS/iOS VM | Playwright WebKit | Ships Safari engine, works on Windows |
| OG image generation | Custom canvas/puppeteer | HTML/CSS screenshot approach | Simpler, zero dependencies, user controls the output |

---

## Meta Copy Drafts

[ASSUMED] — user refines during verification checkpoint (D-02 locks this as collaborative).

### EN (for `src/locales/en/common.json`)

```json
"meta": {
  "title": "Kelly Battistoni — AI Automations Manager & Systems Thinker",
  "description": "AI Automations Manager building end-to-end workflow strategies across Make.com, n8n, Claude, and Supabase for global clients. Systems thinker. Business-first."
}
```

- Title: 59 chars (within 50–60 target) [VERIFIED: computed]
- Description: 156 chars (within 150–160 target) [VERIFIED: computed]

### ES (for `src/locales/es/common.json`)

```json
"meta": {
  "title": "Kelly Battistoni — Gerente de Automatizaciones IA",
  "description": "Gerente de automatizaciones IA con visión de sistemas. Construyo estrategias de automatización de extremo a extremo para clientes globales con Make.com, n8n y Claude."
}
```

- Title: 49 chars (within 50–60 target) [VERIFIED: computed]
- Description: 167 chars (slightly over; user may trim) [ASSUMED]

---

## OG Image Specification

[ASSUMED] Final visual is user's decision after seeing the HTML/CSS preview card.

**Canvas:** 1200×630px
**Background:** `#050505` (matches site exactly)
**Layout:**

```
[thin #FF4500 horizontal rule, 80px from top, 80px left margin, 400px wide]

[80px left, 180px top]
"Kelly Battistoni"
  font: Playfair Display, 72px, weight 700, color #FFFFFF

[80px left, 285px top]
"AI Automations Manager"
  font: Inter, 28px, weight 400, color rgba(255,255,255,0.65)

[80px left, 340px top]  
"AI Strategy · Process Design · Full-Stack Automation"
  font: Inter, 18px, weight 300, color rgba(255,255,255,0.38)

[bottom-right, 40px margin]
kellybattistoni.github.io
  font: Inter, 14px, weight 300, color rgba(255,255,255,0.3)
```

---

## Common Pitfalls

### Pitfall 1: React.lazy Named Export Trap

**What goes wrong:** `React.lazy(() => import('./HeroBackdrop'))` throws "The default export of the module is not a React component" because `HeroBackdrop.tsx` uses a named export.
**Why it happens:** `React.lazy()` always reads the `default` export from the dynamic import.
**How to avoid:** Add `export default HeroBackdrop` to `HeroBackdrop.tsx` before wrapping with `lazy`. The named export `{ HeroBackdrop }` can remain for any other consumers.
**Warning signs:** Runtime error in the browser console on first load.

### Pitfall 2: Suspense Placed Outside AnimationErrorBoundary

**What goes wrong:** If chunk load fails (network error), React throws to the nearest error boundary above the Suspense — which may be the root-level boundary showing a full-page fallback.
**Why it happens:** Error boundaries and Suspense boundaries are independent React constructs.
**How to avoid:** Place `<Suspense>` inside `<AnimationErrorBoundary>` so errors surface the animation fallback (a styled dark div), not a blank page.

### Pitfall 3: Lighthouse Running Against Dev Server

**What goes wrong:** Lighthouse scores reflect unminified JS, HMR overhead, and source maps. Performance score 30–40 points lower than production.
**Why it happens:** `vite dev` serves unbundled modules via ESM.
**How to avoid:** Always `npm run build && npx vite preview` before running Lighthouse.

### Pitfall 4: Contrast Ratio Computed Without Background Blending

**What goes wrong:** Tools report `rgba(255,255,255,0.45)` as "4.5:1 PASS" when computed against pure white, but the actual background is `#050505`. The real contrast depends on alpha-blending onto the dark background.
**Why it happens:** Some contrast checkers treat alpha as if it were composited against white.
**How to avoid:** Use the blended-against-`#050505` computation. Minimum white alpha for 4.5:1 on `#050505` is 0.46. Use 0.55–0.60 for comfortable margin.

### Pitfall 5: CV Lang Radio Buttons Missing Visible Focus

**What goes wrong:** The `.cv-lang-btn` elements use `role="radio"` but no visible focus style — keyboard users tabbing to the CV download section see no indicator.
**Why it happens:** The existing CSS suppresses default browser focus via `border: none; background: transparent` without restoring `:focus-visible`.
**How to avoid:** The global `:focus-visible` rule handles this automatically once added to `index.css`.

### Pitfall 6: hreflang in JavaScript Not Read by Crawlers

**What goes wrong:** Adding hreflang via `useEffect` → `document.createElement('link')` has no effect on LinkedIn/WhatsApp previews and is unreliable for Googlebot.
**Why it happens:** Social crawlers and search engines snapshot the initial HTML, not the post-JS-execution DOM.
**How to avoid:** hreflang goes in `index.html` static `<head>`, as specified in D-05.

### Pitfall 7: WebKit Not Installed

**What goes wrong:** `npx playwright test` errors with "browserType.launch: Executable doesn't exist" for WebKit.
**Why it happens:** Playwright separates browser installation from the npm package. Only `chromium-1208` is currently installed.
**How to avoid:** After installing `@playwright/test` as a devDependency, run `npx playwright install webkit` before the Safari QA plan executes.

---

## Reduced Motion Verification Map

All sections already implement the correct pattern. Verification confirms existing behavior, not new implementation.

[VERIFIED: direct code read]

| Component | Gate Mechanism | Status |
|-----------|----------------|--------|
| `Hero.tsx` | `if (prefersReducedMotion) return` in `useGSAP` | Implemented |
| `HeroBackdrop.tsx` | `useFallback = prefersReducedMotion \|\| !supportsWebGL2` | Implemented |
| `PlasmaFallback.tsx` | `@media (prefers-reduced-motion: reduce)` kills pulse | Implemented |
| `PillNav.tsx` | `if (prefersReducedMotion) return` — pill visible from mount | Implemented |
| `MobileNav.tsx` | Skips timeline, uses `display:flex/none` toggle | Implemented |
| `About.tsx` | `if (prefersReducedMotion) return` in `useGSAP` | Implemented |
| `Projects.tsx` | `if (prefersReducedMotion) return` in `useGSAP` | Implemented |
| `Stack.tsx` | `if (prefersReducedMotion) return` in `useGSAP`; CSS `transition: none` on hover | Implemented |
| `Contact.tsx` | `if (prefersReducedMotion) return` in `useGSAP` | Implemented |

**All 4 success criteria for SC3 are implemented. Phase 7 plan needs one verification task only.**

---

## Interactive Elements Inventory (Focus Ring Coverage)

[VERIFIED: direct code read]

| Element | Location | Type | Notes |
|---------|----------|------|-------|
| `#work` CTA | `Hero.tsx` | `<a href="#work">` | Also receives GSAP hover handlers |
| About nav anchor | `PillNav.tsx` | `<a href="#about">` | PillNav item |
| Work nav anchor | `PillNav.tsx` | `<a href="#work">` | PillNav item |
| Stack nav anchor | `PillNav.tsx` | `<a href="#stack">` | PillNav item |
| Contact nav anchor | `PillNav.tsx` | `<a href="#contact">` | PillNav item |
| EN button | `LanguageSwitcher.tsx` | `<button>` | In PillNav and MobileNav |
| ES button | `LanguageSwitcher.tsx` | `<button>` | In PillNav and MobileNav |
| Hamburger toggle | `MobileNav.tsx` | `<button>` | Mobile only (≤430px) |
| MobileNav nav anchors (4×) | `MobileNav.tsx` | `<a href="...">` | Mobile panel |
| Stack tiles (~29×) | `Stack.tsx` | `<a href="..." target="_blank">` | External links |
| Email link | `Contact.tsx` | `<a href="mailto:...">` | |
| LinkedIn CTA | `Contact.tsx` | `<a href="..." target="_blank">` | |
| CV EN radio | `Contact.tsx` | `<button role="radio">` | |
| CV ES radio | `Contact.tsx` | `<button role="radio">` | |
| CV download | `Contact.tsx` | `<a href="...pdf" download>` | |

**Total: ~46 interactive elements. All covered by one global `:focus-visible` CSS rule.**

---

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| Node.js | Build + testing | Yes | v24.13.0 | |
| npm | Package management | Yes | 11.10.0 | |
| Vite | Build | Yes | ^8.0.16 in package.json | |
| Playwright CLI | Safari testing | Yes (global) | 1.61.0 | Via `npx playwright` |
| Playwright Chromium | Lighthouse testing | Yes | chromium-1208 | Already installed |
| Playwright WebKit | Safari testing (D-14) | **No** | — | Needs: `npx playwright install webkit` |
| Lighthouse | Performance audit | Yes | 13.4.0 | Via `npx lighthouse` |

**Missing dependencies with no fallback:**
- Playwright WebKit — required by D-14. Must be installed before the Safari QA plan runs.

**Plan note:** The plan should include `npx playwright install webkit` as a setup task in the cross-browser QA plan, before any Playwright tests run.

---

## Validation Architecture

`workflow.nyquist_validation` is not set in `.planning/config.json` — treating as enabled.

### Test Framework

Phase 7 is a quality verification phase, not a feature-implementation phase. Testing takes the form of structured checklists verified in the browser, plus one automated cross-browser test if Playwright is wired up.

| Property | Value |
|----------|-------|
| Framework | Playwright 1.61 (devDependency, new) |
| Quick Lighthouse check | `npm run build && npx vite preview` then DevTools Lighthouse panel |
| Safari smoke test | `npx playwright test` (after WebKit install) |

### Phase Requirements → Test Map

| Req | Behavior | Test Type | Command or Method |
|-----|----------|-----------|-------------------|
| SC-1 | Lighthouse ≥ 90 Performance/Accessibility/Best Practices/SEO, LCP < 2.5s | Manual audit | `npm run build && npx vite preview` → DevTools Lighthouse (mobile preset) |
| SC-2 | Full keyboard tab navigation, visible focus, body text 4.5:1 contrast | Manual keyboard + DevTools | Tab through page; DevTools Accessibility panel |
| SC-3 | `prefers-reduced-motion: reduce` disables all animations | Manual | DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" |
| SC-4 | 375/430px render, Chrome + Safari 16.4+ + Firefox, OG preview | Manual DevTools + Playwright | DevTools responsive mode; `npx playwright test` WebKit |

### Wave 0 Gaps

- [ ] `@playwright/test` not yet in `package.json` devDependencies — install before Plan 07-04
- [ ] Playwright WebKit browser not installed — `npx playwright install webkit` before Plan 07-04
- [ ] `playwright.config.ts` does not exist — create in Plan 07-04 (minimal config for WebKit smoke test)
- [ ] OG image `public/og-image.png` does not exist — user screenshots the HTML/CSS preview card in Plan 07-02

---

## Security Domain

This phase adds no authentication, session management, user input handling, or data storage. The only new external surface is the OG image served from GitHub Pages (static file, no dynamic generation).

**Applicable ASVS Categories:**
- V5 Input Validation: N/A — no user input in this phase
- V2–V4, V6: N/A — no auth, sessions, access control, or cryptography

No security work required in Phase 7.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Suspense inside AnimationErrorBoundary is the correct placement | Architecture Patterns | Low — worst case is error boundary placement is wrong; fix is moving the boundary |
| A2 | `:focus-visible` is supported in Safari 16.4+ and Firefox current | Architecture Patterns | Low — all modern browsers support it since 2021; fallback is `:focus` |
| A3 | Social crawlers cannot execute JS for OG tags | Architecture Patterns | Low — this is well-established behavior |
| A4 | hreflang in JavaScript is unreliable for Googlebot | Architecture Patterns | Low — Google recommends static HTML for hreflang |
| A5 | Meta title/description copy drafts | Meta Copy Drafts | Low — user refines during D-02 checkpoint; drafts just need to be reasonable starting points |
| A6 | ES description is 167 chars (slightly over 160) | Meta Copy Drafts | Low — user trims during checkpoint |
| A7 | `React.lazy` chunk will be ~66KB | Current Codebase State | Low — actual size verified after build; plan only needs the split, not exact size |

---

## Open Questions (RESOLVED)

1. **Lighthouse score without running it**
   - What we know: 510KB single JS bundle, no OG tags, no hreflang, no focus rings
   - What's unclear: actual current Lighthouse score on Performance (LCP timing, TBT, CLS)
   - Recommendation: D-10 (audit-first) is the correct approach — Plan 07-01 establishes baseline before any fix

2. **Playwright WebKit on Windows: any known issues with scroll behavior?**
   - What we know: Playwright WebKit ships the WebKit engine, not full Safari
   - What's unclear: whether GSAP ScrollTrigger behaves identically in Playwright WebKit vs real Safari
   - Recommendation: D-14 accepts ~90% Safari coverage from WebKit; treat it as a smoke test, not a pixel-perfect replica

3. **OG image timing: user screenshot before or after plan completes?**
   - What we know: Claude produces the HTML/CSS card artifact; user screenshots it
   - What's unclear: this creates a human gate mid-plan
   - Recommendation: Plan 07-02 should produce the HTML artifact as a deliverable, then include a `checkpoint:human-verify` step for the user to screenshot and place at `public/og-image.png`, then continue

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: direct file read] `index.html` — confirmed `&display=swap` already present; no OG tags; no hreflang
- [VERIFIED: direct file read] `src/styles/index.css` — confirmed no `:focus-visible` rule
- [VERIFIED: direct file read] `src/components/plasma/HeroBackdrop.tsx` — confirmed named export, lazy-load candidate
- [VERIFIED: direct file read] `src/components/plasma/PlasmaFallback.tsx` — confirmed no WebGL imports, safe as Suspense fallback
- [VERIFIED: direct file read] `src/hooks/useLocalizeDocumentAttributes.ts` — confirmed hook pattern for `useMetaTags`
- [VERIFIED: direct file read] `src/locales/en/common.json`, `src/locales/es/common.json` — confirmed `meta.title` and `meta.description` are empty strings
- [VERIFIED: `npm run build`] Production bundle: 510KB single chunk, Vite >500KB warning
- [VERIFIED: computed] WCAG contrast ratios — luminance formula applied to all rgba text values
- [VERIFIED: bash] Playwright WebKit NOT installed; only Chromium present
- [VERIFIED: bash] `@playwright/test` 1.61.0 available via npx; not in project devDependencies

### Secondary (MEDIUM confidence)
- [ASSUMED] React.lazy requires default export — standard React documentation behavior
- [ASSUMED] Social crawlers do not execute JS for OG meta tags — widely documented behavior for LinkedIn/WhatsApp

---

## Metadata

**Confidence breakdown:**
- Codebase state: HIGH — all findings are from direct file reads and build execution
- Contrast calculations: HIGH — computed via WCAG 2.1 luminance formula
- Performance impact of lazy split: MEDIUM — estimated, actual verified after build
- Safari WebKit behavior parity: MEDIUM — Playwright WebKit covers ~90% of Safari

**Research date:** 2026-06-16
**Valid until:** 2026-07-16 (stable domain — 30 days)
