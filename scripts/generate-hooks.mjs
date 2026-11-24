import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { paths, requireRoots } from './roots.mjs';
import { deriveHooks } from './hooks.mjs';

/* Writes the component seams where the components live, because a `--brikka-button-bg` is the
 * button's name and not the design system's: the token package exports the graph and nothing
 * else. `--check` is what makes the artifact reviewable — a new seam shows up as a diff in the
 * pull request instead of entering silently, and this script is exercised by `scripts/hooks.test.mjs`
 * through `pnpm test:checks`, so the generator itself has a case that can fail. */

requireRoots('components', 'tokensSrc');

const sources = new Map();
const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.ts')) sources.set(path, readFileSync(path, 'utf8'));
  }
};
walk(paths.components);

const components = readdirSync(paths.components)
  .filter((entry) => statSync(join(paths.components, entry)).isDirectory())
  .filter((entry) => entry.startsWith('brikka-'));

const declared = [
  ...readFileSync(join(paths.tokensSrc, 'tokens.generated.ts'), 'utf8').matchAll(
    /'(--brikka-[a-z0-9-]+)'/g,
  ),
].map((match) => match[1]);

const hooks = deriveHooks({ sources, declared, components });
const next = `${JSON.stringify(hooks, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(paths.hooks, 'utf8');
  } catch {
    console.error(`hooks.json is missing: run \`pnpm generate:hooks\``);
    process.exit(1);
  }
  if (current !== next) {
    const before = new Set(current.match(/--brikka-[a-z0-9-]+/g) ?? []);
    const after = new Set(hooks);
    const added = [...after].filter((name) => !before.has(name));
    const removed = [...before].filter((name) => !after.has(name));
    if (added.length) console.error(`hooks.json is stale, missing: ${added.join(', ')}`);
    if (removed.length)
      console.error(`hooks.json is stale, naming what no component reads: ${removed.join(', ')}`);
    if (!added.length && !removed.length)
      console.error('hooks.json is stale: the order or the formatting moved');
    console.error('run `pnpm generate:hooks` and commit the result');
    process.exit(1);
  }
  console.log(`hooks ok: ${hooks.length} component seams, generated from ${sources.size} sources`);
} else {
  writeFileSync(paths.hooks, next);
  console.log(`hooks: ${hooks.length} names written to ${paths.hooks}`);
}
