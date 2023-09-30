import { beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest';
import getFs, { useVirtualFs } from '../fs/getFs';
import { sheriffConfig } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { anyTag } from '../checks/any-tag';
import { ProjectCreator } from '../test/project-creator';
import { hasDeepImport } from './deep-import';
import { toFsPath } from '../file-info/fs-path';
import { violatesDependencyRule } from './violates-dependency-rule';

describe('ESLint features', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should never read from linted file', () => {
    const fs = getFs();
    new ProjectCreator().create(
      {
        'tsconfig.json': tsconfigMinimal,
        'sheriff.config.ts': sheriffConfig({
          tagging: { 'src/shared': 'shared' },
          depRules: { '*': anyTag },
        }),
        src: {
          'main.ts': '',
          'router.ts': ['./shared/dialog'],
          'config.ts': ['./shared/index'],
          shared: {
            'get.ts': ['../config', '../holidays/holidays-component'],
            'dialog.ts': '',
            'index.ts': '',
          },
          holidays: {
            'holidays-component.ts': ['../config'],
          },
        },
      },
      '/project'
    );

    const fsPath = toFsPath('/project/src/shared/get.ts');
    const fileContent = fs.readFile(fsPath);
    const fileReadSpy = vitest.spyOn(fs, 'readFile');
    hasDeepImport(fsPath, '../config', true, fileContent);
    violatesDependencyRule(fsPath, '../config', true, fileContent);

    const readsOnLintedFile = fileReadSpy.mock.calls.filter((params) => {
      return params[0] === '/project/src/shared/get.ts';
    }).length;
    expect(readsOnLintedFile).toBe(0);
  });
});
