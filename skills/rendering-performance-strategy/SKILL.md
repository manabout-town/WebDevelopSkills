---
name: rendering-performance-strategy
description: Decide, per route, whether content is static (SSG), incrementally revalidated (ISR), rendered fresh per request (SSR), or fetched client-side (CSR) — plus where Suspense/streaming boundaries go, what's safe to cache versus must bypass cache, and how parallel data fetching avoids waterfalls. Use this whenever the user is about to add data fetching to a page, asks "should this be static or dynamic", "why is this page slow", "how do I stream this in", or is caching personalized/owner-only data without checking whether that's actually safe. This is stage 6 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after page-implementation has created the routes, and before deployment-release-readiness, which assumes a rendering/caching strategy already exists rather than discovering it at deploy time.
---

# Rendering & Performance Strategy

Defaulting every route to fully dynamic "to be safe" throws away most of what Next.js's rendering model offers; defaulting everything to static risks serving stale or, worse, another user's personalized data. Both come from skipping a deliberate decision per route. This skill exists to make that decision explicit, tied to two things that are already known by this point: the access model from `data-model-design` (is this data shared/public or owner-only/personalized?) and the revalidation triggers `feature-logic-implementation` already flagged per mutation.

## How to run this

1. **Pick a rendering mode per route based on data freshness needs, not a framework default.** Static (SSG) for content that rarely changes (marketing pages, docs). ISR with an explicit revalidate interval for content where some staleness (seconds to minutes) is acceptable and the access model says the data is shared/public, not personalized. Dynamic/SSR for anything that must be correct per request — personalized dashboards, anything gated by the access model to a specific user. Client-side fetching (CSR) only for data that's genuinely driven by in-page interaction and doesn't need to be part of the initial HTML (live search-as-you-type, a poll that updates after mount). If a route's mode was chosen because it's the default rather than because of its actual data, that's worth revisiting.

2. **Treat the access model as the hard boundary for what's cacheable.** Shared or public data (per `data-model-design`'s access model) is the only safe default candidate for ISR or the fetch cache. Owner-only or personalized data must either bypass cache entirely or be cached with the cache key scoped per user — caching personalized data without a per-user key is a real privacy bug, not just a performance footnote, because it can serve one user's data to another.

3. **Decide Suspense/streaming boundaries around what's actually slow, not arbitrarily.** Split a page into the part that should render immediately (shell, nav, anything fast) and the part that can stream in once its data resolves (the slow query). Wrap only the slow part in `Suspense` with a fallback that matches the loading state `ux-flow-design`/`page-implementation` already decided — don't block the entire page on the slowest piece of data it needs.

4. **Avoid fetch waterfalls: fetch independent data in parallel.** If a page needs two or more pieces of data that don't depend on each other, kick them off together (`Promise.all`, parallel route segments, parallel fetches at the top of a Server Component) rather than `await`-ing one and then the next inside the same function. A waterfall is invisible in code review and very visible in a network trace — check for it explicitly rather than assuming sequential awaits are harmless.

5. **Tie cache invalidation to the revalidation triggers `feature-logic-implementation` already named.** Every mutation that stage flagged as needing `revalidatePath`/`revalidateTag` should actually call it, scoped to the right path/tag — broad enough to actually invalidate what changed, narrow enough not to blow away caching benefit for everything else on every write.

6. **Decide loading/error boundary granularity deliberately, not by over-fragmenting.** A `loading.tsx`/`error.tsx` per route is usually enough. Add a nested Suspense boundary only where a specific sub-section has independent, meaningfully different loading timing worth isolating — wrapping every individual component in its own boundary creates layout jank (content popping in piece by piece) without a real benefit.

7. **Write the output using the template below**, flagging any route where the rendering mode is a judgment call (e.g. "borderline between ISR and SSR because staleness tolerance wasn't explicitly stated") for the user to confirm.

## Output template

Suggested filename: `specs/<feature-name>-rendering.md` (follow the project's existing convention if one exists).

```markdown
# <Feature name> — Rendering & Performance

## Per-route rendering mode
| Route | Mode | Reasoning |
|---|---|---|
| <path> | Static / ISR (revalidate: Ns) / SSR / CSR | <tied to access model + freshness need> |

## Cache strategy
| Data | Cacheable? | Scope (if cached) |
|---|---|---|
| <data> | yes (shared/public) / no (owner-only/personalized) | <per-user key if applicable> |

## Streaming / Suspense boundaries
- <route>: shell renders immediately; <slow section> streams in via Suspense, fallback = <matches ux-flow-design loading state>

## Parallel fetch plan
- <route>: fetches <A> and <B> in parallel (no dependency between them)

## Revalidation wiring
- <mutation from feature-logic-implementation> → revalidates <path/tag>

## Open questions / assumptions
- <judgment calls on rendering mode or cache scope the user should confirm>
```

## Common ways this goes wrong

**Defaulting everything to dynamic "to be safe."** This is the most common overcorrection — it throws away caching, ISR, and static generation wholesale for routes that never needed per-request freshness, and the actual cost is real (slower TTFB, higher server load) for no actual benefit.

**Defaulting everything to static or ISR without checking the access model first.** This is the dangerous direction — caching owner-only or personalized data without a per-user cache key can leak one user's data to another. Always check the access model before letting anything other than genuinely shared/public data anywhere near a cache.

**Sequential awaits creating an invisible waterfall.** Each individual `await` looks fine in isolation; the cumulative latency only shows up in a network trace. Check explicitly for independent fetches that could run in parallel.

**Forgetting to wire `revalidatePath`/`revalidateTag` for a flagged mutation.** The mutation succeeds, the cache doesn't know, and the user sees stale data after their own action — usually invisible to whoever wrote the code (they already know to hard-refresh) and very visible to a real user.

**Over-fragmenting Suspense boundaries.** Wrapping every small component in its own boundary causes a page to visibly pop in piece by piece rather than rendering in a small number of coherent groups — a worse experience than one well-placed boundary around the genuinely slow part.
