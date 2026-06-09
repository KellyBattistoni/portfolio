# Phase 1: Scaffold + Safety Rails - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a buildable React+Vite+Tailwind project with design tokens, a `useDeviceCapabilities` hook, a `<NoiseOverlay />` component, and an ErrorBoundary wrapping the animation root — before any animation code is written. No real UI content yet; this phase is the infrastructure foundation everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### TypeScript
- Use TypeScript (.tsx/.ts) throughout — not JavaScript
- `strict: true` in tsconfig
- Configure `@/` path alias mapping to `src/` (synced across tsconfig.json and vite.config.ts)
- Lint/format setup (ESLint + Prettier): Claude's discretion on whether to wire in Phase 1

### Noise texture
- Implementation approach: Claude's discretion (static PNG preferred for simplicity and visual consistency)
- Opacity/visibility: Claude's discretion based on dark-cinematic aesthetic
- Reduced-motion behavior: Claude's discretion (accessibility default)
- DOM placement: dedicated `<NoiseOverlay />` React component (not a CSS pseudo-element), so it can be toggled or animated in later phases

### Device capability thresholds
- `isMobile`: triggers at ≤ 430px viewport width (matches the roadmap's mobile design target; tablets get desktop experience)
- `isLowEnd`: Claude's discretion on detection strategy (hardwareConcurrency and/or deviceMemory)
- `prefersReducedMotion`: Claude's discretion — reactive vs. read-once based on WCAG best practices
- `isMobile` reactivity: **yes** — updates live on window resize via resize listener
- `supportsWebGL2`: detected once on mount (capability doesn't change mid-session)

### ErrorBoundary fallback
- Fallback appearance: **static gradient in brand colors** — `#050505` background with a `#FF4500` radial glow. Looks intentional, user never sees a broken state.
- Error logging: log to `console.error` now; expose an `onError` prop for future external reporting hookup
- Scope: Claude's discretion (Phase 1 success criteria says "wraps a placeholder animation root" — scope matches that)

</decisions>

<specifics>
## Specific Ideas

- The `#FF4500` radial glow in the ErrorBoundary fallback should feel like the Plasma backdrop's static stand-in — not an error indicator, just the brand background
- `<NoiseOverlay />` as a component makes it easy to conditionally render or animate opacity in later phases (Phase 7 polish)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 1 scope

</deferred>

---

*Phase: 01-scaffold-safety-rails*
*Context gathered: 2026-06-09*
