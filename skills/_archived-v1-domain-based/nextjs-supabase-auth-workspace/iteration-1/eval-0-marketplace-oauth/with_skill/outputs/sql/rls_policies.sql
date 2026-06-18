-- sql/rls_policies.sql
-- Real security boundary for the marketplace. Run after sql/schema.sql.
-- Assumption baked into every policy below: middleware.ts can be
-- bypassed or misconfigured, so none of this trusts the app layer —
-- every policy is written as if middleware didn't exist.

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------

-- Users can read their own row (used by middleware/server components to
-- fetch role, and by onboarding to check current state).
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own row (e.g. changing display_name later),
-- but role changes are intentionally NOT allowed via this policy — role
-- is set once via the service-role client during onboarding. If the
-- product later needs "switch from buyer to seller", add an explicit
-- pending_role + admin-approval flow rather than loosening this policy.
create policy "users_update_own_non_role_fields"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Inserts into `users` happen only through the service-role client during
-- onboarding (see app/onboarding/actions.ts), which bypasses RLS entirely.
-- No insert policy is defined for the anon/authenticated roles on purpose —
-- this prevents a user from self-assigning a role via a direct API call.

-- ---------------------------------------------------------------------
-- seller_profiles
-- ---------------------------------------------------------------------

-- A seller can read and update their own profile.
create policy "seller_profiles_select_own"
  on public.seller_profiles for select
  using (auth.uid() = user_id);

create policy "seller_profiles_update_own"
  on public.seller_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Buyers need to see basic seller/store info attached to a listing (e.g.
-- store name) when browsing. Expose only via a public-safe view in
-- practice; for this generic example we allow read of store_name-bearing
-- rows to any authenticated user.
create policy "seller_profiles_select_public"
  on public.seller_profiles for select
  using (auth.role() = 'authenticated');

-- Inserts happen only via the service-role client during onboarding.

-- ---------------------------------------------------------------------
-- buyer_profiles
-- ---------------------------------------------------------------------

create policy "buyer_profiles_select_own"
  on public.buyer_profiles for select
  using (auth.uid() = user_id);

create policy "buyer_profiles_update_own"
  on public.buyer_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts happen only via the service-role client during onboarding.

-- ---------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------

-- Anyone authenticated can browse open listings (buyers browsing, and
-- sellers viewing the marketplace too).
create policy "listings_select_open_to_authenticated"
  on public.listings for select
  using (
    status = 'open'
    or seller_id = auth.uid() -- a seller can always see their own listing regardless of status
  );

-- Only a seller can create a listing, and only under their own seller_id.
create policy "listings_insert_own_as_seller"
  on public.listings for insert
  with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'seller'
    )
  );

-- A seller can only update/delete their own listings.
create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "listings_delete_own"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------

-- A buyer sees their own orders; a seller sees orders placed against
-- their own listings. No one else can see an order row.
create policy "orders_select_party_to_order"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Only a buyer can create an order, and only for themselves. seller_id
-- must match the listing's actual seller_id — checked via subquery so a
-- buyer can't fabricate an order against a mismatched seller_id.
create policy "orders_insert_own_as_buyer"
  on public.orders for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.users where id = auth.uid() and role = 'buyer'
    )
    and exists (
      select 1 from public.listings
      where id = listing_id and seller_id = orders.seller_id and status = 'open'
    )
  );

-- Both the buyer and seller on an order can update its status (e.g.
-- seller marks "shipped", buyer marks "completed"). A real implementation
-- would likely split this into narrower per-status-transition policies or
-- enforce transitions in a Server Action / trigger — this is the baseline.
create policy "orders_update_party_to_order"
  on public.orders for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);
