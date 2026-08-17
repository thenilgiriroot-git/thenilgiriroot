CREATE TABLE IF NOT EXISTS public.lead_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text NOT NULL UNIQUE,
  idempotency_key text NOT NULL UNIQUE,
  payload_hash text NOT NULL,
  source_type text NOT NULL,
  source_detail text,
  sheet_name text,
  sheet_status text NOT NULL DEFAULT 'pending',
  sheet_error text,
  email_status text NOT NULL DEFAULT 'pending',
  email_error text,
  lead_score integer NOT NULL DEFAULT 0,
  recipient_email text,
  contact_name text,
  contact_phone text,
  payload jsonb NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_submissions_payload_hash ON public.lead_submissions(payload_hash);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON public.lead_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_source ON public.lead_submissions(source_type);

ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages lead submissions"
  ON public.lead_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_lead_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lead_submissions_set_updated_at ON public.lead_submissions;
CREATE TRIGGER lead_submissions_set_updated_at
  BEFORE UPDATE ON public.lead_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_lead_submissions_updated_at();