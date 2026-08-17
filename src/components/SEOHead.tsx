import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_URL = "https://thenilgiriroot.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const defaultMeta = {
  title: "The Nilgiri Root — Premium Frozen French Fries | Blast Frozen Fries India",
  description:
    "India's premium frozen french fries manufacturer. 100% Nilgiri mountain potatoes, FSSAI certified, blast frozen for peak quality. Available in 9mm, 10mm, 11mm cuts.",
  keywords:
    "frozen french fries, premium french fries, blast frozen fries, frozen fries manufacturer India, value added farm products",
};

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const location = useLocation();
  const fullTitle = title || defaultMeta.title;
  const fullDescription = description || defaultMeta.description;
  const fullKeywords = keywords || defaultMeta.keywords;
  const fullCanonical = canonical || `${SITE_URL}${location.pathname}`;
  const fullOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${SITE_URL}${ogImage}`
    : DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    updateMeta("description", fullDescription);
    updateMeta("keywords", fullKeywords);
    updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Open Graph
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", fullDescription, true);
    updateMeta("og:url", fullCanonical, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", fullOgImage, true);
    updateMeta("og:site_name", "The Nilgiri Root", true);

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", fullDescription);
    updateMeta("twitter:image", fullOgImage);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute("href", fullCanonical);
    } else {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", fullCanonical);
      document.head.appendChild(link);
    }

    // JSON-LD (page-specific structured data)
    const existingScript = document.getElementById("page-jsonld");
    if (jsonLd) {
      if (existingScript) {
        existingScript.textContent = JSON.stringify(jsonLd);
      } else {
        const script = document.createElement("script");
        script.id = "page-jsonld";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(jsonLd);
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }

    return () => {
      const el = document.getElementById("page-jsonld");
      if (el) el.remove();
    };
  }, [fullTitle, fullDescription, fullKeywords, fullCanonical, fullOgImage, ogType, noIndex, jsonLd]);

  return null;
}
