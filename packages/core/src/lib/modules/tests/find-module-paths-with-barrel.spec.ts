import { describe, expect, it } from 'vitest';
import { createProject } from "../../test/project-creator";
import { tsConfig } from "../../test/fixtures/ts-config";
import { findModulePathsWithBarrel } from "../internal/find-module-paths-with-barrel";
import { toFsPath } from "../../file-info/fs-path";

describe('findModulePathsWithBarrel', () => {
  it('should find two modules', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        'app.component.ts': '',
        customers: {
          'customer.component.ts': '',
          'index.ts': '',
        },
        holidays: {
          'holiday.component.ts': '',
          'index.ts': '',
        }}});

    const modulePaths = findModulePathsWithBarrel([toFsPath('/project')], ['index.ts']);

    expect(modulePaths).toEqual([
      '/project/src/app/customers',
      '/project/src/app/holidays',
    ]);
  });

  it('should find modules with glob barrel file pattern', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        'app.component.ts': '',
        orders: {
          'order.component.ts': '',
          'index.ts': '',
          'index.state.ts': '',
          'index.routing.ts': '',
        },
      },
    });

    const modulePaths = findModulePathsWithBarrel(
      [toFsPath('/project')],
      ['index.*.ts'],
    );

    expect(modulePaths).toEqual(['/project/src/app/orders']);
  });

  it('should find modules with array of barrel file patterns', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        'app.component.ts': '',
        customers: {
          'customer.component.ts': '',
          'index.ts': '',
        },
        orders: {
          'order.component.ts': '',
          'index.routing.ts': '',
        },
      },
    });

    const modulePaths = findModulePathsWithBarrel(
      [toFsPath('/project')],
      ['index.ts', 'index.routing.ts'],
    );

    expect(modulePaths).toEqual(
      expect.arrayContaining([
        '/project/src/app/customers',
        '/project/src/app/orders',
      ]),
    );
    expect(modulePaths).toHaveLength(2);
  });

  it('should deduplicate module paths when multiple patterns match same directory', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        orders: {
          'order.component.ts': '',
          'index.ts': '',
          'index.routing.ts': '',
        },
      },
    });

    const modulePaths = findModulePathsWithBarrel(
      [toFsPath('/project')],
      ['index.ts', 'index.routing.ts'],
    );

    expect(modulePaths).toEqual(['/project/src/app/orders']);
  });

  it('should not match non-barrel files with glob', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        orders: {
          'main.ts': '',
          'order.component.ts': '',
        },
      },
    });

    const modulePaths = findModulePathsWithBarrel(
      [toFsPath('/project')],
      ['index.*.ts'],
    );

    expect(modulePaths).toEqual([]);
  });
});
