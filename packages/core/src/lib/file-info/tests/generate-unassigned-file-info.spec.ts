import { generateUnassignedFileInfo } from '../generate-unassigned-file-info';
import { createProject } from '../../test/project-creator';
import { inVfs } from '../../test/in-vfs';
import { toFsPath } from '../fs-path';
import { generateTsData } from '../generate-ts-data';
import getFs from '../../fs/getFs';
import { tsConfig } from '../../test/fixtures/ts-config';
import { describe, it, expect } from 'vitest';

describe('Generate File Info', () => {
  const getTsData = () =>
    generateTsData(toFsPath('/project/integration/tsconfig.json'));

  it('should test a simple case', () => {
    createProject(
      {
        'tsconfig.json': tsConfig(),
        'src/app': {
          'home.component.ts': [],
          'app.component.ts': ['./home.component'],
        },
      },
      '/project/integration',
    );

    const fileInfo = generateUnassignedFileInfo(
      inVfs('integration/src/app/app.component.ts'),
      true,
      getTsData(),
    );

    expect(fileInfo).toEqual({
      path: '/project/integration/src/app/app.component.ts',
      imports: [
        { path: '/project/integration/src/app/home.component.ts', imports: [] },
      ],
    });
  });

  it('should generate for sub-modules', () => {
    createProject(
      {
        'tsconfig.json': tsConfig(),
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
      },
      '/project/integration',
    );

    const fileInfo = generateUnassignedFileInfo(
      inVfs('integration/src/main.ts'),
      false,
      getTsData(),
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
  });

  it('should throw an error if an import is outside of the root dir', () => {
    createProject(
      {
        'tsconfig.json': tsConfig(),
        'main.ts': ['../outside.component'],
      },
      'integration',
    );
    getFs().writeFile('/project/outside.component.ts', '');
    expect(() =>
      generateUnassignedFileInfo(
        toFsPath('/project/integration/main.ts'),
        true,
        getTsData(),
      ),
    ).toThrowError(
      '/project/outside.component.ts is outside of root /project/integration',
    );
  });

  for (const importCommand of [
    './holiday.component',
    './customers/customer.service',
  ]) {
    it(`should add an unresolvable import for "${importCommand}"`, () => {
      createProject(
        {
          'tsconfig.json': tsConfig(),
          'main.ts': [importCommand],
        },
        'integration',
      );
      const fileInfo = generateUnassignedFileInfo(
        toFsPath('/project/integration/main.ts'),
        true,
        getTsData(),
      );

      expect(fileInfo.isUnresolvableImport(importCommand)).toBe(true);
      expect(fileInfo.hasUnresolvableImports()).toBe(true);
    });
  }
});
