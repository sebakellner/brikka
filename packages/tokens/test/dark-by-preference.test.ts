import { expect } from '@open-wc/testing';

/* Following the operating system is a page's decision, not the graph's. The two ways to lose that
 * distinction are both silent: someone re-adds the import to `tokens.css`, and every host that never
 * asked starts flipping with its reader's machine; or the opt-in entry loses its media query and
 * becomes a stylesheet that does nothing at all. A decision that lives only in a document is one
 * the next change can take away, so it lives here too. */

const read = async (path: string): Promise<string> => (await fetch(path)).text();

describe('the dark theme a document did not ask for', () => {
  it('is not part of the stylesheet a page loads', async () => {
    const tokens = await read('/packages/tokens/src/tokens.css');
    expect(tokens, 'tokens.css composes the layers, and this is not one of them').to.not.contain(
      'dark-by-preference',
    );
    expect(tokens).to.contain('tokens/color.dark.css');
  });

  it('is not in the theme entry either, which carries only what both themes share', async () => {
    const theme = await read('/packages/tokens/src/theme.css');
    expect(theme, 'theme.css is tokens.css, color-scheme and reduced motion').to.not.contain(
      'prefers-color-scheme',
    );
  });

  it('exists as an entry of its own, and it is the one that asks the browser', async () => {
    const entry = await read('/packages/tokens/src/dark-by-preference.css');
    expect(entry).to.contain('@media (prefers-color-scheme: dark)');
    expect(entry).to.contain(':where(:root:not([data-theme]))');
    expect(entry, 'the roles are generated, never copied into the entry').to.contain(
      "@import './tokens/dark-by-preference.css'",
    );
  });

  /* The whole reason the block is scopable: an explicit choice has to win over the preference. */
  it('scopes every rule to a document that chose nothing', async () => {
    const generated = await read('/packages/tokens/src/tokens/dark-by-preference.css');
    expect(generated).to.contain(':where(:root:not([data-theme]))');
  });
});
