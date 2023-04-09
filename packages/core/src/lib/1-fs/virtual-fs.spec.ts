import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { VirtualFs } from './virtual-fs';
import { inVfs } from '../test/in-vfs';
import { toFsPath } from '../2-file-info/fs-path';
import getFs, { useVirtualFs } from './getFs';
import '../test/matchers';

describe('Virtual Fs', () => {
  let fs: VirtualFs;

  beforeAll(() => {
    useVirtualFs();
    fs = getFs() as VirtualFs;
  });

  beforeEach(() => {
    fs.reset();
  });

  describe('create directories and navigation', () => {
    it('should generate a root dir', () => {
      fs.createDir('some-dir');
      expect(fs.exists('some-dir')).toBe(true);
    });

    it('should generate a nested dir', () => {
      fs.createDir('some-dir/sub-dir');
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

    it('should use /project as cwd', () => {
      fs.createDir('some-dir');
      expect(fs.exists('/project/some-dir')).toBe(true);
    });

    for (const [dirToCreate, dirToBe] of [
      ['../././some-dir', '/some-dir'],
      ['./././some-dir', '/project/some-dir'],
      ['./some-dir', '/project/some-dir'],
      ['../some-dir', '/some-dir'],
    ]) {
      it(`should allow navigation over relative paths for ${dirToCreate}`, () => {
        fs.createDir(dirToCreate);
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
    ])('should read and create single file %s', ({ path, contents }) => {
      fs.writeFile(path, contents);
      expect(fs.readFile(path)).toBe(contents);
    });

    it('should create two files in the same dir', () => {
      fs.writeFile('app.component', 'content-a');
      fs.writeFile('home.component', 'content home');

      expect(fs.readFile('/project/app.component')).toBe('content-a');
      expect(fs.readFile('/project/home.component')).toBe('content home');
    });

    it('should have nested dirs and files', () => {
      fs.createDir('sub-dir1');
      fs.writeFile('sub-dir1/file1', 'content 1');
      fs.createDir('sub-dir1/sub-dir2');
      fs.writeFile('sub-dir1/sub-dir2/file1', 'content 2');

      expect(fs.readFile('/project/sub-dir1/file1')).toBe('content 1');
      expect(fs.readFile('/project/sub-dir1/sub-dir2/file1')).toBe('content 2');
    });

    it('fails if it is a directory', () => {
      fs.createDir('dir1');

      expect(() => fs.writeFile('/project/dir1', 'content 1')).toThrowError(
        'cannot write to file /project/dir1 because it is a directory'
      );
    });

    it('should fail if directory is created on existing file', () => {
      fs.writeFile('dir1', '');

      expect(() => fs.createDir('dir1')).toThrowError(
        'cannot create directory dir1 because it is a file'
      );
    });

    it('should reject on read, if file does not exist', () => {
      expect(() => fs.readFile('dir1')).toThrowError(
        'File dir1 does not exist'
      );
    });

    it('should reject on read, if file is a directory', () => {
      expect(() => fs.readFile('/project')).toThrowError(
        'cannot read from file /project because it is a directory'
      );
    });
  });

  describe('removing directories', () => {
    it('should remove folder', () => {
      fs.writeFile('file1', 'hello');
      fs.writeFile('sub1/sub2/sub3/readme', 'hello');
      fs.removeDir('/project');

      expect(fs.exists('/project')).toBe(false);
      expect(fs.exists('/project/file1')).toBe(false);
      expect(fs.exists('/project/sub1/sub2/sub3/readme')).toBe(false);
    });

    it('should reject on /', () => {
      expect(() => fs.removeDir('/')).toThrowError(
        'cannot delete root directory'
      );
    });

    it('should reject on not existing directory', () => {
      expect(() => fs.removeDir('/abc')).toThrowError(
        'cannot delete directory /abc because it does not exist'
      );
    });
  });

  describe('search', () => {
    it('should find the index.ts in project directory', () => {
      fs.writeFile('index.ts', 'hello');
      const found = fs.findFiles(toFsPath('/project'), 'index.ts');
      expect(found).toBeVfsFiles(['index.ts']);
    });

    it('should be case insensitive', () => {
      fs.writeFile('index.ts', 'hello');
      const found = fs.findFiles(toFsPath('/project'), 'INDEX.ts');
      expect(found).toBeVfsFiles(['index.ts']);
    });

    it('should throw if dir is file', () => {
      fs.writeFile('index.ts', 'hello');
      fs.writeFile('index', 'hello');
      fs.writeFile('main.ts', 'hello');
      expect(() =>
        fs.findFiles(toFsPath('/project/index.ts'), 'INDEX.ts')
      ).toThrowError('index.ts is not a directory');
    });

    it('should find the index.ts in sub directory', () => {
      fs.writeFile('customers/index.ts', 'hello');
      const found = fs.findFiles(toFsPath('/project'), 'index.ts');
      expect(found).toBeVfsFiles(['customers/index.ts']);
    });

    it('should find multiple index.ts recursively', () => {
      fs.writeFile('customers/index.ts', 'hello');
      fs.writeFile('holidays/index.ts', 'hello');
      fs.writeFile('admin/booking/data/index.ts', 'hello');
      fs.writeFile('admin/booking/feature/index.ts', 'hello');
      const found = fs.findFiles(toFsPath('/project'), 'index.ts');
      expect(found).toBeVfsFiles([
        'customers/index.ts',
        'holidays/index.ts',
        'admin/booking/data/index.ts',
        'admin/booking/feature/index.ts',
      ]);
    });

    it('should find none if not in directory', () => {
      fs.createDir('shop');
      fs.writeFile('customers/index.ts', 'hello');
      fs.writeFile('holidays/index.ts', 'hello');
      const found = fs.findFiles(toFsPath('/project/shop'), 'index.ts');
      expect(found).toEqual([]);
    });
  });

  describe('findNearestFile', () => {
    it('should find in second parent', () => {
      fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      fs.writeFile('customers/tsconfig.json', '');
      const found = fs.findNearestParentFile(
        inVfs('./customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBeVfsFile('customers/tsconfig.json');
    });

    it('should stop at the first parent', () => {
      fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      fs.writeFile('customers/tsconfig.json', '');
      fs.writeFile('customers/admin/core/tsconfig.json', '');
      const found = fs.findNearestParentFile(
        inVfs('./customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBeVfsFile('customers/admin/core/tsconfig.json');
    });

    it('should not find it', () => {
      fs.writeFile('index.ts', 'hello');
      expect(() =>
        fs.findNearestParentFile(inVfs('index.ts'), 'tsconfig.json')
      ).toThrowError('cannot find tsconfig.json near /project/index.ts');
    });

    it('should find in same directory', () => {
      fs.writeFile('customers/admin/core/feature/index.ts', 'hello');
      fs.writeFile('customers/admin/core/feature/tsconfig.json', '');
      const found = fs.findNearestParentFile(
        inVfs('./customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBeVfsFile('customers/admin/core/feature/tsconfig.json');
    });
  });
});
