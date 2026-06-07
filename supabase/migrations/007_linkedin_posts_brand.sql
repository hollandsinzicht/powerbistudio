-- ===== LINKEDIN POSTS: BRAND-DIMENSIE =====
-- Voegt een brand-kolom toe zodat het postgeheugen per bedrijf gescheiden is
-- (Power BI Studio vs Performance by Design). Anti-herhaling en seeds gaan
-- daarna per brand. Bestaande rijen krijgen automatisch 'power-bi-studio'.
ALTER TABLE public.linkedin_posts
  ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'power-bi-studio';

-- De categorie-CHECK uit 006 kende alleen de Power BI Studio-categorieën.
-- Performance by Design introduceert eigen categorieën (persoonlijk-verhaal,
-- coaching-inzicht, data-reflectie, informatief). Validatie verhuist naar de
-- app-laag (brands.ts), dus de DB-CHECK op category wordt verwijderd.
ALTER TABLE public.linkedin_posts
  DROP CONSTRAINT IF EXISTS linkedin_posts_category_check;

-- Recente-posts-query filtert op (brand, created_at) — index daarop.
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_brand_created_at
  ON public.linkedin_posts (brand, created_at DESC);
