/**
 * Capitalizes the first letter of a string.
 *
 * An empty string is returned unchanged.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to a URL-friendly slug: lowercased, non-alphanumeric
 * characters stripped, and whitespace converted to single hyphens.
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
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, Math.max(maxLength, 0)) + "...";
}
