
-- Rate limiting table for edge functions
CREATE TABLE public.rate_limits (
  ip_hash TEXT NOT NULL,
  function_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip_hash, function_name, window_start)
);

-- Enable RLS (deny all direct client access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies = no client access. Only service role (edge functions) can read/write.

-- Auto-cleanup: delete rows older than 2 hours
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '2 hours';
$$;
