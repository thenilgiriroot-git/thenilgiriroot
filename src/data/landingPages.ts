/**
 * SEO Landing Page Definitions
 *
 * Each entry powers a flat-slug route rendered by <LandingPage>.
 * Designed for high commercial / local intent on Google.
 *
 * Conventions:
 *  - `slug` is appended to https://www.thenilgiriroot.com/ (no leading slash here)
 *  - `keyword` is the single primary phrase. Use it ONCE in title, H1, intro.
 *  - `secondaryKeywords` = semantic variations used naturally across sections.
 *  - `kind` controls subtle template variants ("location" | "buyer" | "size" | "pack").
 *  - `defaultCut` / `defaultPack` pre-fill the inline RFQ form.
 */

export type LandingKind = "location" | "buyer" | "size" | "pack" | "exporter";

export interface LandingFAQ {
  q: string;
  a: string;
}

export interface LandingSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LandingPageData {
  slug: string;
  kind: LandingKind;
  keyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  intro: string;
  /** 4 narrative sections (specs, sourcing, packaging, service area, etc.) */
  sections: LandingSection[];
  /** 4–6 buyer use-cases / value props as bullets */
  useCases: string[];
  /** Trust strip items (FSSAI, blast frozen, etc.) */
  trust: string[];
  faqs: LandingFAQ[];
  defaultCut?: "9mm" | "10mm" | "11mm" | "";
  defaultPack?: "500g" | "1kg" | "2.5kg" | "Bulk" | "";
  /** Internal link recommendations: slugs of other landing/site pages */
  internalLinks: { label: string; to: string }[];
  /** Optional product schema (for size pages) */
  productSchema?: {
    name: string;
    description: string;
    sku: string;
  };
}

/* --------------------------------- shared --------------------------------- */

const COMMON_TRUST = [
  "FSSAI Licensed (12426021000002)",
  "Blast Frozen at Source",
  "100% Nilgiri Mountain Potatoes",
  "Pan-India + Export Despatch",
];

const COMMON_LINKS = [
  { label: "All Products & Cuts", to: "/products" },
  { label: "Our Process", to: "/process" },
  { label: "B2B Solutions", to: "/solutions" },
  { label: "Contact / Visit", to: "/contact" },
];

/* ============================== LOCATION PAGES ============================ */

const indiaPage: LandingPageData = {
  slug: "frozen-french-fries-manufacturer-in-india",
  kind: "location",
  keyword: "frozen french fries manufacturer in India",
  secondaryKeywords: [
    "frozen french fries supplier in India",
    "frozen potato products manufacturer",
    "IQF french fries manufacturer",
    "frozen fries factory India",
  ],
  seoTitle: "Frozen French Fries Manufacturer in India | The Nilgiri Root",
  metaDescription:
    "The Nilgiri Root is a frozen french fries manufacturer in India supplying distributors, retailers, restaurants, QSRs and exporters. FSSAI certified, blast frozen, 9mm/10mm/11mm cuts. Request a quote today.",
  h1: "Frozen French Fries Manufacturer in India",
  eyebrow: "Made in India · Despatched Pan-India & Export",
  intro:
    "We are a frozen french fries manufacturer based in the Nilgiri Hills of Tamil Nadu, India, supplying premium blast-frozen fries to distributors, wholesalers, retailers, hotels, restaurants, QSR chains and exporters across the country. Every kilo is built from 100% Nilgiri mountain potatoes, par-fried in food-grade oil and locked in by IQF blast freezing at source — so the fries you receive crisp up exactly the way they were designed to.",
  sections: [
    {
      heading: "Built for Indian Buyers — Distributors, HORECA, Retail and Export",
      body: "Our facility is set up for B2B order volumes. Whether you are a regional frozen-foods distributor, a national QSR chain, an HORECA buyer, a modern-trade retailer, a quick-commerce dark store, or an export house, we ship in your preferred pack size and frequency. We support recurring monthly contracts as well as one-time bulk orders.",
      bullets: [
        "Distributors & wholesalers — pallet-level orders",
        "HORECA, hotels & cloud kitchens — recurring weekly supply",
        "QSRs & casual dining chains — uniform cut, consistent yield",
        "Modern trade & quick-commerce — retail-ready 500g / 1kg packs",
        "Exporters — IQF, master cartons, container loads",
      ],
    },
    {
      heading: "Three Cuts, Three Pack Sizes — One Quality Standard",
      body: "We manufacture three core cuts of frozen french fries — straight cut 9mm, 10mm and 11mm — each available in 500g, 1kg and 2.5kg consumer packs as well as bulk master cartons for food-service and export. The same blast-frozen quality applies across every SKU.",
    },
    {
      heading: "Cold-Chain Despatch Across India",
      body: "We despatch from the Nilgiris (Tamil Nadu) using validated reefer partners, with regular service to Bangalore, Chennai, Coimbatore, Kochi, Hyderabad, Mumbai, Pune, Delhi NCR, Kolkata and Goa. Export-ready documentation and container loading are available for international buyers.",
    },
    {
      heading: "Why Indian Buyers Choose The Nilgiri Root",
      body: "Most buyers source frozen fries on price alone — and pay for it later in shrinkage, oil absorption and inconsistent yield. We optimise for the things that actually drive your unit economics: uniform cut, low oil pickup, consistent crisp, and a predictable cold chain.",
      bullets: [
        "FSSAI Licensed Manufacturer — License No. 12426021000002",
        "100% Nilgiri-grown potatoes — high solids, low sugar, ideal for frying",
        "Blast frozen at source — preserves texture and reduces ice crystallisation",
        "Sized for Indian buyers — pack formats matched to your channel",
      ],
    },
  ],
  useCases: [
    "Distributors & wholesalers building frozen-foods portfolios",
    "Hotel groups and HORECA buyers needing consistent supply",
    "QSR and casual-dining chains with multi-outlet roll-outs",
    "Retailers and quick-commerce operators stocking 500g / 1kg packs",
    "Export houses shipping IQF fries to GCC, Africa & SE Asia",
    "Cloud kitchens, food courts and institutional caterers",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: "Are you a manufacturer or a reseller?",
      a: "We are a manufacturer. Our facility is in the Nilgiri Hills of Tamil Nadu and we manage the full chain — from sourcing Nilgiri potatoes, washing, peeling, cutting, blanching, par-frying, blast freezing, packing and despatch.",
    },
    {
      q: "Do you supply across India?",
      a: "Yes. We despatch pan-India via validated reefer partners. We have regular routes to Bangalore, Chennai, Coimbatore, Kochi, Hyderabad, Mumbai, Pune, Delhi NCR, Kolkata and Goa, and we can quote on any other destination.",
    },
    {
      q: "What is the minimum order quantity?",
      a: "MOQs depend on cut, pack size and destination. Share your requirement via the form and we'll come back with a quote, MOQ and lead time tailored to your channel.",
    },
    {
      q: "Do you offer private label or contract manufacturing?",
      a: "Yes. We offer private label packaging in 500g, 1kg and 2.5kg formats as well as bulk packs. Share your brand requirements and we'll send a private-label proposal.",
    },
    {
      q: "Do you export?",
      a: "Yes. We supply export-quality IQF frozen french fries with full documentation. Reach out with your destination port and required volume.",
    },
  ],
  internalLinks: [
    { label: "Manufacturer in Ooty (Nilgiris)", to: "/frozen-french-fries-manufacturer-in-ooty" },
    { label: "Manufacturer near Coimbatore", to: "/frozen-french-fries-manufacturer-near-coimbatore" },
    { label: "Frozen french fries exporter", to: "/frozen-french-fries-exporter-india" },
    { label: "9mm fries", to: "/frozen-french-fries-9mm" },
    { label: "10mm fries", to: "/frozen-french-fries-10mm" },
    { label: "11mm fries", to: "/frozen-french-fries-11mm" },
    ...COMMON_LINKS,
  ],
};

const ootyPage: LandingPageData = {
  slug: "frozen-french-fries-manufacturer-in-ooty",
  kind: "location",
  keyword: "frozen french fries manufacturer in Ooty",
  secondaryKeywords: [
    "frozen french fries Nilgiris",
    "frozen french fries manufacturers Nilgiris",
    "frozen french fries dealers in Ooty",
    "frozen french fries suppliers in Ooty",
    "Ooty potato fries",
  ],
  seoTitle: "Frozen French Fries Manufacturer in Ooty, Nilgiris | The Nilgiri Root",
  metaDescription:
    "Local frozen french fries manufacturer in Ooty (the Nilgiris). Made from Nilgiri mountain potatoes, blast frozen at source, FSSAI certified. Supplying distributors, hotels and exporters. Request a quote.",
  h1: "Frozen French Fries Manufacturer in Ooty, Nilgiris",
  eyebrow: "From the Nilgiri Hills · Sholur, Tamil Nadu",
  intro:
    "The Nilgiri Root is a frozen french fries manufacturer based in Ooty, in the Nilgiri Hills of Tamil Nadu. Our facility sits at altitude in Sholur, surrounded by the same potato fields our brand was built on. Because we manufacture and freeze in the hills — not after a long road journey — our fries lock in better texture, lower sugar darkening, and a cleaner finish on the plate.",
  sections: [
    {
      heading: "Why Ooty? The Nilgiri Potato Advantage",
      body: "Nilgiri-grown potatoes are prized for high solids, low sugars and a starch profile that fries beautifully. The cool altitude slows respiration after harvest, which means our raw material reaches the line in better condition than potatoes trucked from the plains. The result is fries with a crisper exterior, fluffier centre and a more golden, even colour after frying.",
    },
    {
      heading: "Manufactured & Blast Frozen in the Nilgiris",
      body: "Our complete process — washing, peeling, cutting, blanching, par-frying, IQF blast freezing, packaging — happens in the Nilgiris. Freezing at source eliminates the temperature abuse that causes ice crystallisation, broken fries and inconsistent crisp.",
      bullets: [
        "Located in Sholur, The Nilgiris (Tamil Nadu)",
        "End-to-end manufacturing under one roof",
        "Blast freezing at source — not at a downstream cold store",
        "FSSAI Licensed (12426021000002)",
      ],
    },
    {
      heading: "Local Despatch — Ooty, Coonoor, Mettupalayam, Coimbatore",
      body: "We supply local hotels, resorts, cloud kitchens and distributors across Ooty, Coonoor, Kotagiri, Mettupalayam and into Coimbatore on a regular schedule, with cold-chain delivery options for short-haul orders.",
    },
    {
      heading: "Buyers We Work With in & Around Ooty",
      body: "From boutique resorts in Ooty and Coonoor to QSR chains expanding into Tier-2 Tamil Nadu, our buyer mix is varied. The common thread: they care about consistency.",
      bullets: [
        "Hotels and resorts in Ooty, Coonoor and Kotagiri",
        "Cafes, cloud kitchens and casual dining",
        "Local distributors stocking modern trade and kirana",
        "Wedding caterers and event kitchens",
      ],
    },
  ],
  useCases: [
    "Hotels & resorts in Ooty / Coonoor needing reliable frozen fries",
    "Local distributors building a Nilgiris frozen-foods portfolio",
    "Cafes and cloud kitchens serving the tourist circuit",
    "QSRs in Coimbatore wanting a hill-sourced supplier",
    "Caterers and event kitchens for weddings and conferences",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: "Where exactly is your facility?",
      a: "Sholur, The Nilgiris, Tamil Nadu — within the Nilgiri Hills, close to Ooty.",
    },
    {
      q: "Do you supply hotels and restaurants in Ooty and Coonoor directly?",
      a: "Yes. We supply hotels, resorts, cafes and cloud kitchens across Ooty, Coonoor, Kotagiri and Mettupalayam, on weekly or monthly schedules.",
    },
    {
      q: "Are you a frozen french fries dealer or supplier in Ooty?",
      a: "We are the manufacturer — so when you buy from us, you are buying directly from the source, not from a reseller.",
    },
    {
      q: "Can I visit your facility?",
      a: "Trade visits are welcome by appointment. Reach out via the contact page to schedule.",
    },
  ],
  internalLinks: [
    { label: "Manufacturer in India (overview)", to: "/frozen-french-fries-manufacturer-in-india" },
    { label: "Manufacturer near Coimbatore", to: "/frozen-french-fries-manufacturer-near-coimbatore" },
    { label: "HORECA supplier", to: "/frozen-french-fries-horeca-supplier" },
    ...COMMON_LINKS,
  ],
};

const coimbatorePage: LandingPageData = {
  slug: "frozen-french-fries-manufacturer-near-coimbatore",
  kind: "location",
  keyword: "frozen french fries manufacturer near Coimbatore",
  secondaryKeywords: [
    "frozen french fries supplier Coimbatore",
    "frozen french fries Tamil Nadu",
    "frozen fries supplier Tamil Nadu",
    "frozen potato products Coimbatore",
  ],
  seoTitle: "Frozen French Fries Manufacturer Near Coimbatore | The Nilgiri Root",
  metaDescription:
    "Frozen french fries manufacturer near Coimbatore — based in the Nilgiri Hills, just hours from Coimbatore. Supplying QSRs, hotels, distributors and exporters. FSSAI certified. Request a quote.",
  h1: "Frozen French Fries Manufacturer Near Coimbatore",
  eyebrow: "Nilgiris → Coimbatore · Short-haul cold chain",
  intro:
    "We manufacture premium frozen french fries in the Nilgiri Hills, just a few hours from Coimbatore — making us one of the closest manufacturer sources for buyers across Coimbatore, Tirupur, Erode, Salem and the wider western Tamil Nadu region. The short distance keeps cold-chain costs low and lead times predictable.",
  sections: [
    {
      heading: "Close to Coimbatore — Practical Cold-Chain Logistics",
      body: "For Coimbatore buyers, sourcing frozen fries from a manufacturer in Maharashtra or Gujarat means longer reefer runs, higher freight, and more risk of temperature excursions. Our Nilgiris facility is a short-haul drive from Coimbatore — which means fresher despatch dates, lower freight per kilo, and the option of more frequent smaller orders if you prefer.",
    },
    {
      heading: "Who We Supply Around Coimbatore",
      body: "Our buyer base in the western Tamil Nadu belt includes QSRs, hotels and resorts, cloud kitchens, distributors stocking modern trade and kirana, and food-service contractors supplying corporate canteens.",
      bullets: [
        "QSRs & casual dining chains in Coimbatore",
        "Hotels, resorts and cafes",
        "Cloud kitchens and food aggregator partners",
        "Distributors covering Tirupur, Erode, Salem, Pollachi",
        "Institutional & corporate caterers",
      ],
    },
    {
      heading: "Pack Sizes Suited to Western Tamil Nadu",
      body: "We supply 500g, 1kg and 2.5kg consumer packs for retail, plus bulk packs for food-service and export. Cuts available: straight cut 9mm, 10mm and 11mm.",
    },
    {
      heading: "Quality Backed by the Nilgiri Sourcing Story",
      body: "Buyers near Coimbatore choose us not only for proximity but for the underlying raw material. Nilgiri-grown potatoes are higher in solids and lower in sugars, which directly translates to better fry colour, lower oil pickup and a crisper finished product.",
    },
  ],
  useCases: [
    "QSR & casual-dining chains in Coimbatore",
    "Hotels and resorts across western Tamil Nadu",
    "Distributors covering Tirupur, Erode, Salem, Pollachi",
    "Cloud kitchens and food-aggregator partners",
    "Industrial caterers and corporate canteens",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: "How far is your facility from Coimbatore?",
      a: "We are based in Sholur, in the Nilgiris — a short-haul cold-chain run from Coimbatore. This is one of the closest manufacturer-direct frozen french fries sources for buyers in the western Tamil Nadu belt.",
    },
    {
      q: "Do you deliver to Coimbatore directly?",
      a: "Yes — we operate validated reefer cold-chain delivery to Coimbatore and onward to Tirupur, Erode, Salem and Pollachi.",
    },
    {
      q: "Can I get smaller, more frequent orders?",
      a: "Because the lane is short, smaller and more frequent orders are commercially viable for Coimbatore-area buyers. Discuss your schedule with us during the quote.",
    },
  ],
  internalLinks: [
    { label: "Manufacturer in Ooty", to: "/frozen-french-fries-manufacturer-in-ooty" },
    { label: "Manufacturer in India", to: "/frozen-french-fries-manufacturer-in-india" },
    { label: "Distributor / wholesale supplier", to: "/frozen-french-fries-distributor-wholesale" },
    ...COMMON_LINKS,
  ],
};

/* ============================== EXPORTER PAGE ============================= */

const exporterPage: LandingPageData = {
  slug: "frozen-french-fries-exporter-india",
  kind: "exporter",
  keyword: "frozen french fries exporter India",
  secondaryKeywords: [
    "frozen french fries exporters",
    "export quality frozen french fries",
    "IQF french fries manufacturer",
    "frozen potato products exporter India",
  ],
  seoTitle: "Frozen French Fries Exporter from India | The Nilgiri Root",
  metaDescription:
    "Export-quality frozen french fries from India. IQF blast frozen, FSSAI certified, supplied in master cartons and container loads. We export to GCC, Africa, South-East Asia and beyond. Request a quote.",
  h1: "Frozen French Fries Exporter from India",
  eyebrow: "IQF · Container loads · Full export documentation",
  intro:
    "We are an India-based frozen french fries exporter supplying IQF blast-frozen fries in master cartons and full container loads. Our fries are made from Nilgiri mountain potatoes, par-fried in food-grade oil and individually quick frozen at source — engineered to survive long-haul reefer logistics without losing texture or colour.",
  sections: [
    {
      heading: "Built for Long-Haul Reefer Logistics",
      body: "Export buyers care about one thing above all: that the product they receive at destination port is the same product that left the factory. Our IQF process and master-carton formats are designed exactly for that — minimal ice crystallisation, fries that don't clump, and a crisp that holds after thaw and re-fry.",
    },
    {
      heading: "Markets We Currently Quote",
      body: "We actively quote buyers in the Gulf (UAE, Saudi Arabia, Oman, Qatar, Kuwait, Bahrain), Africa (Kenya, Tanzania, Nigeria, South Africa), and South-East Asia (Singapore, Malaysia, Sri Lanka, Maldives). Other destinations on request.",
      bullets: [
        "GCC: UAE, KSA, Oman, Qatar, Kuwait, Bahrain",
        "Africa: Kenya, Tanzania, Nigeria, South Africa",
        "SE Asia: Singapore, Malaysia, Sri Lanka, Maldives",
        "Other destinations on request",
      ],
    },
    {
      heading: "Export Pack Formats",
      body: "Standard export packs are 2.5kg consumer-grade and bulk master cartons sized to optimise container fill. Private-label and brand-customised packs available for distributors and importers.",
    },
    {
      heading: "Documentation & Compliance",
      body: "We provide the full set of export documentation — commercial invoice, packing list, certificate of origin, phytosanitary as applicable, and FSSAI export endorsement. We work with experienced freight forwarders out of Chennai, Cochin and Tuticorin.",
    },
  ],
  useCases: [
    "Importers & distributors of frozen foods",
    "HORECA distributors in GCC and SE Asia",
    "Private-label brands sourcing from India",
    "Re-packers and food-service wholesalers",
    "Hotel groups with central cold-storage",
  ],
  trust: [...COMMON_TRUST, "Container Loads & FCL"],
  faqs: [
    {
      q: "Do you handle FCL container loads?",
      a: "Yes. We routinely quote and load 20ft and 40ft reefer FCLs for export buyers.",
    },
    {
      q: "Which port do you ship from?",
      a: "Most commonly Chennai, Cochin and Tuticorin. We work with experienced freight forwarders for each route.",
    },
    {
      q: "Can you do private label for export?",
      a: "Yes. Share your brand artwork and pack format and we'll come back with a private-label proposal.",
    },
    {
      q: "What documentation do you provide?",
      a: "Commercial invoice, packing list, certificate of origin, phytosanitary as applicable, and FSSAI export endorsement.",
    },
  ],
  internalLinks: [
    { label: "Manufacturer in India", to: "/frozen-french-fries-manufacturer-in-india" },
    { label: "Distributor / wholesale supplier", to: "/frozen-french-fries-distributor-wholesale" },
    { label: "All Products & Cuts", to: "/products" },
    { label: "Contact / Visit", to: "/contact" },
  ],
};

/* ============================== BUYER PAGES =============================== */

const horecaPage: LandingPageData = {
  slug: "frozen-french-fries-horeca-supplier",
  kind: "buyer",
  keyword: "frozen french fries HORECA supplier",
  secondaryKeywords: [
    "french fries HORECA supplier",
    "french fries hotel supplier India",
    "restaurant frozen french fries supplier",
    "ready to fry frozen french fries",
  ],
  seoTitle: "Frozen French Fries HORECA Supplier in India | The Nilgiri Root",
  metaDescription:
    "Reliable HORECA supplier of frozen french fries — built for hotels, restaurants and catering operators. Consistent cut, low oil pickup, FSSAI certified, recurring delivery. Request a quote.",
  h1: "Frozen French Fries Supplier for HORECA",
  eyebrow: "Hotels · Restaurants · Catering",
  intro:
    "We supply hotels, restaurants and catering operators with frozen french fries that are built for service-line consistency. Our HORECA buyers pick The Nilgiri Root because every carton fries up the same way — same colour, same crisp, same yield — across busy services and across multiple outlets.",
  sections: [
    {
      heading: "Cut Consistency That Survives a Busy Service",
      body: "When fries vary in length and thickness, your fryer can't be calibrated — small fries burn while big ones stay raw. Our straight cuts (9mm, 10mm, 11mm) are uniform within tight tolerance, so your fryer programme works every time.",
    },
    {
      heading: "Lower Oil Pickup, Higher Yield",
      body: "Lower oil pickup means longer oil life on your fryer, less greasy plates, and better gross margin per portion. The combination of Nilgiri raw material and our par-fry profile is engineered to keep oil absorption in check.",
      bullets: [
        "Uniform cut size = predictable fry time",
        "Low oil pickup = longer oil life, better margin",
        "Consistent colour = no rejected plates",
        "Crisp holds longer under heat lamps and on delivery",
      ],
    },
    {
      heading: "Pack Formats That Work in a Real Kitchen",
      body: "Bulk packs for high-volume kitchens, 2.5kg packs for mid-volume, and 1kg packs for boutique operations. We also work with central commissaries and cloud-kitchen operators on dedicated SKUs.",
    },
    {
      heading: "Recurring Supply With Predictable Lead Times",
      body: "Most HORECA buyers move to a weekly or fortnightly schedule with us after the first quarter. Predictable cold-chain lead times and a single point of contact make multi-outlet planning much simpler.",
    },
  ],
  useCases: [
    "Hotel chains & resort groups",
    "Casual dining & fine-dining restaurants",
    "Cloud kitchens and aggregator brands",
    "Banquet, wedding & event caterers",
    "Corporate, institutional and airline catering",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: "Which cut should a hotel kitchen use?",
      a: "Most all-day-dining menus settle on 10mm — a great balance of crisp shell and tender centre. Steakhouses and premium plates often prefer 11mm; QSR-style pickup orders use 9mm for fast cook time.",
    },
    {
      q: "Do you deliver weekly?",
      a: "Yes. Once an account stabilises, most HORECA buyers move to a weekly or fortnightly schedule.",
    },
    {
      q: "Can you supply multiple outlets?",
      a: "Yes — we routinely supply hotel and restaurant groups with multiple outlets, with consolidated invoicing and a single point of contact.",
    },
    {
      q: "Are your fries ready to fry?",
      a: "Yes. They are par-fried and blast frozen — straight from freezer to fryer, no thawing required.",
    },
  ],
  internalLinks: [
    { label: "QSR supplier", to: "/frozen-french-fries-qsr-supplier" },
    { label: "Distributor / wholesale", to: "/frozen-french-fries-distributor-wholesale" },
    { label: "10mm fries (HORECA favourite)", to: "/frozen-french-fries-10mm" },
    ...COMMON_LINKS,
  ],
};

const qsrPage: LandingPageData = {
  slug: "frozen-french-fries-qsr-supplier",
  kind: "buyer",
  keyword: "frozen french fries QSR supplier",
  secondaryKeywords: [
    "french fries QSR supplier",
    "french fries Q commerce supplier",
    "ready to fry frozen french fries",
    "frozen french fries 9mm",
  ],
  seoTitle: "Frozen French Fries Supplier for QSR & Quick Commerce | The Nilgiri Root",
  metaDescription:
    "Frozen french fries supplier for QSR chains, food courts and quick-commerce dark stores. Fast cook time, uniform 9mm/10mm cut, low oil pickup, recurring supply. FSSAI certified. Request a quote.",
  h1: "Frozen French Fries Supplier for QSRs & Quick Commerce",
  eyebrow: "QSRs · Food courts · Q-commerce dark stores",
  intro:
    "QSRs win or lose on cook time, plate consistency and unit economics. We supply frozen french fries engineered for exactly those metrics — fast-cooking 9mm and balanced 10mm cuts with low oil pickup and tight size tolerance, packed for high-throughput kitchens and quick-commerce dark-store operations.",
  sections: [
    {
      heading: "Fast Cook Time, Consistent Plate",
      body: "9mm cooks fastest — perfect for QSR pickup and delivery windows. 10mm gives a slightly more substantial bite for casual dining. Both are produced to a tight size tolerance so your fryer programmes stay calibrated across shifts and outlets.",
    },
    {
      heading: "Built for Multi-Outlet Roll-Outs",
      body: "Whether you operate 5 outlets or 50, our manufacturing capacity, recurring supply schedule and single-point-of-contact account management are built around multi-outlet QSR brands. We work with central commissaries as well as direct-to-outlet despatch.",
      bullets: [
        "Tight size tolerance for fryer calibration",
        "Low oil pickup → better unit economics",
        "Crisp holds during delivery (food aggregator orders)",
        "Direct-to-outlet or commissary despatch",
      ],
    },
    {
      heading: "Quick Commerce & Dark Store Friendly",
      body: "For quick-commerce operators we supply 500g and 1kg consumer-ready packs that ship cleanly through dark-store cold chains. Master cartons sized for dark-store pick efficiency.",
    },
    {
      heading: "Why QSR Operators Pick The Nilgiri Root",
      body: "Predictable supply, predictable plate, predictable cost per portion. Plus a sourcing story (Nilgiri mountain potatoes) you can credibly tell on your menu.",
    },
  ],
  useCases: [
    "QSR chains and food courts",
    "Burger, sandwich and chicken concepts",
    "Cloud kitchens and aggregator brands",
    "Quick-commerce dark stores (10–30 min delivery)",
    "Institutional food service",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: "Which cut works best for a QSR?",
      a: "9mm is the QSR favourite — fast cook time, uniform colour, holds crisp during delivery. 10mm is preferred for casual-dining-style QSR brands.",
    },
    {
      q: "Can you supply 50+ outlets?",
      a: "Yes. We have the capacity and the cold-chain partners to support multi-outlet QSR roll-outs across India.",
    },
    {
      q: "Do you support quick-commerce dark stores?",
      a: "Yes. We supply 500g and 1kg consumer packs sized for dark-store pick efficiency, with master cartons configured accordingly.",
    },
  ],
  internalLinks: [
    { label: "9mm fries (QSR favourite)", to: "/frozen-french-fries-9mm" },
    { label: "HORECA supplier", to: "/frozen-french-fries-horeca-supplier" },
    { label: "Distributor / wholesale", to: "/frozen-french-fries-distributor-wholesale" },
    ...COMMON_LINKS,
  ],
};

const distributorPage: LandingPageData = {
  slug: "frozen-french-fries-distributor-wholesale",
  kind: "buyer",
  keyword: "frozen french fries distributor / wholesale supplier",
  secondaryKeywords: [
    "wholesale french fries",
    "frozen french fries bulk supplier",
    "frozen french fries distributor India",
    "private label frozen french fries manufacturer",
    "frozen food distributors",
  ],
  seoTitle: "Wholesale & Distributor Supplier of Frozen French Fries | The Nilgiri Root",
  metaDescription:
    "Wholesale and distributor supply of frozen french fries. Bulk pricing, recurring orders, private-label options. Built for frozen-food distributors, modern trade and quick commerce. Request a quote.",
  h1: "Wholesale & Distributor Supplier of Frozen French Fries",
  eyebrow: "Wholesale · Bulk · Private label",
  intro:
    "We supply frozen-food distributors, wholesalers, modern-trade buyers and quick-commerce operators with bulk frozen french fries — backed by recurring order capacity, distributor pricing, and private-label packaging on request. If you're building a frozen-foods portfolio for your region, we're set up to be a long-term manufacturer-direct partner.",
  sections: [
    {
      heading: "Distributor Pricing & MOQs",
      body: "We offer distributor / wholesale pricing structured around volume, frequency and pack mix. MOQs depend on cut, pack size and destination — share your projected monthly off-take and we'll quote a price grid.",
    },
    {
      heading: "Private Label & Contract Manufacturing",
      body: "Want to launch your own brand of frozen fries? We offer private-label manufacturing in 500g, 1kg and 2.5kg formats as well as bulk packs. Send your artwork and pack specs and we'll come back with a proposal covering MOQ, lead time and pricing.",
      bullets: [
        "Private label in 500g, 1kg, 2.5kg & bulk",
        "Contract manufacturing for established brands",
        "Recurring monthly / quarterly contracts",
        "Distributor & wholesale pricing tiers",
      ],
    },
    {
      heading: "Modern Trade & Quick-Commerce Ready",
      body: "Our retail packs are sized and printed for modern-trade shelves and quick-commerce dark stores — clean front-of-pack, scannable barcoding, and master cartons sized for pick efficiency.",
    },
    {
      heading: "Why Distributors Choose Us",
      body: "Manufacturer-direct (no middle layer), consistent supply, a credible Nilgiri sourcing story you can sell to your buyers, and account managers who actually pick up the phone.",
    },
  ],
  useCases: [
    "Frozen-food distributors building regional portfolios",
    "Wholesalers and cash-and-carry operators",
    "Modern-trade buyers (supermarket / hypermarket)",
    "Quick-commerce dark stores and rapid delivery brands",
    "Private-label brands and re-packers",
  ],
  trust: [...COMMON_TRUST, "Private Label Available"],
  faqs: [
    {
      q: "What's the minimum order quantity for distributors?",
      a: "MOQs are flexible and depend on cut, pack size and frequency. Share your projected monthly volume and we'll quote.",
    },
    {
      q: "Do you offer private label?",
      a: "Yes. We offer private-label manufacturing in 500g, 1kg, 2.5kg and bulk formats. Share your artwork and pack specs.",
    },
    {
      q: "Do you have distributor pricing tiers?",
      a: "Yes. Pricing is structured around volume, frequency and pack mix.",
    },
    {
      q: "How quickly can you fulfil recurring orders?",
      a: "After the first cycle, most distributor accounts settle into a 7–14 day lead time with confirmed monthly schedules.",
    },
  ],
  internalLinks: [
    { label: "Frozen french fries exporter", to: "/frozen-french-fries-exporter-india" },
    { label: "HORECA supplier", to: "/frozen-french-fries-horeca-supplier" },
    { label: "QSR supplier", to: "/frozen-french-fries-qsr-supplier" },
    ...COMMON_LINKS,
  ],
};

/* ================================ SIZE PAGES ============================== */

const cutPage = (
  size: "9mm" | "10mm" | "11mm",
  copy: { subtitle: string; intro: string; bestFor: string; pairedSize: string },
): LandingPageData => ({
  slug: `frozen-french-fries-${size}`,
  kind: "size",
  keyword: `frozen french fries ${size}`,
  secondaryKeywords: [
    `straight cut ${size} french fries`,
    "straight cut french fries",
    "ready to fry frozen french fries",
    "premium frozen french fries",
  ],
  seoTitle: `Frozen French Fries ${size} — Straight Cut | The Nilgiri Root`,
  metaDescription: `Premium ${size} straight-cut frozen french fries. ${copy.subtitle} Made from Nilgiri mountain potatoes, blast frozen, FSSAI certified. Available in 500g, 1kg, 2.5kg and bulk. Request a quote.`,
  h1: `Frozen French Fries — ${size} Straight Cut`,
  eyebrow: `Straight Cut · ${size} · ${copy.subtitle}`,
  intro: copy.intro,
  sections: [
    {
      heading: `Why ${size} — and Who It's Built For`,
      body: copy.bestFor,
    },
    {
      heading: "Cut Consistency Under the Microscope",
      body: `Our ${size} fries are produced to a tight size tolerance — same length distribution carton to carton, batch to batch. That consistency is what lets a kitchen calibrate its fryer programme once and trust it across services.`,
      bullets: [
        `Straight cut ${size} (within tight tolerance)`,
        "Low oil pickup, longer oil life",
        "Uniform colour after frying",
        "Crisp shell, fluffy centre",
      ],
    },
    {
      heading: "Available in 500g, 1kg, 2.5kg and Bulk",
      body: `Our ${size} cut is available in 500g and 1kg consumer packs, 2.5kg food-service packs, and bulk master cartons for distributors and exporters.`,
    },
    {
      heading: "Pairs Naturally With Our Other Cuts",
      body: `Most multi-outlet operators stock more than one cut. ${size} pairs naturally with our ${copy.pairedSize} cut for kitchens that want a balanced menu range.`,
    },
  ],
  useCases: [
    "QSRs and food courts",
    "Hotels, restaurants and cloud kitchens",
    "Modern-trade and quick-commerce retail",
    "Distributors stocking a frozen-foods range",
    "Exporters loading container FCLs",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: `Are your ${size} fries ready to fry?`,
      a: "Yes — par-fried and blast frozen. Straight from the freezer to the fryer, no thawing required.",
    },
    {
      q: `What pack sizes are available for the ${size} cut?`,
      a: "500g, 1kg, 2.5kg and bulk master cartons.",
    },
    {
      q: "Recommended fry time and temperature?",
      a: `175–180°C from frozen, 2.5–3.5 minutes depending on quantity and oil condition. ${size} is faster than thicker cuts and slower than thinner cuts.`,
    },
    {
      q: "Can I order this cut for export?",
      a: "Yes. The same SKU is available for export in master cartons sized for FCL loading.",
    },
  ],
  defaultCut: size,
  internalLinks: [
    { label: "9mm fries", to: "/frozen-french-fries-9mm" },
    { label: "10mm fries", to: "/frozen-french-fries-10mm" },
    { label: "11mm fries", to: "/frozen-french-fries-11mm" },
    { label: "500g pack", to: "/frozen-french-fries-500g" },
    { label: "1kg pack", to: "/frozen-french-fries-1kg" },
    { label: "2.5kg pack", to: "/frozen-french-fries-2-5kg" },
    ...COMMON_LINKS,
  ],
  productSchema: {
    name: `The Nilgiri Root Frozen French Fries — ${size} Straight Cut`,
    description: `Premium ${size} straight-cut frozen french fries from The Nilgiri Root. Blast frozen, par-fried and ready to fry. Available in 500g, 1kg, 2.5kg and bulk packs.`,
    sku: `TNR-FF-${size.toUpperCase()}`,
  },
});

const ninemm = cutPage("9mm", {
  subtitle: "Crisp & Quick",
  intro:
    "Our 9mm straight-cut frozen french fries are the QSR favourite — fast to cook, uniform in colour, and engineered to hold crisp during pickup, delivery and the heat lamp. Built from Nilgiri mountain potatoes, par-fried in food-grade oil and blast frozen at source.",
  bestFor:
    "9mm is the cut of choice for QSRs, food courts, food aggregator brands and quick-commerce kitchens — anywhere fast cook time and uniform colour matter most. The thin profile means a higher surface-area-to-mass ratio, which delivers a crisper bite per portion.",
  pairedSize: "10mm",
});

const tenmm = cutPage("10mm", {
  subtitle: "The All-Rounder",
  intro:
    "Our 10mm straight-cut frozen french fries are the most versatile cut in the range — the natural choice for hotels, casual dining, cafes and cloud kitchens. Equal parts crisp shell and tender potato centre. Made from Nilgiri mountain potatoes and blast frozen at source.",
  bestFor:
    "10mm is the all-rounder. Most hotel all-day-dining menus and casual-dining brands settle on 10mm because it works with everything from a club sandwich to a steak plate. Slightly more substantial bite than 9mm without crossing into steakhouse territory.",
  pairedSize: "9mm and 11mm",
});

const elevenmm = cutPage("11mm", {
  subtitle: "Steakhouse Style",
  intro:
    "Our 11mm straight-cut frozen french fries are the steakhouse cut — thick, hearty, with a satisfying crunch and rich potato character. Built for premium plates, signature platters and loaded-fries menu items. Made from Nilgiri mountain potatoes and blast frozen at source.",
  bestFor:
    "11mm is for premium plates — steakhouses, gastropubs, signature loaded-fries menu items, and elevated casual dining. The thick profile keeps a tender, almost wedge-like centre while still delivering a strong crisp on the outside.",
  pairedSize: "10mm",
});

/* ================================ PACK PAGES ============================== */

const packPage = (
  pack: "500g" | "1kg" | "2.5kg",
  slugPack: string,
  copy: { subtitle: string; intro: string; channel: string },
): LandingPageData => ({
  slug: `frozen-french-fries-${slugPack}`,
  kind: "pack",
  keyword: `frozen french fries ${pack}`,
  secondaryKeywords: [
    `frozen french fries ${pack} pack`,
    "ready to fry frozen french fries",
    "packed frozen food",
    "frozen foods India",
  ],
  seoTitle: `Frozen French Fries ${pack} Pack | The Nilgiri Root`,
  metaDescription: `Premium frozen french fries in a ${pack} pack — ${copy.subtitle} Available in 9mm, 10mm and 11mm cuts. FSSAI certified, blast frozen at source. Request a quote.`,
  h1: `Frozen French Fries — ${pack} Pack`,
  eyebrow: `Pack Size · ${pack} · ${copy.subtitle}`,
  intro: copy.intro,
  sections: [
    {
      heading: `Why the ${pack} Pack`,
      body: copy.channel,
    },
    {
      heading: "Same Premium Quality, Three Cut Options",
      body: `Our ${pack} pack is available across all three cuts — 9mm (crisp & quick), 10mm (the all-rounder), and 11mm (steakhouse style). Pick the cut that matches your menu or your shelf.`,
      bullets: [
        "Available in 9mm, 10mm, 11mm",
        "Made from Nilgiri mountain potatoes",
        "Blast frozen, par-fried, ready to fry",
        "FSSAI Licensed Manufacturer",
      ],
    },
    {
      heading: "Cold-Chain Ready Packaging",
      body: `Our ${pack} packs are designed to survive the cold chain — robust film, clean front-of-pack, and master cartons sized for distributor and dark-store pick efficiency.`,
    },
    {
      heading: "Order Together — Mix Cuts in One Despatch",
      body: `You can mix cuts within a single ${pack} order — useful for distributors building a frozen-foods range or HORECA buyers stocking multiple outlets.`,
    },
  ],
  useCases: [
    "Modern-trade & supermarket shelves",
    "Quick-commerce dark stores (10–30 min delivery)",
    "Cafes, restaurants and cloud kitchens",
    "Distributors and wholesalers",
    "Direct-to-consumer e-commerce brands",
  ],
  trust: COMMON_TRUST,
  faqs: [
    {
      q: `Which cuts are available in the ${pack} pack?`,
      a: "All three — 9mm, 10mm and 11mm — are available in this pack size.",
    },
    {
      q: "How should the pack be stored?",
      a: "Keep frozen at -18°C or colder until use. Once thawed, do not refreeze.",
    },
    {
      q: "Are the fries inside the pack ready to fry?",
      a: "Yes — par-fried and blast frozen. Straight from freezer to fryer, no thawing required.",
    },
    {
      q: "Can the pack be private-labelled?",
      a: "Yes. We offer private-label artwork on this pack size for distributor and wholesale orders.",
    },
  ],
  defaultPack: pack,
  internalLinks: [
    { label: "500g pack", to: "/frozen-french-fries-500g" },
    { label: "1kg pack", to: "/frozen-french-fries-1kg" },
    { label: "2.5kg pack", to: "/frozen-french-fries-2-5kg" },
    { label: "9mm fries", to: "/frozen-french-fries-9mm" },
    { label: "10mm fries", to: "/frozen-french-fries-10mm" },
    { label: "11mm fries", to: "/frozen-french-fries-11mm" },
    ...COMMON_LINKS,
  ],
  productSchema: {
    name: `The Nilgiri Root Frozen French Fries — ${pack} Pack`,
    description: `Premium frozen french fries in a ${pack} pack from The Nilgiri Root. Available in 9mm, 10mm and 11mm straight cuts. Blast frozen and ready to fry.`,
    sku: `TNR-FF-${pack.replace(".", "").toUpperCase()}`,
  },
});

const pack500g = packPage("500g", "500g", {
  subtitle: "Retail-friendly",
  intro:
    "Our 500g pack of premium frozen french fries is built for modern-trade shelves, quick-commerce dark stores and direct-to-consumer e-commerce. Compact, scannable and cold-chain ready — with the same blast-frozen quality you'd expect from our food-service packs.",
  channel:
    "500g is the sweet-spot retail pack — small enough to move quickly off shelf, large enough to deliver a meaningful basket value. It's the format we recommend to most modern-trade buyers and quick-commerce operators.",
});

const pack1kg = packPage("1kg", "1kg", {
  subtitle: "Family / Cafe",
  intro:
    "Our 1kg pack of premium frozen french fries works equally well on a supermarket shelf, in a cafe walk-in, or in a small-volume kitchen. The same blast-frozen quality, in a pack size that suits both retail and food service.",
  channel:
    "1kg is the cross-over pack — large enough for cafes and small kitchens, family enough for retail shelves. A practical choice for distributors who want one SKU that serves multiple channels.",
});

const pack25kg = packPage("2.5kg", "2-5kg", {
  subtitle: "Food-service",
  intro:
    "Our 2.5kg pack of premium frozen french fries is the food-service workhorse — sized for hotel kitchens, restaurant lines, cloud kitchens and catering operations. Blast frozen, par-fried, and ready to fry from the freezer.",
  channel:
    "2.5kg is the food-service standard — light enough to handle on the line, heavy enough to keep up with a busy service. Most HORECA and cloud-kitchen accounts standardise on the 2.5kg pack.",
});

/* ================================== EXPORT ================================ */

export const LANDING_PAGES: LandingPageData[] = [
  indiaPage,
  ootyPage,
  coimbatorePage,
  exporterPage,
  horecaPage,
  qsrPage,
  distributorPage,
  ninemm,
  tenmm,
  elevenmm,
  pack500g,
  pack1kg,
  pack25kg,
];

export const LANDING_PAGES_BY_SLUG = Object.fromEntries(
  LANDING_PAGES.map((p) => [p.slug, p]),
) as Record<string, LandingPageData>;
