export function assertType<T>(obj: unknown = null): T {
  return obj as T;
}
