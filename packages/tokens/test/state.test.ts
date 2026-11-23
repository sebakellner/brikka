import { expect } from '@open-wc/testing';
import { setTheme } from '@brikka-ui/test-utils/theme.js';
import { contrastRatio } from '@brikka-ui/test-utils/contrast.js';

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

/* The inactive-text floor: the class WCAG exempts and this graph does not. */
const FLOOR = 3;

let probe: HTMLDivElement | undefined;
let control: HTMLDivElement | undefined;

const paint = (property: 'background' | 'color', token: string): string => {
  probe ??= document.body.appendChild(document.createElement('div'));
  probe.style.setProperty(property, `var(${token})`);
  return getComputedStyle(probe)[property === 'background' ? 'backgroundColor' : 'color'];
};

const channels = (colour: string): number[] =>
  colour
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number);

/* `opacity` fades the whole control, so its surface and its ink both arrive at the page mixed
 * toward the surface behind it. The ink is drawn over the control's own surface inside the group,
 * and the group is what reaches the page at the factor — so the two mix over the page, not over
 * each other. */
const over = (value: number[], behind: number[], alpha: number): string =>
  `rgb(${value.map((channel, i) => alpha * channel + (1 - alpha) * behind[i]).join(' ')})`;

const disabledComposite = (): number => {
  control ??= document.body.appendChild(document.createElement('div'));
  control.style.background = 'var(--brikka-bg-surface)';
  control.style.color = 'var(--brikka-text-default)';
  control.style.opacity = 'var(--brikka-opacity-disabled)';

  const style = getComputedStyle(control);
  const page = channels(getComputedStyle(document.body).backgroundColor);
  const alpha = Number(style.opacity);

  return contrastRatio(
    over(channels(style.color), page, alpha),
    over(channels(style.backgroundColor), page, alpha),
  );
};

describe('state roles', () => {
  afterEach(() => setTheme('light'));

  it('dims the page under a floating surface with an alpha a scrim needs', () => {
    setTheme('light');
    expect(paint('background', '--brikka-bg-scrim')).to.equal('rgba(28, 25, 23, 0.48)');
    setTheme('dark');
    expect(paint('background', '--brikka-bg-scrim')).to.equal('rgba(28, 25, 23, 0.64)');
  });

  /* The measured class: not a role against the surface it names, but the ink as it renders on a
   * dimmed control whose surface is the page surface. */
  it('keeps a dimmed control above the 3:1 inactive floor in the light theme', () => {
    setTheme('light');
    expect(disabledComposite(), 'light').to.be.at.least(FLOOR);
  });

  it('keeps a dimmed control above the 3:1 inactive floor in the dark theme', () => {
    setTheme('dark');
    expect(disabledComposite(), 'dark').to.be.at.least(FLOOR);
  });

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
