import { expect } from '@open-wc/testing';

/* The two multipliers a host turns — density and the type scale — are floored by a name and not by
 * a literal inside the expression that computes them: `size.target-min` under the control height,
 * and `scale.type-floor` under every font size. A number without a name is a decision without an
 * owner.
 *
 * The two floors are not the same kind of thing, which is what the last two tests here hold. The
 * target is an absolute length in CSS pixels, because 2.5.8 is measured in CSS pixels and not in
 * rhythm: neither the density nor a brand's space base moves it. The type floor is a multiplier,
 * because what it protects is the relationship between the six steps; an absolute floor applied to
 * each step would flatten them onto one size at a degenerate setting.
 *
 * Every check is two-sided, like `scale-knobs.test.ts`: the floor has to hold where a host asked
 * for less, and a value above it has to keep following the axis. A floor that pinned every value
 * at the minimum would pass the first half and fail the second. */

let probe: HTMLDivElement | undefined;

const root = (): CSSStyleDeclaration => document.documentElement.style;

/* The declaration as the build emitted it, for the two assertions about what a floor *is*. */
const raw = (token: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

const component = (): HTMLDivElement =>
  (probe ??= document.body.appendChild(document.createElement('div')));

/* Read through a real computation, so this is the token a page consumes and not a string in a
 * file: a name that resolves to nothing leaves the declaration invalid and the probe at its
 * inherited value, which the assertions below then fail on. */
const length = (token: string): number => {
  component().style.height = `var(${token})`;
  return parseFloat(getComputedStyle(component()).height);
};

const fontSize = (step: string): number => {
  component().style.fontSize = `var(--brikka-font-size-${step})`;
  return parseFloat(getComputedStyle(component()).fontSize);
};

const controlHeight = (): number => length('--brikka-control-height');

const rem = (): number => parseFloat(getComputedStyle(document.documentElement).fontSize);

const typeFloor = (): number => {
  component().style.fontSize = 'calc(1rem * var(--brikka-scale-type-floor))';
  return parseFloat(getComputedStyle(component()).fontSize) / rem();
};

const STEPS: [string, number][] = [
  ['xs', 0.75],
  ['sm', 0.8125],
  ['md', 0.9375],
  ['lg', 1.125],
  ['xl', 1.375],
  ['2xl', 1.75],
];

describe('the floors under the two configuration axes', () => {
  afterEach(() => {
    root().removeProperty('--brikka-scale-density');
    root().removeProperty('--brikka-scale-type');
    root().removeProperty('--brikka-space-base');
  });

  /* Two names, two kinds: the target is a length because the rule that asks for it is measured in
   * CSS pixels, and the type floor is a number because it multiplies. */
  it('names both floors, and only the target is in pixels', () => {
    expect(raw('--brikka-size-target-min')).to.equal('24px');
    expect(raw('--brikka-scale-type-floor')).to.equal('0.875');
  });

  /* A name, not a number. `max(calc(40px * density), 0.6)` computes the same 24px as
   * `max(calc(40px * density), size.target-min)` at every density below the floor, and a baked
   * `0.875` the same 10.5px as the multiplier form — so no assertion on a computed value can tell
   * the token from the literal. S6 says each floor is read as a token and never written inside the
   * expression, and that is only observable where the declaration is. */
  it('reads each floor as a token, never as a literal inside the expression', async () => {
    const base = await (await fetch('/packages/tokens/src/tokens/base.css')).text();
    const typography = await (await fetch('/packages/tokens/src/tokens/typography.css')).text();

    expect(base).to.contain(
      '--brikka-control-height: max(calc(40px * var(--brikka-scale-density)), var(--brikka-size-target-min));',
    );
    expect(typography).to.contain(
      '--brikka-font-size-xs: calc(0.75rem * max(var(--brikka-scale-type), var(--brikka-scale-type-floor)));',
    );
  });

  /* 2.5.8 asks for a 24 by 24 CSS pixel target, and the floor computes exactly that: the
   * requirement, not a target above it. Density 0.3 computed 12px before the floor, half of it. */
  it('holds the control height at the named target floor when the density is below it', () => {
    root().setProperty('--brikka-scale-density', '0.3');
    expect(controlHeight()).to.equal(length('--brikka-size-target-min'));
  });

  /* The floor is absolute: `size` otherwise reads the space ramp, so a brand that rescales the
   * base must not move the height's minimum with it, and the density must not either. */
  it('keeps the target floor absolute when the space ramp moves', () => {
    root().setProperty('--brikka-scale-density', '0.3');
    root().setProperty('--brikka-space-base', '8px');
    expect(length('--brikka-size-target-min')).to.equal(24);
    expect(controlHeight()).to.equal(length('--brikka-size-target-min'));
  });

  /* Every step, not one: `xs` alone would pass for a floor written on `xs`, and a single absolute
   * floor would flatten the six. At a degenerate setting each size is its own step times the
   * named multiplier. */
  it('holds every font size at the named type floor when the axis is below it', () => {
    root().setProperty('--brikka-scale-type', '0.5');
    for (const [step, inRem] of STEPS) {
      expect(fontSize(step), step).to.be.closeTo(inRem * rem() * typeFloor(), 0.02);
    }
  });

  /* The claim the multiplier exists for: what survives a degenerate setting is the relationship
   * between the steps, which an absolute floor per step would not (they would all be the same). */
  it('keeps the type floor a multiplier, so the six steps keep their proportions', () => {
    root().setProperty('--brikka-scale-type', '0.5');
    expect(fontSize('2xl') / fontSize('xs')).to.be.closeTo(1.75 / 0.75, 0.001);
  });

  /* A floor is not a pin: the designed values above it still follow their axis. */
  it('leaves the control height at the designed 40px when the density is 1', () => {
    expect(controlHeight()).to.equal(40);
  });

  it('leaves the smallest font size on the axis at the documented dense value', () => {
    root().setProperty('--brikka-scale-type', '1.125');
    expect(fontSize('xs')).to.equal(13.5);
  });
});
