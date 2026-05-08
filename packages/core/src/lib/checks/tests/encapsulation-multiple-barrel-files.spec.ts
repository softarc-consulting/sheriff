import { describe, expect, it } from 'vitest';
import { hasEncapsulationViolations } from '../has-encapsulation-violations';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';

describe('encapsulation with multiple barrel files', () => {
  it('should allow imports of all barrel files when using an array', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.routing.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/orders/index',
          './app/orders/index.routing',
        ],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'order-routes.ts': [],
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([]);
  });

  it('should block deep imports even with multiple barrel files', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.routing.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/orders/index',
          './app/orders/order-list.component',
        ],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'order-routes.ts': [],
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([
      './app/orders/order-list.component',
    ]);
  });

  it('should allow importing barrel files of nested modules', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': ['./app/orders/internal/index'],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'order-list.component.ts': [],
            internal: {
              'index.ts': ['./details'],
              'details.ts': [],
            },
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([]);
  });

  it('should block deep imports into nested modules', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': ['./app/orders/internal/details'],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'order-list.component.ts': [],
            internal: {
              'index.ts': ['./details'],
              'details.ts': [],
            },
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([
      './app/orders/internal/details',
    ]);
  });

  it('should allow imports of barrel files matching a glob pattern', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.*.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/orders/index',
          './app/orders/index.state',
          './app/orders/index.routing',
        ],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.state.ts': ['./state'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'state.ts': [],
            'order-routes.ts': [],
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([]);
  });

  it('should block deep imports when using glob barrel pattern', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.*.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/orders/index',
          './app/orders/state',
        ],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.state.ts': ['./state'],
            'order-list.component.ts': [],
            'state.ts': [],
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual(['./app/orders/state']);
  });

  it('should allow barrel imports of nested modules with glob patterns', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.*.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': ['./app/orders/feature/index.routing'],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'order-routes.ts': [],
            feature: {
              'index.routing.ts': ['./feature-routes'],
              'feature-routes.ts': [],
            },
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([]);
  });

  it('should block non-barrel imports into nested modules with glob patterns', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.*.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': ['./app/orders/feature/feature-routes'],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'order-routes.ts': [],
            feature: {
              'index.routing.ts': ['./feature-routes'],
              'feature-routes.ts': [],
            },
          },
        },
      },
    });

    const violations = hasEncapsulationViolations(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );
    expect(Object.keys(violations)).toEqual([
      './app/orders/feature/feature-routes',
    ]);
  });

  it('should work across multiple modules with glob barrel files', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: ['index.ts', 'index.*.ts'],
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/orders/index',
          './app/orders/index.routing',
          './app/customers/index',
        ],
        app: {
          orders: {
            'index.ts': ['./order-list.component'],
            'index.routing.ts': ['./order-routes'],
            'order-list.component.ts': [],
            'order-routes.ts': [],
          },
          customers: {
            'index.ts': ['./customer.component'],
            'customer.component.ts': [],
          },
        },
      },
    });

    for (const [filename, expectedViolations] of [
      ['src/main.ts', []],
      ['src/app/orders/index.ts', []],
      ['src/app/orders/index.routing.ts', []],
      ['src/app/customers/index.ts', []],
    ] as [string, string[]][]) {
      const violations = hasEncapsulationViolations(
        toFsPath(`/project/${filename}`),
        projectInfo,
      );
      expect(
        Object.keys(violations),
        `encapsulation check failed for ${filename}`,
      ).toEqual(expectedViolations);
    }
  });
});
