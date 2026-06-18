---
name: ux-flow-design
description: Turn a scoped feature (from feature-scoping) or a tiered feature map (from essential-feature-discovery) into a concrete screen list, navigation map between those screens, a per-screen structural sketch (zones, primary action, and the loading/empty/error/forbidden states each screen must handle), and a short set of cross-screen UI consistency rules — all before any component gets built or any visual design decision (color, spacing, typography) gets made. Use this whenever the user has a scoped feature or feature map and asks "what screens do we need", "how should this flow", "what does the UI look like", "let's design the pages", or jumps straight to describing a layout without a screen list existing yet. This is stage 2 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after feature-scoping/essential-feature-discovery and before data-model-design or page-implementation, even if the user's instinct is to go straight to colors and components. If there's no written screen list and navigation map yet, that's the sign to pull the conversation back here first.
---

# UX Flow Design

A feature can be scoped correctly and still ship broken-feeling, because nobody decided what happens between the screens — what a user sees while data loads, what a list looks like with nothing in it yet, what a screen shows someone who isn't logged in or doesn't have permission. Those gaps are where "it works on the happy path" software comes from. This skill exists to force those decisions before a single component gets written, by turning a feature's user flow into an explicit, structural screen map.

This is not visual design. No colors, fonts, spacing values, or component libraries get chosen here — that's a later, separate concern, and conflating it with this stage is the most common way this skill goes wrong. What gets decided here is structure: which screens exist, how someone moves between them, what each screen is built out of at the zone level (not the pixel level), and what every screen owes the user regardless of feature — a sensible state when there's no data yet, when data is still loading, when something failed, and when the user isn't allowed to be there.

The output is a document the user can hand to `data-model-design` (which needs to know what data each screen displays) and `page-implementation` (which needs the screen list, the states, and the consistency rules to actually build from).

## How to run this

1. **Start from the flow, not from a blank page.** If `feature-scoping` already produced a numbered user flow, walk it step by step — each step either happens on an existing screen or implies a new one. If only `essential-feature-discovery`'s tiered feature map exists, use its "Pages implied by Tier 1" section as the starting list, but still trace through how a user would actually move between them; a list of pages isn't a flow. Don't invent screens the flow doesn't call for — extra screens are scope creep at the design layer.

2. **Always check for the baseline screens every project needs, even if the flow didn't mention them.** A scoped feature describes what's new; it almost never re-mentions that the app needs a login screen, a logged-out state, a 404, or a generic error boundary, because those are assumed to already exist. If this is an early-stage project, cross-check against `web-essentials-checklist` and add the baseline screens explicitly rather than letting them fall through the cracks — this is the single most common reason a generated app feels unfinished even when every "real" feature works.

3. **List the screens, each with one job.** For each screen: a short name, its purpose in one sentence, and how someone arrives at it (which screen links to it, or "direct entry" if it's a landing/auth screen). If a screen's purpose needs "and" to describe ("shows the list and lets you edit settings") it's probably two screens wearing one name — split it unless there's a strong reason not to.

4. **Map navigation as a directed flow, not a sitemap tree.** A sitemap shows hierarchy; it doesn't show that screen B is only reachable from screen A after a successful action, or that screen C is a dead end with no way back. Draw arrows for actual paths a user takes, including: how to go back/cancel out of a flow, what happens after a destructive or completing action (where does the user land?), and any branch point where the next screen depends on a condition (logged in vs not, has data vs empty, owns the resource vs doesn't).

5. **Sketch each screen's structure at the zone level.** Describe the regions of the screen (e.g. "header with primary action," "filterable list," "detail panel," "form with N fields, submit at bottom") and which zone holds the primary action — the one thing this screen most wants the user to do. Do not specify layout in pixels, colors, or component names; if you catch yourself writing a hex code or a font, stop, that's not this stage.

6. **For every screen, name what it shows in these four states: loading, empty, error, and not-permitted.** This is the step most likely to get skipped, and skipping it is exactly how "no errors on the happy path, but it breaks the moment a real user touches it" software gets built. "Empty" isn't always "no rows" — for a detail screen it might mean "the thing being viewed was deleted"; for a dashboard it might mean "no activity yet, here's what to do first." "Not-permitted" covers both "not logged in" and "logged in but not allowed to see this" — these are usually different screens, not the same generic error.

7. **Write down the cross-screen consistency rules once, instead of letting every screen reinvent them.** At minimum decide: where primary actions live across screens (same corner, same style of button, every time), how feedback is shown (toast vs inline message vs redirect-with-message — pick one default and name exceptions), and whether similar entities share a layout pattern (e.g. every "list of X" screen uses the same list pattern, every "X detail" screen uses the same detail pattern). These rules are what make an app feel like one product instead of a patchwork of independently-designed screens — they matter more here than any individual screen's cleverness.

8. **Note what each screen needs from data, by name only — don't design the schema.** For each screen, list which entities and roughly which fields it reads or writes (e.g. "detail panel shows: provider name, rating, availability"). This is the handoff to `data-model-design`; naming the fields here saves a re-derivation step later, but don't go further than naming — no types, no constraints, no table design.

9. **Write the output using the template below**, and flag anywhere a screen, a state, or a navigation path was a judgment call rather than something the flow explicitly implied.

## Output template

Suggested filename: `specs/<feature-or-app-name>-ux-flow.md` (follow the project's existing convention if one exists).

```markdown
# <Feature/app name> — UX Flow

## Screens
| Screen | Purpose | Entry point |
|---|---|---|
| <name> | <one sentence> | <where it's reached from> |

## Navigation map
<directed flow: arrows between screens, including back/cancel paths and where destructive or completing actions land. Plain text arrows or a short list of "From X: action -> Y" lines is fine.>

## Per-screen structure
### <Screen name>
- Zones: <header / list / detail / form, etc., and what's in each>
- Primary action: <the one thing this screen wants the user to do>
- Loading state: <...>
- Empty state: <...>
- Error state: <...>
- Not-permitted state: <not logged in vs logged in but forbidden, if both apply>
- Data needed: <entity + fields, names only>

(repeat per screen)

## Cross-screen consistency rules
- Primary action placement: <rule>
- Feedback pattern: <rule, plus named exceptions if any>
- Shared layout patterns: <e.g. "all list screens use pattern X", "all detail screens use pattern Y">

## Baseline screens checked
- <which web-essentials-checklist baseline screens were confirmed present: login, logged-out state, 404, error boundary, etc. — or note this project already has them>

## Open questions / assumptions
- <anything guessed at, anything the user should confirm before data-model-design or page-implementation starts>
```

## Common ways this goes wrong

**Designing instead of structuring.** The moment colors, fonts, spacing, or a specific component library show up, this stage has quietly turned into visual design. Structure first — what exists and how it's reached — visual decisions belong to a later, separate pass.

**Treating the screen list as a sitemap instead of a flow.** A hierarchy of pages doesn't tell anyone how a user actually gets from "just signed up" to "completed their first booking." If the navigation map can't answer "what does this person see immediately after doing X," it isn't done yet.

**Skipping the four states because the happy path is the only one anyone thought about.** Loading, empty, error, and not-permitted aren't edge cases to handle later — for most real screens, a user will hit at least one of them before they hit the happy path (a new account's dashboard is empty by definition; an unauthenticated visit to a detail page is the not-permitted case). Skipping this here means `page-implementation` either invents something inconsistent per page or skips it too.

**Forgetting the baseline screens because the feature scope didn't mention them.** Login, logout, 404, and a generic error screen are almost never in a feature's scope doc because they're assumed to exist already — which is exactly why this stage has to check for them explicitly rather than waiting for someone to ask.

**Letting every screen invent its own consistency rules.** If the list screen for one entity and the list screen for another entity look and behave differently for no reason tied to the actual content, that inconsistency compounds across the app. Decide the shared patterns once, here, rather than per-screen during implementation.
