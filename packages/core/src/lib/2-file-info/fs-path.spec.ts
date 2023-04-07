import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import getFs, { useDefaultFs, useVirtualFs } from '../1-fs/getFs';
import { Fs } from '../1-fs/fs';
import { isFsPath, toFsPath } from './fs-path';

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
      expect(() => toFsPath('index.ts')).toThrowError('not absolute');
    });

    it('should fail if path does not exist', () => {
      expect(() => toFsPath('/index.ts')).toThrowError(
        '/index.ts does not exist'
      );
    });

    it('should return false on check for relative path', () => {
      expect(isFsPath('index.ts')).toBe(false);
    });

    it('should return false on check for non-existing file', () => {
      expect(isFsPath('/index.ts')).toBe(false);
    });
  });

  it('should also allow a directory', () => {
    useDefaultFs();
    const fs = getFs();
    expect(isFsPath(fs.join(__dirname, '../test'))).toBe(true);
  });
});
