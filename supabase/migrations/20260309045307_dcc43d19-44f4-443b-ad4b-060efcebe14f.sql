-- Blog categories
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog tags
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog post tags junction table
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Public read policies (blog is public content)
CREATE POLICY "Anyone can read blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read blog tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can read published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Anyone can read blog post tags" ON public.blog_post_tags FOR SELECT USING (true);

-- Service role write policies (for AI content generation via edge functions)
CREATE POLICY "Service role can insert categories" ON public.blog_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert tags" ON public.blog_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can manage posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage post tags" ON public.blog_post_tags FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_post_tags_post ON public.blog_post_tags(post_id);
CREATE INDEX idx_blog_post_tags_tag ON public.blog_post_tags(tag_id);