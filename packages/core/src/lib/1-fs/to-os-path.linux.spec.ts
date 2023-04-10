import { describe, expect, it, vitest } from 'vitest';
import { toOsPath } from './to-os-path';
import { FsPath } from './fs-path';

vitest.mock('path', () => ({
  sep: '/',
}));

describe('to-os-path linux', () => {
  it('leave linux as it is', () => {
    expect(toOsPath('/projects/main.ts' as FsPath)).toBe('/projects/main.ts');
  });
});
