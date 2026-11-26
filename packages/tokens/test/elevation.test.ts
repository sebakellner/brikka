import { expect } from '@open-wc/testing';
import { setTheme } from '@brikka-ui/test-utils/theme.js';

/* A shadow is the one value in the graph nothing verifies: `check:tokens` derives a role's
 * expected property from the first segment of its name, and `elevation` is not a family it
 * knows. These read the computed value the token actually produces, which is the only place a
 * wrong offset or a dropped alpha becomes visible. */

let probe: HTMLDivElement | undefined;

const shadow = (name: string): string => {
  probe ??= document.body.appendChild(document.createElement('div'));
  probe.style.boxShadow = `var(--brikka-elevation-${name})`;
  return getComputedStyle(probe).boxShadow;
};

/* The tint is a role now, so the expected shadow is the theme's tint plus a geometry. Asserting
 * the whole string against a literal would copy the alpha into the test, which is the duplication
 * this file exists to avoid: a shadow and its colour are one value written in two places. */
const tint = (): string =>
  getComputedStyle(document.documentElement).getPropertyValue('--brikka-elevation-color').trim();

const painted = (geometry: string): string => {
  const [r, g, b, a] = tint().match(/[\d.]+/g) ?? [];
  return `rgba(${r}, ${g}, ${b}, ${a}) ${geometry}`;
};

describe('elevation', () => {
  it('paints a surface resting on the page', () => {
    expect(shadow('resting')).to.equal(painted('0px 2px 6px -1px'));
  });

  it('paints a surface floating above everything', () => {
    expect(shadow('floating')).to.equal(painted('0px 12px 32px -8px'));
  });

  /* The colour is a reference inside a composite; if the serializer stopped resolving it, the
   * shadow would still paint — in the wrong colour, or not at all, without an error. */
  it('paints the tint the theme declares, at the alpha the theme declares', () => {
    const alpha = tint().match(/[\d.]+/g)?.[3];
    for (const name of ['resting', 'floating']) {
      expect(shadow(name), name).to.contain(String(alpha));
    }
  });

  /* The tint is a role, and it has to be a role: one alpha cannot lift a white page and a
   * near-black one — over #1c1917, twelve percent of near-black is the same colour twice. */
  it('uses a denser tint in the dark theme than in the light one', () => {
    setTheme('light');
    const light = Number(tint().match(/[\d.]+/g)?.[3]);
    setTheme('dark');
    const dark = Number(tint().match(/[\d.]+/g)?.[3]);
    setTheme('light');
    expect(dark, 'a dark surface needs a shadow it can show').to.be.greaterThan(light);
  });

  /* One colour retints both levels — but only where the composite is declared. A custom
   * property that contains a `var()` is substituted on the element that declares it, so an
   * override on a subtree does not reach into a composite inherited from `:root`. That is a
   * theme-level knob, and this is the test that says so. */
  it('retints both levels from one colour at the theme', () => {
    const root = document.documentElement;
    root.style.setProperty('--brikka-elevation-color', 'rgb(37 99 235 / 0.4)');
    try {
      expect(shadow('resting')).to.contain('rgba(37, 99, 235, 0.4)');
      expect(shadow('floating')).to.contain('rgba(37, 99, 235, 0.4)');
    } finally {
      root.style.removeProperty('--brikka-elevation-color');
    }
  });
});
