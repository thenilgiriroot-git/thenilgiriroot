import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import NewsletterForm from "@/components/NewsletterForm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  reading_time_minutes: number;
  published_at: string;
  category_id: string | null;
  blog_categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [postsRes, catsRes, tagsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, reading_time_minutes, published_at, category_id, blog_categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase.from("blog_categories").select("*"),
      supabase.from("blog_tags").select("*"),
    ]);
    setPosts((postsRes.data as BlogPost[] | null) ?? []);
    setCategories(catsRes.data || []);
    setTags(tagsRes.data || []);
    setLoading(false);
  }

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory) {
      result = result.filter((p) => p.blog_categories?.slug === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, selectedCategory, searchQuery]);

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEOHead
        title="Blog — Recipes & Frozen Food Insights"
        description="Recipes, blast freezing insights and ideas for using frozen french fries — for restaurants, cafes, retailers and home kitchens."
        keywords="frozen food blog, french fries recipes, blast freezing, fries cooking guide, Nilgiri potatoes"
      />

      {/* Hero */}
      <section className="container mx-auto px-4 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-accent font-body tracking-[0.25em] uppercase text-sm">
            Knowledge Hub
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            Our <span className="text-accent italic">Blog</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Industry insights, cooking tips, and stories from the Nilgiri hills.
          </p>
        </motion.div>
      </section>

      {/* Search + Filters */}
      <section className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50 text-foreground font-body rounded-full"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className={`cursor-pointer transition-all font-body ${
                selectedCategory === null
                  ? "bg-accent text-accent-foreground"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                className={`cursor-pointer transition-all font-body ${
                  selectedCategory === cat.slug
                    ? "bg-accent text-accent-foreground"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)
                }
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={`cursor-pointer text-xs font-body transition-all ${
                    selectedTag === tag.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag.slug ? null : tag.slug)
                  }
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-lg">
              {searchQuery ? "No articles found matching your search." : "No articles published yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border/30 hover:border-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5"
                >
                  <div className="h-48 bg-muted overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl">🍟</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {post.blog_categories && (
                      <span className="text-accent text-xs font-body tracking-wider uppercase">
                        {post.blog_categories.name}
                      </span>
                    )}
                    <h2 className="font-display text-xl mt-2 mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.reading_time_minutes} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-16 sm:mt-20">
          <NewsletterForm
            variant="card"
            sourceDetail="blog_index"
            heading="Never miss a post"
            description="Fresh insights on B2B frozen food sourcing, supply chain and trade — straight to your inbox."
          />
        </div>
      </section>
    </main>
  );
}
