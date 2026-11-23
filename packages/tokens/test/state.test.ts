import { expect } from '@open-wc/testing';
import { setTheme } from '@brikka-ui/test-utils/theme.js';

/* Opacity is the disabled model. A control that cannot be used is dimmed whole at one factor, and
 * the roles it already reads paint its surface, its edge and its ink, so there is no `bg-disabled`,
 * `text-disabled` or `border-disabled`: three roles for one state would be three values to keep
 * true in two themes, for a state one property already expresses.
 *
 * What that costs is measurable, and the floor is measured the way the user sees it: the whole
 * control at `opacity.disabled` over the surface behind it, with the ink composited against the
 * control's composited surface. Measured on the roles at full opacity, a dimmed control looks fine
 * and is not. A control whose own surface is the page surface clears the 3:1 inactive floor; a
 * filled or accent one does not, and closing that is a decision about how a filled disabled control
 * is painted, which is why this suite asserts the case the graph keeps.
 *
 * Every value here is asserted under a pinned theme. Two reasons, both learned the hard way: an
 * inequality (`disabled !== default`) passes when the token does not resolve at all and the probe
 * inherits body ink, and the scrim is theme-scoped, so under a dark colour scheme the light
 * assertion reads the dark value and fails on someone else's machine. */

/* The inactive-text floor: the class WCAG exempts and this graph does not. It is named here and
 * asserted nowhere yet — see the note above `describe`. */

let probe: HTMLDivElement | undefined;

const paint = (property: 'background' | 'color', token: string): string => {
  probe ??= document.body.appendChild(document.createElement('div'));
  probe.style.setProperty(property, `var(${token})`);
  return getComputedStyle(probe)[property === 'background' ? 'backgroundColor' : 'color'];
};

describe('state roles', () => {
  afterEach(() => setTheme('light'));

  it('dims the page under a floating surface with an alpha a scrim needs', () => {
    setTheme('light');
    expect(paint('background', '--brikka-bg-scrim')).to.equal('rgba(28, 25, 23, 0.48)');
    setTheme('dark');
    expect(paint('background', '--brikka-bg-scrim')).to.equal('rgba(28, 25, 23, 0.64)');
  });

  /* The measured class is not asserted here, and the reason is the difference between the model
   * and the product. The graph's decided model is that a disabled control exchanges no ink: the
   * factor alone quiets `text-default`, which composites to 3.35:1 over the page. The components
   * have not been rebuilt against that model yet and still paint `text-muted`, which composites to
   * 2.34:1 — below the floor. A probe painting `text-default` would pass while measuring a control
   * the product does not render, so it would certify a guarantee nobody holds. The case goes back
   * in with the rebuild, asserting the rendered control. */

  it('separates a chosen row from its text', () => {
    setTheme('light');
    expect(paint('background', '--brikka-bg-selected')).to.equal('rgb(219, 234, 254)');
    expect(paint('color', '--brikka-text-on-selected')).to.equal('rgb(28, 25, 23)');
  });

  it('burns the chosen row into the dark theme too', () => {
    setTheme('dark');
    expect(paint('background', '--brikka-bg-selected')).to.equal('rgb(30, 58, 138)');
    expect(paint('color', '--brikka-text-on-selected')).to.equal('rgb(245, 245, 244)');
  });

  it('keeps pressed distinct from hover, one step further from rest', () => {
    setTheme('light');
    expect(paint('background', '--brikka-bg-surface')).to.equal('rgb(255, 255, 255)');
    expect(paint('background', '--brikka-bg-surface-hover')).to.equal('rgb(231, 229, 228)');
    expect(paint('background', '--brikka-bg-surface-pressed')).to.equal('rgb(214, 211, 209)');
  });
});
