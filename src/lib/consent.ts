/**
 * Consent management.
 *
 * DPDP Act requirements this implements:
 *  - s.6(1)  consent must be free, specific, informed, unconditional and
 *            unambiguous, with a clear affirmative action. So: nothing is
 *            pre-ticked, and dismissing the banner is NOT acceptance.
 *  - s.6(1)  granular — a separate decision per purpose, never one bundled
 *            "I agree" covering analytics and marketing together.
 *  - s.6(4)  withdrawal must be as easy as giving. Same UI, same number of
 *            clicks, always reachable from the footer.
 *  - s.6(6)  consequences of withdrawal are borne by the fiduciary, not the
 *            principal — declining never degrades the site.
 *  - s.5     the notice must state what is processed and why, in plain
 *            language, before consent is taken.
 *
 * Storage is deliberately local-first: a visitor who has not consented to
 * anything should not have a server-side record created about them just for
 * visiting. A durable audit record is written only when consent is actually
 * given or changed (see logConsentDecision), which is the event the Act
 * requires us to be able to evidence.
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord {
  /** Schema version, so a future purpose change can invalidate stale consent. */
  version: number;
  state: ConsentState;
  /** ISO timestamp of the decision. */
  decidedAt: string;
  /** How the decision was made, for the audit trail. */
  method: "banner-accept-all" | "banner-reject-all" | "banner-custom" | "dashboard" | "renewed";
  /** Correlates the local record with the server-side consent log row. */
  receiptId: string;
}

/**
 * Bump when the set of purposes changes materially. Existing consent then no
 * longer covers the new purpose, so the banner reappears and asks afresh —
 * which is what s.6 requires rather than silently extending old consent.
 */
export const CONSENT_VERSION = 1;

const STORAGE_KEY = "tnr:consent";

export const DEFAULT_STATE: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

/** Safe read — storage can throw in private browsing modes. */
export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    // A record from an older purpose set does not carry forward.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (!parsed.state || typeof parsed.state.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(record: ConsentRecord): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* non-fatal — the banner will simply ask again next visit */
  }
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}

/** Opaque, non-identifying receipt id the Data Principal can quote to us. */
export function newReceiptId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Apply a consent decision to the live page.
 *
 * Google Consent Mode v2 is signalled rather than merely blocking the script,
 * so GA respects the decision even though the tag itself loads from the HTML
 * shell. Denied is the default, set in index.html before the tag initialises,
 * so no measurement happens before a choice is made.
 */
export function applyConsentToTags(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };

  const payload = {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  };

  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", payload);
  } else if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push(["consent", "update", payload]);
  }

  // Withdrawal must actually take effect, not just stop future collection.
  // Clear the GA cookies already on the device so the previous identifier
  // cannot continue to be read.
  if (!state.analytics) clearAnalyticsCookies();
}

function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  // Cover the host and its registrable parent (…, .example.com).
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !/^_ga/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

/**
 * Write the durable, audit-ready consent record.
 *
 * Fire-and-forget: a logging failure must never block the user's choice from
 * taking effect locally. The local record is authoritative for behaviour; the
 * server record is the evidence trail.
 */
export async function logConsentDecision(record: ConsentRecord): Promise<void> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.functions.invoke("consent-log", {
      body: {
        receipt_id: record.receiptId,
        consent_version: record.version,
        method: record.method,
        analytics: record.state.analytics,
        marketing: record.state.marketing,
        decided_at: record.decidedAt,
        page_url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
      },
    });
  } catch {
    /* evidence trail is best-effort; the user's choice already applied */
  }
}

/** Convenience used by the banner and the dashboard alike. */
export function commitConsent(
  state: ConsentState,
  method: ConsentRecord["method"],
): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    state: { ...state, necessary: true },
    decidedAt: new Date().toISOString(),
    method,
    receiptId: newReceiptId(),
  };
  writeConsent(record);
  applyConsentToTags(record.state);
  void logConsentDecision(record);
  return record;
}
