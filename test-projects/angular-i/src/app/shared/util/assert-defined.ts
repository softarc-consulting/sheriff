export function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('value is undefined');
  }
}
