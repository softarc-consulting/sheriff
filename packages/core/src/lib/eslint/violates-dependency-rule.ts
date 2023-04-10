import { generateFileInfoAndGetRootDir } from '../2-file-info/generate-file-info-and-get-root-dir';
import { assertFsPath, FsPath } from '../1-fs/fs-path';
import { getProjectDirsFromFileInfo } from '../3-modules/get-project-dirs-from-file-info';
import { createModules } from '../3-modules/create-modules';
import { findModulePaths } from '../3-modules/find-module-paths';
import { getAssignedFileInfoMap } from '../3-modules/get-assigned-file-info-map';
import { findConfig } from '../4-config/find-config';
import { parseConfig } from '../4-config/parse-config';
import { log } from '../util/log';
import throwIfNull from '../util/throw-if-null';
import { calcTagsForModule } from '../5-tags/calc-tags-for-module';
import { isDependencyAllowed } from '../checks/is-dependency-allowed';

const cache = new Map<string, string>();

export const violatesDependencyRule = (
  filename: FsPath,
  importCommand: string,
  isFirstRun: boolean
): string => {
  if (isFirstRun) {
    cache.clear();
  }
  if (!cache.has(importCommand)) {
    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      assertFsPath(filename),
      true
    );
    const configFile = findConfig(rootDir);
    if (configFile === undefined) {
      log('Dependency Rules', 'no sheriff.config.ts present in ' + rootDir);
      return '';
    }

    const config = parseConfig(configFile);

    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);

    const modulePaths = findModulePaths(projectDirs);
    const modules = createModules(fileInfo, modulePaths, rootDir);
    const afiMap = getAssignedFileInfoMap(modules);

    const getAfi = (path: FsPath) =>
      throwIfNull(afiMap.get(path), `cannot find AssignedFileInfo for ${path}`);

    const assignedFileInfo = getAfi(fileInfo.path);
    const importedModulePathsWithRawImport = assignedFileInfo.imports
      .filter((importedFi) => modulePaths.has(importedFi.path))
      .map((importedFi) => getAfi(importedFi.path))
      .map((iafi) => [
        iafi.moduleInfo.directory,
        assignedFileInfo.getRawImportForImportedFileInfo(iafi.path),
      ]);
    const fromModule = assertFsPath(
      getAfi(assertFsPath(filename)).moduleInfo.directory
    );
    const fromTags = calcTagsForModule(fromModule, rootDir, config.tagging);

    for (const [
      importedModulePath,
      rawImport,
    ] of importedModulePathsWithRawImport) {
      const toTags: string[] = calcTagsForModule(
        assertFsPath(importedModulePath),
        rootDir,
        config.tagging
      );

      log(
        'Dependency Rules',
        `Checking for from tags of ${fromTags.join(',')} to ${toTags.join(',')}`
      );

      for (const toTag of toTags) {
        if (
          !isDependencyAllowed(fromTags, toTag, config.depRules, {
            fromModulePath: fromModule,
            toModulePath: assertFsPath(importedModulePath),
            fromFilePath: filename,
            toFilePath: assertFsPath(importedModulePath),
          })
        ) {
          cache.set(
            rawImport,
            `module ${fromModule.substring(
              rootDir.length
            )} cannot access ${importedModulePath.substring(
              rootDir.length
            )}. Tags [${fromTags.join(',')}] have no clearance for ${toTag}`
          );

          break;
        }
      }

      if (!cache.has(importCommand)) {
        cache.set(importCommand, '');
      }
    }
  }

  return cache.get(importCommand) || '';
};
