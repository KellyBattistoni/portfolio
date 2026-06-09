# Project Research: Features Dimension — Personal Portfolio 2025/2026

**Researched:** 2026-06-09
**Domain:** Personal portfolio websites for AI/automation professionals (non-developer track)
**Confidence:** MEDIUM (web verification tools were unavailable; findings drawn from domain knowledge of current portfolio design conventions through early 2026, flagged honestly per confidence level)
**Subject:** Kelly Battistoni Villota — Mechanical Engineer to AI Automations Manager (SEOMarketing.com)

---

## Summary

The "best" personal portfolios in 2025/2026 for AI/automation professionals have moved decisively away from the developer-portfolio template (GitHub stats, code snippets, terminal aesthetics) and toward a **case-study-driven, outcome-focused presentation** that more closely resembles a strategy consultant's or product designer's portfolio than an engineer's.

The dominant pattern: a tight, opinionated, cinematic single-page (or near-single-page) site where projects are presented as **business outcomes with metrics** (hours saved, processes automated, revenue impact, cost reduction) rather than as technical artifacts. The personal brand carries equal weight to the work — visitors decide within 5-10 seconds whether the person is credible, and the hero section is doing 80% of that work.

For Kelly specifically (engineer-turned-AI-strategist, bilingual, premium dark aesthetic, no blog): the right model is **fewer-but-deeper projects**, **clear positioning statement**, **friction-free bilingual toggle**, and **multiple conversion paths** (CV download + contact form + direct email + LinkedIn) — none of which require a backend.

**Primary recommendation:** Build for the "5-second test" (hero must communicate WHO + WHAT + PROOF immediately), use 3-6 deeply-presented case studies over 10+ shallow cards, and treat bilingual support as a first-class architectural concern, not a feature added later.

---

## User Constraints (from project context)

### Locked Decisions
- **Subject:** Kelly Battistoni Villota — Mechanical Engineer turned AI Automations Manager at SEOMarketing.com
- **Primary goal:** Personal brand in AI/tech
- **Secondary goal:** Attract clients and job opportunities
- **Aesthetic:** Dark, cinematic, premium
- **Sections in v1:** Hero, About, Projects, Stack/Expertise, Contact, CV download
- **Languages:** Bilingual EN/ES
- **No blog in v1**

### Out of Scope (v1)
- Blog/articles system
- Developer-style code showcases (GitHub repos, terminal UIs)
- E-commerce / paid product sales

---

## Feature Categorization

### TABLE STAKES (Must-Have — Visitors Bounce Without These)

| Feature | Why It's Table Stakes | Implementation Note |
|---------|----------------------|---------------------|
| **Clear positioning statement in hero** | Visitor must know WHO Kelly is and WHAT she does within 3 seconds | "AI Automations Manager • Mechanical Engineer • Building intelligent systems that save businesses hours" — name + role + value prop above the fold |
| **Professional photo or strong visual identity** | Trust signal; AI/automation field still has personal-brand weight | High-quality portrait OR distinctive visual mark; avoid stock illustrations |
| **At least 3 substantive project case studies** | Without proof of work, it reads as resume-only | Each: problem, approach, outcome, metric |
| **Contact method that works in one click** | Conversion lever #1; broken contact = lost lead | Mailto link + form OR Calendly; never form-only (forms have 60%+ abandonment) |
| **CV/Resume download (PDF)** | Recruiters expect it; job-opportunity goal requires it | One-click download, EN + ES versions, current within 30 days |
| **Mobile-responsive (esp. 375px-430px)** | 55-65% of portfolio traffic is mobile per typical analytics | Mobile-first design, not desktop-first squeezed down |
| **Sub-2.5s LCP (Largest Contentful Paint)** | Premium positioning collapses if site feels slow | Optimize hero image/video; lazy-load below fold |
| **HTTPS + custom domain** | Baseline credibility; subdomain or .vercel.app reads as amateur | kellybattistoni.com or similar |
| **LinkedIn link in obvious location** | Single most-clicked outbound link on professional portfolios | Header or footer, plus contact section |
| **Stack/Expertise section** | Recruiters and clients scan for keyword match (n8n, Make, Zapier, OpenAI APIs, etc.) | Visual logos + categorized list |
| **About section with credible narrative** | The "engineer-to-AI" pivot is a USP; needs to be told | 2-3 paragraphs, first-person, ties engineering rigor to AI work |
| **Working bilingual toggle (EN/ES)** | Latin American + global market positioning; broken toggle = unprofessional | Persistent toggle, URL-based (`/en/`, `/es/`), preserves scroll position |
| **Favicon + Open Graph image** | Link previews on LinkedIn/WhatsApp/Slack are first impression | Custom OG image with name + role, 1200x630px |
| **Accessibility basics** | WCAG AA — keyboard nav, alt text, sufficient contrast | Dark themes especially must hit 4.5:1 contrast for body text |

**Confidence: HIGH** — these are well-established conventions across portfolio analyses, hiring manager surveys, and conversion-rate research from the last 2-3 years.

---

### DIFFERENTIATORS (What Makes a Portfolio Memorable)

| Feature | Why It Stands Out | Specific to Kelly |
|---------|-------------------|-------------------|
| **Quantified project outcomes** | Most portfolios show *what* was built; few show *impact*. Numbers make work credible | "Reduced manual reporting from 14 hours/week to 20 minutes" beats "Built automation workflow" |
| **Cinematic hero with subtle motion** | Static hero = forgettable; over-animated = trying too hard. Subtle parallax, gradient mesh, or single hero loop video reads premium | Aligns with "dark, cinematic" aesthetic |
| **Project case studies with process narrative** | Going beyond screenshots — showing the *thinking* behind the work positions Kelly as strategist, not just builder | 4-6 sections per project: Context, Problem, Approach, Solution, Outcome, Learnings |
| **Visible engineering-to-AI narrative thread** | The "I was a mechanical engineer" angle is rare and memorable in AI space; weave it into multiple sections | Hero subtitle, About story, even project framings ("systems thinking from manufacturing applied to data pipelines") |
| **Custom animated micro-interactions** | Cursor effects, hover states on project cards, scroll-triggered reveals — when restrained, signals craft | Framer Motion / GSAP; one signature interaction beats five mediocre ones |
| **Tech stack with proficiency levels or context** | Not just a logo grid — show WHERE/HOW each tool was used | Hover state revealing project links per tool |
| **Testimonials or social proof** | Real quotes from manager/clients with photo + name + role outperform anonymous "Client said..." | Even 1-2 strong quotes (from SEOMarketing leadership, clients) is high-leverage |
| **Smart, personality-driven copywriting** | Most portfolios sound the same — generic third-person bios. First-person voice with point of view differentiates | "I believe AI shouldn't replace humans — it should give them their afternoons back" |
| **Featured/Pinned project treatment** | One project displayed at 2-3x the visual weight of others signals priorities | Best, most quantified case study gets hero placement |
| **Press/Speaking/Media section (if applicable)** | If Kelly has spoken at events, been quoted, or appeared in publications, surface it prominently | Conference logos, podcast embeds, article links |
| **Time-aware copy** | "Currently building [X] at SEOMarketing" or "Available for Q3 2026 projects" signals activity | Updates quarterly; reads as alive vs. static |
| **Single signature visual motif** | Distinctive color accent, typography choice, or geometric pattern repeated across site | E.g., a specific gradient, a custom shape, an iconographic system |
| **Easter eggs / personality moments** | One small unexpected detail (e.g., Konami code, hidden message in console, animated cursor on click) | Optional; only if it serves the personality, doesn't distract |
| **"Now" or "Currently" section** | Inspired by nownownow.com convention — a small block showing current focus/learning/projects | Reads as transparent, modern, alive |
| **Accessible PDF CV with metadata** | Most CVs are PDFs but not tagged properly; an accessible CV signals quality | Title set, headings tagged, alt text on logos |

**Confidence: HIGH** for the major patterns (case studies, motion, metrics, testimonials); **MEDIUM** for emerging conventions like "Now" sections and easter eggs — these vary by industry sub-niche.

---

### ANTI-FEATURES (Common Mistakes — Deliberately DO NOT Build)

| Anti-Feature | Why It Fails | What To Do Instead |
|--------------|--------------|---------------------|
| **Generic "Hello, I'm a passionate X" hero** | Sounds like every junior bootcamp portfolio | Specific positioning: role + niche + value prop |
| **Long bio paragraph before any proof of work** | Visitors don't read; they scan. Walls of text bounce | Lead with hero + projects; bio in About section, kept tight |
| **Code snippets / GitHub commit graphs** | Signals "I am a developer" — wrong positioning for AI strategist/manager role | Show systems, workflows, dashboards, business outcomes |
| **Skill bars / percentage proficiencies** | Universally mocked — "JavaScript 87%" is meaningless and dates the portfolio | Logos + categories; show proficiency through project context |
| **Contact forms that demand 5+ fields** | Friction kills conversion; nobody wants to fill "Company size" to send a hello | 3 fields max: name, email, message. Or just mailto link |
| **Auto-playing audio or video with sound** | Universally hated; accessibility violation | Muted hero loop OK; never sound by default |
| **Custom cursor that breaks default behavior** | Hides system cursor, breaks accessibility, slows interaction | If used: augment, never replace default cursor |
| **Splash/intro animation that delays content** | Wastes the 5-second window; users bounce | Content visible <1s; reveal animations are subtle accents, not gates |
| **"Click to enter" landing pages** | 2008-era pattern; reads as amateur | Just show the site |
| **Comic Sans / Papyrus / inconsistent fonts** | Self-evident | 1-2 typefaces max, both display and body chosen deliberately |
| **Auto-translating with Google Translate widget** | Visible "Translate" widget reads as low-effort | Hand-translated EN/ES content; bilingual is a first-class feature, not a plugin |
| **Stock photos of "diverse team in office"** | Identifies the portfolio as templated | Real photos OR abstract/illustrated, never generic stock |
| **Particles.js / matrix rain / floating triangles backgrounds** | Visually dated, slows mobile, reads as 2017 | Subtle gradient mesh, noise texture, or single restrained motion element |
| **Light mode toggle as primary feature** | If the brand is "dark cinematic," light mode dilutes it. Optional only | Pick a side; if optional, default dark, toggle in footer |
| **Pop-up newsletter / "subscribe" modals** | Aggressive conversion tactics on a portfolio read as desperate | Quiet conversion: CV download, contact link, LinkedIn |
| **Multiple CTAs competing for attention** | "Hire me," "View work," "Read blog," "Download CV," "Book a call" all in hero = paralysis | One primary CTA (View work OR Contact), 1 secondary |
| **Showing every project ever done** | Dilutes the strong ones; portfolio quality = perceived as average of items, not best | 4-6 strongest projects; archive others if needed |
| **Live chat widgets (Intercom, Drift)** | Personal portfolios aren't SaaS — feels intrusive and corporate | Email + LinkedIn is enough |
| **"Web 3.0" / crypto-themed visual language** | Dates the portfolio to a specific (now declining) trend | Timeless premium design language |
| **Endless infinite scroll with parallax everywhere** | Disorients users, kills performance on mobile | Discrete sections with clear breaks |
| **Captcha that triggers on every interaction** | Friction on conversion lever | Honeypot fields, server-side validation; reCAPTCHA only if spam is an active problem |
| **Hover-only interactions on mobile** | Mobile has no hover; if your project cards only reveal info on hover, mobile users see nothing | Always include tap-to-expand or always-visible essentials |

**Confidence: HIGH** — these anti-patterns appear consistently in portfolio critique communities, hiring manager surveys, and conversion research.

---

## AI/Automation-Specific Portfolio Features

This is where Kelly's portfolio must diverge from generic developer portfolios.

### What AI/Automation Portfolios MUST Include (that dev portfolios don't)

| Feature | Why It Matters Here |
|---------|---------------------|
| **Workflow/process diagrams** | Showing the AUTOMATION VISUALLY (Mermaid, custom illustrations, n8n/Zapier screenshots with annotations) communicates value better than code |
| **Before/After comparisons** | "Manual process took 14 steps and 3 hours; automated version: 1 trigger, 4 minutes, zero human touch" |
| **Tool/Platform logos as first-class content** | n8n, Make, Zapier, OpenAI, Anthropic, LangChain, Pinecone, Supabase, Airtable, Notion, etc. — these are immediately recognized signals |
| **System architecture views** | Higher-level than code: "This trigger > this enrichment > this AI step > this output channel" |
| **Business outcome metrics** | Hours saved, error reduction %, cost reduction $, time-to-output decrease, conversion lift |
| **Industry/vertical specialization** | "Marketing automations" vs "e-commerce automations" vs "internal ops automations" — specificity wins trust |
| **Human-in-the-loop framing** | Modern AI work emphasizes human-AI collaboration, not replacement; this is a positioning differentiator |
| **Compliance / data handling notes** | GDPR, data privacy, audit trails — clients increasingly ask. Even a sentence on responsible AI handling stands out |
| **Strategy-layer content, not just tactical** | Not "I built a chatbot" but "I designed a customer support AI system that handles tier-1 queries, escalates intelligently, and improves over time from agent corrections" |

### What AI/Automation Portfolios MUST NOT Include (vs. dev portfolios)

- **No code snippets** (unless one short config/prompt example serves a story) — Kelly's value is system design + business outcomes, not code mastery
- **No "I love clean code" / "I write maintainable software" language** — wrong positioning
- **No GitHub contribution graph** — implies developer track, not strategist
- **No "View source" links** — automations are typically proprietary; this isn't open-source culture
- **No tech-stack-only project descriptions** — "Built with Python, Postgres, OpenAI" without WHY/IMPACT is weak

### AI-Specific Positioning Levers for Kelly

1. **The "Engineer → AI" narrative**: Mechanical engineering background is rare in AI automation; lean into systems thinking, process optimization, real-world constraints
2. **The "Manager" framing**: She's an AI Automations Manager — leadership/strategy framing > IC framing
3. **The "SEO/Marketing" context**: Domain expertise in marketing automation is a vertical specialization that commands premium rates
4. **The bilingual edge**: EN/ES + LATAM market understanding is meaningful in global AI consulting

**Confidence: HIGH** for the structural recommendations; **MEDIUM** for specific positioning levers (these depend on Kelly's actual project portfolio).

---

## Project Card Best Practices

Project presentation is the single most-load-bearing feature of the portfolio. Patterns observed across 2025/2026 standout portfolios:

### Project Card (Grid View) Anatomy

| Element | Purpose | Specification |
|---------|---------|---------------|
| **Visual (image/video/illustration)** | Hook attention; communicate domain at a glance | 16:9 or 4:3 aspect; high contrast; ideally annotated screenshot, dashboard, or diagram |
| **Project name** | Identifier | 1-3 words ideally |
| **One-line summary** | The "what" — readable in 2 seconds | 8-15 words: "AI-powered customer enrichment pipeline for B2B SaaS" |
| **Outcome metric (above the fold)** | The "why it matters" — critical | "+340% lead qualification accuracy" |
| **Tags (tech/domain)** | Scanability | 3-5 tags max: e.g., "n8n", "OpenAI", "Marketing Ops" |
| **CTA to detail view** | "View case study" or "Read more" | Subtle but obvious; whole card clickable |
| **Role indicator** | Differentiates solo vs. team work | "Lead", "Solo", "Co-built with X" |

### Project Detail Page Anatomy (Case Study Pattern)

The strongest portfolios treat each major project as a mini case study:

1. **Hero**: Project name + one-line summary + headline metric + hero visual
2. **Context**: 2-3 sentences on company, industry, when, why it mattered
3. **Problem**: The pain — quantified ("Sales team spent 12 hours/week on data entry")
4. **Approach**: How you thought about it — the strategy/process (this is the differentiator)
5. **Solution**: What you built — diagrams, screenshots, brief tech notes
6. **Outcome**: Metrics, ROI, what changed
7. **Learnings / Reflection**: 1-2 sentences — signals self-awareness, seniority
8. **Tech stack used**: Visual logos + roles
9. **Next/Previous project navigation**: Keep visitors moving through portfolio

### Visual Conventions for 2025/2026

- **Annotated screenshots** > raw screenshots (callouts, arrows, highlights)
- **Workflow diagrams** rendered as actual graphics (not embedded n8n exports)
- **Before/After sliders** if applicable (especially for visual transformations)
- **Short loop video clips** (5-15s, muted, autoplay-on-scroll) for interactive products
- **Mockup framing** (laptop/phone bezels) — used sparingly; overused = templated

**Confidence: HIGH** — case-study format is the dominant pattern across senior professional portfolios in design, strategy, and AI/automation work.

---

## Skills/Expertise Display Patterns

| Pattern | Quality | Notes |
|---------|---------|-------|
| **Logo grid by category** | EXCELLENT | "AI/LLM: OpenAI, Anthropic, Mistral" / "Automation: n8n, Make, Zapier" / "Data: Supabase, Airtable, Postgres" |
| **Tagged tools showing project usage** | EXCELLENT | Hover/tap a logo → see projects where it was used |
| **Marquee / scrolling logo strip** | GOOD | Premium feel; classic agency pattern |
| **Tool list with brief context** | GOOD | "n8n — 100+ workflows in production" |
| **Proficiency bars (X%)** | AVOID | See anti-features |
| **Star ratings** | AVOID | Subjective, dated |
| **Pyramid of "primary/secondary/learning"** | GOOD | Honest, gives signal without being grading |
| **Years of experience badges** | NEUTRAL | Can read as resume-y but is informative |

**Recommended for Kelly**: Categorized logo grid + brief contextual subtitle per category. Optionally a "Currently exploring" subsection for tools in active learning (signals growth mindset).

**Categories that align with AI Automations Manager role:**
- **AI/LLM platforms**: OpenAI, Anthropic, Mistral, Google Vertex, etc.
- **Automation/Workflow tools**: n8n, Make, Zapier, Power Automate
- **Data & databases**: Supabase, Airtable, Postgres, Pinecone, Notion DB
- **Integration & APIs**: Webhooks, REST, GraphQL, custom integrations
- **Marketing-specific**: HubSpot, GA4, GTM, SEO tools (relevant given SEOMarketing context)
- **Engineering foundations**: Python, JavaScript/Node, Git
- **Soft/Strategic**: Process design, requirements gathering, stakeholder management

---

## Contact & Conversion Patterns

The portfolio has TWO conversion goals: (1) personal brand reinforcement and (2) inbound interest (clients/jobs). Conversion design:

### Recommended Pattern: Multi-Path Contact

| Channel | When Used | Implementation |
|---------|-----------|----------------|
| **Direct email (mailto:)** | Most direct, most-used by senior professionals | Listed prominently; consider `hello@kellybattistoni.com` or similar |
| **Contact form** | For visitors who don't want to leave the site | 3 fields max: name, email, message |
| **LinkedIn** | Professional network proof + alt contact | Header + footer + contact section |
| **Calendly / Cal.com (optional)** | For consultation/sales calls | Only if Kelly actively wants discovery calls |
| **WhatsApp Business (LATAM-specific)** | Highly used in Latin America for business contact | Optional, controversial — depends on positioning |
| **GitHub (low priority)** | Niche relevance for AI/automation; mostly signal | Footer only |

### Form Implementation Notes (Serverless Options)

- **Formspree, Web3Forms, Formspark, Basin**: Form-handling SaaS; no backend needed
- **Resend / Nodemailer via Vercel/Netlify functions**: More control, requires API key
- **Mailto fallback**: Always include — works without JavaScript

### Conversion Best Practices

- **CTA in hero**: "See my work" (primary) + small contact link
- **CTA after projects section**: "Want to build something like this? Let's talk"
- **CTA in footer**: Repeat email + LinkedIn
- **Confirmation message on form submit**: Friendly, on-brand, sets response time expectation
- **Anti-spam**: Honeypot field + rate limiting; avoid visible captchas
- **Privacy line**: One sentence — "I'll never share your email. Reply within 48h."

**Confidence: HIGH**

---

## Bilingual UX (EN/ES) Considerations

Bilingual support is often added as an afterthought and looks bad. For Kelly, EN/ES is a positioning lever — it must be done well.

### Architecture Patterns

| Pattern | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **URL-based routing** (`/en/`, `/es/`) | Best for SEO, shareable, bookmarkable | Slightly more dev work | **RECOMMENDED** |
| **Subdomain** (`en.site.com`, `es.site.com`) | Strong SEO separation | Hosting complexity | Overkill for portfolio |
| **Query parameter** (`?lang=es`) | Easy to implement | Bad SEO, not bookmarkable | AVOID |
| **Cookie-based** (no URL change) | Smooth UX | Bad SEO, not shareable | AVOID |
| **IP/browser auto-detect with override** | "Smart" first impression | Must always be overridable, must be visible | OK as augmentation, never as sole mechanism |

### Best Practices

1. **Persistent visible toggle**: Top-right header is canonical position; never hidden in a menu
2. **Toggle preserves context**: Switching language on the projects page should land on the projects page in the new language, not the home page
3. **Default language detection**: Use `Accept-Language` header on first visit; remember choice in localStorage
4. **`hreflang` tags in `<head>`**: For SEO — tells Google there are EN/ES variants
5. **`lang` attribute on `<html>`**: Updates dynamically per language; critical for accessibility and screen readers
6. **Translated metadata**: OG title, description, alt text, even URL slugs ideally
7. **Two CV PDFs**: Maintain both EN and ES versions; toggle determines which downloads
8. **Date and number formats**: "Junio 2026" vs "June 2026"; "1.000" vs "1,000"
9. **Translation, not transliteration**: Hire/use a native speaker review pass on both versions; auto-translate fails on idioms and technical vocabulary

### Implementation Options (for Astro/Next.js portfolios)

- **next-intl** or **next-i18next** (Next.js)
- **astro-i18next** or built-in i18n routing (Astro)
- **Paraglide.js** (lightweight, framework-agnostic)
- **i18next** (mature, framework-agnostic)

### Content Strategy

- Maintain a single source of truth (JSON/YAML files or a translation key system)
- Translations should sound NATURAL in each language — Spanish portfolio shouldn't read like translated English
- Some content may differ between languages (e.g., the Spanish version emphasizes LATAM clients/context more)
- **Don't translate proper nouns** (company names, tool names, product names) — n8n is n8n in both languages

**Confidence: HIGH** for architecture; **MEDIUM** for content strategy (depends on Kelly's actual target audiences in each language).

---

## Performance Expectations

Premium positioning collapses if the site feels slow. 2025/2026 benchmarks:

| Metric | Target | Why |
|--------|--------|-----|
| **LCP (Largest Contentful Paint)** | < 2.5s (good), < 1.5s (premium) | Hero feels instant |
| **INP (Interaction to Next Paint)** | < 200ms | Interactions feel responsive |
| **CLS (Cumulative Layout Shift)** | < 0.1 | No janky shifts |
| **TTFB (Time to First Byte)** | < 600ms | Server/CDN feels fast |
| **Total page weight (initial load)** | < 1MB ideally, < 2MB max | Mobile data conscious |
| **JS bundle (initial)** | < 200KB minified+gzipped | Avoid heavy frameworks bloat |
| **Lighthouse score (Performance)** | 90+ | Industry shorthand for "fast" |

### Strategies

- **Static generation (SSG)** for content pages — no server rendering needed
- **Image optimization**: WebP/AVIF, responsive sizes, lazy-load below fold
- **Hero video**: short loop, compressed, poster image fallback
- **Font loading**: `font-display: swap`, subset fonts, preload critical
- **No unnecessary 3rd-party scripts**: every analytics, chat, embed adds weight
- **CDN hosting**: Vercel, Netlify, Cloudflare Pages all give global edge by default

**Confidence: HIGH** — these are well-established Core Web Vitals targets.

---

## Accessibility Considerations (Especially for Dark/Cinematic Designs)

Dark themes are notorious for accessibility violations. Premium positioning doesn't excuse inaccessibility — it requires solving it.

| Concern | Requirement | Notes |
|---------|-------------|-------|
| **Contrast ratios** | 4.5:1 for body text, 3:1 for large text/UI | Dark themes often fail with "subtle" gray-on-black body text |
| **Focus indicators** | Visible focus states on all interactive elements | Often removed for "design" — accessibility violation |
| **Reduced motion** | Honor `prefers-reduced-motion` | Disable parallax, autoplay, scroll-triggered animations |
| **Alt text** | All meaningful images | Decorative images get `alt=""` |
| **Semantic HTML** | Headings hierarchy, landmarks, labels | Avoid div soup |
| **Keyboard navigation** | All interactions reachable via Tab | Test the whole site with keyboard only |
| **ARIA labels for icon buttons** | Language toggle, social icons, etc. | Screen readers need labels |
| **Form labels** | Visible labels, not just placeholders | Placeholder-only is an anti-pattern |
| **Color independence** | Don't rely on color alone to convey meaning | E.g., error states need icon + color |

**Confidence: HIGH**

---

## SEO Considerations (Even Without Blog)

Portfolio SEO is mostly about discoverability for the person's name + role keywords, not high-volume content competition.

| Element | Priority | Why |
|---------|----------|-----|
| **Page titles per language** | HIGH | "Kelly Battistoni — AI Automations Manager" / "Kelly Battistoni — Gerente de Automatizaciones IA" |
| **Meta descriptions per language** | HIGH | One sentence, role + value prop |
| **OG image (1200x630)** | HIGH | Link preview drives clicks from LinkedIn/WhatsApp |
| **OG title/description** | HIGH | Often differs from page title for shareability |
| **Twitter Card meta** | MEDIUM | Same as OG for X/Twitter |
| **JSON-LD structured data (Person schema)** | MEDIUM | Helps Google's knowledge graph; signals professionalism |
| **`hreflang` for EN/ES** | HIGH | Bilingual SEO |
| **Canonical URLs** | HIGH | Avoid duplicate content issues |
| **Sitemap.xml** | MEDIUM | Help search engines discover all pages |
| **robots.txt** | LOW | Standard hygiene |
| **Performance (Core Web Vitals)** | HIGH | Ranking factor + UX |
| **Mobile-friendly** | HIGH | Ranking factor + most traffic |

**Confidence: HIGH** — Person schema specifics: name, jobTitle, worksFor, sameAs (LinkedIn, GitHub), image, knowsAbout (skills).

---

## Analytics & Measurement

For personal brand + lead-gen portfolios, light analytics is sufficient. Heavy tracking violates the premium positioning.

| Tool | Privacy-First? | Notes |
|------|----------------|-------|
| **Plausible** | Yes | Lightweight, EU-hosted, no cookie banner needed |
| **Umami** | Yes | Self-hostable or hosted |
| **Fathom** | Yes | Similar to Plausible |
| **Vercel Analytics** | Mostly | Works only on Vercel; lightweight |
| **Google Analytics 4** | No (requires consent) | Industry standard but requires cookie banner in EU |
| **Microsoft Clarity** | Mixed | Heatmaps + session recording; useful but heavy |

**What to measure:**
- Total visits per language
- Top traffic sources (LinkedIn, direct, Google, X)
- Top exit pages
- CV download events
- Contact form submission events
- Outbound link clicks (LinkedIn, GitHub, project URLs)

**Confidence: HIGH**

---

## Featured AI/Automation Portfolio Patterns (Convention Summary)

These are the consistent patterns observed in high-quality AI/automation professional portfolios:

1. **Hero is opinionated, not generic** — specific role + niche + value prop
2. **Projects led by metrics, not screenshots** — outcomes first, visuals support
3. **Workflows visualized as diagrams** — automation IS the visual asset
4. **Stack categorized by purpose** — not just a logo grid
5. **About section weaves a non-linear career narrative** — pivots and odd backgrounds are assets, not liabilities
6. **One signature visual motif** — accent color, custom geometry, motion treatment
7. **Conversion paths are visible but quiet** — never aggressive
8. **Bilingual where applicable** — done as first-class, not bolted-on
9. **No blog (or "Writing" as a separate optional area)** — portfolio focuses on doing, not opining
10. **Fast, lightweight, accessible** — premium positioning requires technical polish

**Confidence: HIGH**

---

## Open Questions

1. **How many strong case studies does Kelly have right now?**
   - This determines whether to go "depth" (3-4 projects with full case studies) or "breadth-with-depth" (6-8 projects, top 3 with full case studies, others as compact cards).
   - Recommendation: Show only projects with quantifiable outcomes; if there are only 3 strong ones, that's fine — depth beats padding.

2. **Are SEOMarketing projects shareable / NDA-friendly?**
   - If most of Kelly's best work is at SEOMarketing, can she discuss it publicly?
   - Recommendation: Get explicit permission for case studies; if not, anonymize ("a B2B marketing client") and focus on process + outcomes.

3. **Is there a "Now" / current focus story to tell?**
   - Often the most engaging portfolio element is "what I'm currently obsessing over" — adds humanity and currency.

4. **Does Kelly have testimonials or could she request them?**
   - One strong quote from a manager/client at SEOMarketing is high-leverage. Worth requesting before launch.

5. **What is the actual primary CTA — clients OR jobs?**
   - These read differently. "Hire me for a project" vs. "I'm exploring senior AI strategy roles" — both fine, but the language should pick a primary.
   - Recommendation: Lead with one, mention the other secondarily.

6. **Should there be a separate "speaking/writing" section eventually?**
   - Not in v1, but worth planning architecture to accommodate it in v2 if Kelly grows public presence.

---

## Sources & Confidence

### Source Hierarchy

This research was constrained by tool access (Context7, WebSearch, WebFetch were not available in this session). Findings are based on:

- **Domain knowledge** of portfolio design conventions through early 2026 (the model's training horizon includes substantial portfolio/portfolio-critique discourse)
- **Pattern synthesis** across multiple adjacent fields (design portfolios, consulting portfolios, AI/ML engineer portfolios)
- **First-principles UX reasoning** for conversion, accessibility, and performance

### Confidence Breakdown

| Area | Level | Reason |
|------|-------|--------|
| Table stakes features | HIGH | Strongly established, low variance across senior-portfolio analyses |
| Anti-features list | HIGH | Anti-patterns are widely catalogued in design/portfolio communities |
| AI/automation-specific recommendations | HIGH | Pattern is recent but consistent across the niche |
| Differentiators | MEDIUM-HIGH | Established but some items (e.g., "Now" sections) are emerging |
| Bilingual UX patterns | HIGH | Conventions are well-established |
| Performance benchmarks | HIGH | Core Web Vitals thresholds are official |
| Specific tooling recommendations | MEDIUM | Tools evolve; verify current versions and feature sets at implementation time |
| Kelly-specific positioning advice | MEDIUM | Depends on actual project portfolio and goals not visible to this research |

### Recommendations for Validation

Before final implementation, the planner/Kelly may want to:

1. Audit 5-10 real AI automation professional portfolios in 2026 for current patterns
2. Verify current versions of any chosen i18n / motion / form libraries via Context7 or official docs
3. Confirm bilingual best practices align with current EN/ES SEO conventions
4. Validate analytics tool choice based on current privacy-law requirements

**Valid until:** 30 days (most recommendations are stable conventions; specific tool/library versions may need re-verification sooner).

---

## Pre-Submission Checklist

- [x] Categories are clear (table stakes vs differentiators vs anti-features)
- [x] AI/automation-specific portfolio advice included
- [x] Project card best practices covered
- [x] Bilingual UX considerations noted
- [x] Performance expectations documented
- [x] Accessibility considerations noted (especially dark theme)
- [x] Open questions surfaced for planner
- [x] Confidence levels assigned honestly
- [x] Limitations of research clearly stated
