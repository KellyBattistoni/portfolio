# Stack Research

**Researched:** 2026-06-09
**Domain:** React + Vite personal portfolio (single-page, static, bilingual EN/ES, GitHub Pages)
**Owner:** Kelly Battistoni Villota — AI Automations Manager
**Target host:** `KellyBattistoni.github.io` (user site, default `gh-pages` branch)
**Confidence:** MEDIUM-HIGH overall (Tailwind v4 + React Router v7 = HIGH from official docs; Vite/GSAP/Motion/OGL/i18next versions = MEDIUM, pin via `npm view <pkg> version` before locking in package.json)

---

## Summary

The recommended stack for this portfolio is the **modern minimalist Vite SPA stack**: Vite 5+ as the build tool, React 18 as the runtime, Tailwind CSS v4 via the dedicated `@tailwindcss/vite` plugin (no `tailwind.config.js`), React Router v7 in `HashRouter` mode for GitHub Pages, `react-i18next` + `i18next-browser-languagedetector` for EN/ES translation, and the `gh-pages` npm package for one-command deploys to the `gh-pages` branch.

Two decisions matter most:

1. **Use `HashRouter`, not `BrowserRouter`.** GitHub Pages does not support SPA URL rewrites natively. `HashRouter` works out-of-the-box without 404 hacks. A `BrowserRouter` solution requires a `404.html` redirect trick that breaks deep-linking, breaks `<meta>` tag previews on social shares, and creates a brief flash of wrong content. For a portfolio whose URLs will be shared on LinkedIn and pasted in chats, `HashRouter` is strictly safer.
2. **For a `username.github.io` user site, set `base: '/'` in `vite.config.js`, not `/repo-name/`.** This is different from project-site deployments and is the #1 silent break when copying tutorials.

**Primary recommendation:** Build with Vite + React 18 + Tailwind v4 (CSS-first config) + HashRouter + react-i18next + `gh-pages` deploy script. Skip TypeScript unless you want it — portfolio code is shallow and JSX-only is faster to iterate. All animation libs already chosen (GSAP, Framer Motion, OGL) are appropriate and current.

---

## Standard Stack

### Core

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `react` | `^18.3.x` | UI runtime | Stable, mature, every animation lib in this stack is tested against it. React 19 is now stable but GSAP/Framer Motion/OGL ecosystems have less battle-testing on it; staying on 18 = lower risk for an aesthetics-driven portfolio. |
| `react-dom` | `^18.3.x` | DOM renderer | Pair with `react` |
| `vite` | `^5.4.x` (or `^6.x`/`^7.x` if comfortable) | Build tool + dev server | Industry default for React SPAs. Native ESM dev, fast HMR, first-class plugin ecosystem. Vite 5.x is the LTS-feeling baseline; 6/7 are fine but verify all plugins are compatible. |
| `@vitejs/plugin-react` | `^4.3.x` | React Fast Refresh + JSX | Official React plugin from the Vite team. Don't substitute with `@vitejs/plugin-react-swc` unless you have a measured reason — Babel version handles GSAP/Framer Motion edge cases more predictably. |

### Styling

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `tailwindcss` | `^4.0.x` or later | Utility-first CSS | v4 is faster (3-8x build speed), uses CSS-first config (`@theme {}`), no `tailwind.config.js` required, no PostCSS plugin needed. |
| `@tailwindcss/vite` | `^4.0.x` | Vite integration plugin | **HIGH confidence — official Tailwind docs recommend this exact plugin for Vite projects.** Replaces the old PostCSS-based setup. Single plugin entry, single CSS import. |

**Browser support note (HIGH confidence, official Tailwind v4 upgrade guide):** Tailwind v4 requires **Safari 16.4+, Chrome 111+, Firefox 128+**. For a 2026 portfolio targeting tech-savvy recruiters this is fine; if you needed to support Safari 15 you'd stay on Tailwind v3.

### Routing

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `react-router-dom` | `^7.x` | Client-side routing | **HIGH confidence — react-router v7 is current stable.** v7 unifies the data-router and library modes. For a SPA portfolio, install `react-router-dom` and import `HashRouter` from it. |

**Critical:** Use `HashRouter`, NOT `BrowserRouter`. See "GitHub Pages Deployment" section below.

### Animation

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `gsap` | `^3.12.x` or `^3.13.x` | PillNav animation, timeline-based motion | Industry standard for complex timeline animation. **All GSAP plugins (including SplitText, MorphSVG, etc.) became fully free for commercial use after Webflow acquired GreenSock in 2024** — confirm the latest license terms on gsap.com before relying on Club-only plugins, but core GSAP is and has always been MIT-friendly free. |
| `framer-motion` | `^11.x` or rename to `motion` | Scroll reveals, page transitions, declarative React animations | Note: **Framer Motion was renamed to `motion` (package name `motion`) circa 2024**. Both `framer-motion` and `motion` exist on npm and are maintained; `motion` is the forward path. For a portfolio, pick one and stick with it. MEDIUM confidence on rename status — verify with `npm view framer-motion` vs `npm view motion` before deciding. |
| `ogl` | `^1.0.x` | Lightweight WebGL — Plasma shader background | ~50KB vs three.js ~600KB. Perfect for a single fullscreen shader effect. Author: Nathan Gordon (oframe/ogl). Has no plugin ecosystem — that's intentional, it's a thin wrapper around raw WebGL2. |

### i18n

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `i18next` | `^23.x` or later | i18n engine | The mature, battle-tested i18n library for the JS ecosystem. Backend-agnostic. |
| `react-i18next` | `^14.x` or later | React bindings (`useTranslation`, `<Trans>`) | Official React adapter from the i18next team. |
| `i18next-browser-languagedetector` | `^7.x` or `^8.x` | Auto-detect user language from `navigator.language`, `localStorage`, `?lng=` query | Detects EN vs ES based on browser preference, persists choice in localStorage. Standard companion to react-i18next. |

**Alternative considered:** `react-intl` (FormatJS). Heavier, ICU-message-format focused, better for complex pluralization/dates. Overkill for a static portfolio with ~50-100 translated strings. **Don't use it here.**

**Alternative considered:** Raw context + JSON files. Tempting for "just two languages" but you'll rebuild language detection, language switching, `<Trans>` for interpolated JSX, and pluralization yourself. Don't hand-roll — see below.

### Deployment

| Library | Version (target) | Purpose | Why Standard |
|---|---|---|---|
| `gh-pages` | `^6.x` | One-command deploy of `dist/` to `gh-pages` branch | npm-standard tool, used in Vite's own documentation example. Avoids GitHub Actions complexity for a simple SPA. |

### Supporting (recommended but optional)

| Library | Version (target) | Purpose | When to Use |
|---|---|---|---|
| `clsx` | `^2.x` | Conditional className composition | Whenever you have `className={\`base ${active ? 'is-active' : ''}\`}` repetition. |
| `tailwind-merge` | `^2.x` | Deduplicate conflicting Tailwind classes | If you build reusable components that accept a `className` prop override. Optional for a small portfolio. |
| `react-helmet-async` | `^2.x` | Per-page `<title>` and `<meta>` for SEO and social sharing | Important because the portfolio name and tagline should appear correctly in LinkedIn shares. Lightweight (~3KB). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Vite | Next.js | Overkill — Next.js's SSR/RSC features are wasted on a static portfolio, and deploying Next.js to GitHub Pages requires `next export` (deprecated) or static export config. Pure friction. |
| Tailwind v4 | Tailwind v3 (`tailwindcss@^3.4`) + `postcss` + `autoprefixer` | Use v3 only if you need Safari 15 support. v4 is faster and simpler. |
| react-i18next | `react-intl`, `lingui`, `next-intl` | All heavier or framework-specific. Don't bother. |
| HashRouter | BrowserRouter + 404.html redirect | The redirect trick (spa-github-pages by rafgraph) works but is fragile — see Pitfalls. |
| `gh-pages` npm package | GitHub Actions deploy-pages workflow | Actions is cleaner for teams but adds YAML complexity for a solo portfolio. Both are valid; `gh-pages` is the lower-friction default. |
| OGL | three.js, react-three-fiber | Three.js + R3F is 10x heavier. For one fullscreen Plasma shader, OGL is the right tool. R3F only wins if you have multiple 3D objects with React-driven state. |

### Installation

```bash
# Scaffold
npm create vite@latest portfolio -- --template react
cd portfolio
npm install

# Styling
npm install tailwindcss @tailwindcss/vite

# Routing
npm install react-router-dom

# Animation
npm install gsap framer-motion ogl

# i18n
npm install i18next react-i18next i18next-browser-languagedetector

# SEO helpers (optional but recommended)
npm install react-helmet-async

# Class utilities (optional)
npm install clsx tailwind-merge

# Deploy
npm install --save-dev gh-pages
```

---

## Architecture Patterns

### Recommended Project Structure

```
portfolio/
├── public/
│   ├── 404.html              # only if you choose BrowserRouter (not recommended)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── PillNav/          # GSAP-animated nav
│   │   ├── Plasma/           # OGL WebGL background
│   │   ├── ScrollReveal/     # Framer Motion wrapper
│   │   └── LanguageSwitcher/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Work.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── i18n/
│   │   ├── index.js          # i18next.init()
│   │   ├── en.json
│   │   └── es.json
│   ├── hooks/
│   │   └── useGsap.js        # gsap.context() helper
│   ├── styles/
│   │   └── index.css         # @import "tailwindcss" + @theme {}
│   ├── App.jsx               # <HashRouter> + <Routes>
│   └── main.jsx              # ReactDOM.createRoot + i18n bootstrap
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Pattern 1: Vite + Tailwind v4 Configuration

**HIGH confidence — verified from official Tailwind docs.**

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/', // user site (KellyBattistoni.github.io) → '/'. Project site → '/repo-name/'.
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  /* CSS-first theme config replaces tailwind.config.js */
  --color-bg: #0a0a0f;
  --color-fg: #f5f5f7;
  --color-accent: oklch(0.72 0.18 280);
  --font-display: "Inter", "system-ui", sans-serif;
}

/* Site globals */
html, body { background: var(--color-bg); color: var(--color-fg); }
```

Import in `main.jsx`:

```js
import './styles/index.css';
```

**No `tailwind.config.js`, no `postcss.config.js` required.**

### Pattern 2: HashRouter Setup for GitHub Pages

**HIGH confidence — verified from official React Router v7 docs.**

```jsx
// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}
```

URLs will look like `https://kellybattistoni.github.io/#/work`. Acceptable for a portfolio. The `#` is the price of zero-config static hosting.

### Pattern 3: react-i18next Bootstrap (EN/ES)

**MEDIUM confidence — verify init shape against current `react-i18next` README at install time. The general pattern is stable across versions.**

```js
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import es from './es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;
```

```js
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // initializes i18next before App renders
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```jsx
// Any component
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();
  return <h1>{t('hero.title')}</h1>;
}

// Language switcher
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div>
      <button onClick={() => i18n.changeLanguage('en')}>EN</button>
      <button onClick={() => i18n.changeLanguage('es')}>ES</button>
    </div>
  );
}
```

```json
// src/i18n/en.json
{
  "hero": {
    "title": "Kelly Battistoni",
    "subtitle": "AI Automations Manager"
  },
  "nav": {
    "work": "Work",
    "about": "About",
    "contact": "Contact"
  }
}
```

```json
// src/i18n/es.json
{
  "hero": {
    "title": "Kelly Battistoni",
    "subtitle": "Gerente de Automatizaciones con IA"
  },
  "nav": {
    "work": "Trabajo",
    "about": "Sobre mí",
    "contact": "Contacto"
  }
}
```

### Pattern 4: GSAP Inside React (use `useGSAP` or context cleanup)

```jsx
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react'; // optional: npm i @gsap/react

export function PillNav() {
  const navRef = useRef(null);

  useGSAP(() => {
    gsap.from('.pill', { y: -20, opacity: 0, stagger: 0.1, ease: 'power3.out' });
  }, { scope: navRef });

  return <nav ref={navRef}>{/* ... */}</nav>;
}
```

**Without `@gsap/react`**, use `useEffect` + `gsap.context()` to ensure cleanup on unmount and in React StrictMode dev double-renders.

### Pattern 5: Framer Motion Scroll Reveals

```jsx
import { motion } from 'framer-motion';

export function ScrollReveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 6: OGL Plasma Background (component shape)

```jsx
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

export function Plasma() {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: /* glsl */ `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`,
      fragment: /* glsl */ `precision highp float; uniform float uTime; uniform vec2 uResolution;
        void main() { /* plasma shader here */ gl_FragColor = vec4(/*...*/ 1.0); }`,
      uniforms: { uTime: { value: 0 }, uResolution: { value: [1, 1] } },
    });
    const mesh = new Mesh(gl, { geometry, program });

    let raf;
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    const tick = (t) => {
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
}
```

### Anti-Patterns to Avoid

- **`BrowserRouter` on GitHub Pages without a `404.html` redirect shim.** Deep links will 404. Use `HashRouter`.
- **Setting `base: '/repo-name/'` for a user site.** A user site lives at the root (`KellyBattistoni.github.io/`). `base: '/'` is correct. The `/repo-name/` form is only for project sites (e.g. `KellyBattistoni.github.io/portfolio/`).
- **Hand-rolling language switching with React Context.** You'll rebuild detection, persistence, `<Trans>` for inline JSX, and plural rules. Use `react-i18next`.
- **Running GSAP inside `useEffect` without cleanup.** React 18 StrictMode double-invokes effects in dev; uncleaned-up timelines duplicate animations. Use `gsap.context()` or `useGSAP`.
- **Importing all of three.js for one shader.** Use OGL — that's exactly its niche.
- **Inlining translation strings.** Hard to find later, untranslatable. All user-facing copy goes through `t('key')`.

---

## GitHub Pages Deployment (the load-bearing section)

### Decision: User Site vs Project Site

| Type | URL | Repository name | `base` in vite.config | Branch served |
|---|---|---|---|---|
| **User site (chosen here)** | `https://KellyBattistoni.github.io/` | `KellyBattistoni.github.io` (exact match required) | `'/'` | `main` or `gh-pages` (configurable) |
| Project site | `https://KellyBattistoni.github.io/repo-name/` | any repo name | `'/repo-name/'` | `gh-pages` typically |

The requirements say `KellyBattistoni.github.io`, so this is a **user site**. **`base: '/'` is correct.**

### Deployment Workflow (using `gh-pages` package)

**Step 1.** Install:

```bash
npm install --save-dev gh-pages
```

**Step 2.** Add `homepage` and scripts to `package.json`:

```json
{
  "homepage": "https://KellyBattistoni.github.io",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist -b gh-pages"
  }
}
```

The `-b gh-pages` flag publishes to the `gh-pages` branch. For a user site, you can alternatively deploy to `main` by changing to `-b main` but using a dedicated `gh-pages` branch keeps source on `main` clean.

**Step 3.** Set `base: '/'` in `vite.config.js` (shown in Pattern 1 above).

**Step 4.** First deploy:

```bash
npm run deploy
```

This builds to `dist/`, then force-pushes `dist/` contents to the `gh-pages` branch of the current repo's `origin` remote.

**Step 5.** In GitHub repo Settings → Pages, set:
- **Source:** Deploy from a branch
- **Branch:** `gh-pages` / `(root)`
- Save. The site is live at `https://KellyBattistoni.github.io/` within ~60s.

### Branch Configuration Verification

After first deploy, confirm:
- `gh-pages` branch exists and contains `index.html`, `assets/`, etc.
- Repo Settings → Pages shows "Your site is live at https://kellybattistoni.github.io/"
- Hard-refresh and verify routing — visiting `/#/work` should land on the Work page.

### Why Not GitHub Actions?

You could use the `actions/deploy-pages` workflow. It's cleaner for a team. For a solo portfolio, `gh-pages` package is one command (`npm run deploy`) and one branch and zero YAML. Pick Actions only if you want auto-deploy-on-push.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Language detection + persistence | Custom `useLanguage` context + localStorage code | `i18next-browser-languagedetector` | Detection order, query string overrides, cookie fallback, edge cases (multiple `Accept-Language` values) are easy to get wrong |
| Translation interpolation | `text.replace('{name}', name)` | `t('hello', { name })` + ICU/i18next plural rules | Spanish has gender + plural agreement; doing this by hand explodes quickly |
| Inline JSX inside translated strings | `<>Hello {name}, click <a>here</a></>` translated piecewise | `<Trans>` component from react-i18next | Preserves translator-friendly markup |
| Scroll-reveal observer | Custom IntersectionObserver hook | `motion.div whileInView` (Framer Motion) | One-liner, handles cleanup, supports re-trigger flags |
| Timeline animation choreography | Setting CSS transitions and delays manually | GSAP timelines | Sequencing, easing curves, scrubbing, kill-on-unmount — GSAP solves all of it |
| WebGL boilerplate (compile shaders, manage buffers, RAF loop) | Raw `gl.createShader` calls | OGL `Renderer` + `Program` + `Mesh` | Already minimal; further minification is wasted effort |
| SPA → static host routing fallback | Custom `404.html` JavaScript redirect script | `HashRouter` | The 404 redirect (spa-github-pages) works but breaks meta-tag scrapers on first hit |
| Deploy pipeline | Custom git push script for `dist/` | `gh-pages` npm package | Handles force-push, branch creation, `.nojekyll` flag, atomic deploy |
| Class merging when overriding component styles | `${'base'} ${className ?? ''}` string concat | `clsx` + `tailwind-merge` | Handles conflicts (e.g. caller passes `p-4`, base uses `p-2`) |

**Key insight:** Every animation and i18n feature you "could just build" hides edge cases that ate months of person-years in their respective libraries. For a portfolio whose job is to look polished and ship fast, you want zero invented infrastructure.

---

## Common Pitfalls

### Pitfall 1: Wrong `base` for user vs project site
**What goes wrong:** Site deploys but all assets 404. Page is blank.
**Why it happens:** Tutorial copied from a project-site example (`base: '/my-repo/'`) and applied to a user site.
**How to avoid:** For `KellyBattistoni.github.io`, set `base: '/'`. Test with `npm run build && npm run preview` locally — `preview` respects the `base`.
**Warning signs:** Network tab shows requests to `/KellyBattistoni.github.io/assets/...` returning 404, or `index.html` loads but `<script>` tags point to wrong paths.

### Pitfall 2: BrowserRouter on GitHub Pages → 404 on refresh
**What goes wrong:** Visiting `/work` directly (or refreshing on `/work`) returns GitHub's 404 page.
**Why it happens:** GitHub Pages serves static files. It has no router; only `/index.html` exists.
**How to avoid:** Use `HashRouter`. URLs become `/#/work` but they always work.
**Warning signs:** Dev (`npm run dev`) works fine, production refresh 404s.

### Pitfall 3: Tailwind v4 + older Safari users see broken styling
**What goes wrong:** Some visitors report misaligned or invisible elements.
**Why it happens:** Tailwind v4 requires Safari 16.4+ / Chrome 111+ / Firefox 128+. v4 uses `@property`, `color-mix()`, cascade layers — older browsers don't understand them.
**How to avoid:** Either accept the support cutoff (fine for a 2026 tech portfolio) or stay on Tailwind v3.
**Warning signs:** Bug reports from iPhone users on iOS 15 or earlier.

### Pitfall 4: GSAP animations duplicate in React StrictMode dev
**What goes wrong:** Animations play twice in dev, look fine in prod.
**Why it happens:** React 18 StrictMode double-invokes effects to catch bugs. Each invocation creates a new GSAP timeline without cleaning up the old one.
**How to avoid:** Wrap in `gsap.context()` and return a cleanup, or use the `@gsap/react` `useGSAP` hook (auto-cleanup).
**Warning signs:** PillNav animation feels "twitchy" or duplicated in dev only.

### Pitfall 5: OGL canvas leaks on hot-reload
**What goes wrong:** Multiple canvases stack up during `npm run dev`, performance tanks.
**Why it happens:** Vite HMR re-mounts the component without disposing of the previous WebGL context.
**How to avoid:** In the `useEffect` cleanup, remove the canvas (`gl.canvas.remove()`) AND cancel the animation frame. Optionally call `gl.getExtension('WEBGL_lose_context')?.loseContext()`.
**Warning signs:** Dev tab gets sluggish after 10 min of editing the Plasma component.

### Pitfall 6: Language switch doesn't trigger re-render
**What goes wrong:** Click "ES" button, language state updates internally but UI stays English until refresh.
**Why it happens:** Component used a hardcoded string or read `i18n.language` outside of `useTranslation()`.
**How to avoid:** Always pull `t` from `useTranslation()`. For the current language code, use `i18n.language` from the same hook — that subscribes to changes.
**Warning signs:** Some strings update on language switch, others don't.

### Pitfall 7: `predeploy` not running before `deploy`
**What goes wrong:** Deploys stale build, or fails because `dist/` doesn't exist.
**Why it happens:** Running `npx gh-pages -d dist` directly instead of `npm run deploy` skips the `predeploy` build step.
**How to avoid:** Always invoke via `npm run deploy`. npm auto-runs `predeploy` before `deploy`.
**Warning signs:** Deploys complete but site doesn't reflect latest code.

### Pitfall 8: Missing `.nojekyll` causes asset 404s
**What goes wrong:** Files in folders starting with `_` (e.g. Vite's emitted code chunks) get ignored by GitHub Pages' Jekyll processor.
**Why it happens:** GitHub Pages runs Jekyll by default, which excludes `_*` directories.
**How to avoid:** The `gh-pages` npm package adds `.nojekyll` automatically. If using GitHub Actions, ensure your workflow creates an empty `.nojekyll` in `dist/`.
**Warning signs:** Build assets like `_app/` or chunked filenames return 404.

### Pitfall 9: Routing works locally with `BrowserRouter` so dev thinks it's fine
**What goes wrong:** Localhost respects `vite preview`'s built-in fallback to `index.html`, hiding the GitHub Pages problem.
**Why it happens:** Vite preview is a dev convenience; GitHub Pages is a true static host.
**How to avoid:** Confirm `HashRouter` decision *before* writing routes. Test deep-link refresh against the deployed URL, not just localhost.

### Pitfall 10: Forgetting CNAME / custom domain breaks on re-deploy
**What goes wrong:** Custom domain reverts to `*.github.io` after `npm run deploy`.
**Why it happens:** `gh-pages` package force-pushes contents of `dist/`; if there's no `public/CNAME` file in your source, the deployed CNAME gets wiped.
**How to avoid:** Put `CNAME` in `public/` so Vite copies it to `dist/` on every build. (Not applicable here — using the default `*.github.io` hostname.)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `tailwind.config.js` + PostCSS plugin | `@tailwindcss/vite` + `@theme {}` in CSS | Tailwind v4 (2025) | No config file, faster builds, CSS variables exposed at runtime |
| `tailwindcss` v3 + `postcss` + `autoprefixer` | `tailwindcss` v4 alone | v4 release | Drops two devDependencies, drops `postcss.config.js` |
| `react-router-dom` v6 with separate `react-router` v6 | `react-router-dom` v7 (unified) | v7 release | Single package, data router and library router merged |
| `BrowserRouter` + `404.html` redirect for GH Pages | `HashRouter` | Stable advice for years | `HashRouter` is the maintainable choice |
| GSAP behind paywall for premium plugins (SplitText etc.) | All GSAP plugins free post-Webflow acquisition | 2024 | No more "GSAP Club" license required for SplitText, MorphSVG, etc. **Verify current license terms at gsap.com before relying.** |
| `framer-motion` package | `motion` package (rename) | 2024-ish | Both names still on npm. `motion` is forward path. **Pick one and pin it.** |
| Babel + Webpack for React | Vite + `@vitejs/plugin-react` | Stable since 2022 | Sub-second HMR, simpler config |
| `create-react-app` (CRA) | `npm create vite@latest` | CRA officially deprecated 2023 | Don't use CRA; it's unmaintained |
| Loading translations via dynamic backend | Bundled JSON files | For small portfolios | At 2-language × ~100-key scale, just import the JSONs directly. Backend-loading is for large multi-locale apps |

**Deprecated/outdated:**
- `create-react-app` — abandoned. Use Vite.
- `tailwindcss-postcss7-compat` — Tailwind v4 no longer requires PostCSS.
- `react-router` v5 patterns (`<Switch>`, `useHistory`) — replaced by `<Routes>` and `useNavigate` in v6+.
- Hand-coded language switcher with React Context — `react-i18next` is the standard.

---

## Open Questions

1. **Exact current pinned versions of Vite, GSAP, Motion, OGL, i18next.**
   - What we know: Major version recommendations above are correct as of 2026.
   - What's unclear: Latest patch-level releases.
   - Recommendation: Run `npm view <package> version` for each dependency before locking into `package.json`. Don't blindly trust the version numbers above.

2. **`framer-motion` vs `motion` package name decision.**
   - What we know: The Motion team renamed/rebranded around 2024.
   - What's unclear: Whether `framer-motion` is now a deprecation alias or still co-maintained.
   - Recommendation: Visit motion.dev at install time, pick the recommended package name, document the choice in the codebase, don't install both.

3. **Whether to adopt Tailwind v4 or stay on v3.**
   - What we know: v4 is faster and simpler, but requires Safari 16.4+.
   - What's unclear: The exact recruiter/visitor browser distribution.
   - Recommendation: Go v4. Recruiters in 2026 are on current browsers.

4. **Whether the OGL Plasma shader code is already written or needs authoring.**
   - What we know: OGL handles the renderer; the shader (GLSL) is project-specific code.
   - What's unclear: Whether Kelly has the shader from a prior project or it needs designing.
   - Recommendation: Plan a dedicated Plasma phase that owns shader authoring + perf tuning + mobile fallback (CSS gradient on low-end devices).

5. **TypeScript vs JSX-only.**
   - What we know: Either works. TS adds friction for a small project but helps with i18n key safety.
   - What's unclear: Kelly's preference.
   - Recommendation: Start in JSX. Adding TS later to a Vite project is `npm install -D typescript @types/react @types/react-dom` + rename + done.

---

## Sources

### Primary (HIGH confidence)
- **Tailwind CSS docs — Vite installation** (`tailwindcss.com/docs/installation/using-vite`) — confirmed `@tailwindcss/vite` plugin and CSS-first `@import "tailwindcss"` setup
- **Tailwind CSS v4 release post** (`tailwindcss.com/blog/tailwindcss-v4`) — confirmed CSS-first `@theme {}` config, performance numbers, P3/OKLCH palette
- **Tailwind CSS upgrade guide** — confirmed browser support requirements (Safari 16.4+, Chrome 111+, Firefox 128+) and `@tailwindcss/postcss` / `@tailwindcss/vite` split
- **React Router v7 installation docs** (`reactrouter.com/start/library/installation`) — confirmed v7.x as current stable, `BrowserRouter` shown as primary
- **React Router v7 routing docs** (`reactrouter.com/start/library/routing`) — confirmed `HashRouter` recommendation for static hosting

### Secondary (MEDIUM confidence — based on training data + standard ecosystem patterns)
- Vite version baseline (5.x stable, 6.x/7.x current line) — Vite release cadence is consistent
- React 18.3.x as current stable React 18 patch — well-established
- `gh-pages` npm package workflow — long-standing convention, mirrored in Vite's own deployment guide
- `react-i18next` + `i18next-browser-languagedetector` init pattern — stable across multiple major versions
- GSAP post-Webflow license change to fully-free — widely reported in 2024
- OGL as preferred lightweight WebGL alternative to three.js for single-shader use cases

### Tertiary (LOW confidence — flagged for verification at install time)
- Exact current patch versions of GSAP, Motion, OGL, i18next, react-i18next, i18next-browser-languagedetector
- Current name resolution between `framer-motion` and `motion` packages
- Whether `@gsap/react` is required or recommended — verify on gsap.com docs

---

## Metadata

**Confidence breakdown:**
- Standard stack (libraries): HIGH for Tailwind v4 + React Router v7 (official docs verified); MEDIUM for Vite/GSAP/Motion/OGL/i18next versions (training data, verify with `npm view`)
- Architecture patterns: HIGH (verified against official docs for Tailwind + React Router; standard ecosystem patterns for everything else)
- Pitfalls: HIGH (these are well-documented community pain points)
- GitHub Pages deployment: HIGH for user-vs-project-site distinction and `base` config; HIGH for `gh-pages` package workflow
- i18n recommendation: HIGH (react-i18next is the unambiguous standard)

**Research date:** 2026-06-09
**Valid until:** ~2026-08-09 (60 days — Tailwind v4 and React Router v7 are mature, but verify minor versions when starting Phase 1)
**Recommended verification step before Phase 1:** Run `npm create vite@latest test-portfolio -- --template react` in a scratch directory and confirm the scaffolded Vite + React versions match expectations. Run `npm view tailwindcss version`, `npm view @tailwindcss/vite version`, `npm view react-router-dom version`, `npm view gsap version`, `npm view framer-motion version`, `npm view motion version`, `npm view ogl version`, `npm view i18next version`, `npm view react-i18next version`, `npm view i18next-browser-languagedetector version`, `npm view gh-pages version` and lock in the major versions above.
