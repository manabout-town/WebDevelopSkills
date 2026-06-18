---
name: page-implementation
description: Turn ux-flow-design's screen list and feature-logic-implementation's actions into actual routes and components — route groups organized by access level (not by feature/domain), a deliberate server/client component split, colocated route-specific components, the four states (loading/empty/error/not-permitted) implemented per Next.js convention, and forms wired to the consistent result shape from feature-logic-implementation. Use this whenever the user is about to create routes/pages/components for a feature, asks "how should I structure these routes", "should this be a client component", "where should this component live", or is writing pages without a decided route-group/access structure. This is stage 5 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after ux-flow-design and feature-logic-implementation, and before rendering-performance-strategy, which decides the caching/streaming strategy for the routes this stage creates.
---

# Page Implementation

This is where every earlier decision either gets realized correctly or quietly drops on the floor: the four states `ux-flow-design` specified per screen, the result shape `feature-logic-implementation` defined, the access model `data-model-design` settled. This skill's job is to make sure code-writing time is spent applying those decisions, not re-deciding them ad hoc per page — and to settle the two structural decisions that are specific to this stage: how routes are grouped, and where the server/client boundary sits.

## How to run this

1. **Group routes by access level, not by feature or domain.** Use route groups like `(public)`, `(authenticated)`, `(admin)` — not `(marketing)`, `(dashboard)`, `(settings)`. Access-level grouping means middleware and layout-level auth checks live in one predictable place per tier, and a new feature that needs "logged-in access" just lands in the existing `(authenticated)` group instead of needing its own auth wiring. Grouping by domain instead is the most common way page structure quietly diverges from the access model `data-model-design` already decided.

2. **Map every screen from `ux-flow-design` to a route**, deciding static vs dynamic segments based on what the screen displays (an entity ID becomes a dynamic segment; a fixed screen doesn't). If a screen from the UX flow has no route yet, or a route exists with no corresponding screen in the flow, reconcile that before writing components — it usually means either the flow missed something or a stray page got added without a decided purpose.

3. **Default every component to a Server Component; add `'use client'` only where genuinely needed**, and push that boundary as far down the tree as it'll go. A page doesn't need to be a client component just because one button inside it has an `onClick` — extract that button (or the smallest wrapping piece that needs interactivity) into its own client component instead of marking the whole tree. This keeps more of the page server-rendered, which is both faster and simpler to reason about.

4. **Colocate route-specific components with their route** (e.g. `app/feature/_components/`) instead of pre-emptively placing them in a shared `components/` folder. Promote a component to shared only once a second route actually needs it — premature sharing creates components with awkward generic props trying to serve use cases that don't exist yet, and colocated-but-actually-shared logic is easy to find and move when the second use case shows up for real.

5. **Follow the project's existing file naming convention; default to kebab-case if none exists.** Consistency here matters less for its own sake and more because a mixed-convention codebase (`UserCard.tsx` next to `booking-list.tsx`) makes it harder to predict where to find or place a file — small thing, compounds over a whole app.

6. **Wire every form to the Server Action/Route Handler and result shape `feature-logic-implementation` defined**, and render success/error states through one shared pattern (a shared form-error display, a shared success toast/redirect pattern) rather than letting each form invent its own handling. If a form's error UI looks different from every other form's for no content-driven reason, that's a sign the consistent shape from stage 4 isn't actually being used consistently.

7. **Implement the four states `ux-flow-design` specified, per screen, using Next.js's own conventions**: `loading.tsx` for the loading state, `error.tsx` for the error boundary, an explicit empty-state render (not just "no rows, blank screen") for the empty case, and a redirect or a dedicated forbidden/not-found page for the not-permitted case — distinguishing "not logged in" from "logged in but not allowed" if `ux-flow-design` called for both. Check back against that screen's state list rather than deciding states fresh here; this stage executes those decisions, it doesn't redo them.

8. **Apply the cross-screen consistency rules from `ux-flow-design`** — primary action placement, feedback pattern, shared list/detail patterns — through actual component reuse (a shared `EntityList` pattern, a shared layout shell) rather than each page rebuilding the same pattern slightly differently.

9. **Write the output using the template below.**

## Output template

Suggested filename: `specs/<feature-name>-pages.md` (follow the project's existing convention if one exists).

```markdown
# <Feature name> — Pages

## Route map
| Screen (from ux-flow-design) | Route | Route group / access tier |
|---|---|---|
| <name> | <path> | (public) / (authenticated) / (admin) |

## Server/client split
- <component>: server (default) / client — <reason if client>

## Colocation plan
- <route>/_components/<component>: <purpose>
- Promoted to shared `components/`: <only if genuinely reused, and by what>

## States implementation
### <route>
- loading.tsx: <what it shows>
- error.tsx: <what it shows>
- Empty state: <how it's rendered, not just "blank">
- Not-permitted: <redirect target or page, distinguishing not-logged-in vs forbidden if both apply>

## Form wiring
- <form>: calls <action from feature-logic-implementation>, renders <result shape> via <shared pattern>

## Open questions / assumptions
- <...>
```

## Common ways this goes wrong

**Route groups named by domain instead of access level.** `(dashboard)` or `(settings)` groups don't tell you who's allowed in — `(authenticated)` does, and that's what middleware actually needs to check against.

**Marking a whole page `'use client'` for one interactive element.** This silently opts the entire subtree out of server rendering for no reason tied to what actually needs to run in the browser.

**Extracting to shared `components/` before a second use case exists.** This produces components with prop APIs guessing at requirements nobody has yet, which usually need rewriting anyway once the second real use case shows up — colocating first costs nothing and avoids the guess.

**Skipping `loading.tsx`/`error.tsx` because the happy path already works.** A page that has no loading state shows a frozen screen during a slow fetch, and a page with no error boundary shows Next.js's generic crash screen instead of something that matches the rest of the app.

**Ignoring the not-permitted state, or merging "not logged in" with "forbidden."** These are different situations for a user (one says "sign in", the other says "you can't see this") and merging them into one generic error page loses information the user actually needs.

**Inconsistent error UI per form because stage 4's shared result shape isn't actually used consistently.** If every form renders errors slightly differently, check whether they're all actually consuming the same result shape from `feature-logic-implementation` or whether each one re-derived its own handling.
