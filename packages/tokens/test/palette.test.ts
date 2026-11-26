import { expect } from '@open-wc/testing';
import { setTheme } from '@brikka-ui/test-utils/theme.js';

/* The palette is one ramp both themes read, so the pipeline declares it once, at the root, and a
 * theme re-declares only the roles that read it. The difference is a host's to see: a palette
 * override written for the document follows into a `data-theme` container, because that container
 * declares roles, not the ramp.
 *
 * Every check mounts a real subtree, never the root: the failure this covers is a declaration on
 * the container beating the one it would inherit, and no assertion at the root can observe it.
 * `--brikka-text-default` is the role to read because the two themes read different steps of the
 * ramp through it — `neutral-900` in the light theme, `neutral-100` in the dark one — so a value
 * that followed the wrong step, or the wrong theme, cannot pass by coincidence. */

const OVERRIDE = 'rgb(18, 52, 86)';

let container: HTMLDivElement | undefined;

const inTheme = (theme: 'light' | 'dark', token = '--brikka-text-default'): HTMLDivElement => {
  container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('data-theme', theme);
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  container.append(probe);
  return probe;
};

describe('the palette at the root', () => {
  afterEach(() => {
    container?.remove();
    container = undefined;
    document.documentElement.style.removeProperty('--brikka-palette-neutral-900');
    setTheme('light');
  });

  it('lets a palette override reach a light subtree instead of re-declaring the ramp', () => {
    setTheme('light');
    const probe = inTheme('light');
    expect(getComputedStyle(probe).color).to.equal('rgb(28, 25, 23)');

    document.documentElement.style.setProperty('--brikka-palette-neutral-900', OVERRIDE);

    expect(getComputedStyle(probe).color).to.equal(OVERRIDE);
  });

  it('keeps the light roles on a light subtree inside a dark page', () => {
    setTheme('dark');
    const probe = inTheme('light');
    expect(getComputedStyle(probe).color).to.equal('rgb(28, 25, 23)');
  });

  it('keeps the dark roles on a dark subtree inside a light page', () => {
    setTheme('light');
    const probe = inTheme('dark');
    expect(getComputedStyle(probe).color).to.equal('rgb(245, 245, 244)');
  });

  /* The ramp is theme-invariant, and `:root` matches a document under either attribute, so the
   * move must not take the palette away from a page that asked for the dark theme. */
  it('declares the palette on a dark document too', () => {
    setTheme('dark');
    document.documentElement.style.setProperty('--brikka-palette-neutral-900', OVERRIDE);
    const probe = inTheme('dark', '--brikka-bg-surface');
    expect(getComputedStyle(probe).color).to.equal(OVERRIDE);
  });
});

/* A ramp is a reference, not a usage list, so the palette is where a value can go missing without
 * any consumer noticing: nothing reads `teal-800`, so nothing fails when it is deleted or when a
 * hex is typed as `#0d948` and the browser drops the declaration. This reads the artifact the page
 * consumes, not the source, and holds the two things that make a ramp a ramp: every step, and a
 * colour the browser can parse. */
describe('the palette is complete', () => {
  const STEPS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

  const declarations = async (): Promise<Map<string, string>> => {
    const css = await (await fetch('/packages/tokens/src/tokens/color.css')).text();
    const entries = new Map<string, string>();
    for (const [, name, value] of css.matchAll(/--brikka-palette-([a-z0-9-]+):\s*([^;]+);/g)) {
      entries.set(name, value.trim());
    }
    return entries;
  };

  it('declares the two ends of the scale beside the ramps', async () => {
    const palette = await declarations();
    expect(palette.get('white')).to.equal('#ffffff');
    expect(palette.get('black')).to.equal('#000000');
  });

  it('gives every ramp the same nine steps', async () => {
    const palette = await declarations();
    const ramps = new Map<string, string[]>();
    for (const name of palette.keys()) {
      if (!/^[a-z]+-\d+$/.test(name)) continue;
      const [ramp, step] = name.split('-');
      ramps.set(ramp, [...(ramps.get(ramp) ?? []), step]);
    }

    expect(ramps.size, 'thirteen ramps').to.equal(13);
    for (const [ramp, steps] of ramps) {
      expect(steps.sort(), ramp).to.deep.equal(STEPS);
    }
  });

  it('declares every step as a colour a browser can parse', async () => {
    const palette = await declarations();
    for (const [name, value] of palette) {
      expect(value, name).to.match(/^#[0-9a-f]{6}$/);
    }
  });
});
