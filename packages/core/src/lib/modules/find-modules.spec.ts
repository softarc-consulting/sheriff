import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { useVirtualFs } from '../fs/getFs';
import { generateFileInfoAndGetRootDir } from '../file-info/generate-file-info-and-get-root-dir';
import { ProjectCreator } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { getProjectDirsFromFileInfo } from './get-project-dirs-from-file-info';
import { findModules } from './find-modules';
import { toFsPath } from '../file-info/fs-path';

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
    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      toFsPath('/project/integration/src/app/app.component.ts')
    );
    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);
    const modules = findModules(projectDirs);
    expect(modules).toEqual([
      '/project/integration/src/app/customers/index.ts',
      '/project/integration/src/app/holidays/index.ts',
    ]);
  });
});
