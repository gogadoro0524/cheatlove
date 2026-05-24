-- searches: one row per "Run search" the user triggers in the start flow.
-- Captures only the typed search criteria — NEVER the uploaded photos.
create table if not exists public.searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  gender      text,
  target_name text,
  target_age  integer,
  target_city text,
  photo_count integer not null default 0,
  paid        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.searches enable row level security;

-- Users can read their own searches. Writes happen via the service-role key
-- (record-search route), which bypasses RLS — so no write policy.
drop policy if exists "searches_self_read" on public.searches;
create policy "searches_self_read" on public.searches
  for select using (auth.uid() = user_id);

create index if not exists searches_user_id_idx on public.searches(user_id);
create index if not exists searches_created_idx on public.searches(created_at desc);
