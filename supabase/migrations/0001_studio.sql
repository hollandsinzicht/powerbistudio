-- Power BI Studio — model-analyzer ("/studio")
-- Uitvoeren in de Supabase SQL-editor (of via supabase db push).
-- RLS is de harde garantie dat gebruikers alleen hun eigen projecten zien;
-- server-routes gebruiken de service-role key en gaan daar bewust langs.

-- ── Projecten ────────────────────────────────────────────────────────────
create table if not exists studio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  source_filename text not null,
  source_format text not null check (source_format in ('pbit','bim','tmdl','zip')),
  file_path text,                  -- pad in bucket pbi-models; null na "verwijder bronbestand"
  schema_json jsonb not null,      -- genormaliseerd model (tabellen/kolommen/measures/relaties)
  schema_markdown text not null,   -- byte-stabiele LLM-context (prompt caching)
  stats jsonb not null,            -- {tables, columns, measures, relationships}
  analysis_findings jsonb,         -- deterministische checks
  analysis_narrative text,         -- AI-samenvatting (markdown)
  created_at timestamptz not null default now()
);

alter table studio_projects enable row level security;

create policy "studio_projects_select_own" on studio_projects
  for select using (user_id = auth.uid());
create policy "studio_projects_insert_own" on studio_projects
  for insert with check (user_id = auth.uid());
create policy "studio_projects_update_own" on studio_projects
  for update using (user_id = auth.uid());
create policy "studio_projects_delete_own" on studio_projects
  for delete using (user_id = auth.uid());

create index if not exists studio_projects_user_idx on studio_projects (user_id, created_at desc);

-- ── Chatberichten ────────────────────────────────────────────────────────
create table if not exists studio_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references studio_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);

alter table studio_messages enable row level security;

create policy "studio_messages_select_own" on studio_messages
  for select using (user_id = auth.uid());
create policy "studio_messages_insert_own" on studio_messages
  for insert with check (user_id = auth.uid());
create policy "studio_messages_delete_own" on studio_messages
  for delete using (user_id = auth.uid());

create index if not exists studio_messages_project_idx on studio_messages (project_id, created_at);
create index if not exists studio_messages_user_month_idx on studio_messages (user_id, role, created_at);

-- ── Gebruik (event-sourced; basis voor latere billing) ───────────────────
create table if not exists studio_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('analysis','chat')),
  project_id uuid,                 -- bewust geen FK: usage blijft na project-delete
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);

alter table studio_usage enable row level security;

create policy "studio_usage_select_own" on studio_usage
  for select using (user_id = auth.uid());

create index if not exists studio_usage_user_idx on studio_usage (user_id, kind, created_at);

-- ── Private storage-bucket voor modelbestanden ───────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('pbi-models', 'pbi-models', false, 104857600) -- 100 MB
on conflict (id) do nothing;

-- Pad-conventie: {user_id}/{project_id}/{bestandsnaam}
--
-- Bewust GEEN storage-policies voor clients: zonder policy weigert RLS elke
-- directe client-toegang tot de bucket. Uploads lopen uitsluitend via door de
-- server uitgegeven signed upload-URLs (na validatie van limiet/extensie/
-- grootte) en downloads uitsluitend server-side met de service-role key.
