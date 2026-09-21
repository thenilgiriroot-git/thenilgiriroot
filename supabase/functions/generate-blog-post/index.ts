import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { anthropicCall, extractJsonObject } from "../_shared/anthropic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
};

// IP rate limiter: 3 attempts / minute, 60-min lockout.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60_000;
type RLState = { hits: number[]; lockedUntil: number };
const ipState = new Map<string, RLState>();

function rateLimitCheck(ip: string) {
  const now = Date.now();
  const s = ipState.get(ip) ?? { hits: [], lockedUntil: 0 };
  if (s.lockedUntil > now) {
    return { limited: true, retryAfterSec: Math.ceil((s.lockedUntil - now) / 1000) };
  }
  s.hits = s.hits.filter((t) => now - t < WINDOW_MS);
  if (s.hits.length >= MAX_ATTEMPTS) {
    s.lockedUntil = now + LOCKOUT_MS;
    ipState.set(ip, s);
    return { limited: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
  }
  ipState.set(ip, s);
  return { limited: false, retryAfterSec: 0 };
}

function recordFailedAttempt(ip: string) {
  const s = ipState.get(ip) ?? { hits: [], lockedUntil: 0 };
  s.hits.push(Date.now());
  ipState.set(ip, s);
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (Deno.env.get("SUPABASE_URL") ?? ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function logRequest(
  supabase: any,
  outcome: string,
  status: number,
  ipHash: string,
  userAgent: string | null,
  startedAt: number,
  reason?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabase.from("edge_request_log").insert({
      function_name: "generate-blog-post",
      status_code: status,
      outcome,
      ip_hash: ipHash,
      user_agent: userAgent?.slice(0, 500) ?? null,
      latency_ms: Date.now() - startedAt,
      reason: reason ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.error("logRequest failed", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const ipHash = await hashIp(ip);
  const userAgent = req.headers.get("user-agent");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  const rl = rateLimitCheck(ip);
  let limited = rl.limited;
  let retryAfter = rl.retryAfterSec;
  if (!limited && supabase) {
    try {
      const { data: locked } = await supabase.rpc("is_ip_locked_out", {
        _function_name: "generate-blog-post",
        _ip_hash: ipHash,
        _window_seconds: 60,
        _max_attempts: 3,
        _lockout_seconds: 3600,
      });
      if (locked === true) {
        limited = true;
        retryAfter = 3600;
      }
    } catch (e) {
      console.error("is_ip_locked_out failed", e);
    }
  }
  if (limited) {
    if (supabase) await logRequest(supabase, "rate_limited", 429, ipHash, userAgent, startedAt);
    return new Response(JSON.stringify({ error: "Too many attempts. Try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) },
    });
  }

  try {
    const adminPassword = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");
    const providedPassword =
      req.headers.get("x-admin-password") || req.headers.get("X-Admin-Password");
    if (!adminPassword || providedPassword !== adminPassword) {
      recordFailedAttempt(ip);
      if (supabase) await logRequest(supabase, "unauthorized", 401, ipHash, userAgent, startedAt, "bad_or_missing_admin_password");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, category, tags } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }


    if (!supabase) {
      throw new Error("Supabase configuration missing");
    }


    const systemPrompt = `You are an SEO content expert for The Nilgiri Root, a premium frozen french fries manufacturer in India that transforms locally grown vegetables into value added farm products.

Write engaging, informative blog posts that:
- Are optimized for SEO with natural keyword integration
- Focus on frozen food, blast freezing, recipes, food safety, and the premium quality of Nilgiri potatoes
- Include practical tips and valuable information for restaurant owners, chefs, distributors and food enthusiasts
- Maintain a professional yet approachable tone
- Are well-structured with clear headings and paragraphs
- Never use the terms "IQF" or "flash freezing" — always use "blast freezing" / "blast freezer"
- Reference cut sizes only as 9mm, 10mm, or 11mm`;

    const userPrompt = `Generate a comprehensive blog post about: "${topic}"

The post should be:
- 800-1200 words
- SEO optimized for Indian frozen food market
- Include practical insights and tips
- Written in markdown format with proper headings (## for H2, ### for H3)
- Include a compelling introduction and conclusion

Respond with a JSON object containing:
{
  "title": "SEO-optimized title (50-60 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "Compelling meta description (150-160 characters)",
  "content": "Full markdown content",
  "meta_title": "SEO title for meta tag",
  "meta_description": "SEO meta description",
  "meta_keywords": "comma,separated,keywords",
  "reading_time_minutes": estimated reading time as number
}`;

    const response = await anthropicCall(ANTHROPIC_API_KEY, {
      model: Deno.env.get("BLOG_MODEL") ?? "claude-sonnet-5",
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 4096,
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.content?.find((b: { type: string }) => b.type === "text")?.text;

    if (!content) {
      throw new Error("No content generated");
    }

    let blogData;
    try {
      blogData = extractJsonObject(content) as any;
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Get or create category
    let categoryId = null;
    if (category) {
      const { data: existingCategory } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", category.toLowerCase().replace(/\s+/g, "-"))
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: catError } = await supabase
          .from("blog_categories")
          .insert({
            name: category,
            slug: category.toLowerCase().replace(/\s+/g, "-"),
            description: `Articles about ${category}`,
          })
          .select("id")
          .single();
        
        if (catError) {
          console.error("Category creation error:", catError);
        } else {
          categoryId = newCategory?.id;
        }
      }
    }

    // Insert the blog post
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        category_id: categoryId,
        meta_title: blogData.meta_title,
        meta_description: blogData.meta_description,
        meta_keywords: blogData.meta_keywords,
        reading_time_minutes: blogData.reading_time_minutes || 5,
        status: "draft",
        published_at: null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Post insertion error:", postError);
      throw new Error(`Failed to save blog post: ${postError.message}`);
    }

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");
        
        // Get or create tag
        let { data: tag } = await supabase
          .from("blog_tags")
          .select("id")
          .eq("slug", tagSlug)
          .single();

        if (!tag) {
          const { data: newTag } = await supabase
            .from("blog_tags")
            .insert({ name: tagName, slug: tagSlug })
            .select("id")
            .single();
          tag = newTag;
        }

        if (tag) {
          await supabase
            .from("blog_post_tags")
            .insert({ post_id: post.id, tag_id: tag.id });
        }
      }
    }

    await logRequest(supabase, "ok", 200, ipHash, userAgent, startedAt, "post_created", {
      post_id: post?.id,
      slug: post?.slug,
    });
    return new Response(JSON.stringify({ success: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating blog post:", error);
    if (supabase) {
      await logRequest(
        supabase,
        "error",
        500,
        ipHash,
        userAgent,
        startedAt,
        (error instanceof Error ? error.message : "Unknown error").slice(0, 200)
      );
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
