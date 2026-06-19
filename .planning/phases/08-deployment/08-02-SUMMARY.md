---
plan: 08-02
phase: 08-deployment
status: complete
completed: 2026-06-19
---

# Plan 08-02 Summary — 404.html + CI/CD Workflow

## Pre-flight fixes

- `npm run lint` failed with 2 errors in `MobileNav.tsx`: empty `MobileNavProps` interface and empty object destructure pattern. Fixed by removing the unused interface and simplifying the function signature to `MobileNav()`. Committed separately before the workflow file.
- `npm run build` passed cleanly with `base: '/portfolio/'`.
- Playwright smoke test passed (1/1) against `vite preview`.

## Files created

- `public/404.html` — meta-refresh redirect to `/portfolio/` (updated from `/` per project-site deviation)
- `.github/workflows/deploy.yml` — full pipeline: checkout -> Node 22 -> npm ci -> playwright install webkit --with-deps -> build -> lint -> vite preview (SIGTTIN-safe) -> wait-on /portfolio/ -> playwright test -> peaceiris@v4 force_orphan

## Deviations from plan

- `wait-on` URL: `/portfolio/` instead of `/` (project-site subpath)
- `public/404.html` redirect: `url=/portfolio/` instead of `url=/`
- Deployment summary echo uses `https://KellyBattistoni.github.io/portfolio/`

## Commit SHA

`5bdf12a` — feat(deploy): add CI/CD workflow, 404.html, and lint fix
