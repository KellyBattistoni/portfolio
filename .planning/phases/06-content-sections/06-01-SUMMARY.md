---
plan: 06-01
phase: 06-content-sections
status: complete
completed: 2026-06-14
commit: b874650
---

## Summary

Installed `@icons-pack/react-simple-icons@13.13.0` (MIT, tree-shaken, React 19 peer), copied both CV PDFs from repo root into `public/`, and fetched the three missing brand SVGs into `public/icons/`.

## Key files created

- `public/Harvard_CV_Kelly_Battistoni_EN.pdf` — EN CV download target
- `public/Harvard_CV_Kelly_Battistoni_ES.pdf` — ES CV download target
- `public/icons/claude.svg` — source for StackClaude.tsx inline component
- `public/icons/n8n.svg` — source for StackN8n.tsx inline component
- `public/icons/make.svg` — source for StackMake.tsx inline component

## Deviations

None. All tasks completed as planned.

## Notable findings

Pre-check of `@icons-pack/react-simple-icons@13.13.0`: `SiRailway: true`, `SiApify: false`. Plan 06-04 must apply the Apify fallback path (fetch `apify.svg` from lobehub + create `StackApify.tsx`).

## Self-Check: PASSED
