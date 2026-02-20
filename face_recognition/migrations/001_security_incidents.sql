-- Security Agent: incidents table for unauthorized entry attempts
-- Used by both rule-based and LLM (Gemini) agents. Run in Supabase SQL Editor if the table does not exist.

CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  gate_id TEXT NOT NULL,
  image_path TEXT DEFAULT '',
  confidence_score DOUBLE PRECISION,
  severity TEXT NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: RLS (enable if you use RLS; service role bypasses RLS)
-- ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role full access" ON public.security_incidents FOR ALL USING (true);

COMMENT ON TABLE public.security_incidents IS 'Security agent (rules or Gemini LLM): log of unauthorized entry attempts and severity';
