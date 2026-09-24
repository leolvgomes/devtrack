create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  progress integer not null default 0 check (progress between 0 and 100),
  hours integer not null default 0 check (hours >= 0),
  color text not null default '#0f766e',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  provider text,
  status text not null default 'Em andamento',
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'Em construcao',
  stack text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  area text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.github_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  profile_url text not null,
  repositories integer not null default 0 check (repositories >= 0),
  pull_requests integer not null default 0 check (pull_requests >= 0),
  issues_closed integer not null default 0 check (issues_closed >= 0),
  commits_this_month integer not null default 0 check (commits_this_month >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  weekly_commits jsonb not null default '[]'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.technologies enable row level security;
alter table public.courses enable row level security;
alter table public.projects enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.github_snapshots enable row level security;

drop policy if exists "Users can read own technologies" on public.technologies;
drop policy if exists "Users can insert own technologies" on public.technologies;
drop policy if exists "Users can update own technologies" on public.technologies;
drop policy if exists "Users can delete own technologies" on public.technologies;
drop policy if exists "Users can read own courses" on public.courses;
drop policy if exists "Users can insert own courses" on public.courses;
drop policy if exists "Users can update own courses" on public.courses;
drop policy if exists "Users can delete own courses" on public.courses;
drop policy if exists "Users can read own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;
drop policy if exists "Users can read own weekly goals" on public.weekly_goals;
drop policy if exists "Users can insert own weekly goals" on public.weekly_goals;
drop policy if exists "Users can update own weekly goals" on public.weekly_goals;
drop policy if exists "Users can delete own weekly goals" on public.weekly_goals;
drop policy if exists "Users can read own GitHub snapshots" on public.github_snapshots;
drop policy if exists "Users can insert own GitHub snapshots" on public.github_snapshots;
drop policy if exists "Users can update own GitHub snapshots" on public.github_snapshots;
drop policy if exists "Users can delete own GitHub snapshots" on public.github_snapshots;

create policy "Users can read own technologies"
  on public.technologies for select
  using (auth.uid() = user_id);

create policy "Users can insert own technologies"
  on public.technologies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own technologies"
  on public.technologies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own technologies"
  on public.technologies for delete
  using (auth.uid() = user_id);

create policy "Users can read own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own courses"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create policy "Users can read own weekly goals"
  on public.weekly_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly goals"
  on public.weekly_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly goals"
  on public.weekly_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own weekly goals"
  on public.weekly_goals for delete
  using (auth.uid() = user_id);

create policy "Users can read own GitHub snapshots"
  on public.github_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own GitHub snapshots"
  on public.github_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own GitHub snapshots"
  on public.github_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own GitHub snapshots"
  on public.github_snapshots for delete
  using (auth.uid() = user_id);
