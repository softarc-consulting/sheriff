export type GlobMatcher = (text: string) => boolean;

/**
 * Creates a pre-compiled matcher function for the given glob patterns.
 *
 * Supported wildcards:
 * - `*` matches zero or more characters
 * - `?` matches exactly one character
 *
 * All other characters are matched literally.
 * The matching is **case-insensitive**.
 *
 * @param patterns - The glob patterns to match against.
 * @returns A function that returns `true` if the text matches any pattern.
 */
export function createGlobMatcher(patterns: string[]): GlobMatcher {
  const literals = patterns
    .filter((p) => !p.includes('*') && !p.includes('?'))
    .map((p) => p.toLowerCase());

  const regexes = patterns
    .filter((p) => p.includes('*') || p.includes('?'))
    .map((p) => new RegExp(`^${globToRegexString(p)}$`, 'i'));

  return (text: string): boolean => {
    const lower = text.toLowerCase();
    return literals.includes(lower) || regexes.some((re) => re.test(text));
  };
}

/**
 * Matches a text string against a glob pattern.
 *
 * Supported wildcards:
 * - `*` matches zero or more characters
 * - `?` matches exactly one character
 *
 * All other characters are matched literally.
 * The matching is **case-insensitive**.
 *
 * @param pattern - The glob pattern to match against.
 * @param text - The text to test.
 * @returns `true` if the text matches the pattern.
 */
export function matchGlob(pattern: string, text: string): boolean {
  const regexString = globToRegexString(pattern);
  const regex = new RegExp(`^${regexString}$`, 'i');
  return regex.test(text);
}

function globToRegexString(pattern: string): string {
  let result = '';

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (char === '*') {
      result += '.*';
    } else if (char === '?') {
      result += '.';
    } else {
      result += escapeRegexChar(char);
    }
  }

  return result;
}

function escapeRegexChar(char: string): string {
  if ('.+^${}()|[]\\'.includes(char)) {
    return `\\${char}`;
  }
  return char;
}
