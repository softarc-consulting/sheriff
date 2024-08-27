type PropertyKey = string | number | symbol;

export function keys<Key extends PropertyKey, Value>(value: Record<Key, Value>): Key[] {
  return Object.keys(value) as Key[];
}

export function entries<Key extends PropertyKey, Value>(value: Record<Key, Value>): [Key, Value][] {
  return Object.entries(value) as [Key, Value][];
}

export function fromEntries<Key extends PropertyKey, Value>(
  entries: Iterable<[Key, Value]>,
): Record<Key, Value> {
  return Object.fromEntries(entries) as Record<Key, Value>;
}

export function values<Key extends PropertyKey, Value>(value: Record<Key, Value>): Value[] {
  return Object.values(value);
}
