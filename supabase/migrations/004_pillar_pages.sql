-- Pillar-content-type + spoke-relaties.
-- article_type wordt TEXT zonder CHECK (zelfde patroon als archetype in 003)
-- zodat toekomstige types geen migratie vereisen. Validatie gebeurt in TypeScript
-- via isValidArticleType() in blog-archetypes.ts.
--
-- spoke_post_ids bevat de UUIDs van blog_posts die als spoke aan een pillar
-- gekoppeld zijn. Voor reguliere blogs is dit altijd een lege array. De
-- relatie is logisch (geen FK) zodat het verwijderen van een spoke geen
-- pillar-aanmaak blokkeert; de pillar-detailpagina filtert weggevallen
-- spokes weg op render-time via getPostsByIds().

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS article_type TEXT NOT NULL DEFAULT 'blog';

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS spoke_post_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_blog_posts_article_type
  ON public.blog_posts(article_type)
  WHERE article_type <> 'blog';
