export function assertNotNull<T>(
  value: T,
  prefix = '',
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${prefix} value cannot be null`);
  }
}
