-- ===== STUDIO DELIVERABLES =====
-- Delivery-versnelling (laag 2): naast de bestaande analyse genereert Studio op
-- verzoek drie opleveringen per model — modeldocumentatie, een AVG-checklist-
-- tegen-het-model, en RLS-testcases. Ze worden lui gegenereerd (kost een LLM-
-- call) en per project bewaard, zodat ze niet bij elke pageload opnieuw draaien.
--
-- HARDE GRENS: dit draait op het al-ingelezen modelschema (schema_markdown),
-- niet op live klantdata. Human-in-the-loop: JW genereert en beoordeelt.
ALTER TABLE public.studio_projects
  ADD COLUMN IF NOT EXISTS doc_markdown TEXT,        -- modeldocumentatie (markdown)
  ADD COLUMN IF NOT EXISTS avg_report   JSONB,       -- AVG-check: per punt een verdict
  ADD COLUMN IF NOT EXISTS rls_markdown TEXT;        -- RLS-testcases (markdown)

-- studio_usage.kind kreeg een nieuwe soort: 'deliverable'. De inline-check uit
-- 0001_studio.sql heet automatisch studio_usage_kind_check.
ALTER TABLE public.studio_usage DROP CONSTRAINT IF EXISTS studio_usage_kind_check;
ALTER TABLE public.studio_usage
  ADD CONSTRAINT studio_usage_kind_check
  CHECK (kind IN ('analysis', 'chat', 'deliverable'));
