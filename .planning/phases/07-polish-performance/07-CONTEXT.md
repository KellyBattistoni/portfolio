# Phase 7: Polish & Performance - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Bring the site to launch quality — Lighthouse 90+, WCAG AA, cross-browser, and social preview ready. This phase exercises every prior feature under quality constraints, not new capabilities. No new sections, interactions, or content outside what is already implemented.

</domain>

<decisions>
## Implementation Decisions

### Meta tags & Open Graph
- **D-01:** Dynamic language-aware meta updates via `useEffect` on i18next language change — update `document.title` and `document.querySelector('meta[name="description"]')` directly. No react-helmet-async (unnecessary dependency for a single-page site).
- **D-02:** Claude drafts EN and ES meta title (50–60 chars) and description (150–160 chars) based on PROJECT.md brand narrative. User refines during browser verification checkpoint.
- **D-03:** OG image: static PNG, 1200×630, dark cinematic style — #050505 background, #FF4500 accent, Playfair Display for the name, Inter for tagline/role. Claude produces an HTML/CSS preview card; user screenshots at 1200×630 and places in `public/og-image.png`.
- **D-04:** One OG image, English only. Social crawlers cache on first visit; two language variants add production work for marginal benefit.
- **D-05:** Add `<link rel="alternate" hreflang="en" href="https://kellybattistoni.github.io/">` and the ES equivalent in the `<head>`. Although EN and ES share one URL, hreflang signals language presence to search engines.

### Contact details
- **D-06:** Email stays as `kellybattistoniv@gmail.com` (personal Gmail, currently hardcoded in Contact.tsx) — no change.
- **D-07:** LinkedIn URL confirmed correct: `https://www.linkedin.com/in/kelly-battistoni-villota-mechanical-engineer/` — already in `src/locales/en/contact.json` and `es/contact.json`. No change needed.

### Performance
- **D-08:** Font loading: append `&display=swap` to the Google Fonts `href` in `index.html`. Eliminates the render-blocking flash without self-hosting fonts.
- **D-09:** Plasma component lazy-loaded via `React.lazy()` + `Suspense`. `PlasmaFallback` (already exists at `src/components/plasma/PlasmaFallback.tsx`) serves as the Suspense fallback. Splits OGL (~60KB) out of the main bundle.
- **D-10:** Audit-first approach: run Lighthouse on the current build before implementing any fixes to establish a baseline and discover surprises. Then implement targeted fixes.
- **D-11:** Stack icons: Claude inspects the current icon implementation and decides whether optimization is needed. No user preference — discretion granted.

### Accessibility (WCAG AA)
- **D-12:** Custom focus rings: `outline: 2px solid #FF4500; outline-offset: 2px` on all `:focus-visible` elements. Applied globally in CSS (Tailwind base layer or `src/index.css`). Overrides browser defaults to match the brand, clearly visible on `#050505` background.

### Mobile QA
- **D-13:** DevTools emulation only (no physical device). Testing protocol: systematic check at 375px and 430px widths covering every section. Pass/fail checklist defined in the plan.
- **D-14:** Safari testing via Playwright's built-in WebKit engine — covers ~90% of Safari-specific layout and scroll behavior without requiring a Mac or iOS device.
- **D-15:** No pre-known mobile issues. Full QA pass across all sections (Hero, About, Projects, Stack, Contact, PillNav/MobileNav, CV download).

### Claude's Discretion
- Stack icon optimization approach (inline, sprite, or lazy-load) — Claude decides after inspecting the current implementation.
- Exact meta title and description copy (EN and ES) — Claude drafts, user refines.
- OG card HTML/CSS template design — Claude produces the preview artifact.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Roadmap
- `.planning/PROJECT.md` — brand narrative, constraints, key decisions (esp. design aesthetic, NDA policy)
- `.planning/ROADMAP.md` §Phase 7 — 4 success criteria: Lighthouse 90+, WCAG AA, reduced-motion, OG/hreflang/cross-browser

### Current implementation to modify
- `index.html` — hardcoded static `<title>` and `<meta name="description">` to wire dynamically; Google Fonts link to add `&display=swap`; hreflang tags to add
- `src/locales/en/common.json` — `meta.title` and `meta.description` currently empty strings
- `src/locales/es/common.json` — same (both need populated before the useEffect hook can read them)
- `src/components/plasma/HeroBackdrop.tsx` — Plasma dispatch component; lazy-load target for React.lazy()
- `src/components/plasma/PlasmaFallback.tsx` — already exists; becomes the Suspense fallback after lazy-load

### Established patterns (reduced-motion, scroll)
- `src/hooks/useDeviceCapabilities.ts` — `prefersReducedMotion` + `isMobile` used by every section for animation gating
- `src/lib/gsap.ts` — central GSAP registration module; all animation imports come through here

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PlasmaFallback` (`src/components/plasma/PlasmaFallback.tsx`): already serves as the static fallback for Plasma; will double as the Suspense fallback after React.lazy() wrapping
- `useDeviceCapabilities` hook: already provides `prefersReducedMotion`, `isMobile`, `isLowEnd` — no new capability detection needed
- All 4 content sections already implement `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` — reduced-motion criterion is already passing in implementation; needs verification only

### Established Patterns
- `useEffect` on `[i18n.language]` dependency: used by `useLocalizeDocumentAttributes` (sets `document.documentElement.lang`) — the new meta-tag hook follows the exact same pattern
- Namespace `common.meta.*`: keys already declared as empty strings in both locale files; hook just reads and writes them
- `public/` for static assets: CV PDFs already there; OG image goes to `public/og-image.png`

### Integration Points
- The new `useMetaTags` hook wires into `App.tsx` alongside `useLocalizeDocumentAttributes` — one line addition
- `React.lazy(() => import('./HeroBackdrop'))` wraps the current eager import in `Hero.tsx` — Suspense boundary wraps `<HeroBackdrop>` inside the existing `<AnimationErrorBoundary>`
- Global focus ring CSS goes in `src/index.css` (Tailwind base layer) so it applies to all interactive elements without per-component changes

</code_context>

<specifics>
## Specific Ideas

- OG image visual: #050505 background, thin #FF4500 horizontal rule, "Kelly Battistoni" in Playfair Display ~72px white, "AI Automations Manager" in Inter ~28px rgba(255,255,255,0.65). Clean and cinematic — mirrors the hero section.
- Font display fix: append `&display=swap` to the existing Google Fonts URL in `index.html`. One-line change, immediate Lighthouse LCP improvement.
- Meta title structure to draft: `"Kelly Battistoni — AI Automations Manager"` (EN) with a Spanish equivalent. Description pulls from the brand narrative ("systems thinker, full-stack automator, business-first").

</specifics>

<deferred>
## Deferred Ideas

- Meeting scheduler / booking form in Contact (surfaced in Phase 6 discussion) — new capability, post-launch addition if desired.
- Self-hosting Google Fonts — valid future optimization if Lighthouse score remains under 90 after the `font-display=swap` fix.

</deferred>

---

*Phase: 07-polish-performance*
*Context gathered: 2026-06-16*
