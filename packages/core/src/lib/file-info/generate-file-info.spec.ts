import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Fs } from '../fs/fs';
import getFs, { useVirtualFs } from '../fs/getFs';
import { FileTree } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { generateFileInfoAndGetRootDir } from './generate-file-info-and-get-root-dir';
import { ProjectCreator } from '../test/project-creator';
import { inVfs } from '../test/in-vfs';
import { toFsPath } from './fs-path';

describe('Generate File Info', () => {
  let fs: Fs;
  let creator: ProjectCreator;

  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    fs = getFs();
    fs.reset();
    creator = new ProjectCreator();
  });

  it('should test a simple case', () => {
    const projectConfig: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      'src/app': {
        'home.component.ts': [],
        'app.component.ts': ['./home.component'],
      },
    };

    creator.create(projectConfig, 'integration');

    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      inVfs('integration/src/app/app.component.ts')
    );

    expect(fileInfo).toEqual({
      path: '/project/integration/src/app/app.component.ts',
      imports: [
        { path: '/project/integration/src/app/home.component.ts', imports: [] },
      ],
    });
    expect(rootDir).toBe('/project/integration');
  });

  it('should generate for sub-modules', () => {
    const projectConfig: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': ['./app/app.component', './app/app.routes'],
        app: {
          'home.component.ts': [],
          'app.routes.ts': ['./home.component', './customers/index'],
          'app.component.ts': [],
          customers: {
            'list.component.ts': ['./customers.service'],
            'detail.component.ts': ['./customers.service'],
            'search.component.ts': [],
            'customers.service.ts': '',
            'customer.routes.ts': ['./list.component', './detail.component'],
            'index.ts': ['./customer.routes'],
          },
        },
      },
    };

    creator.create(projectConfig, 'integration');

    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      inVfs('integration/src/main.ts')
    );

    expect(fileInfo).toEqual({
      path: '/project/integration/src/main.ts',
      imports: [
        { path: '/project/integration/src/app/app.component.ts', imports: [] },
        {
          path: '/project/integration/src/app/app.routes.ts',
          imports: [
            {
              path: '/project/integration/src/app/home.component.ts',
              imports: [],
            },
            {
              path: '/project/integration/src/app/customers/index.ts',
              imports: [
                {
                  path: '/project/integration/src/app/customers/customer.routes.ts',
                  imports: [
                    {
                      path: '/project/integration/src/app/customers/list.component.ts',
                      imports: [
                        {
                          path: '/project/integration/src/app/customers/customers.service.ts',
                          imports: [],
                        },
                      ],
                    },
                    {
                      path: '/project/integration/src/app/customers/detail.component.ts',
                      imports: [
                        {
                          path: '/project/integration/src/app/customers/customers.service.ts',
                          imports: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(rootDir).toBe('/project/integration');
  });

  it('should throw an error if an import is outside of the root dir', () => {
    const projectConfig: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      'main.ts': ['../outside.component'],
    };

    creator.create(projectConfig, 'integration');
    fs.writeFile('/project/outside.component.ts', '');
    fs.print();
    expect(() =>
      generateFileInfoAndGetRootDir(toFsPath('/project/integration/main.ts'))
    ).toThrowError(
      '/project/outside.component.ts is outside of root /project/integration'
    );
  });
});
