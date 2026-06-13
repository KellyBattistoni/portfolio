# Phase 6: Content Sections - Context

**Gathered:** 2026-06-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver all remaining content sections — About, Projects (with parallax), Stack, Contact, CV download — fully bilingual on top of the proven Phase 5 architecture. Creating new capabilities (meeting scheduler, booking forms) is out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### About section shape
- Format: flowing prose, 2–3 paragraphs. No bullet points, no headers — reads like a person, not a résumé.
- Story arc: Claude's discretion — pick the arc that best fits the project's core value statement ("she sees the full system, adapts faster than anyone, always thinks ahead on the business").
- Anchor reference: 1–2 key references allowed. Use SEO / marketing agency work as the primary anchor — no company names or dates, but domain and scope are fair game.
- Visual accent: one subtle design element (e.g. thin divider, brand-color highlight on a key phrase, or decorative typographic element). Not text-only, not heavily illustrated.
- CTA / closing: Claude decides based on flow into the Projects section.

### Projects section layout
- Desktop arrangement: staggered / offset — cards alternate left and right, creates visual rhythm that complements parallax depth.
- Card face metadata: project name + context, industry/client type (no org names), tech stack tags, and outcome metric.
- Card interaction: expand in place on click — reveals a Problem / Solution / Result structure (three short blocks).
- Count: 3–4 cards. Content not yet written — Claude drafts NDA-safe descriptions in both EN and ES; user refines during browser verification.
- Draft approach: collaborative — Claude writes initial EN + ES copy using known background (SEO/marketing agency domain, tools: Make.com, N8N, Claude/MCP, Supabase, Python, JS, Docker, Railway, Google Cloud, GitHub, Airtable, Notion, Apify), user iterates.

### Stack display
- Grouping: by category — Automation / AI / Infrastructure / Data (or equivalent grouping that fits the 13 tools cleanly).
- Entry format: icon + name only. No one-line descriptors.
- Dot-grid background: Claude decides whether it's full-section or behind-grid-only, based on what cleanest separates Stack from adjacent sections visually.
- Hover effect: subtle scale on hover (1.05–1.1×). Respects reduced-motion policy.
- i18n depth: Claude decides translation granularity. Tool names stay in EN (brand-fixed); section title and category labels should translate.

### Contact + CV behavior
- Section structure: single final section at the bottom of the page. Order within the section: heading → short invitation copy (2–3 sentences, framing what kind of work Kelly takes on) → mailto link + LinkedIn link → CV download toggle at the bottom.
- CV download: explicit EN/ES toggle button. User picks which language version to download regardless of current site language.
- CV files: `Harvard_CV_Kelly_Battistoni_EN.pdf` and `Harvard_CV_Kelly_Battistoni_ES.pdf` (already in repo root, copy to `public/` during this phase).
- Email: `kelly@seomarketing.com` (mailto link).
- LinkedIn URL: to be supplied by user before implementation — leave as placeholder `LINKEDIN_URL` in locale JSON.

### Claude's Discretion
- About narrative arc and closing CTA/no-CTA decision
- Dot-grid scope (full-section vs. contained behind grid)
- Stack i18n translation granularity (beyond section title)
- Invitation copy tone in Contact (Claude writes first draft, user refines)
- Exact parallax speed values per project card (within the established ParallaxCard API)

</decisions>

<specifics>
## Specific Ideas

- Projects use the existing `ParallaxCard` multi-layer API (Phase 3) with staggered layout — each card shifts at a distinct speed, left/right offset creates visual rhythm
- Stack icons should be sourced from Simple Icons or equivalent (all brand-accurate SVGs, no mismatched styles)
- About section should contain no resume bullet points (ROADMAP requirement) — prose enforces this
- CV download lives at the bottom of Contact (not in the nav), with an explicit EN/ES picker rather than auto-serving the current language version

</specifics>

<deferred>
## Deferred Ideas

- Meeting scheduler / booking form (e.g. Google Calendar integration, Calendly embed) in Contact section — mentioned during discussion; this is a new capability beyond Phase 6 scope. Consider for Phase 7 Polish or as a standalone addition after launch.

</deferred>

---

*Phase: 06-content-sections*
*Context gathered: 2026-06-13*
