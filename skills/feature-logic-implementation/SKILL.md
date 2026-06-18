---
name: feature-logic-implementation
description: Decide where business logic actually lives (Server Action vs Route Handler), the validation boundary between client and server, a single consistent error/result shape used across the whole app, and how writes handle race conditions and cache revalidation — before writing the actual mutation/query code. Use this whenever the user is about to implement a feature's server-side logic, asks "should this be a server action or an API route", "how should I handle errors here", "where should this validation go", or is writing a mutation without a decided return shape or revalidation plan. This is stage 4 of the feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — run it after data-model-design (which already decided the access model and RLS this stage's validation has to respect) and before page-implementation (which wires forms and renders results against what this stage produces).
---

# Feature Logic Implementation

Two failure modes show up constantly in this layer: business logic gets written directly inside a Server Action or route handler body, making it untestable and impossible to reuse from a second entry point (a webhook that needs the same logic a form action triggers); and every action invents its own ad hoc success/error shape, so every page that renders a result has to special-case it. This skill exists to settle both before the first mutation gets written.

The output is a short document plus the actual thin entry-point code (Server Actions / Route Handlers) that `page-implementation` wires forms to and renders results from.

## How to run this

1. **Choose Server Action vs Route Handler per operation, not by habit.** Default to a Server Action for mutations triggered from within this app's own UI — less boilerplate, works with progressive enhancement, colocates naturally with the form that calls it. Reach for a Route Handler instead when: the endpoint must be called from outside this Next.js app (webhooks, a public API, a third-party integration), it needs custom response headers or streaming, or it's hit by something that isn't a form submission at all. If neither reason applies, a Route Handler is probably solving a problem this app doesn't have yet.

2. **Keep the entry point thin; put the actual logic in a plain, testable function.** The Server Action or Route Handler's job is: parse/validate input, call a plain function that does the real work, format the result. That plain function should be callable and testable without spinning up Next.js at all — and reusable if a second entry point (a cron job, a webhook, an admin tool) ever needs the same business logic. If the entry point body is where the actual decision-making happens, it's not thin enough.

3. **Treat client-side validation as UX only, never as the security boundary.** Client checks exist to give instant feedback before a round trip — they tell a user "this field looks wrong" faster. They tell the server nothing trustworthy, because a request can always be sent without going through the client's form. The server must independently validate everything the client checked, plus what the client structurally can't check: that the current user actually has the access the data-model-design access model grants them for this specific row, and that the data is still in a state where this operation is valid (it hasn't been deleted, its status hasn't moved on, etc.).

4. **Define one consistent result shape and use it everywhere.** Pick a single shape for what every Server Action / mutation returns — for example `{ success: true, data } | { success: false, error: { code, message } }` — and don't let individual actions invent their own variant. This is what lets `page-implementation` render success/error states with one shared pattern instead of special-casing every form. Decide it once, here, before the first action is written.

5. **Separate the user-facing error message from the internal error detail.** Log the real error (stack trace, DB constraint name, whatever actually happened) server-side where it's useful for debugging. Return the client a coded, generic message (`{ code: "BOOKING_ALREADY_CONFIRMED", message: "This booking can no longer be changed." }`) — never raw DB errors or stack traces, which can leak schema details and aren't actionable for a user anyway.

6. **Handle race conditions for writes where the stakes are real, using the data model, not ad hoc locks.** If two requests could plausibly hit the same row at once in a way that matters (double-submit, two actors editing the same resource), check the data-model-design access model for a status/version column that already exists for this purpose — use it for an optimistic check (`update ... where status = 'expected_status'`, fail loudly if zero rows updated) rather than inventing a new locking mechanism. Not every write needs this — a personal preferences update usually doesn't; a payment confirmation usually does.

7. **Decide what needs to be revalidated after each successful write**, and call it out explicitly (which paths/tags, via `revalidatePath`/`revalidateTag`) rather than leaving it to be guessed at in the rendering stage. This is the handoff to `rendering-performance-strategy`: that stage decides the overall caching strategy, but it needs to know, per mutation, what just became stale.

8. **Write the output using the template below.**

## Output template

Suggested filename: `specs/<feature-name>-logic.md` (follow the project's existing convention if one exists).

```markdown
# <Feature name> — Logic

## Entry points
| Operation | Server Action / Route Handler | Reasoning |
|---|---|---|
| <e.g. create booking> | Server Action | triggered from in-app form |

## Validation boundary
### <operation>
- Client checks (UX only): <...>
- Server checks (the real boundary): <field validation, access-model check, current-state check>

## Result shape
<the one shape used across the app, with an example success and an example error>

## Error code map
| Code | User-facing message | Logged internally |
|---|---|---|
| <CODE> | <message shown to user> | <what actually gets logged> |

## Race condition / idempotency handling
- <operation>: <how it's protected, tied to which data-model-design column>

## Revalidation triggers
- After <operation>: revalidate <path/tag>

## Open questions / assumptions
- <...>
```

## Common ways this goes wrong

**Writing business logic straight into the Server Action or route handler.** It works for the first call site and becomes impossible to reuse or unit-test the moment a second one shows up. Pull it into a plain function from the start.

**Trusting client-side validation as if it were the real boundary.** A client check stops an honest user from submitting bad data by accident; it stops nothing else. The server has to re-verify everything, including access and current state, every time.

**Every action inventing its own success/error shape.** This is the single biggest source of inconsistent error UI in `page-implementation` — one form shows a toast, another shows nothing, a third throws an unhandled exception, because each action returns something slightly different. Pick the one shape early.

**Leaking internal error detail to the client.** Returning a raw DB error or stack trace isn't more helpful to the user — it's less helpful (not actionable) and tells an attacker more about the schema than they should know.

**Inventing ad hoc locking instead of using the data model's own state.** A bespoke mutex or in-memory lock doesn't survive a server restart or multiple instances; an optimistic check against a status/version column that data-model-design already designed for this purpose does.

**Forgetting revalidation, so a successful write doesn't show up until a hard refresh.** This is usually invisible during development (the developer already knows to refresh) and very visible to a real user who just submitted a form and sees the old state.
