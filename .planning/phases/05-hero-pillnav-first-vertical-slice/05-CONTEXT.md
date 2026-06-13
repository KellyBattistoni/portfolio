# Phase 5: Hero + PillNav — First Vertical Slice - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Full-screen hero with Plasma backdrop, bilingual name/tagline/CTA, scroll-parallax on hero content, and a scroll-triggered PillNav with language toggle — all working together as the first complete vertical slice. Mobile gets a hamburger trigger and a side-panel menu. Content sections (About, Projects, etc.) are Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Hero layout & copy
- Full name "Kelly Battistoni" in large Playfair Display display type — one typographic statement
- Centered layout: name, tagline, CTA stacked vertically in the middle of the viewport
- Tagline: **"I automate what holds people back."** — statement-first, no role label
- Nothing between tagline and CTA (clean three-element stack: name → tagline → button)
- Single primary CTA: **"See my work"** — scrolls to Projects section
- CTA button style: Claude's discretion (pick what reads best over the dark animated Plasma backdrop)

### Hero scroll behavior
- Parallax at different speeds: each element (name, tagline, CTA) shifts on scroll at its own rate
- Content starts disappearing at 30–40% of hero height scrolled (midway trigger)
- No scroll-indicator hint (no chevron, no "SCROLL" label)
- Plasma fade/unmount behavior already wired from Phase 4 (04-02 HeroBackdrop dispatcher) — do not re-implement

### PillNav design & entrance
- Items: About / Work / Stack / Contact + language toggle (EN/ES baked into the pill row)
- Position: top-right, fixed — anchored to the right side of the header
- Entrance: fades in from opacity 0 while sliding left-to-right (appears after 70% hero height scrolled)
- Hover effect: text nudges upward (y transform) and a circle background simultaneously appears beneath the item ("rising circle")

### Mobile nav experience
- Trigger (☰ icon): appears after 70% hero height scrolled — same timing as desktop PillNav
- Menu style: side panel that slides in from the right, partial width
- Side panel contains: nav links (About / Work / Stack / Contact) + language switcher (EN/ES)
- Nav links in panel: large text, staggered entrance (items animate in one by one)
- Closing: tapping the backdrop OR an × button inside the panel
- Tapping a nav link: panel closes and page scrolls to section simultaneously
- The ☰ icon becomes × when the panel is open

### Claude's Discretion
- CTA button visual style (ghost vs solid fill — pick whichever reads best over dark Plasma)
- Exact parallax speed values for each hero element
- Exact pixel width of mobile side panel
- Background color/blur for the PillNav pill container
- GSAP timeline specifics for panel open/close (easing, duration)

</decisions>

<specifics>
## Specific Ideas

- Tagline direction: "I automate what holds people back." — human-first framing, automation as liberation. User specifically wanted a statement that's memorable and positions her as more than a technical role.
- User rejected title-based taglines ("AI Systems Architect", "Automation strategist") — the tagline must be a statement, not a label.
- PillNav items use "Work" not "Projects" — match this in the nav.
- Mobile panel items stagger in one by one — this is explicitly wanted, not just a nice-to-have.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-hero-pillnav-first-vertical-slice*
*Context gathered: 2026-06-12*
