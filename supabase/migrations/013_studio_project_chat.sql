-- Studio: chat op projectniveau (studio_portfolios) naast chat per datamodel
-- (studio_projects). Een chat/bericht hangt aan precies één van beide.
-- Uitvoeren na 0002_studio_chats.sql en 012_studio_portfolios.sql.

-- ── Chats ──────────────────────────────────────────────────────────────────
alter table studio_chats alter column project_id drop not null;
alter table studio_chats
  add column if not exists portfolio_id uuid references studio_portfolios(id) on delete cascade;
-- Precies één scope: datamodel (project_id) óf project (portfolio_id).
alter table studio_chats drop constraint if exists studio_chats_scope_check;
alter table studio_chats
  add constraint studio_chats_scope_check check (num_nonnulls(project_id, portfolio_id) = 1);
create index if not exists studio_chats_portfolio_idx on studio_chats (portfolio_id, created_at desc);

-- ── Berichten ───────────────────────────────────────────────────────────────
alter table studio_messages alter column project_id drop not null;
alter table studio_messages
  add column if not exists portfolio_id uuid references studio_portfolios(id) on delete cascade;
-- Welke modellen bij een projectchat-vraag zijn meegenomen (voor weergave).
alter table studio_messages
  add column if not exists tagged_model_ids uuid[];
alter table studio_messages drop constraint if exists studio_messages_scope_check;
alter table studio_messages
  add constraint studio_messages_scope_check check (num_nonnulls(project_id, portfolio_id) = 1);
create index if not exists studio_messages_portfolio_idx on studio_messages (portfolio_id, created_at);
