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
import { isDependencyAllowed } from '../checks/is-dependency-allowed';

const cache = new Map<string, string>();

export const violatesDependencyRule = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean
): string => {
  if (isFirstRun) {
    cache.clear();
  }
  if (cache.has(importCommand)) {
    return cache.get(importCommand) || '';
  }
  const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
    toFsPath(filename),
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
  const fromModulePath = toFsPath(
    getAfi(toFsPath(filename)).moduleInfo.directory
  );
  const fromTags = calcTagsForModule(fromModulePath, rootDir, config.tagging);
  const removeRoot = (module: string) => module.substring(rootDir.length);
  const fromTagString = fromTags.join(', ');
  for (const [
    importedModulePath,
    rawImport,
  ] of importedModulePathsWithRawImport) {
    const importedModuleFsPath = toFsPath(importedModulePath);
    const toTags: string[] = calcTagsForModule(
      importedModuleFsPath,
      rootDir,
      config.tagging
    );

    log(
      'Dependency Rules',
      `Checking for from tags of ${fromTagString} to ${toTags.join(',')}`
    );

    for (const toTag of toTags) {
      const { allowed, customMessage } = isDependencyAllowed(
        fromTags,
        toTag,
        config.depRules,
        {
          fromModulePath,
          toModulePath: importedModuleFsPath,
          fromFilePath: toFsPath(filename),
          toFilePath: importedModuleFsPath,
        }
      );
      if (!allowed) {
        cache.set(
          rawImport,
          `module ${removeRoot(fromModulePath)} cannot access ${removeRoot(
            importedModulePath
          )}. Tags [${fromTagString}] have no clearance for ${toTag}${customMessage}`
        );

        break;
      }
    }

    if (!cache.has(importCommand)) {
      cache.set(importCommand, '');
    }
  }

  return cache.get(importCommand) ?? '';
};
