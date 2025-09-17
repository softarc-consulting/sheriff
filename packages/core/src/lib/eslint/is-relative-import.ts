/**
 * Determines whether an import command is a relative import.
 *
 * Relative imports are those that start with a dot (e.g. './x', '../y').
 * Non-relative imports include:
 * - External packages (e.g. 'keycloak-js')
 * - Node.js built-in modules (e.g. 'node:url', 'fs', 'path')
 *
 * Sheriff ESLint rules only report unresolvable imports when they are relative.
 * This avoids false positives for external packages and Node built-ins while
 * still allowing the core to track all unresolvable imports for data/export.
 *
 * @param importCommand The raw import string as it appears in source code
 * @returns true if the import is relative; otherwise false
 */
export function isRelativeImport(importCommand: string): boolean {
  return importCommand.startsWith('.');
}


