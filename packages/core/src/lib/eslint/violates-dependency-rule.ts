import { generateFileInfoAndGetRootDir } from '../file-info/generate-file-info-and-get-root-dir';
import { FsPath, toFsPath } from '../file-info/fs-path';
import { getProjectDirsFromFileInfo } from '../modules/get-project-dirs-from-file-info';
import { createModules } from '../modules/create-modules';
import { findModulePaths } from '../modules/find-module-paths';
import { getAssignedFileInfoMap } from '../modules/get-assigned-file-info-map';
import { findConfig } from '../config/find-config';
import { parseConfig } from '../config/parse-config';
import { log } from '../util/log';
import throwIfNull from '../util/throw-if-null';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import * as ts from 'typescript/lib/tsserverlibrary';
import maxProgramSizeForNonTsFiles = ts.server.maxProgramSizeForNonTsFiles;
import { isDependencyAllowed } from '../checks/is-dependency-allowed';

const cache = new Map<string, string>();

export const violatesDependencyRule = (
  filename: FsPath,
  importCommand: string,
  isFirstRun: boolean
): boolean => {
  if (isFirstRun) {
    cache.clear();
  }
  if (!cache.has(filename)) {
    const violations = [];
    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      toFsPath(filename),
      true
    );
    const configFile = findConfig(rootDir);
    if (configFile === undefined) {
      log('Dependency Rules', 'no sheriff.config.ts present in ' + rootDir);
      return false;
    }

    const config = parseConfig(configFile);

    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);

    const modulePaths = findModulePaths(projectDirs);
    const modules = createModules(fileInfo, modulePaths, rootDir);
    const afiMap = getAssignedFileInfoMap(modules);

    const getAfi = (path: FsPath) =>
      throwIfNull(afiMap.get(path), `cannot find AssignedFileInfo for ${path}`);

    const assignedFileInfo = getAfi(fileInfo.path);
    const importedModulePaths = assignedFileInfo.imports
      .filter((importedFi) => modulePaths.has(importedFi.path))
      .map((importedFi) => getAfi(importedFi.path))
      .map((iafi) => iafi.moduleInfo.directory);
    const fromModule = toFsPath(
      getAfi(toFsPath(filename)).moduleInfo.directory
    );
    const fromTags = calcTagsForModule(fromModule, rootDir, config.tagging);
    console.log(fromTags);

    for (const importedModulePath of importedModulePaths) {
      const toTags: string[] = calcTagsForModule(
        toFsPath(importedModulePath),
        rootDir,
        config.tagging
      );

      for (const fromModuleTag of fromTags) {
        let isAllowed = false;
        for (const toTag of toTags) {
          if (
            isDependencyAllowed(fromModuleTag, toTag, config.depRules, {
              fromModulePath: fromModule,
              toModulePath: toFsPath(importedModulePath),
              fromFilePath: filename,
              toFilePath: toFsPath(importedModulePath),
            })
          ) {
            isAllowed = true;
          }
        }

        if (!isAllowed) {
          cache.set(
            importCommand,
            `module ${fromModule} cannot access ${importedModulePath}. Tag ${fromModuleTag}  has no clearance to tag(s) ${toTags}`
          );
        }
        break;
      }
    }
  }

  return false;
};
