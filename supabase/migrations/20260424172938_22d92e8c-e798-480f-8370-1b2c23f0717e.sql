-- Fix function search_path for existing public functions (security hardening)
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;

-- Restrict listing on the public blog-images bucket. Files are still readable
-- via direct public URL (bucket.public = true), but clients can no longer
-- enumerate the bucket contents via storage.objects SELECT.
DO $$
BEGIN
  -- Drop any overly broad SELECT policies on storage.objects for blog-images
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read access for blog images'
  ) THEN
    DROP POLICY "Public read access for blog images" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can read blog images'
  ) THEN
    DROP POLICY "Anyone can read blog images" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Blog images are publicly accessible'
  ) THEN
    DROP POLICY "Blog images are publicly accessible" ON storage.objects;
  END IF;
END $$;

-- Note: with bucket.public = true, files remain accessible by direct URL via
-- the storage public endpoint without needing a SELECT policy on
-- storage.objects, so removing broad SELECT is safe and prevents listing.