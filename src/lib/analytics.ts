/**
 * Analytics — GA4 (gtag.js) + Supabase CTA logging.
 *
 * The Google tag is installed once in index.html with `send_page_view: false`.
 * SPA page_views are emitted by useGaPageviews() on every route change.
 *
 * All custom events follow snake_case naming and a small, consistent set of
 * parameters: page_location, page_title, button_text, source_section,
 * destination, lead_type, contact_method, link_url, form_name,
 * product_interest, channel.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
// Loaded on demand. This module is imported by App, Navbar, Footer and the
// hero — i.e. the eagerly-loaded shell — so a static import here dragged the
// ~44 KB Supabase client onto the critical path of every first paint, purely
// to log a CTA click that can only happen after the user interacts.
const getSupabase = () => import("@/integrations/supabase/client").then((m) => m.supabase);

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = "G-RBBGBDDXQL";

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  // Fall back to dataLayer push if the gtag function hasn't attached yet
  // (the snippet in index.html defines it before the async script loads).
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    (window.dataLayer ||= []).push(args);
  }
}

/**
 * Fire a GA4 custom event. Silently no-ops on SSR or if gtag is unavailable.
 * Always merges page_location + page_title so events are attributable to a URL.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      page_location: window.location.href,
      page_title: document.title,
      ...params,
    };
    gtag("event", name, payload);
    if (import.meta.env.DEV) {
      // Dev-only echo so QA can verify event payloads from the browser console.
      // Stripped automatically in production builds.
      console.debug("[ga4]", name, payload);
    }
  } catch (e) {
    // Never let analytics break the UI
    console.warn("GA event failed", name, e);
  }
}

/* -------------------------------------------------------------------------- */
/* SPA page_view tracker                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Mount once near the app root inside <BrowserRouter>. Sends a GA4 page_view
 * on the initial mount and on every subsequent route change. Document title
 * is read after a microtask so route components have a chance to update it.
 */
export function useGaPageviews() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    let fired = false;

    const fire = () => {
      if (fired) return;
      fired = true;
      const payload = {
        page_location: window.location.href,
        page_title: document.title,
        page_path: path,
        send_to: GA_MEASUREMENT_ID,
      };
      gtag("event", "page_view", payload);
      if (import.meta.env.DEV) console.debug("[ga4] page_view", payload);
    };

    // Lazy-loaded routes set <title> in an effect that runs *after* the route
    // chunk finishes loading. We watch <title> for the next mutation and use
    // that as our cue. A fallback timeout fires the event anyway after 1.2s
    // so a route with no SEOHead still gets tracked.
    const titleEl = document.querySelector("title");
    const observer = titleEl
      ? new MutationObserver(() => {
          observer.disconnect();
          // Defer one frame so any sibling meta updates settle.
          requestAnimationFrame(fire);
        })
      : null;
    observer?.observe(titleEl!, { childList: true });

    const fallbackId = window.setTimeout(() => {
      observer?.disconnect();
      fire();
    }, 1200);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallbackId);
    };
  }, [location.pathname, location.search]);
}

/* -------------------------------------------------------------------------- */
/* Named event helpers — keep call-sites tidy and consistent                  */
/* -------------------------------------------------------------------------- */

export const trackChatbotOpen = (sourceSection = "floating-widget") =>
  trackEvent("chatbot_open", { source_section: sourceSection, channel: "website" });

export const trackChatbotStart = () =>
  trackEvent("chatbot_start", { channel: "website" });

export const trackChatbotLeadSubmit = (extra: Record<string, unknown> = {}) =>
  trackEvent("chatbot_lead_submit", { lead_type: "chatbot", channel: "website", ...extra });

export const trackWhatsAppClick = (params: {
  buttonText: string;
  sourceSection: string;
  destination?: string;
}) =>
  trackEvent("whatsapp_click", {
    button_text: params.buttonText,
    source_section: params.sourceSection,
    destination: params.destination,
    contact_method: "whatsapp",
  });

export const trackEmailClick = (params: {
  buttonText: string;
  sourceSection: string;
  destination?: string;
}) =>
  trackEvent("email_click", {
    button_text: params.buttonText,
    source_section: params.sourceSection,
    destination: params.destination,
    contact_method: "email",
  });

export const trackPhoneClick = (params: {
  buttonText: string;
  sourceSection: string;
  destination?: string;
}) =>
  trackEvent("phone_click", {
    button_text: params.buttonText,
    source_section: params.sourceSection,
    destination: params.destination,
    contact_method: "phone",
  });

export const trackContactFormSubmit = (formName = "contact_page") =>
  trackEvent("contact_form_submit", {
    form_name: formName,
    lead_type: "contact_form",
    channel: "website",
  });

export const trackQuoteRequestClick = (params: {
  buttonText: string;
  sourceSection: string;
}) =>
  trackEvent("quote_request_click", {
    button_text: params.buttonText,
    source_section: params.sourceSection,
    channel: "website",
  });

export const trackFaqExpand = (questionText: string) =>
  trackEvent("faq_expand", { question_text: questionText, source_section: "faq" });

export const trackMapClick = (destination: string) =>
  trackEvent("map_click", { destination, source_section: "contact" });

export const trackOutboundClick = (params: { linkUrl: string; sourceSection: string }) =>
  trackEvent("outbound_click", {
    link_url: params.linkUrl,
    source_section: params.sourceSection,
  });

/* -------------------------------------------------------------------------- */
/* Generic CTA tracker — keeps existing Supabase logging AND fires GA4        */
/* -------------------------------------------------------------------------- */

/**
 * Track a generic CTA click. Existing call-sites keep working unchanged;
 * we now also forward the click to GA4 as a `cta_click` event so we get
 * a unified business-action stream in GA.
 */
export async function trackCtaClick(params: {
  label: string;
  destination?: string;
  pageSource: string;
  section: string;
}) {
  // GA4 — fire-and-forget, never await
  trackEvent("cta_click", {
    button_text: params.label,
    source_section: params.section,
    destination: params.destination,
    channel: "website",
  });

  // Existing Supabase logging (unchanged behaviour)
  try {
    const supabase = await getSupabase();
    await supabase.from("cta_clicks").insert({
      cta_label: params.label,
      cta_destination: params.destination ?? null,
      page_source: params.pageSource,
      section: params.section,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : null,
      country: typeof navigator !== "undefined" ? navigator.language || null : null,
    });
  } catch (e) {
    console.warn("CTA tracking failed", e);
  }
}
