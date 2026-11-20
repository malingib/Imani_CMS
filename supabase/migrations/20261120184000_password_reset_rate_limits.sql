-- Hashed, service-role-only buckets protect the public password-reset endpoint.
CREATE TABLE IF NOT EXISTS public.password_reset_rate_limits (
  key_hash text PRIMARY KEY CHECK (length(key_hash) = 64),
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.password_reset_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.password_reset_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.password_reset_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_password_reset_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF p_key_hash IS NULL OR length(p_key_hash) <> 64 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  DELETE FROM public.password_reset_rate_limits
  WHERE updated_at < pg_catalog.now() - interval '1 day';

  INSERT INTO public.password_reset_rate_limits (key_hash, window_started_at, request_count, updated_at)
  VALUES (p_key_hash, pg_catalog.now(), 1, pg_catalog.now())
  ON CONFLICT (key_hash) DO UPDATE
    SET window_started_at = CASE
          WHEN public.password_reset_rate_limits.window_started_at <= pg_catalog.now() - make_interval(secs => p_window_seconds)
            THEN pg_catalog.now()
          ELSE public.password_reset_rate_limits.window_started_at
        END,
        request_count = CASE
          WHEN public.password_reset_rate_limits.window_started_at <= pg_catalog.now() - make_interval(secs => p_window_seconds)
            THEN 1
          ELSE public.password_reset_rate_limits.request_count + 1
        END,
        updated_at = pg_catalog.now()
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_limit;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_password_reset_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_password_reset_rate_limit(text, integer, integer) TO service_role;
