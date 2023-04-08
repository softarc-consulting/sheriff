import { describe, expect, it, vitest } from 'vitest';
import { toOsPath } from './to-os-path';
import { FsPath } from '../2-file-info/fs-path';

vitest.mock('path', () => ({
  sep: '\\',
}));

describe('to-os-path windows', () => {
  it('should convert to windows style', () => {
    expect(toOsPath('/c/main.ts' as FsPath)).toBe('c:\\main.ts');
  });

  it('should throw an error if in wrong format', () => {
    expect(() => toOsPath('/project/main.ts' as FsPath)).toThrowError(
      'Cannot convert /project/main.ts to a Window-specific path'
    );
  });
});
