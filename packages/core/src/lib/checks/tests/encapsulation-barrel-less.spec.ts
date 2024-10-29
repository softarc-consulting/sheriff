import { describe, it, expect } from 'vitest';
import { testInit } from '../../test/test-init';
import { tsConfig } from '../../test/fixtures/ts-config';
import { FileTree, sheriffConfig } from '../../test/project-configurator';
import { hasEncapsulationViolations } from '../has-encapsulation-violations';
import { UserSheriffConfig } from '../../config/user-sheriff-config';
import { traverseFileInfo } from '../../modules/traverse-file-info';

function assertProject(config: Partial<UserSheriffConfig> = {}) {
  return {
    withCustomerRoute(customerFileTree: FileTree) {
      return {
        hasEncapsulationViolations(
          encapsulationViolations: Record<string, string[]> = {},
        ) {
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

            const expectedDeepImports =
              encapsulationViolations[pathToLookup] || [];
            const violations = hasEncapsulationViolations(
              fileInfo.path,
              projectInfo,
            );
            const violatedImports = Object.keys(violations);
            expect
              .soft(
                violatedImports,
                `deep imports check failed for ${fileInfo.path}`,
              )
              .toEqual(expectedDeepImports);
          }
        },
      };
    },
  };
}

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
      .hasEncapsulationViolations({
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
      .hasEncapsulationViolations({
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
      .hasEncapsulationViolations({
        'feature/components/customers-sub.component.ts': [
          '../../data/internal/hidden.service.ts',
        ],
      });
  });

  it('should be able to change the name of internals', () => {
    assertProject({
      encapsulationPattern: 'private',
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
      .hasEncapsulationViolations({
        'feature/customers.component.ts': ['../data/private/hidden.service.ts'],
      });
  });

  it('should always prioritize the barrel file', () => {
    assertProject()
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
      .hasEncapsulationViolations({
        'feature/customers.component.ts': ['../data/open.service.ts'],
      });
  });

  it('should be by default first level only', () => {
    assertProject()
      .withCustomerRoute({
        feature: {
          'customer.component.ts': [''],
          'customers.component.ts': ['../data/sub1/internal/hidden.service.ts'],
        },
        data: {
          sub1: {
            internal: { 'hidden.service.ts': [] },
          },
        },
      })
      .hasEncapsulationViolations({});
  });

  it.skip('should support wildcards', () => {
    assertProject({ encapsulationPattern: '**/internal' })
      .withCustomerRoute({
        feature: {
          'customer.component.ts': [],
          'customers.component.ts': [
            '../data/sub1/internal/hidden.service.ts',
            '../data/sub2/sub3/internal/hidden.service.ts',
          ],
        },
        data: {
          sub1: {
            internal: { 'hidden.service.ts': [] },
          },
          sub2: {
            sub3: {
              internal: { 'hidden.service.ts': [] },
            },
          },
        },
      })
      .hasEncapsulationViolations({
        'feature/customers.component.ts': ['../data/open.service.ts'],
      });
  });

  it.skip('should support nested wildcards', () => {});

  it('should apply regex to path', () => {
    assertProject({ encapsulationPattern: /(^|\/)_/ })
      .withCustomerRoute({
        feature: {
          'customer.component.ts': [],
          'customers.component.ts': [
            '../data/_main.ts',
            '../data/sub/_file.ts',
            '../data/_sub/file.ts',
            '../data/main.ts',
            '../data/main_file.ts',
            '../data/internal/file.ts',
          ],
        },
        data: {
          '_main.ts': [],
          sub: { '_file.ts': [] },
          _sub: { 'file.ts': [] },
          'main.ts': [],
          'main_file.ts': [],
          'internal/file.ts': [],
        },
      })
      .hasEncapsulationViolations({
        'feature/customers.component.ts': [
          '../data/_main.ts',
          '../data/sub/_file.ts',
          '../data/_sub/file.ts',
        ],
      });
  });
});
