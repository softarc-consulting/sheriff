import throwIfNull from './throw-if-null';

export default <Key, Value>(map: Map<Key, Value>, key: Key): Value =>
  throwIfNull(map.get(key), `${key} does not exist in passed Map`);
