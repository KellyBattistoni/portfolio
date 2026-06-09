# Requirements: Kelly Battistoni Portfolio

**Defined:** 2026-06-09
**Core Value:** A visitor leaves thinking: "This person doesn't just execute tasks — she sees the full system, adapts faster than anyone, and always thinks ahead on the business."

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: Project is scaffolded with React 18 + Vite + TypeScript + Tailwind v4, builds without errors
- [ ] **INFRA-02**: `useDeviceCapabilities()` hook exists before any animation — detects `prefersReducedMotion`, `isMobile`, `supportsWebGL2`; all animations respect it
- [ ] **INFRA-03**: react-i18next backbone initialized with EN/ES JSON namespaces (6 namespaces: hero, about, projects, stack, contact, common) before any section component is written
- [ ] **INFRA-04**: Single `ScrollProvider` context with rAF coalescing publishes `{ y, progress }` — all scroll consumers read from this, no per-component scroll listeners
- [ ] **INFRA-05**: Site is deployed and live at `KellyBattistoni.github.io` via `gh-pages` branch

### Design & Animations

- [ ] **DESIGN-01**: Dark atmospheric theme applied globally — `#050505` background, `#FF4500` accent color, noise texture overlay, Playfair Display (serif) + Inter (sans-serif) fonts loaded
- [ ] **DESIGN-02**: Plasma WebGL hero background (OGL shader, `color="#FF4500"`, mouse-interactive) — full-bleed behind hero; conditionally **unmounted** (not opacity-faded) once scrolled past to stop GPU rAF loop
- [ ] **DESIGN-03**: PillNav (GSAP) — invisible during hero viewport, appears on scroll; pill-shaped container with rising-circle hover effect per nav item; responsive mobile hamburger menu with GSAP open/close
- [ ] **DESIGN-04**: Scroll-triggered reveal animations (Framer Motion) — each section animates from `opacity: 0, y: 30` to `opacity: 1, y: 0` on scroll entry via Intersection Observer
- [ ] **DESIGN-05**: Parallax project cards — cards in the projects section shift vertically at different speeds on scroll using `ScrollProvider` data (no per-card scroll listener)
- [ ] **DESIGN-06**: Dot-grid radial pattern (`background-image: radial-gradient(circle, #333 1px, transparent 1px); background-size: 40px 40px`) applied to projects and/or stack sections

### Content Sections

- [ ] **CONT-01**: Hero section — Kelly's name, tagline (EN+ES), CTA button, Plasma background; hero content fades and scrolls away on scroll
- [ ] **CONT-02**: About section — narrative framed as "The engineering mindset never changed, the domain did": mechanical engineering precision → AI automation strategy; subtle personality hints; no resume bullet points
- [ ] **CONT-03**: Projects section — 3–4 case study cards with: project name, context (client type/industry), outcome metric or result, tech stack used; parallax layout; NDA-respectful (high-level outcomes, no proprietary workflow details)
- [ ] **CONT-04**: Stack/Expertise section — visual grid showcasing tools: Make.com, N8N, Claude/MCP, Supabase, Python, JavaScript, Docker, Railway, Google Cloud, GitHub, Airtable, Notion, Apify, and more
- [ ] **CONT-05**: Contact section — email (`kelly@seomarketing.com`) + LinkedIn CTA; clear action prompt
- [ ] **CONT-06**: CV Download — both `Harvard_CV_Kelly_Battistoni_EN.pdf` and `Harvard_CV_Kelly_Battistoni_ES.pdf` available for download; correct file served based on active language

### Bilingual (i18n)

- [ ] **I18N-01**: Visible EN/ES language switcher in the nav; switches all text site-wide instantly
- [ ] **I18N-02**: All copy has EN and ES translations in 6 JSON namespaces from day one — no untranslated strings at launch
- [ ] **I18N-03**: Language selection persisted in `localStorage` key `kbv-lang`; returns in chosen language on revisit

## v2 Requirements (Deferred)

### Content
- **CONT-v2-01**: Blog or writing section — thought leadership on AI/automation
- **CONT-v2-02**: Testimonials — quotes from SEOMarketing leadership or clients
- **CONT-v2-03**: GitHub profile link (if relevant content is added to GitHub)

### Design
- **DESIGN-v2-01**: Additional project case study depth pages (full case study view per project)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Blog / writing section | Not in v1 — projects are the priority brand signal |
| GitHub stats / commit graphs | Anti-pattern for AI/strategy portfolio — looks like a dev portfolio |
| Twitter/X, Instagram, other social | Not linked — LinkedIn + email only |
| Light mode toggle | Competes with the cinematic dark aesthetic; excluded deliberately |
| Intro splash / loading screen | Research anti-pattern — increases bounce rate |
| Contact form | Email link preferred — reduces friction and avoids spam/backend complexity |
| Mobile app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 2 | Pending |
| INFRA-04 | Phase 3 | Pending |
| INFRA-05 | Phase 8 | Pending |
| DESIGN-01 | Phase 1 | Pending |
| DESIGN-02 | Phase 4 | Pending |
| DESIGN-03 | Phase 5 | Pending |
| DESIGN-04 | Phase 3 | Pending |
| DESIGN-05 | Phase 3 | Pending |
| DESIGN-06 | Phase 6 | Pending |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| CONT-04 | Phase 6 | Pending |
| CONT-05 | Phase 6 | Pending |
| CONT-06 | Phase 6 | Pending |
| I18N-01 | Phase 2 | Pending |
| I18N-02 | Phase 2 | Pending |
| I18N-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-09*
*Last updated: 2026-06-09 after initial definition*
