-- ============================================================================
-- 0002_profiles_rls_policies.sql
-- RLS policies for public.profiles.
--
-- Design:
--  - Anyone authenticated can read any profile's *public* fields (needed so
--    buyers can see a seller's display name/avatar on listings, etc.).
--    If you want to restrict this further, create a narrower public view
--    instead of relaxing this policy.
--  - A user may only insert/update their own row.
--  - role can only be set ONCE via the onboarding flow (server action uses
--    the authenticated user's own id, so "update own row" is sufficient);
--    we still add a check constraint-style guard via a BEFORE UPDATE trigger
--    so a user can't repeatedly change their role to dodge access rules.
--  - No delete policy: profile rows are cascade-deleted when the auth.users
--    row is deleted (see migration 0001), end users never delete directly.
-- ============================================================================

-- Read: any authenticated user can view any profile (public marketplace
-- profile info). Swap to `using (auth.uid() = id)` if profiles should be
-- private instead.
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Insert: a user may only create their own profile row. In practice this
-- is handled by the handle_new_user() trigger (security definer), so this
-- policy mainly guards against a client trying to insert directly.
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Update: a user may only update their own profile row.
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Guard: once role is set, it cannot be changed by a normal client update.
-- This stops a malicious client from flipping role back and forth to probe
-- both seller and buyer dashboards. Role changes (if ever needed) should go
-- through a service-role admin action instead.
create or replace function public.prevent_role_change_after_set()
returns trigger
language plpgsql
as $$
begin
  if old.role is not null and new.role is distinct from old.role then
    raise exception 'role cannot be changed once set';
  end if;
  return new;
end;
$$;

create trigger lock_role_after_set
  before update on public.profiles
  for each row
  execute function public.prevent_role_change_after_set();
