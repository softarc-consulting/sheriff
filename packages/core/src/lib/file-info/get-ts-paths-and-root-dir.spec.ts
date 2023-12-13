import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import getFs, { useVirtualFs } from '../fs/getFs';
import { Fs } from '../fs/fs';
import { tsConfigMinimal } from '../test/fixtures/tsconfig.minimal';
import { ProjectCreator } from '../test/project-creator';
import { toFsPath } from './fs-path';
import { TsConfig } from './ts-config';
import { getTsPathsAndRootDir } from './get-ts-paths-and-root-dir';

describe('get ts paths and root dir', () => {
  let fs: Fs;

  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    fs = getFs();
    fs.reset();
  });

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
      const tsConfig = structuredClone(tsConfigMinimal) as TsConfig;
      tsConfig.compilerOptions.paths = tsPaths;
      new ProjectCreator().create(
        {
          'tsconfig.json': JSON.stringify(tsConfig),
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
        },
        '/project'
      );

      expect(
        getTsPathsAndRootDir(toFsPath('/project/tsconfig.json')).paths
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
      const tsConfig = structuredClone(tsConfigMinimal) as TsConfig;
      tsConfig.compilerOptions.paths = tsPaths;
      new ProjectCreator().create(
        {
          'tsconfig.json': JSON.stringify(tsConfig),
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
        },
        '/project'
      );

      expect(() =>
        getTsPathsAndRootDir(toFsPath('/project/tsconfig.json'))
      ).toThrowError(
        `invalid path mapping detected: ${errorMessage}. Please verify that the path exists.`
      );
    });
  }
});
