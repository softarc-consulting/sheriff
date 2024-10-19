import { describe, expect, it } from 'vitest';
import { hasEncapsulationViolations } from '../has-encapsulation-violations';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';

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
});
