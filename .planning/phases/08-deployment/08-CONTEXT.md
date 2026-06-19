# Phase 8: Deployment - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the portfolio live at `https://KellyBattistoni.github.io/` via a GitHub Actions CI/CD pipeline. This phase wires up the deployment infrastructure — branch setup, CI workflow, and defensive 404 handling — and confirms the live site meets the ROADMAP success criteria (LCP, deep-link safety, INFRA-05).

No new features, sections, animations, or content. Deployment-only.

</domain>

<decisions>
## Implementation Decisions

### Deploy automation
- **D-01:** GitHub Actions — auto-deploy on every push to `main`. No manual `npm run deploy` fallback. CI is the only deploy path.
- **D-02:** CI quality gate (in order): `tsc -b && vite build` → ESLint → Playwright WebKit smoke test → deploy. All three must pass before the deploy action runs.
- **D-03:** Playwright CI setup: build first, then start `vite preview` (port 4173) in background, wait for it to be ready, run `npx playwright test`, then deploy. The existing `playwright.config.ts` targets `http://localhost:4173` — use as-is.

### Source branch
- **D-04:** Rename `master` → `main` (one `git branch -m master main` before first push). CI workflow targets `main`.
- **D-05:** `gh-pages` branch is managed entirely by CI — never touched manually. CI force-pushes `dist/` there on every successful run.
- **D-06:** Workflow permissions: `permissions: contents: write` + `deployments: write`. Creates a `github-pages` deployment environment with history visible on the GitHub repo page.

### Custom domain
- **D-07:** Ship at `https://KellyBattistoni.github.io/` — no custom domain for v1. No `CNAME` file needed. Can add a custom domain later without changing the build setup.

### 404.html
- **D-08:** `public/404.html` is an instant-redirect page — `<meta http-equiv="refresh" content="0;url=/">` bounces any unknown path back to the root immediately.
- **D-09:** Include `<title>Kelly Battistoni — Redirecting...</title>` so the browser tab is not blank during the redirect. No other styling or content needed.

### Claude's Discretion
- **Deploy action choice:** `peaceiris/actions-gh-pages` vs `JamesIves/github-pages-deploy-action` — Claude picks whichever is more current and reliable at planning time. Both achieve the same result.
- **Node.js version in CI:** Local machine runs v24. Use Node 22 LTS in the workflow (`node-version: '22'`) — stable, compatible with Vite 8.x.
- **Playwright browser install in CI:** Run `npx playwright install webkit --with-deps` in the workflow before running tests. WebKit is the only project defined in `playwright.config.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Roadmap
- `.planning/PROJECT.md` — brand narrative, GitHub Pages target URL, constraints (esp. root repo `KellyBattistoni.github.io`)
- `.planning/ROADMAP.md` §Phase 8 — 4 success criteria: CI/CD workflow, 2.5s LCP, 404.html deep-link safety, deployment environment
- `.planning/REQUIREMENTS.md` §INFRA-05 — the single requirement this phase closes: "Site is deployed and live at `KellyBattistoni.github.io` via `gh-pages` branch"

### Build configuration
- `vite.config.ts` — `base: '/'` already set (correct for root GitHub Pages repo); chunk splitting (vendor-react, vendor-gsap, vendor-i18n); `nonBlockingCss` plugin (CSS preload transform)
- `package.json` — build script: `tsc -b && vite build`; lint script: `eslint src/ --ext .ts,.tsx`; no deploy script (CI handles it)

### Testing
- `playwright.config.ts` — WebKit only, `baseURL: http://localhost:4173` (Vite preview), `testDir: ./e2e`, no retries
- `e2e/webkit-smoke.spec.ts` — smoke test: page title, hero section visible, scroll to bottom, no console errors, stack section visible

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/` directory already contains: `favicon.svg`, `og-image.png`, CV PDFs, `robots.txt`, `fonts/`, `icons/` — `404.html` goes here as a new file
- `playwright.config.ts` + `e2e/webkit-smoke.spec.ts` — fully functional WebKit smoke test from Phase 7, used as-is in CI

### Established Patterns
- `base: '/'` in `vite.config.ts` — correct for the root GitHub Pages repo; no change needed
- Hash anchor navigation (`href="#work"`, `href="#about"`) — no react-router-dom; 404.html only needs a simple redirect, not the SPA path-preserving trick
- `manualChunks` in `vite.config.ts` — chunks split across vendor-react, vendor-gsap, vendor-i18n; CI build produces the same chunks

### Integration Points
- `.github/workflows/deploy.yml` — new file; triggers on push to `main`; runs build + lint + Playwright + deploy action
- `public/404.html` — new file; instant redirect to `/`; no changes to existing public/ assets

</code_context>

<specifics>
## Specific Ideas

- GitHub account: `KellyBattistoni` (locked in ROADMAP and PROJECT.md)
- Repo name: `KellyBattistoni.github.io` (root Pages repo — account-name format means no base path)
- CI workflow job order: `checkout` → `setup-node` (v22) → `npm ci` → `npx playwright install webkit --with-deps` → `npm run lint` → `npm run build` → start `vite preview &` + wait-on → `npx playwright test` → deploy action
- 404.html shape: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kelly Battistoni — Redirecting...</title><meta http-equiv="refresh" content="0;url=/"></head><body></body></html>`

</specifics>

<deferred>
## Deferred Ideas

- Custom domain (e.g., `kellybattistoni.com`) — post-v1 if desired; zero build changes needed (just add `CNAME` file to `public/` and configure DNS records)
- Self-hosting Google Fonts — flagged in Phase 7 as a future optimization; not in scope here

</deferred>

---

*Phase: 08-deployment*
*Context gathered: 2026-06-19*
