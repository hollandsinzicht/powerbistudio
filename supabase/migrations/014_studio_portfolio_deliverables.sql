-- Opleveringen op projectniveau: één gebundeld document over álle modellen van
-- een project (studio_portfolios). Spiegelt de kolommen die 010 op
-- studio_projects zette. Uitvoeren na 012/013.

alter table studio_portfolios
  add column if not exists doc_markdown text,   -- projectdocumentatie (markdown)
  add column if not exists avg_report   jsonb,  -- AVG-check over het geheel
  add column if not exists rls_markdown text;   -- RLS-testcases project-breed
