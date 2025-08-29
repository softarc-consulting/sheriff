import { FsPath } from '../file-info/fs-path';
import { wildcardToRegex } from './wildcard-to-regex';

/**
 * Checks if a file path should be excluded from Sheriff rule checks.
 * 
 * @param filePath - The file path to check
 * @param excludePatterns - Array of glob patterns or regular expressions to match against
 * @returns true if the file should be excluded from checks
 */
export function isExcludedFromChecks(
  filePath: FsPath,
  excludePatterns: (string | RegExp)[],
): boolean {
  if (excludePatterns.length === 0) {
    return false;
  }

  // Convert FsPath to string for matching
  const pathString = filePath.toString();

  for (const pattern of excludePatterns) {
    if (typeof pattern === 'string') {
      // Handle glob patterns
      if (pattern.includes('*') || pattern.includes('**')) {
        const regex = globToRegex(pattern);
        if (regex.test(pathString)) {
          return true;
        }
      } else {
        // Exact path match
        if (pathString === pattern || pathString.endsWith(pattern)) {
          return true;
        }
      }
    } else if (pattern instanceof RegExp) {
      // Regular expression match
      if (pattern.test(pathString)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Converts a glob pattern to a regular expression.
 * Supports basic glob patterns including ** for recursive matching.
 * 
 * @param globPattern - The glob pattern to convert
 * @returns A regular expression that matches the glob pattern
 */
function globToRegex(globPattern: string): RegExp {
  // Handle ** for recursive matching
  let pattern = globPattern
    .replace(/\*\*/g, '.*') // ** becomes .*
    .replace(/\*/g, '[^/]*'); // * becomes [^/]* (matches anything except /)

  // Escape other regex special characters
  pattern = pattern.replace(/([.+?^=!:${}()|[\]\\])/g, '\\$1');

  // Ensure the pattern matches the entire path
  if (!pattern.startsWith('^')) {
    pattern = '^' + pattern;
  }
  if (!pattern.endsWith('$')) {
    pattern = pattern + '$';
  }

  return new RegExp(pattern);
}


