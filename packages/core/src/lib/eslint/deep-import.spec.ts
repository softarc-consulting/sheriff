import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import getFs, { useVirtualFs } from '../fs/getFs';
import { hasDeepImport } from './deep-import';
import { toFsPath } from '../file-info/fs-path';
import { testInit } from '../test/test-init';
import { tsConfig } from '../test/fixtures/ts-config';

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
      'tsconfig.json': tsConfig(),
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
      'tsconfig.json': tsConfig(),
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
});
