import { sanitizeHtml } from '../lib/utils/sanitize';

// Note: These tests run with the regex-based stripping (native fallback)
// since DOMPurify requires a browser environment

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('preserves safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    expect(sanitizeHtml(input)).not.toContain('<script');
    expect(sanitizeHtml(input)).toContain('Hello');
    expect(sanitizeHtml(input)).toContain('World');
  });

  it('removes event handlers', () => {
    const input = '<img src="test.jpg" onerror="alert(1)" />';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).toContain('src="test.jpg"');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('removes iframe tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    expect(sanitizeHtml(input)).not.toContain('<iframe');
  });
});
