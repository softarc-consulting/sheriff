import { buildFileInfo } from '../file-info/file-info';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createModules } from '../modules/create-modules';
import { checkDeepImports } from './check-deep-imports';
import { findAssignedFileInfo } from '../test/find-assigned-file-info';
import getFs, { useVirtualFs } from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';

describe('check deep imports', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should detect a deep import', () => {
    const fileInfo = buildFileInfo('/projects/main.ts', [
      '/projects/customers/customer.component.ts',
    ]);
    getFs().writeFile('/projects/customers/index.ts', '');
    const modulePaths = ['/projects/customers/index.ts'].map(toFsPath);

    const moduleInfos = createModules(
      fileInfo,
      modulePaths,
      toFsPath('/projects')
    );
    const deepImport = checkDeepImports(moduleInfos);

    expect(deepImport).toEqual({
      file: findAssignedFileInfo(moduleInfos, '/projects/main.ts'),
      deepImport: findAssignedFileInfo(
        moduleInfos,
        '/projects/customers/customer.component.ts'
      ),
    });
  });

  it('should not detect a deep import', () => {
    const fileInfo = buildFileInfo('/main.ts', [
      ['/customers/index.ts', ['/customers/customer.component.ts']],
    ]);
    const modulePaths = ['/customers/index.ts'].map(toFsPath);

    const moduleInfos = createModules(fileInfo, modulePaths, toFsPath('/'));
    expect(checkDeepImports(moduleInfos)).toBeUndefined();
  });
});
