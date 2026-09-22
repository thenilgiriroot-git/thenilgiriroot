import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { geminiCall, textToSse } from "../_shared/gemini.ts";

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

const SYSTEM_PROMPT = `You are RootBot, the assistant for The Nilgiri Root — a premium frozen french fries manufacturer from the Nilgiri mountains of Tamil Nadu, India. Most people who open this chat are evaluating a B2B supplier, not browsing casually — treat every conversation as a potential enquiry worth handling well.

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

HANDLING ENQUIRIES:
- Figure out who you're talking to early — distributor, HORECA/restaurant, retailer, or exporter — and which cut size and pack size fit their use case. Ask one focused follow-up question at a time rather than a checklist.
- Typical buyer questions and how to handle them:
  - "What's the price?" / "MOQ?" — You don't have live pricing or MOQ figures. Say so plainly, then ask for their city and approximate monthly volume so the team can quote accurately, and give them the contact details.
  - "Can I get a sample?" — Confirm samples can be arranged, then ask what cut size and quantity they'd like to try, and collect how to reach them.
  - "Do you export / ship to [country]?" — Confirm The Nilgiri Root supplies pan-India and handles export enquiries case by case; ask for their country and expected volume, then hand off.
  - Quality complaint or urgent order — Do not try to resolve it yourself. Acknowledge it seriously and give the phone number and email immediately, without further questions.
- When someone shows real buying intent (asks about pricing, samples, bulk orders, or says they want to partner/distribute), naturally ask for their name and the best phone number or email to reach them — don't be pushy about it, and never ask more than once per conversation.
- If asked something outside what you know (exact nutrition figures, certifications not listed above, delivery timelines, competitor comparisons), say you don't have that detail rather than guessing, and route them to +91 75399 31361 or admin@thenilgiriroot.com.

GUIDELINES:
- Be friendly, professional, and helpful — sound like a knowledgeable person on the sales team, not a generic chatbot.
- Keep responses concise (2-3 paragraphs max), and shorter when a quick answer will do.
- Always maintain a premium brand tone.
- Never invent prices, MOQs, lead times, or certifications not listed above.
- Never use the terms "IQF" or "flash freezing" — always use "blast freezing" / "blast freezer".`;

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const response = await geminiCall(GEMINI_API_KEY, {
      model: Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite",
      system: SYSTEM_PROMPT,
      messages: safeMessages,
    });

    if (!response.ok) {
      if (response.status === 429) {
        await logRequest("rate_limited", 429, ipHash, userAgent, startedAt, "ai_429");
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
      await logRequest("error", 500, ipHash, userAgent, startedAt, `ai_${response.status}`);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget log; we don't await the body since it streams.
    logRequest("ok", 200, ipHash, userAgent, startedAt, undefined, {
      message_count: safeMessages.length,
    }).catch((e) => console.error("log error", e));

    const aiJson = await response.json();
    const reply: string = aiJson.choices?.[0]?.message?.content ?? "";
    if (!reply) throw new Error("Empty AI response");

    return new Response(textToSse(reply), {
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
