# Phase 2: i18n Backbone - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire react-i18next with EN/ES namespaces and a working language switcher before any section component or hardcoded string exists. Delivers the translation infrastructure, 6 namespace JSON files (en + es), browser locale detection, localStorage persistence, and a switcher component. Section copy and full UI are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Translation content
- Copy is still being drafted — JSON files use human-readable placeholder strings (not empty strings, not key names as values) so the system is visually verifiable
- A minimal hero block (name + tagline + CTA label) ships as the Phase 2 demo string — enough to confirm language switching works end-to-end
- CV download link (EN.pdf vs ES.pdf) handled in component logic, not in translation files — keeps i18n files for display strings only

### Switcher UI
- Temporary placement: top-right of App.tsx via absolute/fixed positioning — relocated to PillNav in Phase 5
- Appearance: underline tabs — `EN` and `ES` as text labels with an animated underline sliding to the active language
- Language-switch transition: quick text fade (content fades out → language swaps → content fades in)
- Component is wrapped in `AnimationErrorBoundary` — consistent with the Phase 1 policy of bounding anything with a transition

### Key naming
- Structure: shallow nesting where a section has logical sub-groups; flat for simple namespaces (e.g. `{ heading: { title, tagline }, cta: "..." }`)
- Case: camelCase for all key names
- Interpolation: react-i18next default double-curly `{{var}}`
- Missing key fallback: show the key path itself (e.g. `hero:heading.title`) — makes gaps immediately visible during development

### Namespace scope
- `common`: everything reusable across sections — nav labels, shared button labels, error messages, aria labels, EN/ES switcher labels, and a `meta` key group (`{ meta: { title, description } }`) for page-level strings (populated in Phase 7)
- `hero`, `about`, `stack`, `contact`: section-specific strings; no cross-namespace sharing
- `projects`: sub-key per project — `{ project1: { title, context, outcome, tech }, project2: { ... } }` — easy to add/remove without touching siblings
- `stack`: category headings are translated (`Automation / Automatización`); tool names (Make.com, N8N, Supabase, etc.) are proper nouns and stay in English in both locales

### Claude's Discretion
- Exact placeholder string content in JSON files
- `meta` group populated in Phase 7; only the key structure defined now
- Whether to use `react-i18next`'s `I18nextProvider` or the `initReactI18next` plugin pattern (choose the conventional plugin approach)
- Static import bundling strategy (single i18n init file that imports all 12 JSON files)

</decisions>

<specifics>
## Specific Ideas

- Underline tabs should feel consistent with the dark-cinematic aesthetic — white/off-white text, accent underline (`#FF4500` or similar), no border/box
- The switcher is temporary in Phase 2 but should already be a self-contained component (`LanguageSwitcher`) so PillNav can import it directly in Phase 5 without rewriting

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-i18n-backbone*
*Context gathered: 2026-06-09*
