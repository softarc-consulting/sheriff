import { DefaultFs } from './default-fs';
import { describe, it, beforeEach, expect, test } from 'vitest';
import path from 'path';

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
});
