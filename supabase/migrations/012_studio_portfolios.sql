-- Power BI Studio — cross-model portfolio-analyse
-- Groepeert meerdere studio_projects tot één "portfolio" (rapporten-landschap)
-- en bewaart de cross-model-analyse op de portfolio-rij.
-- Uitvoeren in de Supabase SQL-editor (of via supabase db push).
-- RLS: gebruikers zien uitsluitend hun eigen portfolios; server-routes gebruiken
-- de service-role key en gaan daar bewust langs (zelfde patroon als 0001_studio.sql).

-- ── Portfolios ─────────────────────────────────────────────────────────────
create table if not exists studio_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  analysis_findings jsonb,         -- cross-model-checks (CrossModelFinding[])
  analysis_narrative text,         -- AI-samenvatting op estate-niveau (markdown)
  map_json jsonb,                  -- PortfolioMap: entiteit → modellen/sleutels
  stats jsonb,                     -- {models, entities, sharedEntities, findings}
  analyzed_at timestamptz,         -- null zolang de analyse nog niet is gedraaid
  created_at timestamptz not null default now()
);

alter table studio_portfolios enable row level security;

create policy "studio_portfolios_select_own" on studio_portfolios
  for select using (user_id = auth.uid());
create policy "studio_portfolios_insert_own" on studio_portfolios
  for insert with check (user_id = auth.uid());
create policy "studio_portfolios_update_own" on studio_portfolios
  for update using (user_id = auth.uid());
create policy "studio_portfolios_delete_own" on studio_portfolios
  for delete using (user_id = auth.uid());

create index if not exists studio_portfolios_user_idx on studio_portfolios (user_id, created_at desc);

-- ── Koppeling project → portfolio ──────────────────────────────────────────
-- Een project hoort bij max één portfolio; bij verwijderen van de portfolio
-- blijven de projecten bestaan (set null), zodat losse analyses intact blijven.
alter table studio_projects
  add column if not exists portfolio_id uuid references studio_portfolios(id) on delete set null;

create index if not exists studio_projects_portfolio_idx on studio_projects (portfolio_id);

-- ── Usage: portfolio-analyse als kostenpost ────────────────────────────────
-- studio_usage.kind kende alleen 'analysis' en 'chat'; voeg 'portfolio' toe.
alter table studio_usage drop constraint if exists studio_usage_kind_check;
alter table studio_usage
  add constraint studio_usage_kind_check check (kind in ('analysis','chat','portfolio'));
