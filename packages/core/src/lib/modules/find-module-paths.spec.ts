import { describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { createProject } from '../test/project-creator';
import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import { tsConfig } from '../test/fixtures/ts-config';

const angularStructure: FileTree = {
  'tsconfig.json': tsConfig(),
  'sheriff.config.ts': '',
  'src/app': {
    'app.component.ts': '',
    customers: {
      'customer.component.ts': '',
      'index.ts': '',
    },
    holidays: {
      'holiday.component.ts': '',
      'index.ts': '',
    },
  },
};

describe('should find two modules', () => {
  it('should find two modules and root', () => {
    createProject(angularStructure, 'integration');
    const entryFile = toFsPath('/project/integration/src/app/app.component.ts');
    const { modules } = init(entryFile, { traverse: true });
    const modulePaths = modules.map((module) => module.path);

    expect(modulePaths).toEqual([
      '/project/integration/src/app/customers/index.ts',
      '/project/integration/src/app/holidays/index.ts',
      '/project/integration',
    ]);
  });
});
