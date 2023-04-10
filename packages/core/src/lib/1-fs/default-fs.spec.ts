import { DefaultFs } from './default-fs';
import { describe, expect, it } from 'vitest';
import * as path from 'path';
import { toFsPath } from '../2-file-info/fs-path';
import { PotentialFsPath, toPotentialFsPath } from './potential-fs-path';

describe('Default Fs', () => {
  const fs = new DefaultFs();

  describe('basics', () => {
    it('should test basic file I/O operations', () => {
      const tmpdir = fs.tmpdir();
      const filename = path.join(`${tmpdir}${fs.pathSeparator}dummy.txt`);
      fs.writeFile(filename, 'This is some dummy text');
      expect(fs.readFile(filename)).toBe('This is some dummy text');
    });

    it('should not run in tmpdir', () => {
      expect(fs.tmpdir()).not.toBe(fs.cwd());
    });

    it('should do basic directory I/O operations', () => {
      const tmpdir = fs.tmpdir();
      const dirname = toPotentialFsPath(
        path.join(`${tmpdir}${fs.pathSeparator}dummy-test`)
      );
      fs.createDir(dirname);
      expect(fs.exists(dirname)).toBe(true);
      fs.removeDir(toFsPath(dirname));
      expect(fs.exists(dirname)).toBe(false);
    });

    it('should throw an error if print is called', () => {
      expect(() => fs.print()).toThrowError();
    });

    it('should throw an error on reset', () => {
      expect(() => fs.reset()).toThrowError();
    });

    it('should split and join', () => {
      const parts = fs.split('/project/src/app/main.ts' as PotentialFsPath);
      expect(parts).toEqual(['', 'project', 'src', 'app', 'main.ts']);
      expect(fs.join('/', ...parts)).toBe('/project/src/app/main.ts');
    });
  });

  describe('find files', () => {
    it('should find the index.ts in project directory test1', () => {
      const found = fs.findFiles(
        toFsPath(path.join(__dirname, './find-files/test1')),
        'index.ts'
      );
      expect(found).toEqual([
        toFsPath(path.join(__dirname, 'find-files/test1/', 'index.ts')),
      ]);
    });

    it('should be case insensitive', () => {
      const found = fs.findFiles(
        toFsPath(path.join(__dirname, './find-files/test1')),
        'INDEX.ts'
      );
      expect(found).toEqual([
        toFsPath(path.join(__dirname, 'find-files/test1/', 'index.ts')),
      ]);
    });

    it('should find the index.ts in sub directory', () => {
      const found = fs.findFiles(
        toFsPath(path.join(__dirname, './find-files/test2')),
        'index.ts'
      );
      expect(found).toEqual([
        toFsPath(
          path.join(__dirname, 'find-files/test2', 'customers/index.ts')
        ),
      ]);
    });

    it('should find multiple index.ts recursively', () => {
      const found = fs.findFiles(
        toFsPath(path.join(__dirname, './find-files/test3')),
        'index.ts'
      );
      expect(found).toEqual(
        [
          'admin/booking/data/index.ts',
          'admin/booking/feature/index.ts',
          'customers/index.ts',
          'holidays/index.ts',
        ]
          .map((s) => path.join(__dirname, 'find-files/test3', s))
          .map(toFsPath)
      );
    });

    it('should find none if not in directory', () => {
      const found = fs.findFiles(
        toFsPath(path.join(__dirname, './find-files/test4')),
        'index.ts'
      );
      expect(found).toEqual([]);
    });
  });

  describe('findNearest', () => {
    it('should find in second parent', () => {
      const found = fs.findNearestParentFile(
        toFsPath(
          path.join(
            __dirname,
            './find-nearest/test1/customers/admin/core/feature/index.ts'
          )
        ),
        'tsconfig.json'
      );
      expect(found).toBe(
        toFsPath(
          path.join(__dirname, './find-nearest/test1/customers/tsconfig.json')
        )
      );
    });

    it('should stop at the first parent', () => {
      const found = fs.findNearestParentFile(
        toFsPath(
          path.join(
            __dirname,
            './find-nearest/test2/customers/admin/core/feature/index.ts'
          )
        ),
        'tsconfig.json'
      );
      expect(found).toBe(
        toFsPath(
          path.join(
            __dirname,
            './find-nearest/test2/customers/admin/core/tsconfig.json'
          )
        )
      );
    });

    it('should throw an error if not found', () => {
      expect(() =>
        fs.findNearestParentFile(
          toFsPath(
            path.join(
              __dirname,
              './find-nearest/test2/customers/admin/core/feature/index.ts'
            )
          ),
          'a file that does not exist'
        )
      ).toThrowError('cannot find a file that does not exist');
    });
  });
});
