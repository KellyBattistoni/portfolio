# Roadmap: Kelly Battistoni Portfolio

**Created:** 2026-06-09
**Depth:** standard
**Phases:** 8
**Coverage:** 20/20 v1 requirements mapped

## Overview

This roadmap delivers a bilingual, dark-cinematic portfolio in a strict dependency order: infrastructure and safety rails first, then i18n and scroll primitives, then the visual hero stack, then content, polish, and deployment. Each phase produces a coherent, verifiable capability so that the architecture is proven progressively — the Hero + PillNav vertical slice (Phase 5) confirms Plasma + scroll + i18n + nav all coexist before scaling the pattern across content sections (Phase 6).

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Scaffold + Safety Rails | Vite/React/Tailwind project builds; animation kill-switch exists before any animation code | INFRA-01, INFRA-02, DESIGN-01 | Complete ✓ 2026-06-09 |
| 2 | i18n Backbone | EN/ES translation system wired before any section copy is written | INFRA-03, I18N-01, I18N-02, I18N-03 | Complete ✓ 2026-06-10 |
| 3 | Scroll Infrastructure | Single scroll source-of-truth + reveal/parallax primitives ready for visual sections | INFRA-04, DESIGN-04, DESIGN-05 | Complete ✓ 2026-06-10 |
| 4 | Visual Foundations — Plasma + Noise | Plasma WebGL hero shader and noise overlay render with full lifecycle safety | DESIGN-02 | In progress (1/3 plans) |
| 5 | Hero + PillNav — First Vertical Slice | Full-screen hero with Plasma backdrop, scroll-reveal PillNav, bilingual copy | CONT-01, DESIGN-03 | Not started |
| 6 | Content Sections | About, Projects (parallax), Stack, Contact, CV — all bilingual | CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, DESIGN-06 | Not started |
| 7 | Polish & Performance | Lighthouse 90+, mobile-tested, WCAG AA, cross-browser verified | (criteria-only) | Not started |
| 8 | Deployment | Site live at `KellyBattistoni.github.io` via `gh-pages` branch | INFRA-05 | Not started |

## Phase Details

### Phase 1: Scaffold + Safety Rails
**Goal**: Establish a buildable React+Vite+Tailwind project with the animation kill-switch hook in place before any animation code is written.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, DESIGN-01
**Success Criteria** (what must be TRUE):
  1. `npm run build` completes without errors and `npm run preview` serves a working bundle.
  2. The page renders with `#050505` background, `#FF4500` accent CSS variables exposed, Playfair Display and Inter loaded, and a visible noise texture overlay.
  3. Importing `useDeviceCapabilities()` anywhere in the app returns `{ prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 }` and reactively updates when the OS reduced-motion preference is toggled.
  4. An `ErrorBoundary` wraps a placeholder animation root and renders a fallback when a thrown error is forced inside it.
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Vite 8 + React 19 + TypeScript + Tailwind v4, install all deps, configure @/ alias, ESLint, Prettier
- [ ] 01-02-PLAN.md — Brand tokens (@theme), Google Fonts, NoiseOverlay component, AnimationErrorBoundary, App wiring
- [ ] 01-03-PLAN.md — useDeviceCapabilities hook (prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2)

### Phase 2: i18n Backbone
**Goal**: Wire react-i18next with EN/ES namespaces and a working language switcher before any section component or hardcoded string exists.
**Depends on**: Phase 1
**Requirements**: INFRA-03, I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):
  1. Toggling the EN/ES switcher instantly re-renders every visible string on the page with no untranslated keys appearing.
  2. The 6 namespace JSON files (`common`, `hero`, `about`, `projects`, `stack`, `contact`) exist for both `en` and `es` and are statically imported at startup.
  3. Selecting a language writes `kbv-lang` to `localStorage`; a full reload restores that language and sets `document.documentElement.lang` to match.
  4. First-visit users with no stored preference are auto-detected via browser locale and default to ES if Spanish is preferred, EN otherwise.
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Install i18n deps, create 12 namespace JSON files, write i18n init module + TypeScript module augmentation, wire main.tsx side-effect import
- [x] 02-02-PLAN.md — Build LanguageSwitcher (underline tabs), useLocalizeDocumentAttributes hook, wire App.tsx with demo hero strings inside AnimationErrorBoundary
- [x] 02-03-PLAN.md — Human verification checkpoint — confirm all 4 ROADMAP success criteria pass in a real browser

### Phase 3: Scroll Infrastructure
**Goal**: Provide a single rAF-coalesced scroll source and the reveal/parallax primitives every visual component will consume.
**Depends on**: Phase 1
**Requirements**: INFRA-04, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. A single `ScrollProvider` publishes `{ y, progress }` via context and only one passive `scroll` listener is attached to `window` (verifiable via DevTools).
  2. Any element wrapped in `RevealSection` animates from `opacity: 0, y: 30` to `opacity: 1, y: 0` exactly once when it enters the viewport, and skips animation entirely when `prefersReducedMotion` is true.
  3. A `ParallaxCard` test harness renders 3 stacked cards that shift at distinct vertical speeds on scroll using only `transform: translate3d(...)` updates — no per-card scroll listeners.
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Install GSAP, create src/lib/gsap.ts registration module and ScrollContext with rAF-coalesced external store
- [ ] 03-02-PLAN.md — Build RevealSection (3 variants, stagger, reduced-motion) and ParallaxCard (multi-layer ticker + quickSetter)
- [ ] 03-03-PLAN.md — Wire ScrollProvider in main.tsx, build brand-styled test harness, human verification checkpoint

### Phase 4: Visual Foundations — Plasma + Noise
**Goal**: Ship the Plasma WebGL hero background with correct lifecycle, fallback, and unmount behavior so the hero scene can be assembled in Phase 5.
**Depends on**: Phase 1, Phase 3
**Requirements**: DESIGN-02
**Success Criteria** (what must be TRUE):
  1. The Plasma canvas renders full-bleed behind a placeholder hero with `color="#FF4500"` and responds to mouse movement at a stable framerate on desktop.
  2. Scrolling past the hero unmounts the Plasma component (verified by `requestAnimationFrame` ID logs ceasing and WebGL context being lost) rather than just fading opacity.
  3. When `prefersReducedMotion` or low-end/no-WebGL2 is detected, Plasma is replaced by a static CSS radial gradient fallback with no GL context created.
  4. React 18 StrictMode double-mount in dev produces exactly one live WebGL context after settle (no leaks), confirmed by inspecting `WEBGL_lose_context` cleanup.
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Install ogl, port shaders, ship pure <Plasma> OGL component + <PlasmaFallback> CSS gradient
- [ ] 04-02-PLAN.md — Build <HeroBackdrop> dispatcher (useDeviceCapabilities + ScrollTrigger + fade state machine), wire test harness in App.tsx
- [ ] 04-03-PLAN.md — Human verification checkpoint — confirm all 4 ROADMAP Phase 4 success criteria pass in a real browser

### Phase 5: Hero + PillNav — First Vertical Slice
**Goal**: Prove the full architecture by shipping a complete bilingual hero with Plasma backdrop, scroll-reveal PillNav, and language switcher working together.
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: CONT-01, DESIGN-03
**Success Criteria** (what must be TRUE):
  1. Visiting `/` shows Kelly's name, tagline, and primary CTA (all i18n strings) over the Plasma backdrop within 2.5s LCP on desktop.
  2. Hero content fades and shifts on scroll via `ScrollProvider` progress, and Plasma unmounts as the hero leaves the viewport.
  3. PillNav is invisible while the hero is in view and animates in via GSAP after 70% of hero height is scrolled, with a rising-circle hover effect per item.
  4. The mobile hamburger menu opens/closes via GSAP timeline at viewport widths ≤ 430px, with the EN/ES switcher reachable inside both desktop and mobile nav.
**Plans**: 4 plans

Plans:
- [ ] 05-01-PLAN.md — Update i18n strings (hero + nav) and add className prop to LanguageSwitcher
- [ ] 05-02-PLAN.md — Build Hero.tsx with Plasma backdrop, bilingual copy, scroll-parallax fade-out
- [ ] 05-03-PLAN.md — Build PillNav.tsx (rising-circle hover) and MobileNav.tsx (GSAP timeline panel)
- [ ] 05-04-PLAN.md — Wire App.tsx + human verification checkpoint

### Phase 6: Content Sections
**Goal**: Deliver all remaining content sections — About, Projects (with parallax), Stack, Contact, CV download — fully bilingual on top of the proven Phase 5 architecture.
**Depends on**: Phase 5
**Requirements**: CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, DESIGN-06
**Success Criteria** (what must be TRUE):
  1. About section reads in both EN and ES as continuous narrative (engineering-mindset-to-AI), reveals on scroll, and contains no resume bullet points.
  2. Projects section renders 3–4 case study cards with project name, context, outcome metric, and tech stack — each card parallax-shifting at a distinct speed; all copy is NDA-respectful in EN and ES.
  3. Stack section displays a categorized visual grid of tools (Make.com, N8N, Claude/MCP, Supabase, Python, JavaScript, Docker, Railway, Google Cloud, GitHub, Airtable, Notion, Apify) over a dot-grid background.
  4. Contact section exposes a working `mailto:kelly@seomarketing.com` link and a LinkedIn link, and the CV download button serves `Harvard_CV_Kelly_Battistoni_EN.pdf` in EN mode and `Harvard_CV_Kelly_Battistoni_ES.pdf` in ES mode.
**Plans**: 6 plans

Plans:
- [ ] 06-01-PLAN.md — Install @icons-pack/react-simple-icons, copy CV PDFs and 3 brand SVGs into public/
- [ ] 06-02-PLAN.md — Draft About prose (EN+ES) and build <About /> with RevealSection + brand-accent divider
- [ ] 06-03-PLAN.md — Draft NDA-safe Projects copy (EN+ES) and build <Projects /> + <ProjectCard /> with ParallaxCard + expand-in-place
- [ ] 06-04-PLAN.md — Draft stack categories (EN+ES), 3 inline-SVG TSX components, stack-registry + StackIcon, build <Stack /> with dot-grid background
- [ ] 06-05-PLAN.md — Draft Contact copy + LinkedIn placeholder (EN+ES) and build <Contact /> with mailto/LinkedIn + EN/ES CV download toggle
- [ ] 06-06-PLAN.md — Wire all four sections into App.tsx and run human browser verification checkpoint

### Phase 7: Polish & Performance
**Goal**: Bring the site to launch quality — Lighthouse 90+, mobile-real-device tested, WCAG AA, cross-browser verified.
**Depends on**: Phase 6
**Requirements**: (criteria-only — exercises every prior requirement under load)
**Success Criteria** (what must be TRUE):
  1. Lighthouse mobile audit scores ≥ 90 on Performance, Accessibility, Best Practices, and SEO with LCP under 2.5s.
  2. Full keyboard tab navigation reaches every interactive element with a visible focus indicator, and body text meets 4.5:1 contrast on the `#050505` background.
  3. `prefers-reduced-motion: reduce` disables Plasma, scroll-reveal, parallax, and PillNav entrance animations — the page is fully usable without motion.
  4. Site renders correctly on a real mid-range Android device (375–430px), latest Chrome, Safari 16.4+, and Firefox; Open Graph 1200×630 image and per-language `<title>`/`hreflang` meta tags appear in LinkedIn/WhatsApp previews.
**Plans**: TBD

### Phase 8: Deployment
**Goal**: Ship the site live at `KellyBattistoni.github.io` via the `gh-pages` branch with deep-link safety.
**Depends on**: Phase 7
**Requirements**: INFRA-05
**Success Criteria** (what must be TRUE):
  1. `npm run deploy` publishes `dist/` to the `gh-pages` branch and GitHub repo Settings → Pages reports the site as live.
  2. Visiting `https://KellyBattistoni.github.io/` loads the production hero within 2.5s LCP and language preference persists across reloads.
  3. Deep links like `https://KellyBattistoni.github.io/#/about` resolve to the correct section (HashRouter) and the `public/404.html` defensive redirect is in place.
  4. A GitHub Actions workflow (optional but configured) auto-deploys on push to `main`, or a documented manual `npm run deploy` flow exists in the README.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold + Safety Rails | 3/3 | Complete ✓ | 2026-06-09 |
| 2. i18n Backbone | 3/3 | Complete ✓ | 2026-06-10 |
| 3. Scroll Infrastructure | 3/3 | Complete ✓ | 2026-06-10 |
| 4. Visual Foundations — Plasma + Noise | 0/TBD | Not started | - |
| 5. Hero + PillNav — First Vertical Slice | 0/TBD | Not started | - |
| 6. Content Sections | 0/TBD | Not started | - |
| 7. Polish & Performance | 0/TBD | Not started | - |
| 8. Deployment | 0/TBD | Not started | - |

---
*Roadmap created: 2026-06-09*
