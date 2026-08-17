CREATE TABLE public.whatsapp_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_type TEXT NOT NULL CHECK (cta_type IN ('distributor','restaurant')),
  variants TEXT[] NOT NULL DEFAULT '{}',
  page_source TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert click events"
ON public.whatsapp_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Service role can read clicks"
ON public.whatsapp_clicks
FOR SELECT
TO service_role
USING (true);

CREATE INDEX idx_whatsapp_clicks_created_at ON public.whatsapp_clicks(created_at DESC);
CREATE INDEX idx_whatsapp_clicks_cta_type ON public.whatsapp_clicks(cta_type);

CREATE TABLE public.contact_fallback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_type TEXT CHECK (cta_type IN ('distributor','restaurant')),
  variants TEXT[] NOT NULL DEFAULT '{}',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT,
  city TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_fallback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit fallback contact"
ON public.contact_fallback_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Service role can read fallback submissions"
ON public.contact_fallback_submissions
FOR SELECT
TO service_role
USING (true);

CREATE INDEX idx_contact_fallback_created_at ON public.contact_fallback_submissions(created_at DESC);