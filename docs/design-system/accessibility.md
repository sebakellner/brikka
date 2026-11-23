---
title: Accessibility
description: What the token graph guarantees about accessibility, what it cannot, and how each guarantee is held today.
summary: The scope of the guarantee, the three contrast classes, focus, target size, text, motion, forced colours, and what checks each one today.
---

# Accessibility

This page is the home of the invariant stated in [Principles](principles.md): no axis may produce a
result below WCAG 2.2 AA. Principles keeps the invariant; this page keeps the thresholds, the floors
and the way each one is checked, so a fact lives in one file.

## What the tokens can guarantee, and what they cannot

Reading "WCAG 2.2 AA" and concluding that using the tokens is enough is the expensive
misunderstanding, so the scope comes first.

| The graph can hold                             | The graph cannot hold                             |
| ---------------------------------------------- | ------------------------------------------------- |
| Contrast of every pair a role forms            | Semantic HTML: headings, landmarks, lists, labels |
| A visible, un-hideable focus indicator         | Keyboard order and keyboard operability           |
| A minimum target size                          | Accessible names, roles and ARIA                  |
| Text that survives scaling and spacing changes | Focus management in dialogs and popovers          |
| Reduced motion                                 | Error identification and form instructions        |
| State that never depends on colour alone       | Content: alternative text, plain language         |

The left column is a property of values, so a token can carry it. The right column is a property of
markup and behaviour, which belongs to the page and, later, to the components. Until components
exist, this page makes no claim about the right column.

## Contrast is measured, not assumed

Three classes of pair are measured, and each carries its own threshold:

- **Text on its surface**, at 4.5:1 (SC 1.4.3).
- **Everything that is not text** — a control's edge, a focus ring, a boundary that carries meaning —
  at 3:1 (SC 1.4.11).
- **Inactive text**, at a floor of 3:1. WCAG lets an inactive component go unmeasured; the system
  does not, because a label nobody can read has stopped saying what the control was.

Three rules make the measurement mean something:

1. **Pairs are derived from roles, not listed.** Every role that is read as an ink is paired with the
   surfaces it is read on. A hand-kept list goes stale, and the role added next quarter escapes it.
2. **Pairs are measured on the composed ramp**: a brand's values over the defaults, never the factory
   ramp alone, in each theme.
3. **A disabled control is measured as the user sees it.** The control is dimmed at one opacity and
   its ink is a role chosen for that state, so ink and surface both move toward the page. The 3:1
   floor applies to the composited result, not to the roles at full opacity. A control whose own
   surface is the page surface clears it that way; a filled or accent control does not clear it yet,
   and closing that is a decision about how a filled disabled control is painted.

A status is held to body contrast against its own tint and against the page surface, because it is
read in both places. A status border is not held to the boundary rule: tint and ink carry the state.

## Colour is never the only carrier

A state is never told by hue alone (SC 1.4.1). Error, selection and status always arrive with a
second signal: text, an icon, a border weight, a position. This is the same principle that says a
state is one factor, not three colours, seen from the reader's side.

## Focus

Focus is drawn twice: an opaque ring and a translucent halo, so the indicator survives a surface of
its own colour (SC 2.4.7, SC 1.4.11).

- The indicator is an `outline`, not a `box-shadow`. Outlines persist in forced-colours mode; shadows
  do not.
- Focus must not be hidden by another element (SC 2.4.11). This is where the stacking vocabulary
  matters: a layer that can cover a focused control is a defect in the order, not in the indicator.
- No component removes the indicator without replacing it with one that passes the same 3:1.

## Target size

The smallest target WCAG 2.2 AA accepts is 24 by 24 CSS pixels (SC 2.5.8).

- `size.target-min` holds that number, in pixels, on purpose. The rule is measured in CSS pixels and
  not in rhythm, so neither the density nor a base a brand supplies can move it.
- A control's height is computed from the density and floored at `size.target-min`. At the lowest
  density the system allows, a control is exactly as tall as a target needs and no shorter.
- 24 px is the compliance floor, not the comfortable size. The default control is taller, and a host
  that serves touch input should not run at the floor.

## Text and scale

- **Resizing and reflow** (SC 1.4.4, SC 1.4.10): text sizes are relative, and layout reflows to a
  narrow viewport without horizontal scrolling. A fixed pixel size set by hand opts that element out.
- **Text spacing** (SC 1.4.12): a reader may raise line height, letter and word spacing without losing
  content. For that, a control's height is a minimum, never a fixed height: it is read under
  `min-block-size` or `min-height`, so a label that grows pushes the control instead of being clipped.
- **The type scale floor is 0.875**, and it is a legibility decision, not a WCAG threshold: SC 1.4.4
  governs zoom, not size. The floor sits where the smallest step stops being comfortable to read. It
  is held in the multiplier, not in pixels, because a pixel floor would flatten the scale onto one
  size at a degenerate setting.
- **Measure**: a line is kept to about 65 characters. It is a readability criterion rather than a
  conformance one.

## Motion

- Every component reads one timing, and under `prefers-reduced-motion: reduce` that timing becomes
  1 ms. It is 1 ms and not zero because a zero duration never fires `transitionend`, and a consumer
  listening for it would wait forever.
- A speed that starts to be read arrives as its own composite and is retimed in the same place, so
  reduced motion keeps covering it.
- A change happens because the reader caused it. Motion never runs unprompted to attract attention.

## Forced colours

In forced-colours mode the browser replaces colours and removes shadows.

- **Focus survives** because it is an outline.
- **Elevation disappears**, and that is acceptable: elevation never carries information alone.
  Whatever a shadow communicates must also be said by a border, a position or a role.
- **Boundaries that carry meaning are borders**, not background differences, so they survive the
  replacement.

## Configuration cannot lower the floor

| Axis           | What could go wrong                 | What holds it                                    |
| -------------- | ----------------------------------- | ------------------------------------------------ |
| Brand ramp     | A pair falls below 4.5:1 or 3:1     | Measured on the composed ramp; review today      |
| Density        | A target shrinks below 24 px        | `size.target-min`, held in the computation       |
| Type scale     | Text shrinks below readable         | Floor in the multiplier, held in the computation |
| Reduced motion | A component writes its own duration | One shared timing; review                        |
| Theme          | A pair fails in one theme only      | Measured per theme                               |

A configuration that can breach a floor is a defect of the system, not a choice of whoever configured
it.

## How each guarantee is held today

A rule nobody can check is a wish, so this table says plainly what is checked and what is not.

| Guarantee                               | Held by                                                     | State   |
| --------------------------------------- | ----------------------------------------------------------- | ------- |
| Target-size floor                       | Test suite                                                  | Checked |
| Type-scale floor                        | Test suite                                                  | Checked |
| Control height is a minimum             | Review; a check on the property it is read under is planned | Review  |
| Contrast of every role pair             | Measured by hand                                            | Review  |
| Contrast on a brand's composed ramp     | Not automated                                               | Review  |
| Focus indicator survives forced colours | Not tested                                                  | Review  |
| Focus not obscured (SC 2.4.11)          | Not tested                                                  | Review  |
| No colour-only state                    | Review                                                      | Review  |

Where a row says review, the guard is held by a person reading the change, and an exception is argued
in a new architecture decision record rather than granted in passing.

## Open decisions

1. **A contrast gate as a browser test.** The composed ramp contains `color-mix` and `oklch` values
   that only a browser resolves, so the gate should read computed values in the browser, per theme,
   and fail below the thresholds above. Pairing must come from the roles themselves; that needs an
   explicit convention for which ink is read on which surface.
2. **A forced-colours test** that focus remains visible and that no state depends on a shadow.
3. **A check on the property a control height is read under**, so a fixed height is refused the way a
   role read under the wrong property is.
4. **Measured numbers in prose go stale.** When the gate exists, any figure quoted for a pair should
   come from it rather than from a hand measurement.

## What this document does not govern

Semantics, keyboard behaviour, names, ARIA and focus management belong to the markup and to the
components, and are deferred until components exist. This page governs the graph: what its values
guarantee and what keeps them from being configured below the line.

## Further reading

WCAG 2.2, in particular SC 1.4.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.4.7, 2.4.11 and 2.5.8; the
W3C Understanding documents for each; the WAI-ARIA Authoring Practices for the part this page does not
cover.
