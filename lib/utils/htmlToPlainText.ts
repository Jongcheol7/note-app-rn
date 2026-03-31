/**
 * Convert HTML to plain text for search indexing.
 * Strips all tags and normalizes whitespace.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  return html
    // Remove tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
