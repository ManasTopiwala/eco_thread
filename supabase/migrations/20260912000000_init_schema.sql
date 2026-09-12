-- ==============================================================================
-- Schema: EcoThread / EchoDec Supabase Database Architecture
-- Project: iflyiggpbnkivkxzdoca
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  industry_role text default 'factory_operator',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

-- Auto-sync profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company_name, industry_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'industry_role', 'factory_operator')
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    company_name = coalesce(nullif(excluded.company_name, ''), public.profiles.company_name),
    industry_role = coalesce(nullif(excluded.industry_role, ''), public.profiles.industry_role),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. INDUSTRY PROFILES TABLE
create table if not exists public.industry_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  industry_type text not null default 'Manufacturing',
  size text default 'Medium',
  location text not null default '',
  production_type text default '',
  production_capacity numeric not null default 0,
  production_unit text not null default 'units',
  employees integer not null default 0,
  operating_hours_day numeric not null default 8,
  operating_days_month numeric not null default 25,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists industry_profiles_user_id_idx on public.industry_profiles(user_id);

alter table public.industry_profiles enable row level security;

create policy "Users can view own industry profiles"
  on public.industry_profiles for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own industry profiles"
  on public.industry_profiles for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own industry profiles"
  on public.industry_profiles for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own industry profiles"
  on public.industry_profiles for delete
  using ((select auth.uid()) = user_id);


-- 3. PROCESS DATA TABLE
create table if not exists public.process_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  industry text default 'Manufacturing',
  energy jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  production jsonb not null default '[]'::jsonb,
  waste jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists process_data_user_id_idx on public.process_data(user_id);

alter table public.process_data enable row level security;

create policy "Users can view own process data"
  on public.process_data for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own process data"
  on public.process_data for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own process data"
  on public.process_data for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own process data"
  on public.process_data for delete
  using ((select auth.uid()) = user_id);


-- 4. EMISSION ASSESSMENTS TABLE
create table if not exists public.emission_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  process_data_id uuid references public.process_data(id) on delete set null,
  total_co2e_tonnes numeric not null default 0,
  co2e_per_unit numeric not null default 0,
  sources jsonb not null default '[]'::jsonb,
  detailed_sources jsonb not null default '[]'::jsonb,
  data_label text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists emission_assessments_user_id_idx on public.emission_assessments(user_id);
create index if not exists emission_assessments_process_data_id_idx on public.emission_assessments(process_data_id);

alter table public.emission_assessments enable row level security;

create policy "Users can view own emission assessments"
  on public.emission_assessments for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own emission assessments"
  on public.emission_assessments for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own emission assessments"
  on public.emission_assessments for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own emission assessments"
  on public.emission_assessments for delete
  using ((select auth.uid()) = user_id);


-- 5. RECOMMENDATIONS TABLE
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid references public.emission_assessments(id) on delete cascade,
  rec_id text,
  name text not null,
  description text default '',
  category text not null default 'General',
  icon text default 'Lightbulb',
  score numeric not null default 0,
  why text default '',
  estimated_co2_reduction_tonnes numeric not null default 0,
  estimated_co2_reduction_pct numeric not null default 0,
  cost_range_min_inr numeric not null default 0,
  cost_range_max_inr numeric not null default 0,
  annual_saving_inr numeric not null default 0,
  payback_years numeric not null default 0,
  feasibility_score numeric not null default 0,
  circularity_score numeric not null default 0,
  status text not null default 'suggested',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists recommendations_user_id_idx on public.recommendations(user_id);
create index if not exists recommendations_assessment_id_idx on public.recommendations(assessment_id);

alter table public.recommendations enable row level security;

create policy "Users can view own recommendations"
  on public.recommendations for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own recommendations"
  on public.recommendations for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own recommendations"
  on public.recommendations for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own recommendations"
  on public.recommendations for delete
  using ((select auth.uid()) = user_id);


-- 6. EMISSION FACTORS REFERENCE TABLE
create table if not exists public.emission_factors (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  factor numeric not null,
  unit text not null,
  region text not null default 'India',
  source text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.emission_factors enable row level security;

create policy "Allow read access to emission factors for everyone"
  on public.emission_factors for select
  using (true);
