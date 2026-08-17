// Security alerts dispatcher.
//
// Runs periodically (or on-demand) to:
//   1. Detect auth-failure spikes on admin-stats / generate-blog-post per IP.
//   2. Detect rate-limit floods (HTTP 429) on protected endpoints per IP.
//   3. Diff a provided list of scan findings against the last snapshot
//      stored in security_scan_snapshots and alert on new ones.
//
// All alerts are written to security_alerts (deduped by alert_key within a
// 6-hour window) and emailed to SECURITY_ALERT_EMAIL via the existing
// notify.thenilgiriroot.com email queue.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALERT_DEDUP_WINDOW_MS = 6 * 60 * 60_000; // 6h
const LOOKBACK_MS = 30 * 60_000;               // 30 min
const AUTH_FAIL_THRESHOLD = 10;                // 10 failed admin auth attempts/IP/30m
const RATE_LIMIT_THRESHOLD = 25;               // 25 rate-limit hits/IP/30m

type AlertInput = {
  alert_type: string;
  alert_key: string;
  severity?: "info" | "warn" | "error";
  summary: string;
  details?: Record<string, unknown>;
};

async function maybeRaiseAlert(supabase: any, alert: AlertInput) {
  const { data: existing } = await supabase
    .from("security_alerts")
    .select("id, created_at")
    .eq("alert_key", alert.alert_key)
    .gte("created_at", new Date(Date.now() - ALERT_DEDUP_WINDOW_MS).toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) return { raised: false, reason: "duplicate" };

  const { data: inserted, error } = await supabase
    .from("security_alerts")
    .insert({
      alert_type: alert.alert_type,
      alert_key: alert.alert_key,
      severity: alert.severity ?? "warn",
      summary: alert.summary,
      details: alert.details ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert alert", error);
    return { raised: false, reason: "insert_error" };
  }

  await sendAlertEmail(supabase, inserted);
  return { raised: true, alert: inserted };
}

async function sendAlertEmail(supabase: any, alert: any) {
  const to = Deno.env.get("SECURITY_ALERT_EMAIL");
  if (!to) {
    console.warn("SECURITY_ALERT_EMAIL not configured; skipping email");
    return;
  }
  const subject = `[security:${alert.severity}] ${alert.alert_type} — ${alert.summary.slice(0, 80)}`;
  const html = `
    <h2>Security Alert</h2>
    <p><strong>Type:</strong> ${alert.alert_type}</p>
    <p><strong>Severity:</strong> ${alert.severity}</p>
    <p><strong>Summary:</strong> ${alert.summary}</p>
    <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto">${
      JSON.stringify(alert.details ?? {}, null, 2)
    }</pre>
    <p style="color:#888;font-size:12px">Raised at ${alert.created_at}</p>
  `;
  const text = `Security Alert
Type: ${alert.alert_type}
Severity: ${alert.severity}
Summary: ${alert.summary}

${JSON.stringify(alert.details ?? {}, null, 2)}

Raised at ${alert.created_at}
`;

  try {
    const messageId = `security-alert-${alert.id}`;
    const { error } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to,
        subject,
        html,
        text,
        label: "security-alert",
        purpose: "transactional",
      },
    });
    if (error) {
      console.error("enqueue_email failed", error);
      return;
    }
    await supabase
      .from("security_alerts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", alert.id);
  } catch (e) {
    console.error("sendAlertEmail error", e);
  }
}

async function checkAuthFailureSpikes(supabase: any) {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();
  const { data, error } = await supabase
    .from("edge_request_log")
    .select("function_name, ip_hash, outcome, created_at")
    .gte("created_at", since)
    .in("outcome", ["unauthorized"]);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const k = `${row.function_name}::${row.ip_hash ?? "unknown"}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const raised: string[] = [];
  for (const [key, count] of counts) {
    if (count >= AUTH_FAIL_THRESHOLD) {
      const [fn, ipHash] = key.split("::");
      const r = await maybeRaiseAlert(supabase, {
        alert_type: "auth_failure_spike",
        alert_key: `auth_spike:${fn}:${ipHash}`,
        severity: "error",
        summary: `${count} unauthorized attempts on ${fn} from ip_hash=${ipHash} in last 30m`,
        details: { function_name: fn, ip_hash: ipHash, count, lookback_minutes: 30 },
      });
      if (r.raised) raised.push(key);
    }
  }
  return { auth_failure_alerts: raised.length };
}

async function checkRateLimitFloods(supabase: any) {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();
  const { data, error } = await supabase
    .from("edge_request_log")
    .select("function_name, ip_hash, outcome")
    .gte("created_at", since)
    .eq("outcome", "rate_limited");
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const k = `${row.function_name}::${row.ip_hash ?? "unknown"}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const raised: string[] = [];
  for (const [key, count] of counts) {
    if (count >= RATE_LIMIT_THRESHOLD) {
      const [fn, ipHash] = key.split("::");
      const r = await maybeRaiseAlert(supabase, {
        alert_type: "rate_limit_flood",
        alert_key: `rl_flood:${fn}:${ipHash}`,
        severity: "warn",
        summary: `${count} rate-limit hits on ${fn} from ip_hash=${ipHash} in last 30m`,
        details: { function_name: fn, ip_hash: ipHash, count, lookback_minutes: 30 },
      });
      if (r.raised) raised.push(key);
    }
  }
  return { rate_limit_flood_alerts: raised.length };
}

function fingerprint(f: any): string {
  // Stable identifier for a finding regardless of cosmetic changes.
  const id = f?.id ?? f?.internal_id ?? "unknown";
  const internal = f?.internal_id ?? "";
  const scanner = f?.scanner_name ?? "";
  return `${scanner}|${id}|${internal}`;
}

async function diffScanFindings(supabase: any, findings: any[]) {
  const fps = Array.from(new Set(findings.map(fingerprint))).sort();

  const { data: last } = await supabase
    .from("security_scan_snapshots")
    .select("finding_fingerprints, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const previous: string[] = last?.finding_fingerprints ?? [];
  const newOnes = fps.filter((f) => !previous.includes(f));

  // Always insert a new snapshot
  await supabase.from("security_scan_snapshots").insert({
    finding_fingerprints: fps,
    finding_count: fps.length,
    raw: { findings },
  });

  let raisedCount = 0;
  for (const fp of newOnes) {
    const finding = findings.find((f) => fingerprint(f) === fp);
    const r = await maybeRaiseAlert(supabase, {
      alert_type: "new_scan_finding",
      alert_key: `scan:${fp}`,
      severity: (finding?.level as any) === "error" ? "error" : "warn",
      summary: `New scan finding: ${finding?.name ?? fp}`,
      details: {
        fingerprint: fp,
        scanner_name: finding?.scanner_name,
        finding,
      },
    });
    if (r.raised) raisedCount++;
  }

  return {
    new_scan_findings: newOnes.length,
    new_scan_alerts: raisedCount,
    snapshot_count: fps.length,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Require admin password to invoke (so a casual caller can't spam the
  // alerts table or trigger emails).
  const expected = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");
  const provided = req.headers.get("x-admin-password") || req.headers.get("X-Admin-Password");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const findings = Array.isArray(body?.findings) ? body.findings : null;

    const [auth, flood] = await Promise.all([
      checkAuthFailureSpikes(supabase),
      checkRateLimitFloods(supabase),
    ]);

    let scan: Record<string, unknown> = { skipped: true };
    if (findings) {
      scan = await diffScanFindings(supabase, findings);
    }

    return new Response(
      JSON.stringify({ ok: true, auth, flood, scan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("security-alerts error", e);
    return new Response(JSON.stringify({ error: String(e).slice(0, 200) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
