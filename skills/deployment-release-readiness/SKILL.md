---
name: deployment-release-readiness
description: Run a release-specific readiness check before shipping — env var inventory (public vs secret, set correctly per environment), preview/production separation, a pre-deploy checklist covering migrations and RLS on the actual target environment, a rollback plan that accounts for whether any migration is backward compatible, and a rollout decision (full vs staged). Use this whenever the user is about to deploy, asks "am I ready to ship this", "what's my rollback plan", "is this env var safe", or is deploying a migration without having checked whether the previous code version can still run against the new schema. This is stage 7 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it right before deploying, after all earlier stages, and distinct from `web-essentials-checklist` (which checks one-time baseline setup like favicons/SEO/error pages) and from `launch-growth-instrumentation` (stage 8, which is about tracking and growth, not deploy safety).
---

# Deployment & Release Readiness

Most deploy-time incidents aren't caused by code that's wrong in isolation — they're caused by an assumption that didn't hold across environments (a secret meant for the server shipped to the browser), a migration that broke the previous version of the code before the new code finished rolling out, or a rollback that turned out not to be safe because nobody checked in advance. This skill exists to make those checks explicit right before a deploy, not discovered during one.

## How to run this

1. **Inventory every environment variable the app needs, and classify each one.** Public (`NEXT_PUBLIC_*`, safe to ship to the browser bundle) vs secret (server-only, must never be prefixed `NEXT_PUBLIC_`, must never be referenced from a client component). This is the last checkpoint before go-live for the security principle `data-model-design` already established — confirm no secret value is hardcoded anywhere in code, migrations, or seed scripts; if one turns up here, it must be flagged to the user as a likely-compromised credential needing rotation, not quietly fixed.

2. **Confirm preview and production are actually separated**, not just configured to look separated. Ideally a separate Supabase project or branch for preview vs production so preview testing never touches production data and a bad preview migration can't reach production. At minimum, confirm every environment-specific variable is actually set per environment in the hosting platform's settings — not just present in a local `.env` file that happens to work on one machine.

3. **Run the pre-deploy checklist, which is release-specific, not the baseline setup `web-essentials-checklist` already covers.** Confirm: migrations are applied in the correct order against the actual target environment (not just locally), RLS policies have been verified against real production-shaped data (not assumed correct because they worked locally), the build passes with no type errors, and there's been a smoke-test pass of the feature's actual success criteria from `feature-scoping` — not just "it builds and the homepage loads."

4. **Decide whether this release's rollback plan is actually safe, before deploying — not after something breaks.** A pure code rollback (revert the deploy) is usually fast and low-risk on its own. But if this release includes a schema migration, check whether the previous code version can still run correctly against the new schema — if it can't, a code-only rollback will break the app, and the real rollback plan needs either a backward-compatible migration (the standard two-phase approach: add new things without removing or renaming what the old code still needs, clean up only in a later release once the old code is fully retired) or a documented, deliberate decision that rollback isn't available for this release and why that risk is acceptable.

5. **Decide the rollout shape: full release vs staged/flagged, based on risk, not by default.** A low-risk change can ship to everyone at once. A change touching a high-stakes flow (payments, auth, anything from `essential-feature-discovery`'s Tier 1) is a candidate for a percentage rollout or a feature flag — this stage makes that call; `launch-growth-instrumentation` is where the flag actually gets wired for tracking if one is used.

6. **Confirm monitoring is wired for the new code paths before go-live**, not added reactively after the first user complaint. At minimum, errors thrown in the new Server Actions/Route Handlers from `feature-logic-implementation` should be visible somewhere the team actually looks.

7. **Write the output using the template below.**

## Output template

Suggested filename: `specs/<feature-name>-release.md` (follow the project's existing convention if one exists).

```markdown
# <Feature name> — Release Readiness

## Env var inventory
| Variable | Public / Secret | Set in preview? | Set in production? |
|---|---|---|---|
| <NAME> | public / secret | yes/no | yes/no |

## Preview/production separation
- <confirmed separate Supabase project/branch, or note the gap>

## Pre-deploy checklist
- [ ] Migrations applied in order against target environment
- [ ] RLS policies verified against production-shaped data
- [ ] Build passes with no type errors
- [ ] Smoke test of feature-scoping's success criteria: <result>

## Rollback plan
- Code rollback: <safe / not safe, why>
- Migration backward compatibility: <yes — old code still runs against new schema / no — explain the risk accepted, or the two-phase plan>

## Rollout decision
- Full release / staged rollout / feature flag: <choice and reasoning>

## Monitoring
- <where errors from new code paths surface>

## Open questions / assumptions
- <...>
```

## Common ways this goes wrong

**A secret variable accidentally prefixed `NEXT_PUBLIC_`.** This ships it straight into the client bundle — anyone can read it from the browser. This is exactly the kind of mistake a deliberate inventory pass catches and a rushed deploy doesn't.

**Preview and production sharing one Supabase project.** Test data pollutes what looks like production, or a preview migration runs against real user data before anyone meant it to.

**A migration that isn't backward compatible, discovered only when a rollback is attempted.** If the old code can't run against the new schema, "just revert the deploy" doesn't actually work, and that's a bad time to learn it.

**Checking "it builds" and calling that a smoke test.** A successful build says nothing about whether the actual feature works end to end — the real check is against `feature-scoping`'s success criteria, not the compiler.

**No monitoring on new code paths, so failures are discovered by a user complaint** instead of an alert — by which point the impact is already happening, not just possible.
