# DPDP Compliance — Handover

What was built, what it does, and what **you** must supply before any of it can
go live.

> **Nothing in the legal pages has been reviewed by a lawyer.** The drafting is
> a technically competent starting point that tracks the DPDP Act, 2023 and the
> Draft DPDP Rules, 2025. It is not legal advice. Review by qualified Indian
> counsel is a precondition of publication, not a nice-to-have.

---

## 1. Before you deploy

```bash
npm run legal:check
```

Lists every organisation-specific fact still outstanding. **15 items** at time of
writing (down from 28 — the grievance officer and all six retention periods have
been supplied). Until they're filled in, the pages render them as red inline markers —
an incomplete policy is designed to *look* incomplete rather than quietly
publish an invented fact.

Everything lives in one file: [`src/data/legalEntity.ts`](src/data/legalEntity.ts).

### What's outstanding, and why I couldn't fill it

| Category | Why it needs you |
|---|---|
| Registered name, entity type, CIN/LLPIN, GSTIN, registered office | Facts from your incorporation documents. An invented registered name in a published privacy policy is a false statutory declaration. |
| ~~Grievance officer name + email~~ | ✅ **Supplied** — Sowmiya Moorthy, contact@thenilgiriroot.com. Designation, phone and postal address still outstanding. |
| ~~Retention periods (6 activities)~~ | ✅ **Supplied** — see §2a below for the two that need a system change to actually be true. |
| Governing-law city | Commercial choice, usually where you'd realistically litigate. |
| Effective / last-updated dates | Set when counsel signs off. |
| Liability cap figure | Currently a placeholder INR 10,000. Needs commercial and insurance input, and must not conflict with your standard supply agreement. |
| AI model provider for the chat assistant | I could see the edge function but not which provider it calls. |
| Supplier hosting regions + executed DPAs | Needed for the cross-border transfer disclosure to be accurate. |

---

## 2a. Retention periods — supplied, but two need action

Set by the business on 2026-08-16 and now published as fact in the Privacy
Policy:

| Purpose | Retention |
|---|---|
| Quotation / sales enquiries | 24 months from last contact |
| Newsletter | Until consent withdrawn, + 12 months suppression |
| Analytics | 14 months |
| WhatsApp click logs | 24 months |
| On-site assistant | 12 months |
| Security / abuse logs | 90 days |

**These are now commitments, not intentions.** Two things must follow:

1. **Verify the GA4 setting.** The policy states analytics data is kept for 14
   months. That is only true if the GA4 property's Data Retention setting says
   so — Admin → Data Settings → Data Retention. 14 months is GA4's default, but
   confirm it, because the published policy asserts it as fact.

2. **Nothing currently enforces these periods.** There is no deletion job. Data
   older than the stated period will sit in the database indefinitely, which
   would put you in breach of your own published policy — and DPDP s.8(7)
   independently requires erasure once the purpose is served.

   A scheduled function running nightly over `lead_submissions`,
   `whatsapp_clicks`, `cta_clicks` and `edge_request_log` would close this. It
   is a contained piece of work and should happen before, or very shortly
   after, the policies go live.

Also confirm none of these periods conflict with a longer statutory obligation
(Income Tax record-keeping, FSSAI). If one does, the retention period must be
revised **upward** and the policy updated — the published figure is a ceiling
you are promising to honour.

---

## 2. What was built

### Consent management (DPDP s.6)

| File | Role |
|---|---|
| `src/lib/consent.ts` | State, storage, tag signalling, audit logging |
| `src/components/consent/ConsentProvider.tsx` | React context |
| `src/components/consent/ConsentBanner.tsx` | The notice |
| `index.html` | Consent Mode defaults, set **before** the GA tag initialises |
| `supabase/functions/consent-log/` | Append-only evidence trail |

Design decisions, each traceable to the Act:

- **Denied by default.** Consent Mode v2 defaults are set in the HTML shell
  before gtag initialises, so no analytics storage is written until a choice is
  made. Verified in the built output: `consent default` at byte 6088, `config`
  at 7301.
- **Nothing pre-ticked.** Optional purposes start off.
- **Reject is as prominent as Accept** — same size, same row, same weight.
- **Dismissal is not consent.** No close button on first visit; Escape collapses
  the detail panel only.
- **Granular.** Separate decision per purpose, never bundled.
- **Withdrawal actually takes effect** — turning analytics off clears the `_ga`
  cookies already on the device, rather than just stopping future collection.
- **Versioned.** Bump `CONSENT_VERSION` when purposes change and stale consent
  is invalidated rather than silently extended.

The consent log deliberately stores **no IP address**. A consent record must not
become a tracking record.

### Data Principal rights (Chapter III, s.13)

`/privacy-dashboard` — consent controls, the processing register, and a request
form covering all six rights: access, correction, erasure, withdrawal,
nomination, grievance.

**Identity verification is by emailed link, not identity documents.** Two
reasons: demanding a government ID to service a privacy request collects *more*
sensitive data than the request concerns; and control of the mailbox is the same
proof we'd rely on to send the person their data anyway. Requests stay
unactioned until verified, so nobody can trigger erasure of someone else's
records.

The endpoint returns an identical response whether or not we hold data for an
address, so it can't be used to enumerate customers. Rate limited to 5 requests
per address per hour.

### Database (`supabase/migrations/20260816090000_dpdp_compliance.sql`)

| Table | Purpose |
|---|---|
| `consent_log` | Append-only s.6 evidence |
| `data_principal_requests` | Rights requests + grievances, with SLA clock |
| `data_principal_request_events` | Append-only audit trail per request |
| `guardian_consents` | s.9 verifiable parental/guardian consent |
| `breach_register` | s.8(6) incidents; 72h Board deadline auto-computed |
| `processing_activities` | RoPA, mirroring `legalEntity.ts` |

Two operational views: `dpr_sla_watch` (requests approaching/past deadline) and
`breach_reporting_watch` (breaches with an outstanding Board report).

**Every table is RLS-enabled with no policies** — total client denial. Writes go
through edge functions on the service role. These tables are themselves a
concentration of personal data; a compliance system that leaks is worse than
none.

---

## 3. What is scaffolding, not a finished system

I want to be explicit about this rather than let the file count imply more than
was built.

### Breach notification — tooling, not a process

The register and the 72-hour deadline tracking exist. **The process does not.**
Still needed from you:

- who is on the incident response rota, and how they're reached out of hours
- who decides whether a breach meets the notification threshold
- the Board's submission channel (confirm current procedure)
- a drafted notification template, approved in advance — you do not want to be
  writing one for the first time during an actual incident
- a rehearsal

No alerting is wired to `breach_reporting_watch`. It's a view someone has to
look at. Wiring it to email or Slack is a small job and worth doing.

### Guardian consent — a table, not a flow

`guardian_consents` gives a lawful place to record verification. There is no
age-gate UI and no DigiLocker integration.

This is deliberate. The site is B2B, terms require users to be 18+, and it
should not be collecting children's data at all. Building a parental consent
flow for a fry wholesaler would be theatre. If your circumstances change, the
storage layer is ready and the DPDP Rules contemplate a virtual token /
DigiLocker route.

### Verification email — not sent

`dp-request` creates the token and logs it, but does not yet send the email.
Marked `TODO(handover)` in the function. The project already has an email queue
(`enqueue_email`) and templates under
`supabase/functions/_shared/email-templates/` — wiring it in needs the sender
identity and approved copy.

**Until this is wired, requests will sit unverified.** Either complete it or
monitor the table manually.

### Staff-side request handling — no UI

Requests land in the database. There is no admin screen for working them. Use
the Supabase dashboard, or extend `/admin`.

### Hindi

Not machine-translated, deliberately. An inaccurate Hindi translation of a
binding legal document is worse than none — and the DPDP Act entitles a Data
Principal to access consent notices in any Eighth Schedule language, which makes
accuracy a statutory matter rather than a nicety.

The policy states that Hindi and Tamil are available on request through the
grievance officer, which is a commitment you can honour today. For published
translations, commission a certified legal translator.

---

## 4. Migration not yet applied

```bash
supabase db push
supabase functions deploy consent-log
supabase functions deploy dp-request
```

The migration has **not** been run — I had no credentials, and applying schema
to a live database isn't something to do unattended. Review the SQL first.

`src/integrations/supabase/types.ts` is generated and does **not** yet include
the new tables. Regenerate after pushing:

```bash
supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts
```

The edge functions don't depend on those types, so nothing is broken meanwhile.

---

## 5. The 404 status code

A client-rendered SPA cannot set an HTTP status. This is fixed at the host.

`public/_redirects` deliberately has **no** `/* /index.html 200` catch-all —
that rule is what makes soft 404s inevitable. Because every known route is
prerendered to its own file, real pages resolve as static files, and anything
unknown falls through to `dist/404.html`, which Netlify and Cloudflare Pages
serve with a genuine 404.

Named exceptions: `/blog/*` (slugs come from Supabase), `/admin`, `/auth`,
`/whatsapp-sent`, `/privacy-dashboard`.

**Verify after your first deploy:**

```bash
curl -I https://thenilgiriroot.com/this-does-not-exist   # expect 404
curl -I https://thenilgiriroot.com/products              # expect 200
curl -I https://thenilgiriroot.com/blog/any-real-slug    # expect 200
```

If you're not on Netlify or Cloudflare Pages, `_redirects` won't be read and
this needs redoing for your host.

---

## 6. The preloader tradeoff

You asked for the sequence to run fully before revealing content. It does — a
~1.9s CSS timeline, gated to once per session.

Be aware of the cost: **the overlay is the largest element on screen while it's
up, so it becomes the LCP element.** That is a direct tradeoff against the LCP
work from the earlier remediation. It's your call and I've built what you asked
for, but you should expect Lighthouse LCP on a cold first visit to reflect the
splash rather than the hero.

What it does *not* cost is Total Blocking Time. The whole sequence is CSS
keyframes on `transform`/`opacity`, driven by the compositor with no JavaScript,
so TBT contribution is **zero** — comfortably inside your 200ms budget. React
boots in parallel underneath.

It also self-dismisses: the final keyframe sets `visibility: hidden`, so if the
bundle fails to load entirely the overlay still clears instead of trapping the
user. `prefers-reduced-motion` skips it structurally (`display: none`), not by
running a faster animation.

If you later want the LCP back, the cheapest change is dropping the hold from
1500ms to ~600ms in the inline `<style>` in `index.html`.

---

## 7. Verification status

| Check | Result |
|---|---|
| TypeScript | Clean |
| ESLint | 0 errors, 41 warnings (all `any` in pre-existing Deno functions) |
| Tests | 42 passing across 4 files |
| Build | 26/26 routes prerendered |
| Sitemap | 31 URLs |
| Consent Mode order | `default` before `config` — verified in built output |
| 404.html | Generated, `noindex`, search + popular sections present |

**Not verified** — unchanged from the earlier audit, still needs a browser
matrix and a deployed URL:

- Cross-browser testing (Chrome, Firefox, Safari, Edge — last two versions).
  **The preloader specifically needs a Safari check**: it uses CSS animation
  `fill-mode: both` with a delay, which is well supported but worth confirming
  visually.
- Screen-reader passes over the consent banner and dashboard. Both are built to
  the ARIA patterns and covered by automated tests, but automated tests can't
  tell you whether a consent flow makes sense to listen to.
- Lighthouse.
- Field Core Web Vitals.
- **CSP** — the earlier remediation promoted it to enforcing. Smoke-test on
  staging; a CSP failure is invisible server-side.

---

## 8. Honest summary of §5 in your brief

| Asked for | Delivered |
|---|---|
| Consent platform, granular | ✅ Complete |
| Rights dashboard | ✅ Complete (verification email needs wiring) |
| Parental consent flow | ⚠️ Storage only — no UI, by design |
| 72h breach workflow | ⚠️ Tooling + deadline tracking; process is yours |
| Cross-border safeguards | ⚠️ Disclosure written; DPAs and regions need confirming |
| DPO / grievance officer | ⚠️ Structure ready; the appointment is yours |
| Audit-ready records | ✅ Schema complete, append-only, RLS-denied |

The pattern: I built everything that is genuinely code. The gaps are all places
where the remaining work is an organisational decision or a legal fact, and
inventing either would have produced something that looked compliant while
being false.
