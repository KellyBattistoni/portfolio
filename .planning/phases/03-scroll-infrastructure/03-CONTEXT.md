# Phase 3: Scroll Infrastructure - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide a single rAF-coalesced scroll source and the reveal/parallax primitives every visual component will consume. ScrollProvider, RevealSection, and ParallaxCard are the three deliverables. Content sections, hero layout, and PillNav are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Animation library
- Install GSAP now as the animation foundation — Phase 5 PillNav uses it too; one library across all scroll-animated phases
- Claude decides whether RevealSection uses GSAP ScrollTrigger or another approach for reveal mechanics
- ParallaxCard may use a different technique (e.g., rAF + direct style mutation) if performance warrants it — Claude decides
- RevealSection ships a default `fade-up` variant (opacity: 0, y: 30 → opacity: 1, y: 0) **plus 1–2 additional variants** (e.g., slide-from-left, scale-up) for visual variety in Phase 6

### Reveal feel
- Duration: 500–700ms, ease-out-cubic — smooth and cinematic, not snappy
- Stagger: **on by default** — when RevealSection wraps multiple children, each staggers after the previous (creates cascade effect)
- Viewport threshold: Claude decides (something that feels intentional for a dark-cinematic portfolio)
- Elements already visible on first load: Claude decides (whether they animate in or start visible)

### Parallax behavior
- Speed API: Claude decides the most ergonomic prop interface for Phase 6 usage
- Effect strength: Claude calibrates for moderate-to-cinematic that fits the dark portfolio vibe — not decorative-subtle, not overwhelming
- **Inner layers can move independently** — image and text inside a card can have distinct speeds, building genuine depth
- Card overflow: **clip** (`overflow: hidden` on the card) — content movement stays contained within the frame

### Test harness scope
- Position: add **below** the existing demo hero (don't replace it — Phase 5 will swap the whole hero anyway)
- Cards: 3 `ParallaxCard` instances with **placeholder project card shapes** — fake title, context blurb, tech tag chips — approximating the Phase 6 layout
- Styling: **brand-styled** — use `#050505`, `#FF4500`, Playfair Display + Inter; harness looks like early portfolio content
- Debug: no visible overlay — verify ScrollProvider single-listener and scroll values via DevTools

### Claude's Discretion
- GSAP vs GSAP ScrollTrigger vs IntersectionObserver + GSAP for RevealSection mechanics
- Exact viewport entry threshold for reveal trigger
- Whether first-load visible elements animate in or snap to visible immediately
- Parallax speed prop shape (multiplier, named presets, or range)
- Effect strength calibration (speed values for the 3 harness cards)
- Stagger delay interval between children

</decisions>

<specifics>
## Specific Ideas

- GSAP is the confirmed animation library for Phase 5 PillNav — installing it in Phase 3 avoids a second install and lets scroll primitives use the same system
- RevealSection stagger default mirrors common high-quality portfolio patterns (Linear, Stripe) where headings, body, and CTAs cascade in
- ParallaxCard with inner-layer depth is the feature that makes the Projects section feel premium — even if Phase 3 only proves it in a test harness

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-scroll-infrastructure*
*Context gathered: 2026-06-10*
