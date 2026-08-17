import { useState, useId } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/errors";

// The Supabase client is ~44 KB gzipped. This form sits in the footer of every
// page, so a static import put that on the critical path of every first paint
// for a control almost nobody touches on arrival. Importing it inside the
// submit handler moves it to the moment it's actually needed.
const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);

interface Props {
  variant?: "inline" | "card";
  sourceDetail?: string;
  heading?: string;
  description?: string;
  className?: string;
}

export default function NewsletterForm({
  variant = "inline",
  sourceDetail = "footer",
  heading = "Subscribe to our newsletter",
  description = "Trade insights, new SKUs and B2B offers — straight to your inbox. No spam.",
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return; // honeypot
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke("submit-lead", {
        body: {
          source_type: "newsletter",
          source_detail: sourceDetail,
          name: "Newsletter subscriber",
          email,
          message: "Newsletter subscription",
          page_url: typeof window !== "undefined" ? window.location.href : "",
          extra: { subscribed_at: new Date().toISOString() },
        },
      });
      if (error) throw error;
      setDone(true);
      setEmail("");
      toast({ title: "You're subscribed!", description: "Thanks for joining. Look out for our next update." });
    } catch (err) {
      console.error("newsletter submit failed", errorMessage(err));
      toast({
        title: "Couldn't subscribe",
        description: "Please try again or email admin@thenilgiriroot.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={`flex items-center gap-2 text-accent font-body text-sm ${className}`}>
        <CheckCircle2 className="h-4 w-4" />
        Subscribed — thank you!
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 sm:p-8 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-accent" />
          <span className="font-body text-accent text-2xs sm:text-xs tracking-[0.25em] uppercase">Newsletter</span>
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">{heading}</h3>
        <p className="font-body text-muted-foreground text-sm mb-4">{description}</p>
        <Form
          email={email} setEmail={setEmail}
          website={website} setWebsite={setWebsite}
          submitting={submitting} onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {heading && <h4 className="font-display text-base sm:text-lg text-foreground mb-1">{heading}</h4>}
      {description && <p className="text-xs sm:text-sm text-muted-foreground font-body mb-3 leading-relaxed">{description}</p>}
      <Form
        email={email} setEmail={setEmail}
        website={website} setWebsite={setWebsite}
        submitting={submitting} onSubmit={handleSubmit}
      />
    </div>
  );
}

function Form({
  email, setEmail, website, setWebsite, submitting, onSubmit,
}: {
  email: string; setEmail: (v: string) => void;
  website: string; setWebsite: (v: string) => void;
  submitting: boolean; onSubmit: (e: React.FormEvent) => void;
}) {
  const emailId = useId();

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2" aria-label="Newsletter subscription">
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {/* Visually hidden, but bound to the input — a placeholder is not an
          accessible name, and it disappears the moment the user types. */}
      <Label htmlFor={emailId} className="sr-only">
        Email address for newsletter
      </Label>
      <Input
        id={emailId}
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        maxLength={255}
        className="bg-background/60 border-border/40 rounded-full text-sm font-body flex-1"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-body rounded-full px-5 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
        Subscribe
      </Button>
      <p aria-live="polite" className="sr-only">{submitting ? "Subscribing" : ""}</p>
    </form>
  );
}
