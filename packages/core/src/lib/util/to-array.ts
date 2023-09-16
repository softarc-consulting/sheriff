export default function toArray<T>(input: T | T[]) {
  return Array.isArray(input) ? input : [input];
}
