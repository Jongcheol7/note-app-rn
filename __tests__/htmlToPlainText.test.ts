import { htmlToPlainText } from '../lib/utils/htmlToPlainText';

describe('htmlToPlainText', () => {
  it('returns empty string for empty input', () => {
    expect(htmlToPlainText('')).toBe('');
  });

  it('strips HTML tags', () => {
    expect(htmlToPlainText('<p>Hello <strong>world</strong></p>')).toBe(
      'Hello world'
    );
  });

  it('decodes common HTML entities', () => {
    expect(htmlToPlainText('&amp; &lt; &gt; &quot; &#39;')).toBe(
      "& < > \" '"
    );
  });

  it('replaces &nbsp; with space', () => {
    expect(htmlToPlainText('hello&nbsp;world')).toBe('hello world');
  });

  it('normalizes whitespace', () => {
    expect(htmlToPlainText('<p>hello</p>  <p>world</p>')).toBe('hello world');
  });

  it('handles nested tags', () => {
    expect(
      htmlToPlainText('<div><ul><li>item 1</li><li>item 2</li></ul></div>')
    ).toBe('item 1 item 2');
  });

  it('handles headings', () => {
    expect(htmlToPlainText('<h1>Title</h1><p>Body</p>')).toBe('Title Body');
  });
});
