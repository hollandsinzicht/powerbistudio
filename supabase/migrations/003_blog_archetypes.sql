-- Add archetype column to blog_ideas and blog_posts.
-- An archetype determines the structure/format of a generated blog post:
-- technical-deep-dive, decision-framework, anti-pattern-essay, comparison,
-- case-driven, tutorial, faq.
-- Stored as TEXT (no CHECK constraint) so new archetypes can be introduced
-- without a migration; validation happens in TypeScript.

ALTER TABLE public.blog_ideas
  ADD COLUMN IF NOT EXISTS archetype TEXT;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS archetype TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_archetype
  ON public.blog_posts(archetype)
  WHERE archetype IS NOT NULL;
