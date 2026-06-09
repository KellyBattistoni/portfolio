# Project Research: Pitfalls — React + Vite Portfolio (Animation-Heavy, Bilingual, GitHub Pages)

**Researched:** 2026-06-09
**Domain:** Frontend pitfalls for React 18 + Vite + GSAP 3 + Framer Motion + OGL + react-i18next + GitHub Pages
**Confidence:** MEDIUM-HIGH (training-data based; live verification tools were unavailable this session — items marked LOW should be re-validated against current docs before lockdown)

---

## Summary

Animation-heavy React portfolios fail in a small set of predictable ways: WebGL canvases that leak GPU memory on unmount, GSAP timelines that survive component teardown and cause "ghost" animations, Framer Motion + GSAP fighting over the same transform property, GitHub Pages serving `index.html` only for `/` (everything else 404s), and Vite shipping absolute asset paths that break under a project-page subpath. Bilingual sites add a second failure surface: hydration mismatches, missing keys rendering as raw `nav.about` strings, and language switches that don't persist across reloads.

Mobile is where most portfolios visibly die: a Plasma shader at 60fps on a desktop GPU is a 200ms-per-frame disaster on a mid-range Android, and the user blames "the site is slow" — not the shader. Tailwind purge silently strips dynamically-constructed class names (`bg-${color}-500`) in production, leaving the dev build looking nothing like prod.

**Primary recommendation:** Build a "kill switch" pattern into every animation system from day one — a single `prefers-reduced-motion` + `isMobile` + `isLowEndDevice` gate that all GSAP/Framer/OGL components read before mounting. Treat the WebGL canvas, the GSAP context, and the i18n bundle as three things that MUST have explicit lifecycle management. Configure `vite.config.js` `base` and the GitHub Pages 404-fallback BEFORE writing the first route, not after the first deploy fails.

---

## Pitfall Catalog

Pitfalls are grouped by subsystem. Each entry follows: **What goes wrong → Warning signs → Prevention → Phase to address**.

---

### Category 1: OGL / WebGL (Plasma Effect)

#### Pitfall 1.1: Canvas not cleaned up on unmount (GPU memory leak)
**Confidence:** HIGH

**What goes wrong:** OGL's `Renderer` creates a `WebGLRenderingContext` and attaches a `<canvas>` to the DOM. If you don't call `renderer.gl.getExtension('WEBGL_lose_context').loseContext()` and cancel the `requestAnimationFrame` loop on unmount, each route change (or HMR reload in dev) leaks a GL context. Browsers cap WebGL contexts at ~16; the 17th silently fails and you get a black canvas with no error.

**Warning signs:**
- Console warning: `WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost`
- Black/blank Plasma area after several HMR reloads
- DevTools Memory panel shows growing `WebGLTexture` and `WebGLBuffer` retained objects
- Mobile Safari crashes the tab after navigating in/out of the section

**Prevention:**
```jsx
useEffect(() => {
  const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2) });
  let rafId;
  const tick = (t) => { renderer.render({ scene, camera }); rafId = requestAnimationFrame(tick); };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    const loseExt = renderer.gl.getExtension('WEBGL_lose_context');
    if (loseExt) loseExt.loseContext();
    canvas.width = 0; canvas.height = 0; // forces GPU buffer release on iOS
  };
}, []);
```
Add a `useRef` flag to guard against double-init in React 18 StrictMode (effects run twice in dev).

**Phase to address:** WebGL / Plasma effect implementation phase.

---

#### Pitfall 1.2: DPR (device pixel ratio) unclamped — phones burn battery
**Confidence:** HIGH

**What goes wrong:** Rendering at `devicePixelRatio = 3` (iPhone Pro) means pushing 9× the pixels of a logical-pixel render. Plasma shaders are fragment-heavy; this is the single biggest cause of phones overheating and throttling.

**Warning signs:**
- iPhone gets noticeably warm within 30s
- Frame rate halves after ~1 minute (thermal throttling kicks in)
- Battery drain reports during testing
- "Lag" reports from mobile testers but desktop is smooth

**Prevention:**
- Clamp DPR: `dpr: Math.min(window.devicePixelRatio, 1.5)` on mobile, `2` max on desktop
- Render the Plasma at 50–75% canvas resolution and upscale via CSS (`width: 100%`) — fragment shaders downsampled look fine for atmospheric effects
- Pause the RAF loop when the canvas is not in viewport (use `IntersectionObserver`)
- Pause when `document.hidden` (tab not visible)

**Phase to address:** WebGL / Plasma effect implementation phase + Performance pass.

---

#### Pitfall 1.3: No `prefers-reduced-motion` fallback
**Confidence:** HIGH

**What goes wrong:** Users with vestibular disorders, low-end devices, or accessibility settings get a full-bore animated WebGL background. This is an accessibility failure (WCAG 2.3.3) and a UX failure.

**Warning signs:**
- Lighthouse accessibility flags it
- No code path checks `window.matchMedia('(prefers-reduced-motion: reduce)')`

**Prevention:**
```jsx
const prefersReduced = useMemo(
  () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []
);
if (prefersReduced) return <StaticGradientFallback />;
```
Provide a static CSS gradient (or one rendered Plasma frame as a PNG) as the fallback. Build this fallback FIRST, then layer the animated version on top.

**Phase to address:** Foundation / accessibility setup phase, before any animation work.

---

#### Pitfall 1.4: Shader compiles fail silently on older GPUs
**Confidence:** MEDIUM

**What goes wrong:** GLSL features you assume are universal (e.g., `highp float` in fragment shader, certain noise functions, loops with non-constant bounds) fail to compile on older mobile GPUs (PowerVR, Adreno 3xx). OGL doesn't throw — you just get nothing rendered.

**Warning signs:**
- Plasma works on dev machine and modern flagships but is blank on a 3-year-old Android
- No console error (WebGL errors require explicit `gl.getError()` polling)

**Prevention:**
- Use `mediump` in fragment shaders unless you specifically need precision
- Avoid `for` loops with variable bounds (unroll manually or use constant loop count)
- After `program = new Program(...)`, log `gl.getProgramInfoLog(program.program)` in dev
- Always provide a CSS fallback (Pitfall 1.3) — if the shader fails, fall back gracefully

**Phase to address:** WebGL implementation phase.

---

#### Pitfall 1.5: StrictMode double-mount creates two canvases
**Confidence:** HIGH

**What goes wrong:** React 18 StrictMode mounts → unmounts → remounts effects in dev. Without a ref guard, you initialize OGL twice, leak the first context, and may end up with two canvases stacked in the DOM.

**Warning signs:**
- Two `<canvas>` elements in DOM inspector
- First WebGL context immediately marked `CONTEXT_LOST` on page load (dev only)
- Behavior differs between dev and prod

**Prevention:** Use a ref to guard initialization, OR put the entire OGL init inside a `useEffect` with a proper cleanup that fully tears down on first unmount (the cleanup from Pitfall 1.1 handles this if done correctly).

**Phase to address:** WebGL implementation phase.

---

### Category 2: GSAP + Framer Motion Coexistence

#### Pitfall 2.1: GSAP tweens and Framer Motion fighting over `transform`
**Confidence:** HIGH

**What goes wrong:** Both libraries write to the same `transform` matrix. If a GSAP timeline animates `x` and Framer Motion's `whileHover` animates `scale` on the same element, the last-writer-wins per frame and you get visible jitter or one animation snapping.

**Warning signs:**
- Hover causes a "jump" before animating
- Scroll-triggered GSAP animation gets reset by a Framer mount animation
- Element's computed transform changes unexpectedly mid-animation

**Prevention:**
- **Rule of thumb:** one element, one animation library. Pick GSAP for scroll/timeline-driven choreography, Framer Motion for component-mount + interaction (hover/tap/layout).
- If both are unavoidable, nest: outer `<motion.div>` for layout/hover, inner `<div ref>` for GSAP — they target different DOM nodes.
- Never animate the same CSS property with both libraries on the same node.

**Phase to address:** Animation architecture phase (before writing first animation).

---

#### Pitfall 2.2: GSAP timelines not killed on unmount → ghost animations
**Confidence:** HIGH

**What goes wrong:** A `gsap.timeline()` created in `useEffect` without cleanup keeps running after the component unmounts. On route change or conditional remount, you get tweens targeting detached DOM nodes (`Cannot read properties of null`), console errors, and memory leaks.

**Warning signs:**
- Console: `GSAP target not found` or `Cannot read property 'style' of null`
- Animations restart unexpectedly when navigating back to a section
- Performance degrades the longer the user stays on the page

**Prevention:** Use `gsap.context()` (GSAP 3.11+) — this is the official React pattern:
```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.hero-title', { y: 0, opacity: 1, duration: 1 });
    ScrollTrigger.create({ /* ... */ });
  }, containerRef);
  return () => ctx.revert(); // kills everything inside
}, []);
```
`ctx.revert()` kills all tweens, ScrollTriggers, and resets inline styles. This is the single most important GSAP-in-React pattern.

**Phase to address:** Animation architecture phase, applied to every GSAP component.

---

#### Pitfall 2.3: ScrollTrigger refresh not called after dynamic content loads
**Confidence:** HIGH

**What goes wrong:** ScrollTrigger calculates start/end positions at creation time. If images load after, fonts swap, i18n changes text length, or accordion expands, the trigger fires at wrong scroll positions.

**Warning signs:**
- Animations fire too early or too late after a font swap (FOUT/FOIT)
- Switching language from EN → ES breaks scroll positions (Spanish text is ~20% longer on average)
- Resize the window and animations fire at wrong times

**Prevention:**
- `ScrollTrigger.refresh()` after: images load, fonts ready (`document.fonts.ready`), language change, accordion toggle
- Set `ScrollTrigger.config({ ignoreMobileResize: true })` to avoid mobile address-bar resize triggering refreshes
- For language change: hook into i18next's `languageChanged` event → `ScrollTrigger.refresh()`

**Phase to address:** Animation architecture phase + i18n integration phase.

---

#### Pitfall 2.4: Layout shift from animated `height`/`width`
**Confidence:** HIGH

**What goes wrong:** Animating `height`, `width`, `top`, `left`, or `margin` triggers layout on every frame → janky 30fps. Worse, it shifts surrounding content (CLS score tanks).

**Warning signs:**
- Cumulative Layout Shift (CLS) > 0.1 in Lighthouse
- Visible jitter during animation
- Surrounding text reflows during transitions

**Prevention:**
- Animate only `transform` (`x`, `y`, `scale`, `rotate`) and `opacity` — these are compositor-only.
- For height changes, use `scaleY` + `transform-origin: top` instead of `height`.
- For Framer layout animations, use `layout` prop sparingly; pair with `LayoutGroup` to scope reflows.

**Phase to address:** Animation architecture phase.

---

#### Pitfall 2.5: `will-change` overuse or never cleared
**Confidence:** MEDIUM

**What goes wrong:** Slapping `will-change: transform` on every animated element promotes them all to compositor layers — memory explodes on mobile, and the browser can't optimize. Forgetting to clear `will-change` after an animation completes leaves the layer hot indefinitely.

**Warning signs:**
- Mobile Safari memory warnings
- Page becomes slower the longer it's open
- DevTools Layers panel shows dozens of composited layers

**Prevention:**
- Only set `will-change` immediately before animation, clear immediately after
- GSAP: use `force3D: true` (default in 3.x) instead — handles this correctly
- Framer Motion: handles this internally; don't add `will-change` manually

**Phase to address:** Performance pass / animation polish phase.

---

### Category 3: GitHub Pages Deployment

#### Pitfall 3.1: Direct URL access returns 404
**Confidence:** HIGH

**What goes wrong:** GitHub Pages is a static host. Visiting `/projects/foo` directly returns 404 because no file at that path exists. Even though this is a "single-page app" per the project description, anchor links (`/#about`) and shared deep links break.

**Warning signs:**
- Refresh on any non-root URL → 404
- Sharing a link to a section works only via hash, not path
- Search engines can't index sub-routes

**Prevention:** For a true SPA single-page (no router routes other than `/`), this is moot — use hash links (`#about`) only and you're safe. **If** any client-side routing is introduced later:
- Copy `index.html` → `404.html` at build time (GitHub Pages serves `404.html` for any unknown path)
- Use the `spa-github-pages` redirect trick (`404.html` redirects to `/?p=/original/path` and a script in `index.html` rewrites history)
- Or use `HashRouter` instead of `BrowserRouter`

**Phase to address:** Deployment configuration phase.

---

#### Pitfall 3.2: Vite `base` config wrong → all assets 404 in production
**Confidence:** HIGH

**What goes wrong:** GitHub Pages serves project repos at `https://username.github.io/repo-name/`. If `vite.config.js` has `base: '/'` (the default), every asset URL becomes `/assets/foo.js`, which resolves to `https://username.github.io/assets/foo.js` — wrong path → blank page.

**Warning signs:**
- Local `npm run build && npm run preview` works
- Deployed site shows blank page or 404s for `main.js`, `index.css`
- Network tab shows all asset requests going to `/assets/...` instead of `/repo-name/assets/...`

**Prevention:**
```js
// vite.config.js
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/',
});
```
Use a leading AND trailing slash. If deploying to a custom domain or `username.github.io` (user/org page, not project page), use `base: '/'`. Document this clearly in the README.

**Phase to address:** Deployment configuration phase (Phase 1, before first deploy).

---

#### Pitfall 3.3: Absolute asset paths in code (`/logo.png`) break under subpath
**Confidence:** HIGH

**What goes wrong:** Hardcoded `<img src="/logo.png">` ignores the Vite `base` config. Works locally, 404s on GitHub Pages project page.

**Warning signs:**
- Some images load, others don't, after deploy
- Hardcoded paths in JSX or CSS `background-image: url(/...)` break
- Inline SVG references via `<use href="/icons.svg#foo">` fail

**Prevention:**
- Import assets through Vite: `import logo from './assets/logo.png'` → Vite rewrites paths correctly
- For runtime-dynamic paths, use `import.meta.env.BASE_URL`: `<img src={`${import.meta.env.BASE_URL}logo.png`} />`
- Public folder assets: prepend `import.meta.env.BASE_URL`
- Tailwind `background-image` arbitrary values: use Vite-imported assets, not absolute paths

**Phase to address:** Asset pipeline phase + before first deploy.

---

#### Pitfall 3.4: Custom domain CNAME wiped on every deploy
**Confidence:** MEDIUM

**What goes wrong:** If a custom domain (e.g., kellybattistoni.com) is configured, GitHub Pages stores it in a `CNAME` file at the repo root. The `gh-pages` action or manual deploy from `dist/` overwrites this file. Domain reverts to `username.github.io/repo`.

**Warning signs:**
- Custom domain stops working after a deploy
- GitHub Pages settings show "no custom domain"
- `CNAME` file is missing from the deployed branch

**Prevention:**
- Add `public/CNAME` containing the domain → Vite copies it to `dist/`
- Or use a deploy action with `cname` parameter (e.g., `peaceiris/actions-gh-pages` supports `cname` input)

**Phase to address:** Deployment configuration phase.

---

#### Pitfall 3.5: HTTPS mixed content from external assets
**Confidence:** MEDIUM

**What goes wrong:** GitHub Pages forces HTTPS. Any `http://` resource (image, font, script) is blocked silently. Common with old CDN links or copy-pasted analytics snippets.

**Warning signs:**
- Console: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure...`
- Fonts/images mysteriously don't load in production but work locally (where browsers are more permissive)

**Prevention:** Audit all external URLs — fonts (Google Fonts uses HTTPS, fine), analytics, CDNs. Use `//cdn.example.com/...` protocol-relative URLs only if HTTPS is guaranteed; safer to use `https://` explicitly.

**Phase to address:** Pre-deployment checklist.

---

### Category 4: react-i18next (Bilingual EN/ES)

#### Pitfall 4.1: Missing keys render as raw key strings (`nav.about`)
**Confidence:** HIGH

**What goes wrong:** If `i18n.t('nav.about')` is called before resources are loaded, or the key doesn't exist in the active language, it returns the key string. User sees `nav.about` in the navbar.

**Warning signs:**
- Raw dot-notation strings appear in the UI
- Switching to ES shows EN text (key fallback) or raw keys
- No errors in console (i18next defaults to silent)

**Prevention:**
- Configure i18next: `saveMissing: true, missingKeyHandler: (lngs, ns, key) => console.warn('MISSING:', key)` in dev
- Use `Suspense` with `useTranslation` to wait for resources
- TypeScript: type the translation keys (`react-i18next` supports `Resources` type augmentation)
- CI check: script that parses translation JSON files and asserts both EN and ES have identical key sets

**Phase to address:** i18n setup phase + every component PR.

---

#### Pitfall 4.2: Language not persisted across reloads
**Confidence:** HIGH

**What goes wrong:** User switches to ES, refreshes, gets EN again. Default i18next has no persistence; the language detector is opt-in.

**Warning signs:**
- Language reverts on F5
- Direct link sharing doesn't preserve language

**Prevention:** Install `i18next-browser-languagedetector`, order: `['querystring', 'localStorage', 'navigator']`. Persist to `localStorage` on change. Optionally add `?lang=es` query param support for shareable links.

**Phase to address:** i18n setup phase.

---

#### Pitfall 4.3: Hydration mismatch from server-detected vs client-detected language
**Confidence:** MEDIUM (lower risk for SPA, but applies if SSG is added later)

**What goes wrong:** N/A for pure SPA Vite build (no SSR), but if you ever pre-render or add SSG, the server uses default lang and client switches → React hydration warning.

**Warning signs:** Console: `Hydration failed because the initial UI does not match...`

**Prevention:** For SPA: not a concern. For SSG/SSR: defer language-dependent rendering until after hydration (use `useEffect` to read `localStorage`).

**Phase to address:** Not relevant unless architecture changes. Document as out-of-scope risk.

---

#### Pitfall 4.4: Text length differences break layouts (ES is longer than EN)
**Confidence:** HIGH

**What goes wrong:** Spanish averages 15–25% more characters than English. Fixed-width buttons, single-line nav items, hero headlines designed at EN length overflow or wrap awkwardly in ES.

**Warning signs:**
- Button text wraps to two lines in ES
- Nav items overflow into hamburger menu earlier in ES
- Hero headline wraps differently, breaking visual rhythm
- Animations (GSAP `SplitText`-like) break when text length changes

**Prevention:**
- Design at ES (longest) lengths first, never at EN
- Use `min-width` instead of fixed `width` on buttons
- Test every component in both languages during dev (toggle in dev menu)
- Avoid `nowrap` on translatable text unless explicitly tested in both langs
- For GSAP `SplitText` (char/word splits), re-split on language change + `ScrollTrigger.refresh()`

**Phase to address:** Every UI component phase + dedicated bilingual QA pass.

---

#### Pitfall 4.5: HTML / lang attribute not updated
**Confidence:** HIGH

**What goes wrong:** `<html lang="en">` stays as `en` even when user switches to ES. Screen readers pronounce Spanish text with English phonemes. SEO/accessibility failure.

**Warning signs:**
- DevTools shows `<html lang="en">` regardless of UI language
- Lighthouse accessibility flags it
- Screen reader test pronounces Spanish as English

**Prevention:** On i18next `languageChanged` event: `document.documentElement.lang = i18n.language`. Also update `<title>` and `<meta description>` to match.

**Phase to address:** i18n setup phase.

---

#### Pitfall 4.6: Translation bundles bloat the bundle
**Confidence:** MEDIUM

**What goes wrong:** Importing both EN and ES JSON bundles upfront ships both to all users. Not huge for 2 languages but principle matters.

**Warning signs:** Bundle analyzer shows translation JSON in main chunk; doubles in size as content grows.

**Prevention:** Use i18next backend (`i18next-http-backend`) to lazy-load language files from `/locales/{lng}/translation.json`. Cache via service worker if going PWA. For 2 languages and minimal copy, eager-loading is acceptable — measure first.

**Phase to address:** Performance pass.

---

### Category 5: Scroll Performance

#### Pitfall 5.1: Multiple scroll listeners → main thread saturated
**Confidence:** HIGH

**What goes wrong:** Each component attaches its own `window.addEventListener('scroll', ...)`. With 10 sections, scroll fires 10 handlers per frame. Janky parallax, dropped frames.

**Warning signs:**
- Scrolling is smooth on desktop, choppy on mobile
- Performance panel shows scroll handlers taking >5ms each
- Adding more sections proportionally slows scroll

**Prevention:**
- Use **one** ScrollTrigger / Lenis / IntersectionObserver instance and dispatch to sections
- ScrollTrigger natively batches and uses a single rAF — DO NOT mix with manual scroll listeners
- For parallax: ScrollTrigger's `scrub: true` is the right tool; don't roll your own with `scroll` listener
- Mark passive: `addEventListener('scroll', fn, { passive: true })` if you must use raw listeners

**Phase to address:** Animation architecture phase.

---

#### Pitfall 5.2: Smooth-scroll library conflicts with native scroll
**Confidence:** MEDIUM

**What goes wrong:** Adding Lenis or Locomotive Scroll for "smooth scrolling" can break ScrollTrigger (which reads native scroll), break anchor jumps, break browser back-button scroll restoration, and feel laggy on touch devices.

**Warning signs:**
- Anchor links (`#about`) don't scroll to target
- ScrollTrigger positions are off
- Touch scroll feels delayed on mobile
- Browser back doesn't restore scroll position

**Prevention:**
- If you must add smooth scroll: use Lenis (most ScrollTrigger-compatible) + `ScrollTrigger.scrollerProxy` setup
- Disable smooth scroll on touch devices (`Lenis({ smoothTouch: false })`)
- Honestly evaluate whether smooth scroll is needed — native scroll is smooth on modern devices and respects user preferences

**Phase to address:** Animation architecture phase, with explicit decision documented in CONTEXT.md.

---

#### Pitfall 5.3: Parallax causing layout / repaint instead of compositor
**Confidence:** HIGH

**What goes wrong:** Animating `background-position` for parallax triggers paint every frame. Animating `top` or `margin-top` triggers layout. Both kill mobile.

**Warning signs:**
- Performance panel shows "Paint" or "Layout" bars on every scroll frame
- Mobile drops to 20fps during scroll

**Prevention:** Parallax via `transform: translate3d(0, y, 0)` only. ScrollTrigger with `scrub` writes to transform by default — use it.

**Phase to address:** Animation architecture phase.

---

### Category 6: Tailwind CSS Production Build

#### Pitfall 6.1: Dynamic class names purged in production
**Confidence:** HIGH

**What goes wrong:** Tailwind's JIT scans source files for literal class strings. `bg-${color}-500` is not a literal — Tailwind doesn't see `bg-red-500`, so it's stripped from production CSS. Works in dev (JIT keeps more), broken in prod.

**Warning signs:**
- Color/spacing variations work locally, broken after deploy
- Tailwind classes for dynamically-themed elements missing
- Production CSS smaller than expected

**Prevention:**
- Use full class names in code: `const colorClass = isActive ? 'bg-red-500' : 'bg-blue-500'` (both strings present)
- Or: safelist in `tailwind.config.js`:
  ```js
  safelist: [{ pattern: /bg-(red|blue|green)-(400|500|600)/ }]
  ```
- Never construct class strings with template literals containing variables for Tailwind utilities

**Phase to address:** Foundation / styling setup phase, drilled into team early.

---

#### Pitfall 6.2: Custom CSS / arbitrary values not in production
**Confidence:** MEDIUM

**What goes wrong:** Arbitrary values like `bg-[#1a1a2e]` work but only if they appear as literal strings. Same dynamic-construction trap as above.

**Prevention:** Same as 6.1 — keep arbitrary values as literals or extend `theme.colors` in config.

**Phase to address:** Styling phase.

---

#### Pitfall 6.3: Custom fonts not loaded before animation starts
**Confidence:** HIGH

**What goes wrong:** GSAP measures element width at animation start. If web font hasn't loaded, GSAP measures fallback font width, then font swaps mid-animation → visible jump.

**Warning signs:**
- Hero text "jumps" on first load
- Animation start positions look wrong on slow networks
- FOUT (flash of unstyled text)

**Prevention:**
- `await document.fonts.ready` before initializing GSAP timelines
- Use `font-display: optional` or `swap` deliberately
- Preload critical fonts: `<link rel="preload" as="font" type="font/woff2" crossorigin>`
- Set `ScrollTrigger.refresh()` after fonts load

**Phase to address:** Foundation phase + animation phase.

---

### Category 7: Cross-Cutting / Meta

#### Pitfall 7.1: No mobile testing until late → unsalvageable performance debt
**Confidence:** HIGH

**What goes wrong:** "I'll test on mobile at the end" → Plasma shader at 5fps, GSAP timelines stuttering, scroll jank, animations cumulatively too heavy. Fixing requires architectural changes, not tweaks.

**Prevention:** Test on a real mid-range Android (not Chrome DevTools emulation) at the END of every phase. Set a frame budget: 60fps on desktop, 30fps minimum on mobile. If a phase ships and breaks this, it's not done.

**Phase to address:** Every phase has a mobile check before "done."

---

#### Pitfall 7.2: No "kill switch" for animations → can't degrade gracefully
**Confidence:** HIGH

**What goes wrong:** Each animation system makes its own decision about whether to run. No central place to say "this device is struggling, turn it all down." Reactive fixes only.

**Prevention:** Build an `AnimationContext` / `useDeviceCapabilities()` hook from day one:
```jsx
{ prefersReducedMotion, isMobile, isLowEnd, isOffscreen, supportsWebGL2 }
```
Every animation reads from it. One toggle disables Plasma, slows GSAP, disables Framer layout animations.

**Phase to address:** Foundation phase, BEFORE any animation work.

---

#### Pitfall 7.3: SEO / OG / meta tags missing or not bilingual
**Confidence:** MEDIUM

**What goes wrong:** SPA = empty `<body>` until JS runs. Crawlers and link previews (LinkedIn, WhatsApp, Twitter) see nothing. Bilingual: no `hreflang` tags → Google can't tell EN and ES versions apart.

**Prevention:**
- Static `<title>`, `<meta description>`, OG tags in `index.html` (rendered before JS)
- `<link rel="alternate" hreflang="es" href="...?lang=es">` and `hreflang="en"`
- Update `<title>` dynamically via `react-helmet-async` on language change
- Consider `vite-plugin-prerender` or pre-rendering for SEO if it matters

**Phase to address:** SEO / metadata phase.

---

#### Pitfall 7.4: No error boundary around WebGL / animation roots
**Confidence:** HIGH

**What goes wrong:** WebGL context creation throws on some devices. GSAP throws if a target ref is null. One uncaught error blanks the entire page.

**Prevention:** Wrap Plasma section and major animated sections in `<ErrorBoundary fallback={<StaticGradient />}>`. Log errors, render fallback, don't crash the page.

**Phase to address:** Foundation phase.

---

#### Pitfall 7.5: Heavy dependencies, no code splitting
**Confidence:** MEDIUM

**What goes wrong:** GSAP + ScrollTrigger + Framer Motion + OGL + react-i18next + their plugins easily reach 200KB+ gzipped in the main chunk. First paint suffers, especially on slow mobile.

**Prevention:**
- Lazy-load Plasma section: `const Plasma = lazy(() => import('./Plasma'))`
- Lazy-load below-the-fold sections with React `lazy` + `Suspense`
- Use `vite-plugin-visualizer` (rollup-plugin-visualizer) to audit bundle
- Tree-shake: import GSAP plugins individually (`import { ScrollTrigger } from 'gsap/ScrollTrigger'`)

**Phase to address:** Performance pass / pre-launch phase.

---

## Phase Mapping Matrix

| Pitfall | Foundation | WebGL Phase | Animation Phase | i18n Phase | Deployment | Performance Pass |
|---------|:----------:|:-----------:|:---------------:|:----------:|:----------:|:----------------:|
| 1.1 Canvas cleanup | | YES | | | | |
| 1.2 DPR clamp | | YES | | | | YES |
| 1.3 prefers-reduced-motion | YES | YES | YES | | | |
| 1.4 Shader compat | | YES | | | | |
| 1.5 StrictMode double-mount | | YES | | | | |
| 2.1 GSAP/Framer conflict | | | YES | | | |
| 2.2 GSAP cleanup (ctx.revert) | | | YES | | | |
| 2.3 ScrollTrigger.refresh | | | YES | YES | | |
| 2.4 Layout-shift animations | | | YES | | | |
| 2.5 will-change hygiene | | | | | | YES |
| 3.1 SPA 404 routing | | | | | YES | |
| 3.2 Vite base config | | | | | YES | |
| 3.3 Absolute asset paths | YES | | | | YES | |
| 3.4 CNAME custom domain | | | | | YES | |
| 3.5 Mixed content HTTPS | | | | | YES | |
| 4.1 Missing translation keys | | | | YES | | |
| 4.2 Language persistence | | | | YES | | |
| 4.4 ES text length | YES | | | YES | | |
| 4.5 HTML lang attribute | | | | YES | | |
| 4.6 Translation lazy load | | | | | | YES |
| 5.1 Single scroll listener | | | YES | | | |
| 5.2 Smooth scroll library | | | YES | | | |
| 5.3 Compositor-only parallax | | | YES | | | |
| 6.1 Tailwind dynamic classes | YES | | | | | |
| 6.3 Font load before anim | YES | | YES | | | |
| 7.1 Mobile testing cadence | YES | | | | | YES |
| 7.2 Animation kill switch | YES | | | | | |
| 7.3 SEO + hreflang | | | | YES | | YES |
| 7.4 Error boundaries | YES | | | | | |
| 7.5 Code splitting | | | | | | YES |

---

## Top 5 Highest-Stakes Pitfalls

If you only mitigate five, mitigate these:

1. **Pitfall 1.1 + 1.2 (WebGL cleanup + DPR clamp)** — without these, mobile users have a bad time and the site may crash.
2. **Pitfall 2.2 (`gsap.context().revert()`)** — without this, every GSAP-in-React component is a memory leak waiting to happen.
3. **Pitfall 3.2 (Vite `base` config)** — first deploy will be a blank page without this.
4. **Pitfall 4.4 (Spanish text length)** — designing at EN length means rebuilding components when ES content arrives.
5. **Pitfall 7.2 (animation kill switch)** — without it, you cannot ship a graceful degradation story, only a "works on my machine" portfolio.

---

## Open Questions / Items to Verify

These items I could not verify against current docs this session — re-check before locking into a plan:

1. **Lenis + ScrollTrigger compatibility in current versions** (Confidence: MEDIUM). Confirm via current GSAP forum thread before adopting Lenis.
2. **OGL's current API for context loss handling** (Confidence: MEDIUM). The `loseContext` extension pattern is universal WebGL, but verify OGL doesn't have a higher-level helper.
3. **react-i18next v15+ Suspense behavior** (Confidence: MEDIUM). Suspense integration has evolved; confirm against current docs.
4. **Vite 5+ `base` runtime path behavior with dynamic imports** (Confidence: MEDIUM). Mostly correct but edge cases exist with dynamic `import()` in production.
5. **GitHub Pages and Vite's `assetsInclude` for non-standard assets (e.g., GLSL shader files)** (Confidence: LOW). If shaders are imported as `.glsl` strings via `?raw`, verify the import path holds up under base subpath.

---

## Sources

### Primary references (verify before lockdown)
- GSAP React guide and `gsap.context()` docs — gsap.com/resources/react
- OGL repo and examples — github.com/oframe/ogl
- Vite static deploy guide — vitejs.dev/guide/static-deploy
- react-i18next docs — react.i18next.com
- GitHub Pages SPA redirect pattern (rafgraph/spa-github-pages)
- web.dev / WCAG 2.3.3 on prefers-reduced-motion

### Confidence note
Live verification (Context7, WebSearch, official docs fetch) was unavailable in this session. All findings are based on training-data knowledge of these libraries' documented patterns and well-known community pitfalls. Items marked LOW or MEDIUM confidence should be re-verified against current official docs before locking decisions in PLAN.md.

---

## Metadata

**Confidence breakdown:**
- WebGL pitfalls (Category 1): HIGH — universal WebGL behavior + React lifecycle, well-documented
- GSAP / Framer pitfalls (Category 2): HIGH — `gsap.context()` is the GSAP-documented React pattern
- GitHub Pages pitfalls (Category 3): HIGH — well-known deployment gotchas
- i18next pitfalls (Category 4): HIGH — documented behaviors of react-i18next
- Scroll performance (Category 5): HIGH — fundamental browser rendering knowledge
- Tailwind purge (Category 6): HIGH — Tailwind JIT scan behavior is well-documented
- Cross-cutting (Category 7): HIGH — general production-readiness checklist

**Research date:** 2026-06-09
**Valid until:** 2026-07-09 (stable stack; OGL and Lenis change faster — re-check those)
