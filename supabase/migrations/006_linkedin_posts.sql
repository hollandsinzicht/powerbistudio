-- ===== LINKEDIN POSTS TABLE =====
-- Postgeheugen voor de per-post adaptieve vraaggesprek-generator.
-- Seeds (de 6 bestaande posts) krijgen source='seed' + een unieke seed_key,
-- zodat ensureSeedPosts() idempotent kan upserten zonder dubbele rijen.
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now(),
  post_text    TEXT NOT NULL,
  hashtags     TEXT[] DEFAULT '{}',
  funnel_stage TEXT CHECK (funnel_stage IN ('tofu', 'mofu', 'bofu')),
  category     TEXT CHECK (category IN ('3-hr-problemen', 'klantcase', 'mythe-provocatie', 'persoonlijk-visie')),
  style        TEXT,
  topic        TEXT,
  interview    JSONB DEFAULT '[]'::jsonb,   -- [{ vraag, antwoord }]
  source       TEXT DEFAULT 'generated' CHECK (source IN ('seed', 'generated')),
  seed_key     TEXT UNIQUE                  -- alleen voor seeds; voorkomt dubbel-seeden
);

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON public.linkedin_posts (created_at DESC);

-- ===== RLS =====
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on linkedin_posts"
  ON public.linkedin_posts FOR ALL USING (true);
