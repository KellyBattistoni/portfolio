---
phase: 01-scaffold-safety-rails
plan: "01"
subsystem: infra
tags: [vite, react, typescript, tailwind, eslint, prettier, scaffold]

# Dependency graph
requires:
  - phase: none
    provides: "Initial scaffold — no prior phase to depend on"
provides:
  - "Buildable Vite 8 + React 19 + TypeScript app at repo root"
  - "@/ path alias resolved in both Vite and TypeScript"
  - "Tailwind v4 wired via @tailwindcss/vite plugin and @import 'tailwindcss'"
  - "Strict TypeScript (strict: true) with noUnusedLocals + noUnusedParameters"
  - "ESLint v10 flat config (eslint.config.ts) running clean on src/"
  - "Prettier 3 configured with project style (no semi, single quote, printWidth 100)"
  - "react-error-boundary, clsx, tailwind-merge installed and ready for use"
affects: [01-02-error-boundary, 01-03-safety-rails, 02-i18n-backbone, 03-scroll, 04-visual-foundations]

# Tech tracking
tech-stack:
  added:
    - "vite@8.0.16"
    - "react@19.2.7 + react-dom@19.2.7"
    - "typescript@6.0.3 (strict mode)"
    - "tailwindcss@4.3.0 + @tailwindcss/vite@4.3.0"
    - "react-error-boundary@6.1.2"
    - "clsx + tailwind-merge"
    - "eslint@10.4.1 (flat config)"
    - "typescript-eslint + @eslint/js"
    - "prettier@3.8.4"
    - "jiti (devDep — enables ESLint to load .ts config)"
  patterns:
    - "Scaffold-into-temp-then-copy pattern (repo root non-empty due to CVs/inspo.txt)"
    - "@/ import alias (src/) declared in both vite.config.ts and tsconfig.app.json"
    - "ESLint flat config in TypeScript (eslint.config.ts) loaded via jiti"
    - "Vite config: base '/' for root-domain GitHub Pages deploy"

key-files:
  created:
    - "package.json (project metadata, deps, lint script)"
    - "vite.config.ts (@tailwindcss/vite plugin + @/ alias + base '/')"
    - "tsconfig.json, tsconfig.app.json, tsconfig.node.json (strict TS + path mapping)"
    - "index.html (title: Kelly Battistoni — Portfolio)"
    - "src/main.tsx (createRoot, imports App via @/ alias)"
    - "src/App.tsx (minimal placeholder with brand token classes)"
    - "src/index.css (@import 'tailwindcss')"
    - "src/vite-env.d.ts (vite/client types)"
    - "eslint.config.ts (flat config: js.recommended + tseslint.recommended)"
    - ".prettierrc, .prettierignore"
    - ".gitignore (from scaffold — covers node_modules, dist)"
  modified: []

key-decisions:
  - "ignoreDeprecations '6.0' added to tsconfig.app.json — keeps baseUrl + paths working under TS 6.0+ which deprecated baseUrl"
  - "Installed jiti devDep — required for ESLint v10 to load TypeScript config (eslint.config.ts per plan spec)"
  - "Removed scaffold-generated eslint.config.js — ESLint prefers .js over .ts at same priority, so the .js must not exist for our .ts config to take effect"
  - "Applied Prettier formatting baseline to src/ — establishes clean starting point so future format-on-save doesn't generate spurious diffs"
  - "Kept React's StrictMode in main.tsx — surfaces double-effect / unsafe lifecycle issues early during dev"

patterns-established:
  - "Pinned major versions in package.json with caret (^) for patch updates only — predictable build"
  - "All path aliases via @/ — no relative ../../ imports anywhere in src/"
  - "ESLint TypeScript config (.ts) over JavaScript (.js) — same language as source code"
  - "Atomic per-task commits with conventional commit format and phase-plan scope (feat(01-01): ...)"

# Metrics
duration: ~18 min
completed: 2026-06-09
---

# Phase 01 Plan 01: Scaffold + Safety Rails Foundation Summary

**Vite 8 + React 19 + TypeScript scaffold at repo root with Tailwind v4 plugin, @/ path alias resolved in both Vite and tsconfig, strict TypeScript, and ESLint v10 flat config + Prettier — all builds clean.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-09T22:56:00Z (approx)
- **Completed:** 2026-06-09T23:14:26Z
- **Tasks:** 2
- **Files created:** 14 (excluding node_modules and dist)
- **Files modified:** 0 (greenfield scaffold)

## Accomplishments

- Scaffolded into a non-empty repo root without touching the existing CVs (`Harvard_CV_Kelly_Battistoni_*`) or `inspo.txt` — used the temp-dir-then-copy pattern
- All Phase 1 dependencies installed at pinned majors: react 19.2.7, vite 8.0.16, typescript 6.0.3, tailwindcss 4.3.0, react-error-boundary 6.1.2, clsx, tailwind-merge
- `@/` alias works in both runtime (Vite resolve.alias) and types (tsconfig paths) — verified by `src/main.tsx` importing `@/App.tsx` and compiling clean
- Strict TypeScript enabled — `npx tsc --noEmit` exits 0
- ESLint v10 flat config running on `src/` exits 0 (no errors, no warnings)
- Prettier baseline applied — `npx prettier --check src/` reports clean
- Production build (`npm run build`) exits 0, emits `dist/index.html` + `dist/assets/` (190 kB JS, 1.8 kB CSS — pre-optimization baseline)
- Dev server (`npm run dev`) starts in ~330 ms with no startup errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project and install all dependencies** — `4707fd4` (feat)
2. **Task 2: Configure ESLint flat config and Prettier** — `5aa4051` (chore)

**Plan metadata commit:** added after this SUMMARY is written.

## Files Created

- `package.json` — Project metadata, all Phase 1 deps, lint script
- `package-lock.json` — Lockfile pinning transitive deps
- `vite.config.ts` — `@tailwindcss/vite` + `@vitejs/plugin-react`, `@/` alias to `./src`, `base: '/'`
- `tsconfig.json` — Project references to app + node
- `tsconfig.app.json` — Strict TS + `baseUrl` + `paths: { @/*: ./src/* }` + `ignoreDeprecations: '6.0'`
- `tsconfig.node.json` — Node-side config for Vite config file itself
- `index.html` — Entry HTML with title "Kelly Battistoni — Portfolio"
- `src/main.tsx` — React 19 `createRoot` entry, imports `@/App.tsx`
- `src/App.tsx` — Minimal placeholder using brand token classes (`bg-brand-bg`, `text-brand-accent`, `font-display`) — tokens will be defined in Plan 02
- `src/index.css` — `@import 'tailwindcss'` (Tailwind v4 entry)
- `src/vite-env.d.ts` — `/// <reference types="vite/client" />`
- `src/App.css` — Scaffold artifact (unused by current App.tsx; will be removed/replaced in Plan 02)
- `src/assets/*` — Scaffold artifacts (react.svg, vite.svg, hero.png — unused)
- `public/*` — Scaffold artifacts (favicon.svg, icons.svg)
- `eslint.config.ts` — ESLint v10 flat config with `js.configs.recommended` + `tseslint.configs.recommended`
- `.prettierrc` — Project Prettier config
- `.prettierignore` — Excludes dist/, node_modules/, *.pdf, *.doc (so CV PDFs are never formatted)
- `.gitignore` — From scaffold (node_modules, dist, *.local, editor files)

## Decisions Made

- **Used `ignoreDeprecations: "6.0"` in tsconfig.app.json** — TypeScript 6.0 marks `baseUrl` deprecated, but it's the simplest way to make the `@/` paths mapping work and `baseUrl` will continue functioning until TS 7.0. We accept the deprecation warning silenced over removing baseUrl and switching to a more fragile config.
- **Installed `jiti` as devDep** — ESLint v10 requires jiti to load TypeScript flat configs. Without it `eslint.config.ts` would fail to load. The plan specified `.ts` (not `.js`), so this dep is required to honor the spec.
- **Kept `verbatimModuleSyntax: true`** — Inherited from scaffold; enforces that type-only imports use `import type`. Pairs well with strict TS and surfaces unsafe import patterns early.
- **Did not delete unused scaffold artifacts** (`src/App.css`, `src/assets/*`, `public/icons.svg`) — Plan 02 will define the real visual foundation and can clean these up in context. Removing them now risks losing useful starter SVGs.
- **Kept React `StrictMode`** — Catches double-effect / unsafe lifecycle bugs in development.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `ignoreDeprecations: "6.0"` to tsconfig.app.json**

- **Found during:** Task 1 (tsconfig.app.json write)
- **Issue:** TypeScript 6.0 reports `baseUrl` as deprecated and the IDE flagged it as an error. Without this fix the IDE diagnostic would block CI and editor tooling even though `tsc` itself still compiles.
- **Fix:** Added `"ignoreDeprecations": "6.0"` to compilerOptions, before `baseUrl`.
- **Files modified:** `tsconfig.app.json`
- **Verification:** `npx tsc --noEmit` exits 0; IDE diagnostic cleared.
- **Committed in:** `4707fd4` (Task 1 commit)

**2. [Rule 3 - Blocking] Installed `jiti` devDependency for ESLint TS config support**

- **Found during:** Task 2 (creating eslint.config.ts)
- **Issue:** Plan specified `eslint.config.ts` (TypeScript) but ESLint v10 requires `jiti` to load TS configs at runtime. Without jiti, ESLint would either fail to start or silently fall back to no config.
- **Fix:** `npm install -D jiti`
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run lint` exits 0 — ESLint loaded `eslint.config.ts` successfully.
- **Committed in:** `5aa4051` (Task 2 commit)

**3. [Rule 3 - Blocking] Removed scaffold-generated `eslint.config.js`**

- **Found during:** Task 2 (after writing eslint.config.ts)
- **Issue:** The Vite React-TS template ships `eslint.config.js`. With both `.js` and `.ts` present, ESLint v10 prefers the `.js` form, so our new `.ts` config would never be loaded. The plan explicitly specified the `.ts` form.
- **Fix:** Removed `eslint.config.js` from repo root (untracked file, never staged).
- **Files modified:** None tracked (untracked file deleted).
- **Verification:** `npm run lint` loads `eslint.config.ts` and exits 0; only one ESLint config file exists in repo root.
- **Committed in:** `5aa4051` (Task 2 commit — the absence of `eslint.config.js` is part of the commit's tree state)

**4. [Rule 1 - Bug] Applied Prettier formatting baseline to src/**

- **Found during:** Task 2 verification
- **Issue:** `npx prettier --check src/` reported style warnings in 4 scaffold files (mixed trailing commas, different quote style than our `.prettierrc`). Not strictly a "bug" but if left alone, the first edit anywhere in src/ would produce a noisy diff full of unrelated formatting changes.
- **Fix:** `npx prettier --write src/` — establishes the clean baseline our config defines.
- **Files modified:** `src/App.tsx`, `src/App.css`, `src/index.css`, `src/main.tsx`
- **Verification:** `npx prettier --check src/` now reports "All matched files use Prettier code style!"
- **Committed in:** `5aa4051` (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (3 Rule 3 blocking, 1 Rule 1 hygiene)
**Impact on plan:** All four deviations were required to make the plan's specified outcomes (`.ts` ESLint config, strict TS, baseUrl + paths) actually work. No scope creep.

## Issues Encountered

- **Repo root non-empty (CVs + inspo.txt):** Handled per plan instructions — scaffolded into `C:/Temp/kbv-scaffold` and copied generated files to repo root. The CVs and `inspo.txt` were never touched.
- **Windows line endings (LF vs CRLF):** Git emitted warnings on every staged file ("LF will be replaced by CRLF"). This is normal on Windows when `core.autocrlf=true`. Files are still cleanly stored; no functional impact. A future plan may add a `.gitattributes` to pin LF for source files.

## User Setup Required

None — no external services or secrets required for this plan.

## Next Phase Readiness

**Ready for Plan 02 (visual foundation / brand tokens):**
- `src/App.tsx` already references `bg-brand-bg`, `text-brand-accent`, `font-display` — Plan 02 needs to define these via Tailwind v4's `@theme` directive in a CSS file.
- `index.css` is the single source for Tailwind imports — extensions go here.
- The `@/` alias works, so future code can import `@/components/...`, `@/hooks/...` without relative paths.

**Ready for Plan 03 (error boundary + safety rails):**
- `react-error-boundary` is already installed; just needs wiring in `main.tsx` or `App.tsx`.

**No blockers carried forward.**

---
*Phase: 01-scaffold-safety-rails*
*Completed: 2026-06-09*

## Self-Check: PASSED

All 15 claimed files exist on disk. All 2 task commits (4707fd4, 5aa4051) exist in git log.
