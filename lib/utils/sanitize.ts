import { Platform } from 'react-native';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify on web, regex-based stripping on native.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'hr', 'pre', 'code',
          'a', 'img', 'span', 'div', 'mark',
          'input', // for task list checkboxes
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
          'style', 'class', 'data-type', 'data-checked', 'type', 'checked',
          'data-align', 'color',
        ],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      });
    } catch {
      return stripDangerousTags(html);
    }
  }

  return stripDangerousTags(html);
}

/**
 * Regex-based dangerous tag stripping for native.
 * Not as robust as DOMPurify but removes the most common XSS vectors.
 */
function stripDangerousTags(html: string): string {
  return html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, object, embed, form
    .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form)\b[^>]*\/?>/gi, '')
    // Remove event handlers
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
}
