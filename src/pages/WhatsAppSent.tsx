import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, MessageCircle, ArrowLeft, Loader2, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, payloadError } from "@/lib/errors";
import {
  ALL_VARIANTS,
  buildWhatsAppLink,
  messageFor,
  type CtaType,
  type Variant,
} from "@/lib/whatsapp";

export default function WhatsAppSent() {
  const [params] = useSearchParams();
  const type = (params.get("type") === "restaurant" ? "restaurant" : "distributor") as CtaType;
  const variants = useMemo<Variant[]>(() => {
    const raw = params.get("variants") ?? "";
    const parsed = raw.split(",").filter((v): v is Variant =>
      ALL_VARIANTS.includes(v as Variant)
    );
    return parsed.length ? parsed : ALL_VARIANTS;
  }, [params]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Message sent on WhatsApp — The Nilgiri Root";
  }, []);

  const reopenLink = buildWhatsAppLink(messageFor(type, variants));

  const mailtoLink = (() => {
    const subject = encodeURIComponent(
      `${type === "distributor" ? "Distributor enquiry" : "HORECA supply enquiry"} — ${variants.join(", ")}`
    );
    const body = encodeURIComponent(messageFor(type, variants));
    return `mailto:admin@thenilgiriroot.com?subject=${subject}&body=${body}`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("contact-fallback", {
        body: { ...form, cta_type: type, variants },
      });
      if (fnError) {
        // supabase.functions.invoke wraps non-2xx into FunctionsHttpError. Try to surface a friendly msg.
        throw new Error(payloadError(data) ?? fnError.message ?? "Submission failed");
      }
      const payloadErr = payloadError(data);
      if (payloadErr) throw new Error(payloadErr);
      setDone(true);
    } catch (err) {
      const m = errorMessage(err, "");
      if (/too many|429/i.test(m)) {
        setError("You've submitted a few times in a short window. Please wait a minute and try again.");
      } else {
        setError(m || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <SEOHead
        title="Message Sent — The Nilgiri Root"
        description="Your WhatsApp enquiry was opened successfully. Share your contact details and our team will reach out shortly."
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 text-accent mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your message was <span className="text-gradient-forest">opened on WhatsApp</span>
          </h1>
          <p className="font-body text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            We sent a pre-filled enquiry for{" "}
            <strong className="text-foreground">
              {type === "distributor" ? "distributor partnership" : "restaurant / HORECA supply"}
            </strong>{" "}
            covering <strong className="text-foreground">{variants.join(", ")}</strong>. Hit
            send in WhatsApp to complete the request.
          </p>
          <a
            href={reopenLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 text-accent font-body text-sm font-medium hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Re-open WhatsApp
          </a>
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 mt-3 ml-4 text-muted-foreground hover:text-accent font-body text-sm font-medium hover:underline transition-colors"
          >
            <Mail className="h-4 w-4" /> Email us instead
          </a>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 sm:p-8">
          {done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Thanks — we've got your details
              </h2>
              <p className="font-body text-muted-foreground text-sm mb-6">
                Our team will get back to you within 1 business day.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-accent font-body text-sm font-medium hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="font-body text-accent text-2xs sm:text-xs tracking-[0.25em] uppercase mb-2">
                  Fallback — in case WhatsApp didn't open
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Share your details and we'll reach out
                </h2>
                <p className="font-body text-muted-foreground text-sm">
                  Prefer email or a call back? Drop your contact below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Phone *" required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                </div>
                <Field label="Email *" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Business name" value={form.business_name} onChange={(v) => setForm({ ...form, business_name: v })} />
                  <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5 tracking-wide">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                {error && (
                  <p className="text-sm font-body text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-body text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Sending..." : "Send my details"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-body text-muted-foreground mb-1.5 tracking-wide">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
