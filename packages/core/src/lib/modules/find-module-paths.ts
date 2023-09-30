import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';
import { logger } from '../log';

const log = logger('core.modules.find-path');

export const findModulePaths = (projectDirs: FsPath[]): Set<FsPath> => {
  const fs = getFs();
  let modules: FsPath[] = [];

  for (const projectDir of projectDirs) {
    modules = modules.concat(fs.findFiles(projectDir, 'index.ts'));
  }

  log.info(modules.join(', '));
  return new Set(modules);
};
