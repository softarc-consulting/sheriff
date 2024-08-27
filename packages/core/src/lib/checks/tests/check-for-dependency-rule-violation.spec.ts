import { describe, expect, it } from 'vitest';
import { sheriffConfig } from '../../test/project-configurator';
import { sameTag } from '../same-tag';
import { noDependencies } from '../no-dependencies';
import { testInit } from '../../test/test-init';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from '../check-for-dependency-rule-violation';
import { FsPath, toFsPath } from '../../file-info/fs-path';
import { traverseProject } from '../../test/traverse-project';
import { tsConfig } from '../../test/fixtures/ts-config';
import { NoDependencyRuleForTagError } from '../../error/user-error';

describe('check for dependency rule violation', () => {
  describe('standard checks', () => {
    const projectStructure = () => ({
      'app.component.ts': ['./app.routes'],
      'app.routes.ts': [
        './customers/feature',
        './holidays/feat-admin',
        './holidays/feat-booking',
      ],
      customers: {
        feature: {
          'index.ts': ['../ui', '../data', '../model'],
        },
        ui: {
          'index.ts': ['../model'],
        },
        data: {
          'index.ts': ['../model'],
        },
        model: {
          'index.ts': [] as string[],
        },
      },
      holidays: {
        'feat-admin': {
          'index.ts': ['../ui', '../data', '../model'],
        },
        'feat-booking': {
          'index.ts': ['../ui', '../data', '../model'],
        },
        ui: {
          'index.ts': ['../model'],
        },
        data: {
          'index.ts': ['../model'],
        },
        model: {
          'index.ts': [] as string[],
        },
      },
    });

    const projectTemplate = () => ({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/<domain>/feat-<type>': ['domain:<domain>', 'type:feature'],
          'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        },
        depRules: {
          root: ['type:feature'],
          'domain:*': sameTag,
          'type:feature': ['type:ui', 'type:data', 'type:model'],
          'type:data': 'type:model',
          'type:ui': 'type:model',
          'type:model': noDependencies,
        },
      }),
      src: projectStructure(),
    });

    type Project = ReturnType<typeof projectTemplate>;

    type TestParam = [
      string, //name
      Record<string, { from: string; to: string[] }[]>, // expected violation
      (project: Project) => void, // changes to imports
    ];

    const params: TestParam[] = [
      ['no violations', {}, () => true],
      [
        'root -> ui',
        {
          'app.component.ts': [
            { from: 'root', to: ['domain:customers', 'type:ui'] },
          ],
        },
        (project) => project.src['app.component.ts'].push('./customers/ui'),
      ],
      [
        'root -> model',
        {
          'app.component.ts': [
            { from: 'root', to: ['domain:customers', 'type:model'] },
          ],
        },
        (project) => project.src['app.component.ts'].push('./customers/model'),
      ],
      [
        'root -> data',
        {
          'app.component.ts': [
            { from: 'root', to: ['domain:customers', 'type:data'] },
          ],
        },
        (project) => project.src['app.component.ts'].push('./customers/data'),
      ],
      [
        'feature -> feature',
        {
          'holidays/feat-admin/index.ts': [
            { from: 'type:feature', to: ['domain:holidays', 'type:feature'] },
          ],
        },
        (project) =>
          project.src.holidays['feat-admin']['index.ts'].push(
            '../feat-booking',
          ),
      ],
      [
        'feature -> ui (other domain)',
        {
          'customers/feature/index.ts': [
            {
              from: 'domain:customers',
              to: ['domain:holidays', 'type:ui'],
            },
          ],
        },
        (project) =>
          project.src.customers.feature['index.ts'].push('../../holidays/ui'),
      ],
      [
        'data -> ui',
        {
          'customers/data/index.ts': [
            { from: 'type:data', to: ['domain:customers', 'type:ui'] },
          ],
        },
        (project) =>
          project.src.customers.data['index.ts'].push('../../customers/ui'),
      ],
      [
        'ui -> data',
        {
          'customers/ui/index.ts': [
            { from: 'type:ui', to: ['domain:customers', 'type:data'] },
          ],
        },
        (project) =>
          project.src.customers.ui['index.ts'].push('../../customers/data'),
      ],
      [
        'model -> ui, data, feature',
        {
          'customers/model/index.ts': [
            {
              from: 'type:model',
              to: ['domain:customers', 'type:data'],
            },
            { from: 'type:model', to: ['domain:customers', 'type:ui'] },
            {
              from: 'type:model',
              to: ['domain:customers', 'type:feature'],
            },
          ],
        },
        (project) =>
          project.src.customers.model['index.ts'].push(
            '../../customers/data',
            '../../customers/ui',
            '../../customers/feature',
          ),
      ],
    ];

    function mapViolations(
      violations: Record<string, DependencyRuleViolation[]>,
    ): Record<
      string,
      {
        from: string;
        to: string[];
      }[]
    > {
      const result: Record<string, { from: string; to: string[] }[]> = {};

      for (const [path, violation] of Object.entries(violations)) {
        const shortenedPath = path.replace('/project/src/', '');
        result[shortenedPath] = violation.map((v) => ({
          from: v.fromTag,
          to: v.toTags,
        }));
      }

      return result;
    }

    for (const [name, expected, setup] of params) {
      it(`should handle ${name} `, () => {
        const project = projectTemplate();
        setup(project);
        const projectInfo = testInit('src/app.component.ts', project);
        const violationMap: Record<FsPath, DependencyRuleViolation[]> = {};

        for (const path of traverseProject(project.src, '/project/src')) {
          if (
            name.startsWith('model -> ui, data') &&
            path === '/project/src/customers/model/index.ts'
          ) {
            debugger;
          }

          const violations = checkForDependencyRuleViolation(path, projectInfo);

          if (violations.length) {
            violationMap[path] = violations;
          }
        }

        expect(mapViolations(violationMap)).toEqual(expected);
      });
    }
  });

  it('should return an empty array if no violations are found', () => {
    const projectInfo = testInit('src/main.ts', {
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    const violations = checkForDependencyRuleViolation(
      toFsPath('/project/src/main.ts'),
      projectInfo,
    );

    expect(violations).toEqual([]);
  });

  it('should require that each existing tag has clearance', () => {
    const project = {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/shared/<type>': ['shared'],
          'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        },
        depRules: {
          root: ['type:feature'],
          'domain:*': sameTag,
          'type:feature': ['type:ui', 'shared'],
          'type:ui': noDependencies,
        },
      }),
      src: {
        'app.component.ts': ['./customers/feature'],
        customers: {
          feature: {
            'index.ts': ['../../shared/ui'],
          },
        },
        shared: {
          ui: {
            'index.ts': [],
          },
        },
      },
    };

    const projectInfo = testInit('src/app.component.ts', project);
    const violations = checkForDependencyRuleViolation(
      toFsPath('/project/src/customers/feature/index.ts'),
      projectInfo,
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      fromTag: 'domain:customers',
      toTags: ['shared'],
    });
  });

  describe('noTag', () => {
    it('should allow full access with noTag', () => {
      const project = {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {
            root: 'noTag',
            noTag: 'noTag',
          },
        }),
        src: {
          'app.component.ts': [
            './customers/feature',
            './customers/data',
            './shared',
          ],
          customers: {
            feature: {
              'index.ts': ['../data'],
            },
            data: {
              'index.ts': ['../feature'],
            },
          },
          shared: {
            'index.ts': ['../customers/feature', '../customers/data'],
          },
        },
      };

      const projectInfo = testInit('src/app.component.ts', project);

      const violations = [
        'app.component.ts',
        'customers/feature/index.ts',
        'customers/data/index.ts',
        'shared/index.ts',
      ]
        .map((path) =>
          checkForDependencyRuleViolation(
            toFsPath(`/project/src/${path}`),
            projectInfo,
          ),
        )
        .flat();

      expect(violations).toEqual([]);
    });

    it('should allow no access, if noTag is set to `noDependencies`', () => {
      const project = {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {
            root: noDependencies,
            noTag: noDependencies,
          },
        }),
        src: {
          'app.component.ts': [
            './customers/feature',
            './customers/data',
            './shared',
          ],
          customers: {
            feature: {
              'index.ts': ['../data'],
            },
            data: {
              'index.ts': ['../feature'],
            },
          },
          shared: {
            'index.ts': ['../customers/feature', '../customers/data'],
          },
        },
      };

      const projectInfo = testInit('src/app.component.ts', project);

      const violationsMap: Record<string, number> = {};
      [
        'app.component.ts',
        'customers/feature/index.ts',
        'customers/data/index.ts',
        'shared/index.ts',
      ].forEach((path) => {
        violationsMap[path] = checkForDependencyRuleViolation(
          toFsPath(`/project/src/${path}`),
          projectInfo,
        ).length;
      });

      expect(violationsMap).toEqual({
        'app.component.ts': 3,
        'customers/feature/index.ts': 1,
        'customers/data/index.ts': 1,
        'shared/index.ts': 2,
      });
    });

    it('should throw if noTag is removed from deps', () => {
      const projectInfo = testInit('src/app.component.ts', {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {},
        }),
        src: {
          'app.component.ts': ['./shared'],

          shared: {
            'index.ts': [],
          },
        },
      });

      expect(() =>
        checkForDependencyRuleViolation(
          toFsPath('/project/src/app.component.ts'),
          projectInfo,
        ),
      ).toThrowUserError(new NoDependencyRuleForTagError('root'));
    });

    it('should allow a mix between auto and manual tags', () => {
      const projectInfo = testInit('src/app.component.ts', {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          tagging: {
            'src/customers/<type>': ['domain:customers', 'type:<type>'],
          },
          depRules: {
            'domain:customers': sameTag,
            'type:feature': ['type:ui', 'type:data', 'type:model'],
            'type:data': 'noTag',
            'type:ui': noDependencies,
            noTag: 'noTag',
          },
        }),
        src: {
          'app.component.ts': ['./app.routes'],
          'app.routes.ts': ['./customers/feature'],
          customers: {
            feature: {
              'index.ts': ['../ui', '../data'],
            },
            ui: {
              'index.ts': ['../feature'],
            },
            data: {
              'index.ts': ['../../holidays/feature'],
            },
          },
          holidays: {
            feature: {
              'index.ts': [''],
            },
          },
        },
      });

      checkForDependencyRuleViolation(
        toFsPath('/project/src/app.component.ts'),
        projectInfo,
      );

      const violationsMap: Record<string, number> = {};
      [
        'app.component.ts',
        'customers/feature/index.ts',
        'customers/ui/index.ts',
        'customers/data/index.ts',
        'holidays/feature/index.ts',
      ].forEach((path) => {
        violationsMap[path] = checkForDependencyRuleViolation(
          toFsPath(`/project/src/${path}`),
          projectInfo,
        ).length;
      });

      expect(violationsMap).toEqual({
        'app.component.ts': 0,
        'customers/feature/index.ts': 0,
        'customers/ui/index.ts': 1,
        'customers/data/index.ts': 1,
        'holidays/feature/index.ts': 0,
      });
    });
  });

  it('should not fail on imports from same module', () => {
    const projectInfo = testInit('src/customers/customer.component.spec.ts', {
      'tsconfig.json': tsConfig({
        paths: {
          '@app/src/customers': ['src/customers'],
        },
      }),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/customers': ['domain:customers', 'type:feature'],
        },
        depRules: {
          'domain:customers': sameTag,
          'type:feature': [],
        },
      }),
      src: {
        customers: {
          'index.ts': ['./customer.component'],
          'customer.component.ts': [],
          'customer.ts': [],
          'customer.component.spec.ts': ['@app/src/customers', '.index'],
        },
      },
    });

    const violations = checkForDependencyRuleViolation(
      toFsPath('/project/src/customers/customer.component.spec.ts'),
      projectInfo,
    );

    expect(violations).toEqual([]);
  });

  it('should check for nested modules that they are not wrongly assigned to the same', () => {
    const projectInfo = testInit('src/customers/index.ts', {
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/customers': ['domain:customers', 'type:domain'],
          'src/customers/feature': ['domain:customers', 'type:feature'],
        },
        depRules: {
          'domain:customers': sameTag,
          'type:domain': ['type:feature'],
          'type:feature': [],
        },
      }),
      src: {
        customers: {
          'index.ts': ['./feature', './customer.service.ts'],
          'customer.service.ts': [],
          feature: {
            'index.ts': ['./customer.component.ts'],
            'customer.component.ts': ['../customer.service.ts'],
          },
        },
      },
    });

    const violationsForSuperFolder = checkForDependencyRuleViolation(
      toFsPath('/project/src/customers/index.ts'),
      projectInfo,
    );
    expect(violationsForSuperFolder).toEqual([]);

    const violationsForSubFolder = checkForDependencyRuleViolation(
      toFsPath('/project/src/customers/feature/customer.component.ts'),
      projectInfo,
    );
    expect(violationsForSubFolder).toHaveLength(1)
  });
});
