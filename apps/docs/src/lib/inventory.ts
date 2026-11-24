/* How a token is shown, and how the inventory is grouped. Pure functions over the names
 * the generated map declares, so the page cannot hand-write a list that goes stale: the
 * only input is `Object.values(tokens)`. */

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

export interface TokenGroup {
  family: string;
  names: string[];
}

export type GroupLayout = 'palette' | 'rows';

/* A colour family is read the way a colour reference is read: every chip side by side, the
 * name underneath. Everything else needs a line of its own, because its sample is text or a
 * length that only means something next to the token it came from. */
const PALETTE_FAMILIES = new Set([
  'palette',
  'bg',
  'border',
  'success',
  'warning',
  'info',
  'focus',
]);

export function layoutFor(family: string): GroupLayout {
  return PALETTE_FAMILIES.has(family) ? 'palette' : 'rows';
}

/* Typography first, then the colour roles, then the scale, then the component families:
 * the order the listing is read in. Anything the map grows later joins alphabetically at
 * the end instead of disappearing. */
const ORDER = [
  'font',
  'line',
  'letter',
  'typography',
  'measure',
  'bg',
  'text',
  'border',
  'success',
  'warning',
  'info',
  'focus',
  'palette',
  'space',
  'radius',
  'size',
  'icon',
  'elevation',
  'opacity',
  'control',
  'transition',
  'duration',
  'easing',
  'z',
  'scale',
  'breakpoint',
];

/** One entry per leading segment, in reading order, holding every name exactly once. */
export function groupTokens(names: readonly string[]): TokenGroup[] {
  const byFamily = new Map<string, string[]>();
  for (const name of names) {
    const family = familyOf(name);
    const bucket = byFamily.get(family);
    if (bucket) {
      if (!bucket.includes(name)) bucket.push(name);
    } else {
      byFamily.set(family, [name]);
    }
  }

  const rank = (family: string) => {
    const index = ORDER.indexOf(family);
    return index === -1 ? ORDER.length : index;
  };

  return [...byFamily.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([family, groupNames]) => ({ family, names: groupNames }));
}
