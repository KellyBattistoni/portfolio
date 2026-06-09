# Project Research: Architecture

**Researched:** 2026-06-09
**Domain:** React + Vite single-page portfolio architecture
**Confidence:** HIGH on stack/structure (well-established patterns); MEDIUM on Tailwind v4 specifics and i18next plugin versions (training cutoff Jan 2026, verify versions at install time); HIGH on inspo component behavior (source code is in `inspo.txt`).

---

## Summary

Kelly's portfolio is a **single-route SPA**: one page with anchored sections (`#about`, `#projects`, `#stack`, `#contact`). It should NOT use React Router for navigation — anchors + smooth scroll is the correct primitive for a one-page portfolio. React Router DOM is only present because the inspo `PillNav` imports `Link` from it; we will adapt `PillNav` to accept both anchor links (`#about`) and real routes, defaulting to anchors.

The architecture is **three layered concerns**:

1. **Visual shell** — `App.tsx` mounts a single noise overlay, the `Plasma` hero background, the `PillNav`, and all section components in vertical order.
2. **Scroll choreography** — One `useScroll` hook (singleton context) drives: Plasma opacity fade, PillNav appearance threshold, parallax card offsets, and hero content parallax. This avoids N scroll listeners.
3. **i18n + content** — All copy lives in `src/locales/{en,es}/*.json` (split by namespace: `common`, `hero`, `about`, `projects`, `stack`, `contact`). `react-i18next` is initialized once in `src/i18n/index.ts`, imported at the top of `main.tsx`. Components consume via `useTranslation('namespace')`.

**Primary recommendation:** Build the visual shell + a single section first (Hero with Plasma + i18n wired), then layer scroll choreography, then duplicate the section pattern for the remaining five sections. Defer GitHub Pages deployment plumbing to the end.

---

## User Constraints (from PROJECT.md)

### Locked Decisions

- **Stack:** React 18 + Vite, Tailwind CSS, Framer Motion, GSAP 3, OGL (Plasma), React Router DOM (already pulled in by PillNav source).
- **i18n:** EN/ES from day one — no English-first hardcoding allowed.
- **Deployment:** GitHub Pages at `KellyBattistoni.github.io` (root repo, `base: "/"`).
- **Hero behavior:** Plasma full-bleed, fades on scroll. PillNav hidden during hero, appears on scroll.
- **Performance:** Plasma must cap `devicePixelRatio` at 2 (already in source) and degrade on low-power devices.
- **Theme:** `#050505` background, `#FF4500` accent, Playfair Display + Inter typography.

### Claude's Discretion

- Folder structure conventions inside `src/`.
- Whether to use Context, Zustand, or simple module-level state for the scroll value.
- Whether to use `react-i18next`'s `Suspense` mode or inline-resource mode for JSON loading.
- Tailwind v3 vs v4 (Vite plugin shape differs).
- Specific Vite plugin choices (e.g., `vite-plugin-svgr` if SVGs are needed).
- Whether to use `react-router-dom`'s `HashRouter` purely to satisfy the `<Link>` import in `PillNav`, or rewrite `PillNav` to drop the router dependency.

### Deferred Ideas (OUT OF SCOPE)

- Blog/writing section
- GitHub activity widget
- Twitter/Instagram social links
- Mobile app version
- SSR / Next.js migration
- A CMS for content

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react`, `react-dom` | `^18.2.0` | UI runtime | Inspo components are React 18; concurrent features are useful for non-blocking scroll work |
| `vite` | `^5.x` (or `^6.x`) | Build/dev server | Fastest DX, native ESM, simple GitHub Pages output. Verify latest at install. |
| `@vitejs/plugin-react` | `^4.x` | JSX + Fast Refresh | Required to ship `.jsx`/`.tsx` |
| `tailwindcss` | `^3.4.x` (or `^4.x` if comfortable) | Utility CSS | Inspo is Tailwind-built; rewriting in plain CSS would lose the matching ergonomics |
| `gsap` | `^3.12.x` | PillNav animations | Source PillNav uses `gsap.timeline`, `gsap.tweenTo`, `power3.out`. Replace would mean rewriting the component. |
| `framer-motion` | `^11.x` | Section/element animations | Declarative, viewport-aware; pairs well with React for reveal patterns |
| `ogl` | `^1.0.11` | WebGL renderer for Plasma | Inspo shader is hand-written for OGL's `Renderer`/`Program`/`Triangle` API |
| `react-router-dom` | `^6.28.x` | Only because PillNav source imports `Link` | See "Routing" section — we use `HashRouter` defensively, but no actual routes |
| `react-i18next` + `i18next` | `^14.x` / `^23.x` | Translation runtime | The de-facto React i18n choice; pairs with JSON namespace files |
| `i18next-browser-languagedetector` | `^8.x` | Auto-detect EN/ES from browser, persist to `localStorage` | Saves writing the detection logic; battle-tested |
| `lucide-react` | latest | Icons (used by inspo) | Tree-shakable, matches inspo |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | latest | Safe className composition | Inspo PillNav `package.json` requests both; use a `cn()` helper |
| `gh-pages` | `^6.x` | Branch-based deploy | Run `npm run deploy` to push `dist/` to `gh-pages` branch |
| `@tailwindcss/typography` | `^0.5.x` | Long-form prose (About section) | Only if About has paragraph-heavy markdown content |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-router-dom` | Strip `Link` from PillNav, use plain `<a>` | Cleaner bundle (-20KB gzip) but diverges from inspo source. Recommend keeping `HashRouter` for v1; refactor in v2. |
| `framer-motion` for reveals | Pure CSS + Intersection Observer (as inspo does) | CSS is lighter but less ergonomic when staggering. Use Framer for section reveals, CSS for noise/atmosphere — pragmatic split. |
| `i18next` | `lingui`, `react-intl`, hand-rolled context | i18next has the largest plugin ecosystem and the simplest JSON pipeline. Hand-rolled context tempting but loses pluralization/interpolation. |
| `gsap` | Pure CSS for PillNav | Source is GSAP; would need full rewrite. Keep as-is. |
| Vite | CRA / Next.js | CRA is deprecated; Next.js is overkill (no SSR needed) and complicates GitHub Pages. |

### Installation

```bash
npm create vite@latest portfolio -- --template react-ts
cd portfolio
npm install
npm install gsap ogl framer-motion react-router-dom lucide-react clsx tailwind-merge
npm install i18next react-i18next i18next-browser-languagedetector
npm install -D tailwindcss postcss autoprefixer gh-pages
npx tailwindcss init -p
```

> **Confidence note (MEDIUM):** Tailwind v4 ships a different setup (Vite plugin `@tailwindcss/vite`, no PostCSS step). At install time, check `tailwindcss` docs — if v4 is stable and the project starts fresh, prefer v4. The classes in inspo work the same in both.

---

## Architecture Patterns

### Recommended Project Structure

```
KellyBattistoni.github.io/
├── public/
│   ├── 404.html                # SPA-fallback redirect for GitHub Pages
│   ├── CV_Kelly_Battistoni_EN.pdf
│   ├── CV_Kelly_Battistoni_ES.pdf
│   └── noise.svg               # Self-hosted noise texture (don't rely on Vercel CDN)
├── src/
│   ├── main.tsx                # Mount React, import i18n init, import index.css
│   ├── App.tsx                 # Single page: <NoiseOverlay/> + <Plasma/> + <PillNav/> + sections
│   ├── index.css               # Tailwind directives + CSS variables + font imports
│   │
│   ├── i18n/
│   │   └── index.ts            # i18next.init() — detector, resources, fallbackLng
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json     # nav labels, CTAs, footer
│   │   │   ├── hero.json
│   │   │   ├── about.json
│   │   │   ├── projects.json   # array of projects with title/desc per language
│   │   │   ├── stack.json
│   │   │   └── contact.json
│   │   └── es/
│   │       └── ...same files...
│   │
│   ├── hooks/
│   │   ├── useScrollProgress.ts   # Single scroll listener -> normalized 0..1 + raw px
│   │   ├── useRevealOnScroll.ts   # IntersectionObserver wrapper for reveal sections
│   │   ├── usePrefersReducedMotion.ts
│   │   └── useLowPowerDevice.ts   # Detect to swap Plasma for static gradient
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── NoiseOverlay.tsx
│   │   │   └── PillNav.tsx       # Adapted from inspo (anchor-aware)
│   │   │
│   │   ├── effects/
│   │   │   ├── Plasma.tsx        # From inspo, prop-typed
│   │   │   ├── RevealSection.tsx # Wraps children with IO-driven opacity/translate
│   │   │   └── ParallaxCard.tsx  # Wraps children, applies translateY from scroll
│   │   │
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── StackSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── FooterSection.tsx
│   │   │
│   │   └── ui/
│   │       ├── LanguageSwitcher.tsx  # EN | ES toggle
│   │       ├── CVDownloadButton.tsx  # Picks PDF by current i18n language
│   │       └── SectionHeading.tsx    # Shared serif heading style
│   │
│   ├── lib/
│   │   ├── cn.ts                 # clsx + tailwind-merge helper
│   │   └── scrollContext.tsx     # React Context exposing scroll Y + progress 0..1
│   │
│   └── types/
│       └── i18n.d.ts             # Module augmentation for typed translation keys (optional but recommended)
│
├── index.html                    # Root + GitHub Pages SPA redirect snippet in <head>
├── vite.config.ts                # base: "/", plugin-react, optional alias '@' -> '/src'
├── tailwind.config.js
├── postcss.config.js             # (omit if using Tailwind v4)
├── tsconfig.json
├── package.json                  # "deploy": "gh-pages -d dist -b gh-pages"
└── README.md
```

**Why this shape:**

- `components/layout/` for things that exist once at root level (nav, noise).
- `components/effects/` for reusable visual primitives (Plasma, RevealSection, ParallaxCard) that other components compose.
- `components/sections/` for the six big page sections — each owns its own copy keys and layout, no shared logic.
- `components/ui/` for small reusable buttons/headings.
- `hooks/` is flat (not nested by domain) — small project, no need for hierarchy.
- `locales/` mirrors the i18next standard structure: `{lang}/{namespace}.json`.

### Component Hierarchy

```
<App>
  <ScrollProvider>                           ← provides scrollY + progress 0..1
    <NoiseOverlay/>                          ← fixed, z-50, pointer-events-none
    <Plasma color="#FF4500" .../>            ← fixed full-bleed, z-0; opacity tied to scroll
    <PillNav items={...} activeHref="#"/>    ← fixed top, z-1000; hidden until scrollY > heroHeight
    <main>
      <HeroSection/>                         ← min-h-screen, content fades/parallaxes on scroll
      <AboutSection/>                        ← wrapped in <RevealSection/>
      <ProjectsSection>                      ← wrapped in <RevealSection/>
        <ParallaxCard direction="up">...</ParallaxCard>
        <ParallaxCard direction="down">...</ParallaxCard>
      </ProjectsSection>
      <StackSection/>                        ← wrapped in <RevealSection/>
      <ContactSection/>                      ← wrapped in <RevealSection/>
      <FooterSection/>
    </main>
    <LanguageSwitcher/>                      ← fixed bottom-right or inside PillNav
  </ScrollProvider>
</App>
```

**Z-index layer plan:**

| Layer | z-index | Element |
|-------|---------|---------|
| Background | 0 | `Plasma` |
| Content | 10 | Sections, cards |
| Nav | 1000 | `PillNav` |
| Texture | 9999 (or 50 if inspo) | `NoiseOverlay` (must be above content but below modal/nav focus rings) |

> Inspo uses `z-50` for the noise overlay; that conflicts with `PillNav`'s `z-[1000]`. Decision: put noise at `z-[9999]` with `pointer-events:none` so it sits visually on top but does not block clicks. Or accept that noise sits below nav (cleaner). Recommend the latter.

### Pattern 1: Single Scroll Context

**What:** One `scroll` event listener at the root. Publishes `scrollY` and a derived `progress` (e.g., `scrollY / window.innerHeight`) via React Context. Consumers read with `useScroll()`.

**When to use:** Always — never let individual components attach `window.scroll` listeners. With four scroll-driven effects (Plasma fade, PillNav reveal, hero parallax, card parallax), N listeners would cause layout thrash and dropped frames.

**Implementation sketch:**

```tsx
// src/lib/scrollContext.tsx
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollState { y: number; progress: number; }
const ScrollCtx = createContext<ScrollState>({ y: 0, progress: 0 });

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScrollState>({ y: 0, progress: 0 });
  const rafId = useRef<number | null>(null);
  const latestY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      latestY.current = window.scrollY;
      if (rafId.current != null) return;       // coalesce in rAF
      rafId.current = requestAnimationFrame(() => {
        const y = latestY.current;
        const progress = Math.min(1, y / window.innerHeight);
        setState({ y, progress });
        rafId.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <ScrollCtx.Provider value={state}>{children}</ScrollCtx.Provider>;
}

export const useScroll = () => useContext(ScrollCtx);
```

**Why this works:**

- `{ passive: true }` so the browser does not wait for `preventDefault` — critical for smooth scrolling.
- Coalesce into `requestAnimationFrame` so we re-render at most once per frame, not on every `scroll` event (which fires 60-120+ times/sec).
- Single React state update per frame; children re-render only when value changes (consider `useSyncExternalStore` if perf becomes an issue, but Context is fine for 4 consumers).

**Tradeoff:** Context updates re-render all consumers. With ~4 consumers and a stable shape, this is fine. If a future section adds heavy children, switch to a `useSyncExternalStore`-based store or per-effect selector hooks (e.g., `useScrollY()`, `useScrollProgress()`).

### Pattern 2: i18n Initialization & Consumption

**Initialization (`src/i18n/index.ts`):**

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Static imports keep bundle simple; six namespaces × 2 langs is small (~20KB)
import enCommon from '../locales/en/common.json';
import enHero from '../locales/en/hero.json';
// ... import all namespaces
import esCommon from '../locales/es/common.json';
import esHero from '../locales/es/hero.json';
// ... etc

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    defaultNS: 'common',
    ns: ['common', 'hero', 'about', 'projects', 'stack', 'contact'],
    resources: {
      en: { common: enCommon, hero: enHero, /* ... */ },
      es: { common: esCommon, hero: esHero, /* ... */ },
    },
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kbv-lang',
    },
    react: { useSuspense: false }, // avoid Suspense complexity for static resources
  });

export default i18n;
```

**Mounting (`src/main.tsx`):**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';            // side-effect: initializes i18next BEFORE App renders
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Consumption (`src/components/sections/HeroSection.tsx`):**

```tsx
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation('hero');
  return (
    <section className="min-h-screen ...">
      <h1 className="font-serif text-7xl">{t('title')}</h1>
      <p>{t('tagline')}</p>
      <a href="#contact">{t('cta')}</a>
    </section>
  );
}
```

**Switching (`src/components/ui/LanguageSwitcher.tsx`):**

```tsx
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const cur = i18n.language.startsWith('es') ? 'es' : 'en';
  return (
    <button
      onClick={() => i18n.changeLanguage(cur === 'en' ? 'es' : 'en')}
      aria-label="Toggle language"
    >
      {cur === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
```

> The detector caches the choice to `localStorage` under `kbv-lang`, so the language persists across reloads automatically — no extra code needed.

### Pattern 3: Reveal On Scroll (Intersection Observer)

**What:** Each section is wrapped in `<RevealSection>` which uses a singleton IntersectionObserver to add an `active` (or set `data-revealed`) state. Animation runs via CSS transition OR a Framer Motion variant.

```tsx
// src/components/effects/RevealSection.tsx
import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function RevealSection({
  children,
  delay = 0,
  className = '',
  threshold = 0.15,
}: {
  children: ReactNode;
  delay?: number;          // ms
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect(); // one-shot
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {children}
    </div>
  );
}
```

> Inspo uses one global observer; here each `RevealSection` creates its own. With ~10 sections that is fine. If we move to 100+ reveal items, switch to a singleton observer in a hook.

### Pattern 4: Plasma Fade On Scroll

**What:** Wrap inspo's `Plasma` in a positioned div whose `opacity` is driven by `useScroll().progress`.

```tsx
// In App.tsx
function PlasmaBackdrop() {
  const { progress } = useScroll();
  const opacity = Math.max(0, 1 - progress * 1.2); // fully gone slightly before 1 viewport
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
    >
      <Plasma color="#FF4500" speed={0.6} mouseInteractive={true} />
    </div>
  );
}
```

**Why this is correct:**

- The Plasma component keeps rendering frames even when opacity is 0 (waste). Add an early return when `opacity < 0.02` and unmount `<Plasma/>` to stop the rAF loop.
- The `Plasma` component already caps DPR at 2 and uses one `requestAnimationFrame` loop — good defaults.
- Use `aria-hidden` because it is purely decorative.

**Low-power fallback:** When `usePrefersReducedMotion()` returns true OR `useLowPowerDevice()` matches (e.g., `navigator.hardwareConcurrency <= 4` AND `window.innerWidth < 768`), render a static radial-gradient div instead of `<Plasma/>`.

### Pattern 5: PillNav Reveal After Hero

```tsx
function NavSlot() {
  const { y } = useScroll();
  const shown = y > window.innerHeight * 0.7; // reveal after 70% of hero scrolled
  return (
    <div
      className={cn(
        'fixed top-4 inset-x-0 z-[1000] transition-all duration-500',
        shown ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
      )}
    >
      <PillNav
        logo={<KBVLogo />}
        items={[
          { label: t('nav.about'), href: '#about' },
          { label: t('nav.projects'), href: '#projects' },
          { label: t('nav.stack'), href: '#stack' },
          { label: t('nav.contact'), href: '#contact' },
        ]}
        baseColor="#FF4500"
        pillColor="#050505"
        hoveredPillTextColor="#FFFFFF"
        pillTextColor="#ffe0e0"
      />
    </div>
  );
}
```

> `PillNav` source treats any href starting with `#` as external (uses plain `<a>` not `<Link>`). That is exactly what we want for anchor navigation — no code changes needed to make it work for a single-page site.

### Pattern 6: ParallaxCard

```tsx
// src/components/effects/ParallaxCard.tsx
import { ReactNode, useRef } from 'react';
import { useScroll } from '../../lib/scrollContext';

export function ParallaxCard({
  children,
  direction = 'up',
  intensity = 0.05,
}: { children: ReactNode; direction?: 'up' | 'down'; intensity?: number }) {
  const { y } = useScroll();
  const offset = y * intensity * (direction === 'up' ? -1 : 1);
  return (
    <div style={{ transform: `translate3d(0, ${offset}px, 0)`, willChange: 'transform' }}>
      {children}
    </div>
  );
}
```

**Why `translate3d` not `translateY`:** forces GPU compositing layer, avoids paint, keeps scroll smooth.

### Anti-Patterns to Avoid

- **Multiple `window.addEventListener('scroll', ...)`:** Each is its own callback fired 60-120/sec. Always go through `useScroll()`.
- **Setting state every scroll event (no rAF):** triggers React reconcile on every event — drops frames. rAF coalescing is mandatory.
- **Conditional translations (`{t('foo') || 'fallback'}`):** Defeats the type system and signals that copy is missing. Make i18n keys exhaustive; use `fallbackLng: 'en'` for the safety net.
- **Hardcoded English strings anywhere in JSX:** Even `aria-label`s. Run a manual grep for visible strings before declaring i18n complete.
- **Loading `<Plasma/>` on mobile portrait under 600px:** Even at DPR 2, the shader has 60 ray-march iterations per pixel — burns battery. Branch to static gradient.
- **Using `BrowserRouter` for the SPA on GitHub Pages without a 404.html redirect:** Direct visits to `/projects` would 404. Either use `HashRouter` OR ship the 404 redirect trick (see Routing section).
- **Importing `gsap/all`:** Pulls every plugin (~150KB). Import only `gsap` and the specific plugins you use.
- **Inlining locale JSON into components:** Defeats the namespace organization and makes EN/ES drift inevitable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser language detection | A switch on `navigator.language.split('-')[0]` plus localStorage glue | `i18next-browser-languagedetector` | Handles localStorage, cookies, sessionStorage, query param, HTML attribute, RTL edge cases |
| Translation interpolation/pluralization | `string.replace('{{name}}', value)` | `react-i18next`'s `t('greet', { name })` | ICU-style plurals, contexts, gender, fallback chains |
| WebGL shader runtime | Raw `gl.compileShader` calls | `ogl` | Handles attribute layout, uniform syncing, mesh lifecycle, context loss |
| Intersection Observer pooling | Singleton with manual ref tracking | Per-component `new IntersectionObserver` (one-shot, disconnect on reveal) | Browsers optimize multiple observers well; complexity not worth it for ~10 sections |
| Scroll progress hook | Multiple `useEffect`s with scroll listeners | Single `ScrollProvider` + `useScroll()` Context | Centralized, rAF-coalesced, one event listener |
| SPA history fallback for GitHub Pages | A custom `<Route fallback>` setup | The Spa-GitHub-Pages `404.html` redirect trick (or HashRouter) | Battle-tested for years; HashRouter sidesteps entirely |
| className merging with conditional Tailwind classes | Manual string concat | `cn = (...args) => twMerge(clsx(args))` | Dedups conflicting Tailwind utilities (`p-4` + `p-2` → `p-2`) |
| Prefers-reduced-motion | Hand-rolled media query listener | `usePrefersReducedMotion` hook (small) — keep custom but it is trivial | This one is fine to hand-roll (4 lines) but never skip implementing it |
| EN/ES content sync | "We will keep them in sync manually" | i18next-parser or i18next-scanner to extract used keys | Catches drift in CI |

**Key insight:** Every one of these is a "two-day rabbit hole that nobody sees once it works." Use the library, document the choice, move on.

---

## Common Pitfalls

### Pitfall 1: GitHub Pages Eats Subroutes On Direct Visit

**What goes wrong:** Visiting `https://kellybattistoni.github.io/projects` directly returns the GitHub Pages 404 page, not the React app.

**Why it happens:** GitHub Pages serves `index.html` only at root. Any other path is a static file lookup that fails → 404.

**How to avoid (two options):**

1. **`HashRouter` (simplest):** URLs look like `/#/projects`. GitHub Pages always serves `index.html` for `/`, React Router reads the hash. Zero infrastructure. **Recommended for this portfolio because it is single-page anyway** — the only "routes" are anchor links.
2. **`BrowserRouter` + `404.html` redirect trick:** Ship a `public/404.html` that JavaScript-redirects to `/?p=/whatever`, and add a snippet in `index.html` to convert it back. See [github.com/rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages).

**For Kelly's portfolio:** Since all navigation is anchor-based (`#about`, `#projects`, etc.), **no router is strictly needed**. Use `HashRouter` only because the `PillNav` source imports `Link` from `react-router-dom`. Wrapping `<App>` in `<HashRouter>` satisfies that import with zero behavior change for our anchor links (PillNav already treats `#`-prefixed hrefs as plain `<a>`).

**Warning signs:** Refreshing on a subroute shows the GH Pages 404 image.

### Pitfall 2: i18n Suspense Boundary Crashes On Initial Render

**What goes wrong:** With `react: { useSuspense: true }` (default in newer versions) and no `<Suspense>` boundary, the app throws "A React component suspended while rendering."

**Why it happens:** i18next can load resources asynchronously. Without Suspense or with `useSuspense: false`, you need to render a fallback yourself OR ensure resources are inlined.

**How to avoid:** We are inlining JSON via static `import`, so `useSuspense: false` is correct. Translations are always synchronous from frame 1. Verified by `inspo.txt` not relying on async loading either.

**Warning signs:** White screen on first paint; error mentions "Suspense" or "promise thrown."

### Pitfall 3: Tailwind Purging Strips Dynamic Class Names

**What goes wrong:** Writing `className={`text-${color}-500`}` results in no styling — Tailwind's JIT cannot see the class names in your source.

**Why it happens:** Tailwind scans source files for literal class strings. Computed class names are invisible.

**How to avoid:** Use a class lookup map: `const colorClass = { red: 'text-red-500', orange: 'text-orange-500' }[color]`. Or safelist patterns in `tailwind.config.js` if dynamic values are unavoidable.

**Warning signs:** Element looks unstyled in production but worked in dev (dev sometimes loads broader CSS).

### Pitfall 4: Plasma Continues Rendering When Invisible

**What goes wrong:** Plasma fades to `opacity: 0` on scroll, but its `requestAnimationFrame` loop keeps rendering ~60 frames/sec, draining battery.

**Why it happens:** Opacity is purely visual; the rAF loop in `Plasma.tsx` does not know.

**How to avoid:** In `PlasmaBackdrop`, conditionally unmount `<Plasma/>` once `opacity` drops below a threshold:

```tsx
{opacity > 0.02 && <Plasma color="#FF4500" speed={0.6} />}
```

Unmounting triggers the cleanup function (cancels rAF, disconnects ResizeObserver, removes canvas).

**Warning signs:** Battery drain on idle scrolled-down state. Browser dev tools "Rendering > Frame Rendering Stats" shows continuous GPU work.

### Pitfall 5: Wrong Vite `base` Breaks Assets In Production

**What goes wrong:** All asset URLs in `dist/` point to `/assets/...` but GitHub Pages serves the site from `/RepoName/assets/...`. 404s on every CSS, JS, image.

**Why it happens:** Vite's default `base: "/"` is correct only when the site is at the root URL.

**How to avoid:** For `KellyBattistoni.github.io` (the root-repo trick), `base: "/"` IS correct. For a project repo like `KellyBattistoni.github.io/portfolio`, `base: "/portfolio/"` would be required. Kelly's setup uses the root repo, so leave it at `"/"`. Document this in `vite.config.ts` with a comment.

**Warning signs:** Production site loads HTML but no styling; DevTools shows 404s on every asset.

### Pitfall 6: GSAP SSR Crash (Future-Proofing)

**What goes wrong:** If anyone later migrates this to Next.js or another SSR framework, GSAP throws "window is not defined" at build time.

**Why it happens:** GSAP touches `window` at import time.

**How to avoid (for now):** Not an issue with Vite (no SSR). Just note this in the README so a future migration knows to gate GSAP with `if (typeof window !== 'undefined')` or dynamic imports.

### Pitfall 7: Framer Motion + GSAP Fighting Over Transforms

**What goes wrong:** A `motion.div` and a GSAP timeline target the same element. They overwrite each other's `transform` style on every frame → jitter.

**Why it happens:** Both libraries write directly to `element.style.transform`.

**How to avoid:** Pick one per element. Recommended split:

- **Framer Motion:** Section enter/exit, hover states on cards/buttons.
- **GSAP:** PillNav animations only (since that is what the inspo uses).
- Never put `motion.div` around any element managed by `PillNav`'s internal GSAP.

**Warning signs:** Visual jitter on hover; transforms snapping back to wrong values.

---

## Code Examples

### `src/main.tsx` — Entry Point

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './i18n';        // initializes i18next as a side effect — must come before App
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

### `src/App.tsx` — Composition Root

```tsx
import { ScrollProvider } from './lib/scrollContext';
import { NoiseOverlay } from './components/layout/NoiseOverlay';
import { PlasmaBackdrop } from './components/effects/PlasmaBackdrop';
import { NavSlot } from './components/layout/NavSlot';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { StackSection } from './components/sections/StackSection';
import { ContactSection } from './components/sections/ContactSection';
import { FooterSection } from './components/sections/FooterSection';

export default function App() {
  return (
    <ScrollProvider>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4500]">
        <PlasmaBackdrop />
        <NoiseOverlay />
        <NavSlot />
        <main>
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <StackSection />
          <ContactSection />
          <FooterSection />
        </main>
      </div>
    </ScrollProvider>
  );
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Root GitHub Pages repo (KellyBattistoni.github.io) → base is "/"
// If we ever move to a project repo, change to "/repo-name/"
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### `index.html` — Preconnect + Fonts + Root

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Kelly Battistoni — AI Automations Manager. Engineering mindset, AI domain." />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
      rel="stylesheet"
    />

    <title>Kelly Battistoni — AI Automations</title>
  </head>
  <body class="bg-[#050505] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist -b gh-pages"
  }
}
```

> The `gh-pages` package pushes `dist/` to a `gh-pages` branch. In repo settings, set Pages source to "Deploy from branch → gh-pages → /". For the root user repo (`KellyBattistoni.github.io`), GitHub special-cases the `master`/`main` branch for serving — adjust to `-b main` if needed, or use the GitHub Actions deploy workflow instead.

---

## Data Flow

### Content (i18n)

```
src/locales/{en,es}/*.json
       │
       │  (static import at build time)
       ▼
src/i18n/index.ts  ── i18next.init({ resources, fallbackLng: 'en' })
       │
       │  (provider injected by `initReactI18next`)
       ▼
useTranslation('hero') in components
       │
       ▼
   t('title') → string
```

- **No async fetch.** All locales are bundled. Initial response time = 0 ms for translations.
- **Switching language** does not require a re-fetch; `i18n.changeLanguage('es')` flips the lookup table and triggers re-render of every `useTranslation` consumer.
- **Persistence** via `i18next-browser-languagedetector`'s `localStorage` cache (key: `kbv-lang`).

### Scroll Events

```
window.scroll event
   │  (passive listener)
   ▼
ScrollProvider rAF coalescer
   │
   ▼
ScrollCtx state { y, progress }
   │
   ├─→ PlasmaBackdrop (opacity = 1 - progress)
   ├─→ NavSlot (visible when y > 0.7 * vh)
   ├─→ HeroSection.contentWrapper (translateY, opacity)
   └─→ ParallaxCard × N (translateY based on y * intensity)
```

### Component Hierarchy Data Flow (props)

- **`ScrollProvider`** owns scroll state; everything below subscribes via `useScroll()`.
- **`PlasmaBackdrop`**, **`NavSlot`**, **`HeroSection`**, **`ParallaxCard`** are consumers — no props passed for scroll; they pull from context.
- **Section components** consume `useTranslation(<namespace>)` independently — no prop drilling for copy.
- **`LanguageSwitcher`** mutates global i18n state via `i18n.changeLanguage`, triggering re-render of all `useTranslation` consumers.

---

## Build Order

A dependency-ordered list of what must exist before what. Phase boundaries are explicit.

### Phase A — Scaffolding (foundations)
1. Vite + React + TypeScript project (`npm create vite@latest`).
2. Tailwind CSS configured; CSS variables for `--bg`, `--accent`, `--card` in `index.css`.
3. Fonts (Playfair Display, Inter) wired in `index.html` and Tailwind theme.
4. `cn()` helper in `src/lib/cn.ts`.
5. `vite.config.ts` with `base: "/"` and `@` alias.
6. `package.json` scripts including `deploy`.

### Phase B — i18n Backbone (no UI yet)
7. Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
8. Create `src/locales/en/common.json` and `src/locales/es/common.json` with one key (`{ "test": "Hello" }` / `"Hola"`).
9. Create `src/i18n/index.ts` initializing with `common` namespace only.
10. Import `./i18n` in `main.tsx` BEFORE `./App`.
11. Verify in a throwaway component: `useTranslation()` returns the right string, `i18n.changeLanguage('es')` flips it, page reload preserves the choice.
12. Add remaining namespace files (empty objects are fine until each section is built).

### Phase C — Scroll Backbone
13. Implement `ScrollProvider` + `useScroll()` in `src/lib/scrollContext.tsx`.
14. Wrap `<App>` with `<ScrollProvider>` (or wrap `<App/>` body — either is fine).
15. Smoke test by logging scroll in a temp component.

### Phase D — Visual Foundations
16. Build `NoiseOverlay` (fixed, pointer-events:none, low opacity, mix-blend-overlay). Host noise SVG in `public/`.
17. Build `Plasma.tsx` by copying inspo source verbatim. TypeScript types are already present.
18. Build `PlasmaBackdrop.tsx` that fades + unmounts Plasma based on scroll progress.
19. Build `usePrefersReducedMotion()` + `useLowPowerDevice()` hooks; integrate into `PlasmaBackdrop`.

### Phase E — Hero Section (first vertical slice end-to-end)
20. Build `HeroSection.tsx` with i18n strings (`hero.title`, `hero.tagline`, `hero.cta`).
21. Wire hero content parallax via `useScroll().y` (translateY + opacity).
22. Verify: Hero renders, copy is in EN and ES, Plasma is behind, noise on top, scroll fades hero content.

### Phase F — Navigation
23. Copy inspo `PillNav.tsx` to `src/components/layout/PillNav.tsx`. Type-check passes (it is TSX already).
24. Build `NavSlot.tsx` that wraps `<PillNav/>` in scroll-reveal logic + i18n labels.
25. Build `LanguageSwitcher.tsx` (renders inside or beside PillNav).
26. Verify: PillNav appears after hero scroll, anchor links jump to sections, hover circles work.

### Phase G — Reveal & Parallax Primitives
27. Build `RevealSection.tsx`.
28. Build `ParallaxCard.tsx`.

### Phase H — Remaining Sections (parallel-eligible)
29. `AboutSection.tsx` + populate `locales/{en,es}/about.json`.
30. `ProjectsSection.tsx` using `ParallaxCard` + populate `projects.json` (project data is content, not code — define an array structure: `{ id, titleKey, descriptionKey, tech, link?, image? }`).
31. `StackSection.tsx` + populate `stack.json` (tech stack items, possibly with logos in `public/logos/`).
32. `ContactSection.tsx` + populate `contact.json`. Include `<CVDownloadButton/>` that links to `/CV_Kelly_Battistoni_${lang}.pdf`.
33. `FooterSection.tsx`.

### Phase I — Performance & Polish
34. Lighthouse pass; check Plasma cost on a low-end device emulation.
35. Tab/keyboard navigation audit; focus styles on PillNav.
36. `prefers-reduced-motion` fallback for ALL animations.
37. Lazy-load PDF and any large images.
38. `og:` and `twitter:` meta tags in `index.html`.

### Phase J — Deployment
39. Add `public/404.html` with the SPA redirect script (defensive; even with `HashRouter` it costs nothing).
40. Configure GitHub repo: name = `KellyBattistoni.github.io`, branch = `main`.
41. Run `npm run deploy`. Verify live URL.
42. Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs `npm ci && npm run build && gh-pages -d dist` on push to `main`. Optional but recommended.

**Critical sequencing rules:**
- i18n MUST come before any section component (Phase B before E onwards).
- ScrollProvider MUST exist before any component reads `useScroll()` (Phase C before D).
- Plasma MUST exist before HeroSection's full visual is complete (D before E).
- PillNav references section anchors — sections must use the matching `id` attributes (Phase E/F coordination on the id values: `#hero`, `#about`, etc.).

---

## GitHub Pages SPA Routing Solution

**Recommended:** Use `HashRouter`.

**Why:** This is a single-page portfolio with anchor-link navigation (`#about`, `#projects`, etc.). The user will never expect to type a URL like `/projects` directly. `HashRouter` requires zero infrastructure tweaks and works on any static host.

**Implementation:** Wrap `<App/>` in `<HashRouter>` in `main.tsx` (shown above). PillNav's items use `#about`-style hrefs, which the component routes through plain `<a href>` (it only uses React Router `<Link>` for non-anchor paths). The hash fragment naturally drives browser scroll behavior — `<section id="about">` becomes the target.

**Defensive backup:** Even with HashRouter, ship a `public/404.html` that redirects to `/` in case Pages serves a 404 for any reason. Minimal cost.

```html
<!-- public/404.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <script>
      // If GH Pages 404s for any path, send the visitor home.
      // The HashRouter takes over from there.
      window.location.replace('/');
    </script>
  </head>
  <body></body>
</html>
```

**Alternative (NOT recommended for this project):** `BrowserRouter` + the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) `404.html` script. Adds complexity for zero benefit when all nav is anchors.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Webpack-based CRA scaffolding | Vite | CRA officially deprecated (2025) | Faster dev server, smaller config, ESM-native |
| Tailwind v3 PostCSS plugin | Tailwind v4 first-class Vite plugin | Tailwind v4 stable in 2025 | Simpler config (no `postcss.config.js`), CSS-first variable theming |
| React Router v5 `<Route component={X}/>` | RR v6 `<Route element={<X/>}/>` | v6 released 2021, dominant by 2024 | More composable; nested routing improvements |
| i18next + manual lang detection | `i18next-browser-languagedetector` | Standard for years | Less custom code, more edge cases handled |
| jQuery scroll plugins | IntersectionObserver | Universally supported since ~2019 | Off the main thread; no scroll-fight |
| Three.js for backgrounds | OGL for lightweight WebGL | OGL is ~25KB vs three's ~150KB+ | Smaller bundle, fewer abstractions when you only need a single shader |

**Deprecated/outdated:**
- **CRA (`create-react-app`):** Officially unmaintained. Do not use.
- **`react-helmet`:** Replaced by `react-helmet-async`, or simply put meta tags in `index.html` for a single-page site.
- **`react-spring` for portfolio reveals:** Framer Motion is the community default now.
- **`gsap/ScrollTrigger` for this project's needs:** Overkill when a single scroll context drives a few effects. Keep GSAP for PillNav internals only.

---

## Open Questions

1. **Tailwind v3 vs v4 at install time?**
   - What we know: v4 is GA and ships a first-class Vite plugin; the inspo uses v3 syntax (which works identically in v4 for the utility classes used).
   - What's unclear: Plugin/PostCSS config differences. Whether v4 has reached "boring default" status in the React community.
   - Recommendation: At project init, check the Tailwind docs. If v4 is the headline install path → use it. If v3 is still the prominent recommendation → use v3. Either works for this code.

2. **Wrap content in `HashRouter` or drop `react-router-dom` entirely?**
   - What we know: `PillNav.tsx` imports `Link` from `react-router-dom`. Removing the import requires editing inspo source.
   - What's unclear: Whether the marginal bundle saving (~20KB gzipped for react-router-dom) is worth diverging from inspo source.
   - Recommendation: Keep `HashRouter` + react-router-dom for v1. If a v2 perf pass demands it, refactor `PillNav` to drop the import.

3. **Use `react-i18next`'s Suspense mode or eager-load resources?**
   - What we know: Eager-loading (static imports) keeps i18n synchronous and avoids Suspense boundaries.
   - What's unclear: Whether code-splitting Spanish out of the initial bundle is worth it (EN-only users would skip ~10KB JSON).
   - Recommendation: Eager-load for v1. Six namespaces of bilingual JSON is < 50KB total — negligible. Revisit only if measured budget is tight.

4. **GitHub Actions vs `gh-pages` package for deploy?**
   - What we know: `gh-pages` works locally; Actions auto-deploys on push.
   - What's unclear: Whether Kelly wants manual control over deploys.
   - Recommendation: Ship `gh-pages` package script first (`npm run deploy`). Add Actions in Phase J step 42 once the manual flow is verified.

5. **Per-language CV PDF vs single PDF?**
   - What we know: PROJECT.md mentions CV download.
   - What's unclear: Is there a Spanish version of the CV?
   - Recommendation: Plan for two PDFs (`CV_Kelly_Battistoni_EN.pdf`, `CV_Kelly_Battistoni_ES.pdf`) in `public/`; the `CVDownloadButton` picks based on `i18n.language`. If only an EN PDF exists initially, default both languages to it and add the ES version later — no architectural change needed.

---

## Sources

### Primary (HIGH confidence)
- **`inspo.txt`** in the project root — full source for `Plasma`, `PillNav`, and the landing page reference HTML. This is the most authoritative source for what the components do because it IS the code.
- **`.planning/PROJECT.md`** — locked decisions and constraints.

### Secondary (MEDIUM confidence — based on training data, verify at install)
- **Vite docs** — `base` option, plugin setup. Stable API for years.
- **React 18 docs** — `createRoot`, StrictMode behavior.
- **react-i18next docs** — Initialization options, `useTranslation`, `useSuspense` toggle.
- **GitHub Pages documentation** — Root-repo trick (`username.github.io` serves at root), Pages settings.
- **Tailwind CSS docs** — JIT mode, purging behavior (Tailwind v3 vs v4 — verify which is current at install time).
- **OGL on npm** — `Renderer`, `Program`, `Triangle` API used by Plasma source.
- **GSAP docs** — Timeline, tweenTo, `power3.out` ease. Stable for years.

### Tertiary (LOW confidence — community pattern, no specific source cited)
- **Single-scroll-listener pattern** — Standard performance advice in the React community; not a single canonical source. Confidence in the pattern is HIGH but no specific URL.
- **HashRouter vs 404.html trick** — `rafgraph/spa-github-pages` is the canonical implementation of the 404 trick; widely cited. HashRouter is documented in React Router docs.

> **Honesty note:** Web search and direct doc fetching were not available during this research. All version numbers should be re-validated when the project is initialized (run `npm view <pkg> version`). The architectural patterns and decision rationale are independent of exact versions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — Stack is locked by PROJECT.md and inspo dependencies; only exact patch versions are TBD.
- Architecture (component hierarchy, data flow): **HIGH** — Drawn directly from inspo behavior + standard React patterns.
- i18n setup: **HIGH** for the pattern; **MEDIUM** for specific version numbers.
- Scroll choreography: **HIGH** — Single-rAF-coalesced pattern is industry-standard.
- GitHub Pages routing: **HIGH** — Both HashRouter and 404.html tricks are well-documented patterns.
- Pitfalls: **HIGH** for the ones drawn from inspo (e.g., Plasma DPR cap, GSAP/Framer conflict); **MEDIUM** for general framework gotchas.
- Build order: **HIGH** — Standard dependency-driven phase ordering.

**Research date:** 2026-06-09
**Valid until:** 2026-07-09 (30 days; longer-lived because the stack is stable and decisions are locked)
**Refresh trigger:** Tailwind v4 adoption status, React 19 stabilization (if 19 ships, revisit `StrictMode` and concurrent features), Vite 6+ ecosystem stability.
