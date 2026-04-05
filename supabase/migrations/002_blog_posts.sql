-- ===== BLOG POSTS TABLE =====
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  target_keywords TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX idx_blog_posts_published ON public.blog_posts (published_at DESC) WHERE status = 'published';

-- ===== BLOG IDEAS TABLE =====
CREATE TABLE public.blog_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected', 'written')),
  blog_post_id UUID REFERENCES public.blog_posts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== RLS =====
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on blog_posts"
  ON public.blog_posts FOR ALL USING (true);

CREATE POLICY "Service role full access on blog_ideas"
  ON public.blog_ideas FOR ALL USING (true);
