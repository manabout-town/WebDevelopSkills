---
name: visual-design-foundations
description: Decide, once per project, the two things every later page ends up depending on — which UI primitive library to build on (shadcn/ui, Radix, plain Tailwind, or another) and the design tokens (color palette including semantic colors, typography scale, spacing/radius/shadow conventions) that every component should reference instead of reinventing. Use this whenever the user is scaffolding a new project, asks "what should I use for buttons/dialogs/forms", "what colors should I use", "how do I keep this looking consistent", is about to write the first real page and has no component library or token decision yet, or pages are starting to look inconsistent because each one picked its own colors/spacing ad hoc. This is independent of the numbered feature lifecycle (scoping → ux flow → data model → logic → pages → rendering → deploy → launch) — like `web-essentials-checklist`, it runs once per project rather than once per feature, ideally right after `essential-feature-discovery` and before the first feature reaches `page-implementation`, since that stage needs a library and tokens to build against rather than re-deciding them per page.
---

# Visual Design Foundations

`ux-flow-design` deliberately stops at structure — screens, navigation, zones — and refuses to pick colors, fonts, or a component library, because that's a different kind of decision made at a different time. The problem is that if nothing ever picks it up, `page-implementation` ends up making it implicitly, one page at a time: one screen's buttons are `rounded-md`, another's are `rounded-lg`, one form's error text is red-500, another's is red-600, and the component library question gets re-answered every time someone needs a dialog. None of these individual choices is wrong; the inconsistency between them is what makes an app feel unfinished even when every feature technically works.

This skill exists to make two decisions once, deliberately, before they get made by accident many times: which UI primitive library the project builds on, and what the design tokens are. The output is something every later page can reference instead of re-deriving.

This is a project-level decision, not a per-feature one — run it once early, and revisit it only as a deliberate, explicit redesign, not as a side effect of building some unrelated feature.

## How to run this

1. **Inspect the actual project before assuming nothing exists.** Check `tailwind.config.*`/`globals.css` for an existing theme, check `package.json` and `components/ui/` for an already-installed library (shadcn/ui leaves a recognizable trail: a `components.json`, a `cn()` utility, `components/ui/*.tsx`). If a real design system already exists, this skill's job is to surface and document it, not to silently replace it with a different one because it wasn't asked first.

2. **Pick the UI primitive library once, based on what this project actually needs — not by default or by whichever one is trendiest.** A few real signals to decide on: how many distinct interactive components the app will need (a handful of forms vs. a full app with dialogs, comboboxes, dropdowns, toasts); how much the team wants to own and edit the component's actual source vs. treat it as a black box; whether built-in accessibility behavior (focus trapping, keyboard nav, ARIA wiring) matters enough to not want to hand-roll it. Plain Tailwind utility classes with no library are a legitimate choice for a small, mostly-static app — the point is to decide this once and write down why, so `page-implementation` builds against a known foundation instead of each page importing whatever seemed convenient at the time.

3. **Decide the color tokens, including semantic colors, not just a brand palette.** Beyond primary/secondary/neutral, name the semantic colors every real app eventually needs — success, warning, danger/error, info — so that "an error state" always uses the same red instead of each form picking its own. Check contrast for the combinations that matter most (body text on background, primary button text on its own background) against WCAG AA; if the project has the `design:accessibility-review` skill available, that's a reasonable place to do a fuller pass, but at minimum don't finalize a palette that fails contrast on its own primary text/background pair.

4. **Decide the typography and spacing scale.** A small fixed set of heading sizes plus body text, rather than ad hoc font sizes invented per component; a spacing scale (Tailwind's default scale is a legitimate choice — "we use the default" is a valid decision, not a missing one) and a consistent radius/shadow convention for cards, buttons, and inputs. The goal isn't an exhaustive design system, it's enough of a shared vocabulary that two different screens built months apart still look like the same product.

5. **Write the tokens into the project for real** — `tailwind.config.*` theme extension and/or CSS variables in `globals.css`, matching however the chosen library expects to receive them (shadcn/ui's CSS-variable convention, for instance). This is normal per-project code generation like every other implementation stage does, not a bundled template — there's nothing to copy-paste, the actual values come from step 3 and 4 above, generated fresh for this project.

6. **Hand this off explicitly to the stages that consume it.** `ux-flow-design`'s cross-screen consistency rules should reference these tokens by name instead of restating colors per flow doc once this skill has run; `page-implementation` should build every component against the chosen library and tokens rather than re-deciding either per page. If this skill runs after some pages already exist, flag which existing pages don't yet conform so the user can decide whether to retrofit them now or over time.

7. **Write the output using the template below.**

## Output template

Suggested filename: `specs/design-foundations.md` (project-level, not per-feature — follow the project's existing convention if one exists).

```markdown
# Visual Design Foundations

## UI primitive library
- Choice: <shadcn/ui / Radix / plain Tailwind / other>
- Why: <the actual signals that drove this — component count, ownership preference, accessibility needs>

## Color tokens
| Token | Value | Usage | Contrast checked? |
|---|---|---|---|
| <e.g. primary> | <value> | <where it's used> | <pass/fail against what background> |
| success / warning / danger / info | <values> | <semantic usage> | <...> |

## Typography scale
| Token | Size / line-height | Usage |
|---|---|---|
| <e.g. heading-1> | <...> | <...> |

## Spacing / radius / shadow conventions
- <e.g. "Tailwind default spacing scale, no overrides">
- Radius: <convention for cards/buttons/inputs>
- Shadow: <convention, if any>

## Where this is written
- <tailwind.config.* theme extension / globals.css CSS variables / both>

## Existing pages not yet conforming (if applicable)
- <page>: <what doesn't match yet>

## Open questions / assumptions
- <...>
```

## Common ways this goes wrong

**Re-deciding the library or palette per feature instead of once project-wide.** This is the exact failure this skill exists to prevent — if every feature's `page-implementation` pass quietly picks its own button style, the project ends up with as many visual styles as features.

**Picking a palette without checking contrast.** A palette that looks fine on a design tool's color picker can fail WCAG AA contrast in practice, especially for button text on saturated brand colors — check the combinations that appear on every page, not just the ones that happened to get eyeballed.

**Treating this as a full brand identity exercise.** Logo design, illustration style, marketing-site polish, and a real design system with documented component variants are bigger asks than this skill covers — this is the minimum shared functional foundation, not a rebrand. If the user wants the bigger version, that's its own request.

**Skipping the inspection step and overwriting a design system the project already had.** Especially on an existing project, check what's already there before introducing a second, competing set of tokens or a second component library alongside the one already in use.

**Deciding tokens but never actually wiring them in.** If the output doc lists tokens but `tailwind.config.*`/`globals.css` still has the old ad hoc values, or `page-implementation` keeps hardcoding hex values instead of referencing the tokens, the decision exists on paper but not in the app — the point is the values components actually pull from, not just a documented intention.
