// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function isEmptyRecord<T>(value: T): value is Record<never, never> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}
