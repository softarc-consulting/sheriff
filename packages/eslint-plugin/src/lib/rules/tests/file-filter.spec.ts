import { describe, expect, it } from 'vitest';
import { isExcluded } from '../utils/file-filter';

describe('file-filter', () => {
  it('should return true when the file is excluded', () => {
    const fileFilter = { exclude: ['test.ts'] };
    const filePath = 'test.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(true);
  });

  it('should return false when the file is not excluded', () => {
    const fileFilter = { exclude: ['test.ts'] };
    const filePath = 'test2.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(false);
  });

  it('should return false when the file is included', () => {
    const fileFilter = { include: ['test.ts'] };
    const filePath = 'test.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(false);
  });

  it('should return true when the file is not included', () => {
    const fileFilter = { include: ['test.ts'] };
    const filePath = 'test2.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(true);
  });

  it('should return true when the file is excluded and included because exclusions have precedence', () => {
    const fileFilter = { exclude: ['test.ts'], include: ['test.ts'] };
    const filePath = 'test.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(true);
  });

  it('should return false when the file is not excluded and is included (exclusions have precedence)', () => {
    const fileFilter = { exclude: ['test.ts'], include: ['test2.ts'] };
    const filePath = 'test2.ts';
    expect(isExcluded(fileFilter, filePath)).toBe(false);
  });
});
