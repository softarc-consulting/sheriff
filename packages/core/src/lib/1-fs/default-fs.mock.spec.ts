import { describe, expect, it, vitest } from 'vitest';
import defaultFs from './default-fs';
import { FsPath } from './fs-path';

vitest.mock('path', () => ({
  dirname: (dirname: string) => dirname,
  sep: '/',
  join: (...paths: string[]) => paths[paths.length - 1],
}));
vitest.mock('fs', () => ({
  existsSync: () => true,
  readdirSync: (dirname: string) => [dirname, 'tsconfig.json'],
  lstatSync: (filename: string) => {
    console.log(filename);
    if (filename === '/c/busy-dir') {
      throw new Error('EBUSY');
    } else if (filename === '/c/permission-denied-dir') {
      throw new Error('EPERM: operation not permitted');
    } else if (filename === '/c/another-error') {
      throw new Error('another error');
    } else if (filename === 'tsconfig.json') {
      return { isFile: () => true };
    }
  },
}));

describe('error handling in default-fs', () => {
  it('should catch an error for busy-dir', () => {
    const fs = defaultFs;
    expect(() =>
      fs.findNearestParentFile('/c/busy-dir' as FsPath, 'tsconfig.json')
    ).toThrowError('cannot find tsconfig.json near /c/busy-dir');
  });

  it('should catch an error for permission-denied-dir', () => {
    const fs = defaultFs;
    expect(() =>
      fs.findNearestParentFile(
        '/c/permission-denied-dir' as FsPath,
        'tsconfig.json'
      )
    ).toThrowError('cannot find tsconfig.json near /c/permission-denied-dir');
  });

  it('should not catch any other error', () => {
    const fs = defaultFs;
    expect(() =>
      fs.findNearestParentFile('/c/another-error' as FsPath, 'tsconfig.json')
    ).toThrowError(
      'encountered unknown error while reading from /c/another-error: Error: another error'
    );
  });
});
