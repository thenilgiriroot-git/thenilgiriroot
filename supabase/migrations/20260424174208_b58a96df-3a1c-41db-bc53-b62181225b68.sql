-- Returns true if this ip_hash should be blocked from `function_name`
-- based on recent unauthorized attempts in edge_request_log.
CREATE OR REPLACE FUNCTION public.is_ip_locked_out(
  _function_name text,
  _ip_hash text,
  _window_seconds int DEFAULT 60,
  _max_attempts int DEFAULT 3,
  _lockout_seconds int DEFAULT 3600
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent AS (
    SELECT created_at
    FROM public.edge_request_log
    WHERE function_name = _function_name
      AND ip_hash = _ip_hash
      AND outcome = 'unauthorized'
      AND created_at >= now() - make_interval(secs => _lockout_seconds)
    ORDER BY created_at DESC
    LIMIT _max_attempts
  ),
  agg AS (
    SELECT count(*) AS cnt, max(created_at) AS latest
    FROM recent
  )
  SELECT COALESCE(
    (SELECT cnt >= _max_attempts AND latest >= now() - make_interval(secs => _lockout_seconds)
     FROM agg),
    false
  );
$$;

-- Allow the service role (used by edge functions) to call it.
REVOKE ALL ON FUNCTION public.is_ip_locked_out(text, text, int, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_ip_locked_out(text, text, int, int, int) TO service_role;