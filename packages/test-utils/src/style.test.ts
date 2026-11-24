import { expect, fixture, html } from '@open-wc/testing';
import { clearStyleCache, colorOf } from './style.js';

describe('the token reader', () => {
  it('should leave the document as it found it', async () => {
    clearStyleCache();
    await fixture(html`<div id="sentinel">the fixture that asks</div>`);
    const bodyBefore = document.body.innerHTML;
    const childrenBefore = document.body.childElementCount;

    const error = colorOf('var(--brikka-text-error)');
    const muted = colorOf('var(--brikka-text-muted)');

    expect(Boolean(error) && Boolean(muted), 'the two values were resolved').to.equal(true);
    expect(childrenBefore, 'the reader added no element to the page').to.equal(
      document.body.childElementCount,
    );
    expect(document.body.innerHTML, 'and the page is otherwise untouched').to.equal(bodyBefore);
  });
});
