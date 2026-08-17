import { useEffect, useState } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, ShoppingBag, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import InlineRfqForm from "@/components/InlineRfqForm";
import { LANDING_PAGES_BY_SLUG, type LandingPageData } from "@/data/landingPages";

const SITE_URL = "https://thenilgiriroot.com";

function buildJsonLd(p: LandingPageData) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Nilgiri Root",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.webp`,
      description:
        "Frozen french fries manufacturer and supplier in India — blast frozen at source from Nilgiri mountain potatoes.",
      sameAs: [],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${p.slug}#webpage`,
      url: `${SITE_URL}/${p.slug}`,
      name: p.seoTitle,
      description: p.metaDescription,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: p.h1, item: `${SITE_URL}/${p.slug}` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  if (p.kind === "location") {
    graph.push({
      "@type": "LocalBusiness",
      name: "The Nilgiri Root",
      url: SITE_URL,
      telephone: "+91-75399-31361",
      email: "admin@thenilgiriroot.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Sholur",
        addressLocality: "The Nilgiris",
        addressRegion: "Tamil Nadu",
        postalCode: "643005",
        addressCountry: "IN",
      },
      areaServed: ["India", "GCC", "Africa", "South-East Asia"],
    });
  }

  if (p.productSchema) {
    graph.push({
      "@type": "Product",
      name: p.productSchema.name,
      sku: p.productSchema.sku,
      description: p.productSchema.description,
      brand: { "@type": "Brand", name: "The Nilgiri Root" },
      category: "Frozen French Fries",
      offers: {
        "@type": "AggregateOffer",
        availability: "https://schema.org/InStock",
        priceCurrency: "INR",
        offerCount: 3,
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Sticky "Request a Quote" button — appears once user scrolls past hero */
function StickyCta({ onJump }: { onJump: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-5 right-5 z-40 lg:hidden">
      <Button
        onClick={onJump}
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full shadow-2xl shadow-accent/30 font-body"
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Request a Quote
      </Button>
    </div>
  );
}

interface LandingPageProps {
  /** Slug supplied directly by the route definition. */
  slug?: string;
}

/**
 * SEO landing page.
 *
 * Slug resolution order: the explicit prop, then a `:slug` route param, then
 * the pathname.
 *
 * The prop is what actually matters. These routes are registered as literal
 * paths (`/frozen-french-fries-9mm`, not `/:slug`), so `useParams()` returns
 * an empty object — this component read `params.slug`, got undefined, and
 * redirected every one of the thirteen landing pages to the 404. The pathname
 * fallback means the page still resolves even if a route is ever added without
 * passing the prop.
 */
export default function LandingPage({ slug: slugProp }: LandingPageProps) {
  const params = useParams<{ slug: string }>();
  const location = useLocation();

  const slug = slugProp ?? params.slug ?? location.pathname.replace(/^\/+|\/+$/g, "");
  const data = slug ? LANDING_PAGES_BY_SLUG[slug] : undefined;

  if (!data) return <Navigate to="/404" replace />;

  const jumpToRfq = () => {
    const el = document.getElementById("rfq");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title={data.seoTitle}
        description={data.metaDescription}
        keywords={[data.keyword, ...data.secondaryKeywords].join(", ")}
        canonical={`${SITE_URL}/${data.slug}`}
        jsonLd={buildJsonLd(data)}
      />

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4 flex items-center gap-2">
            {data.kind === "location" && <MapPin className="h-3.5 w-3.5" />}
            {data.eyebrow}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.05]">
            {data.h1}
          </h1>
          <p className="font-body text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
            {data.intro}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              onClick={jumpToRfq}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-body"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Request a Quote
            </Button>
            <Link to="/products">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-body border-border/60"
              >
                See all products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.header>
      </section>

      {/* Trust strip */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <ul className="flex flex-wrap gap-2 sm:gap-3">
          {data.trust.map((t) => (
            <li
              key={t}
              className="text-xs sm:text-sm font-body px-3 sm:px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Body grid: sections + RFQ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14 grid lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-14 items-start">
        <article className="space-y-10 min-w-0">
          {data.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-3">
                {s.heading}
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed">{s.body}</p>
              {s.bullets && (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 font-body text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Use cases */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 sm:p-7">
            <h2 className="font-display text-xl sm:text-2xl text-foreground mb-4">
              Buyers we serve
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {data.useCases.map((u) => (
                <li
                  key={u}
                  className="flex items-start gap-2 font-body text-sm text-foreground/90"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-4">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-display text-left text-base sm:text-lg">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Internal links */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 sm:p-7">
            <h2 className="font-display text-xl sm:text-2xl text-foreground mb-4">
              Explore related pages
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {data.internalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="font-body text-sm text-foreground/85 hover:text-accent transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Sticky-on-desktop RFQ */}
        <aside id="rfq" className="lg:sticky lg:top-28">
          <InlineRfqForm
            sourceDetail={`lp_${data.slug}`}
            defaultCut={data.defaultCut ?? ""}
            defaultPack={data.defaultPack ?? ""}
            heading="Request a Quote"
            subheading={`Pricing for ${data.keyword.toLowerCase()} — within 1 business day.`}
          />
        </aside>
      </section>

      <StickyCta onJump={jumpToRfq} />
    </main>
  );
}
