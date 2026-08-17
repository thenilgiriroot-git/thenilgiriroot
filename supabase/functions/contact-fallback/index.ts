import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Lightweight in-memory IP throttle. Resets when the function instance restarts —
// good enough to deter casual spam but not a hardened rate limiter.
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Periodic cleanup
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a minute and try again." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      cta_type,
      variants,
      business_name,
      city,
      message,
    } = body ?? {};

    if (
      typeof name !== "string" || name.trim().length === 0 || name.length > 200 ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof phone !== "string" || phone.trim().length < 6 || phone.length > 30
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validCta = cta_type === "distributor" || cta_type === "restaurant" ? cta_type : null;
    const validVariants = Array.isArray(variants)
      ? variants.filter((v: any) => ["9mm", "10mm", "11mm"].includes(v))
      : [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("contact_fallback_submissions").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cta_type: validCta,
      variants: validVariants,
      business_name: typeof business_name === "string" ? business_name.slice(0, 200) : null,
      city: typeof city === "string" ? city.slice(0, 100) : null,
      message: typeof message === "string" ? message.slice(0, 2000) : null,
    });

    if (error) throw error;

    console.log("New fallback lead:", {
      name, email, phone, cta_type: validCta, variants: validVariants,
      business_name, city, message, ip,
    });

    // Forward to centralized lead pipeline (Sheets + email). Fire-and-forget.
    try {
      const projectUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const source_type = validCta === "restaurant" ? "rfq" : "whatsapp";
      const source_detail = validCta
        ? `${validCta}${validVariants.length ? ` · ${validVariants.join(",")}` : ""}`
        : "whatsapp_fallback";
      const composedMessage = [
        message?.toString().trim(),
        business_name ? `Business: ${business_name}` : null,
        city ? `City: ${city}` : null,
        validVariants.length ? `Variants: ${validVariants.join(", ")}` : null,
      ].filter(Boolean).join("\n");

      // Don't await — keep response fast for the user.
      fetch(`${projectUrl}/functions/v1/submit-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          source_type,
          source_detail,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          company: business_name ?? "",
          message: composedMessage,
          page_url: req.headers.get("referer") ?? "",
          extra: { cta_type: validCta, variants: validVariants, city },
        }),
      }).catch((e) => console.error("submit-lead forward failed", e));
    } catch (e) {
      console.error("submit-lead forward setup failed", e);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("contact-fallback error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
