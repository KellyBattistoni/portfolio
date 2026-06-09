# Kelly Battistoni — Personal Portfolio

## What This Is

A bilingual (EN/ES) personal portfolio website for Kelly Lorena Battistoni Villota — a mechanical engineer turned AI Automations Manager — designed to build her personal brand in the AI/tech space. The site showcases her client work, personal projects, and technical stack through a dark, cinematic, deep-red atmospheric aesthetic that feels like a premium editorial statement, not a corporate resume.

## Core Value

A visitor should leave thinking: *"This person doesn't just execute tasks — she sees the full system, adapts faster than anyone, and always thinks ahead on the business."*

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Design & Visual Identity**
- [ ] Dark atmospheric landing page: near-black (#050505) background, deep red (#FF4500) accent, noise texture overlay
- [ ] Plasma WebGL hero background (OGL-based React component) — full-bleed behind hero, fades on scroll
- [ ] PillNav (GSAP-powered) — hidden during hero, appears on scroll, pill-shaped with rising circle hover effect
- [ ] Scroll-triggered reveal animations (Intersection Observer) on all sections
- [ ] Parallax floating cards in projects section
- [ ] Serif (Playfair Display) + sans-serif (Inter) typography system
- [ ] Dot-grid background pattern on select sections

**Content Sections**
- [ ] Hero: Name, tagline, CTA — with Plasma background, fades on hero scroll
- [ ] About: Story framed as "the engineering mindset never changed, the domain did" — from fluid dynamics to AI workflows. Subtle personality hints (not front-and-center personal).
- [ ] Projects: Client work from SEOMarketing (high-level, NDA-respectful), personal/side projects — with parallax card layout
- [ ] Stack/Expertise: Visual showcase of tools — Make.com, N8N, Supabase, Python, Docker, etc.
- [ ] Contact: Email + LinkedIn links, clear CTA
- [ ] CV Download: Downloadable PDF from the site

**Bilingual Support**
- [ ] Full EN/ES language switcher — all copy available in both languages
- [ ] Language persisted across navigation

**Deployment**
- [ ] React + Vite project scaffolded and buildable
- [ ] Deployed to GitHub Pages at KellyBattistoni.github.io
- [ ] GitHub repository set up and connected

### Out of Scope

- Blog/writing section — not in v1, may revisit for v2
- GitHub activity display — portfolio is strategy-forward, not dev-portfolio style
- Twitter/X, Instagram, other social links — only LinkedIn + email
- Mobile app version — web-first

## Context

**The brand narrative:** Kelly's engineering background (SOLIDWORKS, ANSYS, MATLAB, numerical fluid simulations) gave her systems thinking and precision. That same mindset now drives her AI automation work. The pivot wasn't a departure — it was a domain transfer. Her differentiator isn't just that she builds things that work; it's that she proposes full automation strategies, not single flows, and anticipates business needs before clients articulate them.

**Design inspiration (inspo.txt):**
- Landing page reference: Superdesign — deep red/orange atmospheric gradients, Playfair Display + Inter, scroll reveal, floating parallax cards, dot-grid background, noise texture overlay, surrealist floating elements
- Plasma component: OGL-based WebGL shader, `color="#ff4500"`, mouse-interactive, hero background
- PillNav component: GSAP, rising-circle hover, responsive mobile menu, entrance animation on mount

**Technical environment:**
- Stack: React 18 + Vite, Tailwind CSS, Framer Motion, GSAP 3, OGL (for Plasma), React Router DOM
- Deployment: GitHub Pages — repo name `KellyBattistoni.github.io` for root URL
- Vite base config: `base: "/"` (root repo = no subdirectory needed)

**Key client work to reference (NDA-respectful):**
- PlanITROI, CISOnow, TP Digital, 911 Restoration — USA, Asia, Europe
- Built and deployed production automations across Make.com, N8N, Supabase, Google Cloud

## Constraints

- **NDA**: Client project descriptions must be high-level — outcomes and tech, not proprietary workflow details
- **Bilingual**: Every content string must have both EN and ES variants from day one — no retrofit later
- **GitHub Pages**: Vite build must target `gh-pages` branch; repo named `KellyBattistoni.github.io` for root URL
- **Performance**: Plasma WebGL must cap devicePixelRatio at 2 and implement a low-performance fallback for mobile

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite over Next.js | Inspo components are React; no SSR needed for a portfolio; simpler GH Pages deploy | — Pending |
| Plasma only on hero, fades on scroll | Cinematic opening without burning GPU throughout the entire session | — Pending |
| PillNav hidden during hero, appears on scroll | Maximizes the dramatic, full-screen opening moment | — Pending |
| EN/ES from day one (not retrofit) | Bilingual is a feature, not a patch — hardcoding EN first creates debt | — Pending |
| Root GitHub Pages repo (KellyBattistoni.github.io) | Cleaner URL — no `/portfolio` subdirectory in the base path | — Pending |

---
*Last updated: 2026-06-09 after initialization*
