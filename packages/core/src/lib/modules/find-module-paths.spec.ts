import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { useVirtualFs } from '../fs/getFs';
import { ProjectCreator } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';

const angularStructure: FileTree = {
  'tsconfig.json': tsconfigMinimal,
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
  let creator: ProjectCreator;
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    creator = new ProjectCreator();
  });

  it('should find two submodules src', () => {
    creator.create(angularStructure, 'integration');
    const entryFile = toFsPath('/project/integration/src/app/app.component.ts');
    const { modulePaths } = init(entryFile, { traverse: true });

    expect(modulePaths).toEqual(
      new Set([
        '/project/integration/src/app/customers/index.ts',
        '/project/integration/src/app/holidays/index.ts',
      ])
    );
  });
});
