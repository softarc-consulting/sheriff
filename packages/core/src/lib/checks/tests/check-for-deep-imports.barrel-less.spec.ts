import { describe, it, expect } from 'vitest';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';
import { FileTree, sheriffConfig } from '../../test/project-configurator';
import { checkForDeepImports } from '../check-for-deep-imports';
import { UserSheriffConfig } from '../../config/user-sheriff-config';
import { traverseFileInfo } from '../../modules/traverse-file-info';

describe('barrel-less', () => {
  it('should check for deep imports', () => {
    assertProject()
      .withCustomerRoute({
        feature: {
          internal: {
            'customer-sub.component.ts': [],
          },
          'customer.component.ts': [
            './internal/customer-sub.component.ts',
            '../data/customer.service.ts',
          ],
          'customers.component.ts': ['../data/internal/hidden.service.ts'],
        },
        data: {
          'customer.service.ts': ['./internal/hidden.service.ts'],
          internal: { 'hidden.service.ts': [] },
        },
      })
      .hasDeepImports({
        'feature/customers.component.ts': [
          '../data/internal/hidden.service.ts',
        ],
      });
  });

  it('should also work with nested paths inside internal', () => {
    assertProject()
      .withCustomerRoute({
        feature: {
          internal: {
            'customer-sub.component.ts': [],
          },
          'customer.component.ts': [
            './internal/customer-sub.component.ts',
            '../data/customer.service.ts',
          ],
          'customers.component.ts': [
            '../data/internal/services/hidden.service.ts',
          ],
        },
        data: {
          'customer.service.ts': ['./internal/services/hidden.service.ts'],
          internal: { services: { 'hidden.service.ts': [] } },
        },
      })
      .hasDeepImports({
        'feature/customers.component.ts': [
          '../data/internal/services/hidden.service.ts',
        ],
      });
  });

  it('should also work with nested paths outside of internal', () => {
    assertProject()
      .withCustomerRoute({
        feature: {
          internal: {
            'customer-sub.component.ts': [],
          },
          'customers.component.ts': ['./components/customers-sub.component.ts'],
          'customer.component.ts': ['../data/services/customer.service.ts'],
          components: {
            'customers-sub.component.ts': [
              '../internal/customer-sub.component.ts',
              '../../data/internal/hidden.service.ts',
            ],
          },
        },
        data: {
          services: {
            'customer.service.ts': ['../internal/hidden.service.ts'],
          },
          internal: { 'hidden.service.ts': [] },
        },
      })
      .hasDeepImports({
        'feature/components/customers-sub.component.ts': [
          '../../data/internal/hidden.service.ts',
        ],
      });
  });

  it('should be able to change the name of internals', () => {
    assertProject({
      encapsulatedFolderNameForBarrelLess: 'private',
    })
      .withCustomerRoute({
        feature: {
          'customer.component.ts': ['../data/internal/customer.service.ts'],
          'customers.component.ts': ['../data/private/hidden.service.ts'],
        },
        data: {
          private: { 'hidden.service.ts': [] },
          internal: { 'customer.service.ts': ['../private/hidden.service.ts'] },
        },
      })
      .hasDeepImports({
        'feature/customers.component.ts': ['../data/private/hidden.service.ts'],
      });
  });

  it('should always prioritize the barrel file', () => {
    assertProject({ showWarningOnBarrelCollision: false })
      .withCustomerRoute({
        feature: {
          'customer.component.ts': ['../data'],
          'customers.component.ts': ['../data/open.service.ts'],
        },
        data: {
          'index.ts': ['open.service.ts'],
          'open.service.ts': [],
          internal: { 'hidden.service.ts': [] },
        },
      })
      .hasDeepImports({
        'feature/customers.component.ts': ['../data/open.service.ts'],
      });
  });
});

function assertProject(config: Partial<UserSheriffConfig> = {}) {
  return {
    withCustomerRoute(customerFileTree: FileTree) {
      return {
        hasDeepImports(deepImports: Record<string, string[]> = {}) {
          const projectInfo = testInit('src/main.ts', {
            'tsconfig.json': tsConfig(),
            'sheriff.config.ts': sheriffConfig({
              ...{
                modules: {
                  'src/app/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
                },
                depRules: {},
                enableBarrelLess: true,
              },
              ...config,
            }),
            src: {
              'main.ts': ['./app/app.routes'],
              app: {
                'app.routes.ts': [
                  './customer/feature/customer.component.ts',
                  './customer/feature/customers.component.ts',
                ],
                customer: customerFileTree,
              },
            },
          });

          for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
            expect(
              fileInfo.hasUnresolvedImports(),
              `${fileInfo.path} has unresolved imports`,
            ).toBe(false);

            const pathToLookup = fileInfo.path.replace(
              '/project/src/app/customer/',
              '',
            );

            const expectedDeepImports = deepImports[pathToLookup] || [];
            expect
              .soft(
                checkForDeepImports(fileInfo.path, projectInfo),
                `deep imports check failed for ${fileInfo.path}`,
              )
              .toEqual(expectedDeepImports);
          }
        },
      };
    },
  };
}
