import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
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
  return false;
}

const ALLOWED_SOURCES = new Set([
  "chatbot",
  "whatsapp",
  "rfq",
  "contact_form",
  "newsletter",
  "phone_click",
  "email_click",
  "other",
]);

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(p?: string | null): string {
  return (p ?? "").replace(/\D+/g, "");
}

function normalizeEmail(e?: string | null): string {
  return (e ?? "").trim().toLowerCase();
}

function scoreLead(p: Record<string, unknown>): number {
  let s = 0;
  if (normalizeEmail(p.email as string)) s += 25;
  if (normalizePhone(p.phone as string)) s += 25;
  if ((p.company as string)?.toString().trim()) s += 15;
  if ((p.message as string)?.toString().trim().length ?? 0 > 20) s += 10;
  if ((p.source_type as string) === "rfq") s += 25;
  if ((p.source_type as string) === "whatsapp") s += 10;
  return Math.min(100, s);
}

function genLeadId(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TNR-${y}${m}${day}-${rnd}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const source_type = String(body.source_type ?? "other").toLowerCase();
  if (!ALLOWED_SOURCES.has(source_type)) {
    return new Response(JSON.stringify({ error: "invalid_source_type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = normalizeEmail(body.email as string).slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 50);
  const company = String(body.company ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const source_detail = String(body.source_detail ?? "").trim().slice(0, 200);
  const raw_page_url = String(body.page_url ?? "").trim().slice(0, 500);
  let page_url = "";
  if (raw_page_url) {
    try {
      const u = new URL(raw_page_url);
      if (u.protocol === "http:" || u.protocol === "https:") {
        page_url = u.toString().slice(0, 500);
      }
    } catch {
      // Not a valid URL (e.g. user typed a password into chatbot) — drop silently.
      page_url = "";
    }
  }

  if (!name && !email && !phone) {
    return new Response(JSON.stringify({ error: "missing_contact" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const dedupeBasis = [
    source_type,
    normalizeEmail(email),
    normalizePhone(phone),
    name.toLowerCase(),
    message.toLowerCase().slice(0, 500),
  ].join("|");
  const payload_hash = await sha256Hex(dedupeBasis);
  const ip_hash = await sha256Hex(ip);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Dedupe window: 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: dupes } = await supabase
    .from("lead_submissions")
    .select("lead_id, sheet_status, email_status, created_at")
    .eq("payload_hash", payload_hash)
    .gte("created_at", since)
    .limit(1);

  if (dupes && dupes.length > 0) {
    return new Response(
      JSON.stringify({
        ok: true,
        deduped: true,
        lead_id: dupes[0].lead_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const lead_id = genLeadId();
  const idempotency_key = await sha256Hex(`${lead_id}|${payload_hash}`);
  const lead_score = scoreLead({ ...body, source_type });

  const fullPayload = {
    lead_id,
    source_type,
    source_detail,
    name,
    email,
    phone,
    company,
    message,
    page_url,
    lead_score,
    user_agent: req.headers.get("user-agent") ?? "",
    submitted_at: new Date().toISOString(),
    extra: body.extra ?? null,
  };

  // Insert pending row
  const { error: insertErr } = await supabase.from("lead_submissions").insert({
    lead_id,
    idempotency_key,
    payload_hash,
    source_type,
    source_detail: source_detail || null,
    lead_score,
    recipient_email: email || null,
    contact_name: name || null,
    contact_phone: phone || null,
    payload: fullPayload,
    ip_hash,
    user_agent: req.headers.get("user-agent") ?? null,
  });
  if (insertErr) {
    console.error("insert lead failed", insertErr);
    return new Response(JSON.stringify({ error: "db_insert_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Forward to Apps Script
  const webhookUrl = Deno.env.get("LEAD_WEBHOOK_URL");
  const webhookSecret = Deno.env.get("LEAD_WEBHOOK_SECRET");
  if (!webhookUrl || !webhookSecret) {
    // No Google Sheet webhook configured: notify the owner by email through the
    // transactional queue (delivered by process-email-queue via Resend).
    const esc = (v: string) =>
      v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const rows: [string, string][] = [
      ["Lead ID", lead_id],
      ["Source", source_type + (source_detail ? " / " + source_detail : "")],
      ["Name", name],
      ["Company", company],
      ["Email", email],
      ["Phone", phone],
      ["Message", message],
      ["Page", page_url],
      ["Score", String(lead_score)],
    ];
    const shown = rows.filter(([, v]) => v);
    const html =
      "<h2>New lead: " + esc(name || email || phone) + "</h2><table cellpadding='6'>" +
      shown.map(([k, v]) => "<tr><td><b>" + k + "</b></td><td>" + esc(v) + "</td></tr>").join("") +
      "</table>";
    const text = shown.map(([k, v]) => k + ": " + v).join("\n");
    const { error: enqErr } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: "lead-" + lead_id,
        to: Deno.env.get("LEAD_NOTIFY_EMAIL") ?? Deno.env.get("SECURITY_ALERT_EMAIL") ?? "admin@thenilgiriroot.com",
        subject: "New " + source_type + " lead: " + (name || email || phone),
        html,
        text,
        label: "lead-notification",
        purpose: "transactional",
        queued_at: new Date().toISOString(),
      },
    });
    const notify_status = enqErr ? "failed" : "queued";
    await supabase
      .from("lead_submissions")
      .update({
        sheet_status: "skipped",
        sheet_error: null,
        email_status: notify_status,
        email_error: enqErr ? String(enqErr.message).slice(0, 300) : null,
      })
      .eq("lead_id", lead_id);
    if (enqErr) console.error("lead notification enqueue failed", enqErr);
    return new Response(
      JSON.stringify({ ok: true, lead_id, email_status: notify_status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let sheet_status = "sent";
  let sheet_error: string | null = null;
  let email_status = "sent";
  let email_error: string | null = null;
  let sheet_name: string | null = null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": webhookSecret,
      },
      body: JSON.stringify({
        secret: webhookSecret,
        idempotency_key,
        ...fullPayload,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const text = await res.text();
    if (!res.ok) {
      sheet_status = "failed";
      sheet_error = `http_${res.status}: ${text.slice(0, 300)}`;
      email_status = "failed";
      email_error = sheet_error;
    } else {
      try {
        const j = JSON.parse(text);
        sheet_name = j.sheet_name ?? null;
        if (j.email_status === "failed") {
          email_status = "failed";
          email_error = j.email_error ?? "unknown";
        }
        if (j.sheet_status === "failed") {
          sheet_status = "failed";
          sheet_error = j.sheet_error ?? "unknown";
        }
      } catch {
        // non-JSON OK is still considered success
      }
    }
  } catch (e) {
    sheet_status = "failed";
    sheet_error = `fetch_error: ${(e as Error).message}`;
    email_status = "failed";
    email_error = sheet_error;
  }

  await supabase
    .from("lead_submissions")
    .update({ sheet_status, sheet_error, email_status, email_error, sheet_name })
    .eq("lead_id", lead_id);

  return new Response(
    JSON.stringify({ ok: true, lead_id, sheet_status, email_status }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
