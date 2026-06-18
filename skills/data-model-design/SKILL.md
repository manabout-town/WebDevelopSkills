---
name: data-model-design
description: Turn the data named by ux-flow-design ("what each screen needs") or feature-scoping ("new data implied") into actual tables, relationships, an access model (who can read/write each row), Supabase RLS policies, and an ordered migration plan — before any application code reads or writes a single row. Use this whenever the user is about to add a table, asks "what should the schema look like", "how should I model X", "what RLS policy do I need for Y", or is reaching for `apply_migration`/writing a migration file without having decided the access model first. This is stage 3 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after ux-flow-design and before feature-logic-implementation or page-implementation. If a table is about to get created and nobody has said out loud who's allowed to read or write a row in it, that's the sign to pull the conversation back here first.
---

# Data Model Design

The most common source of a Supabase data bug isn't a missing column — it's a table that got its columns designed first and its access rules bolted on afterward, or never written explicitly at all and left to `service_role` to paper over. This skill exists to reverse that order: decide who can read and write a row *before* deciding what the row contains, because the access model usually changes the schema (a "shared" resource needs a join table or a status column that "owner-only" never would).

The output is a document `feature-logic-implementation` and `page-implementation` can build against, and a migration plan the user (or `apply_migration`) can execute step by step rather than as one big schema dump.

## How to run this

1. **Start from the entities already named, don't invent new ones.** Pull the entity names and rough fields from `ux-flow-design`'s "Data needed" sections and/or `feature-scoping`'s "New data implied" — this stage turns those names into real tables, it doesn't go looking for new data the earlier stages didn't flag. If something genuinely new comes up here, that's worth flagging back rather than silently expanding scope.

2. **Decide the access model before the columns.** For each entity, answer: who can read a row, and who can write one? The common patterns are owner-only (one user owns the row, only they and admins touch it), shared-by-relationship (two or more specific actors need access — e.g. both sides of a booking — neither is "the owner" alone), public-read/owner-write (anyone can read, only the creator or an admin writes), and admin-only (nobody but a privileged role touches it directly). Naming the pattern up front is what makes the RLS policy in step 5 almost write itself; skipping this is what makes RLS feel hard.

3. **Map relationships and decide foreign key direction.** For each pair of related entities, decide whether it's 1:1, 1:N, or N:N. For N:N, use a join table — never two nullable foreign keys on one of the entities pretending to be a relationship. For 1:N, the foreign key lives on the "many" side. Write this as a short list, not a full ERD tool diagram, unless the project already has one.

4. **Design columns only after 2 and 3 are settled**, and keep them traceable to a real need: a column should exist because some screen displays it, some flow writes it, or some access rule (like a `status` column that gates visibility) requires it. Resist adding columns "because we might want it later" — that's schema speculation, and it's exactly as wasteful as feature speculation.

5. **Write the RLS policy for each table in plain language first, then as SQL.** State it as a sentence per operation ("select: a row is visible to its owner and to any admin" / "insert: any authenticated user can insert a row they own" / "update: only the owner, and only while status is 'draft'"), then translate to `USING`/`WITH CHECK` clauses. Never reach for `service_role` as a way to skip writing a policy — `service_role` bypasses RLS entirely and should be reserved for genuinely backend-only operations (cron jobs, admin tooling, webhooks) that have no per-user access boundary to begin with, not as a shortcut when a policy seems annoying to write. If a table truly has no row-level distinctions (e.g. a public reference table everyone can read and nobody but admins writes), say that explicitly rather than leaving RLS off by omission.

6. **Plan indexes only for traced query patterns, not speculatively.** Look back at `ux-flow-design`'s screens — a list screen that filters or sorts by a column is a real reason to index it; "might query by this someday" is not. Foreign key columns generally want an index since they're joined on; flag those by default.

7. **Write the migration plan as ordered, named, reversible steps**, not one script that creates everything at once. Each migration should be small enough to review and roll back independently (e.g. "create `bookings` table" as one migration, "add RLS policies to `bookings`" as the next, rather than both inline in a giant initial migration once the project is past its very first setup). Never put an actual secret value (a `service_role` key, an API key) inside a migration file, seed script, or comment — those reference environment variables or Supabase's own secret management, never literal values; if a literal key turns up anywhere during this work, flag it to the user immediately as a likely-compromised credential needing rotation, don't just quietly remove it.

8. **Write the output using the template below**, and flag any access-model decision that was a judgment call the user should confirm — these are the decisions most expensive to get wrong after data exists in production.

## Output template

Suggested filename: `specs/<feature-or-app-name>-data-model.md` (follow the project's existing convention if one exists).

```markdown
# <Feature/app name> — Data Model

## Entities & relationships
| Entity | Relationship | Related entity |
|---|---|---|
| <name> | 1:N / N:N (join table: <name>) / 1:1 | <name> |

## Access model
### <entity>
- Pattern: owner-only / shared-by-relationship / public-read·owner-write / admin-only
- Read: <who, in plain language>
- Write: <who, in plain language, including any status/condition gates>

(repeat per entity)

## Columns
### <entity>
- <column>: <purpose — which screen/flow needs it, or which rule requires it>
...

## RLS policies
### <entity>
- select: <plain language> → ```sql <USING clause sketch>```
- insert: <plain language> → ```sql <WITH CHECK clause sketch>```
- update: <plain language> → ```sql <USING/WITH CHECK clause sketch>```
- delete: <plain language> → ```sql <USING clause sketch>```

## Indexes
- <table.column>: <which screen's query pattern this serves>

## Migration plan
1. <migration name> — <what it does, reversible how>
2. <migration name> — <...>
...

## Open questions / assumptions
- <access-model judgment calls, anything the user should confirm before feature-logic-implementation starts>
```

## Common ways this goes wrong

**Designing columns before the access model.** If RLS feels hard to write after the table exists, it's usually because ownership/sharing was never decided explicitly — the columns got designed as if the data model were access-neutral, and then access got force-fit on top. Decide who reads/writes first; the schema often needs to change to fit the answer (a status column, a join table for shared access).

**Reaching for `service_role` to avoid writing a policy.** `service_role` bypasses RLS completely — using it because a policy is annoying to write means the table effectively has no row-level protection from any client that holds (or leaks) that key. Reserve it for backend-only operations with no per-user boundary; write the policy for everything else.

**Modeling N:N as two nullable foreign keys.** This works until a row legitimately needs to relate to more than one of the "other" entity, at which point the schema can't represent it without a painful migration. Use a join table from the start if the relationship could ever be many-to-many.

**One big migration instead of ordered, named, reversible steps.** A single migration that creates five tables, adds all their policies, and seeds data is hard to review and impossible to partially roll back. Small, named, ordered migrations are easier to reason about and easier to revert if one step turns out wrong.

**Speculative columns or indexes.** "We might need this later" is schema debt before the schema even ships — both unused columns and unused indexes cost real maintenance and query-planning overhead for a need that may never arrive. Trace every column to a screen or rule, every index to a query pattern.

**Leaving literal secrets in migrations or seed scripts.** A `service_role` key or third-party API key typed directly into a migration file, even temporarily, is a leak the moment that file is committed or shared — and if one is found during this work, it must be flagged to the user as possibly already compromised, not silently deleted.
