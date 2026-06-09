# Research Summary

**Project:** Kelly Battistoni Villota - Personal Portfolio
**Domain:** Animation-heavy React SPA, bilingual EN/ES, GitHub Pages, AI/Automation professional
**Researched:** 2026-06-09
**Confidence:** HIGH overall (stack locked by inspo source; patterns verified against official docs)

---

## Recommended Stack

- **React 18.3.x + Vite 5.x** - UI runtime and build tool; avoid React 19 until GSAP/Framer/OGL ecosystems have more battle-testing against it
- **Tailwind CSS v4 + @tailwindcss/vite** - CSS-first config, no postcss.config.js required; needs Safari 16.4+ (acceptable for 2026 tech audience)
- **GSAP 3.12.x** - PillNav timeline animations; all plugins free post-Webflow acquisition; use gsap.context().revert() for React cleanup
- **Framer Motion 11.x (or motion package)** - section scroll-reveal and hover interactions; verify package name at install (framer-motion vs motion)
- **OGL 1.0.x** - Plasma WebGL background; ~50KB vs three.js ~600KB; correct tool for a single fullscreen shader
- **react-i18next + i18next + i18next-browser-languagedetector** - EN/ES translations bundled as static JSON imports; language persisted to localStorage
- **HashRouter (react-router-dom v7)** - GitHub Pages static host requires this; BrowserRouter will 404 on any direct URL visit
- **gh-pages v6** - npm run deploy pushes dist/ to gh-pages branch; predeploy script runs build automatically
- **clsx + tailwind-merge** - cn() helper for safe conditional className composition
- **react-helmet-async** - per-language title and meta tags for LinkedIn/WhatsApp preview cards

vite.config.ts non-negotiable: base set to "/" because this is a user site (KellyBattistoni.github.io), not a project site. Setting /repo-name/ is the most common silent-break on first deploy.

---

## Table Stakes Features

Features visitors expect - portfolio fails without these:

- **Clear positioning hero** - name + role (AI Automations Manager) + value prop above the fold within 3 seconds; no generic opening copy
- **3-6 deep project case studies** - each with problem, approach, outcome metric, and tech used; quality over quantity
- **Quantified business outcomes per project** - Reduced manual reporting from 14 hours/week to 20 minutes beats Built automation workflow
- **One-click contact** - direct mailto link is mandatory; form is supplementary (60%+ form abandonment rate); LinkedIn in obvious location
- **CV/Resume download** - EN and ES PDF versions; one-click; current within 30 days
- **Working bilingual toggle (EN/ES)** - persistent, preserves section context on switch, browser auto-detect on first visit; broken toggle is immediately unprofessional
- **Mobile responsive at 375px-430px** - 55-65% of portfolio traffic is mobile; test on a real mid-range Android, not Chrome DevTools
- **Sub-2.5s LCP** - premium positioning collapses if site feels slow; optimize hero assets ahead of launch
- **Stack/Expertise section** - categorized logo grid for n8n, Make, OpenAI, Anthropic, Supabase, etc.; recruiters scan for keyword match
- **About section with engineer-to-AI narrative** - the mechanical engineering pivot is a USP; must be told clearly, not buried
- **Favicon + Open Graph image (1200x630px)** - LinkedIn/WhatsApp link preview is the first impression for many visitors
- **WCAG AA accessibility** - dark themes fail contrast checks frequently; body text must hit 4.5:1; focus indicators required; prefers-reduced-motion must disable all animations

---

## Key Differentiators

What will make this portfolio stand out:

- **Engineer-to-AI narrative thread** - mechanical engineering background is rare in AI automation; weave systems thinking from manufacturing applied to data pipelines into hero, about, and project framing
- **Workflow/process diagrams as first-class visuals** - automation IS the visual asset; annotated diagrams, before/after comparisons, and system architecture views outperform raw screenshots
- **Cinematic Plasma hero** - OGL fullscreen WebGL background with #FF4500 accent fading on scroll; Playfair Display + Inter typography; subtle motion signals craft without trying too hard
- **Quantified outcomes leading project cards** - the outcome metric is the headline; most portfolios show what was built, not what changed
- **GSAP PillNav** - signature animated pill navigation appearing after the hero scrolls away; the technical centerpiece of the aesthetic
- **Bilingual as a positioning lever** - EN/ES done as first-class architecture signals LATAM market relevance; a Google Translate widget is the visible anti-pattern
- **Personality-driven copywriting** - first-person voice with a point of view differentiates from generic third-person bios
- **Testimonials (1-2 quotes)** - even one strong quote from SEOMarketing leadership with photo, name, and role is high-leverage; most portfolios have none

---

## Critical Pitfalls to Avoid

The five highest-stakes risks with one-line prevention each:

1. **OGL canvas not cleaned up on unmount** - cancel requestAnimationFrame, call loseContext(), and set canvas.width = 0 in the useEffect cleanup; React 18 StrictMode double-mounts effects in dev and leaks two GL contexts without this
2. **GSAP timelines survive component unmount** - wrap every GSAP call in gsap.context() and return ctx.revert() from useEffect; this is the only correct GSAP-in-React pattern
3. **Wrong Vite base config blanks the deployed site** - base must be "/" for KellyBattistoni.github.io; setting /repo-name/ is the most common silent break; always test with npm run build and npm run preview before first deploy
4. **Spanish text is 15-25% longer than English** - design every UI component at ES (longest) length first; fixed-width buttons and split-text animations break when ES content arrives if sized for EN
5. **No animation kill switch from day one** - build useDeviceCapabilities() returning prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 in Phase A before any animation code; retrofitting graceful degradation across GSAP, Framer, and OGL simultaneously is an architectural rebuild

---

## Build Order

Dependency-ordered phase sequence derived from architecture research:

**Phase A - Scaffolding + Safety Rails**
Vite + React + TypeScript scaffold; Tailwind v4 with #050505/#FF4500 CSS variables; Playfair Display + Inter fonts wired; cn() helper; vite.config.ts with base "/"; package.json deploy scripts; useDeviceCapabilities() kill switch hook and ErrorBoundary around animation roots. Must exist before every other phase.

**Phase B - i18n Backbone**
Install i18next + react-i18next + i18next-browser-languagedetector; create src/locales/{en,es}/*.json namespace files (common, hero, about, projects, stack, contact); initialize with useSuspense: false (resources are statically imported, not async); import before App in main.tsx; verify language switch, localStorage persistence, and document.documentElement.lang update. i18n must be wired before writing any section component.

**Phase C - Scroll Infrastructure**
Single ScrollProvider context with rAF-coalesced passive listener publishing { y, progress }; RevealSection using IntersectionObserver one-shot reveals; ParallaxCard using compositor-only translate3d offsets. All scroll-driven effects consume via useScroll() - never attach individual window.scroll listeners inside components.

**Phase D - Visual Foundations**
NoiseOverlay (fixed, pointer-events:none, mix-blend-overlay); Plasma.tsx ported from inspo source with DPR clamped to 2 and full useEffect cleanup on unmount; PlasmaBackdrop that fades opacity via scroll progress and unmounts Plasma at opacity less than 0.02 to stop the rAF loop; static CSS radial gradient fallback when prefersReducedMotion or low-end device detected. Plasma must exist before HeroSection visual is complete.

**Phase E - Hero + PillNav (First Vertical Slice)**
HeroSection with all i18n strings and hero content parallax via useScroll; PillNav ported from inspo (already TSX; treats hash-prefixed hrefs as plain anchor tags); NavSlot wrapping PillNav in scroll-reveal that triggers at 70% of hero height; LanguageSwitcher. If hero + PillNav + Plasma + i18n + scroll all work together here, the architecture is proven.

**Phase F - Content Sections**
AboutSection, ProjectsSection using ParallaxCard, StackSection, ContactSection with CVDownloadButton that picks PDF by i18n.language, FooterSection. Sections are parallel-eligible once Phase C primitives exist. Populate all locale JSON files. Test every component in both EN and ES before marking done. The case study visual and copy work for projects.json is the primary effort.

**Phase G - Polish and Performance**
Lighthouse audit targeting 90+ performance score; Plasma cost profiling on mid-range Android emulation; full tab/keyboard navigation audit; prefers-reduced-motion check across all animations; lazy-load below-fold sections with React.lazy; Open Graph and hreflang meta tags; react-helmet-async for per-language title updates; font preload links in index.html.

**Phase H - Deployment**
public/404.html redirect fallback (defensive, costs nothing even with HashRouter); configure GitHub repo name as KellyBattistoni.github.io; run npm run deploy; verify gh-pages branch in repo Settings > Pages; verify /#/about deep-link works on the live URL; optionally add GitHub Actions workflow for auto-deploy on push to main.

Critical sequencing rules:
- Phase B (i18n) must exist before any section component in E or F
- Phase C (ScrollProvider) must exist before any scroll-consuming component in D or E
- Phase D (Plasma) must exist before HeroSection visual is complete in E
- Phase A kill switch hook must exist before any animation code in D, E, or F
- Section id attributes must match PillNav href values; coordinate #hero, #about, #projects, #stack, #contact across Phases E and F

---

## Open Questions

Decisions required before execution begins:

1. **TypeScript vs JSX-only** - architecture research and the inspo source are both TSX; recommend TypeScript for i18n key type-safety and component prop contracts
2. **Tailwind v3 vs v4** - both research files lean toward v4; confirm it is the headline install path at tailwindcss.com before starting; inspo utility classes work identically in both versions
3. **framer-motion vs motion package name** - renamed circa 2024; run npm view on both at install time; pick the one with the higher active version; do not install both
4. **How many case studies are ready and NDA-safe?** - depth (3-4 full case studies) beats breadth (8+ shallow cards); plan anonymized framing before writing projects.json if SEOMarketing work requires it
5. **Primary CTA: clients or jobs?** - consulting availability vs exploring senior AI strategy roles require different hero copy and contact framing; one must lead
6. **EN and ES CV PDFs both exist?** - architecture assumes two PDFs in public/; if only EN exists now, default both languages to it temporarily with no architectural change needed later
7. **Plasma GLSL shader written or needs authoring?** - the inspo provides the OGL renderer wrapper but not the plasma GLSL; Phase D must include shader authoring plus a mobile CSS gradient fallback in parallel