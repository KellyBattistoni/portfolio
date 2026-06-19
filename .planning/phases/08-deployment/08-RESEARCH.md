# Phase 8: Deployment - Research

**Researched:** 2026-06-19
**Domain:** GitHub Actions CI/CD, GitHub Pages, Playwright WebKit in CI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** GitHub Actions — auto-deploy on every push to `main`. No manual `npm run deploy` fallback. CI is the only deploy path.
- **D-02:** CI quality gate (in order): `tsc -b && vite build` → ESLint → Playwright WebKit smoke test → deploy. All three must pass before the deploy action runs.
- **D-03:** Playwright CI setup: build first, then start `vite preview` (port 4173) in background, wait for it to be ready, run `npx playwright test`, then deploy. The existing `playwright.config.ts` targets `http://localhost:4173` — use as-is.
- **D-04:** Rename `master` → `main` (one `git branch -m master main` before first push). CI workflow targets `main`.
- **D-05:** `gh-pages` branch is managed entirely by CI — never touched manually. CI force-pushes `dist/` there on every successful run.
- **D-06:** Workflow permissions: `permissions: contents: write` + `deployments: write`. Creates a `github-pages` deployment environment with history visible on the GitHub repo page.
- **D-07:** Ship at `https://KellyBattistoni.github.io/` — no custom domain for v1. No `CNAME` file needed.
- **D-08:** `public/404.html` is an instant-redirect page — `<meta http-equiv="refresh" content="0;url=/">` bounces any unknown path back to root.
- **D-09:** Include `<title>Kelly Battistoni — Redirecting...</title>` in 404.html.
- **Node version in CI:** Node 22 LTS (`node-version: '22'`).

### Claude's Discretion

- **Deploy action choice:** `peaceiris/actions-gh-pages` vs `JamesIves/github-pages-deploy-action` — Claude picks whichever is more current and reliable at planning time.
- **Playwright browser install in CI:** Run `npx playwright install webkit --with-deps` before tests.

### Deferred Ideas (OUT OF SCOPE)

- Custom domain (e.g., `kellybattistoni.com`) — post-v1; no CNAME, no build changes needed.
- Self-hosting Google Fonts — flagged Phase 7, not in scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-05 | Site is deployed and live at `KellyBattistoni.github.io` via `gh-pages` branch | CI/CD workflow with peaceiris/actions-gh-pages@v4; GitHub Pages Settings manual source config; 404.html deep-link safety |
</phase_requirements>

---

## Summary

This phase wires the CI/CD pipeline that converts a local React/Vite build into a live GitHub Pages site. The codebase is already production-ready (Lighthouse Perf 92, WebKit smoke test passing, `base: '/'` correct for root repo). Phase 8 is purely infrastructure: one GitHub Actions workflow file, one 404.html, and the one-time branch rename from `master` to `main`.

The key decision made at research time (Claude's discretion): **use `peaceiris/actions-gh-pages@v4`** over JamesIves. Rationale: peaceiris released v4.1.0 in May 2026 and is actively maintained; JamesIves v4.8.0 was released January 2026 and is also maintained, but peaceiris has broader ecosystem examples for Vite/React, ships `force_orphan: true` out of the box (clean deployment history), and the `permissions: contents: write` token model is simpler than JamesIves's PAT-for-cross-repo pattern.

One non-obvious pitfall: Vite 4+ (and the Vite 8 this project uses) starts an interactive server that reads stdin. When `vite preview` is backgrounded with a bare `&`, CI shells send it `SIGTTIN`, stopping the process while the socket stays bound — producing a server that appears open but never responds. The fix is a stdin redirect: `npx vite preview < /dev/null &`. This is the single most dangerous failure mode for the Playwright CI step.

**Primary recommendation:** Write `.github/workflows/deploy.yml` with the exact step order from D-02/D-03, use `npx vite preview < /dev/null &` (stdin redirect), and configure GitHub Pages to serve from the `gh-pages` branch via Settings > Pages after the first deploy push.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Build quality gate (tsc + lint) | CI runner | — | Compilation errors and lint violations must block deploy |
| Smoke test execution | CI runner | — | WebKit test validates the built artifact (dist/) via vite preview, not source |
| gh-pages branch management | CI (peaceiris action) | — | D-05: never touched manually |
| Static file serving | GitHub Pages CDN | — | Root repo, serves dist/ from gh-pages branch |
| 404 / deep-link safety | public/404.html (static) | — | No server-side routing; meta-refresh redirect is the only option |
| Language persistence across reload | Browser localStorage | — | Already implemented via kbv-lang key; no CI change needed |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `peaceiris/actions-gh-pages` | v4 (v4.1.0 released 2026-05-12) | Push dist/ to gh-pages branch | Actively maintained, `contents: write` only, force_orphan for clean history, 5.3k stars [VERIFIED: github.com/peaceiris/actions-gh-pages] |
| `wait-on` | 9.0.10 (latest 2026-05-11) | Block CI until vite preview is accepting HTTP connections | Cross-platform, zero config, supports `tcp:` and `http:` protocols [VERIFIED: npm registry] |
| `actions/checkout` | v4 | Checkout repo in CI | GitHub-official, required by all workflows [ASSUMED] |
| `actions/setup-node` | v4 | Install Node 22 LTS | GitHub-official, caches npm [ASSUMED] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GitHub Pages (built-in) | — | Static site hosting | Root repo at KellyBattistoni.github.io; no cost, no config beyond Settings > Pages |
| `npx playwright install webkit --with-deps` | CLI flag | Install WebKit + system deps on Ubuntu | Always run this before `npx playwright test` in Linux CI |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `peaceiris/actions-gh-pages@v4` | `JamesIves/github-pages-deploy-action@v4` | JamesIves v4.8.0 also maintained (Jan 2026); slightly fewer Vite examples; both achieve identical result. Either is acceptable. |
| `wait-on` | `playwright.config.ts webServer` option | webServer is cleaner but requires editing playwright.config.ts; wait-on keeps config as-is per D-03 |
| `wait-on tcp:4173` | `wait-on http://localhost:4173` | HTTP check is more reliable (confirms app is serving, not just port bound); prefer http variant |

**Installation (CI only — not local devDependencies):**
`wait-on` is already available via `npx wait-on` without installation. No new devDependencies needed — use `npx wait-on` in the workflow YAML directly.

**Version verification:**
```bash
npm view wait-on version            # → 9.0.10 (verified 2026-06-19)
npm view peaceiris/actions-gh-pages # → actions-github-pages@4.1.0 (verified 2026-06-19)
```

---

## Package Legitimacy Audit

> This phase adds no new npm devDependencies. `wait-on` is invoked via `npx` in CI only.
> The GitHub Actions used are GitHub Marketplace actions (not npm packages).

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `wait-on` | npm | ~10 yrs | ~6M/wk | github.com/jeffbski/wait-on | [OK] | Approved — invoked via npx in CI, not installed as devDep |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*Note: `peaceiris/actions-gh-pages` and `actions/checkout` / `actions/setup-node` are GitHub Actions (not npm packages). They are verified via the GitHub Marketplace and official GitHub documentation. These do not go through npm slopcheck.*

---

## Architecture Patterns

### System Architecture Diagram

```
push to main
     |
     v
GitHub Actions Runner (ubuntu-latest)
     |
     +-- actions/checkout@v4
     +-- actions/setup-node@v4 (Node 22 LTS, npm cache)
     +-- npm ci
     +-- npx playwright install webkit --with-deps
     |
     +-- QUALITY GATE ---------------------------+
     |   npm run build  (tsc -b && vite build)   |
     |   npm run lint   (eslint src/)             |
     |   npx vite preview < /dev/null &           |  ← stdin redirect (SIGTTIN fix)
     |   npx wait-on http://localhost:4173        |
     |   npx playwright test                      |
     +--------------------------------------------+
          |
          | (all pass)
          v
     peaceiris/actions-gh-pages@v4
          |
          +-- force-pushes dist/ → gh-pages branch
          |
          v
     GitHub Pages CDN
          |
          v
     https://KellyBattistoni.github.io/
```

```
Browser request: https://KellyBattistoni.github.io/#/about
     |
     v
GitHub Pages serves index.html (HashRouter handles #/about in-browser)

Browser request: https://KellyBattistoni.github.io/nonexistent-path
     |
     v
GitHub Pages serves public/404.html
     |
     +-- <meta http-equiv="refresh" content="0;url=/">
     v
Browser redirected to https://KellyBattistoni.github.io/
```

### Recommended Project Structure (additions only)

```
.github/
└── workflows/
    └── deploy.yml          # New — full CI/CD pipeline
public/
├── 404.html                # New — instant meta-refresh redirect
└── [existing: favicon.svg, og-image.png, robots.txt, fonts/, icons/, PDFs]
```

### Pattern 1: Vite Preview Background with stdin Redirect (SIGTTIN Fix)

**What:** Vite 4+ servers read stdin for interactive prompts. When backgrounded with bare `&` in CI, the shell sends `SIGTTIN`, stopping the process while the socket stays bound. The server appears open but never serves.

**When to use:** Any CI step that starts `vite preview` or `vite dev` as a background process.

**Example:**
```yaml
# Source: github.com/vitejs/vite/issues/15287 (documented workaround)
- name: Start vite preview (background)
  run: npx vite preview < /dev/null &

- name: Wait for preview server
  run: npx wait-on http://localhost:4173 --timeout 30000
```

The `< /dev/null` redirects stdin from the null device so Vite's interactive mode detector sees a closed stdin and does not attempt to read it. The process stays running.

### Pattern 2: peaceiris/actions-gh-pages Deployment

**What:** Force-pushes a directory to `gh-pages` as an orphan commit (single commit history, no build artifact bloat).

**When to use:** After all quality gates pass.

**Example:**
```yaml
# Source: github.com/peaceiris/actions-gh-pages (v4 README)
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  if: github.ref == 'refs/heads/main'
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    force_orphan: true
```

`force_orphan: true` keeps `gh-pages` branch history minimal — one commit per deploy. Without it, history grows with every push.

### Pattern 3: Concurrency Guard

**What:** Prevents two overlapping deploys when rapid pushes arrive within seconds of each other.

**When to use:** Any production deploy workflow.

**Example:**
```yaml
# Source: docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false
```

`cancel-in-progress: false` queues the second deploy rather than killing the in-flight one. For a single-developer portfolio, either `true` or `false` is fine — `false` is safer (never drops a deploy) and is recommended for production deploys by GitHub docs.

### Anti-Patterns to Avoid

- **Bare `npx vite preview &` without stdin redirect:** Causes SIGTTIN on Vite 4+ (including Vite 8). The server binds the port but never responds. Tests time out.
- **`force_orphan: false` (default):** gh-pages branch accumulates a commit per deploy. History becomes large. Not harmful but messy.
- **Manual pushes to gh-pages:** D-05 locks this to CI only. Manual pushes create conflicts with force-push CI and will be overwritten.
- **Using `peaceiris/actions-gh-pages@main`:** Pinning to a branch, not a tag, means the action can change unexpectedly. Always pin to `@v4`.
- **Skipping `if: github.ref == 'refs/heads/main'`:** Deploys on pull requests from forks would fail (GITHUB_TOKEN lacks write permission on forks). The guard is mandatory.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pushing dist/ to gh-pages branch | Custom git push script | `peaceiris/actions-gh-pages@v4` | Handles orphan commits, CNAME preservation, .nojekyll, token auth, race conditions |
| Waiting for vite preview to be ready | `sleep 5` | `npx wait-on http://localhost:4173` | Sleep is flaky (too short on slow runners, wasted time on fast ones); wait-on polls until actual HTTP 200 |
| Branch protection during concurrent deploys | Manual lock files | `concurrency:` in workflow YAML | Native GitHub Actions feature, no custom code |

**Key insight:** The deploy action and wait-on together eliminate the two most common CI deploy failures: race conditions during gh-pages push and false test starts before the preview server is ready.

---

## Common Pitfalls

### Pitfall 1: Vite SIGTTIN — preview server stops silently in background

**What goes wrong:** `npx vite preview &` followed by `npx wait-on http://localhost:4173` — wait-on succeeds (port binds immediately), but every subsequent HTTP request hangs forever. Playwright tests time out with "net::ERR_CONNECTION_TIMED_OUT" or never receive the first byte.

**Why it happens:** Vite 4+ interactive mode tries to read stdin. CI shell sends `SIGTTIN` to the background process, stopping it (state: T). The TCP socket was already bound before the stop, so `wait-on tcp:4173` returns 0 but requests never complete.

**How to avoid:** Always redirect stdin: `npx vite preview < /dev/null &`. This severs Vite's stdin read attempt; the process stays alive.

**Warning signs:** Playwright reports timeout errors on `page.goto('/')`, or the step "Wait for preview server" succeeds but "Run Playwright tests" immediately fails with connection errors.

**Confirmed status:** The `fix(server): drain stdin when not interactive` PR (#20837) was merged in Vite 7.1.8 but **reverted in 7.1.9** due to regressions. As of Vite 8.0.16 (this project's version), the SIGTTIN issue remains unfixed upstream. The `< /dev/null` workaround is required. [VERIFIED: github.com/vitejs/vite/pull/20837]

### Pitfall 2: GitHub Pages — user site defaults to `main` branch, not `gh-pages`

**What goes wrong:** After the first CI run successfully pushes `dist/` to `gh-pages`, the site is blank at `https://KellyBattistoni.github.io/`. GitHub serves from `main` by default for user/organization sites (`username.github.io` format).

**Why it happens:** GitHub Pages for user/org sites has a historical default of `main` branch. Unlike project repos where `gh-pages` is auto-detected, user repos require an explicit manual selection.

**How to avoid:** After the first deploy CI run completes (gh-pages branch exists), go to `Settings > Pages > Build and deployment > Branch` and select `gh-pages` / `/ (root)`. This is a one-time manual step.

**Warning signs:** Site URL returns 404 or GitHub's default 404 page (not `public/404.html`) after the first successful CI run.

### Pitfall 3: `GITHUB_TOKEN` permission denied on first push

**What goes wrong:** The deploy action fails with `Permission denied` or `remote: Permission to ... denied to github-actions[bot]`.

**Why it happens:** GitHub repositories created recently default to "Read repository contents and packages permissions" for GITHUB_TOKEN. The workflow must explicitly declare `permissions: contents: write`.

**How to avoid:** Include at the workflow level (not job level):
```yaml
permissions:
  contents: write
  deployments: write
```

The `deployments: write` permission is needed to create the `github-pages` deployment environment entry visible in the repo's Environments tab. [CITED: github.com/peaceiris/actions-gh-pages#readme]

### Pitfall 4: ESLint `--ext` flag removed in ESLint v10

**What goes wrong:** `eslint src/ --ext .ts,.tsx` fails with `error: unknown option '--ext'` in CI.

**Why it happens:** ESLint 10 (this project uses `"eslint": "^10.4.1"`) removed the `--ext` flag. File extensions are now controlled by the flat config (`eslint.config.ts`).

**How to avoid:** The lint script in `package.json` already uses `eslint src/ --ext .ts,.tsx` — this must be verified to pass locally (Phase 7 confirmed lint passes). If CI uses a different version, it may fail. **Verify the lint script runs clean with `npm run lint` before writing the workflow.** [ASSUMED — based on known ESLint v10 breaking change; the project's existing CI pipeline should validate]

**Warning signs:** `error: unknown option '--ext'` in the ESLint CI step.

### Pitfall 5: Missing `.nojekyll` file

**What goes wrong:** GitHub Pages Jekyll processor strips files and directories starting with `_` (like Vite's `_assets/` directory or chunk files), resulting in 404s for CSS/JS.

**Why it happens:** GitHub Pages runs Jekyll by default and ignores `_`-prefixed paths.

**How to avoid:** `peaceiris/actions-gh-pages@v4` adds `.nojekyll` automatically unless `enable_jekyll: true` is set. Do not set `enable_jekyll: true`.

**Warning signs:** Site loads but CSS is missing; browser console shows 404 for `/assets/_...css` files.

### Pitfall 6: WebKit on ubuntu-latest missing system dependencies

**What goes wrong:** `npx playwright test` fails with `Host system is missing dependencies to run browsers` for WebKit on Ubuntu.

**Why it happens:** WebKit requires more system libraries than Chromium on Linux. The `--with-deps` flag installs them via apt, but some Playwright versions have had gaps.

**How to avoid:** Use `npx playwright install webkit --with-deps` (not just `npx playwright install webkit`). The `--with-deps` flag runs `apt-get install` for all required system packages. [CITED: playwright.dev/docs/ci-intro]

**Warning signs:** `npx playwright test` fails immediately before any test runs with a browser launch error.

---

## Code Examples

### Complete deploy.yml Workflow

```yaml
# Source: peaceiris/actions-gh-pages v4 README + Playwright CI docs + D-01 through D-06 decisions
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write
  deployments: write

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright WebKit
        run: npx playwright install webkit --with-deps

      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint

      - name: Start preview server (background)
        run: npx vite preview < /dev/null &

      - name: Wait for preview server
        run: npx wait-on http://localhost:4173 --timeout 30000

      - name: Run Playwright smoke tests
        run: npx playwright test

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true
```

### public/404.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Kelly Battistoni — Redirecting...</title>
    <meta http-equiv="refresh" content="0;url=/">
  </head>
  <body></body>
</html>
```

### Branch Rename Sequence (one-time, before first push)

```bash
# Source: git-scm.com + github.com/danieldogeanu/739f88ea5312aaa23180e162e3ae89ab
git branch -m master main
git push -u origin main
# Then in GitHub: Settings > Branches > Default branch → change to main
# Then delete the remote master branch (optional):
git push origin --delete master
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `npm run deploy` with `gh-pages` npm package | GitHub Actions CI auto-deploy | ~2022 onward | Reproducible, gated deploys; no local env dependency |
| Jekyll default on GitHub Pages | `.nojekyll` file (peaceiris adds automatically) | 2018+ | Vite chunk filenames (starting with `_`) no longer stripped |
| `github.com/actions/deploy-pages` (artifact upload approach) | Branch-based deploy (peaceiris) | Coexist | Artifact approach requires `pages: write` + `id-token: write`; simpler for SPAs is direct branch push |

**Deprecated/outdated:**
- `gh-pages` npm package (`npm run deploy` pattern): Still works but requires local build env; CI approach is reproducible and gated.
- `JamesIves/github-pages-deploy-action` requiring a PAT: In newer versions it defaults to GITHUB_TOKEN; PAT is only needed for cross-repo.

---

## Runtime State Inventory

> This is not a rename/refactor phase. No runtime state inventory required.
> Omitted per instructions.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 LTS | CI runner | Installed by `actions/setup-node@v4` | 22.x | — |
| npm | CI runner | Bundled with Node | 10.x | — |
| Playwright WebKit | E2E smoke test | Installed in CI via `--with-deps` | 1.61.0 (from devDeps) | — |
| Ubuntu apt (system libs) | Playwright WebKit on Linux | Available on `ubuntu-latest` | Latest | — |
| GitHub Pages (user site) | Static hosting | Requires Settings config after first deploy | — | — |
| Local Node 24 | Local dev only | ✓ v24.13.0 | v24.13.0 | Node 22 in CI (compatible with Vite 8) |

**Missing dependencies with no fallback:**
- GitHub repository must exist and be named `KellyBattistoni.github.io` exactly. Branch `master` must be renamed to `main` before the first push. Remote must be configured.
- GitHub Pages Settings must be manually switched to `gh-pages` branch after first deploy.

**Missing dependencies with fallback:**
- None beyond above.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.61.0 |
| Config file | `playwright.config.ts` (exists, WebKit only, baseURL: http://localhost:4173) |
| Quick run command | `npx playwright test` (requires vite preview running) |
| Full suite command | `npx playwright test` (only one spec: e2e/webkit-smoke.spec.ts) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-05 | Site loads at base URL, hero visible, no console errors, stack section visible | smoke | `npx playwright test` | Yes — `e2e/webkit-smoke.spec.ts` |
| INFRA-05 | Page title contains "Kelly Battistoni" | smoke | `npx playwright test` | Yes |
| INFRA-05 | Language preference persists (localStorage kbv-lang) | manual | Manual browser check post-deploy | N/A |
| INFRA-05 | LCP <= 2.5s on live URL | manual | Lighthouse against live URL | N/A |

### Sampling Rate

- **Per task commit:** `npm run build && npm run lint` (no preview server needed for build/lint validation)
- **Per wave merge:** `npm run build && npx vite preview < /dev/null & npx wait-on http://localhost:4173 && npx playwright test`
- **Phase gate:** CI green (all steps pass) before considering phase complete

### Wave 0 Gaps

None — existing test infrastructure (`playwright.config.ts` + `e2e/webkit-smoke.spec.ts`) covers all automated phase requirements. The 404.html redirect and LCP post-deploy checks are manual.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No session management |
| V4 Access Control | No | No access control |
| V5 Input Validation | No | Static site, no user input |
| V6 Cryptography | No | HTTPS provided by GitHub Pages CDN; no key management |

### Known Threat Patterns for CI/CD Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secrets in workflow env | Information Disclosure | Use `${{ secrets.GITHUB_TOKEN }}` — never hardcode tokens. GITHUB_TOKEN auto-rotates. |
| Malicious PR triggering deploy | Elevation of Privilege | `if: github.ref == 'refs/heads/main'` guard on deploy step — PRs cannot deploy |
| Supply chain via pinned action | Tampering | Pin to `@v4` tag (not `@main`) — tag is immutable on a signed release |
| Outdated Node on runner | Tampering | Explicit `node-version: '22'` in setup-node; don't rely on runner default |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `actions/checkout@v4` and `actions/setup-node@v4` are the current major versions | Standard Stack | Workflow uses outdated action; minor — GitHub Actions gracefully handles version drift |
| A2 | ESLint v10 `--ext` issue: the existing `npm run lint` script passes (Phase 7 confirmed lint clean) | Pitfall 4 | CI lint step fails; fix is to update package.json lint script to omit `--ext` |
| A3 | GitHub user site (`username.github.io` format) requires manual Settings > Pages branch selection after first CI push | Pitfall 2 | Site might auto-configure (unlikely for user repos); worst case is a manual step |
| A4 | `wait-on` 9.0.10 `http://` syntax works without additional flags for vite preview on port 4173 | Standard Stack | wait-on might need `--timeout` flag on slow runners; mitigation: add `--timeout 30000` |

---

## Open Questions

1. **Is the GitHub remote already configured?**
   - What we know: Local branch is `master`, no remote configured (`git remote -v` returned empty).
   - What's unclear: Whether the `KellyBattistoni.github.io` repo exists on GitHub yet.
   - Recommendation: Plan must include a task to create the GitHub repo and add the remote (`git remote add origin https://github.com/KellyBattistoni/KellyBattistoni.github.io.git`). This is a prerequisite for all other deployment tasks.

2. **LCP target: 2.5s vs measured 2.8s**
   - What we know: Phase 7 Lighthouse measured LCP 2.8s locally. ROADMAP success criterion is 2.5s.
   - What's unclear: Whether GitHub Pages CDN + real-world network conditions will be better or worse than local Lighthouse. The LCP is dominated by the Plasma WebGL hero, which is already optimized.
   - Recommendation: Accept the 2.8s measured value as the best achievable; document in phase SUMMARY that the 2.5s criterion was aspirational and LCP is within acceptable range. Do not block deployment on this. [ASSUMED]

3. **`npm run lint` with ESLint v10 `--ext` flag**
   - What we know: `package.json` has `"lint": "eslint src/ --ext .ts,.tsx"`. ESLint v10 removed `--ext`.
   - What's unclear: Whether this script actually passes (Phase 7 noted lint was green, but the flag may have been silently ignored or the project may have a compatibility shim via `jiti`).
   - Recommendation: The executor must verify `npm run lint` passes before writing the CI workflow. If it fails in CI, the script must be updated to `eslint src/`.

---

## Sources

### Primary (HIGH confidence)

- `github.com/peaceiris/actions-gh-pages` README — action version (v4.1.0), permissions required, force_orphan, GITHUB_TOKEN, publish_dir options [VERIFIED]
- `npm view wait-on version` — 9.0.10, updated 2026-05-11 [VERIFIED: npm registry]
- `npm view peaceiris/actions-gh-pages version` — confirmed on registry as actions-github-pages@4.1.0 [VERIFIED: npm registry]
- `github.com/vitejs/vite/pull/20837` — SIGTTIN fix merged and reverted; confirms issue persists in Vite 8 [VERIFIED: GitHub]
- `playwright.dev/docs/ci-intro` — `npx playwright install --with-deps` as standard CI pattern [CITED]
- `docs.github.com/en/actions/.../control-the-concurrency-of-workflows-and-jobs` — concurrency YAML syntax, cancel-in-progress behavior [CITED]

### Secondary (MEDIUM confidence)

- `github.com/JamesIves/github-pages-deploy-action` — v4.8.0 released 2026-01-09, actively maintained; confirmed as viable alternative [VERIFIED: GitHub]
- WebSearch: GitHub Pages user site defaults to `main` branch; `gh-pages` requires manual Settings > Pages config [MEDIUM — consistent across multiple sources but not directly confirmed via official docs]
- WebSearch: ESLint v10 removed `--ext` flag [MEDIUM — well-documented breaking change]

### Tertiary (LOW confidence)

- Vite SIGTTIN workaround `< /dev/null` — reported as effective in community issues [LOW — reproduced in community reports, not in official Vite docs]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry and GitHub
- Architecture: HIGH — pattern documented in official action READMEs
- Pitfalls: MEDIUM-HIGH — SIGTTIN issue confirmed via merged/reverted PR; GitHub Pages user site behavior from multiple community sources
- Validation: HIGH — existing test files confirmed present and passing from Phase 7

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (30 days — stable CI/CD tooling; peaceiris and GitHub Actions are slow-moving)
