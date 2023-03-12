import { beforeEach, describe, expect, it } from 'vitest';
import { VirtualFs } from './virtual-fs';

describe('Virtual Fs', () => {
  let fs: VirtualFs;

  beforeEach(() => {
    fs = new VirtualFs();
    fs.reset();
  });

  describe('create directories and navigation', () => {
    it('should generate a root dir', async () => {
      await fs.createDir('some-dir');
      expect(fs.exists('some-dir')).toBe(true);
    });

    it('should generate a nested dir', async () => {
      await fs.createDir('some-dir/sub-dir');
      expect(fs.exists('some-dir/sub-dir')).toBe(true);
    });

    it.each(['/', '.', '..'])(
      'should confirm existing directories: %s',
      (path) => {
        expect(fs.exists(path)).toBe(true);
      }
    );

    it('should not confirm non-existing directories', () => {
      expect(fs.exists('/foobar')).toBe(false);
    });

    it.each(['./../..', '/..', '../..'])(
      'should throw if directory below root is requested: %s',
      (path) => {
        expect(() => fs.exists(path)).toThrowError('/ has no parent');
      }
    );

    it('should use /project as cwd', async () => {
      await fs.createDir('some-dir');
      expect(fs.exists('/project/some-dir')).toBe(true);
    });

    for (const [dirToCreate, dirToBe] of [
      ['../././some-dir', '/some-dir'],
      ['./././some-dir', '/project/some-dir'],
      ['./some-dir', '/project/some-dir'],
      ['../some-dir', '/some-dir'],
    ]) {
      it(`should allow navigation over relative paths for ${dirToCreate}`, async () => {
        await fs.createDir(dirToCreate);
        expect(fs.exists(dirToBe)).toBe(true);
      });
    }
  });

  describe('create and read files', () => {
    it.each([
      { path: './main.ts', contents: 'import angular' },
      { path: '/main.ts', contents: 'import angular' },
      { path: '../main.ts', contents: 'import angular' },
      { path: 'main.ts', contents: 'import angular' },
      { path: './sub-dir/main.ts', contents: 'import angular' },
      { path: '/dir/main.ts', contents: 'import angular' },
    ])('should read and create single file %s', async ({ path, contents }) => {
      await fs.writeFile(path, contents);
      expect(await fs.readFile(path)).toBe(contents);
    });

    it('should create two files in the same dir', async () => {
      await fs.writeFile('app.component', 'content-a');
      await fs.writeFile('home.component', 'content home');

      expect(await fs.readFile('/project/app.component')).toBe('content-a');
      expect(await fs.readFile('/project/home.component')).toBe('content home');
    });

    it('should have nested dirs and files', async () => {
      await fs.createDir('sub-dir1');
      await fs.writeFile('sub-dir1/file1', 'content 1');
      await fs.createDir('sub-dir1/sub-dir2');
      await fs.writeFile('sub-dir1/sub-dir2/file1', 'content 2');

      expect(await fs.readFile('/project/sub-dir1/file1')).toBe('content 1');
      expect(await fs.readFile('/project/sub-dir1/sub-dir2/file1')).toBe(
        'content 2'
      );
    });

    it('fails if it is a directory', async () => {
      await fs.createDir('dir1');

      expect(fs.writeFile('/project/dir1', 'content 1')).rejects.toBe(
        'cannot write to file /project/dir1 because it is a directory'
      );
    });

    it('should fail if directory is created on existing file', async () => {
      await fs.writeFile('dir1', '');

      expect(fs.createDir('dir1')).rejects.toBe(
        'cannot create directory dir1 because it is a file'
      );
    });

    it('should reject on read, if file does not exist', async () => {
      expect(fs.readFile('dir1')).rejects.toBe('File dir1 does not exist');
    });

    it('should reject on read, if file is a directory', async () => {
      expect(fs.readFile('/project')).rejects.toBe(
        'cannot read from file /project because it is a directory'
      );
    });
  });

  describe('removing directories', () => {
    it('should remove folder', async () => {
      await fs.writeFile('file1', 'hello');
      await fs.writeFile('sub1/sub2/sub3/readme', 'hello');
      await fs.removeDir('/project');

      expect(fs.exists('/project')).toBe(false);
      expect(fs.exists('/project/file1')).toBe(false);
      expect(fs.exists('/project/sub1/sub2/sub3/readme')).toBe(false);
    });

    it('should reject on /', async () => {
      expect(fs.removeDir('/')).rejects.toBe('cannot delete root directory');
    });

    it('should reject on not existing directory', async () => {
      expect(fs.removeDir('/abc')).rejects.toBe(
        'cannot delete directory /abc because it does not exist'
      );
    });
  });

  describe('normalise', () => {
    it('should normalise', () => {
      expect(fs.normalise('/project/./..')).toBe('/');
      expect(fs.normalise('/project/./.')).toBe('/project');
      expect(fs.normalise('.')).toBe('.');
      expect(fs.normalise('./abc/..')).toBe('.');
      expect(fs.normalise('./main.ts')).toBe('main.ts');
      expect(fs.normalise('./project/..')).toBe('.');
    });
  });

  describe('search', () => {
    it('should find the index.ts in project directory', async () => {
      await fs.writeFile('index.ts', 'hello');
      const found = await fs.findFiles('.', 'index.ts');
      expect(found).toEqual(['index.ts']);
    });

    it('should be case insensitive', async () => {
      await fs.writeFile('index.ts', 'hello');
      const found = await fs.findFiles('.', 'INDEX.ts');
      expect(found).toEqual(['index.ts']);
    });

    it('should throw if dir is file', async () => {
      await fs.writeFile('index.ts', 'hello');
      await fs.writeFile('index', 'hello');
      await fs.writeFile('main.ts', 'hello');
      expect(() => fs.findFiles('index.ts', 'INDEX.ts')).toThrowError(
        'index.ts is not a directory'
      );
    });

    it('should find the index.ts in sub directory', async () => {
      await fs.writeFile('customers/index.ts', 'hello');
      const found = await fs.findFiles('.', 'index.ts');
      expect(found).toEqual(['customers/index.ts']);
    });

    it('should find multiple index.ts recursively', async () => {
      await fs.writeFile('customers/index.ts', 'hello');
      await fs.writeFile('holidays/index.ts', 'hello');
      await fs.writeFile('admin/booking/data/index.ts', 'hello');
      await fs.writeFile('admin/booking/feature/index.ts', 'hello');
      const found = await fs.findFiles('.', 'index.ts');
      expect(found).toEqual([
        'customers/index.ts',
        'holidays/index.ts',
        'admin/booking/data/index.ts',
        'admin/booking/feature/index.ts',
      ]);
    });

    it('should find none if not in directory', async () => {
      await fs.writeFile('customers/index.ts', 'hello');
      await fs.writeFile('holidays/index.ts', 'hello');
      const found = await fs.findFiles('customers', 'index.ts');
      expect(found).toEqual(['index.ts']);
    });
  });

  describe('findNearestFile', () => {
    it('should find in second parent', async () => {
      await fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      await fs.writeFile('customers/tsconfig.json', '');
      const found = await fs.findNearestParentFile(
        './customers/admin/core/feature/index.ts',
        'tsconfig.json'
      );
      expect(found).toBe('customers/tsconfig.json');
    });

    it('should stop at the first parent', async () => {
      await fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      await fs.writeFile('customers/tsconfig.json', '');
      await fs.writeFile('customers/admin/core/tsconfig.json', '');
      const found = await fs.findNearestParentFile(
        './customers/admin/core/feature/index.ts',
        'tsconfig.json'
      );
      expect(found).toBe('customers/admin/core/tsconfig.json');
    });

    it('should not find it', async () => {
      await fs.writeFile('index.ts', 'hello');
      expect(() =>
        fs.findNearestParentFile('index.ts', 'tsconfig.json')
      ).toThrowError('cannot find tsconfig.json near index.ts');
    });

    it('should find in same directory', async () => {
      await fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      await fs.writeFile('customers/admin/core/feature/tsconfig.json', '');
      const found = await fs.findNearestParentFile(
        './customers/admin/core/feature/index.ts',
        'tsconfig.json'
      );
      expect(found).toBe('customers/admin/core/feature/tsconfig.json');
    });
  });
});
