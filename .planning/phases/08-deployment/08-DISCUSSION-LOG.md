# Phase 8: Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 08-deployment
**Areas discussed:** Deploy automation, Source branch, Custom domain, 404.html strategy

---

## Deploy automation

| Option | Description | Selected |
|--------|-------------|----------|
| Manual (gh-pages package) | npm run deploy using gh-pages npm package. Simple, no CI setup. | |
| GitHub Actions | Auto-deploy on every push to main via a .github/workflows/deploy.yml workflow. | ✓ |
| Both | gh-pages manual script + GitHub Actions workflow. | |

**User's choice:** GitHub Actions

**CI trigger:**

| Option | Description | Selected |
|--------|-------------|----------|
| Push to main | Deploy every time a commit lands on main. | ✓ |
| Push to main + PR checks | Deploy on merge; build-only check on pull requests. | |
| Manual trigger only | workflow_dispatch in GitHub UI. | |

**User's choice:** Push to main

**CI quality gate:**

| Option | Description | Selected |
|--------|-------------|----------|
| Build only | tsc -b && vite build. Fastest. | |
| Build + lint | Build + ESLint check. | |
| Build + lint + Playwright | Full gate: TypeScript, ESLint, WebKit smoke test. | ✓ |

**User's choice:** Build + lint + Playwright

**Manual fallback:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add both | gh-pages package + npm run deploy alongside CI. | |
| No — CI only | GitHub Actions is the only deploy path. | ✓ |

**User's choice:** No — CI only
**Notes:** User wants the full quality gate enforced on every deploy, no bypass via manual script.

---

## Source branch

**Branch name:**

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to main | git branch -m master main before first push. Current GitHub convention. | ✓ |
| Keep master | Push as-is, CI targets master. | |

**User's choice:** Rename to main

**gh-pages branch management:**

| Option | Description | Selected |
|--------|-------------|----------|
| Let CI manage it | Deploy action creates/updates gh-pages automatically. | ✓ |
| I'll manage it manually | Keep visibility/control over the branch content. | |

**User's choice:** Let CI manage it

**Workflow permissions:**

| Option | Description | Selected |
|--------|-------------|----------|
| Deployment environment | contents: write + deployments: write — shows deployment history on repo page. | ✓ |
| Contents write only | Just contents: write, no deployment environment. | |

**User's choice:** Deployment environment (contents: write + deployments: write)

**Deploy action:**

| Option | Description | Selected |
|--------|-------------|----------|
| peaceiris/actions-gh-pages | Most widely used for Vite + GitHub Pages. 12k+ stars. | |
| JamesIves/github-pages-deploy-action | Also popular, slightly different API. | |
| You decide | Claude picks at planning time. | ✓ |

**User's choice:** Claude decides
**Notes:** User deferred to Claude on the specific action. Both are equivalent for this use case.

---

## Custom domain

| Option | Description | Selected |
|--------|-------------|----------|
| kellybattistoni.github.io | Free, zero config, already the target in ROADMAP.md. | ✓ |
| Custom domain (e.g. kellybattistoni.com) | Requires CNAME file, DNS records, HTTPS enforcement. | |

**User's choice:** kellybattistoni.github.io — no custom domain for v1
**Notes:** Can add a custom domain post-launch without any build changes.

---

## 404.html strategy

**404 behavior:**

| Option | Description | Selected |
|--------|-------------|----------|
| Instant redirect to root | meta http-equiv="refresh" content="0;url=/" — bounces to homepage immediately. | ✓ |
| Branded error page with redirect | Styled 404 page with 5-second auto-redirect. | |
| SPA redirect trick | Path-preserving GitHub Pages SPA hack. Overkill for hash-anchor sites. | |

**User's choice:** Instant redirect to root

**Metadata:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add a title tag | Kelly Battistoni — Redirecting... so tab is not blank. | ✓ |
| No — bare minimum | Just the redirect meta, nothing else. | |

**User's choice:** Yes — add title tag

---

## Claude's Discretion

- **Deploy action:** `peaceiris/actions-gh-pages` vs `JamesIves/github-pages-deploy-action` — Claude picks the more current/reliable option at planning time
- **Node.js version in CI:** Use Node 22 LTS (local machine is v24; 22 is the stable LTS, compatible with Vite 8.x)
- **Playwright browser install command:** `npx playwright install webkit --with-deps`

## Deferred Ideas

- Custom domain (e.g., `kellybattistoni.com`) — post-v1; add `CNAME` file to `public/` and configure DNS records when ready
- Self-hosting Google Fonts — Phase 7 deferred item; still deferred
