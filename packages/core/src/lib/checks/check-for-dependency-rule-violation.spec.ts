import { it, describe, expect } from 'vitest';
import { createProject } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { sheriffConfig } from '../test/project-configurator';
import { sameTag } from './same-tag';
import { noDependencies } from './no-dependencies';
import { testInit } from "../test/test-init";
import { checkForDependencyRuleViolation } from "./check-for-dependency-rule-violation";
import { toFsPath } from "../file-info/fs-path";

const projectTemplate = () => ({
  'tsconfig.json': tsconfigMinimal,
  'sheriff.config.ts': sheriffConfig({
    tagging: { 'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'] },
    depRules: {
      root: 'type:feature',
      'domain:*': sameTag,
      'type:feature': ['type:ui', 'type:data', 'type:model'],
      'type:data': 'type:model',
      'type:ui': 'type:model',
      'type:model': noDependencies,
    },
  }),
  src: {
    'app.component.ts': ['./app.routes'],
    'app.routes.ts': ['./customers/feature', './holidays/feature'],
    customers: {
      feature: {
        'index.ts': []
      },
      ui: {
        'index.ts': []
      },
      data: {
        'index.ts': []
      },
      model: {
        'index.ts': []
      },
    },
    holidays: {
      feature: {
        'index.ts': []
      },
      ui: {
        'index.ts': []
      },
      data: {
        'index.ts': []
      },
      model: {
        'index.ts': []
      },
    },
  },
});

describe('check for dependency rule violation', () => {
  it('should detect dependency violations', () => {
    const project = projectTemplate();
    const projectInfo = testInit('src/app.component.ts', project);
    const violations = checkForDependencyRuleViolation(
      toFsPath('/project/src/app.component.ts'),
      projectInfo
    );

    expect(violations).toEqual([]);
  });

  it('should not allow root to access a non-feature domain module', () => {
    const project = projectTemplate();
    project.src["app.component.ts"] = ["./customers/feature"];
    const projectInfo = testInit('src/app.component.ts', project);

    const violations = checkForDependencyRuleViolation(
      toFsPath('/project/src/app.component.ts'),
      projectInfo
    );

    expect(violations).toEqual([{'fromTags':['root'], 'toTag': 'type:ui'}]);
  });

  it.todo('all combis in terms of types');
  it.todo('shared to shared (2 shared)');
  it.todo('')
});
