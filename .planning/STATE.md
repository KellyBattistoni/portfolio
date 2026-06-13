# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-09)

**Core value:** A visitor leaves thinking: "This person doesn't just execute tasks — she sees the full system, adapts faster than anyone, and always thinks ahead on the business."
**Current focus:** Phase 5 — Hero + PillNav (First Vertical Slice)

## Current Position

Phase: 5 of 8 (Hero + PillNav — First Vertical Slice) — In progress
Plan: 2 of 4 in Phase 5 (05-01 + 05-02 complete)
Status: Plans 05-01 and 05-02 shipped. Hero component built and committed; Plan 05-03 (PillNav + MobileNav) executing in parallel wave 2.
Last activity: 2026-06-13 — Plan 05-02 executed. One task commit (908e256). SUMMARY written.

Progress: [█████░░░░░] 50% (12 of ~24 expected plans)

## Phase Status

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Scaffold + Safety Rails | Complete ✓ | 3/3 |
| 2 | i18n Backbone | Complete ✓ | 3/3 |
| 3 | Scroll Infrastructure | Complete ✓ | 3/3 |
| 4 | Visual Foundations — Plasma + Noise | Complete ✓ | 3/3 |
| 5 | Hero + PillNav — First Vertical Slice | In progress ◑ | 2/4 |
| 6 | Content Sections | Pending | TBD |
| 7 | Polish & Performance | Pending | TBD |
| 8 | Deployment | Pending | TBD |

## Active Work

Phase 5 in progress. Plan 05-02 (Hero component) shipped 2026-06-13. `src/components/hero/Hero.tsx` (~182 LOC) implements a full-screen bilingual hero section: name h1 + tagline p + ghost CTA a (border #FF4500) centered over the HeroBackdrop dispatcher wrapped in AnimationErrorBoundary. Per-element scroll-parallax fade-out via three independent GSAP ScrollTrigger scrub tweens with divergent end values — CTA disappears first at 30% top, tagline at 35% top, name at 40% top (brand anchor stays readable longest). prefersReducedMotion double-guarded (early-return + `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`). sectionRef is a forwarded prop (`React.RefObject<HTMLElement | null>`) so Plan 05-03's PillNav can use the same DOM node as its appear-on-scroll trigger. All GSAP imports route through `@/lib/gsap`. Explicit zIndex on section and content overlay per the Phase 4-03 Chrome GPU compositor fix. Build + lint green. Plan 05-03 (PillNav + MobileNav) executing in parallel Wave 2 — its in-progress source `src/components/nav/PillNav.tsx` was inadvertently captured in the Hero commit (Git for Windows sibling-directory behavior; documented in 05-02 SUMMARY). Next: Plan 05-04 to mount Hero + Nav into App.tsx and retire the Phase 4 test harness placeholder.

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: ~8 min
- Total execution time: ~96 min

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-scaffold-safety-rails | 01 | ~18 min | 2 | 15 |
| 01-scaffold-safety-rails | 02 | ~25 min | 2 | 7 |
| 01-scaffold-safety-rails | 03 | ~20 min | 1 | 2 |
| 02-i18n-backbone | 01 | ~12 min | 3 | 16 |
| 02-i18n-backbone | 02 | ~3 min | 3 | 3 |
| 02-i18n-backbone | 03 | ~5 min | 2 | 3 |
| 03-scroll-infrastructure | 01 | 2 min | 2 | 4 |
| 03-scroll-infrastructure | 02 | 2 min | 2 | 2 |
| 03-scroll-infrastructure | 03 | 2 sessions | 3 (human checkpoint) | 2 |
| 04-visual-foundations-plasma-noise | 01 | 4 min | 3 | 6 |
| 04-visual-foundations-plasma-noise | 02 | 3 min | 2 | 2 |
| 05-hero-pillnav-first-vertical-slice | 01 | ~2 min | 2 | 5 |
| 05-hero-pillnav-first-vertical-slice | 02 | ~3 min | 1 | 1 |

## Accumulated Context

### Decisions

- React + Vite over Next.js (no SSR needed; simpler GH Pages deploy)
- Plasma only on hero, unmount on scroll past (not opacity fade) to stop rAF loop
- PillNav hidden during hero, appears on scroll
- EN/ES wired before any section component (no retrofit)
- Root GitHub Pages repo `KellyBattistoni.github.io` (no `/portfolio` subpath)
- [01-01] `ignoreDeprecations: "6.0"` in tsconfig.app.json — silences TS 6.0 deprecation of `baseUrl` while keeping `@/*` paths working
- [01-01] `jiti` devDep installed — required by ESLint v10 to load `eslint.config.ts`
- [01-01] ESLint config in TypeScript (`eslint.config.ts`) not JavaScript — required removing scaffold's `eslint.config.js`
- [01-02] SVG `feTurbulence` data URI used for noise texture — no binary PNG asset, deterministic, commits cleanly
- [01-02] `react-error-boundary` v6 types `error` as `unknown` — `instanceof Error` guard required in both `FallbackProps` and `onError` callback
- [01-02] `AnimationFallback` renders brand-gradient div only — no visible text, indistinguishable from Plasma placeholder
- [01-03] `useState(getInitialCapabilities)` lazy initializer — synchronous first render, no flash of wrong state
- [01-03] `isLowEnd` and `supportsWebGL2` sampled once on mount only — hardware doesn't change at runtime
- [02-01] i18next bundled static JSON resources (no http-backend, no `<I18nextProvider>`) — single config module at `@/lib/i18n`
- [02-01] localStorage key locked as `kbv-lang` — brand-scoped, no collision
- [02-01] `caches: ['localStorage']` paired with `lookupLocalStorage` — without the pair the key is read but never written
- [02-01] `nonExplicitSupportedLngs: true` — `es-AR`/`es-MX`/`es-419` all resolve to `es`
- [02-01] `parseMissingKeyHandler` returns `'ns:key'` — missing keys render as visible path in dev
- [02-01] CustomTypeOptions augments `'i18next'` (NOT `'react-i18next'`) — `t()` lives on i18next core
- [02-01] `as const` mandatory on both `resources` and `defaultNS` — without it typed `t()` collapses to `(key: string) => string`
- [02-01] `useSuspense: false` — resources are sync-bundled, no Suspense boundary needed
- [02-01] `meta.title`/`meta.description` shipped as empty strings — keys defined now, copy in Phase 7
- [02-01] About/projects/stack/contact namespaces ship `_placeholder` stub — keeps namespace registered + ts-augmented until Phase 3 fills
- [02-02] Hook uses useTranslation() not direct import of @/lib/i18n — keeps hook composable and React-context-aware
- [02-02] LanguageSwitcher reads i18n.resolvedLanguage in active comparison + handleChange guard — never raw i18n.language
- [02-02] handleChange short-circuits if lng === current — avoids redundant changeLanguage calls / re-renders
- [02-02] Switcher hard-codes fixed top-right positioning — Phase 5 strips classes when moving into PillNav (no className prop now)
- [02-02] Accent color #FF4500 inline (after:bg-[#FF4500]) — explicit per CONTEXT.md, not yet hooked to CSS variable token
- [02-02] LanguageSwitcher wrapped in its OWN AnimationErrorBoundary in App.tsx — isolated crash domain from animation root
- [02-02] Demo hero uses inline styles intentionally — throwaway code, Phase 5 replaces the whole <main> with the real Hero component
- [02-03] Phase 2 closure gated by human browser verification (not just automated checks) — i18n correctness lives in the visible UX
- [02-03] User typed "approved" confirming all 4 ROADMAP Phase 2 success criteria PASS — phase marked Complete
- [03-01] Register `ScrollTrigger` AND `useGSAP` in one `gsap.registerPlugin()` call at module level — registering the hook prevents production tree-shaking from dropping it
- [03-01] All GSAP imports across codebase come from `@/lib/gsap` (never `'gsap'` directly) — single registration point, prevents double-registration when code-splitting
- [03-01] Module-level mutable `let scrollY` / `let scrollProgress` instead of `useState` — at 60fps with N consumers, useState-based scroll storage produces ~N × 60 reconciliation cycles per second
- [03-01] `scrollStore` exposes `subscribe()` / `getSnapshot()` / `getRef()` — pub/sub external store consumable by both `useSyncExternalStore` and GSAP ticker hot paths
- [03-01] Snapshot object reallocated per rAF tick — satisfies `useSyncExternalStore` reference-equality contract while staying cheap
- [03-01] `getSnapshot()` and `getRef()` identical today but kept as distinct APIs — `getRef()` signals "GSAP ticker hot path, no React subscription" to readers
- [03-01] rAF coalescing via cancel-and-reschedule (not first-wins) — guarantees the rAF callback always reads the latest scroll position, never stale from earlier in the burst
- [03-01] `window.addEventListener('scroll', onScroll, { passive: true })` — unlocks browser scroll-path optimization, no `preventDefault` ever called
- [03-01] Scroll values initialized on `ScrollProvider` mount (not just at first scroll event) — consumers mounting at non-zero scroll see correct values immediately
- [03-01] `scrollProgress` clamped to `[0, 1]` inside `computeProgress()` — iOS / trackpad overscroll can push `window.scrollY` past max or below 0
- [03-01] `useScrollContext()` throws with file-path hint ("Wrap your app root with <ScrollProvider> in src/main.tsx or App.tsx") — surfaces misconfiguration loudly
- [03-01] `ScrollProvider` not yet mounted in App.tsx — deferred to 03-03 test harness, the first consumer that actually needs the provider in the tree
- [03-02] `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` wraps the entire RevealSection animation setup — runtime-reactive cleanup on top of the `useDeviceCapabilities` early-return
- [03-02] RevealSection stagger uses a SINGLE `gsap.fromTo` over the child array with `stagger: 0.12` — one ScrollTrigger total, not N (matches Phase 3's "one listener total" architecture)
- [03-02] RevealSection ScrollTrigger uses `start: 'top 85%'` + `once: true` — self-killing trigger, no ongoing listener cost after first play
- [03-02] `ease: 'power2.out'` chosen (cubic-out) — matches the "cinematic ease" spec from Phase 3 research; `power3.out` felt overly decelerated for 600ms
- [03-02] RevealSection cleanup uses `ScrollTrigger.getAll().forEach(t => t.kill())` inside the matchMedia branch — every trigger this component created is killed on unmount, no leaks
- [03-02] ParallaxCard reads scroll via `scrollStore.getRef()` inside `gsap.ticker` — NEVER attaches its own scroll listener; ScrollProvider's passive listener is the only one in the app
- [03-02] `gsap.quickSetter(el, 'y', 'px')` chosen over `gsap.set` inside the tick — caches property writer + skips overwrite-manager, ~3x faster per write at 60Hz
- [03-02] Per-tick delta accumulation (current y + delta * speed) instead of absolute mapping — each layer accumulates independently; overscroll bounce absorbed naturally
- [03-02] Early-return when `delta === 0` inside ParallaxCard tick — most frames have zero scroll change; skips ~3 reads + N writes per idle frame
- [03-02] ParallaxCard `overflow: hidden` LOCKED per user decision — drift clipped within card frame, no bleed into neighboring sections
- [03-02] ParallaxCard skips parallax on `isMobile` (≤ 430px) in addition to reduced-motion — preserves battery, avoids visual jank where depth is barely perceptible
- [03-02] Multi-layer ParallaxCard API (`layers: { content, speed, className? }[]`) ships now — resolves the Phase 3 research open question; no Phase 6 refactor expected
- [04-01] ogl@^1.0.11 pinned (matches inspo, current published version, Unlicense) — ships own types/index.d.ts, NO `@types/ogl` (does not exist)
- [04-01] Shaders extracted to `Plasma.shaders.ts` (separate file from Plasma.tsx) — ~60 LOC GLSL; separation makes IDE syntax highlighting easier and decouples shader edits from React lifecycle edits
- [04-01] `direction` prop locked to literal `'forward'` — pingpong/reverse branches deleted from inspo port (dead code in hot rAF loop is mental overhead)
- [04-01] `uSpeed` wired as `speed * 0.4` (inspo trick preserved) — maps the user-friendly [0..1] slider into the actual slow/meditative shader range
- [04-01] WebGL lifecycle inside `useEffect` (NOT `useGSAP`) — useGSAP only frees GSAP resources, never WebGL contexts / rAF IDs / ResizeObservers; verified against GSAP React docs
- [04-01] 6-step cleanup ritual: cancelAnimationFrame → ResizeObserver.disconnect → removeEventListener('mousemove') → WEBGL_lose_context.loseContext → canvas.width=0/canvas.height=0 → DOM detach (try/catch) — order is load-bearing
- [04-01] DPR capped via `Math.min(devicePixelRatio || 1, 2)` — iPhone Pro DPR 3 = 9× pixel work = thermal throttle in ~30s without cap
- [04-01] Float32Array uniforms (`iResolution`, `uMouse`) written in place every frame, NEVER reallocated — `program.uniforms.<name>.value` is the same array reference across frames
- [04-01] Container-scoped mousemove (NOT window) — locked by CONTEXT.md; mouse parallax only when pointer is inside the hero
- [04-01] PlasmaFallback gradient stops: 0% / 25% / 55% / 90% at ellipse 50% 45% — steep early falloff holds the hot orange core compact, long tail bleeds into #050505
- [04-01] Pulse keyframes: opacity 0.85 → 1 → 0.85 over 7s ease-in-out — middle of the CONTEXT.md 6-8s range, clearly subliminal
- [04-01] Belt-and-suspenders `@media (prefers-reduced-motion: reduce)` override AT the keyframes — even if the HeroBackdrop dispatcher (04-02) forgets to gate `animated`, the CSS flattens the pulse to static for affected users
- [04-01] PlasmaFallback doc-comment phrased without literal "canvas"/"ogl" strings — phase verification grep is case-sensitive and demands 0 matches; meaning preserved via "WebGL bindings or 3D renderer imports" phrasing
- [04-03] `AnimationRootPlaceholder` (position:fixed, z-index:0) was painting over the hero section's text — section had no z-index (auto) so it painted before the fixed overlay. Fix: `zIndex:1` on the hero `<section>` in App.tsx
- [04-03] HeroBackdrop container divs require explicit `zIndex:0` — without it, Chrome's GPU compositor can stack the WebGL canvas above `position:relative z-index:1` siblings despite CSS stacking spec
- [04-03] WebGL canvas is excluded from Chrome's DOM hit-test tree (promoted to GPU compositor layer) — mousemove never reaches the Plasma container via bubbling. Fix: document-level listener with `getBoundingClientRect()` bounds check in Plasma.tsx
- [05-01] Phase 5 hero copy locked in locale JSON: EN tagline "I automate what holds people back." / ES "Automatizo lo que le frena a la gente." — strings live in `src/locales/{en,es}/hero.json` as the contract; consumers in 05-02/05-03/05-04 never duplicate copy in component source
- [05-01] Phase 5 CTA locked: EN "See my work" / ES "Ver mi trabajo" — replaces the verbose Phase 2 placeholder "View selected work" / "Ver proyectos seleccionados"
- [05-01] Primary nav labels live under `common.nav.*` (not a separate `nav` namespace) — keeps nav strings co-located with switcher labels under the always-loaded `common` namespace, so PillNav doesn't need to add a second `useTranslation`
- [05-01] ES nav: "Stack" stays untranslated as brand term (alongside "Sobre mí" / "Trabajo" / "Contacto") — aligns with the engineering audience and avoids the awkward "Pila" translation
- [05-01] LanguageSwitcher signature changed to `({ className }: { className?: string })` — caller-provided className fully replaces the `flex gap-4` default via `clsx(className ?? 'flex gap-4')`, eliminating Tailwind class conflicts when composed inside PillNav/MobileNav
- [05-01] Standalone `<LanguageSwitcher />` in App.tsx left in place — backward-compatible with the default, scheduled for removal in Plan 05-04 once PillNav and MobileNav mount
- [05-01] No `@types/i18next.d.ts` edits required — `typeof resources` + `as const` on JSON imports auto-types `t('nav.about')`, `t('cta')`, and `t('switcher.ariaLabel')` through the existing CustomTypeOptions augmentation; verified by clean `tsc -b` exit
- [05-02] Hero accepts `sectionRef: React.RefObject<HTMLElement | null>` as a prop — caller owns the ref so PillNav (05-03) and the same Hero instance use the same DOM node as ScrollTrigger trigger. The `| null` union matches @types/react 19's inferred `useRef<HTMLElement>(null)` type; without it the caller's ref would not be assignable to the prop
- [05-02] Three independent `gsap.to()` ScrollTriggers (not a single timeline) — name/tagline/CTA each get their own trigger with divergent end values (40%/35%/30%). End-value divergence is the entire point of the design; three triggers express it more clearly than a single timeline with parallel position params
- [05-02] CTA fades fastest (30% top end) → tagline (35%) → name (40%) — name is the brand anchor, stays readable longest as the user scrolls
- [05-02] No `scope` option on Hero's `useGSAP` — the effect targets individual element refs (`nameRef.current` etc.), never selector strings inside the section root. Passing a scope would be semantically incorrect since we use no scoped selectors
- [05-02] Belt-and-suspenders cleanup — outer `mm.revert()` + inner `ScrollTrigger.getAll().forEach(t => t.kill())` inside the matchMedia branch, same pattern as RevealSection (Phase 3)
- [05-02] CTA is `<a href="#work">` not `<button>` — hash-anchor semantically correct for in-page scroll target to the future Projects section; explicit `cursor: pointer` added (beyond plan's style list) so the pointer cursor is unambiguous across browsers
- [05-02] HeroBackdrop wrapped in AnimationErrorBoundary inside Hero — Plasma WebGL crashes cannot take the hero copy down with them
- [05-02] Explicit `zIndex: 1` on both `<section>` and the content overlay div — required per Phase 4-03 fix for Chrome GPU compositor stacking the WebGL canvas above text without explicit indices

### Resolved Blockers

- TypeScript chosen (TS, not JSX-only) — confirmed via scaffold choice in 01-01
- Both CV PDFs confirmed present in repo root — will copy to `public/` in Phase 6

### Remaining Open Questions

- ~~framer-motion vs motion package name (verify at install in Phase 3)~~ — resolved 03-01: project uses GSAP 3.15 + @gsap/react 2.1, not framer-motion
- ~~ParallaxCard API shape (single-speed vs multi-layer `layers[]`)~~ — resolved 03-02: multi-layer `layers: { content, speed, className? }[]` shipped
- ~~`ScrollTrigger.refresh()` on `document.fonts.ready`~~ — resolved 03-03: hook implemented and confirmed working; Playfair Display load does affect offsets without it
- ~~Whether to fold ScrollProvider's rAF loop into GSAP's ticker~~ — resolved 03-03: no tearing observed; separate rAF loop stays
- Number of NDA-safe case studies ready (target 3–4 deep) — needed before Phase 6
- Primary CTA framing: clients vs jobs — needed before Phase 5
- ~~Plasma GLSL shader source — port from inspo or author fresh — needed before Phase 4~~ — resolved 04-01: ported verbatim from inspo.txt /src/Component.tsx into `src/components/plasma/Plasma.shaders.ts`
- Whether HeroBackdrop should re-mount or just swap when `useFallback` flips at runtime (e.g. user toggles OS reduced-motion mid-session) — resolved direction in plan 04-02
- Symmetric fade-in on scroll-back remount of Plasma — polish item flagged in 04-RESEARCH §Open Questions, decide during 04-03 browser checkpoint

## Session Continuity

Last session: 2026-06-13
Stopped at: Completed Plan 05-02 (Hero component with scroll-parallax fade-out + HeroBackdrop integration). Plan 05-03 (PillNav + MobileNav) executing in parallel Wave 2. Next after 05-03 closes: Plan 05-04 — mount Hero + Nav into App.tsx and retire Phase 4 test harness placeholder.
