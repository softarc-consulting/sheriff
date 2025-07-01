import { describe, it, expect } from 'vitest';
import { isEmptyRecord } from '../util/is-empty-record';

describe('isEmptyRecord', () => {
  it('should return false if value is null', () => {
    expect(isEmptyRecord(null)).toBe(false);
  });
  it('should return false if value is undefined', () => {
    expect(isEmptyRecord(undefined)).toBe(false);
  });

  it('should return false if value is an object with at least one key-value-pair', () => {
    expect(isEmptyRecord({ key: 'value' })).toBe(false);
  });
  it('should return false if value is an array', () => {
    expect(isEmptyRecord([])).toBe(false);
  });
  it('should return false if value is a string', () => {
    expect(isEmptyRecord('')).toBe(false);
  });
  it('should return false if value is a number', () => {
    expect(isEmptyRecord(0)).toBe(false);
  });
  it('should return false if value is a boolean', () => {
    expect(isEmptyRecord(true)).toBe(false);
    expect(isEmptyRecord(false)).toBe(false);
  });
  it('should return false if value is a function', () => {
    expect(isEmptyRecord(() => {})).toBe(false);
  });
  it('should return false for a record with at least one key-value-pair', () => {
    expect(isEmptyRecord<Record<string, string>>({ key: 'value' })).toBe(false);
  });

  it('should return true if value is an empty object', () => {
    expect(isEmptyRecord({})).toBe(true);
  });
  it('should return true if value is an empty record', () => {
    expect(isEmptyRecord<Record<never, never>>({})).toBe(true);
  });
});
