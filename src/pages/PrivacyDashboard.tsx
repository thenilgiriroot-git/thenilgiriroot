import { useState, useId, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, ShieldCheck, FileText, Pencil, Trash2, UserMinus, Users, MessageSquareWarning, AlertTriangle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useConsent } from "@/components/consent/ConsentProvider";
import { COOKIE_CATEGORIES, LEGAL_ENTITY, PROCESSING_ACTIVITIES } from "@/data/legalEntity";
import { Fact } from "@/components/legal/LegalLayout";
import { errorMessage } from "@/lib/errors";
import type { ConsentState } from "@/lib/consent";

const E = LEGAL_ENTITY;

type RequestType = "access" | "correction" | "erasure" | "withdraw" | "nomination" | "grievance";

const REQUEST_TYPES: { id: RequestType; label: string; blurb: string; icon: typeof FileText }[] = [
  { id: "access", label: "See my data", blurb: "A summary of the personal data we hold about you, what we do with it, and who we've shared it with.", icon: FileText },
  { id: "correction", label: "Correct or complete", blurb: "Fix something that's wrong, fill in something missing, or bring it up to date.", icon: Pencil },
  { id: "erasure", label: "Erase my data", blurb: "Delete what we hold, unless a law requires us to keep specific records.", icon: Trash2 },
  { id: "withdraw", label: "Withdraw consent", blurb: "Stop processing that relies on your consent. Cookie choices are above — this is for everything else.", icon: UserMinus },
  { id: "nomination", label: "Nominate someone", blurb: "Name a person to exercise your rights if you die or become incapacitated.", icon: Users },
  { id: "grievance", label: "Raise a grievance", blurb: "Complain about how we've handled your data or a previous request.", icon: MessageSquareWarning },
];

export default function PrivacyDashboard() {
  const { state, record, save, reopen } = useConsent();
  const [draft, setDraft] = useState<ConsentState>(state);
  const [saved, setSaved] = useState(false);

  const dirty =
    draft.analytics !== state.analytics || draft.marketing !== state.marketing;

  const applyConsent = () => {
    save(draft, "dashboard");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
    toast({ title: "Preferences saved", description: "Your choices take effect immediately." });
  };

  return (
    <main className="bg-background px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <SEOHead
        title="Your Privacy Choices | The Nilgiri Root"
        description="Review and change your consent settings, and exercise your rights as a Data Principal under India's DPDP Act, 2023 — access, correction, erasure, withdrawal and grievance redressal."
        noIndex
      />

      <div className="mx-auto max-w-3xl">
        <header>
          <p className="font-body text-2xs uppercase tracking-[0.3em] text-muted-foreground">
            Data protection
          </p>
          <h1 className="mt-3 font-display text-fluid-h1 font-bold text-balance text-foreground">
            Your privacy choices
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
            Change what you&rsquo;ve consented to, see what we do with personal data, and exercise
            your rights under the Digital Personal Data Protection Act, 2023. Everything here is
            free, and none of it affects how the site works for you.
          </p>
        </header>

        {/* ── Consent ─────────────────────────────────────────────────── */}
        <section aria-labelledby="consent-heading" className="mt-12">
          <h2 id="consent-heading" className="font-display text-2xl font-bold text-foreground">
            Cookies and tracking
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
            Withdrawing is as easy as consenting — flip a switch and save. Turning analytics off also
            clears the cookies already on this device.
          </p>

          <ul className="mt-6 flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {COOKIE_CATEGORIES.map((cat) => {
              const checked = cat.required ? true : draft[cat.id];
              return (
                <li key={cat.id} className="flex items-start justify-between gap-4 bg-card p-4 sm:p-5">
                  <div className="min-w-0">
                    <Label
                      htmlFor={`dash-${cat.id}`}
                      className="font-body text-sm font-medium text-foreground"
                    >
                      {cat.label}
                      {cat.required && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 font-body text-2xs font-normal text-muted-foreground">
                          Always on
                        </span>
                      )}
                    </Label>
                    <p className="mt-1 font-body text-2xs leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                    {cat.cookies.length > 0 && (
                      <p className="mt-1.5 font-body text-2xs text-muted-foreground/80">
                        {cat.cookies.length} {cat.cookies.length === 1 ? "item" : "items"} —{" "}
                        <Link to="/cookie-policy" className="rounded-sm text-accent hover:underline focus-ring">
                          see the full list
                        </Link>
                      </p>
                    )}
                  </div>
                  <Switch
                    id={`dash-${cat.id}`}
                    checked={checked}
                    disabled={cat.required}
                    onCheckedChange={(v) => setDraft((d) => ({ ...d, [cat.id]: v }) as ConsentState)}
                    className="mt-0.5 shrink-0"
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={applyConsent}
              disabled={!dirty}
              className="rounded-full bg-accent font-body text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {saved ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
              {saved ? "Saved" : "Save preferences"}
            </Button>
            <Button
              variant="ghost"
              onClick={reopen}
              className="rounded-full font-body text-sm text-muted-foreground hover:text-foreground"
            >
              Show the full notice again
            </Button>
          </div>

          {record && (
            <p className="mt-4 rounded-xl border border-border bg-muted/40 p-4 font-body text-2xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-accent" aria-hidden="true" />
              Consent receipt <code className="font-mono text-foreground">{record.receiptId}</code>,
              recorded {new Date(record.decidedAt).toLocaleString("en-IN")}. Quote this reference if
              you contact us about your consent.
            </p>
          )}
        </section>

        {/* ── What we process ─────────────────────────────────────────── */}
        <section aria-labelledby="processing-heading" className="mt-16">
          <h2 id="processing-heading" className="font-display text-2xl font-bold text-foreground">
            What we do with personal data
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
            Every purpose we process personal data for, and what makes it lawful.
          </p>
          <ul className="mt-6 flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {PROCESSING_ACTIVITIES.map((a) => (
              <li key={a.id} className="bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-body text-sm font-medium text-foreground">{a.purpose}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-body text-2xs ${
                      a.lawfulBasis === "consent"
                        ? "bg-accent/12 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.lawfulBasis === "consent" ? "Your consent" : "Legitimate use"}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-2xs leading-relaxed text-muted-foreground">
                  {a.dataCategories.join(" · ")}
                </p>
                <p className="mt-1.5 font-body text-2xs leading-relaxed text-muted-foreground">
                  Kept for <Fact value={a.retention} />
                  {a.crossBorder && " · may be stored outside India"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Rights request ──────────────────────────────────────────── */}
        <VerificationBanner />
        <RightsRequestForm />

        {/* ── Grievance officer ───────────────────────────────────────── */}
        <section aria-labelledby="officer-heading" className="mt-16">
          <h2 id="officer-heading" className="font-display text-2xl font-bold text-foreground">
            Who to contact
          </h2>
          <div className="mt-5 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground">
              Grievance Officer
            </p>
            <dl className="grid gap-2 font-body text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground"><Fact value={E.grievanceOfficer.name} /></dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${E.grievanceOfficer.email}`} className="rounded-sm text-accent hover:underline focus-ring">
                  {E.grievanceOfficer.email}
                </a>
              </dd>
              <dt className="text-muted-foreground">Response time</dt>
              <dd className="text-foreground">Within {E.grievanceOfficer.responseDays} days</dd>
            </dl>
          </div>
          <p className="mt-4 font-body text-2xs leading-relaxed text-muted-foreground">
            If we don&rsquo;t resolve your grievance, you may escalate to the{" "}
            <strong className="text-foreground">Data Protection Board of India</strong>. Under the
            DPDP Act you must give us the opportunity to resolve it first. Full detail in our{" "}
            <Link to="/privacy-policy#grievance" className="rounded-sm text-accent hover:underline focus-ring">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

type VerifyOutcome =
  | { state: "idle" }
  | { state: "verifying" }
  | { state: "success"; reference: string }
  | { state: "error"; message: string };

function VerificationBanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [outcome, setOutcome] = useState<VerifyOutcome>({ state: "idle" });

  useEffect(() => {
    const token = searchParams.get("verify");
    const reference = searchParams.get("ref");
    if (!token || !reference) return;

    let cancelled = false;
    setOutcome({ state: "verifying" });

    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke("dp-request", {
          body: { action: "verify", token, reference },
        });
        if (cancelled) return;

        if (error) throw error;
        const result = data as { ok?: boolean; error?: string } | null;
        if (!result?.ok) {
          setOutcome({ state: "error", message: result?.error ?? "This verification link is invalid." });
          return;
        }
        setOutcome({ state: "success", reference });
      } catch (err) {
        if (cancelled) return;
        console.error("dp-request verify failed", errorMessage(err));
        setOutcome({ state: "error", message: "We couldn't confirm this link. Please try again or contact us directly." });
      } finally {
        // Strip the token from the URL either way so a refresh or shared link
        // doesn't re-submit it, and so the token never lingers in history.
        if (!cancelled) {
          const next = new URLSearchParams(searchParams);
          next.delete("verify");
          next.delete("ref");
          setSearchParams(next, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only ever run this once for whatever verify/ref were present on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (outcome.state === "idle") return null;

  return (
    <section aria-live="polite" className="mt-12">
      {outcome.state === "verifying" && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 font-body text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          Confirming your request…
        </div>
      )}
      {outcome.state === "success" && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <Check className="h-6 w-6 text-accent" aria-hidden="true" />
          <p className="mt-2 font-body text-sm leading-relaxed text-foreground">
            Confirmed. Reference <code className="rounded bg-background px-1.5 py-0.5 font-mono">{outcome.reference}</code>{" "}
            is now being actioned — we'll respond within {E.grievanceOfficer.responseDays} days.
          </p>
        </div>
      )}
      {outcome.state === "error" && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          <p className="mt-2 font-body text-sm leading-relaxed text-foreground">{outcome.message}</p>
        </div>
      )}
    </section>
  );
}

function RightsRequestForm() {
  const { record } = useConsent();
  const [type, setType] = useState<RequestType>("access");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const emailId = useId();
  const nameId = useId();
  const detailsId = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return;

    setSending(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("dp-request", {
        body: {
          request_type: type,
          email,
          full_name: name || null,
          details: details || null,
          consent_receipt_id: record?.receiptId ?? null,
        },
      });
      if (error) throw error;

      const ref = (data as { reference?: string } | null)?.reference;
      if (!ref) throw new Error("No reference returned");

      setReference(ref);
    } catch (err) {
      console.error("dp-request failed", errorMessage(err));
      toast({
        title: "We couldn't submit that",
        description: `Please email ${E.grievanceOfficer.email} and we'll handle it directly.`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (reference) {
    return (
      <section aria-labelledby="request-heading" className="mt-16">
        <h2 id="request-heading" className="font-display text-2xl font-bold text-foreground">
          Request received
        </h2>
        <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-6">
          <Check className="h-8 w-8 text-accent" aria-hidden="true" />
          <p className="mt-3 font-body text-sm leading-relaxed text-foreground">
            Your reference is{" "}
            <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
              {reference}
            </code>
            . Please keep it.
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
            We&rsquo;ve sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it so we know the request really came from you — we won&rsquo;t act on it until you
            do. This protects your data from someone else requesting it in your name.
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
            Once verified, we&rsquo;ll respond within {E.grievanceOfficer.responseDays} days.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="request-heading" className="mt-16">
      <h2 id="request-heading" className="font-display text-2xl font-bold text-foreground">
        Exercise your rights
      </h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
        Pick what you&rsquo;d like us to do. We&rsquo;ll email you to confirm it&rsquo;s really you
        before acting — we don&rsquo;t ask for identity documents.
      </p>

      <form onSubmit={submit} className="mt-6">
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <Input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <fieldset>
          <legend className="mb-3 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground">
            What would you like to do?
          </legend>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {REQUEST_TYPES.map((rt) => {
              const Icon = rt.icon;
              const active = type === rt.id;
              return (
                <label
                  key={rt.id}
                  className={`flex cursor-pointer items-start gap-3 bg-card p-4 transition-colors duration-quick hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                    active ? "bg-muted" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="request_type"
                    value={rt.id}
                    checked={active}
                    onChange={() => setType(rt.id)}
                    className="sr-only"
                  />
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-accent" : "text-muted-foreground"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className={`block font-body text-sm font-medium ${active ? "text-accent" : "text-foreground"}`}>
                      {rt.label}
                    </span>
                    <span className="mt-0.5 block font-body text-2xs leading-relaxed text-muted-foreground">
                      {rt.blurb}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={emailId} className="mb-1.5 block font-body text-xs text-muted-foreground">
              Your email <span className="text-accent" aria-hidden="true">*</span>
            </Label>
            <Input
              id={emailId}
              type="email"
              required
              aria-required="true"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <p className="mt-1.5 font-body text-2xs text-muted-foreground">
              Use the address you gave us, so we can find your records.
            </p>
          </div>
          <div>
            <Label htmlFor={nameId} className="mb-1.5 block font-body text-xs text-muted-foreground">
              Your name
            </Label>
            <Input
              id={nameId}
              maxLength={200}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor={detailsId} className="mb-1.5 block font-body text-xs text-muted-foreground">
            Anything else we should know
          </Label>
          <Textarea
            id={detailsId}
            rows={4}
            maxLength={5000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={
              type === "correction"
                ? "What's wrong, and what should it say instead?"
                : type === "grievance"
                  ? "What happened, and what outcome are you looking for?"
                  : "Optional — any detail that helps us find the right records."
            }
          />
        </div>

        <Button
          type="submit"
          disabled={sending}
          className="mt-5 w-full rounded-full bg-accent py-5 font-body text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {sending ? "Submitting…" : "Submit request"}
        </Button>
        <p aria-live="polite" className="sr-only">{sending ? "Submitting your request" : ""}</p>

        <p className="mt-4 font-body text-2xs leading-relaxed text-muted-foreground">
          Exercising these rights is free. We may decline a request that is manifestly unfounded or
          repetitive, or where a law requires us to keep the data — if so we&rsquo;ll explain which
          obligation applies and when it ends. Note that the DPDP Act places a duty on you not to
          submit false or frivolous grievances.
        </p>
      </form>
    </section>
  );
}
