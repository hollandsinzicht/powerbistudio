-- ===== CAMPAIGNS TABLE =====
-- Orkestratiegeheugen voor de "Campagne-flow" in /admin: één run knoopt de
-- bestaande losse stappen (idee → blog → LinkedIn per doelgroep → nurture-
-- voorstel) aan elkaar in de modus "genereer-alles-dan-review". Per stap
-- bewaren we de output + goedkeurstatus in één jsonb-kolom, zodat JW per stap
-- kan bijwerken/opnieuw genereren/goedkeuren.
--
-- HARDE GRENS (= het verhaal): deze flow raakt uitsluitend marketing-content
-- aan. Geen klant-HR-data, geen studio_*-modellen, geen lead-PII. Versturen
-- van nurture-mails blijft in de bestaande cron met eigen opt-in-logica.
CREATE TABLE IF NOT EXISTS public.campaigns (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  brand        TEXT NOT NULL DEFAULT 'power-bi-studio',
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'approved', 'scheduled')),
  seed         TEXT,                          -- seed-keywords of gekozen topic
  -- Per-stap output + goedkeurstatus. Vorm:
  -- { idea: {...}, blog: {...}, linkedin: [{ audience, ... }], nurture: {...} }
  -- waarbij elke stap { output, approved, edited, error } bevat.
  stages       JSONB NOT NULL DEFAULT '{}'::jsonb,
  blog_post_id UUID                           -- koppeling naar blog_posts (draft)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns (created_at DESC);

-- ===== RLS =====
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on campaigns"
  ON public.campaigns FOR ALL USING (true);
