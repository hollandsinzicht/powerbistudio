-- ===== AUDIENCES TABLE =====
-- Doelgroepen voor de Campagne-flow, beheerbaar vanuit de admin-tab (i.p.v.
-- hardcoded in audiences.ts). Per doelgroep: een stabiele `key` (gebruikt in
-- campaigns.stages om een LinkedIn-variant aan een doelgroep te koppelen), een
-- label, beschrijving, de invalshoek-`guide` die als extra sturing in de
-- LinkedIn-prompt landt, en een standaard-`style`.
--
-- De 3 startdoelgroepen worden idempotent geseed door ensureSeedAudiences()
-- (zie audience-store.ts) op basis van DEFAULT_AUDIENCES — niet hier in SQL,
-- zodat tekst en code op één plek staan.
CREATE TABLE IF NOT EXISTS public.audiences (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  key          TEXT NOT NULL UNIQUE,          -- stabiele slug, referentie vanuit campaigns
  label        TEXT NOT NULL,
  beschrijving TEXT NOT NULL DEFAULT '',
  guide        TEXT NOT NULL,
  style        TEXT NOT NULL DEFAULT 'educatief'
                 CHECK (style IN ('educatief', 'scherp', 'provocatief', 'storytelling')),
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_audiences_sort ON public.audiences (sort_order, created_at);

-- ===== RLS =====
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on audiences"
  ON public.audiences FOR ALL USING (true);
