import { FsPath } from '../file-info/fs-path';
import { findModulePathsWithBarrel } from './internal/find-module-paths-with-barrel';
import { findModulePathsWithoutBarrel } from './internal/find-module-paths-without-barrel';
import { SheriffConfig } from '../config/sheriff-config';

export type ModulePathMap = Record<FsPath, boolean>;

/**
 * Find module paths which can be defined via having a barrel file or the
 * configuration's property `modules`.
 *
 * If a module has a barrel file and an internal, it is of type barrel file.
 */
export function findModulePaths(
  projectDirs: FsPath[],
  rootDir: FsPath,
  sheriffConfig: SheriffConfig,
): ModulePathMap {
  const {
    tagging,
    enableBarrelLess,
    barrelFileName
  } = sheriffConfig;
  const modulesWithoutBarrel = enableBarrelLess
    ? findModulePathsWithoutBarrel(tagging, rootDir, barrelFileName)
    : [];
  const modulesWithBarrel = findModulePathsWithBarrel(
    projectDirs,
    barrelFileName,
  );
  const modulePaths: ModulePathMap = {};

  for (const path of modulesWithoutBarrel) {
    modulePaths[path] = false;
  }

  for (const path of modulesWithBarrel) {
    modulePaths[path] = true;
  }

  return modulePaths;
}
