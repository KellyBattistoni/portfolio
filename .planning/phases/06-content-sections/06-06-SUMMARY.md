---
phase: 06-content-sections
plan: 06
subsystem: ui
tags: [react, gsap, scrolltrigger, animation, background, texture, css-gradient]

requires:
  - phase: 05-hero-pillnav-first-vertical-slice
    provides: Hero, PillNav, MobileNav mounted in App.tsx with heroRef wiring
provides:
  - About, Projects, Stack, Contact wired into App.tsx after Hero/Nav
  - Bidirectional GSAP scroll animations on all four content sections
  - Distinct per-section background atmospheres (gradient + texture layer each)
  - Body-level fixed radial gradient tying all sections into one color palette
  - section:replay CustomEvent system for PillNav-triggered animation restarts
  - Hero indigo corner accents for tonal continuity to first content section
affects: [07-polish-performance, 08-deployment]

tech-stack:
  added: []
  patterns:
    - Two-trigger bidirectional GSAP pattern (enter top 90% + reverse top 35%, requires empty onEnter to activate onLeaveBack)
    - Re-entry split — mid-reverse → tl.reversed(false).play(); fully-reversed → tl.restart(); completed/replay → no-op
    - section:replay CustomEvent dispatch from PillNav + useEffect listener per section
    - Per-section background layer composition (radial gradient atmosphere + texture + mask)
    - Body fixed radial gradient as page-wide color anchor

key-files:
  created:
    - src/components/sections/About.tsx
    - src/components/sections/Projects.tsx
    - src/components/sections/Stack.tsx
    - src/components/sections/Contact.tsx
    - src/components/sections/ProjectCard.tsx
  modified:
    - src/App.tsx
    - src/components/hero/Hero.tsx
    - src/styles/index.css

key-decisions:
  - "Two-trigger GSAP pattern per section: enter top 90% plays, reverse top 35% reverses — onLeaveBack requires prior onEnter (empty onEnter added)"
  - "Re-entry splits on tl.reversed() state: mid-reverse plays forward; fully-reversed restarts; completed/replay no-ops"
  - "section:replay CustomEvent dispatched by PillNav on nav-click — each section listens via useEffect and calls tlRef.current?.restart()"
  - "Hero→About bridge gradient: indigo top → orange 22% → transparent 50% — smooth tonal transition from hero indigo corners into About"
  - "Projects dual-accent: indigo at top-right + orange at bottom-left — opposite corners from About"
  - "Stack: dot-matrix 22px grid (1px radial-gradient circles) — technical/circuit-board feel"
  - "Stack dual-color: orange lower-right + indigo upper-left — mirrors About's opposite-corner placement"
  - "Contact: rising ember glow from bottom + falling indigo from top + SVG grain — warm farewell atmosphere"
  - "Body fixed radial-gradient (3 soft ellipses) — ties all sections into one color world"
  - "Mask gradient 0%→5%→65%→100% (tight top entry, early fade-out) — color reads immediately, fades before next section"

patterns-established:
  - "Two-trigger bidirectional GSAP: enter trigger (top 90%) plays, reverse trigger (top 35%) reverses — empty onEnter required on reverse trigger to activate onLeaveBack"
  - "Per-section background: atmosphere layer (radial gradient) + texture layer (grain or dot-matrix) + mask gradient — three independent aria-hidden divs"
  - "Mask 0%/5%/65%/100% — tight top entry so color appears immediately, fade-out at 65% so sections don't bleed into each other"

requirements-completed: []

duration: multi-session
completed: 2026-06-16
---

# Phase 6: Content Sections — Summary

**Four bilingual content sections ship with cinematic bidirectional GSAP scroll animations and distinct per-section background atmospheres; body-level fixed gradient ties the full page into one color world.**

## Performance

- **Duration:** Multi-session (2026-06-15 → 2026-06-16)
- **Tasks:** 2 formal + 3 polish passes (copy, animation, backgrounds)
- **Files modified:** 7 source files

## Accomplishments

- Wired About → Projects → Stack → Contact into App.tsx after Hero/Nav, each in its own AnimationErrorBoundary
- Bidirectional GSAP scroll system: accent line scaleX draw → h2 rise → section-specific stagger, reversing on scroll-up, replaying on scroll-down
- Each section has its own background identity (About: grain + orange/indigo radials; Projects: perspective grid + corner accents; Stack: dot-matrix + dual-color atmosphere; Contact: ember glow from bottom + grain)
- Body-level fixed radial gradient provides consistent color foundation visible through all section tops
- PillNav dispatches `section:replay` CustomEvent on nav-click — each section restarts its timeline

## Task Commits

1. **Wire sections into App.tsx** — `40be322`
2. **About copy + Projects redesign** — `8029fd2`
3. **About cinematic GSAP animation** — `3f4d6c7`
4. **Stack redesign, Contact personalization, 29-tool registry** — `260b759`
5. **Cinematic section backgrounds, SVG icons, smooth gradients** — `927816a`
6. **Final background polish: body gradient, Hero corners, section textures** — *(this commit)*

## Files Created/Modified

- `src/App.tsx` — wires all four sections, removes Phase 5 placeholder
- `src/components/sections/About.tsx` — prose + career arc + stats; grain + radials; bidirectional animation
- `src/components/sections/Projects.tsx` — 6-card staggered grid; perspective grid; bidirectional animation
- `src/components/sections/Stack.tsx` — 29-tool dot-matrix grid; dual-color atmosphere; bidirectional animation
- `src/components/sections/Contact.tsx` — email + LinkedIn gate + CV EN/ES toggle; ember glow; bidirectional animation
- `src/components/hero/Hero.tsx` — indigo corner accents bridging tonal continuity into About
- `src/styles/index.css` — body fixed radial-gradient background
