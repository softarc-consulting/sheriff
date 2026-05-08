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
