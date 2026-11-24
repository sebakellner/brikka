import { expect } from '@open-wc/testing';
import { breakpoints } from '@brikka-ui/tokens';

/* A container is as wide as the breakpoint that opens it, and the pair is asserted here rather
 * than remembered in two files. The breakpoint is a number because `@media` cannot read a custom
 * property; the container is a length because a page sets `max-inline-size` with it. Two tokens
 * carrying one number is exactly the kind of duplication that drifts silently, so the duplication
 * is allowed only while something fails when it stops being true.
 *
 * The failure this catches: moving `breakpoint.lg` from 1024 to 1100 and leaving the container at
 * 1024, which is a page that scrolls sideways at a width its own stylesheet calls `lg`. */

const root = (): CSSStyleDeclaration => getComputedStyle(document.documentElement);

const containerOf = (step: string): string =>
  root().getPropertyValue(`--brikka-container-${step}`).trim();

/* Every key the map exports as a breakpoint number must have a container of the same width —
 * and the other direction matters too: a container with no breakpoint names a size no media query
 * can ever match, which is a length a page would apply at a viewport it cannot describe. */
describe('the container scale matches the breakpoints', () => {
  const steps = Object.keys(breakpoints);

  it('exports a breakpoint for every container step', () => {
    for (const step of steps) {
      expect(containerOf(step), `container ${step} is declared`).to.not.equal('');
    }
  });

  it('gives each container the width of its breakpoint, in px', () => {
    for (const step of steps) {
      const breakpoint = breakpoints[step as keyof typeof breakpoints];
      expect(containerOf(step), step).to.equal(`${breakpoint}px`);
    }
  });

  /* A container is a length, so the declaration has to carry the unit: `1280` without it is an
   * invalid `max-inline-size` and the page silently loses its column. */
  it('declares a length, not a bare number', () => {
    for (const step of steps) {
      expect(containerOf(step), step).to.match(/^\d+px$/);
    }
  });
});
