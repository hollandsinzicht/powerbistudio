-- Studio: meerdere gesprekken per project. Bestaande berichten worden
-- gebackfilled naar één chat "Eerdere chat" per project.
-- Uitvoeren in de Supabase SQL-editor (na 0001_studio.sql).

create table if not exists studio_chats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references studio_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nieuwe chat',
  created_at timestamptz not null default now()
);

alter table studio_chats enable row level security;

create policy "studio_chats_select_own" on studio_chats
  for select using (user_id = auth.uid());
create policy "studio_chats_insert_own" on studio_chats
  for insert with check (user_id = auth.uid());
create policy "studio_chats_update_own" on studio_chats
  for update using (user_id = auth.uid());
create policy "studio_chats_delete_own" on studio_chats
  for delete using (user_id = auth.uid());

create index if not exists studio_chats_project_idx on studio_chats (project_id, created_at desc);

alter table studio_messages
  add column if not exists chat_id uuid references studio_chats(id) on delete cascade;

create index if not exists studio_messages_chat_idx on studio_messages (chat_id, created_at);

-- Backfill: bestaande berichten per project in één chat onderbrengen
insert into studio_chats (project_id, user_id, title, created_at)
select project_id, user_id, 'Eerdere chat', min(created_at)
from studio_messages
where chat_id is null
group by project_id, user_id;

update studio_messages m
set chat_id = c.id
from studio_chats c
where m.chat_id is null and m.project_id = c.project_id;
