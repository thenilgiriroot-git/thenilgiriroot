
-- Fix blog_posts: drop permissive ALL policy for public, recreate for service_role
DROP POLICY IF EXISTS "Service role can manage posts" ON public.blog_posts;
CREATE POLICY "Service role can manage posts"
  ON public.blog_posts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Fix blog_categories: drop permissive INSERT policy for public, recreate for service_role
DROP POLICY IF EXISTS "Service role can insert categories" ON public.blog_categories;
CREATE POLICY "Service role can insert categories"
  ON public.blog_categories FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix blog_tags: drop permissive INSERT policy for public, recreate for service_role
DROP POLICY IF EXISTS "Service role can insert tags" ON public.blog_tags;
CREATE POLICY "Service role can insert tags"
  ON public.blog_tags FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix blog_post_tags: drop permissive ALL policy for public, recreate for service_role
DROP POLICY IF EXISTS "Service role can manage post tags" ON public.blog_post_tags;
CREATE POLICY "Service role can manage post tags"
  ON public.blog_post_tags FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Fix storage: drop permissive INSERT policy for public, recreate for service_role
DROP POLICY IF EXISTS "Service role can upload blog images" ON storage.objects;
CREATE POLICY "Service role can upload blog images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'blog-images');
