# The Nilgiri Root — Technical Documentation

React 18 · TypeScript · Vite 5 · Tailwind 3 · Framer Motion · Supabase

---

## Contents

1. [Build pipeline](#build-pipeline)
2. [Design system](#design-system)
3. [Motion specification](#motion-specification)
4. [Information architecture](#information-architecture)
5. [SEO](#seo)
6. [Media pipeline](#media-pipeline)
7. [Accessibility](#accessibility)
8. [Testing](#testing)
9. [Security](#security)

---

## Build pipeline

```
npm run dev        Vite dev server on :8080
npm run build      sitemap -> vite build -> prerender   (the deployable build)
npm run build:fast vite build only — no sitemap, no prerender (local checks)
npm run typecheck  tsc --noEmit
npm run lint       eslint
npm run test       vitest
```

`npm run build` runs three stages in order. All three must pass; the prerender
step exits non-zero if any route fails, because a half-prerendered deploy looks
fine to a human and broken to a crawler.

| Stage | Script | What it does |
|---|---|---|
| 1 | `scripts/generate-sitemap.mjs` | Writes `public/sitemap.xml` from the route manifest + Supabase blog posts |
| 2 | `vite build` | Bundles to `dist/` |
| 3 | `scripts/prerender.mjs` | Renders each route with headless Chrome, writes real HTML |

### Route manifest

`src/data/routes.ts` is the single source of truth for which URLs exist. Three
consumers read it: the router (`AnimatedRoutes.tsx`), the prerenderer, and the
sitemap generator. Adding a page means editing this one file.

Blog URLs are *not* in the manifest — they live in Supabase and are fetched at
build time.

---

## Design system

### Colour

Tokens live in `src/index.css` as HSL triples and are surfaced through Tailwind
in `tailwind.config.ts`. Every colour in the app resolves through a token —
never a literal — so light and dark stay in step.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | `100 10% 96%` | `140 25% 10%` | Page ground |
| `--foreground` | `150 25% 15%` | `40 10% 96%` | Body text |
| `--primary` | `146 28% 29%` | `146 28% 35%` | Primary surfaces |
| `--accent` | `120 61% 27%` | `145 35% 48%` | CTAs, links, eyebrow labels |
| `--muted-foreground` | `150 8% 40%` | `140 5% 60%` | Secondary text |
| `--forest` / `--golden` / `--earth` | — | — | Brand decoratives |

**Contrast is a hard constraint, not a preference.** The light-mode accent sits
at 27% lightness specifically to clear WCAG 2.1 AA in both roles it plays:

| Pairing | Ratio | Requirement |
|---|---|---|
| Accent text on background | 5.80:1 | 4.5:1 |
| White on accent (buttons) | 6.29:1 | 4.5:1 |
| Body text on background | 12.86:1 | 4.5:1 |
| Muted text on background | 4.96:1 | 4.5:1 |
| Accent on background (dark) | 5.59:1 | 4.5:1 |

If you change `--accent`, re-verify both the text and the button-fill ratio.
Lightening it past roughly 29% breaks the button pairing first.

### Typography

Playfair Display for headings (`font-display`), Inter for everything else
(`font-body`). Loaded non-blocking from Google Fonts with `display=swap`.

Tailwind's built-in scale is the base. Two extensions fill real gaps:

| Token | Value | Use |
|---|---|---|
| `text-2xs` | 11px / 1rem, +0.02em | The single smallest step — uppercase eyebrow labels, metadata, legal |
| `text-fluid-display` | `clamp(2.25rem, 8vw, 6rem)` | Hero wordmark |
| `text-fluid-h1` | `clamp(2rem, 5vw, 3.75rem)` | Page titles |
| `text-fluid-h2` | `clamp(1.75rem, 3.5vw, 3rem)` | Section titles |

`text-2xs` replaced an ad-hoc mix of `text-[10px]` and `text-[11px]` (28 uses
across 11 files). One step, not two — and 10px was below comfortable reading
size for the labels using it. **Do not add arbitrary `text-[Npx]` values.**

### Spacing

Tailwind's default rem scale, plus four viewport-relative tokens for the
scroll-driven layouts (these pace *scroll*, not content, so they can't come from
a rem scale):

`h-hero-scroll` 180vh · `space-y-stage-gap` 55vh · `space-y-stage-gap-lg` 60vh · `min-h-stage-min` 40vh

### Components

`src/components/ui/` is shadcn/ui — treat as vendored; prefer composition over
editing. Application components:

| Component | Responsibility |
|---|---|
| `Navbar` | Grouped nav, scroll-reactive chrome, quote CTA |
| `Footer` | Sitemap links, contact, newsletter, SEO landing links |
| `SEOHead` | Per-route meta, OG, Twitter, canonical, JSON-LD |
| `ScrollStage` | Scroll-triggered entrance wrapper |
| `StageVideo` | Poster-first looping process clip, plays on visibility |
| `OptimizedImage` | Responsive WebP `<picture>` with blur-up |
| `RfqDialog` / `InlineRfqForm` | Quote capture (modal / embedded) |
| `NewsletterForm` | Email capture |
| `PageTransition` | Route cross-fade |
| `ErrorBoundary` | App-wide crash recovery |

**Focus states.** shadcn primitives ship their own `focus-visible` ring. Any
hand-rolled interactive element written as a bare `<a>`/`<Link>` with utility
classes **must** carry the shared `.focus-ring` utility (defined in
`index.css`), or keyboard users lose the indicator entirely.

---

## Motion specification

All motion animates `transform` and `opacity` only — both composited, neither
triggering layout or paint. Nothing animates `width`, `height`, `top`, `left`,
or `box-shadow`.

| Interaction | Duration | Easing | Trigger |
|---|---|---|---|
| Scroll entrance (`ScrollStage`) | 320ms | `cubic-bezier(0.16, 1, 0.3, 1)` | IntersectionObserver @ 0.15 |
| Route transition | 260ms in / 200ms out | ease-out-expo / linear | Route change |
| Button hover | 240ms | ease-out-expo | Pointer |
| Button press | 240ms, `scale(0.98)` | ease-out-expo | Active |
| Navbar chrome | 500ms | ease-out | Scroll past threshold |
| Navbar logo | 500ms, `scale(0.714)` | ease-out | Scroll past threshold |
| Stat counters | 1600ms | ease-out-cubic | IntersectionObserver @ 0.3 |
| Brand intro | ≤600ms, once per session | ease-out-expo | First visit |

Theme tokens: `duration-quick` 180ms · `duration-base` 240ms ·
`duration-reveal` 320ms · `ease-out-expo`.

### Rules

- **0.2–0.4s for state changes.** Longer reads as sluggish; on a fast scroll,
  sections finish revealing after the user has passed them.
- **Stagger caps at 240ms** (`ScrollStage` `MAX_DELAY`) regardless of index, so
  long lists don't leave the last item waiting seconds.
- **`will-change` only while hidden.** `ScrollStage` drops it after reveal
  rather than leaving dozens of promoted layers alive.
- **Never `transition-all`.** Name the properties.
- **`prefers-reduced-motion` is honoured structurally, not cosmetically.**
  Components return their static variant — `ScrollStage` renders revealed with
  no transition, `PageTransition` returns a bare fragment, `LoadingScreen`
  returns `null`, the hero skips parallax, `ScrollStory` renders stills. The
  global CSS override in `index.css` is a backstop, not the mechanism.
- **Mobile skips expensive motion** independently of reduced-motion: the hero
  drops parallax and springs below 768px.

---

## Information architecture

Four grouped nav items plus the quote CTA:

```
Products   → Our Fries (/products) · Solutions (/solutions)
Why Us     → Our Process (/process) · Certificates (/certificates) · About Us (/about)
Resources  → Blog (/blog) · FAQ (/faq)
Contact    → /contact
[Request Quote]  — modal, appears once scrolled past the hero
```

This replaced nine flat top-level items. Every original destination is still one
or two clicks away; nothing was removed. Mobile shows all of them, grouped under
headings, in the sheet.

---

## SEO

### Prerendering

Every route in the manifest ships as real HTML. Googlebot renders JavaScript,
but Bing, LinkedIn, WhatsApp, Twitter and the AI crawlers do not — before
prerendering they saw the homepage's static tags on all 28 URLs.

`scripts/prerender.mjs` serves `dist/`, walks each route with headless Chrome,
waits for React to mount and `SEOHead` to write its meta, then saves the DOM as
`dist/<route>/index.html`. The SPA still hydrates on load; runtime behaviour is
unchanged.

Verify a route after building:

```bash
grep -o '<meta property="og:title"[^>]*' dist/frozen-french-fries-9mm/index.html
```

### Meta

`SEOHead` sets title, description, keywords, canonical, Open Graph, Twitter
Card and optional per-page JSON-LD. Pass `noIndex` on any page that must not be
indexed — `/admin`, `/auth`, the 404, and the blog not-found state. **This
matters more than it looks:** the SPA answers every URL with HTTP 200, so
without `noIndex` a dead link becomes an indexable soft 404.

`og:image` defaults to `https://www.thenilgiriroot.com/og-image.jpg` (1200×630).
Relative `ogImage` values are resolved against the site URL.

### Structured data

Global, in `index.html`: Organization, LocalBusiness, WebSite, FAQPage,
Product, BreadcrumbList. Per-page via `SEOHead`'s `jsonLd` prop: Article
(blog posts), ItemList (products), ContactPage, AboutPage, plus a full graph on
each landing page.

### Sitemap

Generated by `scripts/generate-sitemap.mjs` — static routes from the manifest,
blog posts from the `blog_posts` table. If Supabase is unreachable it keeps the
blog URLs already in the committed sitemap rather than silently shrinking it.

### IndexNow

`supabase/functions/indexnow-submit` pushes URLs to Bing, Yandex, Seznam and
Naver. Key file at `public/b4d8f2a1e6c94b7d9f3a5c8e1d7b4f2a.txt`.

```bash
curl -X POST https://<SUPABASE_URL>/functions/v1/indexnow-submit \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"urls": ["/", "/products", "/blog/new-article-slug"]}'
```

### Search Console

Verification meta tags are commented placeholders in `index.html`
(`google-site-verification`, `msvalidate.01`). Uncomment, add the code, deploy,
then submit `https://www.thenilgiriroot.com/sitemap.xml`.

---

## Media pipeline

### Process clips

The ten manufacturing-stage animations were 3–5 MB GIFs, 42.6 MB for the set,
which made `/process` unusable on mobile. They are now MP4 + WebM with WebP
posters:

| Format | Total | Notes |
|---|---|---|
| MP4 (H.264) | 6.0 MB | Universal baseline, `+faststart` |
| WebM (VP9) | 5.2 MB | ~30% smaller where supported |
| WebP posters | 320 KB | All that loads on arrival |

`StageVideo` sets `preload="none"` and starts playback via IntersectionObserver,
so a stage costs nothing until scrolled to. On mobile and under reduced motion
it renders the poster only — no `<video>` element is created.

Masters live in `src/assets/stages/_gif-masters/` (not imported, not shipped).
Regenerate after replacing one:

```bash
npm run transcode:stages
```

### Images

`OptimizedImage` renders a responsive WebP `<picture>` with a blur-up
placeholder and explicit `width`/`height` to reserve layout box (CLS).

**Exactly one image per page carries `fetchPriority="high"`** — the LCP element.
On the homepage that is the hero fries card. Marking several high splits
bandwidth and delays the real LCP.

---

## Accessibility

Target: WCAG 2.1 AA.

- **Colour contrast** — see the table under [Design system](#design-system).
- **Forms** — every control has a programmatically associated label via
  `useId()`-generated ids. Required fields carry `required` + `aria-required`,
  not just a `*` in the label text. Submit state is announced through an
  `aria-live="polite"` region. Placeholders are never the accessible name.
- **Focus** — visible on every interactive element. Hand-rolled link CTAs use
  `.focus-ring`.
- **Skip link** — targets `#main-content`, which carries `tabIndex={-1}` so
  focus actually moves (without it the link only moves scroll position).
- **Headings** — one `<h1>` per page, no level skips.
- **Landmarks** — `<main>`, `<nav>`, `<footer>`, `<article>`, labelled where
  more than one of a kind exists.
- **Reduced motion** — honoured structurally; see
  [Motion specification](#motion-specification).
- **Decorative images** — `alt=""` + `aria-hidden="true"`; icons inside labelled
  controls are `aria-hidden`.

---

## Testing

```bash
npm run test
```

Vitest + Testing Library, jsdom. `src/test/setup.ts` provides `matchMedia`,
`IntersectionObserver` and `ResizeObserver` mocks (jsdom has none) and a
`setMatchMedia()` helper for per-test overrides.

| Suite | Covers |
|---|---|
| `seo.test.tsx` | Meta/OG/Twitter/canonical output, noindex, JSON-LD cleanup, route-manifest integrity |
| `forms.test.tsx` | RFQ label association, required fields, honeypot, validation, submission payload, success and failure paths |

The route-manifest tests exist because drift between `routes.ts` and
`landingPages.ts` is what silently broke all thirteen landing pages.

**Known gaps** — not yet covered: cross-browser and device testing, screen
reader passes (NVDA/VoiceOver), Lighthouse runs, and field Core Web Vitals.
These need a real browser matrix and a deployed URL.

---

## Security

- **CSP** — `public/_headers`, **enforcing**. It was previously
  `Content-Security-Policy-Report-Only` with no `report-uri`, which blocked
  nothing and recorded nothing. Origins are verified against what the built
  bundle actually requests. Rollback: rename the key back to
  `Content-Security-Policy-Report-Only`. **Smoke-test on staging before the
  first production deploy** — a CSP failure is invisible server-side.
- **Other headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options:
  nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`.
- **ErrorBoundary** wraps the app with a recovery path.
- **Forms** — honeypot field, client-side validation with length limits, zod
  schemas on the inline RFQ.
- **Secrets** — only publishable/anon keys reach the client; privileged work
  runs in edge functions.

---

## Changelog

### v3.0 — Remediation

Fixed, with before → after:

- Process page media 42.6 MB → 320 KB on arrival (GIF → MP4/WebM + posters)
- Homepage critical path 236.5 KB → 194.6 KB gzip (Supabase deferred to first use)
- `og:image` / `twitter:image` repointed from an expired Google Cloud signed URL
  to `/og-image.jpg` — every social share had been rendering blank
- Light-mode accent 34% → 27% lightness: 4.34:1 → 6.29:1 on buttons,
  3.99:1 → 5.80:1 as text
- **All 13 SEO landing pages were redirecting to the 404** — `LandingPage` read
  `useParams().slug` but the routes are literal paths with no `:slug` param.
  Slug is now passed explicitly
- Build-time prerendering added; 22 routes ship real HTML
- Sitemap generated from the route manifest + Supabase instead of hand-edited
- 404 and blog-not-found now `noIndex` (were indexable soft 404s)
- Navbar regrouped from 9 flat items to 4 groups; logo animates `transform`
  instead of `height`; scroll handler rAF-batched
- RFQ forms: 16 fields given associated labels (had none)
- Scroll reveals 1000ms → 320ms; `transition-all` removed
- Brand intro 2.1s every load → ≤600ms once per session, no path morphing
- Stat counters moved from `setInterval` to rAF
- Skip-link target made focusable
- Lint: 45 errors → 0 (Deno functions correctly scoped; `any` replaced with
  narrowing helpers in `src/lib/errors.ts`)
- Tests: 1 placeholder → 22 covering SEO and lead capture
- 12 unused keyframes and a 305 KB unreferenced JPEG removed

### v2.0 — Production optimisation (historical)

Note: this release's changelog claimed the OG image URLs were fixed. They were
not — the expired Google Cloud URLs shipped until v3.0. Entries below are
otherwise accurate.

Code splitting, `OptimizedImage` with blur-up, JSON-LD on Products/About/
Contact, ErrorBoundary, honeypot spam protection, skip link, IndexNow edge
function, security headers.
