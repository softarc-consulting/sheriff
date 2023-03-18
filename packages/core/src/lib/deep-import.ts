import { generateFileInfoAndGetRootDir } from './file-info/generate-file-info-and-get-root-dir';
import { FsPath, toFsPath } from './file-info/fs-path';
import { getProjectDirsFromFileInfo } from './modules/get-project-dirs-from-file-info';
import { createModules } from './modules/create-modules';
import { findModules } from './modules/find-modules';
import { getAssignedFileInfoMap } from './modules/get-assigned-file-info-map';
import throwIfNull from './util/throw-if-null';

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
      toFsPath(filename),
      true
    );
    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);

    const modules = findModules(projectDirs);
    const moduleInfos = createModules(fileInfo, modules, rootDir);

    const afiMap = getAssignedFileInfoMap(moduleInfos);

    const getAfi = (path: FsPath) =>
      throwIfNull(
        afiMap.get(path),
        `cannot find AssignedFileInfo for ${fileInfo.path}`
      );

    const assignedFileInfo = getAfi(fileInfo.path);
    const deepImports: Set<string> = new Set();
    for (const importedFileInfo of assignedFileInfo.imports) {
      const importedAfi = getAfi(importedFileInfo.path);
      if (importedAfi.moduleInfo !== assignedFileInfo.moduleInfo) {
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
