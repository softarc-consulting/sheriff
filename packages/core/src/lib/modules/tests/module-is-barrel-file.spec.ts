import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Module } from '../module';
import { FsPath, toFsPath } from '../../file-info/fs-path';
import { FileInfo } from '../file.info';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { createGlobMatcher } from '../../util/match-glob';

describe('Module.isBarrelFile', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  afterEach(() => {
    getFs().reset();
  });

  function writePaths(...paths: string[]) {
    const fs = getFs();
    for (const p of paths) {
      fs.writeFile(p, '');
    }
  }

  function createModule(
    modulePath: string,
    barrelFilePatterns: string[],
  ): Module {
    const fileInfoMap = new Map<FsPath, FileInfo>();
    const getFileInfo = (path: FsPath) => {
      throw new Error(`not needed for this test: ${path}`);
    };
    return new Module(
      toFsPath(modulePath),
      fileInfoMap,
      getFileInfo,
      false,
      true,
      createGlobMatcher(barrelFilePatterns),
    );
  }

  it('should match a barrel file at the module root', () => {
    writePaths('/project/src/app/orders/index.ts');
    const module = createModule('/project/src/app/orders', ['index.ts']);
    expect(
      module.isBarrelFile(toFsPath('/project/src/app/orders/index.ts')),
    ).toBe(true);
  });

  it('should reject a nested file with a barrel-like name', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/internal/index.ts',
    );
    const module = createModule('/project/src/app/orders', ['index.ts']);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/internal/index.ts'),
      ),
    ).toBe(false);
  });

  it('should reject a deeply nested file with a barrel-like name', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/feature/sub/index.ts',
    );
    const module = createModule('/project/src/app/orders', ['index.ts']);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/feature/sub/index.ts'),
      ),
    ).toBe(false);
  });

  it('should match glob barrel patterns at the module root', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/index.routing.ts',
    );
    const module = createModule('/project/src/app/orders', [
      'index.ts',
      'index.*.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/index.routing.ts'),
      ),
    ).toBe(true);
  });

  it('should reject nested files matching glob barrel patterns', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/feature/index.routing.ts',
    );
    const module = createModule('/project/src/app/orders', [
      'index.ts',
      'index.*.ts',
    ]);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/feature/index.routing.ts'),
      ),
    ).toBe(false);
  });

  it('should reject non-barrel files at the module root', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/order-list.component.ts',
    );
    const module = createModule('/project/src/app/orders', ['index.ts']);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/order-list.component.ts'),
      ),
    ).toBe(false);
  });

  it('should match multiple explicit barrel patterns', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/orders/index.routing.ts',
      '/project/src/app/orders/index.state.ts',
    );
    const module = createModule('/project/src/app/orders', [
      'index.ts',
      'index.routing.ts',
      'index.state.ts',
    ]);
    expect(
      module.isBarrelFile(toFsPath('/project/src/app/orders/index.ts')),
    ).toBe(true);
    expect(
      module.isBarrelFile(
        toFsPath('/project/src/app/orders/index.routing.ts'),
      ),
    ).toBe(true);
    expect(
      module.isBarrelFile(toFsPath('/project/src/app/orders/index.state.ts')),
    ).toBe(true);
  });

  it('should reject barrel files from a different module', () => {
    writePaths(
      '/project/src/app/orders/index.ts',
      '/project/src/app/customers/index.ts',
    );
    const module = createModule('/project/src/app/orders', ['index.ts']);
    expect(
      module.isBarrelFile(toFsPath('/project/src/app/customers/index.ts')),
    ).toBe(false);
  });
});
