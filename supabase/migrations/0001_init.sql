-- CheatLens — auth profiles + order tracking
-- Run in Supabase: SQL Editor, or `supabase db push` with the CLI.

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per authenticated user (mirrors auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- orders: one row per checkout attempt (pending → paid)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  email             text,
  plan_id           text not null,
  plan_name         text,
  amount_cents      integer not null,
  status            text not null default 'pending'
                    check (status in ('pending', 'paid', 'failed')),
  stripe_session_id text unique,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

alter table public.orders enable row level security;

-- Users can read their own orders. Writes happen via the service-role key
-- (checkout route + Stripe webhook), which bypasses RLS — so no write policy.
drop policy if exists "orders_self_read" on public.orders;
create policy "orders_self_read" on public.orders
  for select using (auth.uid() = user_id);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);
