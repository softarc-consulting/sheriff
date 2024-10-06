import {describe, it, expect, beforeEach} from 'vitest';
import { FileTree } from '../../test/project-configurator';
import { TagConfig } from '../../config/tag-config';
import { createProject } from '../../test/project-creator';
import { findModulePathsWithoutBarrel } from '../internal/find-module-paths-without-barrel';
import {useVirtualFs} from "../../fs/getFs";
import {toFsPath} from "../../file-info/fs-path";

function assertProject(fileTree: FileTree) {
  return {
    withModuleConfig(moduleConfig: TagConfig) {
      return {
        hasModulePaths(modulePaths: string[]) {
          createProject(fileTree);
          const actualModulePaths = findModulePathsWithoutBarrel(
            moduleConfig, toFsPath('/project'),
          );
          expect(Array.from(actualModulePaths)).toEqual(modulePaths);
        },
      };
    },
  };
}

describe('create module infos without barrel files', () => {
  beforeEach(() => useVirtualFs().reset());

  it('should have no modules', () => {
    assertProject({
      'src/app': {
        'app.component.ts': [
          'customers/customer.component.ts',
          'holidays/holiday.component.ts',
        ],
        'customers/customer.component.ts': [],
        'holidays/holiday.component.ts': [],
      },
    })
      .withModuleConfig({})
      .hasModulePaths([]);
  });

  it('should have modules', () => {
    assertProject({
      'src/app': {
        'app.component.ts': [],
        'domains/customers/customer.component.ts': [],
        'domains/holidays/holiday.component.ts': [],
        'shared/index.ts': [],
      },
    })
      .withModuleConfig({ 'src/app/domains/<domain>': 'domain:<domain>' })
      .hasModulePaths([
        '/project/src/app/domains/customers',
        '/project/src/app/domains/holidays',
      ]);
  });

  it('should use a mixed approach', () => {
    assertProject({
      'src/app': {
        'app.component.ts': [
          'customers/customer.component.ts',
          'holidays/holiday.component.ts',
        ],
        'customers/customer.component.ts': [],
        'holidays/holiday.component.ts': [],
      },
    })
      .withModuleConfig({ 'src/app/<domain>': 'domain:<domain>' })
      .hasModulePaths([
        '/project/src/app/customers',
        '/project/src/app/holidays'
      ]);
  });

  it.todo('should allow nested modules');
  it.todo('should work for multipe projectPaths');
  it.todo('should give priority to to the barrel file');
  it.todo('shoudl also detect files with placeholders');
  it.todo(
    'shoudl also detect files with multiple placeholders in the same directory',
  );
  it.todo('should throw if a module does not match any directory');
  it.todo('should ensure first come first serve');
  it.todo('should make sure that wild card match is full')
});
