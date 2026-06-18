-- ============================================================================
-- 0003_listings_example.sql
-- Example domain table showing how role-based RLS plugs into the rest of
-- the marketplace schema. Not strictly part of "auth", but included so the
-- seller/buyer dashboards have something real to query.
-- ============================================================================

create type public.listing_status as enum ('draft', 'active', 'sold', 'archived');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_listings_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

create index listings_seller_id_idx on public.listings (seller_id);
create index listings_status_idx on public.listings (status);

alter table public.listings enable row level security;

-- Everyone (incl. anonymous, for a public browse page) can see active
-- listings.
create policy "Active listings are publicly viewable"
  on public.listings
  for select
  to anon, authenticated
  using (status = 'active');

-- Sellers can always see their own listings regardless of status.
create policy "Sellers can view their own listings"
  on public.listings
  for select
  to authenticated
  using (seller_id = auth.uid());

-- Only users whose profile.role = 'seller' may create listings, and only
-- under their own seller_id.
create policy "Sellers can create their own listings"
  on public.listings
  for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'seller'
    )
  );

create policy "Sellers can update their own listings"
  on public.listings
  for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Sellers can delete their own listings"
  on public.listings
  for delete
  to authenticated
  using (seller_id = auth.uid());
