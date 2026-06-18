---
name: essential-feature-discovery
description: Turn a bare idea for a web service ("a marketplace for X", "a tool that lets Y do Z") into a tiered, justified feature map — Essential (v1, can't ship without it), Important (soon after v1), Nice-to-have (defer until users ask) — before any individual feature gets scoped. Use this at the very start of a new project, when the user describes an idea with little else attached, asks "what features do I actually need", "what should v1 include", or wants a roadmap/MVP feature list. Also use it whenever a new feature request shows up mid-project and it's unclear whether it's actually necessary ("should we even build this?") — re-run the classification test on that one feature against the existing map instead of assuming it belongs in scope. This is stage 0 of the feature lifecycle, one level above `feature-scoping`: this skill decides *which* features the product needs at all; `feature-scoping` then scopes *one* of those features in detail. Don't skip straight to scoping a named feature if no one has asked "does this product need this feature in the first place."
---

# Essential Feature Discovery

A request like "let's add bookmarks" or "we need a reviews feature" almost always gets answered by designing and building that feature — rarely by first asking whether the product actually needs it yet. That question gets skipped because nobody owns it: `feature-scoping` starts from "we're building X," not "should we build X." This skill exists to own that question, once at the start of a project (producing a full feature map) and again any time a new feature request arrives mid-project (classifying just that one request against the map).

The output is a short, tiered list the user can keep next to the project — not a roadmap presentation, not a backlog. It should take less time to produce than the discussion that happens anyway, three separate times, whenever someone asks "wait, do we need this?"

## How to run this

1. **Name the core job-to-be-done in one sentence.** Not the idea's category ("a marketplace") — the specific thing one actor is trying to accomplish ("a person who needs a task done finds and pays someone qualified to do it"). Everything else in this process gets tested against whether it serves this one sentence. If the user's idea is described at the category level only, ask what the actor is actually trying to get done before going further — a vague core job produces a vague feature map.

2. **Name the actors generically**, the same way `feature-scoping` does — role-neutral names like "requester"/"provider"/"admin", not names borrowed from any one reference project, and don't invent a second actor type the idea doesn't actually have.

3. **Apply the removal test to sort every candidate feature into a tier.** For each feature anyone proposes (including ones the user didn't mention but the idea obviously implies, like auth for anything with accounts), ask: *if this feature didn't exist, could the core job from step 1 still be completed end-to-end, even if awkwardly?*
   - **No, the core job breaks without it → Essential (v1).** These are the features the product is not a product without. For most ideas this is a short list — typically the way the core actor finds/creates the thing they need, the way the other actor (if any) responds, and whatever minimal account/identity layer the flow depends on. Resist the pull to make this list comprehensive; "essential" means load-bearing, not "valuable."
   - **Yes, the job still completes, but something important is at risk (trust, money, abuse, legal exposure) → Important, soon after v1.** These aren't load-bearing for the happy path, but skipping them for too long creates a real problem (e.g., no way to flag bad actors, no record of what was agreed to). Say what risk each one addresses, not just that it'd be good to have.
   - **Yes, and nothing breaks or goes newly at risk without it → Nice-to-have, defer until users ask.** This is where most feature requests that *feel* obviously good land — bookmarks, favorites, advanced filters, notifications beyond the minimum, most personalization. Defer doesn't mean reject; it means there's no justification yet, and the right time to build it is when a real user asks for it or its absence becomes a measurable problem, not before.

4. **Watch for two failure modes while sorting.** First, competitor-feature-matching: "X has this so we need it too" is not a removal-test answer — ask what breaks without it, specifically for this product's core job, not in general. Second, cheap-so-why-not: a feature being quick to build doesn't move it out of Nice-to-have; ease of implementation and necessity are unrelated questions, and conflating them is how MVPs grow a dozen features deep before anyone uses v1.

5. **Sketch which pages each Essential feature implies, by name only.** This is a handoff to `ux-flow-design`, not page design itself — list page/screen names (e.g. "listing detail," "create listing," "requester dashboard") next to the Essential features that need them, so the next stage has a starting page list instead of starting blank. Don't design layout or UI here.

6. **Write the output using the template below.** Call out anywhere the tier assignment was a judgment call, since the user may weigh risk differently than the default reasoning above.

## Output template

Suggested filename: `specs/<idea-name>-feature-map.md`.

```markdown
# <Idea name> — Essential Feature Map

## Core job-to-be-done
<one sentence: which actor is trying to do what>

## Actors
- <Actor 1 (generic role name)>
- <Actor 2, if any>

## Tier 1 — Essential (v1)
- <Feature>: <what breaks in the core job without it>

## Tier 2 — Important (soon after v1)
- <Feature>: <what risk it addresses — trust / money / abuse / legal / data loss>

## Tier 3 — Nice-to-have (defer until users ask)
- <Feature>: <why it's not load-bearing, and what the workaround is without it>

## Pages implied by Tier 1 (handoff to ux-flow-design)
- <page/screen name>: <which Essential feature(s) need it>

## Judgment calls
- <any tier assignment that depended on a guess about risk/priority, flagged for the user to confirm>

## Next steps
- Run `feature-scoping` on each Tier 1 feature (and any Tier 2/3 feature the user decides to pull forward) before design or implementation starts.
- When a new feature request shows up later, classify it with the removal test above before assuming it belongs in scope — update this file rather than starting a fresh discussion each time.
```

## Common ways this goes wrong

**Producing a feature wishlist instead of a tiered map.** If every feature lands in Tier 1, the removal test didn't actually get applied — go back through and ask what specifically breaks for each one. A v1 list that doesn't feel slightly thin is usually still padded.

**Letting the reference idea behind this skill leak in.** Don't reach for one familiar project's feature set (e.g. escrow, bidding, dispatch from a logistics marketplace) as a default Essential list for an unrelated idea — every idea gets its own removal test from its own core job, not a template borrowed from a different domain.

**Designing the feature instead of classifying it.** This stage names features and tiers them; it doesn't describe how a feature works, what its UI looks like, or what its data model is. If the conversation drifts into "and the bookmark button would live in the corner and use a heart icon," that's `feature-scoping`/`ux-flow-design` territory — pull back to classification.

**Treating "nice-to-have" as a verdict instead of a default.** Tier 3 isn't "never build this" — it's "no justification yet." If the user pushes back that a Nice-to-have feature genuinely is load-bearing for their specific audience (e.g., bookmarks are essential for a read-later-focused content app, not a transactional marketplace), that's a sign the core job in step 1 was defined too generically — revisit it rather than just overriding the tier.

**Skipping straight to scoping a named feature.** If someone says "let's scope the bookmark feature," and there is no feature map yet for the product, that's the signal this skill should run first — not a sign to jump into `feature-scoping` for that one feature in isolation.
