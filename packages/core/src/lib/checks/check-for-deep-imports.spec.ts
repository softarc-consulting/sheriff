import { describe, expect, it } from 'vitest';
import { checkForDeepImports } from './check-for-deep-imports';
import { toFsPath } from '../file-info/fs-path';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { testInit } from '../test/test-init';

describe('check deep imports', () => {
  it('should check for deep imports', () => {
    const projectInfo = testInit('src/main.ts', {
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

    for (const [filename, deepImports] of [
      ['src/main.ts', []],
      ['src/app/app.routes.ts', []],
      ['src/app/app.component.ts', ['./customers/customer.component']],
      ['src/app/customers/customer.component.ts', []],
      ['src/app/customers/customer.routes.ts', []],
      ['src/app/customers/index.ts', []],
    ]) {
      expect(
        checkForDeepImports(toFsPath(`/project/${filename}`), projectInfo),
      ).toEqual(deepImports);
    }
  });

  it('should ignore unresolable imports', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsconfigMinimal,
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
        checkForDeepImports(toFsPath(`/project/${filename}`), projectInfo),
      ).toEqual(deepImports);
    }
  });
});
