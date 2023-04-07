/**
 * Causes a TypeScript compilation error, if TypeScript
 * identifies this function as callable.
 */
export function assertUnreachableCode(value: never) {
  // should not happen
  return value;
}
