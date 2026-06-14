# Phase 6: Content Sections - Research

**Researched:** 2026-06-13
**Domain:** React content sections — bilingual prose, parallax case-study cards, brand-icon grid, dot-grid background, PDF download, mailto/LinkedIn CTAs
**Confidence:** HIGH (core stack already proven in Phases 1-5; icon strategy verified against multiple registries; copy / NDA-safe drafting is content work the planner will scope)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### About section shape
- Format: flowing prose, 2–3 paragraphs. No bullet points, no headers — reads like a person, not a résumé.
- Story arc: Claude's discretion — pick the arc that best fits the project's core value statement ("she sees the full system, adapts faster than anyone, always thinks ahead on the business").
- Anchor reference: 1–2 key references allowed. Use SEO / marketing agency work as the primary anchor — no company names or dates, but domain and scope are fair game.
- Visual accent: one subtle design element (e.g. thin divider, brand-color highlight on a key phrase, or decorative typographic element). Not text-only, not heavily illustrated.
- CTA / closing: Claude decides based on flow into the Projects section.

#### Projects section layout
- Desktop arrangement: staggered / offset — cards alternate left and right, creates visual rhythm that complements parallax depth.
- Card face metadata: project name + context, industry/client type (no org names), tech stack tags, and outcome metric.
- Card interaction: expand in place on click — reveals a Problem / Solution / Result structure (three short blocks).
- Count: 3–4 cards. Content not yet written — Claude drafts NDA-safe descriptions in both EN and ES; user refines during browser verification.
- Draft approach: collaborative — Claude writes initial EN + ES copy using known background (SEO/marketing agency domain, tools: Make.com, N8N, Claude/MCP, Supabase, Python, JS, Docker, Railway, Google Cloud, GitHub, Airtable, Notion, Apify), user iterates.

#### Stack display
- Grouping: by category — Automation / AI / Infrastructure / Data (or equivalent grouping that fits the 13 tools cleanly).
- Entry format: icon + name only. No one-line descriptors.
- Dot-grid background: Claude decides whether it's full-section or behind-grid-only, based on what cleanest separates Stack from adjacent sections visually.
- Hover effect: subtle scale on hover (1.05–1.1×). Respects reduced-motion policy.
- i18n depth: Claude decides translation granularity. Tool names stay in EN (brand-fixed); section title and category labels should translate.

#### Contact + CV behavior
- Section structure: single final section at the bottom of the page. Order within the section: heading → short invitation copy (2–3 sentences, framing what kind of work Kelly takes on) → mailto link + LinkedIn link → CV download toggle at the bottom.
- CV download: explicit EN/ES toggle button. User picks which language version to download regardless of current site language.
- CV files: `Harvard_CV_Kelly_Battistoni_EN.pdf` and `Harvard_CV_Kelly_Battistoni_ES.pdf` (already in repo root, copy to `public/` during this phase).
- Email: `kelly@seomarketing.com` (mailto link).
- LinkedIn URL: to be supplied by user before implementation — leave as placeholder `LINKEDIN_URL` in locale JSON.

### Claude's Discretion
- About narrative arc and closing CTA/no-CTA decision
- Dot-grid scope (full-section vs. contained behind grid)
- Stack i18n translation granularity (beyond section title)
- Invitation copy tone in Contact (Claude writes first draft, user refines)
- Exact parallax speed values per project card (within the established ParallaxCard API)

### Deferred Ideas (OUT OF SCOPE)
- Meeting scheduler / booking form (e.g. Google Calendar integration, Calendly embed) in Contact section — mentioned during discussion; this is a new capability beyond Phase 6 scope. Consider for Phase 7 Polish or as a standalone addition after launch.
</user_constraints>

---

## Summary

Phase 6 is **almost entirely composition work on top of finished infrastructure**. The animation engine (`@/lib/gsap`), reveal pattern (`RevealSection`), parallax engine (`ParallaxCard` with the multi-layer `layers: { content, speed, className? }[]` API), capability gating (`useDeviceCapabilities`), bilingual plumbing (six EN/ES namespaces already wired in `src/lib/i18n/index.ts`), and the dark-themed visual baseline (Plasma hero, accent `#FF4500`, Playfair Display + Inter) all already exist. No new architectural primitives are needed. The hard problems Phase 6 owns are: (1) brand-icon coverage for the 13 stack tools, (2) bilingual prose for About + Projects, (3) a clean expand-in-place interaction for project cards, (4) a language-toggled PDF download.

The single non-trivial dependency decision is icon coverage. Of the 13 stack tools the user listed (Make.com, n8n, Claude/MCP, Supabase, Python, JavaScript, Docker, Railway, Google Cloud, GitHub, Airtable, Notion, Apify), **Simple Icons covers 10** (Airtable, Supabase, Apify, Python, JavaScript, Docker, Notion, GitHub, Google Cloud, Anthropic) and **does NOT cover** Make, n8n, or Claude (closed-as-not-planned). The cleanest fix is to install `@icons-pack/react-simple-icons` (v13.14.0, React 19 supported, `sideEffects: false` — tree-shakable) for the 10, and ship the three missing logos as static SVGs under `public/icons/` sourced from `@lobehub/icons-static-svg` (verified to contain `claude.svg`, `n8n.svg`, `make.svg` at the same 24×24 viewBox with `fill="currentColor"`). This avoids pulling `@lobehub/icons` itself — which has hard peer deps on `@lobehub/ui` and `antd` and would bloat the bundle catastrophically.

Everything else is composition: a `RevealSection`-wrapped About paragraph using `t()` for prose, four `ParallaxCard` instances in an alternating-offset grid for Projects, a categorized icon grid with a CSS `radial-gradient` dot-grid for Stack, and a flat Contact section with two anchor tags and one client-side `download` attribute. The `expand-in-place` interaction for project cards is a state-toggled height/opacity transition that uses GSAP for the transition itself and keeps `useState` outside the `useGSAP` dependency array (the 05-03 anti-pattern lesson).

**Primary recommendation:** Install `@icons-pack/react-simple-icons`, copy `claude.svg` / `n8n.svg` / `make.svg` into `public/icons/`, copy both CV PDFs into `public/`, and compose five new section components (`About.tsx`, `Projects.tsx`, `ProjectCard.tsx`, `Stack.tsx`, `Contact.tsx`) using the established `RevealSection` / `ParallaxCard` / `useGSAP` patterns. Add only one new dependency. Keep tool names in EN; translate section titles, category labels, and all prose.

---

## Standard Stack

All Phase 1-5 dependencies stay. **One new dependency** is required.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | ^3.15.0 | All transitions — reveal, parallax, card expansion | Single animation engine; ScrollTrigger included |
| @gsap/react | ^2.1.2 | `useGSAP` + `contextSafe` for click handlers | Replaces useEffect for GSAP; React 19 strict-mode safe |
| react-i18next | ^17.0.8 | `useTranslation` for all section copy | Already wired across six namespaces |
| i18next | ^26.3.1 | Resource resolution; `returnObjects: true` for paragraph arrays | Already configured at `src/lib/i18n` |
| tailwindcss | ^4.3.0 | Utility classes; arbitrary values for dot-grid | `@theme` block already exposes `--color-brand-accent` etc. |
| clsx | ^2.1.1 | Conditional class composition for card expand state | Already used in LanguageSwitcher / nav |
| react | ^19.2.7 | `useState`, `useRef`, `useId` for ARIA on expand cards | Required peer of new icon lib |

### Supporting — ONE new dependency
| Library | Version | Purpose | Why It Beats Alternatives |
|---------|---------|---------|---------------------------|
| @icons-pack/react-simple-icons | ^13.14.0 | React components for 10 of the 13 stack icons | React 19 peer (`^16.13 \|\| ^17 \|\| ^18 \|\| ^19`), `sideEffects: false` (tree-shakable), MIT license, 23.7k brand library (Simple Icons 16.18.0) — installs ONLY the icons you import |

### Static SVG assets (no package)
| Asset | Source | Why Static |
|-------|--------|------------|
| `public/icons/claude.svg` | `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude.svg` | NOT in Simple Icons (closed/not-planned); 24×24 `currentColor` SVG, drops into `<img>` or inline `<svg>` |
| `public/icons/n8n.svg` | `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/n8n.svg` | NOT in Simple Icons (#9779 closed as not planned); 24×24 `currentColor` SVG |
| `public/icons/make.svg` | `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/make.svg` | NOT in Simple Icons; 24×24 `currentColor` SVG |
| `public/Harvard_CV_Kelly_Battistoni_EN.pdf` | Copy from repo root | CV download target; `download` attribute serves the file |
| `public/Harvard_CV_Kelly_Battistoni_ES.pdf` | Copy from repo root | Same — language toggle picks which one |

### Alternatives Considered (rejected)
| Instead of | Could Use | Why Rejected |
|------------|-----------|--------------|
| `@icons-pack/react-simple-icons` | `react-icons` (set `react-icons/si`) | History of tree-shaking misses with Webpack/CRA; Vite + sideEffects:false on the dedicated package is the safer route. Also ships unrelated icon sets we never need |
| `@icons-pack/react-simple-icons` | `@lobehub/icons` (covers all 13) | Has **hard** peer deps on `@lobehub/ui` (^5.0.0) and `antd` (^6.1.1) — pulling Ant Design into a 6-component portfolio is a non-starter |
| Static SVG for 3 missing icons | `@lobehub/icons-static-svg` package install | Adds an entire ~900-icon package for 3 files. Copying 3 SVGs is cleaner and keeps `package.json` lean |
| `iconify-icon` Web Component (used by inspo.txt) | Inline `<iconify-icon>` tags | Adds a Web Component dependency + runtime fetch; pure SVG components have zero runtime cost and are typed |
| GSAP for stack-icon scale-hover | CSS `:hover { transform: scale(1.08) }` | A 1.05–1.1× hover does not need an animation engine. CSS keeps render path simple and respects `prefers-reduced-motion` via media query naturally |
| GSAP timeline for project-card expand | CSS `max-height` + `opacity` transitions with `transition-all duration-300 ease` | Either works; CSS is simpler and avoids `useGSAP` dependency-array gotchas. **Recommend CSS for the expand**; reserve GSAP for the parallax + reveal that's already in place |

**Installation:**
```bash
npm install @icons-pack/react-simple-icons
```

That is the ONLY new install for Phase 6. Then copy the three missing SVGs and both CV PDFs into `public/` (filesystem ops, no npm).

---

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── sections/                       # NEW — top-level sections live here
│   │   ├── About.tsx                   # NEW — prose + visual accent + RevealSection
│   │   ├── Projects.tsx                # NEW — section frame + alternating-offset grid
│   │   ├── ProjectCard.tsx             # NEW — ParallaxCard + expand-in-place
│   │   ├── Stack.tsx                   # NEW — categorized icon grid + dot-grid bg
│   │   └── Contact.tsx                 # NEW — heading + invite + mailto/LinkedIn + CV toggle
│   ├── stack/                          # NEW — icon registry, isolated
│   │   ├── StackIcon.tsx               # NEW — dispatcher: React component vs static SVG
│   │   └── stack-registry.ts           # NEW — single source of truth: { id, name, Icon, category }[]
│   ├── hero/Hero.tsx                   # EXISTING — unchanged
│   ├── nav/{PillNav,MobileNav}.tsx     # EXISTING — unchanged
│   ├── scroll/{RevealSection,ParallaxCard}.tsx  # EXISTING — consumed, not modified
│   ├── i18n/LanguageSwitcher.tsx       # EXISTING — already inside PillNav/MobileNav
│   ├── error/AnimationErrorBoundary.tsx # EXISTING — wraps each new section's animation
│   ├── plasma/HeroBackdrop.tsx         # EXISTING — Phase 4
│   └── layout/NoiseOverlay.tsx         # EXISTING — Phase 1
├── locales/{en,es}/
│   ├── about.json                      # REPLACE _placeholder with real keys
│   ├── projects.json                   # REPLACE _placeholder with cards.project1..4.{title,context,outcome,tech,problem,solution,result}
│   ├── stack.json                      # REPLACE _placeholder with title + categories.{automation,ai,infrastructure,data}
│   ├── contact.json                    # REPLACE _placeholder with heading, invite, email, linkedin, cv.toggle.{en,es}, cv.label
│   └── common.json                     # No change (nav links already point to #about, #work, #stack, #contact)
└── App.tsx                             # MODIFY: replace Phase 5 placeholder div with <About>, <Projects>, <Stack>, <Contact>
public/
├── Harvard_CV_Kelly_Battistoni_EN.pdf  # NEW — copy from repo root
├── Harvard_CV_Kelly_Battistoni_ES.pdf  # NEW — copy from repo root
└── icons/
    ├── claude.svg                       # NEW — copy from @lobehub/icons-static-svg
    ├── n8n.svg                          # NEW — copy from @lobehub/icons-static-svg
    └── make.svg                         # NEW — copy from @lobehub/icons-static-svg
```

### Pattern 1: Multi-paragraph Prose with react-i18next

The About section is 2-3 paragraphs of flowing prose. The cleanest TS-safe approach is **separate string keys per paragraph** (NOT `returnObjects: true` arrays — those bypass the `CustomTypeOptions` augmentation and degrade typed `t()` to `string | object`).

```typescript
// src/locales/en/about.json
{
  "title": "About",
  "paragraph1": "Some engineers chase the latest framework. I chase the system underneath…",
  "paragraph2": "After years inside an SEO and marketing agency, I learned…",
  "paragraph3": "Today I build the automations that buy other people their time back."
}
```

```typescript
// src/components/sections/About.tsx — usage
import { useTranslation } from 'react-i18next'
import { RevealSection } from '@/components/scroll/RevealSection'

export function About() {
  const { t } = useTranslation('about')
  return (
    <section id="about" aria-label={t('title')}>
      <RevealSection stagger>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h2>
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
      </RevealSection>
    </section>
  )
}
```

**Why three direct `<p>` children of `RevealSection`:** Phase 3 memory `[feedback_revealsection_stagger.md]` flags that stagger falls back to no-stagger if cards are wrapped in a single intermediate div. Direct paragraph children of `RevealSection` make each one a stagger target (per the `stagger: 0.12` `gsap.fromTo` over `container.children`).

**Visual accent recommendation (Claude's discretion):** A short brand-accent horizontal bar (`<span className="block h-px w-12 bg-[var(--color-brand-accent)] mb-6" />`) above the heading. This matches the "subtle design element" decision without illustration. Alternative: a single `<em>` span on a load-bearing phrase styled with `color: var(--color-brand-accent)` via inline style — clean and self-explanatory.

### Pattern 2: Project Cards with Alternating Offset

Each card uses the existing `ParallaxCard` API. The alternating layout is pure CSS Grid with column offset per index.

```typescript
// src/components/sections/Projects.tsx
import { useTranslation } from 'react-i18next'
import { ProjectCard } from './ProjectCard'

const PROJECTS = ['project1', 'project2', 'project3', 'project4'] as const

export function Projects() {
  const { t } = useTranslation('projects')
  return (
    <section
      id="work"
      aria-label={t('title')}
      style={{ padding: '6rem 1.5rem', position: 'relative' }}
    >
      <h2 style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '2rem',
          marginTop: '4rem',
        }}
      >
        {PROJECTS.map((id, i) => (
          <div
            key={id}
            style={{
              gridColumn: i % 2 === 0 ? '1 / 8' : '6 / 13', // alternating offset
              minHeight: '420px',
            }}
          >
            <ProjectCard projectId={id} parallaxSpeed={0.1 + i * 0.05} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Speed staggering rationale:** 0.10 / 0.15 / 0.20 / 0.25 keeps each card's displacement under `[-25, +25]px` (±speed×100 per `ParallaxCard.tsx` line 75) — visually distinct depth, never enough to read as "jumpy" or motion-sick territory. Mobile gets static rendering automatically (`ParallaxCard` skips parallax on `isMobile`).

### Pattern 3: ParallaxCard Wrapping with Expand-in-Place

The expand-in-place interaction is a vanilla `useState` toggle on the card. Animation = CSS transitions (not GSAP). Doing this in GSAP requires putting the state in a ref and re-running the timeline, which fights the React render cycle. CSS `max-height` + `opacity` transitions are the right tool.

```typescript
// src/components/sections/ProjectCard.tsx
import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ParallaxCard } from '@/components/scroll/ParallaxCard'

interface ProjectCardProps {
  projectId: 'project1' | 'project2' | 'project3' | 'project4'
  parallaxSpeed: number
}

export function ProjectCard({ projectId, parallaxSpeed }: ProjectCardProps) {
  const { t } = useTranslation('projects')
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()

  return (
    <ParallaxCard
      className="bg-[var(--color-brand-card)] border border-white/10 rounded-lg"
      layers={[
        {
          speed: parallaxSpeed,
          content: (
            <div style={{ padding: '2rem' }}>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={detailsId}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'transparent', border: 'none', color: 'inherit',
                  cursor: 'pointer', padding: 0,
                }}
              >
                <h3>{t(`cards.${projectId}.title`)}</h3>
                <p>{t(`cards.${projectId}.context`)}</p>
                <p style={{ color: 'var(--color-brand-accent)' }}>
                  {t(`cards.${projectId}.outcome`)}
                </p>
                <ul aria-label="Tech stack">
                  {/* tech tags */}
                </ul>
              </button>
              <div
                id={detailsId}
                style={{
                  maxHeight: expanded ? '600px' : '0',
                  opacity: expanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, opacity 0.3s ease',
                }}
              >
                <h4>{t('labels.problem')}</h4>
                <p>{t(`cards.${projectId}.problem`)}</p>
                <h4>{t('labels.solution')}</h4>
                <p>{t(`cards.${projectId}.solution`)}</p>
                <h4>{t('labels.result')}</h4>
                <p>{t(`cards.${projectId}.result`)}</p>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
```

**Why a `<button>` wraps the card face:** Accessibility. The expand control needs `aria-expanded` and `aria-controls`, and it must be keyboard-focusable. The whole face is the click target so the affordance matches the visual.

**Why `max-height` over `height`:** `height: auto` cannot be transitioned. `max-height` with a generous ceiling (`600px`) gives smooth transitions while accommodating variable content lengths.

### Pattern 4: Stack — Categorized Icon Grid with Dot-Grid Background

Single source of truth for the 13 tools. Each entry knows its display name, icon source (component or static path), and category.

```typescript
// src/components/stack/stack-registry.ts
import {
  SiAirtable, SiSupabase, SiApify, SiPython, SiJavascript, SiDocker,
  SiNotion, SiGithub, SiGooglecloud,
} from '@icons-pack/react-simple-icons'
import type { ComponentType } from 'react'

export type StackCategory = 'automation' | 'ai' | 'infrastructure' | 'data'

export interface StackEntry {
  id: string
  name: string                       // brand-fixed, never translated
  category: StackCategory
  Icon?: ComponentType<{ size?: number; className?: string; color?: string }>
  iconSrc?: string                   // static SVG fallback for tools not in Simple Icons
}

export const STACK: readonly StackEntry[] = [
  // Automation
  { id: 'make',     name: 'Make.com',  category: 'automation',    iconSrc: '/icons/make.svg' },
  { id: 'n8n',      name: 'n8n',       category: 'automation',    iconSrc: '/icons/n8n.svg' },
  // AI
  { id: 'claude',   name: 'Claude / MCP', category: 'ai',         iconSrc: '/icons/claude.svg' },
  // Infrastructure
  { id: 'docker',   name: 'Docker',    category: 'infrastructure', Icon: SiDocker },
  { id: 'railway',  name: 'Railway',   category: 'infrastructure', Icon: undefined /* see note */ },
  { id: 'gcp',      name: 'Google Cloud', category: 'infrastructure', Icon: SiGooglecloud },
  { id: 'github',   name: 'GitHub',    category: 'infrastructure', Icon: SiGithub },
  // Data
  { id: 'supabase', name: 'Supabase',  category: 'data',          Icon: SiSupabase },
  { id: 'airtable', name: 'Airtable',  category: 'data',          Icon: SiAirtable },
  { id: 'notion',   name: 'Notion',    category: 'data',          Icon: SiNotion },
  { id: 'apify',    name: 'Apify',     category: 'data',          Icon: SiApify },
  // Languages (could fold into infrastructure; planner decides final grouping)
  { id: 'python',   name: 'Python',    category: 'data',          Icon: SiPython },
  { id: 'js',       name: 'JavaScript', category: 'data',         Icon: SiJavascript },
] as const
```

**Railway note:** Simple Icons DOES have a `railway` slug (`SiRailway`). The planner should verify the actual exported component name during install. If `SiRailway` resolves cleanly, prefer the component over a static SVG.

```typescript
// src/components/stack/StackIcon.tsx — single dispatch point
import type { StackEntry } from './stack-registry'

export function StackIcon({ entry, size = 32 }: { entry: StackEntry; size?: number }) {
  if (entry.Icon) return <entry.Icon size={size} color="currentColor" />
  if (entry.iconSrc) {
    return (
      <img
        src={entry.iconSrc}
        alt=""                       // decorative; name label is the accessible name
        width={size}
        height={size}
        loading="lazy"
        style={{ filter: 'invert(1)' /* white on dark — see note */ }}
      />
    )
  }
  return null
}
```

**SVG color note:** `@lobehub/icons-static-svg` SVGs use `fill="currentColor"`. When loaded via `<img>`, browsers do NOT apply CSS color to SVG (it renders as black). Two workable options:

1. **Inline the SVG** (fetch at build time via Vite `?raw` import or paste content into a `.tsx`) and let CSS color drive it.
2. **Use `<img>` + `filter: invert(1) brightness(2)`** to render white-on-black — quick but blunt.

Recommend option 1 for production polish; option 2 is acceptable for a first pass and matches inspo.txt's casual approach.

```typescript
// src/components/sections/Stack.tsx
import { useTranslation } from 'react-i18next'
import { STACK, type StackCategory } from '@/components/stack/stack-registry'
import { StackIcon } from '@/components/stack/StackIcon'
import { RevealSection } from '@/components/scroll/RevealSection'

const ORDER: StackCategory[] = ['automation', 'ai', 'infrastructure', 'data']

export function Stack() {
  const { t } = useTranslation('stack')
  return (
    <section
      id="stack"
      aria-label={t('title')}
      style={{
        position: 'relative',
        padding: '6rem 1.5rem',
        // Dot-grid background — section-scoped, behind grid only (Claude's discretion call)
        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: 'center',
      }}
    >
      <RevealSection stagger>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>{t('title')}</h2>
        {ORDER.map((cat) => (
          <div key={cat}>
            <h3>{t(`categories.${cat}`)}</h3>
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1.5rem',
                listStyle: 'none',
                padding: 0,
              }}
            >
              {STACK.filter((s) => s.category === cat).map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    transition: 'transform 0.2s ease',
                  }}
                  className="hover:scale-[1.08]"
                >
                  <StackIcon entry={entry} />
                  <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </RevealSection>
    </section>
  )
}
```

**Dot-grid styling** (from `inspo.txt` line 250 and verified pattern):
```css
background-image: radial-gradient(circle, #333 1px, transparent 1px);
background-size: 40px 40px;
```

Tailwind v4 arbitrary equivalent:
```tsx
className="bg-[radial-gradient(circle,_#333_1px,_transparent_1px)] [background-size:40px_40px]"
```

**Reduced-motion compliance for hover:** CSS `transition` + `:hover` is automatically respected by users — `transform` transitions are not "motion" in the WCAG 2.3.3 sense, but to be fully safe wrap the rule in a media query: `@media (prefers-reduced-motion: no-preference) { ... }`. Alternatively, accept that 1.08× scale on hover is below the reduced-motion threshold.

### Pattern 5: Contact + CV Download with Language Toggle

The CV toggle is a tiny state machine. Two buttons; clicking either kicks off a download via a programmatically-created `<a download>` element.

```typescript
// src/components/sections/Contact.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function Contact() {
  const { t } = useTranslation('contact')
  const [cvLang, setCvLang] = useState<'en' | 'es'>('en')

  const cvHref =
    cvLang === 'en'
      ? '/Harvard_CV_Kelly_Battistoni_EN.pdf'
      : '/Harvard_CV_Kelly_Battistoni_ES.pdf'

  return (
    <section id="contact" aria-label={t('heading')} style={{ padding: '6rem 1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>{t('heading')}</h2>
      <p style={{ maxWidth: '52ch' }}>{t('invite')}</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <a href="mailto:kelly@seomarketing.com">{t('email.label')}</a>
        <a
          href={t('linkedin.url')}      // value is LINKEDIN_URL placeholder until user supplies
          target="_blank"
          rel="noopener noreferrer"      // explicit noopener — old browsers (pre-2021)
        >
          {t('linkedin.label')}
        </a>
      </div>

      <div role="group" aria-label={t('cv.label')} style={{ marginTop: '3rem' }}>
        <p>{t('cv.label')}</p>
        <div role="radiogroup" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            role="radio"
            aria-checked={cvLang === 'en'}
            onClick={() => setCvLang('en')}
          >
            {t('cv.toggle.en')}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={cvLang === 'es'}
            onClick={() => setCvLang('es')}
          >
            {t('cv.toggle.es')}
          </button>
        </div>
        <a
          href={cvHref}
          download                       // hints browser to download instead of navigate
          style={{
            display: 'inline-block', marginTop: '1rem',
            border: '1px solid var(--color-brand-accent)', padding: '0.875rem 2.25rem',
          }}
        >
          {t('cv.download')}
        </a>
      </div>
    </section>
  )
}
```

**`download` attribute semantics:** When present, the browser saves the linked file instead of navigating. The attribute can take a value (`download="kelly-cv.pdf"`) to override the saved filename — useful if the on-disk filename differs from the user-facing name. Since the files are pre-named `Harvard_CV_Kelly_Battistoni_{EN,ES}.pdf`, leaving `download` as a bare attribute lets the browser pick up the original name.

**Why `<a>` not JS fetch+blob:** The "click anchor to download" pattern works without JavaScript, respects browser-level download permissions, and avoids leaking blob URLs. Reserve fetch+blob for files that must be assembled in-browser (CSVs, generated PDFs).

**`rel="noopener noreferrer"` on the LinkedIn link:** All modern browsers (Chrome 88+, Firefox 79+, Safari 12.1+) auto-imply `rel="noopener"` when `target="_blank"`. Including it explicitly is belt-and-suspenders for older browsers and pre-emptively silences `eslint-plugin-react/jsx-no-target-blank`. The mailto: link does NOT need either attribute — it opens a mail client, not a tab.

### Pattern 6: Wiring into App.tsx

Replace the Phase 5 placeholder div (line 29 of `App.tsx`) with the four section components inside an `AnimationErrorBoundary` each:

```typescript
// src/App.tsx — diff against current
import { About } from '@/components/sections/About'
import { Projects } from '@/components/sections/Projects'
import { Stack } from '@/components/sections/Stack'
import { Contact } from '@/components/sections/Contact'
import { AnimationErrorBoundary } from '@/components/error/AnimationErrorBoundary'

// inside <App>:
<>
  <NoiseOverlay />
  <Hero sectionRef={heroRef} />
  {isMobile ? <MobileNav heroRef={heroRef} /> : <PillNav heroRef={heroRef} />}
  <AnimationErrorBoundary><About /></AnimationErrorBoundary>
  <AnimationErrorBoundary><Projects /></AnimationErrorBoundary>
  <AnimationErrorBoundary><Stack /></AnimationErrorBoundary>
  <AnimationErrorBoundary><Contact /></AnimationErrorBoundary>
</>
```

The error-boundary wrap pattern is already established (`Hero.tsx` wraps `HeroBackdrop`). One boundary per section means a crash in `Projects` parallax doesn't kill the About / Stack / Contact below it.

### Anti-Patterns to Avoid

- **`returnObjects: true` for paragraph arrays.** Bypasses the `CustomTypeOptions` augmentation in `src/@types/i18next.d.ts`. The typed `t()` collapses to `(key) => string | object` and the IDE loses autocomplete. Use separate string keys (`paragraph1`, `paragraph2`, …) instead.
- **Putting `expanded` state in the `useGSAP` dependency array.** This is the documented anti-pattern from Plan 05-03 — the timeline rebuilds on every toggle and the panel animation resets. The expand-in-place interaction here is CSS-driven for exactly this reason; no `useGSAP` is involved.
- **Reaching for GSAP for the hover scale.** A 1.05–1.1× scale on `:hover` is a CSS transition, not an animation. GSAP adds runtime cost and a tween cleanup obligation for zero visual gain.
- **Loading SVGs via `<img>` and expecting CSS `color` to work.** SVGs loaded as images cannot inherit CSS color. Either inline the SVG (`?raw` import) or apply `filter: invert(...)` if monochrome white-on-black is acceptable.
- **A single `RevealSection` wrapping all four sections at App level.** Each section needs its own reveal trigger (different scroll depths). One reveal per section, each with its own `RevealSection`.
- **Translating tool brand names.** "Make.com" stays "Make.com" in both languages. Translating brand strings violates locked decision; the planner must not add `t(stack.tools.make)` keys.
- **Encoding the LinkedIn URL into component source.** It belongs in `locales/{en,es}/contact.json` under `linkedin.url` as a placeholder `LINKEDIN_URL` until the user supplies it. Same value in both locales (URL is language-agnostic) but kept in i18n for swap-without-edit consistency.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Brand-icon coverage for 10 of 13 tools | Hand-traced SVG paths in `<svg>` components | `@icons-pack/react-simple-icons` (tree-shakable) | Simple Icons is the canonical brand-icon registry; hand-tracing fails brand-guideline review and breaks when companies rebrand |
| Scroll-driven reveal for each section | New `IntersectionObserver` or scroll listener per section | `RevealSection` (existing) | Phase 3 already proved the `once: true` self-killing trigger pattern; reusing keeps the "one scroll listener total" architecture |
| Card parallax depth | Custom `useEffect` + `transform: translateY` math | `ParallaxCard` (existing, multi-layer API) | Multi-layer API was explicitly designed for Phase 6; refactor avoidance is the whole point of the [03-02] decision |
| Card expand state | `react-collapse` / `react-accessible-accordion` packages | `useState` + CSS `max-height` transition | One-toggle pattern; an entire package is overkill for ~15 LOC of CSS |
| PDF download | `react-pdf` / `file-saver` / blob construction | `<a href download>` | The download attribute IS the standard; blob is for in-memory files only |
| Hover scale on stack icons | GSAP tween on mouseenter/leave | CSS `:hover { transform: scale(1.08); transition }` | Hover scale is the textbook CSS case |
| Dot-grid background | Repeating `<div>` dots or canvas | CSS `background-image: radial-gradient(...)` + `background-size` | One CSS rule; works on all browsers since IE9; GPU-accelerated |
| Mailto / LinkedIn buttons | Form library / state | Plain `<a href="mailto:...">` and `<a href="https://...">` | Anchor tags handle this in 1 LOC each |

**Key insight:** Phase 6 is where the **discipline pays off**. Every primitive needed already exists in the codebase or in a one-tag HTML feature. The sole new install is icons. Adding more is over-engineering.

---

## Common Pitfalls

### Pitfall 1: Tool Icon Missing from Simple Icons Triggers Last-Minute Improvisation
**What goes wrong:** The team installs `@icons-pack/react-simple-icons`, imports `SiN8n`, gets a build error, and starts hand-tracing or pulling in another icon package mid-implementation.
**Why it happens:** Simple Icons rejected n8n (issue #9779, closed as not planned) and Make.com (no issue/PR found) and the closed-state of the Claude PR (#10975) is ambiguous in their public history.
**How to avoid:** Plan the static-SVG fallback up front. Copy `claude.svg`, `n8n.svg`, `make.svg` from `@lobehub/icons-static-svg` to `public/icons/` as Task 1 of the Stack work, BEFORE wiring components. The `StackIcon` dispatcher then handles both paths uniformly.
**Warning signs:** A task plan that imports `SiN8n` or `SiMake` from `@icons-pack/react-simple-icons` — these do not exist.

### Pitfall 2: SVG `<img>` Loses Color
**What goes wrong:** Icons render solid black on dark background — invisible.
**Why it happens:** SVGs loaded via `<img>` (or `background-image`) are sandboxed from the host document's CSS. `fill="currentColor"` evaluates to black because the SVG document has no inherited color.
**How to avoid:** Either inline the SVG content (use Vite's `?raw` import to inject the markup, OR paste the path into a `.tsx` component), OR apply `filter: invert(1)` if the icon is pure black originally and the result should be pure white.
**Warning signs:** Stack icons render but appear as black blobs or completely invisible on dark backgrounds.

### Pitfall 3: Browser Saves PDF with the Wrong Filename
**What goes wrong:** User clicks "Download EN" while site is in ES; browser saves the file but the filename hint reflects the URL path, not the user's choice.
**Why it happens:** The `download` attribute without a value uses the URL's last path segment as the suggested name. Since `Harvard_CV_Kelly_Battistoni_EN.pdf` and `…_ES.pdf` already encode the language in the path, this works correctly — but only if the URL itself reflects the picked language.
**How to avoid:** The `cvHref` derives from the `cvLang` state, NOT from the active `i18n` language. The decision is locked: the EN/ES toggle is explicit, separate from the site language. Verify in browser that picking ES while site is in EN downloads the ES file.
**Warning signs:** QA reports "I downloaded ES but got EN" — usually means someone wired `cvHref` to `i18n.language` instead of local state.

### Pitfall 4: ParallaxCard Skip-on-Mobile Hides the Card Entirely
**What goes wrong:** Mobile users see empty card placeholders.
**Why it happens:** This is a misread of `ParallaxCard.tsx` (line 65): on mobile, parallax is SKIPPED, but layers still render at their default position (no transform applied). Content is still visible. If a layer's content depends on a transform to be in-bounds, mobile users see emptiness.
**How to avoid:** Layer content must be self-positioning. Don't rely on `speed: 0.2` to bring content into the visible card area — use it ONLY for depth drift. The card face content lives at speed `0` or in a static wrapper.
**Warning signs:** Mobile preview shows project cards but their text is missing or off-screen.

### Pitfall 5: RevealSection Stagger Falls Back to Single Reveal
**What goes wrong:** All section paragraphs/cards animate in together instead of one-by-one.
**Why it happens:** Memory file `feedback_revealsection_stagger.md` flags this: stagger requires DIRECT children of the `<RevealSection>` wrapper. Wrapping paragraphs in a `<div>` intermediate makes the div the sole "child" and stagger has nothing to iterate over.
**How to avoid:** Put `<p>`, `<h2>`, etc. directly inside `<RevealSection>` — no intermediate wrapper divs. If layout requires a wrapper, set `stagger={false}` on the outer reveal and add an inner `<RevealSection>` for the actual list.
**Warning signs:** Stack categories all fade in at once instead of staggered; About paragraphs don't sequence.

### Pitfall 6: Linkedin Placeholder Ships to Production
**What goes wrong:** The literal string `LINKEDIN_URL` ends up as the live link.
**Why it happens:** Phase 6 ships before the user supplies the real URL.
**How to avoid:** Treat `LINKEDIN_URL` as a deployment-blocking marker. The verification step for Phase 6 must check that `locales/{en,es}/contact.json` no longer contains the placeholder before allowing phase completion. Alternatively, the Phase 7 (Polish) verification list grows a "LinkedIn URL replaced" item.
**Warning signs:** `grep -r LINKEDIN_URL` returns hits after Phase 6 verification.

### Pitfall 7: NDA-Safe Copy Drafted in Vacuum
**What goes wrong:** The four project cards ship with generic "improved efficiency by 40%" copy that any reviewer flags as boilerplate.
**Why it happens:** Skipping the user-collaboration loop documented in the locked decision.
**How to avoid:** Treat the projects.json copy as a DRAFT in both EN and ES. The Phase 6 verification step is explicit: user reads each card in both languages and edits in browser-DevTools-style. Draft the cards using the known background (SEO/marketing agency domain + listed tool palette), keep outcomes concrete but unattributable (e.g., "cut lead-handoff latency from 18min to <2min" not "saved Client X $50k").
**Warning signs:** All four cards use identical metric formats; outcome metrics are all percentages; no domain-specific language.

### Pitfall 8: ScrollTrigger Cache Goes Stale After PDF Preload
**What goes wrong:** PillNav/MobileNav appears too early after the page has loaded the CV PDFs.
**Why it happens:** Unlikely — PDFs are downloaded only on click, not on page load. But if a planner adds a `<link rel="prefetch">` for the PDFs in `index.html`, the resulting layout shift could move ScrollTrigger anchors.
**How to avoid:** Do NOT preload the CV PDFs. They're click-driven downloads. `document.fonts.ready.then(() => ScrollTrigger.refresh())` already handles font-induced layout shifts; nothing else should shift.
**Warning signs:** Nav appears at the wrong scroll depth ONLY in production builds.

---

## Code Examples

Verified patterns from official sources and the existing codebase.

### Example A: `@icons-pack/react-simple-icons` Tree-Shaken Imports

```typescript
// Source: https://github.com/icons-pack/react-simple-icons (README)
// Verified: package.json has "sideEffects": false → tree-shakes
import { SiAirtable, SiSupabase, SiPython } from '@icons-pack/react-simple-icons'

function Example() {
  return (
    <>
      <SiAirtable size={32} color="currentColor" />
      <SiSupabase size={32} color="currentColor" />
      <SiPython size={32} color="currentColor" />
    </>
  )
}
```

Only the named imports land in the bundle. No `import * as Icons` — that defeats tree-shaking.

### Example B: Inline SVG from `public/` Without Color Loss

Vite supports `?raw` imports for inlining file content:

```typescript
// Source: https://vite.dev/guide/assets#importing-asset-as-string
import claudeSvg from '/icons/claude.svg?raw'

function ClaudeIcon({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-block', width: size, height: size, color: 'currentColor' }}
      dangerouslySetInnerHTML={{ __html: claudeSvg }}
    />
  )
}
```

**Caveat:** `dangerouslySetInnerHTML` for trusted bundled assets is safe (the SVG is part of your bundle). The `aria-hidden` + sibling text label keeps screen readers sane.

Alternative: convert the three SVGs to `.tsx` components at copy time (`StackClaude.tsx`, `StackN8n.tsx`, `StackMake.tsx`). Tradeoff: 3 extra files but pure-React composition with no innerHTML. **Recommend this** for stylistic consistency with the Simple Icons React components.

### Example C: CSS Dot-Grid Background with Tailwind v4

```html
<!-- Verified pattern from inspo.txt line 250 and ibelick.com -->
<section
  style="
    background-image: radial-gradient(circle, #333 1px, transparent 1px);
    background-size: 40px 40px;
  "
>
  <!-- content -->
</section>
```

Tailwind v4 arbitrary-value version:
```tsx
<section
  className="bg-[radial-gradient(circle,_#333_1px,_transparent_1px)] [background-size:40px_40px]"
>
```

For a section-bottomed-out fade (so the grid blends into the next section's background), add a mask:
```tsx
className="… [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
```

### Example D: Bilingual Paragraph Prose Schema

```json
// src/locales/en/about.json
{
  "title": "About",
  "paragraph1": "Some engineers chase the latest framework. I trace the system underneath — the moment a process breaks, the place where a tool stops earning its keep. Years inside SEO and marketing taught me that the work hiding behind dashboards is almost always more interesting than the dashboard itself.",
  "paragraph2": "What started as fixing other people's hand-stitched spreadsheets turned into building the automations that make those spreadsheets unnecessary. Make.com, n8n, Claude with MCP, a little Python where the no-code stops scaling — chosen each time for the shape of the problem, not the shape of the tool.",
  "paragraph3": "I think ahead on the business because every system has the same question underneath: what does this person actually need to stop doing tomorrow?"
}
```

```json
// src/locales/es/about.json — mirror structure
{
  "title": "Sobre mí",
  "paragraph1": "Hay ingenieras que persiguen el último framework. Yo sigo el sistema que está debajo …",
  "paragraph2": "Lo que empezó arreglando hojas de cálculo cosidas a mano …",
  "paragraph3": "Pienso adelantado al negocio porque todo sistema esconde la misma pregunta …"
}
```

(Draft EN copy above is a starting point for the planner — Claude writes the real draft, user iterates.)

### Example E: Projects JSON Schema

```json
// src/locales/en/projects.json — schema only; copy is draft territory
{
  "title": "Selected work",
  "labels": {
    "problem": "Problem",
    "solution": "Solution",
    "result": "Result"
  },
  "cards": {
    "project1": {
      "title": "Lead-handoff orchestration",
      "context": "Mid-sized SEO agency, marketing operations",
      "outcome": "Lead-to-sales latency cut from 18min to <2min, 24/7",
      "tech": ["Make.com", "n8n", "Airtable", "Notion"],
      "problem": "Inbound leads slipped between forms, CRMs, and inbox triage. The first-touch SLA was broken on 40% of nights and weekends.",
      "solution": "Single n8n pipeline normalized every inbound source, scored, routed, and posted to the rep's tool of choice — with a Claude-drafted opener.",
      "result": "First-touch SLA hit 99%. Inbox triage stopped being a job."
    },
    "project2": { … },
    "project3": { … },
    "project4": { … }
  }
}
```

### Example F: Tailwind v4 + CSS Variables for the Visual Accent

The visual accent on About should use the brand accent token, not a hex literal:

```tsx
// Using existing @theme tokens from src/styles/index.css
<span
  aria-hidden="true"
  style={{
    display: 'block',
    height: '1px',
    width: '3rem',
    background: 'var(--color-brand-accent)',
    marginBottom: '1.5rem',
  }}
/>
```

**Note** carried from STATE.md `[02-02]`: the accent color is still inline `#FF4500` in `Hero.tsx`. Phase 6 is the natural point to migrate to `var(--color-brand-accent)` — but that's a polish refactor; CONTEXT.md does NOT mandate it for this phase. Flag for Phase 7.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Web fonts via `<link rel="stylesheet">` blocking | Already done — Google Fonts with `display=swap` + `document.fonts.ready` refresh | Phase 1-3 (in this project) | No FOIT; ScrollTrigger anchors stay correct |
| Bundling all icons | Tree-shaken named imports (`sideEffects: false`) | Vite 4+ / @icons-pack/react-simple-icons v8+ | Single-icon bundle cost ≈ 1 KB gz |
| `react-icons` for everything | Per-domain registries (Simple Icons for brands, lucide-react for UI glyphs) | Mid-2024 community shift | Avoids 2MB+ bundle bloat; brand icons stay brand-accurate |
| `useEffect` + IntersectionObserver for reveals | `gsap` `ScrollTrigger` with `once: true` | This codebase Phase 3 | Single observer pattern, free `refresh()` after font load |
| Hand-built dropdowns / accordions | Native `<details>` / `aria-expanded`+`aria-controls` | WAI-ARIA 1.2+ | Accessibility-correct by construction |

**Deprecated/outdated:**
- **`react-icons/si` for Simple Icons specifically:** Still works but has historical tree-shaking gaps; the dedicated `@icons-pack/react-simple-icons` is the safer 2026 choice.
- **`iconify-icon` Web Component (as used in `inspo.txt`):** Works but adds a runtime fetch and a custom-element dependency. Inline SVG components are cheaper.
- **`returnObjects: true` for typed multi-paragraph rendering:** Functional but loses TypeScript inference under the project's `CustomTypeOptions` augmentation. Separate string keys are the modern TS-friendly approach.
- **Mailto JS form libraries (e.g., `react-mailchimp-form`):** Out of scope here, but worth flagging — the Phase 6 contact section is intentionally plain `<a>`. No form library should appear.

---

## Open Questions

1. **Should the dot-grid background extend behind Projects too?**
   - What we know: Locked decision restricts dot-grid to "projects and/or stack sections" (DESIGN-06). Stack will definitely get it. Projects is dealer's choice.
   - What's unclear: Will the parallax cards visually fight with the dot-grid texture beneath them?
   - Recommendation: Start with Stack-only. Plan a Phase 6 verification check that the planner can flip ON if the Projects section feels too flat without it. CONTEXT.md gives this discretion explicitly.

2. **Stack categorization: is "Languages" its own bucket or folded in?**
   - What we know: User asked for "Automation / AI / Infrastructure / Data (or equivalent grouping that fits the 13 tools cleanly)."
   - What's unclear: Python and JavaScript don't slot neatly into the four named categories. Folding them into "Infrastructure" reads as wrong; folding into "Data" reads as wrong.
   - Recommendation: Five categories — Automation (Make, n8n) / AI (Claude/MCP) / Infrastructure (Docker, Railway, GCP, GitHub) / Data (Supabase, Airtable, Notion, Apify) / Languages (Python, JS). The user said "or equivalent grouping" — taking that latitude is cleaner than a forced four-bucket scheme.

3. **About — does the closing paragraph end with a CTA?**
   - What we know: Claude's discretion. The Projects section is the next section down.
   - What's unclear: Is a "See selected work" sentence in About redundant with the Hero CTA (already "Check my projects")?
   - Recommendation: NO explicit CTA in About. The natural scroll-flow drops the user into Projects. About earns its prose by reading like a person, and a "click here" undermines that voice. The Hero CTA already invited them down.

4. **Project card outcome metric — single line or two-line callout?**
   - What we know: Cards carry "outcome metric" as a face-level field.
   - What's unclear: Whether the metric reads better as `t('outcome')` (one string) or split into `outcome.metric` + `outcome.label` for a card visual that separates the number from the description.
   - Recommendation: Single `outcome` string. The four cards' metrics will be heterogeneous (a percentage, a latency reduction, a count) and forcing a "number + label" template makes weak ones look weaker. The planner can revisit after seeing the four written outcomes side by side.

5. **Stack icons in dark mode — `currentColor` vs `filter: invert`?**
   - What we know: Static SVGs use `fill="currentColor"`. The Simple Icons React components also use `currentColor` by default.
   - What's unclear: Whether to inline the three static SVGs as `.tsx` components for full color control, or use `<img>` + `filter: invert(1)`.
   - Recommendation: Inline as `.tsx` for the three (`StackClaude.tsx`, `StackN8n.tsx`, `StackMake.tsx`). Match the React-component interface of the other 10 — `<StackIcon entry={…} />` becomes uniform. Slightly more code, much cleaner mental model.

6. **LinkedIn URL — should it be the same string in both EN and ES JSON files?**
   - What we know: URLs are language-agnostic; the user supplies one URL.
   - What's unclear: Whether duplicating `linkedin.url` in both locales is over-engineering vs. correct.
   - Recommendation: Yes, duplicate. Keeps the contact namespace symmetric across locales, costs nothing, and means swap-without-edit when the URL arrives. The `LINKEDIN_URL` placeholder string is identical in both files — easy `grep`-replace.

---

## Sources

### Primary (HIGH confidence)
- **Existing codebase** — `src/components/scroll/ParallaxCard.tsx`, `src/components/scroll/RevealSection.tsx`, `src/lib/gsap.ts`, `src/lib/i18n/index.ts`, `src/components/hero/Hero.tsx`, `src/hooks/useDeviceCapabilities.ts`, `src/@types/i18next.d.ts`, `src/styles/index.css`, `src/App.tsx`, `package.json`, `index.html`, `inspo.txt`
- **`@icons-pack/react-simple-icons` package.json** — verified version 13.14.0, React 19 peer, `sideEffects: false` (https://github.com/icons-pack/react-simple-icons/blob/main/package.json)
- **`@icons-pack/react-simple-icons` README** — usage pattern, naming convention (https://github.com/icons-pack/react-simple-icons)
- **Simple Icons slug registry** — verified slugs for Airtable, Supabase, Apify, Python, JavaScript, Docker, Notion, GitHub, Google Cloud, Anthropic (https://github.com/simple-icons/simple-icons/blob/develop/slugs.md)
- **Simple Icons issues** — n8n issue #9779 closed as not planned; #7993 also referenced (https://github.com/simple-icons/simple-icons/issues/9779)
- **`@lobehub/icons-static-svg` SVG availability** — verified claude.svg, n8n.svg, make.svg exist at unpkg, 24×24 viewBox, `fill="currentColor"` (https://app.unpkg.com/@lobehub/icons-static-svg@1.91.0/files/icons)
- **`@lobehub/icons` package.json** — hard peer deps on `@lobehub/ui` + `antd` confirmed (https://github.com/lobehub/lobe-icons/blob/master/package.json)
- **i18next `returnObjects` docs** — confirms typing tradeoff (https://www.i18next.com/translation-function/objects-and-arrays)
- **react-i18next Trans component docs** — confirms intra-paragraph emphasis pattern (https://react.i18next.com/latest/trans-component)
- **MDN — `rel="noopener"`** — confirms `target="_blank"` implies `noopener` in modern browsers (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener)
- **Vite static assets docs** — public/ path convention, `?raw` import (https://vite.dev/guide/assets)
- **Project memory** — `feedback_revealsection_stagger.md`, `feedback_parallaxcard_scrub.md`, `feedback_gsap_reverse_zero.md`, `feedback_pillnav_expansion.md` (carry-over rules from prior phases)
- **STATE.md** — Phase 5 decision log including locked tokens, accent color status, completed components

### Secondary (MEDIUM confidence)
- **ibelick.com — dot-grid backgrounds in Tailwind** — verified pattern matches `inspo.txt` line 250 (https://ibelick.com/blog/create-grid-and-dot-backgrounds-with-css-tailwind-css)
- **GeeksforGeeks — PDF download in React** — confirms `<a download>` is the standard (https://www.geeksforgeeks.org/reactjs/how-to-download-pdf-file-in-reactjs/)
- **VitePress asset handling** — confirms `public/` direct-reference rule (https://vitepress.dev/guide/asset-handling)
- **Bringing Brands to Life — @icons-pack/react-simple-icons guide** — usage examples corroborating README (https://www.oreateai.com/blog/bringing-brands-to-life-a-developers-guide-to-react-simple-icons/)

### Tertiary (LOW confidence — flag for validation)
- **Simple Icons issue #10974 (Claude request)** — page returned a loading error; conclusion that Claude is NOT in Simple Icons rests on absence-of-evidence. The `claude.svg` from `@lobehub/icons-static-svg` is the unambiguous fallback regardless. Validate during install: if `SiClaude` resolves cleanly from `@icons-pack/react-simple-icons`, prefer it.
- **Railway icon in Simple Icons** — slug `railway` IS in the slug registry, but the React component export name (`SiRailway`?) was not directly verified. Planner should confirm during install; static SVG fallback exists if not.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — single new install, version + tree-shaking verified against package.json
- Architecture: HIGH — all primitives reuse existing Phase 3-5 patterns; no new infrastructure
- Pitfalls: HIGH — five of eight pitfalls carry direct evidence from project memory files / prior phase summaries; remaining three are well-documented web platform issues
- Icon coverage: MEDIUM-HIGH — verified 10 of 13 in Simple Icons by slug; static SVGs for the remaining 3 confirmed live at unpkg. One ambiguity (`SiRailway` exported name) flagged for install-time check.
- Copy / NDA-safe drafting: LOW (intentionally) — research cannot produce final copy; the planner scopes the user-collaboration loop. Schemas and draft examples are provided.

**Research date:** 2026-06-13
**Valid until:** 2026-07-13 (30 days — icon packages and i18n libs are stable; Vite/Tailwind are stable; recheck only if package.json bumps a major)
