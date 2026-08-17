import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { PUBLIC_ROUTES, LANDING_SLUGS, CORE_ROUTES } from "@/data/routes";
import { LANDING_PAGES_BY_SLUG } from "@/data/landingPages";

const meta = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content") ?? null;

function renderAt(path: string, ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe("SEOHead", () => {
  it("writes title, description and canonical for the current route", async () => {
    renderAt("/products", <SEOHead title="Products | TNR" description="Our fry range." />);

    await waitFor(() => expect(document.title).toBe("Products | TNR"));
    expect(meta('meta[name="description"]')).toBe("Our fry range.");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://thenilgiriroot.com/products",
    );
  });

  it("mirrors title and description into Open Graph and Twitter tags", async () => {
    renderAt("/about", <SEOHead title="About | TNR" description="Who we are." />);

    await waitFor(() => expect(meta('meta[property="og:title"]')).toBe("About | TNR"));
    expect(meta('meta[property="og:description"]')).toBe("Who we are.");
    expect(meta('meta[name="twitter:title"]')).toBe("About | TNR");
    expect(meta('meta[name="twitter:description"]')).toBe("Who we are.");
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  it("defaults og:image to an absolute URL on our own domain", async () => {
    // Regression guard for the expired Google Cloud signed URL that shipped in
    // index.html: every share rendered with a blank image.
    renderAt("/", <SEOHead title="Home" description="d" />);

    await waitFor(() => expect(meta('meta[property="og:image"]')).toBeTruthy());
    const og = meta('meta[property="og:image"]')!;
    expect(og).toMatch(/^https:\/\/thenilgiriroot\.com\//);
    expect(og).not.toContain("storage.googleapis.com");
  });

  it("resolves a relative ogImage against the site URL", async () => {
    renderAt("/blog/x", <SEOHead title="T" description="d" ogImage="/blog/iqf-processing.jpg" />);

    await waitFor(() =>
      expect(meta('meta[property="og:image"]')).toBe(
        "https://thenilgiriroot.com/blog/iqf-processing.jpg",
      ),
    );
  });

  it("emits noindex when asked, and index otherwise", async () => {
    const { unmount } = renderAt("/admin", <SEOHead title="Admin" noIndex />);
    await waitFor(() => expect(meta('meta[name="robots"]')).toContain("noindex"));
    unmount();

    renderAt("/products", <SEOHead title="Products" />);
    await waitFor(() => expect(meta('meta[name="robots"]')).toContain("index"));
    expect(meta('meta[name="robots"]')).not.toContain("noindex");
  });

  it("removes its page-level JSON-LD on unmount", async () => {
    const { unmount } = renderAt(
      "/faq",
      <SEOHead title="FAQ" jsonLd={{ "@type": "FAQPage" }} />,
    );

    await waitFor(() => expect(document.getElementById("page-jsonld")).toBeTruthy());
    unmount();
    expect(document.getElementById("page-jsonld")).toBeNull();
  });
});

describe("route manifest", () => {
  it("has no duplicate paths", () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("gives every landing slug a matching content entry", () => {
    // The routes and the copy live in separate files; drift between them is
    // what made all thirteen landing pages resolve to the 404.
    for (const slug of LANDING_SLUGS) {
      expect(LANDING_PAGES_BY_SLUG[slug], `no content for /${slug}`).toBeTruthy();
    }
  });

  it("has content entries that all correspond to a real route", () => {
    for (const slug of Object.keys(LANDING_PAGES_BY_SLUG)) {
      expect(LANDING_SLUGS as readonly string[], `orphan landing page /${slug}`).toContain(slug);
    }
  });

  it("uses leading-slash paths and sane priorities", () => {
    for (const r of PUBLIC_ROUTES) {
      expect(r.path.startsWith("/")).toBe(true);
      expect(r.priority).toBeGreaterThan(0);
      expect(r.priority).toBeLessThanOrEqual(1);
    }
  });

  it("keeps the homepage at top priority", () => {
    expect(CORE_ROUTES.find((r) => r.path === "/")?.priority).toBe(1.0);
  });
});
