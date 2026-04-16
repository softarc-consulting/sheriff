import { describe, expect, it } from 'vitest';
import { hasEncapsulationViolations } from '../has-encapsulation-violations';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';

describe('check encapsulation', () => {
  it('should check for deep imports', () => {
    const projectInfo = testInit('src/main.ts', {
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

    for (const [filename, deepImports] of [
      // ['src/main.ts', []],
      ['src/app/app.routes.ts', []],
      ['src/app/app.component.ts', ['./customers/customer.component']],
      ['src/app/customers/customer.component.ts', []],
      ['src/app/customers/customer.routes.ts', []],
      ['src/app/customers/index.ts', []],
    ]) {
      expect(
        Object.keys(hasEncapsulationViolations(toFsPath(`/project/${filename}`), projectInfo)),
        `failed deep import test for ${filename}`,
      ).toEqual(deepImports);
    }
  });

  it('should ignore unresolvable imports', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./app/app.component', './app/app.routes'],
        app: {
          'app.component.ts': ['./customers/customer.component'],
        },
      },
    });

    for (const [filename, deepImports] of [
      ['src/main.ts', []],
      ['src/app/app.component.ts', []],
    ]) {
      expect(
        Object.keys(hasEncapsulationViolations(toFsPath(`/project/${filename}`), projectInfo)),
      ).toEqual(deepImports);
    }
  });

  it('should allow imports from sub-barrel files', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: 'public-api.ts',
        enableSubBarrelFileSupport: true,
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/customers/public-api',
          './app/customers/public-api.routing',
          './app/customers/public-api.bookmarks',
          './app/customers/customer.component',
        ],
        app: {
          customers: {
            'customer.component.ts': [],
            'customer.routes.ts': ['./customer.component'],
            'public-api.ts': ['./customer.routes'],
            'public-api.routing.ts': ['./customer.component'],
            'public-api.bookmarks.ts': [],
          },
        },
      },
    });

    expect(
      Object.keys(
        hasEncapsulationViolations(
          toFsPath('/project/src/main.ts'),
          projectInfo,
        ),
      ),
    ).toEqual(['./app/customers/customer.component']);
  });

  it('should allow sub-barrel files with default index.ts barrel name', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        enableSubBarrelFileSupport: true,
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/customers/index',
          './app/customers/index.routing',
          './app/customers/customer.component',
        ],
        app: {
          customers: {
            'customer.component.ts': [],
            'index.ts': [],
            'index.routing.ts': ['./customer.component'],
          },
        },
      },
    });

    expect(
      Object.keys(
        hasEncapsulationViolations(
          toFsPath('/project/src/main.ts'),
          projectInfo,
        ),
      ),
    ).toEqual(['./app/customers/customer.component']);
  });

  it('should treat sub-barrel files as violations when enableSubBarrelFileSupport is false', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        barrelFileName: 'public-api.ts',
        enableSubBarrelFileSupport: false,
        depRules: {},
      }),
      src: {
        'main.ts': [
          './app/customers/public-api',
          './app/customers/public-api.routing',
          './app/customers/public-api.bookmarks',
        ],
        app: {
          customers: {
            'public-api.ts': [],
            'public-api.routing.ts': [],
            'public-api.bookmarks.ts': [],
          },
        },
      },
    });

    expect(
      Object.keys(
        hasEncapsulationViolations(
          toFsPath('/project/src/main.ts'),
          projectInfo,
        ),
      ),
    ).toEqual([
      './app/customers/public-api.routing',
      './app/customers/public-api.bookmarks',
    ]);
  });

  it('should not break barrel-less modules when enableSubBarrelFileSupport is true', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {
          'src/app/<domain>': '<domain>',
        },
        depRules: {},
        enableBarrelLess: true,
        enableSubBarrelFileSupport: true,
      }),
      src: {
        'main.ts': [
          './app/customers/customer.component',
          './app/customers/internal/hidden.service',
        ],
        app: {
          customers: {
            'customer.component.ts': [],
            internal: {
              'hidden.service.ts': [],
            },
          },
        },
      },
    });

    expect(
      Object.keys(
        hasEncapsulationViolations(
          toFsPath('/project/src/main.ts'),
          projectInfo,
        ),
      ),
    ).toEqual(['./app/customers/internal/hidden.service']);
  });
});
