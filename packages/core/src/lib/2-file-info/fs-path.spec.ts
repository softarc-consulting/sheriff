import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import getFs, { useDefaultFs, useVirtualFs } from '../1-fs/getFs';
import { Fs } from '../1-fs/fs';
import { isFsPath, assertFsPath, toFsPath } from './fs-path';

describe('FsPath', () => {
  describe('VirtualFs', () => {
    let fs: Fs;
    beforeAll(() => {
      useVirtualFs();
      fs = getFs();
    });

    beforeEach(() => {
      fs.reset();
    });

    it('should fail if path is not absolute', () => {
      expect(() => assertFsPath('index.ts')).toThrowError('not absolute');
    });

    it('should fail if path does not exist', () => {
      expect(() => assertFsPath('/index.ts')).toThrowError(
        '/index.ts does not exist'
      );
    });

    it('should return false on check for relative path', () => {
      expect(isFsPath('index.ts')).toBe(false);
    });

    it('should return false on check for non-existing file', () => {
      expect(isFsPath('/index.ts')).toBe(false);
    });

    it.each([
      ['c:\\app\\src\\main.ts', '/c/app/src/main.ts'],
      ['a:\\app.ts', '/a/app.ts'],
      ['/project/main.ts', '/project/main.ts'],
    ])('should map %s to %s', (from, to) => {
      getFs().writeFile(to, '');
      expect(toFsPath(from)).toBe(to);
    });
  });

  it('should also allow a directory', () => {
    useDefaultFs();
    const fs = getFs();
    expect(isFsPath(fs.join(__dirname, '../test'))).toBe(true);
  });
});
