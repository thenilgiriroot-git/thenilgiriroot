# The Nilgiri Root — website

Marketing site, blog and B2B lead-capture forms for The Nilgiri Root
(frozen French fries exporter). Vite + React + TypeScript + shadcn/ui on
the frontend, Supabase (Postgres + Edge Functions) on the backend,
deployed to Vercel.

Originally scaffolded on Lovable; now developed and deployed directly
from this repository.

## Stack

- **Frontend**: Vite, React 18, TypeScript, React Router, Tailwind CSS,
  shadcn/ui, TanStack Query, Framer Motion.
- **Backend**: Supabase — Postgres with row-level security, and Deno
  Edge Functions for anything that needs a service-role key or a secret
  (lead intake, consent logging, DPDP rights requests, the RootBot
  assistant, transactional email).
- **Build-time**: `scripts/generate-sitemap.mjs` builds `sitemap.xml`
  from the route manifest plus published blog posts, and
  `scripts/prerender.mjs` uses headless Chrome to bake real per-route
  HTML into `dist/` so crawlers and social-share unfurls see correct
  content even though this is a client-rendered SPA.
- **Deployment**: Vercel, built from this GitHub repository.

## Getting started

Requires Node.js (see `.nvmrc`/`package.json` engines if present, or use
a current LTS) and npm.

```sh
git clone https://github.com/thenilgiriroot-git/thenilgiriroot.git
cd thenilgiriroot
npm install
cp .env.example .env   # then fill in the Supabase key, see below
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` and fill in the blanks. `.env` is
gitignored and must never be committed — see the comment block at the
top of `.gitignore` for why.

| Variable | Used by | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser bundle | Public by definition — Vite inlines `VITE_*` vars into the JS bundle. |
| `VITE_SUPABASE_PROJECT_ID` | Browser bundle | Same as above. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser bundle | The **anon/public** key only. Get it from Supabase Dashboard → Project Settings → API. |
| `SUPABASE_URL` | Build-time only (`scripts/generate-sitemap.mjs`) | Not shipped to the browser. |
| `SUPABASE_PUBLISHABLE_KEY` | Build-time only | Same key as above, used server-side during the build. |

**Never** put `SUPABASE_SERVICE_ROLE_KEY` in `.env` or in Vercel's
frontend env vars — it bypasses row-level security entirely. It belongs
only in Supabase Edge Function secrets (`supabase secrets set …`),
where the functions in `supabase/functions/` read it via `Deno.env` at
runtime.

If `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` are missing, the
app degrades gracefully instead of crashing (see
`src/integrations/supabase/client.ts`), but anything that talks to
Supabase — forms, blog, consent logging — will fail until they're set.

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Production build: generates the sitemap, runs `vite build`, then prerenders every route to static HTML. |
| `npm run build:fast` | `vite build` only, skipping sitemap/prerender — useful for a quick local sanity check. |
| `npm run build:vercel` | Sitemap + `vite build`, **without** prerendering. This is what Vercel's `buildCommand` actually runs (see `vercel.json`) — see the callout below. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` / `test:watch` | Vitest. |
| `npm run legal:check` | Lists every unresolved `TODO:` fact in `src/data/legalEntity.ts` that must be filled in before launch (registered name, GSTIN, grievance officer, etc.) — see that file's header comment for why these can't be guessed. |
| `npm run transcode:stages` | Regenerates the shipped process-page videos from the local GIF masters in `src/assets/stages/_gif-masters/` (not committed — see `.gitignore`). |

## Prerendering and production deploys

`npm run build` ends with `npm run prerender` (see `scripts/prerender.mjs`),
which uses headless Chrome to bake real HTML into every route so crawlers
that don't execute JavaScript (Bing, LinkedIn, WhatsApp, X, and most AI
crawlers) see real content instead of an empty `<div id="root">`. This
matters a lot here — the SEO strategy leans on thirteen keyword landing
pages plus a blog.

Vercel's own build image is missing shared libraries that Puppeteer's
Chrome needs at runtime (`error while loading shared libraries:
libnss3.so`), and `@sparticuz/chromium` doesn't fix it either. So Vercel
never runs the full build:

- **Production** (`main`) is deployed by
  [`.github/workflows/prerendered-deploy.yml`][wf], which builds with
  prerendering on a standard Ubuntu GitHub Actions runner (`apt-get install`
  covers what that image is missing), assembles a
  [Build Output API v3](https://vercel.com/docs/build-output-api/v3)
  directory with `scripts/build-vercel-output.mjs`, and deploys it with
  `vercel deploy --prebuilt --prod`. `vercel.json`'s `ignoreCommand` tells
  Vercel's own git integration to skip builds on `main`, so this workflow is
  the only path to production.
- **PR previews** still build directly on Vercel, via `buildCommand: npm
  run build:vercel`, which stops after `vite build` and skips prerendering
  — previews render fine client-side, they just don't need the SEO step.

`scripts/build-vercel-output.mjs` hand-translates vercel.json's `rewrites`
and `headers` into Build Output routes; if you change either, update that
script's `routes` array to match — there's no automatic converter.

Required GitHub Actions repo secrets: `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

[wf]: .github/workflows/prerendered-deploy.yml

## Branching & deployment workflow

- `main` — production. Deploys to `thenilgiriroot.com` on Vercel.
- `staging` — pre-production integration branch. Deploys to a Vercel
  preview URL for stakeholder review before merging to `main`.
- `development` — active feature work branches off this.

Open pull requests into `development` → `staging` → `main`. Vercel
automatically builds a preview deployment for every pull request.

## Backend (Supabase)

- **Migrations**: `supabase/migrations/` — includes the core schema
  (leads, blog, analytics events) and a DPDP Act (India) compliance
  migration (`*_dpdp_compliance.sql`) adding consent logging, data
  subject request tracking, guardian consents, breach register and a
  processing-activities register. All of these tables are RLS-enabled
  with no client-facing policies — every write goes through an Edge
  Function running as service role.
- **Edge Functions**: `supabase/functions/` — `submit-lead` (rate
  limited, deduplicated, honeypot-checked form intake),
  `contact-fallback`, `consent-log`, `dp-request` (DPDP rights
  requests), `rootbot-chat`, `admin-stats`, `generate-blog-post`,
  `indexnow-submit`, `security-alerts`, `process-email-queue`,
  `auth-email-hook`.
- Deploy functions with the Supabase CLI: `supabase functions deploy
  <name>`. Apply migrations with `supabase db push` or via the
  dashboard SQL editor.

## Legal & compliance content

`src/data/legalEntity.ts` is the single source of truth for every
organisation-specific fact shown in the Privacy Policy, Terms, Cookie
Policy and consent flows (registered name, GSTIN, grievance officer,
retention periods, etc.). Read the header comment in that file before
editing it — some fields are deliberately marked `TODO:` rather than
guessed, and the GSTIN is deliberately **not** stored there since
anything in this file ships in the public browser bundle regardless of
whether a page renders it. Run `npm run legal:check` to see what's
still outstanding. See `COMPLIANCE-HANDOVER.md` for the full DPDP
remediation history and what's still pending (verification email
wiring, breach-notification process, retention enforcement job).

## Further reading

- `DOCS.md` — architecture notes, the v3.0 remediation history
  (performance/SEO/accessibility fixes), and known limitations.
- `COMPLIANCE-HANDOVER.md` — DPDP Act compliance implementation detail
  and outstanding items.
