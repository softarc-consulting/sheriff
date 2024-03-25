import { describe, expect, it } from 'vitest';
import { sheriffConfig } from '../test/project-configurator';
import { sameTag } from './same-tag';
import { noDependencies } from './no-dependencies';
import { testInit } from '../test/test-init';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from './check-for-dependency-rule-violation';
import { FsPath } from '../file-info/fs-path';
import { traverseProject } from '../test/traverse-project';
import { tsConfig } from '../test/fixtures/ts-config';

const projectTemplate = () => ({
  'tsconfig.json': tsConfig(),
  'sheriff.config.ts': sheriffConfig({
    tagging: {
      'src/<domain>/feat-<type>': ['domain:<domain>', 'type:feature'],
      'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
    },
    depRules: {
      root: ['type:feature', 'domain:*'],
      'domain:*': sameTag,
      'type:feature': ['type:ui', 'type:data', 'type:model'],
      'type:data': 'type:model',
      'type:ui': 'type:model',
      'type:model': noDependencies,
    },
  }),
  src: {
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
  },
});

export type Project = ReturnType<typeof projectTemplate>;

export type TestParam = [
  string,
  Record<string, { from: string[]; to: string }[]>,
  (project: Project) => void,
];

const params: TestParam[] = [
  ['no violations', {}, () => true],
  [
    'root -> ui',
    { 'app.component.ts': [{ from: ['root'], to: 'type:ui' }] },
    (project) => project.src['app.component.ts'].push('./customers/ui'),
  ],
  [
    'root -> model',
    { 'app.component.ts': [{ from: ['root'], to: 'type:model' }] },
    (project) => project.src['app.component.ts'].push('./customers/model'),
  ],
  [
    'root -> data',
    { 'app.component.ts': [{ from: ['root'], to: 'type:data' }] },
    (project) => project.src['app.component.ts'].push('./customers/data'),
  ],
  [
    'feature -> feature',
    {
      'holidays/feat-admin/index.ts': [
        { from: ['domain:holidays', 'type:feature'], to: 'type:feature' },
      ],
    },
    (project) =>
      project.src.holidays['feat-admin']['index.ts'].push('../feat-booking'),
  ],
  [
    'feature -> ui (other domain)',
    {
      'customers/feature/index.ts': [
        { from: ['domain:customers', 'type:feature'], to: 'domain:holidays' },
      ],
    },
    (project) =>
      project.src.customers.feature['index.ts'].push('../../holidays/ui'),
  ],
  [
    'data -> ui',
    {
      'customers/data/index.ts': [
        { from: ['domain:customers', 'type:data'], to: 'type:ui' },
      ],
    },
    (project) =>
      project.src.customers.data['index.ts'].push('../../customers/ui'),
  ],
  [
    'ui -> data',
    {
      'customers/ui/index.ts': [
        { from: ['domain:customers', 'type:ui'], to: 'type:data' },
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
          from: ['domain:customers', 'type:model'],
          to: 'type:data',
        },
        { from: ['domain:customers', 'type:model'], to: 'type:ui' },
        {
          from: ['domain:customers', 'type:model'],
          to: 'type:feature',
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

describe('check for dependency rule violation', () => {
  for (const [name, expected, setup] of params) {
    it(`should handle ${name} `, () => {
      const project = projectTemplate();
      setup(project);
      const projectInfo = testInit('src/app.component.ts', project);
      const violationMap: Record<FsPath, DependencyRuleViolation[]> = {};

      for (const path of traverseProject(project.src, '/project/src')) {
        const violations = checkForDependencyRuleViolation(path, projectInfo);

        if (violations.length) {
          violationMap[path] = violations;
        }
      }

      expect(mapViolations(violationMap)).toEqual(expected);
    });
  }
});

function mapViolations(
  violations: Record<string, DependencyRuleViolation[]>,
): Record<
  string,
  {
    from: string[];
    to: string;
  }[]
> {
  const result: Record<string, { from: string[]; to: string }[]> = {};

  for (const [path, violation] of Object.entries(violations)) {
    const shortenedPath = path.replace('/project/src/', '');
    result[shortenedPath] = violation.map((v) => ({
      from: v.fromTags,
      to: v.toTag,
    }));
  }

  return result;
}
