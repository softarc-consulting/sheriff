import { UnassignedFileInfo } from '../../file-info/unassigned-file-info';
import { createModules } from '../create-modules';
import findFileInfo from '../../test/find-file-info';
import { Module } from '../module';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import throwIfNull from '../../util/throw-if-null';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { FsPath, toFsPath } from '../../file-info/fs-path';
import { FileInfo } from '../file.info';
import { buildFileInfo } from '../../test/build-file-info';
import { fromEntries } from '../../util/typed-object-functions';

interface TestParameter {
  fileInfo: UnassignedFileInfo;
  barrelFiles: string[];
  expectedModules: { path: string; fileInfoPaths: string[] }[];
}

describe('createModule', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  afterEach(() => {
    getFs().reset();
  });
  it('should create module for simple configuration', () => {
    assertModule(() => ({
      fileInfo: buildFileInfo('/src/app/app.component.ts', [
        './customers/customer.component.ts',
        ['./holidays/index.ts', ['./holiday.component.ts']],
      ]),
      barrelFiles: [
        '/src/app/customers/index.ts',
        '/src/app/holidays/index.ts',
      ],
      expectedModules: [
        {
          path: '/src/app/customers',
          fileInfoPaths: ['/src/app/customers/customer.component.ts'],
        },
        {
          path: '/src/app/holidays',
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
    }));
  });

  it('should create module for multiple files per module configuration', () => {
    assertModule(() => ({
      fileInfo: buildFileInfo('/src/app/app.component.ts', [
        './customers/customer.component.ts',
        './customers/detail.component.ts',
        './customers/customer.service.ts',
        [
          './holidays/index.ts',
          [
            './holiday.component.ts',
            './detail.component.ts',
            './holiday.pipe.ts',
          ],
        ],
      ]),
      barrelFiles: [
        '/src/app/customers/index.ts',
        '/src/app/holidays/index.ts',
      ],
      expectedModules: [
        {
          path: '/src/app/customers',
          fileInfoPaths: [
            '/src/app/customers/customer.component.ts',
            '/src/app/customers/detail.component.ts',
            '/src/app/customers/customer.service.ts',
          ],
        },
        {
          path: '/src/app/holidays',
          fileInfoPaths: [
            '/src/app/holidays/index.ts',
            '/src/app/holidays/holiday.component.ts',
            '/src/app/holidays/detail.component.ts',
            '/src/app/holidays/holiday.pipe.ts',
          ],
        },
        { path: '/', fileInfoPaths: ['/src/app/app.component.ts'] },
      ],
    }));
  });

  it('should create module for a project without modules', () => {
    assertModule(() => ({
      fileInfo: buildFileInfo('/src/app/app.component.ts', [
        './customers/customer.component.ts',
        './holidays/holiday.component.ts',
      ]),
      barrelFiles: [],
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
    }));
  });

  it('should create module for nested modules', () => {
    assertModule(() => ({
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
      barrelFiles: [
        '/src/app/customers/index.ts',
        '/src/app/customers/feature/index.ts',
        '/src/app/customers/data/index.ts',
        '/src/app/customers/ui/index.ts',
      ],
      expectedModules: [
        {
          path: '/src/app/customers',
          fileInfoPaths: ['/src/app/customers/customer.component.ts'],
        },
        {
          path: '/src/app/customers/feature',
          fileInfoPaths: ['/src/app/customers/feature/feature.service.ts'],
        },
        {
          path: '/src/app/customers/data',
          fileInfoPaths: ['/src/app/customers/data/customer.facade.ts'],
        },
        {
          path: '/src/app/customers/ui',
          fileInfoPaths: ['/src/app/customers/ui/ui.component.ts'],
        },
        {
          path: '/',
          fileInfoPaths: ['/src/app/main.ts', '/src/app/app.component.ts'],
        },
      ],
    }));
  });

  it('should create module for multiple directories', () => {
    assertModule(() => ({
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
      barrelFiles: ['/src/app/customers/index.ts'],
      expectedModules: [
        {
          path: '/src/app/customers',
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
    }));
  });
});

function assertModule(createTestParams: () => TestParameter) {
  const testParams = createTestParams();
  const { fileInfo, barrelFiles } = testParams;
  const fileInfoMap = new Map<FsPath, FileInfo>();
  const getFileInfo = (path: FsPath) =>
    throwIfNull(
      fileInfoMap.get(path),
      `cannot find AssignedFileInfo for ${path}`,
    );

  barrelFiles.forEach((modulePath) => {
    getFs().writeFile(modulePath, '');
  });
  const modules = createModules(
    fileInfo,
    fromEntries(
      barrelFiles.map((path) => [
        toFsPath(path.replace('/index.ts', '')),
        true,
      ]),
    ),
    toFsPath('/'),
    fileInfoMap,
    getFileInfo,
  );

  const expectedModules = testParams.expectedModules.map((mi) => {
    const fileInfos = mi.fileInfoPaths.map((fip) =>
      throwIfNull(
        findFileInfo(fileInfo, fip),
        `${fip} does not exist in passed FileInfo`,
      ),
    );
    const module = new Module(
      toFsPath(mi.path),
      fileInfoMap,
      getFileInfo,
      mi.path === '/',
      mi.path !== '/',
    );
    for (const fi of fileInfos) {
      module.addFileInfo(fi);
    }

    return module;
  });

  for (const module of modules) {
    const expectedModule = expectedModules.find((m) => m.path === module.path);
    expect(expectedModule, `cannot find module ${module.path}`).toBeDefined();
    expect(module, `Module ${module.path} is wrong`).toEqual(expectedModule);
  }
  expect(modules.length, 'different size of modules').toEqual(
    expectedModules.length,
  );
}
