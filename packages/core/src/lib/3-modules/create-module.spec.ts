import FileInfo, { buildFileInfo } from '../2-file-info/file-info';
import { createModules } from './create-modules';
import findFileInfo from '../test/find-file-info';
import { Module } from './module';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import throwIfNull from '../util/throw-if-null';
import getFs, { useVirtualFs } from '../1-fs/getFs';
import { assertFsPath } from '../2-file-info/fs-path';

type TestParameter = {
  name: string;
  fileInfo: FileInfo;
  modulePaths: string[];
  expectedModules: { path: string; fileInfoPaths: string[] }[];
};

const simple: () => TestParameter = () => ({
  name: 'simple',
  fileInfo: buildFileInfo('/src/app/app.component.ts', [
    './customers/customer.component.ts',
    ['./holidays/index.ts', ['./holiday.component.ts']],
  ]),
  modulePaths: ['/src/app/customers/index.ts', '/src/app/holidays/index.ts'],
  expectedModules: [
    {
      path: '/src/app/customers/index.ts',
      fileInfoPaths: ['/src/app/customers/customer.component.ts'],
    },
    {
      path: '/src/app/holidays/index.ts',
      fileInfoPaths: [
        '/src/app/holidays/index.ts',
        '/src/app/holidays/holiday.component.ts',
      ],
    },
    {
      path: '/',
      fileInfoPaths: ['/src/app/app.component.ts'],
    },
  ],
});

const multipleFilesPerModule: () => TestParameter = () => ({
  name: 'multiple files per module',
  fileInfo: buildFileInfo('/src/app/app.component.ts', [
    './customers/customer.component.ts',
    './customers/detail.component.ts',
    './customers/customer.service.ts',
    [
      './holidays/index.ts',
      ['./holiday.component.ts', './detail.component.ts', './holiday.pipe.ts'],
    ],
  ]),
  modulePaths: ['/src/app/customers/index.ts', '/src/app/holidays/index.ts'],
  expectedModules: [
    {
      path: '/src/app/customers/index.ts',
      fileInfoPaths: [
        '/src/app/customers/customer.component.ts',
        '/src/app/customers/detail.component.ts',
        '/src/app/customers/customer.service.ts',
      ],
    },
    {
      path: '/src/app/holidays/index.ts',
      fileInfoPaths: [
        '/src/app/holidays/index.ts',
        '/src/app/holidays/holiday.component.ts',
        '/src/app/holidays/detail.component.ts',
        '/src/app/holidays/holiday.pipe.ts',
      ],
    },
    { path: '/', fileInfoPaths: ['/src/app/app.component.ts'] },
  ],
});

const noModules: () => TestParameter = () => ({
  name: 'no modules',
  fileInfo: buildFileInfo('/src/app/app.component.ts', [
    './customers/customer.component.ts',
    './holidays/holiday.component.ts',
  ]),
  modulePaths: [],
  expectedModules: [
    {
      path: '/',
      fileInfoPaths: [
        '/src/app/app.component.ts',
        '/src/app/customers/customer.component.ts',
        '/src/app/holidays/holiday.component.ts',
      ],
    },
  ],
});

const nestedModules: () => TestParameter = () => ({
  name: 'nested modules',
  fileInfo: buildFileInfo('/src/app/main.ts', [
    [
      './app.component.ts',
      [
        [
          './customers/customer.component.ts',
          [
            './feature/feature.service.ts',
            './data/customer.facade.ts',
            './ui/ui.component.ts',
          ],
        ],
      ],
    ],
  ]),
  modulePaths: [
    '/src/app/customers/index.ts',
    '/src/app/customers/feature/index.ts',
    '/src/app/customers/data/index.ts',
    '/src/app/customers/ui/index.ts',
  ],
  expectedModules: [
    {
      path: '/src/app/customers/index.ts',
      fileInfoPaths: ['/src/app/customers/customer.component.ts'],
    },
    {
      path: '/src/app/customers/feature/index.ts',
      fileInfoPaths: ['/src/app/customers/feature/feature.service.ts'],
    },
    {
      path: '/src/app/customers/data/index.ts',
      fileInfoPaths: ['/src/app/customers/data/customer.facade.ts'],
    },
    {
      path: '/src/app/customers/ui/index.ts',
      fileInfoPaths: ['/src/app/customers/ui/ui.component.ts'],
    },
    {
      path: '/',
      fileInfoPaths: ['/src/app/main.ts', '/src/app/app.component.ts'],
    },
  ],
});

const multipleDirectories: () => TestParameter = () => ({
  name: 'multiple directories',
  fileInfo: buildFileInfo('/src/app/main.ts', [
    [
      './app.component.ts',
      [
        [
          './customers/customer.component.ts',
          [
            './feature/feature.service.ts',
            './data/customer.facade.ts',
            './ui/ui.component.ts',
          ],
        ],
      ],
    ],
  ]),
  modulePaths: ['/src/app/customers/index.ts'],
  expectedModules: [
    {
      path: '/src/app/customers/index.ts',
      fileInfoPaths: [
        '/src/app/customers/customer.component.ts',
        '/src/app/customers/feature/feature.service.ts',
        '/src/app/customers/data/customer.facade.ts',
        '/src/app/customers/ui/ui.component.ts',
      ],
    },
    {
      path: '/',
      fileInfoPaths: ['/src/app/main.ts', '/src/app/app.component.ts'],
    },
  ],
});

describe('create module infos', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it.each([
    ['simple', simple],
    ['multipleFilesPerModule', multipleFilesPerModule],
    ['noModules', noModules],
    ['nestedModules', nestedModules],
    ['multipleDirectories', multipleDirectories],
  ])(
    'should create a moduleInfos for configuration: %s',
    (_, createTestParams) => {
      const { fileInfo, modulePaths, expectedModules } = createTestParams();
      modulePaths.forEach((modulePath) => getFs().writeFile(modulePath, ''));
      const moduleInfos = createModules(
        fileInfo,
        new Set(modulePaths.map(assertFsPath)),
        assertFsPath('/')
      );

      expect(moduleInfos).toEqual(
        expectedModules.map((mi) => {
          const fileInfos = mi.fileInfoPaths.map((fip) =>
            throwIfNull(
              findFileInfo(fileInfo, fip),
              `${fip} does not exist in passed FileInfo`
            )
          );
          const moduleInfo = new Module(assertFsPath(mi.path));
          for (const fi of fileInfos) {
            moduleInfo.assignFileInfo(fi);
          }

          return moduleInfo;
        })
      );
    }
  );
});

it.todo('should check for directory path with implicit index.ts');
it.todo(
  'should assign two imports with implicit and explict index.ts to the same module'
);
