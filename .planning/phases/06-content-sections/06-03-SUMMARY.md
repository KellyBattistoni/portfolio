---
plan: 06-03
phase: 06-content-sections
status: complete
completed: 2026-06-14
commit: c2f60d7
---

## Summary

Drafted 4 NDA-safe case studies (EN+ES) and built the Projects section with alternating-offset grid layout, per-card parallax speeds, and an accessible expand-in-place details panel.

## Key files created/modified

- `src/locales/en/projects.json` — 4 cards: lead handoff, content pipeline, competitor intel, reporting ETL
- `src/locales/es/projects.json` — ES localized versions; tech arrays identical (brand-fixed)
- `src/components/sections/ProjectCard.tsx` — card face in ParallaxCard (260px wrapper div), details panel as normal-flow sibling outside ParallaxCard
- `src/components/sections/Projects.tsx` — 12-col grid, col 1/8 vs 6/13 alternation, media query for mobile collapse, speeds 0.10/0.15/0.20/0.25

## Deviations

- Locale files were already populated from prior session work — Task 1 was a no-op.
- ParallaxCard has no style prop; card visual styling lives on a wrapper div. Details panel remains a normal-flow sibling outside overflow:hidden.

## Self-Check: PASSED
