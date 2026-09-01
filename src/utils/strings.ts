/**
 * Capitalizes the first letter of a string.
 *
 * An empty string is returned unchanged. Strings starting with a character
 * that has no uppercase form (digits, punctuation, symbols) are returned
 * unchanged as well.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to a URL-friendly slug: lowercased, non-alphanumeric
 * characters stripped, and whitespace converted to single hyphens.
 *
 * Only ASCII letters and digits are preserved: accented and non-Latin
 * characters (e.g. "é", "ï", Cyrillic) are stripped rather than
 * transliterated, as are underscores and other punctuation.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates a string to `maxLength` characters, appending "..." when the
 * string was longer. Strings at or under `maxLength` are returned unchanged.
 * A zero or negative `maxLength` yields just the ellipsis for non-empty
 * strings.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, Math.max(maxLength, 0)) + "...";
}
