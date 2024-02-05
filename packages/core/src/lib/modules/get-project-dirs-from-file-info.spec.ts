import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import getFs, { useVirtualFs } from '../fs/getFs';
import UnassignedFileInfo, { buildFileInfo } from '../file-info/unassigned-file-info';
import { getProjectDirsFromFileInfo } from './get-project-dirs-from-file-info';
import { toFsPath } from '../file-info/fs-path';

export interface TestParam {
  name: string;
  rootDir: string;
  projectDirs: string[];
  fileInfo: UnassignedFileInfo;
}

const cli = (): TestParam => ({
  name: 'cli',
  rootDir: '/src',
  projectDirs: ['/src/app'],
  fileInfo: buildFileInfo('/src/app/main.ts', [
    [
      './app.component.ts',
      ['./customer.component.ts', './holiday.component.ts'],
    ],
  ]),
});

const nx = (): TestParam => ({
  name: 'nx',
  rootDir: '/project',
  projectDirs: ['/project/apps', '/project/libs'],
  fileInfo: buildFileInfo('/project/apps/sheriff/src/app/main.ts', [
    [
      './app.component.ts',
      [
        '/project/libs/customers/src/lib/customer.component.ts',
        '/project/libs/holidays/src/lib/holiday.component.ts',
      ],
    ],
  ]),
});

const custom = (): TestParam => ({
  name: 'custom',
  rootDir: '/project',
  projectDirs: [
    '/project/app',
    '/project/sheriff',
    '/project/customers',
    '/project/holidays',
  ],
  fileInfo: buildFileInfo('/project/app/main.ts', [
    [
      '/project/sheriff/app.component.ts',
      [
        '/project/customers/customer.component.ts',
        '/project/holidays/holiday.component.ts',
      ],
    ],
  ]),
});

const root = (): TestParam => ({
  name: 'root',
  rootDir: '/project',
  projectDirs: ['/project'],
  fileInfo: buildFileInfo('/project/main.ts', [
    '/project/src/app/customer.component.ts',
    '/project/src/app/holiday.component.ts',
  ]),
});

describe('get project dirs from file info', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it.each([
    ['cli', cli],
    ['nx', nx],
    ['custom', custom],
    ['root', root],
  ])(
    'should find project dirs for %s config',
    (_, paramSupplier: () => TestParam) => {
      const param = paramSupplier();
      const projectDirs = getProjectDirsFromFileInfo(
        param.fileInfo,
        toFsPath(param.rootDir)
      );
      expect(projectDirs).toEqual(param.projectDirs);
    }
  );

  it('should throw if fileInfo is outside of project', () => {
    const fileInfo = buildFileInfo('/project/src/app/main.ts', [
      '/customers/customer.component.ts',
    ]);
    expect(() =>
      getProjectDirsFromFileInfo(fileInfo, toFsPath('/project'))
    ).toThrowError(
      '/customers/customer.component.ts is outside of root directory: /project'
    );
  });
});
