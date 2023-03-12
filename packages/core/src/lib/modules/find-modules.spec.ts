import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { useVirtualFs } from '../fs/getFs';
import generateFileInfo from '../file-info/generate-file-info';
import { ProjectCreator } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import getProjectDirsFromFileInfo from './get-project-dirs-from-file-info';
import findModules from './find-modules';

const angularStructure: FileTree = {
  'tsconfig.json': tsconfigMinimal,
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
    const fileInfo = generateFileInfo(
      'integration/src/app/app.component.ts',
      'integration/tsconfig.json'
    );
    const projectDirs = getProjectDirsFromFileInfo(fileInfo);
    const modules = findModules(projectDirs);
    expect(modules).toEqual([
      'src/app/customers/index.ts',
      'src/app/holidays/index.ts',
    ]);
  });
});
