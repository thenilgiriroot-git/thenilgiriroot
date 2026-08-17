import { LANDING_PAGES_BY_SLUG } from "@/data/landingPages";

/**
 * Static search index.
 *
 * Covers every page that exists at build time. Blog articles are deliberately
 * excluded — they live in Supabase and change without a deploy, so indexing
 * them here would go stale. The search UI links through to /blog for those.
 *
 * Kept static rather than hitting the network: search on the 404 page has to
 * work for someone who has just landed on a broken URL, which is exactly when
 * you least want to depend on another round trip succeeding.
 */
export interface SearchEntry {
  title: string;
  path: string;
  description: string;
  /** Extra match terms that don't appear in the title or description. */
  keywords: string[];
  section: "Products" | "Company" | "Resources" | "Sourcing" | "Legal";
}

const CORE: SearchEntry[] = [
  {
    title: "Products",
    path: "/products",
    description: "Our frozen french fry range — 9mm, 10mm and 11mm straight cuts in 500g, 1kg and 2.5kg packs.",
    keywords: ["fries", "range", "cuts", "sku", "pack sizes", "9mm", "10mm", "11mm", "catalogue"],
    section: "Products",
  },
  {
    title: "Solutions",
    path: "/solutions",
    description: "Sourcing built around your business — restaurants, QSR chains, distributors, retailers, exporters and bulk buyers.",
    keywords: ["horeca", "qsr", "distributor", "retail", "export", "wholesale", "bulk", "b2b", "foodservice"],
    section: "Products",
  },
  {
    title: "Our Process",
    path: "/process",
    description: "The ten stages from Nilgiri potato harvest to blast freezer, packaging and cold-chain dispatch.",
    keywords: ["manufacturing", "blast freezing", "blanching", "par-fry", "iqf", "cold chain", "factory"],
    section: "Company",
  },
  {
    title: "Certificates",
    path: "/certificates",
    description: "FSSAI licence and food safety documentation, available to download.",
    keywords: ["fssai", "licence", "license", "certification", "compliance", "food safety", "audit"],
    section: "Company",
  },
  {
    title: "About Us",
    path: "/about",
    description: "The story behind The Nilgiri Root, our farms and our facility in Sholur, Tamil Nadu.",
    keywords: ["story", "founder", "farm", "nilgiris", "sholur", "mission", "vision", "company"],
    section: "Company",
  },
  {
    title: "Contact",
    path: "/contact",
    description: "Talk to our sales team about pricing, lead times, samples and partnership.",
    keywords: ["enquiry", "enquire", "email", "phone", "whatsapp", "sales", "partner", "quote", "rfq"],
    section: "Company",
  },
  {
    title: "Blog",
    path: "/blog",
    description: "Recipes, sourcing guidance and frozen food industry notes.",
    keywords: ["articles", "recipes", "news", "guides", "insights", "posts"],
    section: "Resources",
  },
  {
    title: "FAQ",
    path: "/faq",
    description: "Common questions about cuts, pack sizes, minimum orders, delivery and certification.",
    keywords: ["questions", "help", "moq", "minimum order", "delivery", "shipping", "support"],
    section: "Resources",
  },
  {
    title: "Privacy Policy",
    path: "/privacy-policy",
    description: "How we collect, use, share and retain personal data under India's DPDP Act, 2023.",
    keywords: ["privacy", "dpdp", "data protection", "cookies", "gdpr", "personal data", "consent"],
    section: "Legal",
  },
  {
    title: "Terms and Conditions",
    path: "/terms",
    description: "The terms governing use of this website and our services.",
    keywords: ["terms", "tos", "conditions", "legal", "liability", "jurisdiction", "agreement"],
    section: "Legal",
  },
  {
    title: "Cookie Policy",
    path: "/cookie-policy",
    description: "The cookies and similar technologies we use, and how to control them.",
    keywords: ["cookies", "tracking", "analytics", "consent", "preferences"],
    section: "Legal",
  },
  {
    title: "Your Privacy Choices",
    path: "/privacy-dashboard",
    description: "Exercise your rights as a Data Principal — access, correct or erase your data, withdraw consent, raise a grievance.",
    keywords: ["rights", "data principal", "erasure", "delete my data", "access request", "grievance", "dsr", "withdraw"],
    section: "Legal",
  },
];

/** Landing pages, derived so the index can never drift from the content file. */
const LANDING: SearchEntry[] = Object.values(LANDING_PAGES_BY_SLUG).map((p) => ({
  title: p.h1,
  path: `/${p.slug}`,
  description: p.metaDescription,
  keywords: [],
  section: "Sourcing" as const,
}));

export const SEARCH_INDEX: SearchEntry[] = [...CORE, ...LANDING];

/**
 * Rank entries against a query.
 *
 * Deliberately simple substring scoring rather than a fuzzy library: the
 * corpus is ~25 entries, so anything cleverer costs bundle weight for no
 * perceptible gain. Weighting puts title matches above keywords above
 * description, and a prefix match above a mid-word one.
 */
export function searchSite(query: string, limit = 6): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = SEARCH_INDEX.map((entry) => {
    const title = entry.title.toLowerCase();
    const desc = entry.description.toLowerCase();
    const keys = entry.keywords.join(" ").toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (title.startsWith(term)) score += 12;
      else if (title.includes(term)) score += 8;
      if (keys.includes(term)) score += 5;
      if (desc.includes(term)) score += 2;
      if (entry.path.includes(term)) score += 3;
    }
    return { entry, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.entry);
}
