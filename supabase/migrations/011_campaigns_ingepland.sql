-- ===== CAMPAIGNS: persoonlijke "ingepland"-markering =====
-- Een handmatig vinkje voor JW zelf: heeft hij de posts van deze campagne
-- daadwerkelijk ingepland/geplaatst? Los van de geautomatiseerde blog-`status`
-- ('scheduled') — dit is puur eigen administratie in het Campagne-overzicht.
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS ingepland BOOLEAN NOT NULL DEFAULT false;
