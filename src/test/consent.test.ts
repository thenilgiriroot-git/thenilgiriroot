import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  CONSENT_VERSION,
  DEFAULT_STATE,
  applyConsentToTags,
  clearConsent,
  commitConsent,
  newReceiptId,
  readConsent,
  writeConsent,
  type ConsentRecord,
} from "@/lib/consent";
import { searchSite } from "@/data/searchIndex";

// The log call is fire-and-forget over the network; stub the module it pulls.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn().mockResolvedValue({ error: null }) } },
}));

beforeEach(() => {
  localStorage.clear();
  document.cookie = "";
  (window as unknown as { gtag?: unknown }).gtag = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("consent defaults", () => {
  it("treats no stored decision as no consent", () => {
    expect(readConsent()).toBeNull();
  });

  it("defaults every optional purpose to off", () => {
    // DPDP s.6 requires a clear affirmative action. Anything pre-enabled here
    // would mean processing before consent.
    expect(DEFAULT_STATE.analytics).toBe(false);
    expect(DEFAULT_STATE.marketing).toBe(false);
    expect(DEFAULT_STATE.necessary).toBe(true);
  });
});

describe("consent persistence", () => {
  it("round-trips a decision", () => {
    const record: ConsentRecord = {
      version: CONSENT_VERSION,
      state: { necessary: true, analytics: true, marketing: false },
      decidedAt: new Date().toISOString(),
      method: "banner-custom",
      receiptId: "abc123",
    };
    writeConsent(record);

    const read = readConsent();
    expect(read?.state.analytics).toBe(true);
    expect(read?.state.marketing).toBe(false);
    expect(read?.receiptId).toBe("abc123");
  });

  it("discards consent recorded against an older purpose set", () => {
    // Bumping CONSENT_VERSION must invalidate old consent rather than silently
    // extending it to a purpose the person never saw.
    writeConsent({
      version: CONSENT_VERSION - 1,
      state: { necessary: true, analytics: true, marketing: true },
      decidedAt: new Date().toISOString(),
      method: "banner-accept-all",
      receiptId: "stale",
    } as ConsentRecord);

    expect(readConsent()).toBeNull();
  });

  it("discards a malformed record rather than trusting it", () => {
    localStorage.setItem("tnr:consent", '{"version":1,"state":{"analytics":"yes"}}');
    expect(readConsent()).toBeNull();
  });

  it("clears cleanly", () => {
    writeConsent({
      version: CONSENT_VERSION,
      state: { necessary: true, analytics: true, marketing: true },
      decidedAt: new Date().toISOString(),
      method: "banner-accept-all",
      receiptId: "x",
    });
    clearConsent();
    expect(readConsent()).toBeNull();
  });
});

describe("receipt ids", () => {
  it("are unique and non-guessable in shape", () => {
    const ids = new Set(Array.from({ length: 200 }, () => newReceiptId()));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{18}$/);
  });
});

describe("applying consent to the tag layer", () => {
  it("grants analytics storage only when analytics is accepted", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;

    applyConsentToTags({ necessary: true, analytics: true, marketing: false });

    expect(gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    );
  });

  it("denies everything when optional purposes are refused", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;

    applyConsentToTags({ necessary: true, analytics: false, marketing: false });

    expect(gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );
  });

  it("expires existing analytics cookies on withdrawal", () => {
    // s.6(4): withdrawal has to actually take effect, not merely stop future
    // collection while the previous identifier stays readable.
    document.cookie = "_ga=GA1.1.12345.67890";
    expect(document.cookie).toContain("_ga");

    applyConsentToTags({ necessary: true, analytics: false, marketing: false });

    expect(document.cookie).not.toContain("GA1.1.12345.67890");
  });

  it("does not throw when the tag layer is absent", () => {
    expect(() =>
      applyConsentToTags({ necessary: true, analytics: true, marketing: true }),
    ).not.toThrow();
  });
});

describe("committing a decision", () => {
  it("persists, stamps and always forces necessary on", () => {
    const record = commitConsent(
      { necessary: true, analytics: false, marketing: true },
      "dashboard",
    );

    expect(record.version).toBe(CONSENT_VERSION);
    expect(record.method).toBe("dashboard");
    expect(record.state.necessary).toBe(true);
    expect(record.state.marketing).toBe(true);
    expect(Number.isFinite(Date.parse(record.decidedAt))).toBe(true);
    expect(readConsent()?.receiptId).toBe(record.receiptId);
  });

  it("records withdrawal as a new decision rather than erasing the old one", () => {
    const first = commitConsent({ necessary: true, analytics: true, marketing: true }, "banner-accept-all");
    const second = commitConsent({ necessary: true, analytics: false, marketing: false }, "dashboard");

    expect(second.receiptId).not.toBe(first.receiptId);
    expect(readConsent()?.state.analytics).toBe(false);
  });
});

describe("site search", () => {
  it("ignores queries shorter than two characters", () => {
    expect(searchSite("a")).toHaveLength(0);
    expect(searchSite(" ")).toHaveLength(0);
  });

  it("finds pages by title", () => {
    const hits = searchSite("products");
    expect(hits[0].path).toBe("/products");
  });

  it("finds pages by keyword that is not in the title", () => {
    const hits = searchSite("fssai");
    expect(hits.map((h) => h.path)).toContain("/certificates");
  });

  it("surfaces the privacy dashboard for rights-related language", () => {
    const hits = searchSite("delete my data");
    expect(hits.map((h) => h.path)).toContain("/privacy-dashboard");
  });

  it("matches landing pages by cut size", () => {
    const hits = searchSite("9mm");
    expect(hits.some((h) => h.path.includes("9mm"))).toBe(true);
  });

  it("returns nothing for gibberish", () => {
    expect(searchSite("zzzqqqxxyy")).toHaveLength(0);
  });

  it("respects the result limit", () => {
    expect(searchSite("frozen", 3).length).toBeLessThanOrEqual(3);
  });
});
