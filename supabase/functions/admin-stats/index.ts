import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// IP rate limiter: 3 attempts / minute, 60-min lockout after threshold.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60_000;
type RLState = { hits: number[]; lockedUntil: number };
const ipState = new Map<string, RLState>();

function rateLimitCheck(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const s = ipState.get(ip) ?? { hits: [], lockedUntil: 0 };
  if (s.lockedUntil > now) {
    return { limited: true, retryAfterSec: Math.ceil((s.lockedUntil - now) / 1000) };
  }
  s.hits = s.hits.filter((t) => now - t < WINDOW_MS);
  if (s.hits.length >= MAX_ATTEMPTS) {
    s.lockedUntil = now + LOCKOUT_MS;
    ipState.set(ip, s);
    return { limited: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
  }
  ipState.set(ip, s);
  return { limited: false, retryAfterSec: 0 };
}

function recordFailedAttempt(ip: string) {
  const s = ipState.get(ip) ?? { hits: [], lockedUntil: 0 };
  s.hits.push(Date.now());
  ipState.set(ip, s);
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (Deno.env.get("SUPABASE_URL") ?? ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function logRequest(
  supabase: any,
  outcome: string,
  status: number,
  ipHash: string,
  userAgent: string | null,
  startedAt: number,
  reason?: string
) {
  try {
    await supabase.from("edge_request_log").insert({
      function_name: "admin-stats",
      status_code: status,
      outcome,
      ip_hash: ipHash,
      user_agent: userAgent?.slice(0, 500) ?? null,
      latency_ms: Date.now() - startedAt,
      reason: reason ?? null,
    });
  } catch (e) {
    console.error("logRequest failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const ipHash = await hashIp(ip);
  const userAgent = req.headers.get("user-agent");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Rate limit BEFORE reading the body — combine in-memory fast path with a
  // DB-backed check so cold-started instances also enforce the lockout.
  const rl = rateLimitCheck(ip);
  let limited = rl.limited;
  let retryAfter = rl.retryAfterSec;
  if (!limited) {
    try {
      const { data: locked } = await supabase.rpc("is_ip_locked_out", {
        _function_name: "admin-stats",
        _ip_hash: ipHash,
        _window_seconds: 60,
        _max_attempts: 3,
        _lockout_seconds: 3600,
      });
      if (locked === true) {
        limited = true;
        retryAfter = 3600;
      }
    } catch (e) {
      console.error("is_ip_locked_out failed", e);
    }
  }
  if (limited) {
    await logRequest(supabase, "rate_limited", 429, ipHash, userAgent, startedAt);
    return new Response(
      JSON.stringify({ error: "Too many attempts. Try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  try {
    const { password } = await req.json();
    const expected = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");

    if (!expected || typeof password !== "string" || password !== expected) {
      recordFailedAttempt(ip);
      await logRequest(supabase, "unauthorized", 401, ipHash, userAgent, startedAt, "bad_password");
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [clicksRes, fallbackRes] = await Promise.all([
      supabase
        .from("whatsapp_clicks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("contact_fallback_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    if (clicksRes.error) throw clicksRes.error;
    if (fallbackRes.error) throw fallbackRes.error;

    const clicks = clicksRes.data ?? [];
    const fallbacks = fallbackRes.data ?? [];

    const stats = {
      total: clicks.length,
      distributor: clicks.filter((c: any) => c.cta_type === "distributor").length,
      restaurant: clicks.filter((c: any) => c.cta_type === "restaurant").length,
      byVariant: {
        "9mm": clicks.filter((c: any) => c.variants?.includes("9mm")).length,
        "10mm": clicks.filter((c: any) => c.variants?.includes("10mm")).length,
        "11mm": clicks.filter((c: any) => c.variants?.includes("11mm")).length,
      },
      bySource: clicks.reduce((acc: Record<string, number>, c: any) => {
        const k = c.page_source ?? "unknown";
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
      byCountry: clicks.reduce((acc: Record<string, number>, c: any) => {
        const k = c.country ?? "unknown";
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
    };

    await logRequest(supabase, "ok", 200, ipHash, userAgent, startedAt);
    return new Response(
      JSON.stringify({ stats, clicks, fallbacks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("admin-stats error", e);
    await logRequest(supabase, "error", 500, ipHash, userAgent, startedAt, String(e).slice(0, 200));
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
