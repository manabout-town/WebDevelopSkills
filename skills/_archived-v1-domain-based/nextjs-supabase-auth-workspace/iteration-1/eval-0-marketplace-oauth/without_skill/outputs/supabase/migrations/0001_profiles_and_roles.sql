-- ============================================================================
-- 0001_profiles_and_roles.sql
-- Profiles table + role enum + auto-provisioning trigger for the
-- buyer/seller marketplace.
-- ============================================================================

-- 1. Role enum -----------------------------------------------------------
create type public.user_role as enum ('buyer', 'seller');

-- 2. Profiles table --------------------------------------------------------
-- One row per auth.users row. role starts NULL so the app can force a
-- "choose your role" onboarding step right after first sign-in (including
-- the very first Google OAuth sign-in, which has no role information).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile + role data for each authenticated user (buyer or seller).';

-- 3. updated_at trigger ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 4. Auto-create a profile row whenever a new auth user is created -------
-- This covers email/password signup AND Google OAuth signup (Supabase
-- inserts into auth.users the same way for both). full_name/avatar_url are
-- pulled from the OAuth provider's metadata when present.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5. Enable RLS ------------------------------------------------------------
alter table public.profiles enable row level security;
