---
name: feature-scoping
description: Turn a rough feature idea or feature request into a scoped spec — problem statement, actors, user flow, what it touches, an explicit MVP cut line (in/out/later), and success criteria — written out as a spec document before any design or code happens. Use this whenever the user describes a new feature in vague terms ("I want to add X", "users should be able to Y", "let's build a Z feature"), asks for a spec/PRD, says a feature idea needs scoping, or is about to start building something new without having written down what "done for v1" means. This is stage 1 of the feature lifecycle (scoping → design → data modeling → implementation → pages → rendering → deploy → launch) — run it before ux-flow-design, data-model-design, or any other downstream stage, even if the user jumps straight to "how should the UI look" or "what's the schema." If there's no written-down scope yet, that's a sign to pull the conversation back here first.
---

# Feature Scoping

Most wasted engineering effort doesn't come from writing bad code — it comes from building the right code for the wrong scope. This skill exists to catch that earlier: before a screen gets designed or a table gets created, force a short, concrete conversation about what the feature actually needs to do for a first version, and write the answer down.

The output is a spec document the user can hand to the next stage (`ux-flow-design`, `data-model-design`, etc.) or just keep as a reference for what they agreed to build. It is not a product-management ritual — keep it short enough that writing it is clearly faster than skipping it and re-deciding scope mid-implementation three times.

## How to run this

1. **State the problem in one or two sentences before anything else.** Not the feature ("add a review system") — the problem it solves, framed around the actor's actual goal: what job is this actor trying to get done, and what's stopping them right now ("requesters have no way to judge whether a provider is trustworthy before booking them"). If the user only gave you the feature framing, ask what problem prompted it. A feature with no clear problem behind it is usually scope creep waiting to happen.

2. **Name the actors generically.** Most features involve more than one kind of user (the person doing the action, the person it happens to, sometimes an admin/moderator). Use role-neutral names like "requester" / "provider" / "admin" unless the project has already established its own role names — never reach for domain-specific names from any one reference project. If the project genuinely has just one user type, say so explicitly rather than inventing a second role to fill out the template.

3. **Map the user flow as a numbered sequence, not a feature list.** "User flow" means the actual path someone walks: trigger → steps → end state, including what each actor sees. Write it as steps, not a bullet list of capabilities — a flow exposes ordering problems and missing steps that a capability list hides. Cover the unhappy paths that matter (what happens if the action fails, if the other actor never responds, if required data is missing) but don't enumerate every possible error — just the ones a real user will hit.

4. **Note what this touches, without designing it.** From the flow, a few things become visible: where in the existing product this feature enters (which screen, which existing flow it hangs off of), what existing systems it depends on or extends (auth, payments, notifications, file storage), and roughly what new data the feature implies (entity names, not columns or schema). Write these down as flags for the next stages — `ux-flow-design` needs the entry point, `data-model-design` needs the entity names — but don't go further than naming them here. If the conversation starts drifting into actual screen layout or table columns, that's a sign this step is done and the next stage should take over.

5. **Draw the MVP cut line explicitly, as three buckets: In scope (v1) / Out of scope (later) / Explicitly not doing.** This is the part people skip and the part that matters most. "Out of scope (later)" and "explicitly not doing" are different — a payment-splitting feature might be "later" (we'll want it eventually) while supporting five currencies might be "explicitly not doing" (no plan to ever need it for this user base). Push back if everything lands in "in scope" — that means no scoping happened. A good v1 cut usually feels slightly uncomfortable to the person who first pitched the feature; that discomfort is the point, not a bug in the process.

6. **Define success criteria that are checkable, not aspirational.** "Users love the new flow" isn't checkable. "A requester can complete a booking in under 3 steps" or "providers receive a notification within 5 seconds of a new request" is. If the feature has no measurable success criteria, the team has no way to know later whether shipping it actually worked — say this plainly if the user wants to skip the step.

7. **Write the spec using the template below**, fill in what you learned, and call out anywhere you had to guess or where the user should double check before downstream work starts on top of it.

## Spec document template

Use this structure for the output file (suggested filename: `specs/<feature-name>-scope.md`, but follow the project's existing convention if one exists):

```markdown
# <Feature name> — Scope

## Problem
<1-2 sentences: what's broken or missing without this feature, for whom, what job are they trying to get done>

## Actors
- <Actor 1 (generic role name)>: <what they need from this feature>
- <Actor 2, if any>: <...>

## User flow (v1)
1. <Actor> does X
2. System does Y
3. <Other actor> sees Z
...
(branch explicitly for the unhappy paths that matter, e.g. "3a. If Y fails, ...")

## Touches & dependencies
- Entry point in existing product: <where this hangs off the current UI/flow>
- Existing systems it depends on or extends: <auth / payments / notifications / file storage / none>
- New data implied (names only, no schema): <entity names>

## MVP cut line
**In scope (v1):**
- ...

**Out of scope (later):**
- ...

**Explicitly not doing:**
- ...

## Success criteria
- <checkable statement>
- <checkable statement>

## Open questions / assumptions
- <anything guessed at, anything the user should confirm before design/implementation starts>
```

## Common ways this goes wrong

**Treating it as a feature-list exercise instead of a flow.** A bullet list of capabilities ("supports filtering, supports sorting, supports pagination") doesn't reveal what happens when a user actually walks through the feature. Always force it into ordered steps.

**Letting "MVP" mean "everything, just done quickly."** If the in-scope list is exactly what the user originally described with nothing moved to "later," the cut line didn't happen — go back and ask what could ship a week later without anyone but the team noticing.

**Borrowing domain-specific language from one reference project.** If a past project used "shipper/driver" or similarly specific role names, don't let those leak into a new feature's scope doc unless this actual project uses those roles. Keep actor names generic to the feature being scoped.

**Skipping straight to data model or UI questions.** It's tempting to answer "what tables do we need" or "what should this screen look like" before "what problem are we solving" — redirect back to problem and flow first if this happens. The "Touches & dependencies" section exists precisely so those questions get a placeholder ("there will be a `reviews` entity") without this skill actually designing the schema or screen — that's the next stage's job.

**Writing success criteria that can't fail.** If every plausible outcome would count as success, the criteria aren't doing their job. Push for something a skeptic could look at after launch and say "no, that didn't happen."
