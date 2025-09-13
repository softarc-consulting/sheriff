import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { violatesEncapsulationRule } from '../violates-encapsulation-rule';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';

describe('encapsulation', () => {
  const assertViolation = (
    filename: string,
    importCommand: string,
    isDeepImport = true,
  ) => {
    expect(
      violatesEncapsulationRule(
        filename,
        importCommand,
        true,
        getFs().readFile(toFsPath(filename)),
        true,
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

    assertViolation(
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
      violatesEncapsulationRule(
        '/project/src/main.ts',
        './app/app.component',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
        true,
      ),
    ).toBe('import ./app/app.component cannot be resolved');
  });

  it('should skip unresolvable imports for non-relative imports', () => {
    testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['keycloak-js'],
      },
    });

    expect(
      violatesEncapsulationRule(
        '/project/src/main.ts',
        'keycloak-js',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
        true,
      ),
    ).toBe('');
  });

  it('should return a violation to a barrel-less modules', () => {
    testInit('src/app/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: { 'src/app/customers': 'customers' },
        depRules: {},
        enableBarrelLess: true,
      }),
      src: {
        app: {
          'main.ts': ['./customers/internal/customer.component'],
          customers: {
            internal: {
              'customer.component.ts': [],
            },
          },
        },
      },
    });

    const message = violatesEncapsulationRule(
      '/project/src/app/main.ts',
      './customers/internal/customer.component',
      true,
      getFs().readFile(toFsPath('/project/src/app/main.ts')),
      false,
    );
    expect(message).toBe(
      `'./customers/internal/customer.component' cannot be imported. It is encapsulated.`,
    );
  });

  it('should return a violation to a barrel modules', () => {
    testInit('src/app/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {},
        depRules: {},
        enableBarrelLess: true,
      }),
      src: {
        app: {
          'main.ts': ['./customers/customer.component'],
          customers: {
            'index.ts': [],
            'customer.component.ts': [],
          },
        },
      },
    });

    const message = violatesEncapsulationRule(
      '/project/src/app/main.ts',
      './customers/customer.component',
      true,
      getFs().readFile(toFsPath('/project/src/app/main.ts')),
      false,
    );
    expect(message).toBe(
      `'./customers/customer.component' is a deep import from a barrel module. Use the module's barrel file (index.ts) instead.`,
    );
  });
});
