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

## Primitive and composite families

| Family                | Carries                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `palette`             | 64 steps in 7 ramps (neutral, blue, green, yellow, orange, red, sky) plus white                                                                                                           |
| `space`               | 12 steps, `0` to `16`, each `calc(base * n)`                                                                                                                                              |
| `size`                | 32 / 40 / 48 / 64 for a subject: an avatar, a thumbnail, a preview — plus `target-min`, the absolute floor under a control's height, which is a floor and not a square                    |
| `icon`                | 16 / 20 / 24, aligned to text                                                                                                                                                             |
| `radius`              | `none`, `sm`, `md`, `lg`, `xl`, `full` — the last is the pill                                                                                                                             |
| `border-width`        | 1px, and `border-width-thick` 2px                                                                                                                                                         |
| `focus-ring-width`    | 2px — the ring's own thickness, a value rather than a role                                                                                                                                |
| `focus-ring-offset`   | 1px — the gap the ring leaves around the control it marks                                                                                                                                 |
| `font`                | two stacks: `sans`, `mono`                                                                                                                                                                |
| `font-size`           | `xs` to `2xl`, every one multiplied by the type scale                                                                                                                                     |
| `font-weight`         | `regular`, `medium`, `semibold`, `bold`                                                                                                                                                   |
| `line-height`         | `tight`, `md`, `relaxed`                                                                                                                                                                  |
| `letter-spacing`      | `tight`, `normal`                                                                                                                                                                         |
| `typography`          | six text styles: `heading-lg/md/sm`, `body-md/sm`, `label-md`                                                                                                                             |
| `measure`             | `sm` 45ch, `md` 65ch — how wide a line may get                                                                                                                                            |
| `duration` / `easing` | three durations, four curves                                                                                                                                                              |
| `transition`          | the one timing a component reads: duration and easing together                                                                                                                            |
| `opacity`             | one step, `disabled`: how much a whole control fades when it cannot be used                                                                                                               |
| `elevation`           | one tint, two shadows: `resting`, `floating`                                                                                                                                              |
| `container`           | five max widths, one per breakpoint: how wide a content column may run. A container mirrors its breakpoint on purpose and a suite asserts the pair, so moving one without the other fails |
| `breakpoint`          | five widths — `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 — exported as **numbers**, because `@media` cannot read a custom property                                              |
| `z-index`             | five layers: `base`, `dropdown`, `overlay`, `modal`, `toast` — and no component reads one: a dialog and a popover paint in the browser's top layer, which no `z-index` competes with      |
| `scale`               | the two multipliers a host turns: `type`, floored by `type-floor`; `density`                                                                                                              |
| `control`             | what every control shares: `height`, computed from the density and floored at `size.target-min`, and `disabled-opacity`, the factor every unavailable control is dimmed at                |

Two of those rows are families of **composites** rather than primitives: `typography` and
`transition`, and with them the two `elevation` shadows. A composite carries no value of its own — it is the one
name for primitives a page would otherwise choose one at a time, so a page that picks a `font-size`
by hand has to decide the weight, the leading and the tracking as well, and a page that names
`body-md` has decided once.

Two of those families carry a floor, and the floors are not the same kind of thing. `control.height`
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
| `text-error`       | Text that names a failure or a destructive action.     | The page surfaces.                   |

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
| `border-error`     | The border of an invalid control.                   | A boundary |

Every boundary is measured at 3:1 against the surface it sits on. `border-subtle` is not one: a
divider separates two things inside an object instead of framing it. The three status edges are not
boundaries either — their tint and their ink carry the state, which is what the status section
below describes.

### Depth — the one role that is not a surface, an ink or an edge

| Role              | What it paints                                                                |
| ----------------- | ----------------------------------------------------------------------------- |
| `elevation-color` | The tint both shadows are painted with. Denser in the dark theme, on purpose. |

It is a role because one alpha cannot lift both pages. Over white, eighteen percent of the darkest
neutral is a clear edge; over a near-black surface the same value composites to within a level of
what it sits on, so a shadow declared once would be visible in one theme and absent in the other. The
tint is therefore declared per theme like every other role, and the two shadows read it.

### Focus — two rings, one indicator

The ring is drawn with two primitives and one role: `focus-ring-width` for its thickness,
`focus-ring-offset` for the gap it leaves around the control, and `focus-ring` for its colour — the
one part a theme decides. A component reads all three; a page that restyles the indicator overrides
the colour and keeps the geometry.

| Role         | What it draws                                                                          |
| ------------ | -------------------------------------------------------------------------------------- |
| `focus-ring` | The opaque ring a focus indicator is drawn with.                                       |
| `focus-halo` | The translucent ring around it, which keeps it visible on a surface of its own colour. |

## The status vocabulary

A status is never one colour, because a status is always something read on something. Three
families carry the vocabulary, each with a surface, the ink read on it, and an edge that keeps the
tint coherent with its family.

A family is a vocabulary, not a namespace: `--brikka-bg-success`, `--brikka-text-success` and
`--brikka-border-success` are three roles that share a family, and each one leads with the property
it is read under like every other role. The property rule therefore covers all nine, and a status
read under the wrong property is a failure the check can see.

| Family    | Surface      | Ink            | Edge             |
| --------- | ------------ | -------------- | ---------------- |
| `success` | `bg-success` | `text-success` | `border-success` |
| `warning` | `bg-warning` | `text-warning` | `border-warning` |
| `info`    | `bg-info`    | `text-info`    | `border-info`    |

**`error` is the fourth family, and it is two roles rather than three**: `text-error` and
`border-error`. A failure is an ink and an edge on a surface someone else chose, and a red surface
in the graph would be a wash no reader asked for. `text-error` is the role a form reads, and the
required marker in a label is the same ink.

The ink of a status family is held to body contrast against its own tint **and** against the page
surface, because a status is read in both places; `text-error`, which has no tint of its own, is
held against whatever surface it is read on. A status border is not held to the boundary rule: the
tint and the ink carry the state, and an edge chosen to stay in the family does not have to be
visible on its own. The thresholds are in [Accessibility](accessibility.md).

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
factor, and `--brikka-control-disabled-opacity` is where the graph says so: it holds no value,
defaults to the primitive, and every control reads it, so a component that needs its own seam
declares a hook over that one name instead of inventing a second factor. Material says the same thing with an overlay alpha; the reason it is one name
and not a scale is that the graph needs one answer, not a ladder to choose from.

**Gradient and stroke-style tokens.** Nothing here paints a gradient, and a stroke style is a canvas
concept.

**A data-visualisation ramp.** A chart palette needs colour-blind safe ramps, which is a different
problem from reusing the status families.

Most ramps carry no role today: thirteen exist and the roles read four of them. That is the point of a
reference ramp rather than a usage list — a step nothing reads is the step the next component or the
next theme needs, and a preset may claim a whole family. Pruning the palette to what is painted today
would turn every new component into a palette edit.

## Naming

- `--brikka-` and then the path, kebab-cased: `bg.surface-muted` is `--brikka-bg-surface-muted`,
  and a status follows the same rule: `bg.success` is `--brikka-bg-success`. The family is a
  vocabulary a reader recognizes, never a prefix that displaces the property.
- The theme is not part of a name. A role is one name in both themes, and the theme decides its
  value.
- A token read carries no literal fallback. The only legal default is the variable half of a hook,
  `var(--brikka-button-bg, var(--brikka-button-variant-bg))`.
- A hook is a component's own name for one detail — `--brikka-button-bg` is the button's background
  and nothing else. Setting one adjusts a single component; it does not restate what a role means,
  and a page that sets the same hook twice is asking for a role. Every hook a component reads is
  listed in that package's own `hooks.json`, derived from its sources and checked for freshness, so a
  seam cannot exist only in someone's memory of it.

## What consumes this

A page loads `@brikka-ui/tokens/theme.css` — one file, both themes, all layers. `theme.css` is
`tokens.css` plus the two rules that belong to the document rather than to the graph: `color-scheme`,
and the replacement that retimes every transition to `1ms` under `prefers-reduced-motion: reduce`.

A layer is never imported on its own. `tokens.css` composes them, and `typography.css` computes from
a scale that `base.css` declares, so a page that links one file in isolation gets an unresolved
`var()`.

A document that has chosen no theme is light. Following the operating system is one more import —
`@brikka-ui/tokens/dark-by-preference.css` — because a page that flips with the machine of whoever
is reading is a decision the page makes, not one the graph makes for it. An explicit `data-theme`
wins over the preference either way.

The package exports two things and nothing else: `tokens`, the map from a readable key to the custom
property that carries it, and `breakpoints`, five numbers, because `@media` cannot read a custom
property. A hook is not in either of them — `--brikka-button-bg` is the button's name, so the
components keep their own inventory of the seams they expose, generated from their sources. The
design system names no component, which is the same rule that says a component never reads a palette
step, seen from the other side.

The graph is also a source for tools: the palette for Figma, the breakpoints as numbers for a media
query, and the whole thing as a design system a host can paint with without registering a single
element.
