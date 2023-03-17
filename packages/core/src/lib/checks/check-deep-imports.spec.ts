import { buildFileInfo } from '../file-info/file-info';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createModuleInfos } from '../modules/create-module-infos';
import { checkDeepImports } from './check-deep-imports';
import { findAssignedFileInfo } from '../test/find-assigned-file-info';
import getFs, { useVirtualFs } from '../fs/getFs';

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
    const modulePaths = ['/projects/customers/index.ts'];

    const moduleInfos = createModuleInfos(fileInfo, modulePaths);
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
    const modulePaths = ['/customers/index.ts'];

    const moduleInfos = createModuleInfos(fileInfo, modulePaths);
    expect(checkDeepImports(moduleInfos)).toBeUndefined();
  });
});
