import { useState } from "react";
import { MessageCircle, Store, UtensilsCrossed, Check, Eye, EyeOff } from "lucide-react";
import ScrollStage from "@/components/ScrollStage";

// Supabase client (~44 KB gzipped) is only needed when a form is actually
// submitted, never to render it. A static import put it on the critical path
// of first paint on every page, because this component is reachable from the
// eagerly-loaded shell.
const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);

import {
  ALL_VARIANTS,
  buildWhatsAppLink,
  messageFor,
  type CtaType,
  type Variant,
} from "@/lib/whatsapp";

interface WhatsAppCTAProps {
  pageSource?: string;
  heading?: string;
  subheading?: string;
  initialVariants?: Variant[];
}

async function trackClick(type: CtaType, variants: Variant[], pageSource: string) {
  const supabase = await getSupabase();

  // 1) lightweight click analytics
  try {
    await supabase.from("whatsapp_clicks").insert({
      cta_type: type,
      variants,
      page_source: pageSource,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : null,
      country: typeof navigator !== "undefined" ? (navigator.language || null) : null,
    });
  } catch (e) {
    console.warn("click tracking failed", e);
  }
  // 2) capture as a lead (anonymous intent) so it lands in the sheet
  try {
    void supabase.functions.invoke("submit-lead", {
      body: {
        source_type: "whatsapp",
        source_detail: `${type}${variants.length ? ` · ${variants.join(",")}` : ""}`,
        message: messageFor(type, variants),
        page_url: typeof window !== "undefined" ? window.location.href : "",
        name: `WhatsApp ${type} intent`,
        extra: { cta_type: type, variants, page_source: pageSource, anonymous: true },
      },
    });
  } catch (e) {
    console.warn("whatsapp lead capture failed", e);
  }
}

function VariantChips({
  selected,
  onToggle,
}: {
  selected: Variant[];
  onToggle: (v: Variant) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {ALL_VARIANTS.map((v) => {
        const active = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all duration-200 ${
              active
                ? "bg-accent text-accent-foreground border-accent shadow-sm shadow-accent/30"
                : "bg-background/40 text-muted-foreground border-border/50 hover:border-accent/40"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {v}
          </button>
        );
      })}
    </div>
  );
}

function CtaCard({
  type,
  variants,
  setVariants,
  pageSource,
}: {
  type: CtaType;
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
  pageSource: string;
}) {
  const isDistributor = type === "distributor";
  const Icon = isDistributor ? Store : UtensilsCrossed;
  const title = isDistributor ? "For Distributors" : "For Restaurants & HORECA";
  const desc = isDistributor
    ? "Get trade pricing and territory terms for the variants you need."
    : "Bulk supply pricing for cafes, cloud kitchens, hotels and QSR chains.";

  const [showPreview, setShowPreview] = useState(false);

  const toggle = (v: Variant) =>
    setVariants(variants.includes(v) ? variants.filter((x) => x !== v) : [...variants, v]);

  const previewMessage = messageFor(type, variants);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    void trackClick(type, variants, pageSource);
    const url = buildWhatsAppLink(previewMessage);
    window.open(url, "_blank", "noopener,noreferrer");
    const params = new URLSearchParams({
      type,
      variants: variants.join(","),
    });
    setTimeout(() => {
      window.location.href = `/whatsapp-sent?${params.toString()}`;
    }, 400);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 sm:p-8 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent/10 text-accent mb-5 group-hover:scale-110 transition-transform duration-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="font-body text-muted-foreground text-sm sm:text-base mb-5 leading-relaxed">
          {desc}
        </p>

        <p className="font-body text-2xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Variants you're interested in
        </p>
        <VariantChips selected={variants} onToggle={toggle} />

        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className="inline-flex items-center gap-1.5 text-2xs font-body text-muted-foreground hover:text-accent transition-colors mb-3"
          aria-expanded={showPreview}
        >
          {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPreview ? "Hide message preview" : "Preview WhatsApp message"}
        </button>

        {showPreview && (
          <div className="mb-4 rounded-lg border border-border/40 bg-background/60 p-3 max-h-48 overflow-y-auto">
            <pre className="font-body text-2xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {variants.length === 0
                ? "Select at least one variant above to build your message."
                : previewMessage}
            </pre>
          </div>
        )}

        <a
          href={buildWhatsAppLink(previewMessage)}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={variants.length === 0}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
            variants.length === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
          <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );
}

export default function WhatsAppCTA({
  pageSource = "home",
  heading = "Talk to us in",
  subheading = "Pre-filled enquiry tailored to the variants you select. Choose the option that fits your business.",
  initialVariants = ALL_VARIANTS,
}: WhatsAppCTAProps) {
  const [distVariants, setDistVariants] = useState<Variant[]>(initialVariants);
  const [restVariants, setRestVariants] = useState<Variant[]>(initialVariants);

  return (
    <section className="py-16 sm:py-24 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/10" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollStage>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-5">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span className="font-body text-accent text-xs tracking-[0.25em] uppercase">
                Instant WhatsApp Quote
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              {heading} <span className="text-gradient-forest">one tap</span>
            </h2>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              {subheading}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
            <CtaCard
              type="distributor"
              variants={distVariants}
              setVariants={setDistVariants}
              pageSource={pageSource}
            />
            <CtaCard
              type="restaurant"
              variants={restVariants}
              setVariants={setRestVariants}
              pageSource={pageSource}
            />
          </div>
        </ScrollStage>
      </div>
    </section>
  );
}
