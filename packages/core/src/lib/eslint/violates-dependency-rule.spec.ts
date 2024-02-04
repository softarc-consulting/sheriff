import { describe, expect, it, vitest } from 'vitest';
import * as fileInfoGenerator from '../file-info/generate-file-info';
import { sheriffConfig } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { createProject } from '../test/project-creator';
import getFs from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';
import { violatesDependencyRule } from './violates-dependency-rule';

describe('violates dependency rules', () => {
  it('should not generate fileInfo when no config file available', () => {
    const spy = vitest.spyOn(fileInfoGenerator, 'generateFileInfo');

    createProject({
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': [''],
      },
    });

    expect(
      violatesDependencyRule(
        '/project/src/main.ts',
        './app/app.component',
        true,
        getFs().readFile(toFsPath('/project/src/main.ts'))
      )
    ).toBe('');
    expect(spy).not.toBeCalled();
  });

  it('should show a unresolvable import', () => {
    createProject({
      'tsconfig.json': tsconfigMinimal,
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
        getFs().readFile(toFsPath('/project/src/main.ts'))
      )
    ).toBe('import ./app.component cannot be resolved');
  });
});
