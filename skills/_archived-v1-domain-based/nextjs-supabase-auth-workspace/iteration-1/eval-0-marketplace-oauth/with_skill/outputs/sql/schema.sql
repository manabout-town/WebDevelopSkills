-- sql/schema.sql
-- Core tables for a generic used-goods marketplace with two roles:
-- seller and buyer. Kept generic on purpose — no business-specific
-- vertical terminology baked in here.

-- One row per authenticated user, role assigned during onboarding.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text check (role in ('seller', 'buyer')),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Seller-specific profile fields. Kept in its own table instead of widening
-- `users` so seller-only fields (store name, future payout/verification
-- fields) don't pollute buyer rows.
create table if not exists public.seller_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  store_name text not null,
  is_verified boolean not null default false,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- Buyer-specific profile fields. Deliberately minimal for now — per the
-- skill's guidance, don't pre-build structure a role doesn't need yet.
create table if not exists public.buyer_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- A single product listing, owned by exactly one seller.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  price integer not null check (price >= 0),
  status text not null default 'open'
    check (status in ('open', 'reserved', 'sold', 'removed')),
  created_at timestamptz not null default now()
);

-- An order/purchase made by a buyer against a listing.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.users (id) on delete cascade,
  seller_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
