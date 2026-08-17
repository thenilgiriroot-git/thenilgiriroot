/**
 * consent-log — append-only evidence of consent decisions (DPDP s.6).
 *
 * Writes one immutable row per decision. Never updates: the history of what a
 * person consented to and when IS the evidence, so overwriting the previous
 * state would destroy exactly what the Act requires us to be able to show.
 *
 * Data minimisation is deliberate here. We are told the browser's user agent
 * and the page URL, which are useful for demonstrating the notice that was
 * shown — but we do not store the IP address. A consent record should not
 * become a tracking record.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ConsentPayload {
  receipt_id?: unknown;
  consent_version?: unknown;
  method?: unknown;
  analytics?: unknown;
  marketing?: unknown;
  decided_at?: unknown;
  page_url?: unknown;
  user_agent?: unknown;
}

const VALID_METHODS = new Set([
  "banner-accept-all",
  "banner-reject-all",
  "banner-custom",
  "dashboard",
  "renewed",
  "withdrawn",
]);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: ConsentPayload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Validate rather than trust. This endpoint is public by necessity — the
  // decision is made before anyone signs in — so everything is checked.
  if (!isNonEmptyString(body.receipt_id) || body.receipt_id.length > 64) {
    return json({ error: "receipt_id is required" }, 400);
  }
  if (typeof body.consent_version !== "number" || !Number.isInteger(body.consent_version)) {
    return json({ error: "consent_version must be an integer" }, 400);
  }
  if (!isNonEmptyString(body.method) || !VALID_METHODS.has(body.method)) {
    return json({ error: "method is not recognised" }, 400);
  }
  if (typeof body.analytics !== "boolean" || typeof body.marketing !== "boolean") {
    return json({ error: "analytics and marketing must be booleans" }, 400);
  }

  // Trust our own clock over the client's for the stored timestamp, but keep
  // the client's claim if it is sane — a device with a skewed clock shouldn't
  // produce a record dated 2019.
  const clientTime = isNonEmptyString(body.decided_at) ? Date.parse(body.decided_at) : NaN;
  const now = Date.now();
  const decidedAt =
    Number.isFinite(clientTime) && Math.abs(now - clientTime) < 24 * 60 * 60 * 1000
      ? new Date(clientTime).toISOString()
      : new Date(now).toISOString();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { error } = await supabase.from("consent_log").insert({
    receipt_id: body.receipt_id.slice(0, 64),
    consent_version: body.consent_version,
    method: body.method,
    analytics: body.analytics,
    marketing: body.marketing,
    decided_at: decidedAt,
    page_url: isNonEmptyString(body.page_url) ? body.page_url.slice(0, 500) : null,
    user_agent: isNonEmptyString(body.user_agent) ? body.user_agent.slice(0, 400) : null,
  });

  if (error) {
    console.error("consent-log insert failed", error.message);
    // The user's choice has already been applied client-side. Report the
    // failure for monitoring, but do not imply their decision didn't stick.
    return json({ error: "Could not record consent receipt" }, 500);
  }

  return json({ ok: true, receipt_id: body.receipt_id }, 200);
});

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
