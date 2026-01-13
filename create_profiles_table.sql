-- ChatGPT's bulletproof "never happens again" profiles table
-- Fixes 500 Internal Server Error from password_hash NOT NULL constraint

-- 1) Create profiles table tied to Supabase auth.users (no password_hash!)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'user',
  tenant_id uuid null,
  organization_id uuid null,
  requires_password_reset boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS
alter table public.profiles enable row level security;

-- 3) Policies (correct UUID types - no more text = uuid errors)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

-- 4) Performance index
create index if not exists idx_profiles_id on public.profiles(id);

-- 5) Migration: Copy existing users data to profiles (if any)
insert into public.profiles (id, email, role, tenant_id, organization_id, requires_password_reset, created_at, updated_at)
select id, email, role, tenant_id, organization_id, requires_password_reset, created_at, updated_at
from public.users
where id is not null
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role,
  tenant_id = excluded.tenant_id,
  organization_id = excluded.organization_id,
  requires_password_reset = excluded.requires_password_reset,
  updated_at = excluded.updated_at;

-- SUCCESS: profiles table created without password_hash constraint
-- Bootstrap can now safely upsert without 500 errors!