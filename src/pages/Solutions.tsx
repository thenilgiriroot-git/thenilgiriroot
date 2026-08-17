import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import OptimizedImage from "@/components/OptimizedImage";
import SolutionGalleryDialog from "@/components/SolutionGalleryDialog";
import { solutionImages } from "@/assets/solutions";
import {
  Truck,
  Store,
  UtensilsCrossed,
  ChefHat,
  Boxes,
  Globe2,
  ZoomIn,
} from "lucide-react";

const solutions = [
  {
    key: "distributors",
    icon: Truck,
    image: solutionImages.distributors,
    alt: "Refrigerated distribution truck at a cold-chain warehouse loading dock",
    title: "Solutions for Distributors",
    summary:
      "Reliable, repeatable supply for regional and national frozen food distributors across India.",
    caption:
      "Cold-chain ready packaging, planned dispatch cycles and dedicated commercial support — built for distributors who can't afford supply gaps.",
    points: [
      "Consistent batch quality so resellers and HoReCa accounts get the same product every time.",
      "Planned dispatch cycles aligned to your route plans and warehouse cold storage capacity.",
      "Bulk packaging formats designed for stacking, palletisation and last-mile distribution.",
      "Dedicated commercial support for tenders, key accounts and seasonal volume spikes.",
    ],
  },
  {
    key: "retailers",
    icon: Store,
    image: solutionImages.retailers,
    alt: "Frozen french fries packs neatly arranged in supermarket freezer aisle",
    title: "Solutions for Retailers",
    summary:
      "Retail-ready frozen french fries for modern trade, regional supermarkets and specialty grocers.",
    caption:
      "Three shelf-friendly pack sizes, strong in-pack appearance and reliable replenishment so your freezer planogram stays in stock.",
    points: [
      "Shelf-friendly 500g, 1kg and 2.5kg pack sizes for different shopper baskets.",
      "Strong, consistent in-pack appearance and uniform fries that build repeat purchase.",
      "Private-label and co-branded packaging available on qualifying volumes.",
      "Reliable replenishment schedules to keep your freezer planogram in stock.",
    ],
  },
  {
    key: "restaurants",
    icon: UtensilsCrossed,
    image: solutionImages.restaurants,
    alt: "Chef serving a plate of golden crispy french fries in a restaurant kitchen",
    title: "Solutions for Restaurants & QSRs",
    summary:
      "Frozen french fries for restaurants and QSRs that demand uniform fry results, every shift.",
    caption:
      "Uniform 9/10/11mm cuts, predictable cook times and clean oil behaviour — standardise the fry across every location.",
    points: [
      "Three cut sizes — 9mm, 10mm and 11mm — to match your menu and frying equipment.",
      "Blast freezing locks colour, texture and freshness for a clean, just-made bite.",
      "Predictable cook times and oil behaviour to standardise kitchen SOPs.",
      "Account support for chain rollouts and multi-location procurement.",
    ],
  },
  {
    key: "foodservice",
    icon: ChefHat,
    image: solutionImages.foodservice,
    alt: "Hotel banquet kitchen team preparing large-volume food service trays",
    title: "Solutions for Food Service Buyers",
    summary:
      "For caterers, hotels, cloud kitchens and institutional food service operations.",
    caption:
      "FSSAI-aligned hygiene controls and flexible packaging formats designed around back-of-house workflows.",
    points: [
      "Volume planning and lead-time visibility so production never stalls.",
      "Hygiene and food safety controls aligned with FSSAI requirements.",
      "Flexible packaging formats for back-of-house workflows.",
      "Single point of contact for menu-wide frozen potato supply.",
    ],
  },
  {
    key: "bulk",
    icon: Boxes,
    image: solutionImages.bulk,
    alt: "Cold storage warehouse with stacked pallets of bulk frozen food cartons",
    title: "Solutions for Bulk Orders",
    summary:
      "Bulk frozen french fries supplier in India, built for serious B2B procurement.",
    caption:
      "Large-volume production cycles, transparent batch traceability and competitive bulk pricing on monthly or quarterly commitments.",
    points: [
      "Large-volume production cycles scheduled around your purchase plan.",
      "Transparent quality documentation and batch traceability.",
      "Competitive bulk pricing on confirmed monthly or quarterly commitments.",
      "Coordinated cold-chain dispatch to your hub or DC.",
    ],
  },
  {
    key: "export",
    icon: Globe2,
    image: solutionImages.export,
    alt: "Cargo shipping port with stacked containers and a container ship at sunset",
    title: "Solutions for Export Enquiries",
    summary:
      "Export-quality frozen french fries for international buyers and regional importers.",
    caption:
      "Export-grade hygiene, container-load logistics and destination-specific labelling — let's discuss your shipment plan.",
    points: [
      "Product produced to export-grade hygiene and packaging standards.",
      "Documentation support for international shipments on request.",
      "Engagement on container loads and recurring shipment schedules.",
      "Dialogue on destination-specific labelling and certification.",
    ],
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://thenilgiriroot.com" },
    { "@type": "ListItem", position: 2, name: "Solutions", item: "https://thenilgiriroot.com/solutions" },
  ],
};

export default function Solutions() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const openSolution = solutions.find((s) => s.key === openKey);

  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="Frozen French Fries Solutions for Retail, QSR & Distribution | The Nilgiri Root"
        description="Explore frozen french fries solutions for retailers, restaurants, QSRs, distributors and food service buyers with The Nilgiri Root."
        keywords="frozen french fries for restaurants, frozen french fries for distributors, bulk frozen french fries supplier, frozen fries for QSRs, food service frozen fries supplier, frozen fries supplier Tamil Nadu"
        jsonLd={breadcrumbJsonLd}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <ScrollStage>
          <header className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
              B2B Solutions
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Frozen French Fries Solutions for{" "}
              <span className="text-gradient-forest">Business Buyers</span>
            </h1>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              The Nilgiri Root is a frozen french fries manufacturer and supplier in India built
              around what serious B2B buyers actually need — consistent product, reliable supply,
              and packaging that fits the way you operate.
            </p>
          </header>
        </ScrollStage>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {solutions.map((s, i) => (
            <ScrollStage key={s.title} delay={i * 80}>
              <article className="glass-card h-full overflow-hidden flex flex-col">
                <button
                  type="button"
                  onClick={() => setOpenKey(s.key)}
                  aria-label={`Open ${s.title} gallery`}
                  className="group relative block w-full aspect-[16/10] bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <OptimizedImage
                    src={s.image.src}
                    webpSources={s.image.webp}
                    blurDataURI={s.image.blur}
                    alt={s.alt}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    width={1024}
                    height={640}
                    className="absolute inset-0 w-full h-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
                  <div className="pointer-events-none absolute top-4 left-4 p-2.5 rounded-xl bg-background/70 backdrop-blur-md border border-border/30">
                    <s.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <div className="pointer-events-none absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-md border border-border/30 px-3 py-1.5 text-2xs font-body text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3.5 w-3.5" /> View
                  </div>
                </button>
                <div className="p-6 sm:p-7 md:p-8 flex-1 flex flex-col">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {s.title}
                  </h2>
                  <p className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                    {s.summary}
                  </p>
                  <ul className="space-y-2">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="font-body text-muted-foreground text-xs sm:text-sm leading-relaxed flex gap-2"
                      >
                        <span className="text-accent shrink-0">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </ScrollStage>
          ))}
        </div>

        <ScrollStage delay={200}>
          <aside className="mt-12 sm:mt-16 text-center glass-card p-6 sm:p-8 md:p-10 rounded-2xl">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3">
              Start a Conversation
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to source frozen french fries for your business?
            </h2>
            <p className="font-body text-muted-foreground text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
              Tell us your monthly volume, packaging preference and delivery region. Our team will
              respond with pricing, lead times and dispatch options. You can also browse our{" "}
              <Link to="/products" className="text-accent hover:underline">products</Link> or check
              the <Link to="/faq" className="text-accent hover:underline">FAQs</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="bg-accent text-accent-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-body text-sm hover:bg-accent/90 transition-colors"
              >
                Request a Quote
              </Link>
              <Link
                to="/faq"
                className="border border-border/50 text-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-body text-sm hover:bg-muted transition-colors"
              >
                Read FAQs
              </Link>
            </div>
          </aside>
        </ScrollStage>
      </div>

      {openSolution && (
        <SolutionGalleryDialog
          open={!!openKey}
          onOpenChange={(o) => !o && setOpenKey(null)}
          title={openSolution.title}
          caption={openSolution.caption}
          alt={openSolution.alt}
          image={openSolution.image}
        />
      )}
    </main>
  );
}
