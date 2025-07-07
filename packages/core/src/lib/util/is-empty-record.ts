export function isEmptyRecord(
  value: unknown,
): value is Record<never, never> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}
