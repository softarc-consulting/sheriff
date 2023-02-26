import { beforeAll, beforeEach, describe, it, expect } from 'vitest';
import getFs, { useVirtualFs } from '../fs/getFs';
import FileInfo, { buildFileInfo } from '../file-info/file-info';
import getProjectDirsFromFileInfo from './get-project-dirs-from-file-info';
import Fs from '../fs/fs';

export type TestParam = {
  name: string;
  projectDirs: string[];
  fileInfo: FileInfo;
};

const cli: TestParam = {
  name: 'cli',
  projectDirs: ['src'],
  fileInfo: buildFileInfo('src/app/main.ts', [
    [
      './app.component.ts',
      ['./customer.componen.ts', './holiday.component.ts'],
    ],
  ]),
};

const nx: TestParam = {
  name: 'nx',
  projectDirs: ['apps', 'libs'],
  fileInfo: buildFileInfo('apps/sheriff/src/app/main.ts', [
    [
      './app.component.ts',
      [
        'libs/customers/src/lib/customer.component.ts',
        'libs/holidays/src/lib/holiday.component.ts',
      ],
    ],
  ]),
};

const custom: TestParam = {
  name: 'custom',
  projectDirs: ['app', 'sheriff', 'customers', 'holidays'],
  fileInfo: buildFileInfo('app/main.ts', [
    [
      'sheriff/app.component.ts',
      ['customers/customer.component.ts', 'holidays/holiday.component.ts'],
    ],
  ]),
};

const root: TestParam = {
  name: 'root',
  projectDirs: ['.'],
  fileInfo: buildFileInfo('main.ts', [
    'src/app/customer.component.ts',
    'src/app/holiday.component.ts',
  ]),
};

const outside: TestParam = {
  name: 'outside',
  projectDirs: [],
  fileInfo: {
    path: 'src/app/main.ts',
    imports: [
      {
        path: '../customers.component.ts',
        imports: [],
      },
      {
        path: '../holidays/holidays.component.ts',
        imports: [],
      },
    ],
  },
};

describe('get project dirs from file info', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  it.each([cli, nx, custom, root])(
    'should find project dirs for $name config',
    (param) => {
      const projectDirs = getProjectDirsFromFileInfo(param.fileInfo);
      expect(projectDirs).toEqual(param.projectDirs);
    }
  );

  it('should throw if fileInfo is outside of project', () => {
    expect(() => getProjectDirsFromFileInfo(outside.fileInfo)).toThrowError(
      'file is outside of project directory: ../customers.component.ts'
    );
  });
});
