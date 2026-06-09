# Phase 1: Scaffold + Safety Rails - Research

**Researched:** 2026-06-09
**Domain:** React 19 + Vite 8 + Tailwind v4 scaffolding, TypeScript strict config, design tokens, useDeviceCapabilities hook, NoiseOverlay component, React ErrorBoundary
**Confidence:** HIGH (all versions npm-verified live; official docs consulted for Tailwind @theme and ErrorBoundary API)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### TypeScript
- Use TypeScript (.tsx/.ts) throughout — not JavaScript
- `strict: true` in tsconfig
- Configure `@/` path alias mapping to `src/` (synced across tsconfig.json and vite.config.ts)
- Lint/format setup (ESLint + Prettier): Claude's discretion on whether to wire in Phase 1

#### Noise texture
- Implementation approach: Claude's discretion (static PNG preferred for simplicity and visual consistency)
- Opacity/visibility: Claude's discretion based on dark-cinematic aesthetic
- Reduced-motion behavior: Claude's discretion (accessibility default)
- DOM placement: dedicated `<NoiseOverlay />` React component (not a CSS pseudo-element), so it can be toggled or animated in later phases

#### Device capability thresholds
- `isMobile`: triggers at ≤ 430px viewport width (matches the roadmap's mobile design target; tablets get desktop experience)
- `isLowEnd`: Claude's discretion on detection strategy (hardwareConcurrency and/or deviceMemory)
- `prefersReducedMotion`: Claude's discretion — reactive vs. read-once based on WCAG best practices
- `isMobile` reactivity: **yes** — updates live on window resize via resize listener
- `supportsWebGL2`: detected once on mount (capability doesn't change mid-session)

#### ErrorBoundary fallback
- Fallback appearance: **static gradient in brand colors** — `#050505` background with a `#FF4500` radial glow. Looks intentional, user never sees a broken state.
- Error logging: log to `console.error` now; expose an `onError` prop for future external reporting hookup
- Scope: Claude's discretion (Phase 1 success criteria says "wraps a placeholder animation root" — scope matches that)

### Claude's Discretion
- Lint/format setup (ESLint + Prettier): whether to wire in Phase 1
- Noise texture: implementation approach (static PNG preferred), opacity level, reduced-motion behavior
- `isLowEnd`: detection strategy (hardwareConcurrency and/or deviceMemory)
- `prefersReducedMotion`: reactive vs. read-once
- ErrorBoundary scope

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 1 scope
</user_constraints>

---

## Summary

Phase 1 is infrastructure-only: scaffold a buildable Vite + React 19 + TypeScript + Tailwind v4 project, then add three safety rails before any animation code is written — a `useDeviceCapabilities` hook, a `<NoiseOverlay />` component, and an `<ErrorBoundary>` wrapping the animation root. No GSAP, no OGL, no Framer Motion in this phase.

**The biggest surprise from live version checks:** The npm ecosystem has moved significantly beyond what the prior project research assumed. Current latest: React 19.2.7, Vite 8.0.16, @vitejs/plugin-react 6.0.2 (drops Babel, uses Oxc), Tailwind 4.3.0, TypeScript 6.0.3, ESLint 10.4.1. Vite 8 shipped a Rust-based bundler (Rolldown) that is up to 30x faster. The project research assumed React 18 and Vite 5 — everything still works with 19/8, but the scaffold command will pull newer packages and this MUST be documented in the plan.

**`deviceMemory` browser support is fragmented:** The API is Chromium-only — Firefox and Safari do not implement it. The `isLowEnd` detection strategy must fall back gracefully and must not crash when the property is undefined. The correct heuristic is: `hardwareConcurrency <= 4` (universally supported) as primary signal, with `deviceMemory < 4` (Chromium only) as a secondary confirmation when available.

**`prefersReducedMotion` must be reactive per WCAG:** WCAG 2.3.3 requires honoring the user's preference, and users can change this setting while the page is open (e.g., turning on battery-saver mode). Use `addEventListener('change', ...)` on the `MediaQueryList` object, not a one-time read.

**Primary recommendation:** Scaffold with `npm create vite@latest . -- --template react-ts`, add `@tailwindcss/vite` and define brand tokens in `@theme {}`, write `useDeviceCapabilities` with the `hardwareConcurrency`-primary / `deviceMemory`-secondary strategy, use `react-error-boundary` v6 (not a hand-rolled class) for the ErrorBoundary, and wire ESLint/Prettier in Phase 1 — costs 20 min now, saves hours of lint-debt later.

---

## Standard Stack

### Core (verified live with `npm view <pkg> version`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react` | `19.2.7` | UI runtime | Current stable. React 19 is well-tested; ErrorBoundary API compatible. |
| `react-dom` | `19.2.7` | DOM renderer | Pair with react. |
| `vite` | `8.0.16` | Build tool + dev server | Rolldown-based, 10-30x faster builds. Vite 8 = current default. |
| `@vitejs/plugin-react` | `6.0.2` | React Fast Refresh + JSX/TSX | v6 uses Oxc (no Babel). Smaller install, same API. |
| `tailwindcss` | `4.3.0` | Utility-first CSS + design tokens | v4 CSS-first `@theme {}` replaces tailwind.config.js entirely. |
| `@tailwindcss/vite` | `4.3.0` | Vite integration for Tailwind v4 | Official plugin; no PostCSS needed. |
| `typescript` | `6.0.3` | Type safety | Strict mode enabled per locked decisions. |
| `@types/react` | `19.2.17` | React type definitions | Must match react version. |
| `@types/react-dom` | `19.2.3` | ReactDOM type definitions | Must match react-dom version. |

### Phase 1 Feature Libraries

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react-error-boundary` | `6.1.2` | ErrorBoundary with onError prop | Prefer over hand-rolled class component. Named export `ErrorBoundary`. Supports `fallbackRender`, `onError`. |

### Dev Tools (recommend wiring in Phase 1)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `eslint` | `10.4.1` | Linting | v9+ uses flat config (`eslint.config.ts`). |
| `prettier` | `3.8.4` | Formatting | Use `eslint-config-prettier` to disable conflicting rules. |
| `typescript-eslint` | latest | TS-aware lint rules | Required for TypeScript projects. |

### Installation

```bash
# Step 1: Scaffold with Vite
npm create vite@latest . -- --template react-ts

# Step 2: Install Tailwind v4 (Vite plugin)
npm install tailwindcss @tailwindcss/vite

# Step 3: Install ErrorBoundary helper
npm install react-error-boundary

# Step 4: Dev tools (ESLint + Prettier)
npm install -D eslint prettier eslint-config-prettier typescript-eslint @eslint/js
```

**Note:** `npm create vite@latest . -- --template react-ts` scaffolds with React 19, Vite 8, TypeScript. The `.` means scaffold into the current directory (the existing repo). Verify no conflicts with existing files before running.

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope only)

```
src/
├── components/
│   ├── layout/
│   │   └── NoiseOverlay.tsx       # Fixed overlay, pointer-events-none
│   └── error/
│       └── AnimationErrorBoundary.tsx  # Wraps animation root placeholder
├── hooks/
│   └── useDeviceCapabilities.ts   # prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2
├── lib/
│   └── cn.ts                      # clsx + tailwind-merge helper (install in Phase 1)
├── styles/
│   └── index.css                  # @import "tailwindcss" + @theme {} brand tokens
├── App.tsx                        # Minimal: renders NoiseOverlay + ErrorBoundary placeholder
└── main.tsx                       # ReactDOM.createRoot entry point

public/
└── noise.png                      # Static noise texture (generate once, commit to repo)

index.html                         # Preconnect links, Google Fonts, meta
vite.config.ts                     # base: '/', plugins, @/ alias
tsconfig.json                      # strict: true, paths: { "@/*": ["./src/*"] }
tsconfig.app.json                  # Vite scaffold creates both; paths go in tsconfig.app.json
eslint.config.ts                   # ESLint v9 flat config
.prettierrc                        # Prettier config
```

### Pattern 1: Vite + Tailwind v4 Configuration

**Confidence: HIGH — verified from official Tailwind docs (tailwindcss.com/docs/installation/using-vite)**

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  base: '/',  // User site (KellyBattistoni.github.io) — always '/'
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  /* Brand colors — generate utility classes like bg-brand-bg, text-brand-accent */
  --color-brand-bg: #050505;
  --color-brand-accent: #FF4500;

  /* Font families */
  --font-display: "Playfair Display", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
}

/* Global base styles */
html, body {
  background-color: #050505;
  color: #f5f5f5;
  font-family: var(--font-sans);
}
```

**No `tailwind.config.js`. No `postcss.config.js`. No `autoprefixer`.**

Import in `main.tsx`:
```ts
import './styles/index.css';
```

### Pattern 2: TypeScript `strict: true` + `@/` Path Alias

**Confidence: HIGH — verified from Vite ecosystem docs**

The Vite scaffold creates two tsconfig files: `tsconfig.json` (project references) and `tsconfig.app.json` (app-specific settings). Paths go in `tsconfig.app.json`.

```json
// tsconfig.app.json — relevant additions
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Both `vite.config.ts` (the `resolve.alias`) and `tsconfig.app.json` (the `paths`) must define the `@/` mapping for IDE autocomplete and Vite runtime resolution to agree.

### Pattern 3: `useDeviceCapabilities` Hook

**Confidence: HIGH for `isMobile` + `prefersReducedMotion` (universal APIs). MEDIUM for `isLowEnd` (`deviceMemory` is Chromium-only, `hardwareConcurrency` is universal). HIGH for `supportsWebGL2` (universal canvas API).**

```ts
// src/hooks/useDeviceCapabilities.ts
import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  isLowEnd: boolean;
  supportsWebGL2: boolean;
}

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

function detectLowEnd(): boolean {
  const concurrency = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; undefined on Firefox/Safari — treat undefined as "not low"
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const isLowConcurrency = concurrency <= 4;
  const isLowMemory = memory !== undefined ? memory < 4 : false;
  return isLowConcurrency || isLowMemory;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => ({
    prefersReducedMotion: mql.matches,
    isMobile: window.innerWidth <= 430,
    isLowEnd: detectLowEnd(),
    supportsWebGL2: detectWebGL2(),   // read-once on mount; capability never changes mid-session
  }));

  useEffect(() => {
    // Reactive: update if OS reduced-motion preference changes mid-session
    const onMotionChange = (e: MediaQueryListEvent) => {
      setCapabilities(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    mql.addEventListener('change', onMotionChange);

    // Reactive: update isMobile on window resize (user decision: yes)
    const onResize = () => {
      setCapabilities(prev => ({ ...prev, isMobile: window.innerWidth <= 430 }));
    };
    window.addEventListener('resize', onResize, { passive: true });

    // isLowEnd and supportsWebGL2: read-once, no listeners needed

    return () => {
      mql.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return capabilities;
}
```

**Key implementation notes:**
- `mql` is defined outside `useState` so the initial state and the effect use the same object reference — no stale closure.
- `supportsWebGL2` is read once via `useState` initializer, not re-evaluated on resize or OS change (the user confirmed: "capability doesn't change mid-session").
- `deviceMemory` requires a TypeScript cast because it is not in the standard `Navigator` interface — use an intersection type, not `any`.
- The resize listener uses `{ passive: true }` so the browser does not wait for `preventDefault`.

### Pattern 4: `<NoiseOverlay />` Component

**Confidence: HIGH — straightforward CSS + React. Noise PNG approach is the project's preferred implementation.**

The static PNG approach is: one ~5-20 KB grayscale noise PNG in `public/noise.png`, referenced via CSS `background-image`. This loads once, caches permanently, and has zero runtime cost. Visual grain can be tuned by adjusting opacity and `mix-blend-mode`.

```tsx
// src/components/layout/NoiseOverlay.tsx
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface NoiseOverlayProps {
  opacity?: number;       // default: 0.04 — subtle; tune between 0.03–0.06 for dark backgrounds
  className?: string;
}

export function NoiseOverlay({ opacity = 0.04, className }: NoiseOverlayProps) {
  const { prefersReducedMotion } = useDeviceCapabilities();

  // When reduced-motion is on, the noise overlay is decorative and non-animated
  // It can still render as a static texture — it causes no motion harm
  // Remove it only if the visual texture itself is considered disorienting (unusual)
  // Per WCAG 2.3.3 guidance: static texture is not "motion", so keep it visible

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundImage: 'url(/noise.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
```

**Why `opacity: 0.04` default:** On a near-black `#050505` background, 3-5% opacity overlay adds visible grain without muddying the dark aesthetic. Higher values can look muddy at small texture sizes.

**Why `mixBlendMode: 'overlay':** Overlay blend amplifies dark-on-dark grain without introducing color casts — appropriate for a monochromatic noise texture over a dark background.

**Later phases:** Phase 7 polish can animate `opacity` from 0 to its resting value, or vary it on interaction — that is the reason for keeping this as a React component rather than a pure CSS pseudo-element.

**Noise PNG generation:** Use https://www.fffuel.co/nnnoise/ (free, no account, downloads SVG that can be rasterized) or generate a grayscale noise image in any image editor. Target: ~5KB, 200x200px, 8-bit grayscale PNG.

### Pattern 5: `<AnimationErrorBoundary>` using `react-error-boundary`

**Confidence: HIGH — verified against react-error-boundary v6.1.2 API from GitHub README.**

```tsx
// src/components/error/AnimationErrorBoundary.tsx
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactNode } from 'react';

interface AnimationErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

function AnimationFallback(_props: FallbackProps) {
  // The ErrorBoundary fallback appearance: #050505 background + #FF4500 radial glow
  // Looks intentional — the Plasma backdrop's static stand-in, not an error indicator
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: `radial-gradient(ellipse at 50% 60%, rgba(255, 69, 0, 0.35) 0%, #050505 65%)`,
        pointerEvents: 'none',
      }}
    />
  );
}

export function AnimationErrorBoundary({ children, onError }: AnimationErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AnimationFallback}
      onError={(error, info) => {
        console.error('[AnimationErrorBoundary]', error, info.componentStack);
        onError?.(error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Why `react-error-boundary` over a hand-rolled class:**
- v6 has React 19 compatibility confirmed.
- Provides `onReset`, `resetKeys`, and `useErrorBoundary` hook for free.
- Removes the only valid use-case for class components in this codebase.
- TypeScript types are correct out of the box (`FallbackProps` is exported).

**Why `_props: FallbackProps` prefix:** `AnimationFallback` receives `{ error, resetErrorBoundary }` but this fallback is purely visual — we don't show the error message or offer a retry button (the user should never see a broken state). The prefix silences the "unused variable" ESLint warning without disabling the rule.

### Pattern 6: `App.tsx` Composition for Phase 1

Phase 1 renders a minimal but structurally correct shell:

```tsx
// src/App.tsx
import { NoiseOverlay } from '@/components/layout/NoiseOverlay';
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary';

// Placeholder: replaced in Phase 2+ with real Plasma component
function AnimationRootPlaceholder() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#050505',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <AnimationErrorBoundary>
        <AnimationRootPlaceholder />
      </AnimationErrorBoundary>
      <NoiseOverlay />
      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* Phase 2+: sections go here */}
        <p className="p-8 font-display text-4xl">Kelly Battistoni</p>
      </main>
    </div>
  );
}
```

**Why this structure matters for Phase 1 success criteria:**
- `AnimationErrorBoundary` wraps a real placeholder so the ErrorBoundary can be tested by forcing a throw inside `AnimationRootPlaceholder`.
- `NoiseOverlay` renders visibly so the success criterion ("visible noise texture overlay") is met.
- The `font-display` class verifies Tailwind is wired and `@theme` token is working.
- `bg-brand-bg` verifies the `--color-brand-bg: #050505` token generates the utility.

### Pattern 7: ESLint v9 Flat Config

**Recommendation: Wire ESLint + Prettier in Phase 1.** Cost: ~20 minutes. Payoff: no lint-debt accumulation across 7 more phases.

ESLint v9 uses flat config (`eslint.config.ts` or `eslint.config.js`) — the old `.eslintrc.*` is fully deprecated.

```ts
// eslint.config.ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,           // MUST be last: disables formatting rules that conflict with Prettier
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
);
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Note on `eslint-plugin-prettier`:** The current (2026) recommended approach is `eslint-config-prettier` (disables conflicting rules) WITHOUT `eslint-plugin-prettier` (runs Prettier as a lint rule). The latter is now discouraged — it slows ESLint and produces confusing errors.

### Anti-Patterns to Avoid

- **Hand-rolling ErrorBoundary as a class component:** `react-error-boundary` v6 handles this with correct TypeScript types and React 19 compatibility.
- **Using `postcss.config.js` for Tailwind v4:** Not needed when using `@tailwindcss/vite`. Adding it can cause double-processing warnings.
- **Defining `@/` alias only in `vite.config.ts` but not `tsconfig.app.json`:** Vite will resolve imports correctly, but TypeScript/IDE won't know about the alias — you get red squiggles in all `@/` imports.
- **Defining `@/` alias only in `tsconfig.app.json` but not `vite.config.ts`:** TypeScript will be happy but Vite won't resolve at runtime.
- **Putting `prefersReducedMotion` as a read-once value:** Per WCAG best practices, the user can change this preference mid-session (OS setting, battery saver, etc.). Use `addEventListener('change', ...)`.
- **Using `deviceMemory` without a Firefox/Safari fallback:** The property is `undefined` in non-Chromium browsers. Always guard: `memory !== undefined ? memory < 4 : false`.
- **Animating the NoiseOverlay in Phase 1:** Keep it static. Phase 7 is where opacity animation may be added.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| React ErrorBoundary | Custom class component with `componentDidCatch` + state | `react-error-boundary` v6 | Handles `onReset`, `resetKeys`, `useErrorBoundary`, React 19-compatible types — 60 lines replaced by 1 import |
| Class name composition | Template literal string concat | `clsx` + `tailwind-merge` (via `cn()` helper) | Avoids conflicting Tailwind utility classes when composition happens across phases |
| `@/` alias sync between Vite and TypeScript | Custom path resolver | Standard `resolve.alias` in `vite.config.ts` + `paths` in `tsconfig.app.json` | Tried-and-true; both must be set — nothing more needed |
| Tailwind config file | `tailwind.config.js` with theme extension | `@theme {}` block in CSS | v4 CSS-first approach; the old config file is not needed and adds confusion |
| Noise texture at runtime | Canvas-based dynamic grain generation | Static PNG in `public/` | Simpler, zero runtime cost, visually consistent — exactly what the user preferred |

**Key insight:** Phase 1 is foundations. Every minute spent building infrastructure that already exists in a library is a minute stolen from the actual design work. `react-error-boundary` and `cn()` are the two "just install it" items for this phase.

---

## Common Pitfalls

### Pitfall 1: `@/` Alias Works in Vite but Not TypeScript (or Vice Versa)

**What goes wrong:** Imports like `import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'` resolve at runtime but show red underlines in the editor, or vice versa.

**Why it happens:** Vite's `resolve.alias` and TypeScript's `compilerOptions.paths` are separate systems. They must both be set.

**How to avoid:** Set BOTH locations:
1. `vite.config.ts` → `resolve.alias: { '@': path.resolve(__dirname, './src') }`
2. `tsconfig.app.json` → `compilerOptions.paths: { "@/*": ["./src/*"] }` plus `baseUrl: "."`

**Warning signs:** Red squiggles on `@/` imports in IDE after running `tsc --noEmit`.

### Pitfall 2: Tailwind Classes Not Generated for `@theme` Token Names

**What goes wrong:** Adding `--color-brand-accent: #FF4500` to `@theme` but then using `text-brand-accent` in JSX produces no styling.

**Why it happens:** Tailwind v4 generates utility classes based on the variable namespace prefix. `--color-*` generates `bg-*`, `text-*`, `border-*` etc. But the exact class name is derived from the variable name minus the `--color-` prefix. So `--color-brand-accent` → `text-brand-accent`. The naming must be intentional.

**How to avoid:** Pick token names that match the intended Tailwind class names before writing any JSX. Test immediately with a visible element.

**Warning signs:** Elements missing color/font styling in dev mode even though `@theme` is configured.

### Pitfall 3: React 19 StrictMode Double-Effect Execution

**What goes wrong:** In development, `useDeviceCapabilities` attaches and then detaches and re-attaches its resize and media-query listeners. The double-execution is fine IF cleanup is correct. Without proper cleanup, two listeners accumulate.

**Why it happens:** React 18+ StrictMode double-invokes effects in development to expose missing cleanup functions. React 19 continues this behavior.

**How to avoid:** The `useDeviceCapabilities` hook pattern above returns a cleanup function that removes both listeners. Verify in DevTools that only one listener is active by toggling a media query — you should see exactly one `change` event fired.

**Warning signs:** State updates happening twice per event; performance weirdness in dev only.

### Pitfall 4: `deviceMemory` Returns `undefined` on Firefox/Safari

**What goes wrong:** TypeScript accepts `navigator.deviceMemory` as part of `Navigator` (if using a broad `lib` setting or types), but at runtime on Firefox/Safari it is `undefined`. The `isLowEnd` logic returns `true` incorrectly or throws.

**Why it happens:** `navigator.deviceMemory` is a Chromium-only extension. Firefox and Safari deliberately don't implement it (privacy/fingerprinting concerns).

**How to avoid:** Cast the navigator to include the optional property and guard with `!== undefined` before using the value. The hook pattern above shows the correct approach.

**Warning signs:** `isLowEnd` always returns true on Firefox.

### Pitfall 5: `public/noise.png` Path Under GitHub Pages Base

**What goes wrong:** CSS `url('/noise.png')` resolves correctly in local dev (`base: '/'`), and ALSO correctly in production since this is a user site with `base: '/'`. No issue for THIS project — but the reason it works is the `base: '/'` setting.

**Why it matters:** This would be a pitfall if `base` were set to a repo subpath. Since the project research confirms `base: '/'` is correct for `KellyBattistoni.github.io`, this is a non-issue — but document it in `vite.config.ts` with a comment so it is never accidentally changed.

**How to avoid:** Add a comment in `vite.config.ts`: `// User site (KellyBattistoni.github.io) — base MUST be '/', not '/repo-name/'`

### Pitfall 6: Noise PNG Not Committed / Missing from `public/`

**What goes wrong:** `<NoiseOverlay />` renders but the background image 404s because `public/noise.png` was never created. The component renders with no visible grain.

**Why it happens:** Easy to forget: the static asset needs to be generated and committed as part of Phase 1.

**How to avoid:** Include "generate and commit `public/noise.png`" as an explicit task step. Verify by inspecting network tab: `noise.png` should return 200, not 404.

**Warning signs:** `NoiseOverlay` renders but DevTools shows 404 for `noise.png`.

---

## Code Examples

All examples above in Architecture Patterns are the authoritative code patterns for this phase. Key verified snippets summarized:

### Tailwind v4 @theme Block (Official Syntax)

```css
/* Source: tailwindcss.com official docs */
@import "tailwindcss";

@theme {
  --color-brand-bg: #050505;
  --color-brand-accent: #FF4500;
  --font-display: "Playfair Display", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

### react-error-boundary v6 Import Pattern

```tsx
/* Source: github.com/bvaughn/react-error-boundary */
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
```

### WebGL2 Feature Detection

```ts
/* Source: MDN Web Docs — HTMLCanvasElement.getContext() */
function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}
```

### Google Fonts `index.html` Preconnect + Load

```html
<!-- Source: Google Fonts best-practice — preconnect before stylesheet link -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact on This Phase |
|--------------|------------------|--------------|---------------------|
| React 18 + Vite 5 (assumed in project research) | React 19.2.7 + Vite 8.0.16 | React 19 GA: Dec 2024. Vite 8: March 2026 | Scaffold pulls current defaults — both work for this project |
| `@vitejs/plugin-react` v4 (Babel-based) | v6 (Oxc-based, no Babel) | April 2026 | Faster installs, same API. No Babel custom config needed for this phase. |
| Tailwind v3 + `tailwind.config.js` + PostCSS | Tailwind v4.3 + `@tailwindcss/vite` + `@theme {}` | Tailwind v4 GA: Jan 2025 | No config file, no PostCSS, CSS-first tokens |
| Hand-rolled `class ErrorBoundary extends Component` | `react-error-boundary` v6 | Library has been current for years; v6 released 2025 | Use the library — one less class component |
| ESLint v8 `.eslintrc.json` | ESLint v10 `eslint.config.ts` flat config | ESLint v9 (2024), v10 (2025) | Different config file format — old `.eslintrc.*` not supported |
| `eslint-plugin-prettier` (runs Prettier as lint rule) | `eslint-config-prettier` (disables conflicting rules) | Community best practice shift ~2023-2024 | Faster linting, clearer error messages |
| TypeScript 5.x | TypeScript 6.0.3 | TypeScript 6 released 2026 | Stricter types by default; should be fully compatible |

**Deprecated/outdated for Phase 1:**
- `tailwind.config.js` with `theme.extend`: Not needed in v4. If present in a copy-pasted snippet, delete it.
- `postcss.config.js` and `autoprefixer`: Not needed with `@tailwindcss/vite` plugin.
- `.eslintrc.json` / `.eslintrc.js`: ESLint v10 uses flat config exclusively.
- `create-react-app`: Dead. Do not use.

---

## Claude's Discretion Recommendations

These items were marked as Claude's discretion in CONTEXT.md:

### ESLint + Prettier: Wire in Phase 1

**Recommendation: YES, wire in Phase 1.**

Rationale: Every subsequent phase writes TypeScript. Without lint in Phase 1, all 7 remaining phases accumulate violations. Retrofitting lint discipline mid-project is significantly harder than configuring it once upfront. Total time cost: ~20 minutes. The scaffold's `eslint.config.js` from Vite provides a reasonable starting point to extend.

### Noise Texture: Static PNG, `opacity: 0.04`, `mix-blend-mode: overlay`

**Recommendation:** Use a static grayscale PNG (~5-10 KB, 200x200px). Generate from https://www.fffuel.co/nnnoise/ or a local image editor. Commit to `public/noise.png`.

Opacity `0.04` (4%) on `#050505` is subtle but perceptible grain — appropriate for the dark-cinematic aesthetic. `mix-blend-mode: overlay` amplifies contrast without color contamination.

**Reduced-motion behavior:** Leave `<NoiseOverlay />` visible even when `prefersReducedMotion` is true. Static grain texture is not motion per WCAG 2.3.3 — it causes no vestibular harm. Only animated grain (changing over time) would need to be suppressed.

### `isLowEnd` Detection Strategy

**Recommendation:** `hardwareConcurrency <= 4` as primary signal, `deviceMemory < 4` (when available) as secondary. The combined heuristic is: a device is "low end" if it has 4 or fewer CPU cores, OR if its reported memory is under 4 GB.

Threshold rationale: `hardwareConcurrency <= 4` catches most mid-range Android phones (4-core CPUs common through 2023). `deviceMemory < 4` catches budget devices with low RAM. Both thresholds are intentionally generous — false positives (incorrectly flagging a device as low-end) reduce GPU effects unnecessarily but do not break the experience; false negatives (not flagging a genuinely low-end device) cause performance problems.

### `prefersReducedMotion`: Reactive

**Recommendation:** Reactive (via `addEventListener('change', ...)`). WCAG 2.3.3 best practices require honoring preference changes immediately — the user may toggle battery saver mode or accessibility settings while the page is open. Reactive costs one event listener and is the correct accessible implementation.

---

## Open Questions

1. **Does `npm create vite@latest . -- --template react-ts` work correctly in this repo?**
   - What we know: The `.` destination means "current directory." If the repo already has files, Vite may prompt about overwriting or error.
   - What's unclear: Exact Vite 8 behavior when scaffolding into a non-empty directory.
   - Recommendation: The plan task should check for conflicts first. Running in a temp directory and copying the scaffold files over may be safer than running `create vite` in the live repo.

2. **Noise PNG generation: any existing asset in the project?**
   - What we know: The repo root has `inspo.txt` which may reference a noise asset.
   - What's unclear: Whether an existing noise PNG is referenced in the inspo source.
   - Recommendation: The planner should include a task to read `inspo.txt` and check if noise asset is already described or available before generating a new one.

3. **TypeScript 6.0 compatibility with React 19 types**
   - What we know: `@types/react` 19.2.17 and TypeScript 6.0.3 are both current on npm.
   - What's unclear: Whether TypeScript 6's stricter defaults introduce any new errors in the scaffold template.
   - Recommendation: The `tsc --noEmit` check in the build step will surface any issues. Plan for a "fix TypeScript errors" sub-step.

4. **`clsx` + `tailwind-merge`: install in Phase 1 or defer?**
   - What we know: The `cn()` helper is used in the project architecture but not strictly required for Phase 1 deliverables (the success criteria don't mention component composition).
   - Recommendation: Install `clsx` and `tailwind-merge` in Phase 1 anyway (trivial cost, prevents the "forgot to set up cn() and now I'm copy-pasting" problem in Phase 2). Add to devDependencies.

---

## Sources

### Primary (HIGH confidence)
- `npm view <pkg> version` — live version data for all packages (executed 2026-06-09 in session)
- https://tailwindcss.com/docs/installation/using-vite — Tailwind v4 Vite installation steps (verified via WebFetch)
- https://tailwindcss.com/docs/theme — `@theme {}` syntax and namespace table (verified via WebFetch)
- https://github.com/bvaughn/react-error-boundary — v6.1.2 API (`FallbackProps`, `onError`, `FallbackComponent`) (verified via WebFetch)
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory — Chromium-only limitation confirmed
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext — WebGL2 detection pattern

### Secondary (MEDIUM confidence)
- https://vite.dev/blog/announcing-vite8 — Vite 8 release notes; Oxc in @vitejs/plugin-react v6, Rolldown bundler (verified via WebFetch)
- https://react.dev/blog/2024/12/05/react-19 — React 19 release blog; ErrorBoundary behavior change (single error log vs double)
- https://www.joshwcomeau.com/react/prefers-reduced-motion/ — Reactive `prefersReducedMotion` hook pattern
- https://www.fffuel.co/nnnoise/ — Noise texture generator for `public/noise.png`
- WebSearch: ESLint v9/v10 flat config with TypeScript, 2026 guides

### Tertiary (LOW confidence — training data, no live verification)
- ESLint v10 flat config exact plugin API (the flat config format is stable but exact package names/versions should be verified at install time)
- TypeScript 6.0 breaking changes — none identified, but `tsc --noEmit` will surface any issues

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions): HIGH — all versions npm-verified live on 2026-06-09
- Tailwind v4 `@theme` config: HIGH — official docs verified
- `useDeviceCapabilities` hook: HIGH for `isMobile` + `prefersReducedMotion` + `supportsWebGL2`; MEDIUM for `isLowEnd` (deviceMemory browser support limitation documented)
- ErrorBoundary pattern: HIGH — react-error-boundary v6 API verified
- ESLint/Prettier setup: MEDIUM — ESLint v9+ flat config is established but exact plugin API variants exist
- Architecture patterns: HIGH — consistent with existing project research

**Research date:** 2026-06-09
**Valid until:** 2026-07-09 (30 days — stack is stable; React/Vite major versions won't change in 30 days)
