import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Per-IP rate limiter for the chat (more lenient than admin endpoints):
// 20 messages / minute, then 5-minute cool-off.
const CHAT_WINDOW_MS = 60_000;
const CHAT_MAX = 20;
const CHAT_LOCKOUT_MS = 5 * 60_000;
type RLState = { hits: number[]; lockedUntil: number };
const ipState = new Map<string, RLState>();

function chatRateLimit(ip: string) {
  const now = Date.now();
  const s = ipState.get(ip) ?? { hits: [], lockedUntil: 0 };
  if (s.lockedUntil > now) {
    return { limited: true, retryAfterSec: Math.ceil((s.lockedUntil - now) / 1000) };
  }
  s.hits = s.hits.filter((t) => now - t < CHAT_WINDOW_MS);
  if (s.hits.length >= CHAT_MAX) {
    s.lockedUntil = now + CHAT_LOCKOUT_MS;
    ipState.set(ip, s);
    return { limited: true, retryAfterSec: Math.ceil(CHAT_LOCKOUT_MS / 1000) };
  }
  s.hits.push(now);
  ipState.set(ip, s);
  return { limited: false, retryAfterSec: 0 };
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (Deno.env.get("SUPABASE_URL") ?? ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? createClient(url, key) : null;
}

async function logRequest(
  outcome: string,
  status: number,
  ipHash: string,
  userAgent: string | null,
  startedAt: number,
  reason?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = getServiceClient();
  if (!supabase) return;
  try {
    await supabase.from("edge_request_log").insert({
      function_name: "rootbot-chat",
      status_code: status,
      outcome,
      ip_hash: ipHash,
      user_agent: userAgent?.slice(0, 500) ?? null,
      latency_ms: Date.now() - startedAt,
      reason: reason ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.error("logRequest failed", e);
  }
}

const SYSTEM_PROMPT = `You are RootBot, the friendly AI assistant for The Nilgiri Root — a premium frozen french fries brand from the Nilgiri mountains of Tamil Nadu, India.

ABOUT THE COMPANY:
- The Nilgiri Root transforms locally grown vegetables into value added farm products
- Premium frozen french fries from potatoes grown in the Nilgiri mountains at 7,000ft elevation
- Founded by Sowmiya Moorthy
- Located in Sholur, The Nilgiris, Tamil Nadu, India - 643005
- FSSAI License: 12426021000002
- Contact: +91 75399 31361, admin@thenilgiriroot.com

PRODUCTS:
- Classic Cut 9mm — Crisp & quick, ideal for fast service
- Classic Cut 10mm — Versatile all-rounder, most popular
- Classic Cut 11mm — Thick steakhouse-style cut
- Available in 500g, 1kg, and 2.5kg packs

MANUFACTURING PROCESS:
1. Farm sourcing from Nilgiri mountain farms
2. Multi-stage cleaning and optical sorting
3. Precision cutting (9mm, 10mm, 11mm)
4. Hot water blanching
5. Light par-frying in premium oil
6. Blast freezing at sub-zero temperatures
7. Food-grade packaging
8. Cold chain distribution

KEY SELLING POINTS:
- 100% Nilgiri mountain potatoes
- Blast freezing process for peak texture and flavour
- Farm-to-freezer freshness
- FSSAI certified
- Premium quality for restaurants, hotels, distribution and retail

GUIDELINES:
- Be friendly, professional, and helpful
- Keep responses concise (2-3 paragraphs max)
- If asked about pricing or orders, direct them to: +91 75399 31361 or admin@thenilgiriroot.com
- For distribution inquiries, encourage them to use the contact form or WhatsApp at +91 75399 31361
- Always maintain a premium brand tone
- Never use the terms "IQF" or "flash freezing" — always use "blast freezing" / "blast freezer"`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const ipHash = await hashIp(ip);
  const userAgent = req.headers.get("user-agent");

  const rl = chatRateLimit(ip);
  if (rl.limited) {
    await logRequest("rate_limited", 429, ipHash, userAgent, startedAt);
    return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfterSec) },
    });
  }

  try {
    const body = await req.json();
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    // Validation: only allow user/assistant roles, cap content length, and limit
    // total history size to prevent token-cost inflation and prompt injection.
    const MAX_MESSAGES = 10;
    const MAX_CONTENT_LENGTH = 2000;
    const safeMessages = rawMessages
      .filter(
        (m: any) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.length > 0
      )
      .slice(-MAX_MESSAGES)
      .map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, MAX_CONTENT_LENGTH),
      }));

    if (safeMessages.length === 0) {
      await logRequest("invalid_input", 400, ipHash, userAgent, startedAt, "no_valid_messages");
      return new Response(JSON.stringify({ error: "No valid messages provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        await logRequest("rate_limited", 429, ipHash, userAgent, startedAt, "ai_gateway_429");
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await logRequest("error", 402, ipHash, userAgent, startedAt, "ai_payment_required");
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      await logRequest("error", 500, ipHash, userAgent, startedAt, `ai_gateway_${response.status}`);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget log; we don't await the body since it streams.
    logRequest("ok", 200, ipHash, userAgent, startedAt, undefined, {
      message_count: safeMessages.length,
    }).catch((e) => console.error("log error", e));

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    await logRequest("error", 500, ipHash, userAgent, startedAt, String(e).slice(0, 200));
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
