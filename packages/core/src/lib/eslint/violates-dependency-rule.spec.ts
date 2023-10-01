import { beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest';
import * as generator from '../file-info/generate-file-info';
import { FileTree, sheriffConfig } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { ProjectCreator } from '../test/project-creator';
import getFs, { useVirtualFs } from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';
import { violatesDependencyRule } from './violates-dependency-rule';

describe('violates dependency rules', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should not generate fileInfo when no config file available', () => {
    const spy = vitest.spyOn(generator, 'generateFileInfo');

    const fileTree: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': [''],
      },
    };
    new ProjectCreator().create(fileTree, '/project');

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
    const fileTree: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      'sheriff.config.ts': sheriffConfig({ tagging: {}, depRules: {} }),
      src: {
        'main.ts': ['./app.component'],
      },
    };
    new ProjectCreator().create(fileTree, '/project');

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
