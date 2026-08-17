import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteSearch from "@/components/SiteSearch";

interface RecentPost {
  title: string;
  slug: string;
  reading_time_minutes: number | null;
}

const POPULAR = [
  { label: "Our fry range", to: "/products", hint: "9mm, 10mm and 11mm cuts" },
  { label: "Sourcing solutions", to: "/solutions", hint: "HORECA, QSR, retail, export" },
  { label: "How we make them", to: "/process", hint: "Farm to blast freezer" },
  { label: "Certificates", to: "/certificates", hint: "FSSAI and food safety" },
  { label: "FAQ", to: "/faq", hint: "Cuts, MOQs, delivery" },
  { label: "Talk to us", to: "/contact", hint: "Pricing and samples" },
];

/**
 * 404.
 *
 * `noIndex` matters here: the SPA answers every URL with HTTP 200 from the
 * client's point of view, so without it a crawler that wanders onto a mistyped
 * or dead link would see an indexable page. Google classes those as soft 404s
 * and they dilute the crawl budget the landing pages depend on.
 *
 * The genuine 404 *status code* is served by the host, not from here — see
 * public/_redirects and scripts/prerender.mjs, which emit a real dist/404.html.
 */
export default function NotFound() {
  const location = useLocation();
  const [recent, setRecent] = useState<RecentPost[]>([]);

  useEffect(() => {
    console.warn("404: no route matched", location.pathname);
  }, [location.pathname]);

  // Recent articles give someone who landed on a dead URL something current to
  // go to. Loaded lazily and failing silently — a 404 page must still be
  // useful when the database is unreachable, so this section simply doesn't
  // render rather than showing an error inside an error page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("blog_posts")
          .select("title, slug, reading_time_minutes")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);
        if (!cancelled && data) setRecent(data as RecentPost[]);
      } catch {
        /* leave the section unrendered */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SEOHead
        title="Page not found | The Nilgiri Root"
        description="This page doesn't exist or has moved. Search the site, browse our frozen french fry range, or get in touch."
        noIndex
      />

      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="font-body text-2xs uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
          <h1 className="mt-3 font-display text-fluid-h1 font-bold text-balance text-foreground">
            We couldn&rsquo;t find that page
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
            The link may be out of date, or the address might have a typo in it. Nothing is broken on
            your side — let&rsquo;s get you where you were going.
          </p>
        </header>

        <section aria-labelledby="find-heading" className="mt-10">
          <h2 id="find-heading" className="sr-only">
            Find what you were looking for
          </h2>
          <SiteSearch label="Search the site" />
        </section>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-full bg-accent px-8 py-3 text-center font-body text-sm font-medium text-accent-foreground transition-[background-color,transform] duration-base ease-out-expo hover:bg-accent/90 active:scale-[0.98] focus-ring"
          >
            Back to homepage
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-border px-8 py-3 text-center font-body text-sm font-medium text-foreground transition-[background-color,transform] duration-base ease-out-expo hover:bg-muted active:scale-[0.98] focus-ring"
          >
            Browse products
          </Link>
        </div>

        <section aria-labelledby="popular-heading" className="mt-14">
          <h2
            id="popular-heading"
            className="mb-4 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Popular sections
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {POPULAR.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="group flex h-full items-center justify-between gap-3 bg-card px-4 py-3.5 transition-colors duration-quick hover:bg-muted focus-ring"
                >
                  <span className="min-w-0">
                    <span className="block font-body text-sm font-medium text-foreground">{item.label}</span>
                    <span className="mt-0.5 block font-body text-2xs text-muted-foreground">{item.hint}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-quick ease-out-expo group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent-heading" className="mt-12">
            <h2
              id="recent-heading"
              className="mb-4 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Latest from the blog
            </h2>
            <ul className="flex flex-col gap-2">
              {recent.map((post) => (
                <li key={post.slug}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors duration-quick hover:bg-muted focus-ring"
                  >
                    <span className="min-w-0 font-body text-sm text-foreground">{post.title}</span>
                    {post.reading_time_minutes != null && (
                      <span className="flex shrink-0 items-center gap-1.5 font-body text-2xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.reading_time_minutes} min
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-center font-body text-sm text-muted-foreground">
          Still stuck?{" "}
          <Link to="/contact" className="rounded-sm text-accent underline-offset-2 hover:underline focus-ring">
            Tell us what you were looking for
          </Link>{" "}
          and we&rsquo;ll point you to it.
        </p>
      </div>
    </main>
  );
}
