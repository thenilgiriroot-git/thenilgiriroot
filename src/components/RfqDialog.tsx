import { useState, useId, type ReactNode } from "react";
import { Loader2, ShoppingBag, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ALL_VARIANTS, type Variant } from "@/lib/whatsapp";
import { trackQuoteRequestClick } from "@/lib/analytics";

// Supabase client (~44 KB gzipped) is only needed when a form is actually
// submitted, never to render it. A static import put it on the critical path
// of first paint on every page, because this component is reachable from the
// eagerly-loaded shell.
const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);


interface Props {
  trigger: ReactNode;
  sourceSection?: string;
}

const initial = {
  company: "",
  name: "",
  designation: "",
  phone: "",
  email: "",
  gst: "",
  city: "",
  state: "",
  qty_9mm: "",
  qty_10mm: "",
  qty_11mm: "",
  monthly_volume: "",
  frequency: "Monthly",
  packaging: "Bulk",
  delivery_date: "",
  notes: "",
  website: "", // honeypot
};

export default function RfqDialog({ trigger, sourceSection = "rfq-dialog" }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const notesId = useId();

  const update = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const variantsRequested: Variant[] = ALL_VARIANTS.filter(
    (v) => Number(form[`qty_${v.replace("mm", "mm")}` as keyof typeof initial]) > 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.company.trim()) {
      toast({ title: "Missing details", description: "Name, company, phone and email are required.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const lines: string[] = [
        `Company: ${form.company}`,
        form.designation ? `Designation: ${form.designation}` : null,
        form.gst ? `GST: ${form.gst}` : null,
        form.city || form.state ? `Location: ${[form.city, form.state].filter(Boolean).join(", ")}` : null,
        "",
        "Quantities (KG):",
        form.qty_9mm ? `  • 9mm: ${form.qty_9mm}` : null,
        form.qty_10mm ? `  • 10mm: ${form.qty_10mm}` : null,
        form.qty_11mm ? `  • 11mm: ${form.qty_11mm}` : null,
        "",
        form.monthly_volume ? `Monthly volume: ${form.monthly_volume} KG` : null,
        `Frequency: ${form.frequency}`,
        `Packaging: ${form.packaging}`,
        form.delivery_date ? `Preferred delivery: ${form.delivery_date}` : null,
        form.notes ? `\nNotes:\n${form.notes}` : null,
      ].filter(Boolean) as string[];

      const message = lines.join("\n");

      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke("submit-lead", {
        body: {
          source_type: "rfq",
          source_detail: sourceSection,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          extra: {
            designation: form.designation,
            gst: form.gst,
            city: form.city,
            state: form.state,
            quantities_kg: { "9mm": form.qty_9mm, "10mm": form.qty_10mm, "11mm": form.qty_11mm },
            monthly_volume_kg: form.monthly_volume,
            frequency: form.frequency,
            packaging: form.packaging,
            delivery_date: form.delivery_date,
            variants_requested: variantsRequested,
          },
        },
      });
      if (error) throw error;

      trackQuoteRequestClick({ buttonText: "RFQ Submit", sourceSection });
      setDone(true);
      toast({ title: "Quotation request sent", description: "Our team will reply with pricing within 1 business day." });
    } catch (err) {
      console.error("rfq submit failed", err);
      toast({
        title: "Could not send your request",
        description: "Please try again or email admin@thenilgiriroot.com.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setForm(initial);
    setDone(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTimeout(reset, 300); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-10">
            <CheckCircle2 className="h-14 w-14 text-accent mx-auto mb-4" />
            <DialogTitle className="font-display text-2xl mb-2">Request received</DialogTitle>
            <p className="text-muted-foreground font-body text-sm mb-6 max-w-sm mx-auto">
              Thank you, {form.name.split(" ")[0]}. We've logged your quotation request and our team will reach out to{" "}
              <span className="text-foreground">{form.email}</span> shortly.
            </p>
            <Button onClick={() => setOpen(false)} className="rounded-full">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-accent" /> Request a Quotation
              </DialogTitle>
              <DialogDescription className="font-body">
                Share your requirement and we'll come back with pricing, lead times and packaging options.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Honeypot */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <Input tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Company" required value={form.company} onChange={update("company")} placeholder="Your business name" maxLength={120} />
                <Field label="GST number" value={form.gst} onChange={update("gst")} placeholder="Optional" maxLength={20} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Contact name" required value={form.name} onChange={update("name")} maxLength={100} />
                <Field label="Designation" value={form.designation} onChange={update("designation")} placeholder="e.g. Procurement" maxLength={80} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Phone" required type="tel" inputMode="tel" value={form.phone} onChange={update("phone")} placeholder="+91 XXXXX XXXXX" maxLength={20} />
                <Field label="Email" required type="email" inputMode="email" value={form.email} onChange={update("email")} placeholder="you@company.com" maxLength={160} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="City" value={form.city} onChange={update("city")} />
                <Field label="State" value={form.state} onChange={update("state")} />
              </div>

              <div className="border-t border-border/40 pt-4">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Quantities required (KG)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="9mm" type="number" value={form.qty_9mm} onChange={update("qty_9mm")} placeholder="0" />
                  <Field label="10mm" type="number" value={form.qty_10mm} onChange={update("qty_10mm")} placeholder="0" />
                  <Field label="11mm" type="number" value={form.qty_11mm} onChange={update("qty_11mm")} placeholder="0" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Monthly volume (KG)" type="number" value={form.monthly_volume} onChange={update("monthly_volume")} />
                <SelectField
                  label="Frequency"
                  value={form.frequency}
                  onChange={update("frequency")}
                  options={["One-time", "Weekly", "Monthly", "Quarterly"]}
                />
                <SelectField
                  label="Packaging"
                  value={form.packaging}
                  onChange={update("packaging")}
                  options={["Bulk", "Retail-ready", "Private label", "Custom"]}
                />
              </div>

              <Field label="Preferred delivery date" type="date" value={form.delivery_date} onChange={update("delivery_date")} />

              <div>
                <Label htmlFor={notesId} className="text-xs font-body text-muted-foreground mb-1.5 block">
                  Notes / special requirements
                </Label>
                <Textarea id={notesId} rows={3} value={form.notes} onChange={update("notes")} maxLength={2000}
                  placeholder="Certifications, labelling, payment terms…" />
              </div>

              <Button type="submit" disabled={sending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full py-5 font-body disabled:opacity-60 disabled:cursor-not-allowed">
                {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
                {sending ? "Sending request…" : "Send quotation request"}
              </Button>
              {/* Announced to screen readers without stealing focus. */}
              <p aria-live="polite" className="sr-only">
                {sending ? "Sending your quotation request" : ""}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * A labelled text input.
 *
 * The label is bound to the control with a generated id. Previously neither
 * this form nor InlineRfqForm associated a single label with its input — a
 * screen-reader user tabbing the primary lead-capture form heard "edit text,
 * blank" on every field. useId keeps ids unique even though RfqDialog is
 * mounted several times per page (navbar desktop, navbar mobile, page CTAs).
 *
 * Required fields are marked with the `required` attribute rather than only a
 * "*" in the label text, so assistive tech announces the constraint instead of
 * reading out a stray asterisk.
 */
function Field({
  label, value, onChange, type = "text", placeholder, required = false, inputMode, maxLength,
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
  label, value, onChange, options,
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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
