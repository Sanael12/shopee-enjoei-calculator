create table if not exists public.body_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists body_assessments_user_date_idx
  on public.body_assessments (user_id, date);

alter table public.body_assessments enable row level security;

create policy "Users read own assessments" on public.body_assessments
  for select using (auth.uid() = user_id);
create policy "Users insert own assessments" on public.body_assessments
  for insert with check (auth.uid() = user_id);
create policy "Users update own assessments" on public.body_assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own assessments" on public.body_assessments
  for delete using (auth.uid() = user_id);
