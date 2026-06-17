# Phase 7: Polish & Performance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 07-polish-performance
**Areas discussed:** Meta tags & OG image, Contact email, Performance strategy, Mobile QA depth

---

## Meta tags & OG image

### Dynamic meta update approach

| Option | Description | Selected |
|--------|-------------|----------|
| useEffect on language change | Update document.title and meta description tag directly on i18next language change. No extra library, ~10 lines. | ✓ |
| react-helmet-async | Adds ~7KB dependency, declarative JSX head management. More flexible but heavier. | |
| Static in index.html only | Keep hardcoded EN values; ES visitors see EN title. | |

**User's choice:** useEffect on language change

---

### Meta copy authorship

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts both | Claude writes EN and ES title + description from PROJECT.md narrative; user refines at verification. | ✓ |
| User specifies now | User provides exact text (50–60 char title, 150–160 char description). | |

**User's choice:** Claude drafts both

---

### OG image approach

| Option | Description | Selected |
|--------|-------------|----------|
| Design a static PNG now | Claude produces HTML/CSS preview card; user screenshots at 1200×630, drops in public/. | ✓ |
| Skip OG image, text-only | og:title + og:description only. LinkedIn/WhatsApp shows text-only preview. | |

**User's choice:** Design a static PNG now

---

### OG card visual style

| Option | Description | Selected |
|--------|-------------|----------|
| Match the site — dark + brand red | #050505 bg, #FF4500 accent, Playfair Display name, Inter tagline. Cinematic hero look. | ✓ |
| Simpler — dark with name + role only | Minimal, faster to produce. | |

**User's choice:** Match the site — dark + brand red

---

### hreflang tags

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add hreflang tags | link rel="alternate" hreflang="en/es" in head. Signals both language versions to search engines. | ✓ |
| Skip — same-URL SPA | Same URL for EN and ES; hreflang not technically applicable. | |

**User's choice:** Yes, add hreflang tags

---

### OG image language variants

| Option | Description | Selected |
|--------|-------------|----------|
| One image, English only | Social crawlers cache on first visit; language-specific images rarely served correctly. | ✓ |
| Two images, EN + ES | Dynamic og:image per language. Extra production work for minimal benefit. | |

**User's choice:** One image, English only

---

## Contact email

### Which email to show publicly

| Option | Description | Selected |
|--------|-------------|----------|
| kellybattistoniv@gmail.com (personal) | Currently hardcoded in Contact.tsx. | ✓ |
| kelly@seomarketing.com (professional) | Listed in PROJECT.md; more credible to clients. | |

**User's choice:** Keep personal Gmail — no change to Contact.tsx

---

### LinkedIn URL verification

| Option | Description | Selected |
|--------|-------------|----------|
| That URL is correct | https://www.linkedin.com/in/kelly-battistoni-villota-mechanical-engineer/ confirmed. | ✓ |
| Update to different URL | — | |

**User's choice:** URL confirmed correct — no change needed

---

## Performance strategy

### Font loading

| Option | Description | Selected |
|--------|-------------|----------|
| Preconnect + font-display:swap | Append &display=swap to Google Fonts URL. Standard Lighthouse fix. | ✓ |
| Self-host fonts | Download and serve locally. Best score, adds ~200KB to repo. | |

**User's choice:** Preconnect + font-display:swap

---

### Plasma lazy-loading

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy-load Plasma | React.lazy() + Suspense. PlasmaFallback as fallback. Splits OGL out of main bundle. | ✓ |
| Keep eager loading | Simpler. OGL in main bundle. | |

**User's choice:** Lazy-load Plasma

---

### Audit order

| Option | Description | Selected |
|--------|-------------|----------|
| Implement known fixes first | Verified wins, run audit after to confirm. | |
| Audit first, then fix | Baseline score first, targeted fixes after. May reveal unexpected failing audits. | ✓ |

**User's choice:** Audit first, then fix

---

### Stack icons optimization

| Option | Description | Selected |
|--------|-------------|----------|
| Check codebase — Claude decides | Claude inspects and applies standard optimization. | ✓ |
| They're fine as-is | Skip icon optimization. | |

**User's choice:** Claude decides after inspection

---

## Mobile QA depth

### Testing method

| Option | Description | Selected |
|--------|-------------|----------|
| Real device available | Physical device. Plan includes mobile browser verification checkpoint. | |
| DevTools emulation only | Checklist at 375px and 430px. No physical device required. | ✓ |

**User's choice:** DevTools emulation only

---

### Safari testing

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright WebKit engine | Automated Safari-equivalent. No Mac required. Covers ~90% of Safari issues. | ✓ |
| Skip Safari — Chrome + Firefox only | B2B portfolio; Safari less critical. | |

**User's choice:** Playwright WebKit engine

---

### Pre-known mobile issues

| Option | Description | Selected |
|--------|-------------|----------|
| Nothing specific — do a full QA pass | Systematic check of every section at 375px and 430px. | ✓ |
| Yes, specific issues | — | |

**User's choice:** Full QA pass — no pre-known issues

---

## Claude's Discretion

- Stack icon optimization approach — Claude inspects and decides whether inline, sprite, or lazy-load is appropriate
- Meta title and description copy (EN + ES) — Claude drafts from PROJECT.md brand narrative
- OG card HTML/CSS template design — Claude produces the preview artifact

## Deferred Ideas

- Meeting scheduler / booking form in Contact section — new capability, out of Phase 7 scope. Post-launch addition if desired.
- Self-hosting Google Fonts — valid future optimization if font-display=swap is insufficient for Lighthouse 90+.
