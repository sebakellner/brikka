/* How a token is shown, and how the inventory is ordered. Pure functions over the names the
 * generated map declares, so the page cannot hand-write a list that goes stale: the only input
 * is `Object.values(tokens)`.
 *
 * The order is a decision, not a sort. Two levels say what kind of name a token is — a reference
 * to a value, a decision a page composes with, or a component's own seam — and inside each level
 * the colour families come first, because that is the half that carries a theme. A rule that
 * matches nothing is not silently dropped: the name lands in `unclassified` and the page says so,
 * which is how a family added later announces itself instead of vanishing. */

const PREFIX = '--brikka-';

export type SampleKind =
  | 'fill'
  | 'ink'
  | 'rule'
  | 'ring'
  | 'size'
  | 'weight'
  | 'leading'
  | 'tracking'
  | 'face'
  | 'measure'
  | 'shorthand'
  | 'swatch'
  | 'bar'
  | 'radius'
  | 'shadow'
  | 'opacity'
  | 'value';

/** The leading segment of the custom property name: `--brikka-bg-accent` → `bg`. */
export function familyOf(name: string): string {
  if (!name.startsWith(PREFIX)) {
    throw new Error(`${name} is not a ${PREFIX}* custom property`);
  }
  const [family] = name.slice(PREFIX.length).split('-');
  return family;
}

/** How one token can prove, on its own, that its value resolves. */
export function kindFor(name: string): SampleKind {
  const rest = name.startsWith(PREFIX) ? name.slice(PREFIX.length) : name;
  const [head, second, third] = rest.split('-');

  switch (head) {
    case 'palette':
      return 'swatch';
    case 'bg':
      return 'fill';
    case 'text':
      return 'ink';
    case 'border':
      return second === 'width' ? 'value' : 'rule';
    case 'success':
    case 'warning':
    case 'info':
      if (second === 'bg') return 'fill';
      if (second === 'text') return 'ink';
      if (second === 'border') return 'rule';
      return 'value';
    case 'focus':
      /* The ring's geometry are lengths; the two colours are drawn as a ring. */
      return second === 'ring' && (third === 'width' || third === 'offset') ? 'value' : 'ring';
    case 'font':
      if (second === 'size') return 'size';
      if (second === 'weight') return 'weight';
      return 'face';
    case 'line':
      return 'leading';
    case 'letter':
      return 'tracking';
    case 'measure':
      return 'measure';
    case 'typography':
      return 'shorthand';
    case 'space':
    case 'icon':
      return 'bar';
    case 'size':
      return second === 'target' ? 'value' : 'bar';
    case 'radius':
      return 'radius';
    case 'elevation':
      return second === 'color' ? 'swatch' : 'shadow';
    case 'opacity':
      return 'opacity';
    case 'container':
    case 'control':
    case 'transition':
    case 'duration':
    case 'easing':
    case 'z':
    case 'scale':
    case 'breakpoint':
      return 'value';
    default:
      return kindBySuffix(rest);
  }
}

/* Component families (a hook, a control's geometry) are not one kind of value: the last
 * segment says what the token is, and that is what the sample draws. */
function kindBySuffix(rest: string): SampleKind {
  if (/(^|-)bg(-hover)?$/.test(rest)) return 'fill';
  if (/(^|-)fg(-hover)?$/.test(rest)) return 'ink';
  if (/(^|-)border(-hover)?$/.test(rest)) return 'rule';
  if (/radius$/.test(rest)) return 'radius';
  if (/opacity$/.test(rest)) return 'opacity';
  if (/(size|width|height|length|gap)$/.test(rest)) return 'bar';
  return 'value';
}

export type Level = 'primitive' | 'decision';

/** A decision is a name a page composes with. Two kinds, and the page says which. */
export type DecisionKind = 'role' | 'composite';

export interface InventoryGroup {
  id: string;
  title: string;
  caption: string;
  kind?: DecisionKind;
  names: string[];
}

export interface InventoryLevel {
  id: Level;
  title: string;
  caption: string;
  groups: InventoryGroup[];
}

interface Rule {
  id: string;
  level: Level;
  title: string;
  caption: string;
  kind?: DecisionKind;
  test: RegExp;
}

/* The order is read top to bottom and the first rule that matches owns the name, so the ring's
 * geometry must be claimed before the ring's colours. `border` splits the same way: two widths are
 * primitives, five edges are roles. `font` and `elevation` and `motion` split too — a face or a
 * duration is a value, a text style or a shadow is a decision built from values. */
const RULES: Rule[] = [
  {
    id: 'colour-ramps',
    level: 'primitive',
    title: 'Colour ramps',
    caption:
      'The palette: one reference ramp per colour, named by where a step sits, never by use.',
    test: /^--brikka-palette-/,
  },
  {
    id: 'spacing',
    level: 'primitive',
    title: 'Spacing',
    caption: 'One base, and every step computed from it.',
    test: /^--brikka-space-/,
  },
  {
    id: 'sizes',
    level: 'primitive',
    title: 'Sizes',
    caption: 'A square for a subject and an icon’s alignment, plus the floor under a control.',
    test: /^--brikka-(size|icon)-/,
  },
  {
    id: 'containers',
    level: 'primitive',
    title: 'Container',
    caption:
      'The widest a content column runs, one per breakpoint — and each is asserted against the breakpoint it mirrors.',
    test: /^--brikka-container-/,
  },
  {
    id: 'type-values',
    level: 'primitive',
    title: 'Type values',
    caption:
      'Faces, sizes, weights, leading, tracking and a measure — the parts a text style is made of.',
    test: /^--brikka-(font|line|letter|measure)-/,
  },
  {
    id: 'text-styles',
    level: 'decision',
    title: 'Text styles',
    caption: 'The six composites: size, weight, leading and tracking chosen together, never apart.',
    kind: 'composite',
    test: /^--brikka-typography-/,
  },
  {
    id: 'border-widths',
    level: 'primitive',
    title: 'Border widths',
    caption: 'How thick a line is, before anything decides what colour it takes.',
    test: /^--brikka-border-width/,
  },
  {
    id: 'radius',
    level: 'primitive',
    title: 'Radius',
    caption: 'The corner scale, each step derived from the space ramp.',
    test: /^--brikka-radius-/,
  },
  {
    id: 'focus-geometry',
    level: 'primitive',
    title: 'Focus geometry',
    caption: 'The ring’s thickness and the gap it leaves — values, not decisions.',
    test: /^--brikka-focus-ring-(width|offset)$/,
  },
  {
    id: 'depth-tint',
    level: 'decision',
    title: 'Depth tint',
    caption:
      'The tint both shadows are painted with — denser in the dark theme, because the same alpha over a near-black page is the same colour twice.',
    kind: 'role',
    test: /^--brikka-elevation-color$/,
  },
  {
    id: 'depth',
    level: 'decision',
    title: 'Depth',
    caption: 'Two composites: a surface that rests on the page, and one that floats above it.',
    kind: 'composite',
    test: /^--brikka-elevation-(resting|floating)$/,
  },
  {
    id: 'opacity',
    level: 'primitive',
    title: 'Opacity',
    caption: 'The one factor that dims a control that cannot be used.',
    test: /^--brikka-opacity-/,
  },
  {
    id: 'motion-values',
    level: 'primitive',
    title: 'Motion values',
    caption: 'Three durations and four curves.',
    test: /^--brikka-(duration|easing)-/,
  },
  {
    id: 'motion',
    level: 'decision',
    title: 'Motion',
    caption: 'The one composite a component reads: a duration and a curve, together or not at all.',
    kind: 'composite',
    test: /^--brikka-transition$/,
  },
  {
    id: 'stacking',
    level: 'primitive',
    title: 'Stacking',
    caption: 'Five named layers, so no component invents its position.',
    test: /^--brikka-z-index-/,
  },
  {
    id: 'scales',
    level: 'primitive',
    title: 'Configuration scales',
    caption: 'The multipliers a host turns, and the floors under them.',
    test: /^--brikka-scale-/,
  },
  {
    id: 'control',
    level: 'primitive',
    title: 'Control',
    caption: 'What every control shares: its height, and the factor it is dimmed at.',
    test: /^--brikka-control-/,
  },
  {
    id: 'surfaces',
    level: 'decision',
    title: 'Surfaces',
    caption: 'What an element sits on, read under `background`.',
    kind: 'role',
    test: /^--brikka-bg-(?!(?:success$|warning$|info$))/,
  },
  {
    id: 'inks',
    level: 'decision',
    title: 'Inks',
    caption: 'What text is painted with, read under `color`.',
    kind: 'role',
    test: /^--brikka-text-(?!(?:success$|warning$|info$))/,
  },
  {
    id: 'edges',
    level: 'decision',
    title: 'Edges',
    caption: 'The borders that frame, and the divider that does not.',
    kind: 'role',
    test: /^--brikka-border-(default|strong|subtle|on-accent|error)$/,
  },
  {
    id: 'status',
    level: 'decision',
    title: 'Status',
    caption: 'Three families, each with its surface, its ink and its edge.',
    kind: 'role',
    test: /^--brikka-(bg|text|border)-(success|warning|info)$/,
  },
  {
    id: 'focus-colours',
    level: 'decision',
    title: 'Focus',
    caption: 'The ring a keyboard user follows, and the halo behind it.',
    kind: 'role',
    test: /^--brikka-focus-(ring|halo)$/,
  },
];

const LEVELS: { id: Level; title: string; caption: string }[] = [
  {
    id: 'primitive',
    title: 'Primitives',
    caption: 'A reference to a value. Named for where it sits, never for what it is used for.',
  },
  {
    id: 'decision',
    title: 'Decisions',
    caption:
      'A name a page composes with, and what a page composes with is the decision. Two kinds: a role resolves per theme, a composite gathers primitives that are always chosen together. Neither is a value you look up — that is the point.',
  },
];

export interface Inventory {
  levels: InventoryLevel[];
  unclassified: string[];
}

/** The names, ordered into levels and groups. Names keep the order the map declares them in. */
export function planInventory(names: readonly string[]): Inventory {
  const groups = new Map<string, string[]>();
  const unclassified: string[] = [];

  for (const name of names) {
    const rule = RULES.find((candidate) => candidate.test.test(name));
    if (!rule) {
      unclassified.push(name);
      continue;
    }
    const bucket = groups.get(rule.id);
    if (bucket) {
      if (!bucket.includes(name)) bucket.push(name);
    } else {
      groups.set(rule.id, [name]);
    }
  }

  const levels = LEVELS.map((level) => ({
    ...level,
    groups: RULES.filter((rule) => rule.level === level.id)
      .map((rule) => ({
        id: rule.id,
        title: rule.title,
        caption: rule.caption,
        kind: rule.kind,
        names: groups.get(rule.id) ?? [],
      }))
      .filter((group) => group.names.length > 0),
  })).filter((level) => level.groups.length > 0);

  return { levels, unclassified };
}

export interface Ramp {
  name: string;
  names: string[];
}

/** The palette split into its ramps, in the order the map declares them: one row each. */
export function rampsOf(names: readonly string[]): Ramp[] {
  const ramps = new Map<string, string[]>();
  for (const name of names) {
    const [, ramp] = name.slice(PREFIX.length).split('-');
    const bucket = ramps.get(ramp);
    if (bucket) {
      if (!bucket.includes(name)) bucket.push(name);
    } else {
      ramps.set(ramp, [name]);
    }
  }
  return [...ramps].map(([name, rampNames]) => ({ name, names: rampNames }));
}

/* The colour groups read as a palette: chips side by side, the name underneath. Everything else
 * needs a line of its own, because its sample is text or a length that only means something next
 * to the token it came from. */
const PALETTE_GROUPS = new Set([
  'colour-ramps',
  'depth-tint',
  'surfaces',
  'inks',
  'edges',
  'status',
  'focus-colours',
]);

/** Whether a group is drawn as a palette of chips rather than a row per token. */
export function isPalette(group: InventoryGroup): boolean {
  return PALETTE_GROUPS.has(group.id);
}

/* An ink is only judgeable on the surface it is read on, and the reference says which one for each
 * row. A chip on the page's own surface hides exactly the pair the role exists for. */
export function inkSurfaceOf(name: string): string {
  const rest = name.startsWith(PREFIX) ? name.slice(PREFIX.length) : name;
  const status = /^(success|warning|info)-text$/.exec(rest);
  if (status) return `--brikka-${status[1]}-bg`;
  if (rest === 'text-inverse') return '--brikka-bg-inverse';
  if (rest === 'text-on-accent') return '--brikka-bg-accent';
  if (rest === 'text-on-selected') return '--brikka-bg-selected';
  return '--brikka-bg-surface';
}
