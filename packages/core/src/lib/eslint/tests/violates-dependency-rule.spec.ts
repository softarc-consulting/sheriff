import { describe, expect, it, vitest } from 'vitest';
import * as fileInfoGenerator from '../../file-info/generate-unassigned-file-info';
import { sheriffConfig } from '../../test/project-configurator';
import { createProject } from '../../test/project-creator';
import getFs from '../../fs/getFs';
import { toFsPath } from '../../file-info/fs-path';
import { violatesDependencyRule } from '../violates-dependency-rule';
import { tsConfig } from '../../test/fixtures/ts-config';
import { noDependencies, sameTag } from '@softarc/sheriff-core';

describe('violates dependency rules', () => {
  it('should require that each existing tag has clearance', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {
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
            'index.ts': ['../ui', '../../shared/ui'],
          },
          ui: {
            'index.ts': ['../feature'],
          },
        },
        shared: {
          ui: {
            'index.ts': ['./ui.component.ts'],
            'ui.component.ts': [],
          },
        },
      },
    });

    const violations = violatesDependencyRule(
      '/project/src/customers/feature/index.ts',
      '../../shared/ui',
      true,
      getFs().readFile(toFsPath('/project/src/customers/feature/index.ts')),
    );
    expect(violations).toBe(
      'module /src/customers/feature cannot access /src/shared/ui. Tag domain:customers has no clearance for tags shared',
    );
  });

  it('should not generate fileInfo when no config file available', () => {
    const spy = vitest.spyOn(fileInfoGenerator, 'generateUnassignedFileInfo');

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    expect(
      violatesDependencyRule(
        '/project/src/main.ts',
        './app/app.component',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
      ),
    ).toBe('');
    expect(spy).not.toBeCalled();
  });

  it('should not throw without config and multiple imports', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./app.component.ts', '@angular/material/tooltip'],
        'app.component.ts': [],
      },
    });

    const mainTs = getFs().readFile(toFsPath('/project/src/main.ts'));

    violatesDependencyRule(
      '/project/src/main.ts',
      './app/app.component',
      true,
      mainTs,
    );
    violatesDependencyRule(
      '/project/src/main.ts',
      './app/app.component',
      false,
      mainTs,
    );
  });

  it('should show a unresolvable import', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({ modules: {}, depRules: {} }),
      src: {
        'main.ts': ['./app.component'],
      },
    });

    expect(
      violatesDependencyRule(
        '/project/src/main.ts',
        './app.component',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
      ),
    ).toBe('import ./app.component cannot be resolved');
  });

  it('should skip unresolvable imports for non-relative imports', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({ modules: {}, depRules: {} }),
      src: {
        'main.ts': ['node:fs'],
      },
    });

    expect(
      violatesDependencyRule(
        '/project/src/main.ts',
        'node:fs',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
      ),
    ).toBe('');
  });

  it('should ignore json imports  ', () => {
    const fs = createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({ modules: {}, depRules: {} }),
      src: {
        'main.ts': ['./data.json'],
        'data.json': [],
      },
    });

    fs.writeFile(
      '/project/src/data.json',
      JSON.stringify({ person: { id: 1, firstname: 'Ludwig' } }),
    );

    expect(
      violatesDependencyRule(
        '/project/src/main.ts',
        './data.json',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts')),
      ),
    ).toBe('');
  });
});
