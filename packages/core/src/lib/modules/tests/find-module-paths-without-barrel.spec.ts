import { describe, it, expect } from 'vitest';
import { FileTree } from "../../test/project-configurator";
import { TagConfig } from "../../config/tag-config";
import { createProject } from "../../test/project-creator";
import { findModulePathsWithoutBarrel } from "../internal/find-module-paths-without-barrel";

function assertModulePaths(
  fileTree: FileTree,
  moduleConfig: TagConfig,
  modulePaths: string[],
) {
  createProject(fileTree);
  const actualModulePaths = findModulePathsWithoutBarrel([
    '/project',
  ], moduleConfig);
  expect(Array.from(actualModulePaths)).toEqual(modulePaths);
}

describe.skip('create module infos without barrel files', () => {
  it('should have no modules', () => {
    assertModulePaths(
      {
        'src/app': {
          'app.component.ts': [
            'customers/customer.component.ts',
            'holidays/holiday.component.ts',
          ],
          'customers/customer.component.ts': [],
          'holidays/holiday.component.ts': [],
        },
      },
      {},
      [],
    );
  });

  it('should have modules', () => {
    assertModulePaths(
      {
        'src/app': {
          'app.component.ts': [],
          'domains/customers/customer.component.ts': [],
          'domains/holidays/holiday.component.ts': [],
          'shared/index.ts': []
        },
      },
      { 'src/app/domains/<domain>': 'domain:<domain>' },
      ['/project/src/app/domains/customers', '/project/src/app/domains/holidays', '/project/shared', '/project'],
    );
  });

  it('should use a mixed approach', () => {
    assertModulePaths(
      {
        'src/app': {
          'app.component.ts': [
            'customers/customer.component.ts',
            'holidays/holiday.component.ts',
          ],
          'customers/customer.component.ts': [],
          'holidays/holiday.component.ts': [],

        },
      },
      { 'src/app/<domain>': 'domain:<domain>' },
      ['/project/src/app/customers', '/project/src/app/holidays', '/project'],
    );
  });

  it.todo('should allow nested modules');
  it.todo('should work for multipe projectPaths');
  it.todo('should give priority to to the barrel file');
});
