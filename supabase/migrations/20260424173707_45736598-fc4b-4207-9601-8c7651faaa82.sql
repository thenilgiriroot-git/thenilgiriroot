-- Edge request log for sensitive functions
CREATE TABLE IF NOT EXISTS public.edge_request_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  status_code integer NOT NULL,
  outcome text NOT NULL, -- 'ok' | 'unauthorized' | 'rate_limited' | 'invalid_input' | 'error'
  ip_hash text,
  user_agent text,
  latency_ms integer,
  reason text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edge_request_log_fn_time
  ON public.edge_request_log (function_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_request_log_outcome_time
  ON public.edge_request_log (outcome, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_request_log_ip_time
  ON public.edge_request_log (ip_hash, created_at DESC);

ALTER TABLE public.edge_request_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage edge request log"
  ON public.edge_request_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Security alerts (deduped by alert_key + window)
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,        -- 'rate_limit_flood' | 'auth_failure_spike' | 'new_scan_finding'
  alert_key text NOT NULL,         -- dedup key, e.g. function:auth_spike:<ip_hash>
  severity text NOT NULL DEFAULT 'warn',
  summary text NOT NULL,
  details jsonb,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_key_time
  ON public.security_alerts (alert_key, created_at DESC);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage security alerts"
  ON public.security_alerts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Snapshots of scan findings for diffing
CREATE TABLE IF NOT EXISTS public.security_scan_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_fingerprints text[] NOT NULL DEFAULT '{}',
  finding_count integer NOT NULL DEFAULT 0,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_scan_snapshots_time
  ON public.security_scan_snapshots (created_at DESC);

ALTER TABLE public.security_scan_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage scan snapshots"
  ON public.security_scan_snapshots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);