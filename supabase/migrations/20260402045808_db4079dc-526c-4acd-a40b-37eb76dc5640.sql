INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Service role can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images');