import { describe, expect, it, vitest } from 'vitest';
import * as fileInfoGenerator from '../file-info/generate-unassigned-file-info';
import { sheriffConfig } from '../test/project-configurator';
import { createProject } from '../test/project-creator';
import getFs from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';
import { violatesDependencyRule } from './violates-dependency-rule';
import { tsConfig } from '../test/fixtures/ts-config';

describe('violates dependency rules', () => {
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
      'sheriff.config.ts': sheriffConfig({ tagging: {}, depRules: {} }),
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

  it('should ignore json imports  ', () => {
    const fs = createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({ tagging: {}, depRules: {} }),
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
