import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  reading_time_minutes: number;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  category_id: string | null;
  blog_categories: { name: string; slug: string } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  reading_time_minutes: number;
  published_at: string;
}

interface TagRow {
  name: string;
  slug: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [tags, setTags] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug]);

  async function fetchPost(postSlug: string) {
    setLoading(true);
    const { data: postData } = await supabase
      .from("blog_posts")
      .select("*, blog_categories(name, slug)")
      .eq("slug", postSlug)
      .eq("status", "published")
      .single();

    if (postData) {
      setPost(postData as unknown as Post);

      // Fetch tags for this post
      const { data: postTags } = await supabase
        .from("blog_post_tags")
        .select("blog_tags(name, slug)")
        .eq("post_id", postData.id);
      
      setTags(
        (postTags ?? [])
          .flatMap((pt) => {
            // The join returns blog_tags as either an object or a one-element
            // array depending on the relationship cardinality Supabase infers.
            const t = (pt as { blog_tags: TagRow | TagRow[] | null }).blog_tags;
            if (!t) return [];
            return Array.isArray(t) ? t : [t];
          }),
      );

      // Fetch related posts (same category, excluding current)
      const { data: related } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, reading_time_minutes, published_at")
        .eq("status", "published")
        .neq("id", postData.id)
        .order("published_at", { ascending: false })
        .limit(3);

      setRelatedPosts((related as RelatedPost[] | null) ?? []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${85 - i * 5}%` }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        {/* noIndex: an unknown slug still returns HTTP 200 from the SPA, so
            without this every dead or mistyped article URL is an indexable
            soft 404. */}
        <SEOHead
          title="Article not found | The Nilgiri Root"
          description="This article doesn't exist or has been removed. Browse the rest of the blog."
          noIndex
        />
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Article not found</h1>
          <p className="text-muted-foreground font-body mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="text-accent font-body hover:underline inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || undefined}
        ogType="article"
        ogImage={post.featured_image || undefined}
      />

      <article className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/blog"
            className="text-muted-foreground font-body text-sm hover:text-accent transition-colors inline-flex items-center gap-2 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          {post.blog_categories && (
            <Link to={`/blog?category=${post.blog_categories.slug}`}>
              <Badge className="bg-accent/10 text-accent border-accent/20 font-body mb-4">
                {post.blog_categories.name}
              </Badge>
            </Link>
          )}

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground font-body">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.reading_time_minutes} min read
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl overflow-hidden mb-12"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="prose dark:prose-invert prose-lg max-w-none font-body
            prose-headings:font-display prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-li:text-muted-foreground
            prose-blockquote:border-accent prose-blockquote:text-muted-foreground
          "
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border/30">
            {tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="secondary"
                className="bg-muted text-muted-foreground font-body text-xs"
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 mt-20">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-10">
            Related <span className="text-accent italic">Articles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                to={`/blog/${rp.slug}`}
                className="group block bg-card rounded-2xl overflow-hidden border border-border/30 hover:border-accent/30 transition-all duration-500"
              >
                <div className="h-40 bg-muted overflow-hidden">
                  {rp.featured_image ? (
                    <img
                      src={rp.featured_image}
                      alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-3xl">🍟</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg group-hover:text-accent transition-colors line-clamp-2 mb-2">
                    {rp.title}
                  </h3>
                  <p className="text-muted-foreground font-body text-sm line-clamp-2">
                    {rp.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-body">
                    <span>{rp.reading_time_minutes} min read</span>
                    <ArrowRight className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image || "https://www.thenilgiriroot.com/logo.png",
            datePublished: post.published_at,
            author: {
              "@type": "Organization",
              name: "The Nilgiri Root",
            },
            publisher: {
              "@type": "Organization",
              name: "The Nilgiri Root",
              logo: {
                "@type": "ImageObject",
                url: "https://www.thenilgiriroot.com/logo.png",
              },
            },
          }),
        }}
      />
    </main>
  );
}
