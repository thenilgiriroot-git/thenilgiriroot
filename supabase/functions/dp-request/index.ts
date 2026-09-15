/**
 * dp-request — intake for Data Principal rights requests and grievances.
 *
 * Implements the request side of DPDP Chapter III (ss.11–14) and the s.13
 * grievance mechanism.
 *
 * Identity verification: we email a one-time link to the address given rather
 * than demanding identity documents. Two reasons. First, proportionality —
 * collecting a government ID to service a privacy request means collecting
 * *more* sensitive data than the request concerns. Second, control of the
 * mailbox is the same proof we would rely on to send the person their data
 * anyway. Requests stay 'received' and unactioned until verified, so an
 * attacker cannot trigger erasure of someone else's records.
 *
 * The response is deliberately identical whether or not we hold data for the
 * address, so this endpoint cannot be used to enumerate customers.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { DpRequestVerificationEmail } from "../_shared/email-templates/dp-request-verification.tsx";

const SITE_NAME = "The Nilgiri Root";
const ROOT_DOMAIN = "thenilgiriroot.com";
const FROM_DOMAIN = "thenilgiriroot.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Published response commitment. Keep in step with legalEntity.ts. */
const RESPONSE_DAYS = 30;

const REQUEST_TYPES = new Set([
  "access",
  "correction",
  "erasure",
  "withdraw",
  "nomination",
  "grievance",
]);

interface Payload {
  action?: unknown;
  request_type?: unknown;
  email?: unknown;
  full_name?: unknown;
  phone?: unknown;
  details?: unknown;
  consent_receipt_id?: unknown;
  /** Honeypot — must be empty. */
  website?: unknown;
  /** Only present when action === "verify". */
  token?: unknown;
  reference?: unknown;
}

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Human-quotable reference, e.g. DPR-7QK4M2. Avoids ambiguous characters. */
function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "DPR-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function makeToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (body.action === "verify") {
    return handleVerify(body);
  }

  // Honeypot. Answer as if accepted so a bot gains no signal.
  if (isStr(body.website)) {
    return json({ ok: true, reference: makeReference(), response_days: RESPONSE_DAYS }, 200);
  }

  if (!isStr(body.request_type) || !REQUEST_TYPES.has(body.request_type)) {
    return json({ error: "Please choose a valid request type." }, 400);
  }
  if (!isStr(body.email) || !EMAIL_RE.test(body.email) || body.email.length > 200) {
    return json({ error: "Please provide a valid email address." }, 400);
  }
  if (isStr(body.details) && body.details.length > 5000) {
    return json({ error: "Please keep the description under 5,000 characters." }, 400);
  }

  const email = body.email.trim().toLowerCase();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // Rate limit per address so the endpoint can't be used to spam someone's
  // inbox with verification mails.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("data_principal_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);

  if ((count ?? 0) >= 5) {
    return json(
      { error: "Several requests have already been submitted for this address. Please check your email, or contact us directly." },
      429,
    );
  }

  const reference = makeReference();
  const token = makeToken();
  const nowMs = Date.now();

  const { data: inserted, error } = await supabase
    .from("data_principal_requests")
    .insert({
      reference,
      request_type: body.request_type,
      status: "received",
      email,
      full_name: isStr(body.full_name) ? body.full_name.slice(0, 200) : null,
      phone: isStr(body.phone) ? body.phone.slice(0, 40) : null,
      details: isStr(body.details) ? body.details.slice(0, 5000) : null,
      consent_receipt_id: isStr(body.consent_receipt_id)
        ? body.consent_receipt_id.slice(0, 64)
        : null,
      verification_token: token,
      token_expires_at: new Date(nowMs + 48 * 60 * 60 * 1000).toISOString(),
      due_at: new Date(nowMs + RESPONSE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("dp-request insert failed", error?.message);
    return json({ error: "We could not record your request. Please email us directly." }, 500);
  }

  // Opens the audit trail for this request. Secondary to the request itself,
  // so a failure here is logged but never surfaced to the Data Principal.
  const { error: eventError } = await supabase.from("data_principal_request_events").insert({
    request_id: inserted.id,
    from_status: null,
    to_status: "received",
    note: `Request ${reference} received via web form`,
    actor: "system",
  });
  if (eventError) console.warn("dp-request event log failed", eventError.message);

  await sendVerificationEmail(supabase, {
    email,
    requestType: body.request_type,
    reference,
    token,
  });

  return json({ ok: true, reference, response_days: RESPONSE_DAYS }, 200);
});

/**
 * Confirms a request via the one-time token emailed to the requester. Unlike
 * the initial submission, an identical response here is not required —
 * whoever holds the 256-bit token already has all the proof of ownership
 * this system relies on, so there is nothing left to hide by being vague.
 */
async function handleVerify(body: Payload): Promise<Response> {
  if (!isStr(body.token) || !isStr(body.reference)) {
    return json({ ok: false, error: "Missing or invalid verification link." }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data: reqRow, error: fetchError } = await supabase
    .from("data_principal_requests")
    .select("id, status, verified_at, verification_token, token_expires_at, request_type")
    .eq("reference", body.reference)
    .maybeSingle();

  if (fetchError || !reqRow || reqRow.verification_token !== body.token) {
    return json({ ok: false, error: "This verification link is invalid." }, 400);
  }

  if (reqRow.verified_at) {
    // Already verified — treat repeat clicks as success rather than an error.
    return json({ ok: true, reference: body.reference, already_verified: true }, 200);
  }

  if (!reqRow.token_expires_at || new Date(reqRow.token_expires_at).getTime() < Date.now()) {
    return json(
      { ok: false, error: "This verification link has expired. Please submit your request again." },
      400,
    );
  }

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("data_principal_requests")
    .update({ verified_at: nowIso, status: "in_progress" })
    .eq("id", reqRow.id);

  if (updateError) {
    console.error("dp-request verify update failed", updateError.message);
    return json({ ok: false, error: "We couldn't confirm this right now. Please try again shortly." }, 500);
  }

  await supabase.from("data_principal_request_events").insert({
    request_id: reqRow.id,
    from_status: reqRow.status,
    to_status: "in_progress",
    note: "Requester confirmed via emailed verification link",
    actor: "system",
  });

  return json({ ok: true, reference: body.reference, already_verified: false }, 200);
}

/**
 * Emails the one-time verification link. Failure here must never surface to
 * the caller — the request is already recorded and the public response is
 * deliberately identical regardless of whether we hold data for the address,
 * so a caller can't tell a delivery failure from "nothing found" anyway.
 * Any failure is logged for the grievance officer to catch from function logs.
 */
async function sendVerificationEmail(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  opts: { email: string; requestType: string; reference: string; token: string },
) {
  try {
    const verificationUrl =
      `https://${ROOT_DOMAIN}/privacy-dashboard?verify=${opts.token}&ref=${opts.reference}`;

    const props = {
      siteName: SITE_NAME,
      requestType: opts.requestType,
      reference: opts.reference,
      verificationUrl,
      responseDays: RESPONSE_DAYS,
    };

    const html = await renderAsync(React.createElement(DpRequestVerificationEmail, props));
    const text = await renderAsync(React.createElement(DpRequestVerificationEmail, props), {
      plainText: true,
    });

    const messageId = crypto.randomUUID();

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "dp_request_verification",
      recipient_email: opts.email,
      status: "pending",
    });

    const { error } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: opts.email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        subject: `Confirm your request — ${opts.reference}`,
        html,
        text,
        purpose: "transactional",
        label: "dp-request-verification",
      },
    });

    if (error) {
      console.error("dp-request enqueue_email failed", error.message);
      await supabase.from("email_send_log").insert({
        message_id: crypto.randomUUID(),
        template_name: "dp_request_verification",
        recipient_email: opts.email,
        status: "failed",
        error_message: "Failed to enqueue email",
      });
    }
  } catch (e) {
    console.error("dp-request sendVerificationEmail error", e);
  }
}

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
