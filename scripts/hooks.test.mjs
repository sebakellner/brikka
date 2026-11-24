import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveHooks } from './hooks.mjs';

/* The hook list used to be a literal in the token package's Style Dictionary config, and it
 * drifted the way a hand-kept list does: of 41 names, twenty were exercised by nothing. It is
 * derived now, which moves the risk — a generator that never fails is the gate this repository
 * has already been burned by. These cases are what can fail. */

const here = dirname(fileURLToPath(import.meta.url));
const generate = join(here, 'generate-hooks.mjs');

const COMPONENTS = ['brikka-button', 'brikka-radio-group'];

const derive = (text, declared = []) =>
  deriveHooks({
    sources: new Map([['button.ts', text]]),
    declared,
    components: COMPONENTS,
  });

test('derives the names the graph does not declare, and only those', () => {
  const hooks = derive(
    `background: var(--brikka-button-bg, var(--brikka-button-variant-bg));
     color: var(--brikka-text-default);`,
    ['--brikka-text-default'],
  );
  assert.deepEqual(hooks, ['--brikka-button-bg', '--brikka-button-variant-bg']);
});

test('sorts and de-duplicates a name read in two places', () => {
  const hooks = derive(`
    a { color: var(--brikka-button-fg); }
    b { color: var(--brikka-button-border); }
    c { color: var(--brikka-button-fg); }
  `);
  assert.deepEqual(hooks, ['--brikka-button-border', '--brikka-button-fg']);
});

/* The guard subtraction cannot give: a name that belongs to no component is a typo pretending to
 * be a seam, and the hand-kept list is the only reason it used to be caught. */
test('refuses a name that belongs to no component', () => {
  assert.throws(
    () => derive('color: var(--brikka-buton-bg);'),
    /--brikka-buton-bg.*neither a token the graph declares nor a seam/,
  );
});

/* A component name is more than one word, and the first version of this looked for the first
 * segment alone: `radio-group-item-*` sent it looking for `brikka-radio`, which does not exist. */
test('matches the longest component name, not the first segment', () => {
  const hooks = deriveHooks({
    sources: new Map([['item.ts', 'color: var(--brikka-radio-group-item-fg);']]),
    declared: [],
    components: COMPONENTS,
  });
  assert.deepEqual(hooks, ['--brikka-radio-group-item-fg']);
});

/* The artifact is committed so a new seam shows up in the diff, and this is what keeps it true:
 * `pnpm test:checks` runs against the real tree, so a component that adds a seam without
 * regenerating fails here rather than in someone's browser. */
test('the committed hooks.json matches the components', () => {
  const result = spawnSync(process.execPath, [generate, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /hooks ok: \d+ component seams/);
});
