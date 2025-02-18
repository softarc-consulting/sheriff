import { createProject } from '../../test/project-creator';
import { toFsPath } from '../fs-path';
import { getTsConfigContext } from '../get-ts-config-context';
import {
  InvalidPathError,
  TsExtendsResolutionError,
} from '../../error/user-error';
import { fullTsConfig, tsConfig } from '../../test/fixtures/ts-config';
import { describe, it, expect, test } from 'vitest';
import '../../test/expect.extensions';

describe('getTsConfigContext', () => {
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
        getTsConfigContext(toFsPath('/project/tsconfig.json')).paths,
      ).toEqual(fsPaths);
    });
  }

  for (const { name, tsPaths, errorParams } of [
    {
      name: 'not existing path',
      tsPaths: {
        '@app': ['src/app/sdf'],
      },
      errorParams: ['@app', 'src/app/sdf'],
    },
    {
      name: 'not existing file',
      tsPaths: {
        '@main': ['src/app/index'],
      },
      errorParams: ['@main', 'src/app/index'],
    },
    {
      name: 'not existing path with wildcard',
      tsPaths: {
        '@app/*': ['src/app/somewhere'],
      },
      errorParams: ['@app/*', 'src/app/somewhere'],
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

      const [pathAlias, path] = errorParams;

      expect(() =>
        getTsConfigContext(toFsPath('/project/tsconfig.json')),
      ).toThrowUserError(new InvalidPathError(pathAlias, path));
    });
  }

  describe('baseUrl', () => {
    it('should be undefined if not set', () => {
      createProject({
        'tsconfig.json': tsConfig({}),
        'main.ts': [],
      });

      const context = getTsConfigContext(toFsPath('/project/tsconfig.json'));

      expect(context.baseUrl).toBeUndefined();
    });

    it('should provide the FsPath if set', () => {
      createProject({
        'tsconfig.json': tsConfig({
          baseUrl: '.',
        }),
        'main.ts': [],
      });

      const context = getTsConfigContext(toFsPath('/project/tsconfig.json'));

      expect(context.baseUrl).toBe('/project');
    });

    it('should be inferred from a parent if not available', () => {
      createProject({
        'tsconfig.base.json': tsConfig({
          baseUrl: 'app/src',
        }),
        app: {
          src: {
            'tsconfig.json': fullTsConfig({
              extends: '../../tsconfig.base.json',
            }),
            'main.ts': [],
          },
        },
      });

      const context = getTsConfigContext(
        toFsPath('/project/app/src/tsconfig.json'),
      );

      expect(context.baseUrl).toBe('/project/app/src');
    });

    it('should override parent', () => {
      createProject({
        'tsconfig.base.json': tsConfig({
          baseUrl: '.',
        }),
        app: {
          'tsconfig.json': fullTsConfig({
            extends: '../tsconfig.base.json',
            compilerOptions: {
              baseUrl: '.',
            },
          }),
          src: {
            'main.ts': [],
          },
        },
      });

      const context = getTsConfigContext(
        toFsPath('/project/app/tsconfig.json'),
      );

      expect(context.baseUrl).toBe('/project/app');
    });

    it(`should consider the baseUrl's value for path resolution`, () => {
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
        getTsConfigContext(toFsPath('/project/tsconfig.json')).paths,
      ).toEqual({ '@app/*': '/project/src/app' });
    });

    it('should have nested paths with different baseUrls', () => {
      createProject({
        'tsconfig.base.json': tsConfig({
          paths: { '@root/*': ['.'] },
        }),
        app: {
          'tsconfig.sub-base.json': fullTsConfig({
            extends: '../tsconfig.base.json',
            compilerOptions: {
              baseUrl: './src',
              paths: { '@app/*': ['.'] },
            },
          }),
          src: {
            'tsconfig.json': fullTsConfig({
              extends: '../tsconfig.sub-base.json',
              compilerOptions: {
                baseUrl: '.',
                paths: { '@customers/*': ['customers'] },
              },
            }),
            'main.ts': ['@customers'],
            customers: {
              'index.ts': [],
            },
          },
        },
      });

      const context = getTsConfigContext(
        toFsPath('/project/app/src/tsconfig.json'),
      );

      expect(context.baseUrl).toBe('/project/app/src');
      expect(context.paths).toEqual({
        '@root/*': '/project',
        '@app/*': '/project/app/src',
        '@customers/*': '/project/app/src/customers',
      });
    });
  });

  describe('extends and alias', () => {
    it('should support aliases', () => {
      createProject({
        tsconfigs: {
          'tsconfig.vue.json': tsConfig({
            baseUrl: '../vue',
            paths: { '@vue/*': ['../app/src'] },
          }),
        },
        app: {
          src: {
            'tsconfig.json': fullTsConfig({
              extends: '@configs/tsconfig.vue.json',
              compilerOptions: {
                baseUrl: '.',
                paths: { '@configs/*': ['../../tsconfigs'] },
              },
            }),
            'main.ts': ['./customer'],
            customers: {
              'index.ts': [],
            },
          },
        },
      });

      const context = getTsConfigContext(
        toFsPath('/project/app/src/tsconfig.json'),
      );

      expect(context.baseUrl).toBe('/project/app/src');
      expect(context.paths).toEqual({
        '@configs/*': '/project/tsconfigs',
        '@vue/*': '/project/app/src',
      });
    });

    it('should support support also a non-wildcard alias', () => {
      createProject({
        tsconfigs: {
          'tsconfig.vue.json': tsConfig({
            baseUrl: '../vue',
            paths: { '@vue/*': ['../app/src'] },
          }),
        },
        app: {
          src: {
            'tsconfig.json': fullTsConfig({
              extends: '@config',
              compilerOptions: {
                baseUrl: '.',
                paths: { '@config': ['../../tsconfigs/tsconfig.vue.json'] },
              },
            }),
            'main.ts': ['./customer'],
            customers: {
              'index.ts': [],
            },
          },
        },
      });

      const context = getTsConfigContext(
        toFsPath('/project/app/src/tsconfig.json'),
      );

      expect(context.baseUrl).toBe('/project/app/src');
      expect(context.paths).toEqual({
        '@config': '/project/tsconfigs/tsconfig.vue.json',
        '@vue/*': '/project/app/src',
      });
    });

    it('should throw SH-010, if extends cannot be resolved', () => {
      createProject({
        tsconfigs: {
          'tsconfig.angular.json': tsConfig(),
        },
        app: {
          src: {
            'tsconfig.json': fullTsConfig({
              extends: '@configs/tsconfig.vue.json',
              compilerOptions: {
                baseUrl: '.',
                paths: { '@configs/**': ['../../tsconfigs'] },
              },
            }),
          },
        },
      });

      expect(() =>
        getTsConfigContext(toFsPath('/project/app/src/tsconfig.json')),
      ).toThrowUserError(
        new TsExtendsResolutionError(
          '/project/app/src/tsconfig.json',
          '@configs/tsconfig.vue.json',
        ),
      );
    });
  });

  test('no compilerOptions', () => {
    createProject({
      'tsconfig.json': JSON.stringify({}),
      src: {
        app: {
          'main.ts': [],
        },
      },
    });

    expect(
      getTsConfigContext(toFsPath('/project/tsconfig.json')).rootDir,
    ).toEqual('/project');
  });
});
