import { describe, it, expect } from 'vitest';
import throwIfNull from './throw-if-null';

describe('throw if null', () => {
  const colours = new Map([
    ['red', 'f00'],
    ['green', '0f0'],
    ['blue', '00f'],
    ['black', ''],
    ['virtual', null],
  ]);
  it('should throw an error', () => {
    expect(() =>
      throwIfNull(colours.get('yellow'), 'yellow does not exist'),
    ).toThrow('yellow does not exist');
  });
});
