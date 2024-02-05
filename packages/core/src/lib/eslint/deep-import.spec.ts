import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree, sheriffConfig } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import getFs, { useVirtualFs } from '../fs/getFs';
import { hasDeepImport } from './deep-import';
import { anyTag } from '../checks/any-tag';
import { toFsPath } from '../file-info/fs-path';
import { testInit } from '../test/test-init';

describe('deep import', () => {
  const assertDeepImport = (
    filename: string,
    importCommand: string,
    isDeepImport = true,
  ) => {
    expect(
      hasDeepImport(
        filename,
        importCommand,
        true,
        getFs().readFile(toFsPath(filename)),
      ),
      `deep import in ${filename} from ${importCommand} should be ${isDeepImport}`,
    ).toBe(
      isDeepImport
        ? "Deep import is not allowed. Use the module's index.ts or path."
        : '',
    );
  };

  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should find a deep import', () => {
    testInit('src/main.ts', {
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': ['./app/app.component', './app/app.routes'],
        app: {
          'app.routes.ts': ['./home.component', './customers/index'],
          'app.component.ts': ['./customers/customer.component'],
          customers: {
            'customer.component.ts': [],
            'customer.routes.ts': ['./customer.component'],
            'index.ts': ['./customer.routes'],
          },
        },
      },
    });

    assertDeepImport(
      '/project/src/app/app.component.ts',
      './customers/customer.component',
    );
  });

  it('should mark an unresolvable import', () => {
    testInit('src/main.ts', {
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': ['./app/app.component'],
      },
    });

    expect(
      hasDeepImport(
        '/project/src/main.ts',
        './app/app.component',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
      ),
    ).toBe('import ./app/app.component cannot be resolved');
  });

  describe('rootExcluded', () => {
    const createFileTree = (excludeRoot?: boolean): FileTree => ({
      'tsconfig.json': tsconfigMinimal,
      'sheriff.config.ts': sheriffConfig({
        tagging: { 'src/shared': 'shared' },
        depRules: { '*': anyTag },
        excludeRoot,
      }),
      src: {
        'main.ts': '',
        'router.ts': ['./shared/dialog'], // always deep import
        'config.ts': ['./shared/index'],
        shared: {
          'get.ts': ['../config', '../holidays/holidays-component'], // depends on `excludeRoot`
          'dialog.ts': '',
          'index.ts': '',
        },
        holidays: {
          'holidays-component.ts': ['../config'], // always valid},
        },
      },
    });

    for (const { excludeRoot, outcome } of [
      { excludeRoot: true, outcome: true },
      { excludeRoot: false, outcome: false },
      { excludeRoot: undefined, outcome: false },
    ]) {
      it(`should be ${
        outcome ? 'valid' : 'invalid'
      } for rootExcluded: ${excludeRoot}`, () => {
        testInit('src/main.ts', createFileTree(excludeRoot));

        assertDeepImport('/project/src/router.ts', './shared/dialog');
        assertDeepImport(
          '/project/src/holidays/holidays-component.ts',
          '../config',
          false,
        );

        assertDeepImport(
          '/project/src/shared/get.ts',
          '../config',
          !excludeRoot,
        );

        assertDeepImport(
          '/project/src/shared/get.ts',
          '../holidays/holidays-component',
          !excludeRoot,
        );
      });
    }
  });
});
