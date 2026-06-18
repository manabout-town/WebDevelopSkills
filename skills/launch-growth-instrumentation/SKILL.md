---
name: launch-growth-instrumentation
description: Decide what to actually track at launch — events tied directly to feature-scoping's success criteria and essential-feature-discovery's core job-to-be-done (not indiscriminate click tracking), SEO metadata for public-facing routes only, feature flags for progressive rollout with a real cleanup plan, and instrumentation for any viral/sharing loop the feature has. Use this whenever the user is about to launch a feature, asks "what should I track", "how do I know if this is working", "do I need a feature flag for this", or is adding analytics events without a clear link to what those events are meant to answer. This is stage 8, the last stage of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after deployment-release-readiness has confirmed the release itself is safe; this stage is about knowing whether the feature is actually working, not about deploy safety.
---

# Launch & Growth Instrumentation

It's easy to end up with two failure modes at launch: tracking everything indiscriminately (every click, every pageview) so that the signal that actually matters is buried in noise nobody looks at, or tracking nothing specific and being unable to answer the question the feature was built to answer in the first place. This skill exists to tie tracking back to something concrete — the success criteria `feature-scoping` already wrote down, and the core job-to-be-done `essential-feature-discovery` already named — rather than treating instrumentation as a generic, separate exercise.

## How to run this

1. **Start from feature-scoping's success criteria, not a blank instrumentation plan.** If the success criterion was "a requester can complete a booking in under 3 steps," the events that matter are the step-level events that make that measurable after launch — not a generic "engagement" event that can't actually answer the question the criterion was written to answer. If a feature has no written success criteria, that's worth flagging back rather than instrumenting blindly.

2. **Track the funnel for the core job-to-be-done, end to end.** Pull the core job from `essential-feature-discovery` (or from the feature's own scope if it predates that stage) and instrument its entry point, its key milestones, its completion, and — just as importantly — where people drop off. A funnel with no drop-off visibility can tell you the feature shipped; it can't tell you why people aren't finishing it.

3. **Keep the event set minimal and intentional.** Every event should answer a specific question someone will actually ask later ("how many people reach step 2," "what fraction complete the whole flow"). An event added "just in case it's useful" is usually never queried and just adds noise to whatever's already being tracked — resist instrumenting every interaction on a page.

4. **Add metadata only to routes meant to be publicly discoverable.** Check each route's purpose against `ux-flow-design` — public marketing/content screens get real title/description/OG tags; authenticated app screens generally should not be indexed at all (`noindex`) rather than leaking private-feeling pages into search results with generic or missing metadata.

5. **Decide feature flags with a cleanup plan attached, not just an on/off switch.** If `deployment-release-readiness` already decided this release ships behind a flag, name the flag, its default state, and — critically — when it gets removed once the feature reaches full rollout. A flag with no removal plan becomes permanent dead weight in the codebase; write the removal condition down now while it's still fresh, not as a someday cleanup task nobody owns.

6. **Instrument the actual steps of any viral or sharing loop, if the feature has one.** "Invite sent → invite opened → invite converted" (or whatever the feature's specific loop is) needs each step tracked individually — a loop that only tracks "shared" and "signed up" can't distinguish a loop that has a 50% open rate and a 90% conversion rate from one with the reverse, even though those need completely different fixes.

7. **Avoid vanity metrics that can't inform a decision.** Raw pageviews or click counts with no action or outcome attached look like data but rarely change what anyone does next — prioritize the smaller set of metrics that map directly to the success criteria over a larger set that just looks like more data.

8. **Write the output using the template below.**

## Output template

Suggested filename: `specs/<feature-name>-instrumentation.md` (follow the project's existing convention if one exists).

```markdown
# <Feature name> — Launch & Growth Instrumentation

## Tracked events
| Event | Trigger | Maps to success criterion / funnel step |
|---|---|---|
| <event_name> | <when it fires> | <which feature-scoping criterion or essential-feature-discovery job step> |

## SEO metadata
| Route | Public-facing? | Metadata | Indexing |
|---|---|---|---|
| <path> | yes/no | <title/description/OG, or "n/a — noindex"> | index / noindex |

## Feature flags
| Flag | Default state | Rollout plan | Removal condition |
|---|---|---|---|
| <name> | on/off | <staged plan> | <when this flag gets deleted> |

## Growth loop instrumentation (if applicable)
- <loop step> → <event tracked>

## Open questions / assumptions
- <...>
```

## Common ways this goes wrong

**Tracking everything instead of the funnel tied to success criteria.** A flood of undifferentiated click events doesn't answer "is this feature working" any better than tracking nothing — it just makes the few events that would answer that question harder to find.

**No written success criteria to track against.** If `feature-scoping` was skipped or its success criteria were vague ("users love it"), instrumentation has nothing concrete to attach to — flag this back rather than inventing events that don't map to anything checkable.

**Forgetting `noindex` on authenticated/private routes.** A logged-in dashboard or a user's private settings page showing up in search results because nobody set indexing metadata is both a privacy concern and a bad search experience for the rest of the site.

**Feature flags created with no removal plan.** Once a feature reaches 100% rollout and stays there, the flag and its branching logic often just stay in the code indefinitely — write the removal condition down at creation time, not as a vague future cleanup.

**Instrumenting only the endpoints of a growth loop, not its steps.** Knowing "shares happened" and "signups happened" without the steps in between can't tell you which part of the loop to fix if growth stalls.
