import { describe, expect, test } from 'vitest';
import { createProject } from '../test/project-creator';
import { toFsPath } from './fs-path';
import { getTsPathsAndRootDir } from './get-ts-paths-and-root-dir';
import { tsConfig } from '../test/fixtures/ts-config';

describe('get ts paths and root dir', () => {
  for (const { name, tsPaths, fsPaths } of [
    {
      name: 'default paths',
      tsPaths: {
        '@app/*': ['src/app'],
        '@customers': ['src/app/customers/index.ts'],
        '@holidays': ['src/app/holidays/index.ts'],
      },
      fsPaths: {
        '@app/*': '/project/src/app',
        '@customers': '/project/src/app/customers/index.ts',
        '@holidays': '/project/src/app/holidays/index.ts',
      },
    },
    {
      name: 'directory path',
      tsPaths: {
        '@customers': ['src/app/customers'],
      },
      fsPaths: {
        '@customers': '/project/src/app/customers',
      },
    },
    {
      name: 'file without extension path',
      tsPaths: {
        '@customers': ['src/app/customers/index'],
      },
      fsPaths: {
        '@customers': '/project/src/app/customers/index.ts',
      },
    },
  ]) {
    test(name, () => {
      createProject({
        'tsconfig.json': tsConfig({ paths: tsPaths }),
        src: {
          app: {
            'main.ts': [],
            customers: {
              'index.ts': [],
            },
            holidays: {
              'index.ts': [],
            },
          },
        },
      });

      expect(
        getTsPathsAndRootDir(toFsPath('/project/tsconfig.json')).paths,
      ).toEqual(fsPaths);
    });
  }

  for (const { name, tsPaths, errorMessage } of [
    {
      name: 'not existing path',
      tsPaths: {
        '@app': ['src/app/sdf'],
      },
      errorMessage: '@app: src/app/sdf',
    },
    {
      name: 'not existing file',
      tsPaths: {
        '@main': ['src/app/index'],
      },
      errorMessage: '@main: src/app/index',
    },
    {
      name: 'not existing path with wildcard',
      tsPaths: {
        '@app/*': ['src/app/somewhere'],
      },
      errorMessage: '@app/*: src/app/somewhere',
    },
  ]) {
    test(name, () => {
      createProject({
        'tsconfig.json': tsConfig({ paths: tsPaths }),
        src: {
          app: {
            'main.ts': [],
            customers: {
              'index.ts': [],
            },
            holidays: {
              'index.ts': [],
            },
          },
        },
      });

      expect(() =>
        getTsPathsAndRootDir(toFsPath('/project/tsconfig.json')),
      ).toThrowError(
        `invalid path mapping detected: ${errorMessage}. Please verify that the path exists.`,
      );
    });
  }

  describe('baseUrl', () => {
    test('different baseUrl', () => {
      createProject({
        'tsconfig.json': tsConfig({
          paths: { '@app/*': ['app'] },
          baseUrl: './src',
        }),
        src: {
          app: {
            'main.ts': [],
            customers: {
              'index.ts': [],
            },
            holidays: {
              'index.ts': [],
            },
          },
        },
      });

      expect(
        getTsPathsAndRootDir(toFsPath('/project/tsconfig.json')).paths,
      ).toEqual({ '@app/*': '/project/src/app' });
    });
  });
});
