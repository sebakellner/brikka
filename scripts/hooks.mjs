/* A hook is a component's own seam: a `--brikka-*` name a component reads that the graph does
 * not declare. Deriving it from the component sources is the only way to keep the list true —
 * a hand-kept list of 41 names drifted into twenty that no component exercised, and nothing
 * noticed, because a stale entry is exactly what no check can see.
 *
 * The rule is subtraction, not parsing: every `--brikka-*` name appearing in a component source,
 * minus every name the graph declares. The first version of this looked for `var(x, fallback)`
 * and got four of forty-one wrong, because `var()` nests — the CSS is not a grammar a regular
 * expression should be asked to read.
 *
 * What subtraction cannot do is catch a typo *inside* a component: `--brikka-button-bgg` would be
 * derived as a hook like any other. So it keeps one guard, and only one: the name's first segment
 * after the prefix has to be a component that exists. That kills `--brikka-buton-bg` — the typo
 * that names a component nobody has — and it is the strongest rule available without a second
 * source of truth, which is what a hand-kept list was. */

const PREFIX = '--brikka-';
const NAME = /--brikka-[a-z0-9-]+/g;

/**
 * @param {object} input
 * @param {Map<string, string>} input.sources  component file path → its text
 * @param {Iterable<string>} input.declared    every name the token graph declares
 * @param {Iterable<string>} input.components  component directory names, `brikka-button` style
 * @returns {string[]} the hook names, sorted, without duplicates
 */
export function deriveHooks({ sources, declared, components }) {
  const known = new Set(declared);
  /* Longest first, because a component name is more than one word: `radio-group-item-*` belongs
   * to `brikka-radio-group`, and matching the first segment alone would look for `brikka-radio`. */
  const owned = [...components].sort((a, b) => b.length - a.length);
  const hooks = new Map();

  for (const [file, text] of sources) {
    for (const [name] of text.matchAll(NAME)) {
      if (known.has(name)) continue;
      const owner = owned.find((component) =>
        name.startsWith(`${PREFIX}${component.replace(/^brikka-/, '')}-`),
      );
      if (!owner) {
        throw new Error(
          `${file}: \`${name}\` is neither a token the graph declares nor a seam of a component that exists ` +
            `(no component in components/ gives it a name). A hook is named for the component it belongs to.`,
        );
      }
      const where = hooks.get(name);
      if (where) {
        if (!where.includes(file)) where.push(file);
      } else {
        hooks.set(name, [file]);
      }
    }
  }

  return [...hooks.keys()].sort();
}
