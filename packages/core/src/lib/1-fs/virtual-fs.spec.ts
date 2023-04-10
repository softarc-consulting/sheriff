import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { VirtualFs } from './virtual-fs';
import { toFsPath } from '../2-file-info/fs-path';
import getFs, { useVirtualFs } from './getFs';
import '../test/matchers';
import { toPotentialFsPath } from './potential-fs-path';

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
      fs.createDir(toPotentialFsPath('/some-dir'));
      expect(fs.exists('/some-dir')).toBe(true);
    });

    it('should generate a nested dir', () => {
      fs.createDir(toPotentialFsPath('/some-dir/sub-dir'));
      expect(fs.exists('/some-dir/sub-dir')).toBe(true);
    });

    it.each(['/', '.', '..'])(
      'should confirm existing directories: %s',
      (path) => {
        expect(fs.exists(path)).toBe(true);
      }
    );

    it('should get the parent', () => {
      const dir = fs.createDir(toPotentialFsPath('/project/src/main'));
      expect(fs.getParent(dir)).toBe('/project/src');
    });

    it('should not confirm non-existing directories', () => {
      expect(fs.exists('/foobar')).toBe(false);
    });

    it.each(['./../..', '/..', '../..'])(
      'should throw if directory below root is requested: %s',
      (path) => {
        expect(() => fs.exists(path)).toThrowError('/ has no parent');
      }
    );
  });

  describe('create and read files', () => {
    it.each([
      { path: '/main.ts', contents: 'import angular' },
      { path: '/project/../main.ts', contents: 'import angular' },
      { path: '/project/main.ts', contents: 'import angular' },
      { path: '/project/sub-dir/main.ts', contents: 'import angular' },
      { path: '/project/dir/main.ts', contents: 'import angular' },
    ])('should read and create single file %s', ({ path, contents }) => {
      fs.writeFile(toPotentialFsPath(path), contents);
      expect(fs.readFile(path)).toBe(contents);
    });

    it('should create two files in the same dir', () => {
      fs.writeFile(toPotentialFsPath('/app.component'), 'content-a');
      fs.writeFile(toPotentialFsPath('/home.component'), 'content home');

      expect(fs.readFile('/app.component')).toBe('content-a');
      expect(fs.readFile('/home.component')).toBe('content home');
    });

    it('should have nested dirs and files', () => {
      fs.createDir(toPotentialFsPath('/sub-dir1'));
      fs.writeFile(toPotentialFsPath('/sub-dir1/file1'), 'content 1');
      fs.createDir(toPotentialFsPath('/sub-dir1/sub-dir2'));
      fs.writeFile(toPotentialFsPath('/sub-dir1/sub-dir2/file1'), 'content 2');

      expect(fs.readFile('/sub-dir1/file1')).toBe('content 1');
      expect(fs.readFile('/sub-dir1/sub-dir2/file1')).toBe('content 2');
    });

    it('fails if it is a directory', () => {
      fs.createDir(toPotentialFsPath('/dir1'));

      expect(() =>
        fs.writeFile(toPotentialFsPath('/dir1'), 'content 1')
      ).toThrowError('cannot write to file /dir1 because it is a directory');
    });

    it('should fail if directory is created on existing file', () => {
      fs.writeFile(toPotentialFsPath('/dir1'), '');

      expect(() => fs.createDir(toPotentialFsPath('/dir1'))).toThrowError(
        'cannot create directory /dir1 because it is a file'
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
      fs.writeFile(toPotentialFsPath('/file1'), 'hello');
      fs.writeFile(toPotentialFsPath('/sub1/sub2/sub3/readme'), 'hello');
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
      fs.writeFile(toPotentialFsPath('/project/index.ts'), 'hello');
      const found = fs.findFiles(toFsPath('/project'), 'index.ts');
      expect(found).toEqual(['/project/index.ts']);
    });

    it('should be case insensitive', () => {
      fs.writeFile(toPotentialFsPath('/index.ts'), 'hello');
      const found = fs.findFiles(toFsPath('/'), 'INDEX.ts');
      expect(found).toEqual(['/index.ts']);
    });

    it('should throw if dir is file', () => {
      fs.writeFile(toPotentialFsPath('/index.ts'), 'hello');
      fs.writeFile(toPotentialFsPath('/index'), 'hello');
      fs.writeFile(toPotentialFsPath('/main.ts'), 'hello');
      expect(() =>
        fs.findFiles(toFsPath('/index.ts'), 'INDEX.ts')
      ).toThrowError('index.ts is not a directory');
    });

    it('should find the index.ts in sub directory', () => {
      fs.writeFile(toPotentialFsPath('/customers/index.ts'), 'hello');
      const found = fs.findFiles(toFsPath('/'), 'index.ts');
      expect(found).toEqual(['/customers/index.ts']);
    });

    it('should find multiple index.ts recursively', () => {
      fs.writeFile(toPotentialFsPath('/customers/index.ts'), 'hello');
      fs.writeFile(toPotentialFsPath('/holidays/index.ts'), 'hello');
      fs.writeFile(toPotentialFsPath('/admin/booking/data/index.ts'), 'hello');
      fs.writeFile(
        toPotentialFsPath('/admin/booking/feature/index.ts'),
        'hello'
      );
      const found = fs.findFiles(toFsPath('/'), 'index.ts');
      expect(found).toEqual([
        '/customers/index.ts',
        '/holidays/index.ts',
        '/admin/booking/data/index.ts',
        '/admin/booking/feature/index.ts',
      ]);
    });

    it('should find none if not in directory', () => {
      fs.createDir(toPotentialFsPath('/shop'));
      fs.writeFile(toPotentialFsPath('/customers/index.ts'), 'hello');
      fs.writeFile(toPotentialFsPath('/holidays/index.ts'), 'hello');
      const found = fs.findFiles(toFsPath('/shop'), 'index.ts');
      expect(found).toEqual([]);
    });
  });

  describe('findNearestFile', () => {
    it('should find in second parent', () => {
      fs.writeFile(
        toPotentialFsPath('/customers/admin/core/feature/index.ts'),
        'hello'
      );
      fs.writeFile(toPotentialFsPath('/customers/tsconfig.json'), '');
      const found = fs.findNearestParentFile(
        toFsPath('/customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBe('/customers/tsconfig.json');
    });

    it('should stop at the first parent', () => {
      fs.writeFile(
        toPotentialFsPath('/customers/admin/core/feature/index.ts'),
        'hello'
      );
      fs.writeFile(toPotentialFsPath('/customers/tsconfig.json'), '');
      fs.writeFile(
        toPotentialFsPath('/customers/admin/core/tsconfig.json'),
        ''
      );
      const found = fs.findNearestParentFile(
        toFsPath('/customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBe('/customers/admin/core/tsconfig.json');
    });

    it('should not find it', () => {
      fs.writeFile(toPotentialFsPath('/index.ts'), 'hello');
      expect(() =>
        fs.findNearestParentFile(toFsPath('/index.ts'), 'tsconfig.json')
      ).toThrowError('cannot find tsconfig.json near /index.ts');
    });

    it('should find in same directory', () => {
      fs.writeFile(
        toPotentialFsPath('/customers/admin/core/feature/index.ts'),
        'hello'
      );
      fs.writeFile(
        toPotentialFsPath('/customers/admin/core/feature/tsconfig.json'),
        ''
      );
      const found = fs.findNearestParentFile(
        toFsPath('/customers/admin/core/feature/index.ts'),
        'tsconfig.json'
      );
      expect(found).toBe('/customers/admin/core/feature/tsconfig.json');
    });
  });
});
