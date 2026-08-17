CREATE TABLE public.cta_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_label TEXT NOT NULL,
  cta_destination TEXT,
  page_source TEXT,
  section TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert CTA clicks"
ON public.cta_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Service role can read CTA clicks"
ON public.cta_clicks
FOR SELECT
TO service_role
USING (true);

CREATE INDEX idx_cta_clicks_created_at ON public.cta_clicks(created_at DESC);
CREATE INDEX idx_cta_clicks_section ON public.cta_clicks(section);