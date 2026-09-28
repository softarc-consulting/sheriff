export function safeAssign<T extends Record<string, unknown>>(
  object: T,
  changes: Partial<T> = {}
): void {
  Object.assign(object, changes);
}
