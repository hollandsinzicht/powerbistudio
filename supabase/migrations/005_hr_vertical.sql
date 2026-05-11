-- ===== HR VERTICAL TOEVOEGEN AAN LEAD-FLOW =====
-- HR-rebrand (2026): /avg-checklist-hr lead-magnet + bijbehorende
-- nurture-sequence vereisen dat 'hr' een geldige vertical is en dat
-- 'avg-checklist-hr' een geldige source is in zowel de leads-tabel
-- als de nurture_emails-tabel.
--
-- De CHECK-constraints uit 001_leads_and_nurture.sql worden uitgebreid
-- — zonder DROP/CREATE TABLE want bestaande data moet behouden blijven.

-- leads.vertical: 'hr' toevoegen
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_vertical_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_vertical_check
  CHECK (vertical IN ('beslissers', 'publieke-sector', 'isv', 'vakgenoot', 'hr'));

-- leads.source: 'avg-checklist-hr' toevoegen
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_source_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_source_check
  CHECK (source IN ('calculator', 'checklist', 'architectuurgids', 'dax-fouten', 'contact', 'avg-checklist-hr'));

-- nurture_emails.vertical: 'hr' toevoegen
ALTER TABLE public.nurture_emails
  DROP CONSTRAINT IF EXISTS nurture_emails_vertical_check;

ALTER TABLE public.nurture_emails
  ADD CONSTRAINT nurture_emails_vertical_check
  CHECK (vertical IN ('beslissers', 'publieke-sector', 'isv', 'vakgenoot', 'hr'));
