import { FsPath } from '../file-info/fs-path';
import { findModulePathsWithoutBarrel } from "./internal/find-module-paths-without-barrel";
import { TagConfig } from "../config/tag-config";
import { findModulePathsWithBarrel } from "./internal/find-module-paths-with-barrel";

export type ModulePathMap = Record<FsPath, boolean>

/**
 * Find module paths which can be defined via having a barrel file or the
 * configuration's property `modules`.
 *
 * If a module has a barrel file and an internal, it is of type barrel file.
 */
export function findModulePaths(projectDirs: FsPath[], moduleConfig: TagConfig, barrelFileName: string): ModulePathMap {
  const modulesWithoutBarrel = findModulePathsWithoutBarrel(projectDirs, moduleConfig);
  const modulesWithBarrel = findModulePathsWithBarrel(projectDirs, barrelFileName);
  const modulePaths: ModulePathMap = {};

  for (const path of modulesWithoutBarrel) {
    modulePaths[path] = false;
  }

  for (const path of modulesWithBarrel) {
    modulePaths[path] = true;
  }

  return modulePaths;
}
