---
plan: 08-01
phase: 08-deployment
status: complete
completed: 2026-06-19
---

# Plan 08-01 Summary — GitHub Repo Setup

## What was done

- Created public GitHub repo at https://github.com/KellyBattistoni/portfolio
- Renamed local `master` branch to `main`
- Added remote `origin` pointing at `https://github.com/KellyBattistoni/portfolio.git`
- Pushed all Phase 1–7 commits to `origin/main` (28 commits)
- Confirmed GitHub default branch is `main`

## Deviations from plan

**Repo name changed:** Plan assumed `KellyBattistoni.github.io` (user-site root). User created `portfolio` (project site). Impact:
- Live URL is `https://KellyBattistoni.github.io/portfolio/` instead of `https://KellyBattistoni.github.io/`
- `vite.config.ts` base updated `'/'` → `'/portfolio/'`
- CSS preload regex broadened from `\/assets\/` to `\/` to match `/portfolio/assets/` hrefs
- `playwright.config.ts` baseURL updated to `http://localhost:4173/portfolio`
- `public/404.html` redirect URL (created in 08-02) must use `url=/portfolio/`

**Auth method:** Windows Credential Manager had cached `Kelly-SEOM` credentials. Resolved by clearing cached credential and re-authenticating as `KellyBattistoni` via classic PAT (`ghp_` prefix).

## Git state after completion

- Local branch: `main`
- Remote: `origin` → `https://github.com/KellyBattistoni/portfolio.git`
- Tracking: `origin/main`
- Local and remote tips match
