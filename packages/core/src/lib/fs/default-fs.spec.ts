import { DefaultFs } from './default-fs';
import { describe, expect, it } from 'vitest';
import * as path from 'path';

describe('Default Fs', () => {
  let fs = new DefaultFs();

  describe('find files', () => {
    it('should find the index.ts in project directory test1', async () => {
      const found = await fs.findFiles(
        path.join(__dirname, './find-files/test1'),
        'index.ts'
      );
      expect(found).toEqual(['index.ts']);
    });

    it('should be case insensitive', async () => {
      const found = await fs.findFiles(
        path.join(__dirname, './find-files/test1'),
        'INDEX.ts'
      );
      expect(found).toEqual(['index.ts']);
    });

    it('should find the index.ts in sub directory', async () => {
      const found = await fs.findFiles(
        path.join(__dirname, './find-files/test2'),
        'index.ts'
      );
      expect(found).toEqual(['customers/index.ts']);
    });

    it('should find multiple index.ts recursively', async () => {
      const found = await fs.findFiles(
        path.join(__dirname, './find-files/test3'),
        'index.ts'
      );
      expect(found).toEqual([
        'admin/booking/data/index.ts',
        'admin/booking/feature/index.ts',
        'customers/index.ts',
        'holidays/index.ts',
      ]);
    });

    it('should find none if not in directory', async () => {
      const found = await fs.findFiles(
        path.join(__dirname, './find-files/test4'),
        'index.ts'
      );
      expect(found).toEqual([]);
    });
  });

  describe('findNearest', async () => {
    it('should find in second parent', async () => {
      const found = await fs.findNearestParentFile(
        path.join(
          __dirname,
          './find-nearest/test1/customers/admin/core/feature/index.ts'
        ),
        'tsconfig.json'
      );
      expect(found).toBe(
        path.join(__dirname, './find-nearest/test1/customers/tsconfig.json')
      );
    });

    it('should stop at the first parent', async () => {
      const found = await fs.findNearestParentFile(
        path.join(
          __dirname,
          './find-nearest/test2/customers/admin/core/feature/index.ts'
        ),
        'tsconfig.json'
      );
      expect(found).toBe(
        path.join(
          __dirname,
          './find-nearest/test2/customers/admin/core/tsconfig.json'
        )
      );
    });

    it('should throw an error if not found', () => {
      expect(() =>
        fs.findNearestParentFile(
          path.join(
            __dirname,
            './find-nearest/test2/customers/admin/core/feature/index.ts'
          ),
          'a file that does not exist'
        )
      ).toThrowError('cannot find a file that does not exist');
    });
  });
});
