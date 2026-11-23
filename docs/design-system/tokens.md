---
title: Tokens
description: The families Brikka declares, the roles a page paints with, and the names a consumer reads.
summary: The families Brikka declares, the roles a page paints with, the four axes, and the families it deliberately refuses.
---

# Tokens

Every name on this page is public, and renaming one is a breaking change: the graph is the contract
and the components are its first consumer. This page is the inventory — the families, and every role
with the decision it carries. A value is copied only where changing it is a system decision: a floor,
a breakpoint, the number of steps that fixes a family's shape. A value a preset may move stays in the
token source, and a page that copies one is wrong the first time the palette moves.

## Primitive families

| Family                | Carries                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `palette`             | 64 steps in 7 ramps (neutral, blue, green, yellow, orange, red, sky) plus white                                                                                                      |
| `space`               | 12 steps, `0` to `16`, each `calc(base * n)`                                                                                                                                         |
| `size`                | 32 / 40 / 48 / 64 for a subject: an avatar, a thumbnail, a preview — plus `target-min`, the absolute floor under a control's height, which is a floor and not a square               |
| `icon`                | 16 / 20 / 24, aligned to text                                                                                                                                                        |
| `radius`              | `none`, `sm`, `md`, `lg`, `xl`, `full` — the last is the pill                                                                                                                        |
| `border-width`        | 1px, and a 2px `thick`                                                                                                                                                               |
| `font`                | two stacks: `sans`, `mono`                                                                                                                                                           |
| `font-size`           | `xs` to `2xl`, every one multiplied by the type scale                                                                                                                                |
| `font-weight`         | `regular`, `medium`, `semibold`, `bold`                                                                                                                                              |
| `line-height`         | `tight`, `md`, `relaxed`                                                                                                                                                             |
| `letter-spacing`      | `tight`, `normal`                                                                                                                                                                    |
| `typography`          | six text styles: `heading-lg/md/sm`, `body-md/sm`, `label-md`                                                                                                                        |
| `measure`             | `sm` 45ch, `md` 65ch — how wide a line may get                                                                                                                                       |
| `duration` / `easing` | three durations, four curves                                                                                                                                                         |
| `transition`          | the one timing a component reads: duration and easing together                                                                                                                       |
| `opacity`             | one step, `disabled`: how much a whole control fades when it cannot be used                                                                                                          |
| `elevation`           | one tint, two shadows: `resting`, `floating`                                                                                                                                         |
| `breakpoint`          | five widths — `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 — exported as **numbers**, because `@media` cannot read a custom property                                         |
| `z-index`             | five layers: `base`, `dropdown`, `overlay`, `modal`, `toast` — and no component reads one: a dialog and a popover paint in the browser's top layer, which no `z-index` competes with |
| `scale`               | the two multipliers a host turns: `type`, floored by `type-floor`; `density`                                                                                                         |
| `control-height`      | computed from the density, floored at `size.target-min`                                                                                                                              |

Two of those families carry a floor, and the floors are not the same kind of thing. `control-height`
is floored in **pixels**: `size.target-min` is 24, the target 2.5.8 asks for, because that rule is
measured in CSS pixels and not in rhythm — neither the density nor a base a brand supplies can move
it. The type scale is floored in the **multiplier**, at `scale.type-floor` 0.875, because what it
protects is the distance between steps, and a floor in pixels would flatten the whole scale onto one
size at a degenerate setting.

Neither number is written inside the expression that computes it: each is a token, so each floor has
a name, an owner, and one place to change. A floor is not a knob either — a preset supplies the
multipliers, never the floors. And `density` carries no floor of its own: nothing else reads it
today, and a second reader would have to carry the same floor, or the escape it closes reopens.

## Semantic roles

A role is read **under the property it names** — `bg-*` under `background`, `text-*` under `color`,
`border-*` under a border colour, `focus-ring` under `outline` — and that is the rule
`pnpm check:tokens` enforces. One name resolves in both themes: the theme decides its value, and the
theme is never part of its name.

### Surfaces — `background`

| Role                        | What it paints                                                         |
| --------------------------- | ---------------------------------------------------------------------- |
| `bg-inverse`                | An element that inverts the surface it sits on.                        |
| `bg-surface`                | The default surface content is read against.                           |
| `bg-surface-muted`          | A surface that recedes behind content: inert areas, read-only regions. |
| `bg-surface-hover`          | A hoverable element's surface while a pointer is over it.              |
| `bg-surface-pressed`        | A pressed control's surface: one step past hover.                      |
| `bg-surface-strong`         | A filled control that carries the primary action.                      |
| `bg-surface-strong-hover`   | That control's surface while a pointer is over it.                     |
| `bg-surface-strong-pressed` | That control's surface while it is being pressed.                      |
| `bg-accent`                 | The accent surface that marks selection and emphasis.                  |
| `bg-accent-hover`           | The accent surface while a pointer is over it.                         |
| `bg-accent-pressed`         | The accent surface while it is being pressed.                          |
| `bg-selected`               | A row or an option that is chosen. Its ink is `text-on-selected`.      |
| `bg-scrim`                  | The wash under a floating surface that dims the page behind it.        |

### Inks — `color`

| Role               | What it says                                           | Read on                              |
| ------------------ | ------------------------------------------------------ | ------------------------------------ |
| `text-default`     | Body text, and every label not deliberately quieter.   | The page surfaces.                   |
| `text-muted`       | Supporting text: help, descriptions, secondary labels. | The page surfaces.                   |
| `text-inverse`     | Text read on `bg-inverse`.                             | `bg-inverse`.                        |
| `text-on-accent`   | Text and icons read on an accent or a strong surface.  | `bg-accent` and the strong surfaces. |
| `text-on-selected` | The text of a chosen row or option, on `bg-selected`.  | `bg-selected`.                       |
| `text-danger`      | Text that names a failure or a destructive action.     | The page surfaces.                   |

Every ink in this group is the text class, measured at 4.5:1 against the surface its row names, and a
surface of its own colour never takes the body ink: `bg-inverse` reads `text-inverse`, `bg-accent`
reads `text-on-accent`, and `bg-selected` reads `text-on-selected`. The page surfaces are
`bg-surface`, `bg-surface-muted`, and the hover and pressed steps of either.

Inactive text is measured as it renders rather than as a value: the whole control at
`opacity.disabled` over the surface behind it, and the ink composited against the control's
composited surface.

### Borders — `border-color`

| Role               | What it frames                                      | Reads as   |
| ------------------ | --------------------------------------------------- | ---------- |
| `border-default`   | The border of a control at rest.                    | A boundary |
| `border-strong`    | A control's boundary, one step harder than at rest. | A boundary |
| `border-subtle`    | The line between two things inside one object.      | A divider  |
| `border-on-accent` | Borders drawn on an accent or strong surface.       | A boundary |
| `border-danger`    | The border of an invalid control.                   | A boundary |

Every boundary is measured at 3:1 against the surface it sits on. `border-subtle` is not one: a
divider separates two things inside an object instead of framing it. The three status edges are not
boundaries either — their tint and their ink carry the state, which is what the status section
below describes.

### Focus — two rings, one indicator

| Role         | What it draws                                                                          |
| ------------ | -------------------------------------------------------------------------------------- |
| `focus-ring` | The opaque ring a focus indicator is drawn with.                                       |
| `focus-halo` | The translucent ring around it, which keeps it visible on a surface of its own colour. |

## The status vocabulary

A status is never one colour, because a status is always something read on something. Three
families carry the vocabulary, each with a surface, the ink read on it, and an edge that keeps the
tint coherent with its family.

A family leads its own names — `--brikka-success-bg`, `--brikka-success-text`,
`--brikka-success-border` — so a status reads as one vocabulary of three roles rather than as three
prefixes.

| Family    | Surface      | Ink            | Edge             |
| --------- | ------------ | -------------- | ---------------- |
| `success` | `success.bg` | `success.text` | `success.border` |
| `warning` | `warning.bg` | `warning.text` | `warning.border` |
| `info`    | `info.bg`    | `info.text`    | `info.border`    |

**`danger` is the fourth family, and it is two roles rather than three**: `text-danger` and
`border-danger`. A failure is an ink and an edge on a surface someone else chose, and a red surface
in the graph would be a wash no reader asked for. `text-danger` is the role a form reads, and the
required marker in a label is the same ink.

The ink of a status family is held to body contrast against its own tint **and** against the page
surface, because a status is read in both places; `text-danger`, which has no tint of its own, is
held against whatever surface it is read on. A status border is not held to the boundary rule: the
tint and the ink carry the state, and an edge chosen to stay in the family does not have to be
visible on its own. The thresholds are in [Principles](principles.md).

## What it refuses

**A second scale next to the space ramp.** An alias that only renamed a step would be a second name
for one decision, and it is not here. `size` and `icon` read the space steps and are not that: `size`
names a square for a subject and `icon` names an alignment, so each alias carries a decision the
primitive does not, and two scales for one dimension would drift until a gap is 4px off.
`size.target-min` is the one literal in that family, absolute on purpose.

**A second way to say a control is unavailable.** A disabled control is dimmed whole, at one
opacity, rather than repainted: one factor takes the ink, the edge and the surface down together, and
the alternative is three roles — a surface, an ink and a border — each of which has to stay true in
two themes for a state a component can already express with one property. `opacity.disabled` is that
factor. Material says the same thing with an overlay alpha; the reason it is one name and not a
scale is that the graph needs one answer, not a ladder to choose from.

**Gradient and stroke-style tokens.** Nothing here paints a gradient, and a stroke style is a canvas
concept.

**A data-visualisation ramp.** A chart palette needs colour-blind safe ramps, which is a different
problem from reusing the status families.

`orange` stays without a role on purpose: nine steps exist, no role references them, and a preset may
claim the family — cheaper than deleting it and adding it back.

## Naming

- `--brikka-` and then the path, kebab-cased: `bg.surface-muted` is `--brikka-bg-surface-muted`.
- A status family is the exception: its name leads with the family, `--brikka-success-bg` rather
  than `--brikka-bg-success`, because one vocabulary of three roles hangs off the family. The
  property rule cannot check these three, since it reads the property off the name's first segment
  and a status name's first segment is the family.
- The theme is not part of a name. A role is one name in both themes, and the theme decides its
  value.
- A token read carries no literal fallback. The only legal default is the variable half of a hook,
  `var(--brikka-button-bg, var(--brikka-button-variant-bg))`.
- A hook is a component's own name for one detail — `--brikka-button-bg` is the button's background
  and nothing else. Setting one adjusts a single component; it does not restate what a role means,
  and a page that sets the same hook twice is asking for a role.

## What consumes this

A page loads `@brikka-ui/tokens/theme.css` — one file, both themes, all layers. `theme.css` is
`tokens.css` plus the two rules that belong to the document rather than to the graph: `color-scheme`,
and the replacement that retimes every transition to `1ms` under `prefers-reduced-motion: reduce`.

A layer is never imported on its own. `tokens.css` composes them, and `typography.css` computes from
a scale that `base.css` declares, so a page that links one file in isolation gets an unresolved
`var()`.

The graph is also a source for tools: the palette for Figma, the breakpoints as numbers for a media
query, and the whole thing as a design system a host can paint with without registering a single
element.
