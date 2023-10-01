import { generateFileInfo } from '../file-info/generate-file-info';
import { FsPath, toFsPath } from '../file-info/fs-path';
import { getProjectDirsFromFileInfo } from '../modules/get-project-dirs-from-file-info';
import { createModules } from '../modules/create-modules';
import { findModulePaths } from '../modules/find-module-paths';
import { getAssignedFileInfoMap } from '../modules/get-assigned-file-info-map';
import throwIfNull from '../util/throw-if-null';
import { findConfig } from '../config/find-config';
import { parseConfig } from '../config/parse-config';
import { init } from '../init/init';
import FileInfo from '../file-info/file-info';

let cache: string[] = [];
let fileInfo: FileInfo | undefined;

export const hasDeepImport = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string
): string => {
  if (isFirstRun) {
    cache = [];
    fileInfo = undefined;
  }

  if (!fileInfo) {
    const { tsData } = init(toFsPath(filename), false);
    const { rootDir } = tsData;
    fileInfo = generateFileInfo(toFsPath(filename), true, tsData, fileContent);

    const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);
    const isRootAndExcluded = createIsRootAndExcluded(rootDir);

    const modulePaths = findModulePaths(projectDirs);
    const modules = createModules(fileInfo, modulePaths, rootDir);

    const assignedFileInfoMap = getAssignedFileInfoMap(modules);

    const getAfi = (path: FsPath) =>
      throwIfNull(
        assignedFileInfoMap.get(path),
        `cannot find AssignedFileInfo for ${path}`
      );

    const isNotAModuleIndex = (fsPath: FsPath) => !modulePaths.has(fsPath);

    const assignedFileInfo = getAfi(fileInfo.path);
    for (const importedFileInfo of assignedFileInfo.imports) {
      const importedAfi = getAfi(importedFileInfo.path);
      if (
        isNotAModuleIndex(importedAfi.path) &&
        !isRootAndExcluded(importedAfi.moduleInfo.path) &&
        importedAfi.moduleInfo !== assignedFileInfo.moduleInfo
      ) {
        cache.push(
          assignedFileInfo.getRawImportForImportedFileInfo(importedAfi.path)
        );
      }
    }
  }

  if (fileInfo.isUnresolvableImport(importCommand)) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache.includes(importCommand)
    ? "Deep import is not allowed. Use the module's index.ts or path."
    : '';
};

/**
 * creates a function which returns allows a deep import, if
 * `excludeRoot` in the config is `true` and the
 * importedModulePath is the root module.
 */
const createIsRootAndExcluded = (rootDir: FsPath) => {
  let excludeRoot = false;
  const configFile = findConfig(rootDir);
  if (configFile === undefined) {
    excludeRoot = false;
  } else {
    const config = parseConfig(configFile);
    excludeRoot = Boolean(config.excludeRoot);
  }

  return (importedModulePath: string): boolean =>
    excludeRoot && importedModulePath === rootDir;
};
