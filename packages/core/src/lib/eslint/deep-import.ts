import { generateFileInfoAndGetRootDir } from '../2-file-info/generate-file-info-and-get-root-dir';
import { assertFsPath, FsPath } from '../1-fs/fs-path';
import { getProjectDirsFromFileInfo } from '../3-modules/get-project-dirs-from-file-info';
import { createModules } from '../3-modules/create-modules';
import { findModulePaths } from '../3-modules/find-module-paths';
import { getAssignedFileInfoMap } from '../3-modules/get-assigned-file-info-map';
import throwIfNull from '../util/throw-if-null';

const deepImportCache = new Map<string, Set<string>>();

/* c8 ignore next */
export const hasDeepImport = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean
): boolean => {
  if (isFirstRun) {
    deepImportCache.clear();
  }
  if (!deepImportCache.has(filename)) {
    const { fileInfo, rootDir } = generateFileInfoAndGetRootDir(
      assertFsPath(filename),
      true
    );
    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);

    const modulePaths = findModulePaths(projectDirs);
    const modules = createModules(fileInfo, modulePaths, rootDir);

    const afiMap = getAssignedFileInfoMap(modules);

    const getAfi = (path: FsPath) =>
      throwIfNull(afiMap.get(path), `cannot find AssignedFileInfo for ${path}`);

    const isNotAModuleIndex = (fsPath: FsPath) => !modulePaths.has(fsPath);

    const assignedFileInfo = getAfi(fileInfo.path);
    const deepImports: Set<string> = new Set();
    for (const importedFileInfo of assignedFileInfo.imports) {
      const importedAfi = getAfi(importedFileInfo.path);
      if (
        isNotAModuleIndex(importedAfi.path) &&
        importedAfi.moduleInfo !== assignedFileInfo.moduleInfo
      ) {
        deepImports.add(
          assignedFileInfo.getRawImportForImportedFileInfo(importedAfi.path)
        );
      }
    }
    deepImportCache.set(filename, deepImports);
  }

  return throwIfNull(
    deepImportCache.get(filename),
    `${filename} does not exist in deepImportCache`
  ).has(importCommand);
};
