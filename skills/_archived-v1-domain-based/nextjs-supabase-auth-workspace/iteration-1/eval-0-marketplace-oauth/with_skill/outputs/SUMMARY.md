# Summary

## What this is

Auth + role-based dashboards for a generic used-goods marketplace (Next.js +
Supabase), built per the `nextjs-supabase-auth` skill's checklist: four
separate Supabase clients, middleware-based route protection, RLS as the
real security boundary, an OAuth callback route for Google login, and a
signup → onboarding → role-routing flow.

## Role / terminology choices

- **Two roles: `seller` and `buyer`.** The user described their product as
  a "중고 거래 플랫폼 (판매자/구매자)" — a peer-to-peer used-goods
  marketplace — so I used the generic English terms `seller` and `buyer`
  directly as the `role` enum values, table prefixes (`seller_profiles`,
  `buyer_profiles`), and route groups (`app/(seller)/`, `app/(buyer)/`).
  These are domain-neutral marketplace terms, not tied to any specific
  vertical.
- **Role assigned post-signup, in `/onboarding`**, not at signup time. This
  follows the skill's Step 5 guidance: keep the signup form to just
  email/password (or Google), then let the user pick seller vs. buyer and
  fill role-specific fields afterward. This also makes Google OAuth
  first-time users land somewhere sensible (`/onboarding`) since OAuth
  signup can't show a role picker mid-redirect.
- **Separate `seller_profiles` / `buyer_profiles` tables** rather than one
  wide `users` table with nullable role-specific columns, per the skill's
  pattern — keeps each role's schema free to diverge later (e.g. seller
  payout/verification fields) without nullable clutter on buyer rows.
- **`is_verified` / `verification_status` on `seller_profiles`** included
  as a placeholder per skill Step 6 (sellers in a marketplace typically
  need more identity/listing trust checks than buyers), but left
  unenforced beyond the column — no document upload flow was built, since
  that's explicitly out of scope for this skill.
- **No role-switching/upgrade flow** was built (e.g. "buyer applies to
  become a seller too") since the user's prompt didn't describe one; the
  skill explicitly says not to pre-build that complexity speculatively.
  The RLS comments note where a `pending_role` + admin-approval pattern
  would slot in if that need shows up later.

## Confirmation: no specific real company's business logic was copied

This was built purely from the user's own description ("중고 거래
플랫폼, 판매자/구매자 두 역할, Google 로그인") and the generic guidance in
`SKILL.md`. No vertical-specific terminology was introduced — in
particular, no 화물/배송 중개 플랫폼 특정 용어 (e.g. 화주/기사, 배차,
운송) appears anywhere in these files. All naming is generic
marketplace vocabulary: `seller` / `buyer`, `listings`, `orders`,
`seller_profiles` / `buyer_profiles`. The schema, RLS policies, and
component naming are reusable for any two-sided seller/buyer marketplace,
not specific to any company's actual product.

## Files produced

See the file tree under this `outputs/` directory: four Supabase clients
under `lib/supabase/`, root `middleware.ts`, login/signup pages + Server
Actions, the Google OAuth callback route, the onboarding role-routing
Server Action, role-scoped dashboard pages under route groups, and
`sql/schema.sql` + `sql/rls_policies.sql`.

## Known gaps / things a real implementation should still add

- Password reset flow (skill Step 4 mentions this needs the same
  code-exchange pattern but with "recovery" session handling) was not
  built — the user's prompt didn't ask for it explicitly.
- No rate limiting / CAPTCHA on signup.
- `seller_profiles_select_public` RLS policy exposes all authenticated
  users' seller profile rows for marketplace browsing; in production this
  should likely go through a narrower view that excludes any sensitive
  columns added later (e.g. payout details), rather than the whole table.
