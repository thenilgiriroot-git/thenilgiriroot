-- ═══════════════════════════════════════════════════════════════════════════
--  DPDP Act, 2023 — compliance infrastructure
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Tables:
--    consent_log             evidence of every consent decision (s.6)
--    data_principal_requests rights requests + grievances (Ch. III, s.13)
--    guardian_consents       verifiable parental / guardian consent (s.9)
--    breach_register         incident record + Board notification (s.8(6))
--    processing_activities   RoPA, mirrored from src/data/legalEntity.ts
--
--  Security posture: every table is RLS-enabled and DENIES all client access
--  by default. Writes happen only through edge functions using the service
--  role. This matters because these tables are themselves a concentration of
--  personal data — a compliance system that leaks is worse than none.

-- ─────────────────────────────────────────────────────────────────────────
--  Consent log
-- ─────────────────────────────────────────────────────────────────────────
-- s.6 requires the Data Fiduciary to be able to demonstrate that consent was
-- given, for which purposes, and when. Note what is deliberately NOT stored:
-- no raw IP address and no email unless the principal identifies themselves.
-- The receipt_id is an opaque client-generated token, so a visitor can quote
-- it to us without us having to profile them to find their record.

create table if not exists public.consent_log (
  id                uuid primary key default gen_random_uuid(),
  receipt_id        text not null,
  consent_version   integer not null,
  method            text not null
                      check (method in ('banner-accept-all','banner-reject-all',
                                        'banner-custom','dashboard','renewed','withdrawn')),
  analytics         boolean not null,
  marketing         boolean not null,
  decided_at        timestamptz not null,
  page_url          text,
  user_agent        text,
  -- Populated only when a request links a receipt to an identified person.
  linked_email      text,
  created_at        timestamptz not null default now()
);

comment on table public.consent_log is
  'DPDP s.6 evidence trail. One row per consent decision; rows are never updated or deleted.';
comment on column public.consent_log.receipt_id is
  'Opaque token held by the Data Principal so they can reference their record without being profiled.';

create index if not exists consent_log_receipt_idx on public.consent_log (receipt_id);
create index if not exists consent_log_decided_idx on public.consent_log (decided_at desc);
create index if not exists consent_log_email_idx on public.consent_log (linked_email)
  where linked_email is not null;

alter table public.consent_log enable row level security;
-- No policies = no client access. Edge functions use the service role.

-- ─────────────────────────────────────────────────────────────────────────
--  Data Principal requests
-- ─────────────────────────────────────────────────────────────────────────
-- Covers the Chapter III rights and the s.13 grievance mechanism in one
-- workflow, because to the person making it they are the same act: "I want
-- something done about my data."

create type public.dp_request_type as enum (
  'access',        -- s.11 summary of data + processing + recipients
  'correction',    -- s.12 correct / complete / update
  'erasure',       -- s.12 erase
  'withdraw',      -- s.6(4) withdraw consent
  'nomination',    -- s.14 nominate another individual
  'grievance'      -- s.13 grievance redressal
);

create type public.dp_request_status as enum (
  'received',
  'verifying',      -- confirming the requester is who they say they are
  'in_progress',
  'awaiting_principal',
  'completed',
  'rejected',       -- with a reason; e.g. legal retention obligation
  'withdrawn'
);

create table if not exists public.data_principal_requests (
  id                  uuid primary key default gen_random_uuid(),
  -- Short human-quotable reference, e.g. DPR-7QK4M2.
  reference           text not null unique,
  request_type        public.dp_request_type not null,
  status              public.dp_request_status not null default 'received',

  -- Identity as asserted by the requester. Verified separately via a token
  -- emailed to this address; we do not ask for identity documents by default.
  email               text not null,
  full_name           text,
  phone               text,
  details             text,

  verified_at         timestamptz,
  verification_token  text,
  token_expires_at    timestamptz,

  -- Links a request to the consent decisions made from the same browser.
  consent_receipt_id  text,

  -- Statutory clock. Defaulted in the edge function, not here, so the policy
  -- window lives in one place with the published response time.
  due_at              timestamptz,
  responded_at        timestamptz,
  resolution_note     text,
  rejection_reason    text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.data_principal_requests is
  'DPDP Chapter III rights requests and s.13 grievances. due_at drives the SLA report.';

create index if not exists dpr_status_idx on public.data_principal_requests (status, due_at);
create index if not exists dpr_email_idx  on public.data_principal_requests (lower(email));
create index if not exists dpr_ref_idx    on public.data_principal_requests (reference);

alter table public.data_principal_requests enable row level security;

-- Audit trail of every state change on a request. Append-only.
create table if not exists public.data_principal_request_events (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.data_principal_requests(id) on delete cascade,
  from_status  public.dp_request_status,
  to_status    public.dp_request_status not null,
  note         text,
  actor        text,          -- 'system' | 'principal' | staff identifier
  created_at   timestamptz not null default now()
);

create index if not exists dpre_request_idx on public.data_principal_request_events (request_id, created_at);
alter table public.data_principal_request_events enable row level security;

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dpr_touch_updated_at on public.data_principal_requests;
create trigger dpr_touch_updated_at
  before update on public.data_principal_requests
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
--  Verifiable guardian consent (s.9)
-- ─────────────────────────────────────────────────────────────────────────
-- s.9 requires verifiable consent from a parent or lawful guardian before
-- processing a child's data (under 18), and the same for a person with a
-- disability who has a lawful guardian. It also bars tracking, behavioural
-- monitoring and targeted advertising directed at children.
--
-- This site is B2B and should not be collecting children's data at all. The
-- table exists so that IF an age declaration ever fails, or a guardian flow is
-- introduced, there is a lawful place to record the verification — rather than
-- someone improvising it later.

create type public.guardian_verification_method as enum (
  'digilocker',        -- DPDP Rules contemplate a virtual token / DigiLocker route
  'identity_document',
  'email_confirmation',
  'manual_review'
);

create table if not exists public.guardian_consents (
  id                    uuid primary key default gen_random_uuid(),
  reference             text not null unique,

  -- The child / person with a guardian. Minimised deliberately: no DOB stored,
  -- only the declared age band that triggered the flow.
  subject_age_band      text not null check (subject_age_band in ('under_18','adult_with_guardian')),
  subject_reference     text,

  guardian_name         text not null,
  guardian_email        text not null,
  guardian_relationship text not null,

  verification_method   public.guardian_verification_method not null,
  verified              boolean not null default false,
  verified_at           timestamptz,
  verification_note     text,

  purposes              text[] not null default '{}',
  withdrawn_at          timestamptz,

  created_at            timestamptz not null default now()
);

comment on table public.guardian_consents is
  'DPDP s.9 verifiable parental/guardian consent records. Should normally be empty on a B2B site.';

create index if not exists gc_guardian_email_idx on public.guardian_consents (lower(guardian_email));
alter table public.guardian_consents enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
--  Breach register (s.8(6))
-- ─────────────────────────────────────────────────────────────────────────
-- Every incident is recorded, whether or not it met the notification
-- threshold — the decision not to notify is itself something you must be able
-- to justify later.

create type public.breach_severity as enum ('low','medium','high','critical');

create type public.breach_status as enum (
  'detected',
  'contained',
  'assessing',
  'principals_notified',
  'board_notified',
  'closed'
);

create table if not exists public.breach_register (
  id                       uuid primary key default gen_random_uuid(),
  reference                text not null unique,

  detected_at              timestamptz not null,
  occurred_at              timestamptz,
  contained_at             timestamptz,

  severity                 public.breach_severity not null,
  status                   public.breach_status not null default 'detected',

  description              text not null,
  data_categories          text[] not null default '{}',
  affected_principals      integer,
  affected_identified      boolean not null default false,

  root_cause               text,
  mitigation               text,
  remedial_measures        text,

  -- Notification tracking. The Draft DPDP Rules require intimation to affected
  -- principals without delay, and a detailed report to the Board within 72
  -- hours of becoming aware. board_report_due_at is computed from detected_at.
  principals_notified_at   timestamptz,
  board_intimated_at       timestamptz,
  board_report_due_at      timestamptz generated always as (detected_at + interval '72 hours') stored,
  board_reported_at        timestamptz,
  board_reference          text,

  notification_decision    text,   -- justification where NOT notifying
  closed_at                timestamptz,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table public.breach_register is
  'DPDP s.8(6) incident register. board_report_due_at = detected_at + 72h per the Draft DPDP Rules.';
comment on column public.breach_register.notification_decision is
  'Where a breach was NOT notified, the reasoning. The decision must be defensible to the Board.';

create index if not exists breach_status_idx on public.breach_register (status, board_report_due_at);
alter table public.breach_register enable row level security;

drop trigger if exists breach_touch_updated_at on public.breach_register;
create trigger breach_touch_updated_at
  before update on public.breach_register
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
--  Records of processing activities
-- ─────────────────────────────────────────────────────────────────────────
-- Mirrors src/data/legalEntity.ts so the published policy, the consent UI and
-- the auditable record are all the same facts. Seeded below; keep in step.

create table if not exists public.processing_activities (
  id                 text primary key,
  purpose            text not null,
  data_categories    text[] not null default '{}',
  lawful_basis       text not null check (lawful_basis in ('consent','legitimate-use')),
  lawful_basis_note  text,
  retention          text,
  recipients         text[] not null default '{}',
  cross_border       boolean not null default false,
  reviewed_at        timestamptz,
  updated_at         timestamptz not null default now()
);

alter table public.processing_activities enable row level security;

drop trigger if exists pa_touch_updated_at on public.processing_activities;
create trigger pa_touch_updated_at
  before update on public.processing_activities
  for each row execute function public.touch_updated_at();

insert into public.processing_activities
  (id, purpose, data_categories, lawful_basis, lawful_basis_note, retention, recipients, cross_border)
values
  ('rfq', 'Responding to quotation requests and sales enquiries',
   array['Name','Company','Designation','Email','Phone','City/State','GSTIN (optional)','Requirement details'],
   'legitimate-use',
   'Voluntarily provided for the specified purpose of obtaining a quotation (s.7(a)).',
   '24 months from last contact, then deleted', array['Supabase','Email delivery provider'], true),

  ('newsletter', 'Sending trade updates, new SKU announcements and B2B offers',
   array['Email address'], 'consent',
   'Separate opt-in consent at the point of subscription. Withdrawable at any time.',
   'Until consent is withdrawn, plus 12 months of suppression records', array['Supabase','Email delivery provider'], true),

  ('analytics', 'Understanding how the site is used so we can improve it',
   array['Pages viewed','Approximate location','Device and browser type','Referring site','Pseudonymous identifier'],
   'consent',
   'Optional. Not collected unless analytics cookies are accepted.',
   '14 months', array['Google Analytics (Google LLC)'], true),

  ('whatsapp', 'Connecting buyers to the sales team over WhatsApp',
   array['Phone number','Message content','Click metadata'], 'legitimate-use',
   'Initiated by the Data Principal. Also governed by WhatsApp''s own terms.',
   '24 months', array['Supabase','WhatsApp (Meta Platforms)'], true),

  ('support', 'Answering questions asked through the on-site assistant',
   array['Message content','Session identifier'], 'legitimate-use',
   'Voluntarily provided in order to receive a response.',
   '12 months', array['Supabase','TODO: AI model provider'], true),

  ('security', 'Keeping the site secure and preventing abuse of forms',
   array['IP address','User agent','Request timestamps','Rate-limit counters'], 'legitimate-use',
   'Necessary for security and prevention of fraud and abuse (s.7).',
   '90 days', array['Supabase'], false)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
--  Operational views (service role only — RLS blocks client reads)
-- ─────────────────────────────────────────────────────────────────────────

-- Requests approaching or past their statutory response window.
create or replace view public.dpr_sla_watch as
select
  reference,
  request_type,
  status,
  created_at,
  due_at,
  case
    when responded_at is not null then 'responded'
    when due_at is null           then 'no_due_date'
    when now() > due_at           then 'overdue'
    when now() > due_at - interval '7 days' then 'due_soon'
    else 'on_track'
  end as sla_state
from public.data_principal_requests
where status not in ('completed','rejected','withdrawn');

-- Breaches whose 72-hour Board report is outstanding.
create or replace view public.breach_reporting_watch as
select
  reference,
  severity,
  status,
  detected_at,
  board_report_due_at,
  board_reported_at,
  case
    when board_reported_at is not null      then 'reported'
    when now() > board_report_due_at        then 'overdue'
    when now() > board_report_due_at - interval '24 hours' then 'due_soon'
    else 'on_track'
  end as report_state
from public.breach_register
where status <> 'closed';
