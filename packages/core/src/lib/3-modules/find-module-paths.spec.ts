import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { useVirtualFs } from '../1-fs/getFs';
import { generateFileInfoAndGetRootDir } from '../2-file-info/generate-file-info-and-get-root-dir';
import { ProjectCreator } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { getProjectDirsFromFileInfo } from './get-project-dirs-from-file-info';
import { findModulePaths } from './find-module-paths';
import { assertFsPath } from '../1-fs/fs-path';

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
      assertFsPath('/project/integration/src/app/app.component.ts')
    );
    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);
    const modules = findModulePaths(projectDirs);
    expect(modules).toEqual(
      new Set([
        '/project/integration/src/app/customers/index.ts',
        '/project/integration/src/app/holidays/index.ts',
      ])
    );
  });
});
