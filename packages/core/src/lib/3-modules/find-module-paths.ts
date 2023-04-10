import getFs from '../1-fs/getFs';
import { FsPath } from '../1-fs/fs-path';
import { log } from '../util/log';

export const findModulePaths = (projectDirs: FsPath[]): Set<FsPath> => {
  const fs = getFs();
  let modules: FsPath[] = [];

  for (const projectDir of projectDirs) {
    modules = modules.concat(fs.findFiles(projectDir, 'index.ts'));
  }

  log('Module Paths', modules.join(', '));
  return new Set(modules);
};
