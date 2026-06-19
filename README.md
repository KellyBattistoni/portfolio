# Kelly Battistoni — Portfolio

Bilingual (EN/ES) dark-cinematic portfolio built with React and Vite, deployed to GitHub Pages at https://KellyBattistoni.github.io/portfolio/.

## Tech Stack

- React 19
- Vite 8
- TypeScript 6
- Tailwind CSS v4
- GSAP 3.15 + @gsap/react
- react-i18next 17 + i18next 26
- OGL 1 (WebGL plasma hero)
- Playwright (WebKit smoke test)
- Node 22 LTS (CI runtime)

## Local Development

```bash
npm ci                  # install from lockfile
npm run dev             # Vite dev server (http://localhost:5173/portfolio/)
npm run build           # tsc -b && vite build -> dist/
npm run lint            # ESLint (src/)
npm run preview         # preview production build locally
```

End-to-end tests (run after build):

```bash
# Linux / macOS / Git Bash
npx vite preview < /dev/null &
npx wait-on http://localhost:4173/portfolio/ && npx playwright test

# Windows PowerShell (stdin redirect differs)
Start-Process -NoNewWindow npx -ArgumentList 'vite','preview'
npx wait-on http://localhost:4173/portfolio/ && npx playwright test
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`. No manual `npm run deploy` — CI is the only deploy path.

Pipeline order:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 22, npm cache)
3. `npm ci`
4. `npx playwright install webkit --with-deps`
5. `npm run build`
6. `npm run lint`
7. Start `vite preview` in background (stdin redirected to prevent SIGTTIN on Linux CI)
8. `npx wait-on http://localhost:4173/portfolio/` — HTTP probe confirms app is serving
9. `npx playwright test` — WebKit smoke test
10. `peaceiris/actions-gh-pages@v4` — publishes `dist/` to `gh-pages` branch with `force_orphan: true`

Concurrency: overlapping pushes are queued, never cancelled.

## One-Time GitHub Pages Setup

After the first successful CI run:

1. Wait for `.github/workflows/deploy.yml` to complete (green check on the Actions tab).
2. Confirm a `gh-pages` branch exists in the repo branch list.
3. Go to `Settings > Pages > Build and deployment`.
4. Source: `Deploy from a branch`.
5. Branch: select `gh-pages`, folder `/ (root)`, click Save.
6. Wait 1-2 minutes. The page will show "Your site is live at https://KellyBattistoni.github.io/portfolio/".

## 404 Handling

`public/404.html` is an instant meta-refresh redirect (`content="0;url=/portfolio/"`) that GitHub Pages auto-serves for any path that does not match a file. Unknown paths bounce back to the portfolio root immediately. Deep links using hash fragments (`#section`) are handled entirely in-browser and never reach the 404 path.

## Project Structure

- `src/components/` — React UI components (Hero, PillNav, MobileNav, Projects, Stack, About, Contact, Plasma)
- `src/locales/{en,es}/` — i18n JSON namespaces (common, hero, projects, about, stack, contact)
- `src/lib/` — shared modules (GSAP registration, i18n config)
- `src/hooks/` — custom hooks (scroll store, device capabilities, meta tags)
- `public/` — static assets: favicon, OG image, CV PDFs, fonts, icons, 404.html
- `e2e/` — Playwright WebKit smoke test
- `.planning/` — GSD project management framework (phases, roadmap, state)
- `.github/workflows/` — CI/CD pipeline

## License

All rights reserved. Personal portfolio of Kelly Battistoni.
