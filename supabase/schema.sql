-- MineMind schema (run in Supabase SQL editor)

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  city text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  difficulty text not null,
  result text not null,
  time_seconds int not null,
  moves jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_challenges (
  date date primary key,
  seed text not null,
  difficulty text not null default 'medium'
);

alter table public.daily_challenges enable row level security;

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  city text,
  time_seconds int not null,
  difficulty text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.game_sessions enable row level security;
alter table public.leaderboard enable row level security;

create policy "read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "read own sessions"
  on public.game_sessions for select
  using (auth.uid() = user_id);

create policy "insert own sessions"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

create policy "read leaderboard"
  on public.leaderboard for select
  using (true);

create policy "insert own scores"
  on public.leaderboard for insert
  with check (
    (user_id is null)
    or (auth.uid() is not null and auth.uid() = user_id)
  );

create policy "read daily challenges"
  on public.daily_challenges for select
  using (true);

-- Realtime (enable in Supabase dashboard for `leaderboard` if desired)
