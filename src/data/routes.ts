/**
 * The site's static route manifest — the single source of truth for which URLs
 * exist.
 *
 * Three consumers read this: the router (AnimatedRoutes), the prerenderer
 * (scripts/prerender.mjs) and the sitemap generator (scripts/generate-sitemap.mjs).
 * They used to keep three hand-maintained copies of the same list, which is why
 * the sitemap drifted out of date.
 *
 * Blog post URLs are NOT here — they live in Supabase and are fetched at build
 * time by the sitemap generator.
 */

export interface StaticRoute {
  path: string;
  /** Sitemap priority, 0.0–1.0. */
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

/** Marketing pages that make up the main navigation. */
export const CORE_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/products", priority: 0.9, changefreq: "weekly" },
  { path: "/solutions", priority: 0.9, changefreq: "monthly" },
  { path: "/process", priority: 0.8, changefreq: "monthly" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/certificates", priority: 0.7, changefreq: "monthly" },
  { path: "/faq", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", priority: 0.8, changefreq: "weekly" },
  // Legal pages. Lower priority — they exist to be found when looked for,
  // not to compete with commercial pages in search.
  { path: "/privacy-policy", priority: 0.4, changefreq: "yearly" },
  { path: "/terms", priority: 0.4, changefreq: "yearly" },
  { path: "/cookie-policy", priority: 0.4, changefreq: "yearly" },
];

/** Keyword landing pages. Kept in sync with src/data/landingPages.ts. */
export const LANDING_SLUGS = [
  "frozen-french-fries-manufacturer-in-india",
  "frozen-french-fries-manufacturer-in-ooty",
  "frozen-french-fries-manufacturer-near-coimbatore",
  "frozen-french-fries-exporter-india",
  "frozen-french-fries-horeca-supplier",
  "frozen-french-fries-qsr-supplier",
  "frozen-french-fries-distributor-wholesale",
  "frozen-french-fries-9mm",
  "frozen-french-fries-10mm",
  "frozen-french-fries-11mm",
  "frozen-french-fries-500g",
  "frozen-french-fries-1kg",
  "frozen-french-fries-2-5kg",
] as const;

export const LANDING_ROUTES: StaticRoute[] = LANDING_SLUGS.map((slug) => ({
  path: `/${slug}`,
  priority: 0.8,
  changefreq: "monthly" as const,
}));

/**
 * Everything a crawler should see. Excludes /admin, /auth and /whatsapp-sent,
 * which are noindex by design.
 */
export const PUBLIC_ROUTES: StaticRoute[] = [...CORE_ROUTES, ...LANDING_ROUTES];

export const SITE_URL = "https://www.thenilgiriroot.com";
