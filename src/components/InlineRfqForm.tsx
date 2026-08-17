import { useState, useId } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { trackQuoteRequestClick } from "@/lib/analytics";

// Supabase client (~44 KB gzipped) is only needed when a form is actually
// submitted, never to render it. A static import put it on the critical path
// of first paint on every page, because this component is reachable from the
// eagerly-loaded shell.
const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);


const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  company: z.string().trim().min(2, "Enter your company").max(160),
  email: z.string().trim().email("Invalid email").max(200),
  phone: z.string().trim().min(7, "Invalid phone").max(20),
  city: z.string().trim().max(80).optional(),
  cut: z.string().max(40).optional(),
  pack: z.string().max(40).optional(),
  monthly_volume: z.string().max(40).optional(),
  notes: z.string().max(1500).optional(),
});

type State = z.infer<typeof schema> & { website?: string };

interface Props {
  /** Used as source_detail on submit-lead for routing in Sheets/CRM */
  sourceDetail: string;
  /** Default values to nudge buyer toward the page's intent */
  defaultCut?: "9mm" | "10mm" | "11mm" | "";
  defaultPack?: "500g" | "1kg" | "2.5kg" | "Bulk" | "";
  /** Heading shown above the form */
  heading?: string;
  /** Sub-heading shown above the form */
  subheading?: string;
}

const initial = (cut: Props["defaultCut"], pack: Props["defaultPack"]): State => ({
  name: "",
  company: "",
  email: "",
  phone: "",
  city: "",
  cut: cut ?? "",
  pack: pack ?? "",
  monthly_volume: "",
  notes: "",
  website: "",
});

export default function InlineRfqForm({
  sourceDetail,
  defaultCut = "",
  defaultPack = "",
  heading = "Request a Quote",
  subheading = "Pricing, lead times and packaging — within 1 business day.",
}: Props) {
  const [form, setForm] = useState<State>(initial(defaultCut, defaultPack));
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const notesId = useId();

  const upd =
    (k: keyof State) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please check the form",
        description: parsed.error.errors[0]?.message ?? "Some fields are invalid.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const message = [
        `Company: ${form.company}`,
        form.city ? `City: ${form.city}` : null,
        form.cut ? `Cut: ${form.cut}` : null,
        form.pack ? `Pack size: ${form.pack}` : null,
        form.monthly_volume ? `Monthly volume: ${form.monthly_volume} KG` : null,
        form.notes ? `\nNotes:\n${form.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke("submit-lead", {
        body: {
          source_type: "rfq",
          source_detail: sourceDetail,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          extra: {
            city: form.city,
            cut: form.cut,
            pack: form.pack,
            monthly_volume_kg: form.monthly_volume,
            landing_page: sourceDetail,
          },
        },
      });
      if (error) throw error;

      trackQuoteRequestClick({ buttonText: "Inline RFQ Submit", sourceSection: sourceDetail });
      setDone(true);
      toast({
        title: "Quotation request sent",
        description: "Our team will reply with pricing within 1 business day.",
      });
    } catch (err) {
      console.error("inline rfq failed", err);
      toast({
        title: "Could not send your request",
        description: "Please try again or email admin@thenilgiriroot.com.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
        <h3 className="font-display text-2xl text-foreground mb-2">Request received</h3>
        <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
          Thank you, {form.name.split(" ")[0]}. We've logged your request and will reach out to{" "}
          <span className="text-foreground">{form.email}</span> shortly with pricing and lead times.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 sm:p-7 lg:p-8 shadow-lg">
      <div className="mb-5">
        <h3 className="font-display text-xl sm:text-2xl text-foreground">{heading}</h3>
        <p className="font-body text-sm text-muted-foreground mt-1">{subheading}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <Input tabIndex={-1} autoComplete="off" value={form.website} onChange={upd("website")} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Your name" required maxLength={100} value={form.name} onChange={upd("name")} />
          <Field label="Company" required maxLength={120} value={form.company} onChange={upd("company")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Phone" required type="tel" inputMode="tel" maxLength={20} value={form.phone} onChange={upd("phone")} placeholder="+91 XXXXX XXXXX" />
          <Field label="Email" required type="email" inputMode="email" maxLength={160} value={form.email} onChange={upd("email")} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="City" value={form.city ?? ""} onChange={upd("city")} />
          <SelectField
            label="Cut"
            value={form.cut ?? ""}
            onChange={upd("cut")}
            options={["", "9mm", "10mm", "11mm", "Mixed"]}
          />
          <SelectField
            label="Pack size"
            value={form.pack ?? ""}
            onChange={upd("pack")}
            options={["", "500g", "1kg", "2.5kg", "Bulk"]}
          />
        </div>
        <Field
          label="Monthly volume (KG)"
          type="number"
          value={form.monthly_volume ?? ""}
          onChange={upd("monthly_volume")}
          placeholder="e.g. 500"
        />

        <div>
          <Label htmlFor={notesId} className="text-xs font-body text-muted-foreground mb-1.5 block">
            Requirements / notes
          </Label>
          <Textarea
            id={notesId}
            rows={3}
            value={form.notes ?? ""}
            onChange={upd("notes")}
            maxLength={1500}
            placeholder="Certifications, labelling, delivery location, payment terms…"
          />
        </div>

        <Button
          type="submit"
          disabled={sending}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full py-5 font-body disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          {sending ? "Sending…" : "Send quotation request"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {sending ? "Sending your quotation request" : ""}
        </p>
        <p className="text-2xs text-muted-foreground text-center font-body">
          We respond within 1 business day. No spam, ever.
        </p>
      </form>
    </div>
  );
}

/**
 * Labelled text input. See the matching helper in RfqDialog — same fix: the
 * label is bound to the control with a generated id so screen readers announce
 * the field name instead of "edit text, blank".
 */
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-body text-muted-foreground mb-1.5 block">
        {label}
        {required && (
          <span className="text-accent ml-0.5" aria-hidden="true">*</span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-required={required || undefined}
        inputMode={inputMode}
        maxLength={maxLength}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-body text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={onChange as unknown as React.ChangeEventHandler<HTMLSelectElement>}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "Any"}
          </option>
        ))}
      </select>
    </div>
  );
}
