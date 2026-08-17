-- Drop broad listing SELECT on blog-images. Files remain accessible by direct
-- public URL via bucket.public = true; this only prevents enumeration.
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;

-- Tighten public-insert policies with basic length constraints to harden
-- against abuse / oversized payloads.
DROP POLICY IF EXISTS "Anyone can submit fallback contact" ON public.contact_fallback_submissions;
CREATE POLICY "Anyone can submit fallback contact"
ON public.contact_fallback_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 320
  AND length(phone) BETWEEN 4 AND 30
  AND (business_name IS NULL OR length(business_name) <= 200)
  AND (city IS NULL OR length(city) <= 100)
  AND (message IS NULL OR length(message) <= 2000)
);

DROP POLICY IF EXISTS "Anyone can insert click events" ON public.whatsapp_clicks;
CREATE POLICY "Anyone can insert click events"
ON public.whatsapp_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  cta_type IN ('distributor', 'restaurant')
  AND (page_source IS NULL OR length(page_source) <= 100)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (referrer IS NULL OR length(referrer) <= 500)
  AND (country IS NULL OR length(country) <= 80)
);

DROP POLICY IF EXISTS "Anyone can insert CTA clicks" ON public.cta_clicks;
CREATE POLICY "Anyone can insert CTA clicks"
ON public.cta_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(cta_label) BETWEEN 1 AND 100
  AND (cta_destination IS NULL OR length(cta_destination) <= 200)
  AND (page_source IS NULL OR length(page_source) <= 100)
  AND (section IS NULL OR length(section) <= 100)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (referrer IS NULL OR length(referrer) <= 500)
  AND (country IS NULL OR length(country) <= 80)
);