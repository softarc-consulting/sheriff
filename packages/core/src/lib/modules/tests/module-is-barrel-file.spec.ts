import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { Module } from '../module';
import { FsPath, toFsPath } from '../../file-info/fs-path';
import { FileInfo } from '../file.info';
import getFs, { useVirtualFs } from '../../fs/getFs';

describe('Module.isBarrelFile', () => {
  const fileInfoMap = new Map<FsPath, FileInfo>();
  const getFileInfo = () => undefined as unknown as FileInfo;

  beforeAll(() => {
    useVirtualFs();
  });

  afterEach(() => {
    getFs().reset();
  });

  function setupModule(
    modulePath: string,
    barrelFile: string,
    files: string[],
  ): Module {
    const fs = getFs();
    fs.createDir(modulePath);
    for (const file of files) {
      fs.writeFile(file, '');
    }

    return new Module(
      toFsPath(modulePath),
      fileInfoMap,
      getFileInfo,
      false,
      true,
      barrelFile,
    );
  }

  it('should match the main barrel file', () => {
    const module = setupModule('/src/app/customers', 'index.ts', [
      '/src/app/customers/index.ts',
    ]);
    expect(module.isBarrelFile(toFsPath('/src/app/customers/index.ts'))).toBe(
      true,
    );
  });

  it('should match sub-barrel files with index.ts convention', () => {
    const module = setupModule('/src/app/customers', 'index.ts', [
      '/src/app/customers/index.ts',
      '/src/app/customers/index.routing.ts',
      '/src/app/customers/index.bookmarks.ts',
    ]);
    expect(
      module.isBarrelFile(toFsPath('/src/app/customers/index.routing.ts')),
    ).toBe(true);
    expect(
      module.isBarrelFile(toFsPath('/src/app/customers/index.bookmarks.ts')),
    ).toBe(true);
  });

  it('should match sub-barrel files with custom barrel name', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/customers/public-api.routing.ts',
      '/src/app/customers/public-api.bookmarks.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/src/app/customers/public-api.routing.ts'),
      ),
    ).toBe(true);
    expect(
      module.isBarrelFile(
        toFsPath('/src/app/customers/public-api.bookmarks.ts'),
      ),
    ).toBe(true);
  });

  it('should not match unrelated files in the same directory', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/customers/customer.component.ts',
      '/src/app/customers/other.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/src/app/customers/customer.component.ts'),
      ),
    ).toBe(false);
    expect(
      module.isBarrelFile(toFsPath('/src/app/customers/other.ts')),
    ).toBe(false);
  });

  it('should not match files in subdirectories', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/customers/sub/public-api.routing.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/src/app/customers/sub/public-api.routing.ts'),
      ),
    ).toBe(false);
  });

  it('should not match files in parent directories', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/public-api.routing.ts',
    ]);
    expect(
      module.isBarrelFile(toFsPath('/src/app/public-api.routing.ts')),
    ).toBe(false);
  });

  it('should not match files with different extension', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/customers/public-api.routing.js',
    ]);
    expect(
      module.isBarrelFile(toFsPath('/src/app/customers/public-api.routing.js')),
    ).toBe(false);
  });

  it('should not match the barrel file name as a prefix without dot separator', () => {
    const module = setupModule('/src/app/customers', 'public-api.ts', [
      '/src/app/customers/public-api.ts',
      '/src/app/customers/public-api-routing.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/src/app/customers/public-api-routing.ts'),
      ),
    ).toBe(false);
  });
});
