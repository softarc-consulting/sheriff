import { describe, it, expect, beforeEach } from 'vitest';
import { FileTree } from '../../test/project-configurator';
import { TagConfig } from '../../config/tag-config';
import { createProject } from '../../test/project-creator';
import { findModulePathsWithoutBarrel } from '../internal/find-module-paths-without-barrel';
import { useVirtualFs } from '../../fs/getFs';
import { toFsPath } from '../../file-info/fs-path';

function assertProject(fileTree: FileTree) {
  return {
    withModuleConfig(moduleConfig: TagConfig) {
      return {
        hasModulePaths(modulePaths: string[]) {
          const absoluteModulePaths = modulePaths.map(
            (path) => `/project/${path}`,
          );
          createProject(fileTree);
          const actualModulePaths = findModulePathsWithoutBarrel(
            moduleConfig,
            toFsPath('/project'),
            'index.ts',
          );
          expect(Array.from(actualModulePaths)).toEqual(absoluteModulePaths);
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
        'src/app/domains/customers',
        'src/app/domains/holidays',
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
      .hasModulePaths(['src/app/customers', 'src/app/holidays']);
  });

  it('should allow nested modules', () => {
    assertProject({
      src: {
        lib: {
          util: {
            util1: {},
            util2: {},
          },
        },
      },
    })
      .withModuleConfig({
        'src/lib': 'lib',
        'src/lib/util': 'util',
        'src/lib/util/<util>': 'util:<util>',
      })
      .hasModulePaths([
        'src/lib',
        'src/lib/util',
        'src/lib/util/util1',
        'src/lib/util/util2',
      ]);
  });

  it('should work for multiple projectPaths', () => {
    assertProject({
      src: {
        app: {
          app1: {
            feature: {},
            model: {},
          },
          app2: {
            ui: {},
          },
        },
        lib: {
          shared: {},
        },
      },
    })
      .withModuleConfig({
        'src/app/<app>/<type>': ['app:<app>', 'type:<type>'],
        'src/lib/shared': 'shared',
      })
      .hasModulePaths([
        'src/app/app1/feature',
        'src/app/app1/model',
        'src/app/app2/ui',
        'src/lib/shared',
      ]);
  });

  it('should also detect files with multiple placeholders in the same directory', () =>
    assertProject({
      src: {
        app: {
          'feature-shop': {},
          'ui-grid': {},
          'data-': {},
          model: {},
        },
      },
    })
      .withModuleConfig({
        'src/app/<type>-<name>': ['type:<type>', 'name:<name>'],
      })
      .hasModulePaths([
        'src/app/feature-shop',
        'src/app/ui-grid',
        'src/app/data-',
      ]));

    it('should ignore barrel module because findModulePathsWithBarrel handles it', () => {
      assertProject({
        src: {
          app: {
            customers: {
              'index.ts': [],
              feature: {},
              ui: {
                'index.ts': [],
              },
              data: {},
              model: {},
            },
          },
        },
      })
        .withModuleConfig({
          'src/app/<domain>': 'lib',
          'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        })
        .hasModulePaths([
          'src/app/customers/feature',
          'src/app/customers/data',
          'src/app/customers/model',
        ]);
    });


  it('should not throw if a module does not match any directory (might be barrel module)', () => {
    assertProject({
      src: {
        app: {
          customers: {
            'index.ts': [],
            internal: {},
          },
        },
      },
    })
      .withModuleConfig({
        'src/app/<domain>': 'lib',
      })
      .hasModulePaths([]);
  });

  it('should stop after a match', () => {
    assertProject({
      src: {
        app: {
          customers: {
          },
        },
      },
    })
      .withModuleConfig({
        'src/app/<domain>': 'lib',
        'src/app/customers': 'lib',
      })
      .hasModulePaths(['src/app/customers']);
  });
});
