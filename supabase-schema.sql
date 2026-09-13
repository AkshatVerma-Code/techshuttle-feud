-- Supabase schema for Tech Shuttle Feud
create extension if not exists pgcrypto;

create table if not exists public.questions (
  id text primary key,
  question text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  answer text not null,
  popularity integer not null default 0,
  position integer not null
);

create index if not exists answers_question_id_idx on public.answers(question_id);

alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- College-event demo policies. For production, add authentication and restrict writes.
drop policy if exists "public read questions" on public.questions;
create policy "public read questions" on public.questions for select using (true);

drop policy if exists "public write questions" on public.questions;
create policy "public write questions" on public.questions for all using (true) with check (true);

drop policy if exists "public read answers" on public.answers;
create policy "public read answers" on public.answers for select using (true);

drop policy if exists "public write answers" on public.answers;
create policy "public write answers" on public.answers for all using (true) with check (true);

-- Realtime publication for future DB-change subscriptions; controller/display currently use Broadcast.
alter publication supabase_realtime add table public.questions;
alter publication supabase_realtime add table public.answers;
