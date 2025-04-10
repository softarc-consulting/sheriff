/**
 * Parses a string or a JSON object string into a string or a Record<string, string>.
 *
 * This is a helper function to handle CLI arguments which can be either a entry file
 * or entry points.
 *
 * TODO we should consider using a robust library instead of handrolling an own solution
 */
export function parseStringOrRecord(
  input: string,
): string | Record<string, string> {
  // Trim whitespace to properly handle strings with whitespace around braces
  const trimmedInput = input.trim();

  if (trimmedInput.startsWith('{') && trimmedInput.endsWith('}')) {
    try {
      // Try to parse as-is first (for valid JSON)
      try {
        const parsed = JSON.parse(trimmedInput);
        if (typeof parsed === 'object' && parsed !== null) {
          const allValuesAreStrings = Object.values(parsed).every(
            (value) => typeof value === 'string',
          );

          if (allValuesAreStrings) {
            return parsed as Record<string, string>;
          }
        }
      } catch (error) {
        // Continue to the next approach if direct parsing fails
      }

      // Use the original approach that simply replaces all single quotes with double quotes
      const withDoubleQuotes = trimmedInput.replace(/'/g, '"');
      const parsed = JSON.parse(withDoubleQuotes);

      // Validate that values are strings
      if (typeof parsed === 'object' && parsed !== null) {
        const allValuesAreStrings = Object.values(parsed).every(
          (value) => typeof value === 'string',
        );

        if (allValuesAreStrings) {
          return parsed as Record<string, string>;
        }
      }

      // If we got here, the parsed result wasn't a valid Record<string, string>
      return input;
    } catch (error) {
      return input;
    }
  } else {
    // regular string input
    return input;
  }
}
