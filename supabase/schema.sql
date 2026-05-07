-- Run this in your Supabase SQL editor

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  sport text not null default 'gym',
  created_at timestamptz not null default now()
);

-- Check-ins table
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  sleep_hours numeric(3,1) not null,
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  soreness jsonb not null default '{}',
  rest_days_since_last integer not null default 0,
  readiness_score integer not null check (readiness_score between 0 and 100),
  ai_reasoning text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Check-ins policies
create policy "Public check-ins are viewable by everyone"
  on public.check_ins for select using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own check-ins"
  on public.check_ins for insert with check (auth.uid() = user_id);

create policy "Users can update their own check-ins"
  on public.check_ins for update using (auth.uid() = user_id);

create policy "Users can delete their own check-ins"
  on public.check_ins for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
