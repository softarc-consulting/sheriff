import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';

export const findModules = (projectDirs: FsPath[]): FsPath[] => {
  const fs = getFs();
  let modules: FsPath[] = [];

  for (const projectDir of projectDirs) {
    modules = modules.concat(fs.findFiles(projectDir, 'index.ts'));
  }

  return modules;
};
